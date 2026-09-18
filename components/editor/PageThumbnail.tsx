'use client';

import { memo, useEffect, useRef, useState, type RefObject } from 'react';
import { THUMBNAIL } from '@/constants/editor';
import type { PageId } from '@/types/document';
import type { EditorPage } from '@/types/editor';
import { cn } from '@/utils/commonFunctions/cn';
import { useOpenPdfDocument } from './PdfDocumentContext';

interface PageThumbnailProps {
  page: EditorPage;
  /** Position in the edited document, which is not the source page number. */
  index: number;
  isActive: boolean;
  /** Width over height, already accounting for rotation. */
  aspectRatio: number;
  /** The rail's scroll container, used as the intersection root. */
  scrollRootRef: RefObject<HTMLDivElement | null>;
  onSelect: (id: PageId) => void;
}

/**
 * One page in the rail, rendered only while it is near the viewport.
 *
 * Memoised, and this is not a micro-optimisation. Any page operation
 * replaces the `pages` array, so the rail re-renders on every rotate,
 * delete and move. Without `memo` a 500-page document would re-run every
 * thumbnail's effects on each keystroke-speed action. Because the store
 * only ever replaces the page objects it actually changed, memo means one
 * thumbnail re-renders instead of all of them.
 */
export const PageThumbnail = memo(function PageThumbnail({
  page,
  index,
  isActive,
  aspectRatio,
  scrollRootRef,
  onSelect,
}: PageThumbnailProps) {
  const pdf = useOpenPdfDocument();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const element = buttonRef.current;
    if (element === null) return;

    // Observing against the rail rather than the viewport is what makes
    // the overscan real: the margin is measured from the edge of the
    // scroll container, so pages render before they are scrolled to.
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry !== undefined) setIsNearViewport(entry.isIntersecting);
      },
      { root: scrollRootRef.current, rootMargin: `${THUMBNAIL.overscanPx}px` },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [scrollRootRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    if (!isNearViewport) {
      // Releasing the backing store is the point of the whole exercise.
      // Left alone, a 500-page rail would hold roughly 45 MB of bitmaps
      // that nobody is looking at.
      canvas.width = 0;
      canvas.height = 0;
      return;
    }

    const handle = pdf.renderPage({
      pageNumber: page.sourcePageNumber,
      canvas,
      targetWidthPx: THUMBNAIL.widthPx,
      rotationDegrees: page.rotation,
    });

    void handle.completed.catch(() => {
      // The main canvas surfaces render failures; a blank thumbnail next
      // to a visible error message is enough signal here.
    });

    return () => handle.cancel();
  }, [isNearViewport, pdf, page.sourcePageNumber, page.rotation]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => onSelect(page.id)}
      aria-current={isActive ? 'page' : undefined}
      aria-label={`Page ${index + 1}`}
      className={cn(
        'rounded-control block shrink-0 border-2 p-1 transition-colors',
        isActive ? 'border-primary bg-info-surface' : 'border-transparent hover:border-line-strong',
      )}
    >
      <span
        className="border-line flex items-center justify-center overflow-hidden border bg-white"
        style={{ aspectRatio, width: THUMBNAIL.widthPx }}
      >
        <canvas ref={canvasRef} className="block" />
      </span>
      <span className="text-muted mt-1 block text-center text-xs tabular-nums">{index + 1}</span>
    </button>
  );
});
