'use client';

import { useCallback, useState } from 'react';
import { DropZone } from '@/components/files/DropZone';
import { REJECTION_MESSAGES } from '@/components/files/rejectionMessages';
import { SelectedFileList } from '@/components/files/SelectedFileList';
import { PDF_ERROR_MESSAGES } from '@/components/pdf/pdfErrorMessages';
import { PdfPreview } from '@/components/pdf/PdfPreview';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FILE_LIMITS } from '@/constants/limits';
import type { ToolDefinition } from '@/constants/tools';
import { useFileSelection } from '@/hooks/useFileSelection';
import { useToolAction } from '@/hooks/useToolAction';
import type { RotationDegrees } from '@/types/document';
import type { SelectedFileId } from '@/types/file';
import { formatBytes } from '@/utils/fileUtils/formatBytes';
import { RotateAnglePicker } from './RotateAnglePicker';

/**
 * The interactive half of a tool page: choose files, review them, act on them.
 *
 * This is the client boundary. Everything above it in `ToolPageShell` stays a
 * server component and ships no JavaScript, so the marketing copy, breadcrumb
 * and notes cost nothing on the client.
 */
export function ToolWorkspace({ tool }: { tool: ToolDefinition }) {
  const { allowMultiple, minFiles, minFilesHint } = tool.fileSelection;
  const {
    files,
    rejections,
    totalBytes,
    hasLargeFile,
    addFiles,
    removeFile,
    moveFile,
    clearFiles,
    dismissRejections,
  } = useFileSelection({ allowMultiple });

  const handleFilesSelected = useCallback(
    (incoming: readonly File[]): void => {
      void addFiles(incoming);
    },
    [addFiles],
  );

  const [previewId, setPreviewId] = useState<SelectedFileId | null>(null);
  const [rotateDegrees, setRotateDegrees] = useState<Exclude<RotationDegrees, 0>>(90);
  const { status, error, successMessage, compressPreview, run, resetJob, downloadCompressResult } =
    useToolAction();

  const hasFiles = files.length > 0;
  const meetsMinimum = files.length >= minFiles;
  const isWorking = status === 'working';
  const canRun = meetsMinimum && !isWorking && tool.id !== 'editor';

  const previewEntry = files.find((entry) => entry.id === previewId) ?? files[0] ?? null;

  const handleRemoveAll = (): void => {
    resetJob();
    clearFiles();
  };

  const handleRemoveFile = (id: SelectedFileId): void => {
    resetJob();
    removeFile(id);
  };

  const handleAction = (): void => {
    if (tool.id === 'editor') return;
    void run({ toolId: tool.id, files, rotateDegrees });
  };

  return (
    <section aria-labelledby="workspace-heading" className="flex flex-col gap-4">
      <h2 id="workspace-heading" className="sr-only">
        Choose files
      </h2>

      {hasFiles ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <p role="status" className="text-muted text-sm">
              {files.length} file{files.length === 1 ? '' : 's'} selected, {formatBytes(totalBytes)}
            </p>
            <Button variant="ghost" size="sm" onClick={handleRemoveAll} disabled={isWorking}>
              Remove all
            </Button>
          </div>

          <SelectedFileList
            files={files}
            isReorderable={allowMultiple}
            selectedId={previewEntry?.id ?? null}
            {...(allowMultiple ? { onSelect: setPreviewId } : {})}
            onRemove={handleRemoveFile}
            onMove={moveFile}
          />
        </>
      ) : null}

      {previewEntry !== null ? (
        <PdfPreview key={previewEntry.id} file={previewEntry.file} fileName={previewEntry.name} />
      ) : null}

      <DropZone
        allowMultiple={allowMultiple}
        onFilesSelected={handleFilesSelected}
        isCompact={hasFiles}
      />

      {rejections.length > 0 ? (
        <Alert
          tone="warning"
          title={
            rejections.length === 1
              ? 'One file was not added'
              : `${rejections.length} files were not added`
          }
        >
          <ul className="flex flex-col gap-1">
            {rejections.map((rejection) => (
              <li key={rejection.id}>
                <span className="font-medium">{rejection.fileName}</span>
                {' — '}
                {REJECTION_MESSAGES[rejection.reason]}
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" className="mt-2" onClick={dismissRejections}>
            Dismiss
          </Button>
        </Alert>
      ) : null}

      {hasLargeFile ? (
        <Alert tone="info" title="Large file selected">
          Files over {formatBytes(FILE_LIMITS.warnBytes, 0)} can take a while to process and use a
          lot of memory in this tab. Close other tabs if things slow down.
        </Alert>
      ) : null}

      {tool.id === 'rotate' && hasFiles ? (
        <RotateAnglePicker value={rotateDegrees} onChange={setRotateDegrees} disabled={isWorking} />
      ) : null}

      {error !== null ? (
        <Alert tone="danger" title="Could not process this PDF">
          {PDF_ERROR_MESSAGES[error.code]}
        </Alert>
      ) : null}

      {successMessage !== null ? (
        <Alert tone="success" title="Ready on this device">
          {successMessage}
        </Alert>
      ) : null}

      {hasFiles ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            disabled={!canRun}
            isLoading={isWorking}
            aria-describedby="action-hint"
            onClick={handleAction}
          >
            {isWorking ? 'Working on this device' : tool.actionLabel}
          </Button>
          {compressPreview !== null ? (
            <Button size="lg" variant="secondary" onClick={downloadCompressResult}>
              Download {formatBytes(compressPreview.compressedByteLength)}
            </Button>
          ) : null}
          <span id="action-hint" className="text-muted text-sm">
            {meetsMinimum
              ? isWorking
                ? 'This stays in your browser. Large files can take a minute.'
                : 'Processing stays in this tab. Nothing is uploaded.'
              : minFilesHint}
          </span>
        </div>
      ) : null}
    </section>
  );
}
