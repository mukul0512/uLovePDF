'use client';

import { useCallback, useState } from 'react';
import { PdfError, compressPdf, mergePdfs, rotatePdfPages, splitPdfByPage } from '@/lib/pdf';
import type { ToolId } from '@/constants/tools';
import type { SelectedFile } from '@/types/file';
import type { RotationDegrees } from '@/types/document';
import { logger } from '@/utils/commonFunctions/logger';
import { createZipArchive } from '@/utils/fileUtils/createZipArchive';
import { downloadPdf, downloadZip } from '@/utils/fileUtils/downloadBlob';
import { formatBytes } from '@/utils/fileUtils/formatBytes';
import { stripPdfExtension, withPdfSuffix } from '@/utils/fileUtils/withFileSuffix';

export type ToolJobStatus = 'idle' | 'working' | 'success' | 'error';

export interface CompressPreview {
  readonly bytes: Uint8Array;
  readonly originalByteLength: number;
  readonly compressedByteLength: number;
  readonly fileName: string;
}

interface ToolActionInput {
  readonly toolId: Exclude<ToolId, 'editor'>;
  readonly files: readonly SelectedFile[];
  readonly rotateDegrees: Exclude<RotationDegrees, 0>;
}

function toExportError(error: unknown): PdfError {
  if (error instanceof PdfError) return error;
  return new PdfError('export-failed', 'The PDF could not be written', { cause: error });
}

async function readBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/**
 * Runs a tool-page action and triggers the download (except compress, which
 * waits for an explicit confirm so the user can see the resulting size).
 */
export function useToolAction() {
  const [status, setStatus] = useState<ToolJobStatus>('idle');
  const [error, setError] = useState<PdfError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [compressPreview, setCompressPreview] = useState<CompressPreview | null>(null);

  const resetJob = useCallback((): void => {
    setStatus('idle');
    setError(null);
    setSuccessMessage(null);
    setCompressPreview(null);
  }, []);

  const run = useCallback(async (input: ToolActionInput): Promise<void> => {
    setStatus('working');
    setError(null);
    setSuccessMessage(null);
    setCompressPreview(null);

    try {
      switch (input.toolId) {
        case 'merge': {
          const fileBytes = await Promise.all(input.files.map((entry) => readBytes(entry.file)));
          const { bytes } = await logger.time('export', 'merge', () => mergePdfs(fileBytes));
          const firstName = input.files[0]?.name ?? 'merged.pdf';
          const outputName = withPdfSuffix(firstName, '-merged');
          downloadPdf(bytes, outputName);
          setSuccessMessage(`Merged ${input.files.length} files into ${outputName}.`);
          break;
        }
        case 'split': {
          const source = input.files[0];
          if (source === undefined) {
            throw new PdfError('export-failed', 'Add a PDF to split');
          }
          const sourceBytes = await readBytes(source.file);
          const parts = await logger.time('export', 'split', () => splitPdfByPage(sourceBytes));
          const base = stripPdfExtension(source.name);
          if (parts.length === 1) {
            const only = parts[0];
            if (only !== undefined) {
              downloadPdf(only.bytes, withPdfSuffix(source.name, '-page-1'));
            }
          } else {
            const zip = createZipArchive(
              parts.map((part, index) => ({
                name: `${base}-page-${index + 1}.pdf`,
                bytes: part.bytes,
              })),
            );
            downloadZip(zip, `${base}-split.zip`);
          }
          setSuccessMessage(
            parts.length === 1
              ? 'Split into one file.'
              : `Split into ${parts.length} files and packed them into a ZIP.`,
          );
          break;
        }
        case 'rotate': {
          const source = input.files[0];
          if (source === undefined) {
            throw new PdfError('export-failed', 'Add a PDF to rotate');
          }
          const sourceBytes = await readBytes(source.file);
          const { bytes } = await logger.time('export', 'rotate', () =>
            rotatePdfPages(sourceBytes, input.rotateDegrees),
          );
          const outputName = withPdfSuffix(source.name, '-rotated');
          downloadPdf(bytes, outputName);
          setSuccessMessage(`Rotated every page ${input.rotateDegrees}° clockwise.`);
          break;
        }
        case 'compress': {
          const source = input.files[0];
          if (source === undefined) {
            throw new PdfError('export-failed', 'Add a PDF to compress');
          }
          const sourceBytes = await readBytes(source.file);
          const result = await logger.time('export', 'compress', () => compressPdf(sourceBytes));
          setCompressPreview({
            bytes: result.bytes,
            originalByteLength: result.originalByteLength,
            compressedByteLength: result.compressedByteLength,
            fileName: withPdfSuffix(source.name, '-compressed'),
          });
          const original = formatBytes(result.originalByteLength);
          const compressed = formatBytes(result.compressedByteLength);
          setSuccessMessage(
            result.compressedByteLength < result.originalByteLength
              ? `Compressed from ${original} to ${compressed}.`
              : `Re-saved at ${compressed} (was ${original}). This file did not shrink.`,
          );
          break;
        }
      }

      setStatus('success');
    } catch (caught) {
      const mapped = toExportError(caught);
      logger.error('export', `${input.toolId} failed`, mapped);
      setError(mapped);
      setStatus('error');
    }
  }, []);

  const downloadCompressResult = useCallback((): void => {
    if (compressPreview === null) return;
    downloadPdf(compressPreview.bytes, compressPreview.fileName);
  }, [compressPreview]);

  return {
    status,
    error,
    successMessage,
    compressPreview,
    run,
    resetJob,
    downloadCompressResult,
  };
}
