'use client';

import { useCallback, useMemo, useReducer } from 'react';
import { FILE_LIMITS } from '@/constants/limits';
import type { SelectedFile, SelectedFileId } from '@/types/file';
import { createId } from '@/utils/commonFunctions/createId';
import { logger } from '@/utils/commonFunctions/logger';
import {
  getFileFingerprint,
  validatePdfFile,
  type FileRejectionReason,
  type PdfFileValidation,
} from '@/utils/fileUtils/validatePdfFile';

export interface FileRejection {
  readonly id: string;
  readonly fileName: string;
  readonly reason: FileRejectionReason;
}

/**
 * A file that has passed content validation and is awaiting a decision that
 * depends on the rest of the list (duplicate? over the count limit?).
 *
 * The id is minted here rather than in the reducer on purpose. React
 * re-invokes reducers in development to surface impure logic, so calling
 * `createId()` inside one would be exactly the kind of side effect that check
 * exists to catch.
 */
interface FileCandidate {
  readonly id: SelectedFileId;
  readonly file: File;
  readonly validation: PdfFileValidation;
}

interface FileSelectionState {
  readonly allowMultiple: boolean;
  readonly files: readonly SelectedFile[];
  readonly rejections: readonly FileRejection[];
}

type FileSelectionAction =
  | { readonly type: 'add'; readonly candidates: readonly FileCandidate[] }
  | { readonly type: 'remove'; readonly id: SelectedFileId }
  | { readonly type: 'move'; readonly id: SelectedFileId; readonly offset: -1 | 1 }
  | { readonly type: 'clear' }
  | { readonly type: 'dismiss-rejections' };

const toSelectedFile = (candidate: FileCandidate): SelectedFile => ({
  id: candidate.id,
  file: candidate.file,
  name: candidate.file.name,
  sizeBytes: candidate.file.size,
  isLarge: candidate.file.size > FILE_LIMITS.warnBytes,
});

/**
 * All accept/reject decisions that depend on existing state live here.
 *
 * Deciding duplicates inside the reducer rather than in the async callback
 * matters: validation is asynchronous, so two fast drops can overlap. A
 * closure would compare against a stale list and let a duplicate through,
 * whereas a reducer always sees the current state.
 */
function fileSelectionReducer(
  state: FileSelectionState,
  action: FileSelectionAction,
): FileSelectionState {
  switch (action.type) {
    case 'add': {
      const maxFiles = state.allowMultiple ? FILE_LIMITS.maxFileCount : 1;
      // Single-file tools replace their selection instead of accumulating,
      // which is what "choose a different file" should mean.
      const accepted: SelectedFile[] = state.allowMultiple ? [...state.files] : [];
      const fingerprints = new Set(accepted.map((entry) => getFileFingerprint(entry.file)));
      const rejections: FileRejection[] = [];

      const rejectCandidate = (candidate: FileCandidate, reason: FileRejectionReason): void => {
        rejections.push({ id: candidate.id, fileName: candidate.file.name, reason });
      };

      for (const candidate of action.candidates) {
        if (!candidate.validation.ok) {
          rejectCandidate(candidate, candidate.validation.reason);
          continue;
        }

        if (accepted.length >= maxFiles) {
          rejectCandidate(candidate, state.allowMultiple ? 'limit-reached' : 'single-file-only');
          continue;
        }

        const fingerprint = getFileFingerprint(candidate.file);
        if (fingerprints.has(fingerprint)) {
          rejectCandidate(candidate, 'duplicate');
          continue;
        }

        fingerprints.add(fingerprint);
        accepted.push(toSelectedFile(candidate));
      }

      return { ...state, files: accepted, rejections };
    }

    case 'remove':
      return {
        ...state,
        files: state.files.filter((entry) => entry.id !== action.id),
      };

    case 'move': {
      const index = state.files.findIndex((entry) => entry.id === action.id);
      const target = index + action.offset;
      if (index === -1 || target < 0 || target >= state.files.length) return state;

      const next = [...state.files];
      const from = next[index];
      const to = next[target];
      if (from === undefined || to === undefined) return state;

      next[index] = to;
      next[target] = from;
      return { ...state, files: next };
    }

    case 'clear':
      return { ...state, files: [], rejections: [] };

    case 'dismiss-rejections':
      return { ...state, rejections: [] };
  }
}

export interface UseFileSelectionOptions {
  readonly allowMultiple: boolean;
}

/**
 * Owns the list of files the user has chosen for one tool.
 *
 * This is a `useReducer` rather than a global store because the state is
 * scoped to a single page and should die with it. The editor store is for
 * distant components sharing document state; using it here would be cost
 * without benefit.
 */
export function useFileSelection({ allowMultiple }: UseFileSelectionOptions) {
  const [state, dispatch] = useReducer(fileSelectionReducer, {
    allowMultiple,
    files: [],
    rejections: [],
  });

  const addFiles = useCallback(async (incoming: readonly File[]): Promise<void> => {
    if (incoming.length === 0) return;

    logger.debug('upload', `validating ${incoming.length} incoming file(s)`);

    // Concurrent because each validation reads four bytes; there is nothing
    // to be gained by serialising them.
    const candidates = await Promise.all(
      incoming.map(async (file): Promise<FileCandidate> => ({
        id: createId() as SelectedFileId,
        file,
        validation: await validatePdfFile(file),
      })),
    );

    dispatch({ type: 'add', candidates });
  }, []);

  const removeFile = useCallback((id: SelectedFileId): void => {
    logger.debug('upload', 'removing file', { id });
    dispatch({ type: 'remove', id });
  }, []);

  const moveFile = useCallback((id: SelectedFileId, offset: -1 | 1): void => {
    dispatch({ type: 'move', id, offset });
  }, []);

  const clearFiles = useCallback((): void => {
    logger.debug('upload', 'clearing selection');
    dispatch({ type: 'clear' });
  }, []);

  const dismissRejections = useCallback((): void => {
    dispatch({ type: 'dismiss-rejections' });
  }, []);

  const totalBytes = useMemo(
    () => state.files.reduce((sum, entry) => sum + entry.sizeBytes, 0),
    [state.files],
  );

  return {
    files: state.files,
    rejections: state.rejections,
    totalBytes,
    hasLargeFile: state.files.some((entry) => entry.isLarge),
    addFiles,
    removeFile,
    moveFile,
    clearFiles,
    dismissRejections,
  };
}
