'use client';

import { useCallback, useId, type ChangeEvent } from 'react';
import { buttonStyles } from '@/components/ui/buttonStyles';
import { PlusIcon, UploadIcon } from '@/components/ui/icon/icons';
import { FILE_LIMITS } from '@/constants/limits';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { cn } from '@/utils/commonFunctions/cn';
import { formatBytes } from '@/utils/fileUtils/formatBytes';

/**
 * Both are offered because they are matched differently: some platforms and
 * browsers filter the picker on MIME type, others on extension.
 */
const ACCEPT = `${FILE_LIMITS.acceptedMimeType},${FILE_LIMITS.acceptedExtension}`;

interface DropZoneProps {
  allowMultiple: boolean;
  onFilesSelected: (files: readonly File[]) => void;
  /** Shrinks to a single row, for when a file list already sits above it. */
  isCompact?: boolean;
}

/**
 * The file input, styled as a drop target.
 *
 * The markup is a real `<input type="file">` paired with a `<label>`, rather
 * than a `<div>` with a click handler calling `input.click()`. The native
 * pairing gives us the whole accessibility contract for free: the input is
 * focusable and announced as a file input, Enter and Space open the picker,
 * and clicking anywhere in the label works because that is what labels do.
 *
 * The input is a preceding sibling rather than a child of the label, because
 * Tailwind's `peer-*` variants only reach later siblings. That is what lets
 * the dashed box show a focus ring when the visually hidden input is focused.
 */
export function DropZone({ allowMultiple, onFilesSelected, isCompact = false }: DropZoneProps) {
  const inputId = useId();
  const hintId = useId();

  const handleFiles = useCallback(
    (files: readonly File[]) => {
      onFilesSelected(files);
    },
    [onFilesSelected],
  );

  const { isDraggingOver, dragHandlers } = useDragAndDrop(handleFiles);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const { files } = event.target;
      if (files !== null && files.length > 0) onFilesSelected(Array.from(files));

      // Clearing the value matters more than it looks: the input only fires
      // `change` when the value differs. Pick a file, remove it, pick the
      // same file again and without this reset nothing happens at all.
      event.target.value = '';
    },
    [onFilesSelected],
  );

  const noun = allowMultiple ? 'PDFs' : 'a PDF';
  const actionLabel = isCompact
    ? allowMultiple
      ? 'Add more files'
      : 'Choose a different file'
    : `Select ${allowMultiple ? 'files' : 'file'}`;

  return (
    <div className="relative">
      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple={allowMultiple}
        className="peer sr-only"
        aria-label={actionLabel}
        aria-describedby={hintId}
        onChange={handleChange}
      />

      <label
        htmlFor={inputId}
        {...dragHandlers}
        className={cn(
          'rounded-card border-line flex cursor-pointer flex-col items-center gap-3 border border-dashed text-center transition-colors',
          'hover:border-line-strong hover:bg-surface',
          'peer-focus-visible:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
          isDraggingOver && 'border-primary bg-info-surface',
          isCompact ? 'flex-row justify-center px-6 py-4' : 'px-6 py-12',
        )}
      >
        {isCompact ? (
          <span className={buttonStyles({ variant: 'secondary', size: 'md' })}>
            <PlusIcon size="sm" />
            {actionLabel}
          </span>
        ) : (
          <>
            <UploadIcon size="lg" className="text-muted" />
            <span className="text-base font-semibold">
              {isDraggingOver ? `Release to add ${noun}` : `Drop ${noun} here`}
            </span>
            <span className={cn(buttonStyles({ size: 'lg' }), 'mt-2')}>{actionLabel}</span>
          </>
        )}

        <span id={hintId} className="text-muted text-xs">
          PDF only, up to {formatBytes(FILE_LIMITS.maxBytes, 0)}. Files stay on your device.
        </span>
      </label>
    </div>
  );
}
