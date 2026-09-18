'use client';

import { useEffect, useRef } from 'react';
import { AnnotationOverlay } from '@/components/editor/AnnotationOverlay';
import { PdfPageCanvas } from '@/components/pdf/PdfPageCanvas';
import { Spinner } from '@/components/ui/Spinner';
import { CSS_PX_PER_PT } from '@/constants/editor';
import { ZOOM_LIMITS } from '@/constants/limits';
import { useElementWidth } from '@/hooks/useElementWidth';
import { usePageSize } from '@/hooks/usePageSize';
import { useEditorStore } from '@/store/editorStore';
import { clamp } from '@/utils/commonFunctions/clamp';
import { getRotatedSize } from '@/utils/pdfUtils/rotation';
import { useOpenPdfDocument } from './PdfDocumentContext';

/** Breathing room around the page, subtracted before fitting to width. */
const GUTTER_PX = 32;

export function EditorCanvas() {
  const pdf = useOpenPdfDocument();
  const pages = useEditorStore((state) => state.pages);
  const currentPageId = useEditorStore((state) => state.currentPageId);
  const zoom = useEditorStore((state) => state.zoom);
  const isFitWidth = useEditorStore((state) => state.isFitWidth);
  const syncFitWidthZoom = useEditorStore((state) => state.syncFitWidthZoom);

  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportWidth = useElementWidth(viewportRef);

  const index = pages.findIndex((page) => page.id === currentPageId);
  const page = index === -1 ? null : (pages[index] ?? null);

  const sourceSize = usePageSize(pdf, page?.sourcePageNumber ?? null);
  const rotatedSize =
    sourceSize === null || page === null ? null : getRotatedSize(sourceSize, page.rotation);

  /** Width in CSS pixels at 100% zoom, which is to say at actual size. */
  const actualSizeWidthPx = rotatedSize === null ? null : rotatedSize.widthPt * CSS_PX_PER_PT;

  useEffect(() => {
    if (!isFitWidth || viewportWidth === null || actualSizeWidthPx === null) return;

    const available = Math.max(viewportWidth - GUTTER_PX, 1);
    syncFitWidthZoom(clamp(available / actualSizeWidthPx, ZOOM_LIMITS.min, ZOOM_LIMITS.max));
  }, [isFitWidth, viewportWidth, actualSizeWidthPx, syncFitWidthZoom]);

  const targetWidthPx = actualSizeWidthPx === null ? null : Math.round(actualSizeWidthPx * zoom);
  const targetHeightPx =
    rotatedSize === null || targetWidthPx === null
      ? null
      : Math.round(targetWidthPx * (rotatedSize.heightPt / rotatedSize.widthPt));

  return (
    <div
      ref={viewportRef}
      className="bg-surface flex min-h-0 flex-1 justify-center overflow-auto p-4"
    >
      {page === null ||
      targetWidthPx === null ||
      targetHeightPx === null ||
      rotatedSize === null ? (
        <div className="self-center">
          <Spinner size="lg" />
        </div>
      ) : (
        // The page is a stacking context: PDF raster underneath, annotation
        // overlay on top. Both share the same CSS size so the overlay's
        // point-space viewBox maps 1:1 onto the painted page.
        <div className="relative shrink-0" style={{ width: targetWidthPx, height: targetHeightPx }}>
          <PdfPageCanvas
            // Keyed on the page identity so a delete or reorder swaps the
            // canvas rather than repainting the old one in place, which
            // would briefly show the wrong page.
            key={page.id}
            pdf={pdf}
            pageNumber={page.sourcePageNumber}
            targetWidthPx={targetWidthPx}
            rotationDegrees={page.rotation}
            label={`Page ${index + 1} of ${pages.length}`}
          />
          <AnnotationOverlay
            pageId={page.id}
            pageSize={rotatedSize}
            widthPx={targetWidthPx}
            heightPx={targetHeightPx}
          />
        </div>
      )}
    </div>
  );
}
