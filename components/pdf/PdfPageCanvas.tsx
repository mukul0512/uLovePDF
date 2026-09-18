'use client';

import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import type { LoadedPdfDocument } from '@/lib/pdf';
import type { RotationDegrees } from '@/types/document';
import { logger } from '@/utils/commonFunctions/logger';

interface PdfPageCanvasProps {
  pdf: LoadedPdfDocument;
  pageNumber: number;
  targetWidthPx: number;
  rotationDegrees?: RotationDegrees | undefined;
  /** Accessible name for the canvas, which is otherwise opaque. */
  label: string;
}

/**
 * Draws one page onto a canvas.
 *
 * The effect cancels its render on cleanup, which is what makes fast paging
 * safe. pdf.js throws if two renders touch the same canvas at once, and
 * without cancellation a user clicking "next" three times quickly would
 * produce exactly that.
 */
export function PdfPageCanvas({
  pdf,
  pageNumber,
  targetWidthPx,
  rotationDegrees = 0,
  label,
}: PdfPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    let isCurrent = true;
    setIsRendering(true);
    setHasFailed(false);

    const handle = pdf.renderPage({ pageNumber, canvas, targetWidthPx, rotationDegrees });

    void handle.completed
      .then(() => {
        if (isCurrent) setIsRendering(false);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        logger.warn('render', `page ${pageNumber} failed to render`, error);
        setHasFailed(true);
        setIsRendering(false);
      });

    return () => {
      isCurrent = false;
      handle.cancel();
    };
  }, [pdf, pageNumber, targetWidthPx, rotationDegrees]);

  return (
    <div className="relative inline-block">
      {/* A canvas is opaque to assistive technology, so it needs a label.
          Real text extraction would need pdf.js's text layer, which is a
          separate feature rather than something this element can imply. */}
      <canvas ref={canvasRef} role="img" aria-label={label} className="block bg-white shadow-sm" />

      {isRendering ? (
        <div className="bg-surface/70 absolute inset-0 flex items-center justify-center">
          <Spinner size="md" />
        </div>
      ) : null}

      {hasFailed ? (
        <div className="bg-surface absolute inset-0 flex items-center justify-center p-4">
          <p className="text-danger text-sm">This page could not be drawn.</p>
        </div>
      ) : null}
    </div>
  );
}
