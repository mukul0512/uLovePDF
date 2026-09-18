'use client';

import { useState } from 'react';
import { PDF_ERROR_MESSAGES } from '@/components/pdf/pdfErrorMessages';
import { Button } from '@/components/ui/Button';
import { DownloadIcon } from '@/components/ui/icon/icons';
import { PdfError, writeEditedPdf } from '@/lib/pdf';
import { useEditorStore } from '@/store/editorStore';
import { logger } from '@/utils/commonFunctions/logger';
import { downloadPdf } from '@/utils/fileUtils/downloadBlob';
import { withPdfSuffix } from '@/utils/fileUtils/withFileSuffix';

function toExportError(error: unknown): PdfError {
  if (error instanceof PdfError) return error;
  return new PdfError('export-failed', 'The PDF could not be written', { cause: error });
}

/**
 * Writes the current edit model into a new PDF and downloads it.
 *
 * The source File is re-read here rather than cached as bytes: pdf.js
 * transfers its copy to the worker, and holding a second copy for the whole
 * session would double the memory cost of every open document.
 */
export function EditorExportButton({ sourceFile }: { sourceFile: File }) {
  const fileName = useEditorStore((state) => state.fileName);
  const pages = useEditorStore((state) => state.pages);
  const annotations = useEditorStore((state) => state.annotations);

  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<PdfError | null>(null);

  const handleExport = async (): Promise<void> => {
    setIsWorking(true);
    setError(null);

    try {
      const sourceBytes = new Uint8Array(await sourceFile.arrayBuffer());
      const { bytes } = await logger.time('export', `edit ${sourceFile.name}`, () =>
        writeEditedPdf({ sourceBytes, pages, annotations }),
      );
      const outputName = withPdfSuffix(fileName ?? sourceFile.name, '-edited');
      downloadPdf(bytes, outputName);
    } catch (caught) {
      const mapped = toExportError(caught);
      logger.error('export', 'editor export failed', mapped);
      setError(mapped);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="primary"
        size="sm"
        isLoading={isWorking}
        disabled={pages.length === 0}
        onClick={() => {
          void handleExport();
        }}
      >
        <DownloadIcon size="sm" />
        {isWorking ? 'Saving PDF' : 'Download PDF'}
      </Button>
      {error !== null ? (
        <p role="alert" className="text-danger max-w-xs text-right text-xs">
          {PDF_ERROR_MESSAGES[error.code]}
        </p>
      ) : null}
    </div>
  );
}
