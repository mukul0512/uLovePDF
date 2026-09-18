'use client';

import { useCallback, useRef, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icon/icons';
import { Spinner } from '@/components/ui/Spinner';
import { useElementWidth } from '@/hooks/useElementWidth';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { clamp } from '@/utils/commonFunctions/clamp';
import { PdfPageCanvas } from './PdfPageCanvas';
import { PDF_ERROR_MESSAGES } from './pdfErrorMessages';

/** Horizontal padding of the scroll area, subtracted from the measured width. */
const VIEWPORT_PADDING_PX = 32;
const MIN_PAGE_WIDTH_PX = 160;

interface PdfPreviewProps {
  file: File | null;
  fileName: string;
}

export function PdfPreview({ file, fileName }: PdfPreviewProps) {
  const { status, document: pdf, error } = usePdfDocument(file);
  const [pageNumber, setPageNumber] = useState(1);
  const [trackedPdf, setTrackedPdf] = useState(pdf);
  const viewportRef = useRef<HTMLDivElement>(null);
  const measuredWidth = useElementWidth(viewportRef);

  // A newly opened document starts at page one; the previous page number is
  // meaningless against a different file and may be out of range.
  if (pdf !== trackedPdf) {
    setTrackedPdf(pdf);
    setPageNumber(1);
  }
  /**
   * Moves by an offset using the functional form of `setState`.
   *
   * Computing `pageNumber + 1` from the render closure looks equivalent but
   * is not: clicks arriving in the same tick all read the same stale value,
   * so three rapid presses of Next advance a single page. Deriving from
   * `current` makes each update see the result of the one before it.
   */
  const changePage = useCallback(
    (offset: number) => {
      if (pdf === null) return;
      setPageNumber((current) => clamp(current + offset, 1, pdf.pageCount));
    },
    [pdf],
  );

  const targetWidthPx =
    measuredWidth === null
      ? null
      : Math.max(measuredWidth - VIEWPORT_PADDING_PX, MIN_PAGE_WIDTH_PX);

  return (
    <section aria-label={`Preview of ${fileName}`} className="border-line rounded-card border">
      {status === 'ready' ? (
        <div className="border-line flex items-center justify-between gap-3 border-b px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Previous page"
            disabled={pageNumber <= 1}
            onClick={() => changePage(-1)}
          >
            <ChevronLeftIcon size="sm" />
            Previous
          </Button>

          {/* Announced on change, so paging is perceivable without sight of
              the canvas. */}
          <p role="status" className="text-muted text-sm tabular-nums">
            Page {pageNumber} of {pdf.pageCount}
          </p>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Next page"
            disabled={pageNumber >= pdf.pageCount}
            onClick={() => changePage(1)}
          >
            Next
            <ChevronRightIcon size="sm" />
          </Button>
        </div>
      ) : null}

      <div ref={viewportRef} className="bg-surface flex min-h-64 justify-center overflow-auto p-4">
        {status === 'loading' || status === 'idle' ? (
          <div className="text-muted flex items-center gap-3 self-center text-sm">
            <Spinner size="md" />
            Opening document
          </div>
        ) : null}

        {status === 'error' ? (
          <Alert tone="danger" title="Could not open this PDF" className="self-center">
            {PDF_ERROR_MESSAGES[error.code]}
          </Alert>
        ) : null}

        {status === 'ready' && targetWidthPx !== null ? (
          <PdfPageCanvas
            pdf={pdf}
            pageNumber={pageNumber}
            targetWidthPx={targetWidthPx}
            label={`Page ${pageNumber} of ${pdf.pageCount}`}
          />
        ) : null}
      </div>
    </section>
  );
}
