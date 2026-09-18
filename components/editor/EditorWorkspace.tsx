'use client';

import { useEffect, useState } from 'react';
import { DropZone } from '@/components/files/DropZone';
import { REJECTION_MESSAGES } from '@/components/files/rejectionMessages';
import { PDF_ERROR_MESSAGES } from '@/components/pdf/pdfErrorMessages';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useFileSelection } from '@/hooks/useFileSelection';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { useEditorStore } from '@/store/editorStore';
import { formatBytes } from '@/utils/fileUtils/formatBytes';
import { EditorExportButton } from './EditorExportButton';
import { EditorShell } from './EditorShell';
import { PdfDocumentProvider } from './PdfDocumentContext';

export function EditorWorkspace() {
  // Reusing the tool-page selection hook keeps validation identical here:
  // the same magic-byte check, the same size limits, the same wording.
  const { files, rejections, addFiles, removeFile, dismissRejections } = useFileSelection({
    allowMultiple: false,
  });

  const entry = files[0] ?? null;
  const { status, document: pdf, error } = usePdfDocument(entry?.file ?? null);

  const openDocument = useEditorStore((state) => state.openDocument);
  const closeDocument = useEditorStore((state) => state.closeDocument);
  const [isModelReady, setIsModelReady] = useState(false);
  const [trackedPdf, setTrackedPdf] = useState(pdf);

  if (pdf !== trackedPdf) {
    setTrackedPdf(pdf);
    setIsModelReady(false);
  }

  useEffect(() => {
    if (pdf === null || entry === null) return;

    let isCurrent = true;

    void pdf
      .getPageSize(1)
      .then((firstPageSize) => {
        if (!isCurrent) return;
        openDocument({ fileName: entry.name, pageCount: pdf.pageCount, firstPageSize });
        setIsModelReady(true);
      })
      .catch(() => {
        // Nothing to add: an unreadable first page means the document
        // failed to open, which `usePdfDocument` already reports.
      });

    return () => {
      isCurrent = false;
      setIsModelReady(false);
      closeDocument();
    };
  }, [pdf, entry, openDocument, closeDocument]);

  if (entry === null) {
    return (
      <div className="flex flex-col gap-4">
        {rejections.length > 0 ? (
          <Alert tone="warning" title="That file was not added">
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

        <DropZone allowMultiple={false} onFilesSelected={addFiles} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 text-sm">
          <span className="font-medium">{entry.name}</span>{' '}
          <span className="text-muted">{formatBytes(entry.sizeBytes)}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {status === 'ready' && isModelReady ? (
            <EditorExportButton sourceFile={entry.file} />
          ) : null}
          <Button variant="secondary" size="sm" onClick={() => removeFile(entry.id)}>
            Close document
          </Button>
        </div>
      </div>

      {status === 'error' ? (
        <Alert tone="danger" title="Could not open this PDF">
          {PDF_ERROR_MESSAGES[error.code]}
        </Alert>
      ) : null}

      {status === 'loading' || (status === 'ready' && !isModelReady) ? (
        <div className="text-muted flex items-center gap-3 py-12">
          <Spinner size="md" />
          Opening document
        </div>
      ) : null}

      {status === 'ready' && isModelReady ? (
        <PdfDocumentProvider document={pdf}>
          <EditorShell />
        </PdfDocumentProvider>
      ) : null}
    </div>
  );
}
