'use client';

import { useEffect, useState } from 'react';
import type { LoadedPdfDocument } from '@/lib/pdf';
import type { PageSizeInPoints } from '@/types/document';

/**
 * Reads one page's intrinsic size.
 *
 * Returns `null` until known, rather than guessing, because the value feeds
 * zoom arithmetic where a wrong answer shows up as the page jumping size
 * the moment the real measurement arrives.
 */
export function usePageSize(
  pdf: LoadedPdfDocument,
  pageNumber: number | null,
): PageSizeInPoints | null {
  const [size, setSize] = useState<PageSizeInPoints | null>(null);
  const [trackedPage, setTrackedPage] = useState<number | null>(pageNumber);

  if (pageNumber !== trackedPage) {
    setTrackedPage(pageNumber);
    setSize(null);
  }

  useEffect(() => {
    if (pageNumber === null) return;

    let isCurrent = true;

    void pdf
      .getPageSize(pageNumber)
      .then((next) => {
        if (isCurrent) setSize(next);
      })
      .catch(() => {
        // A page whose size cannot be read will fail to render too, and the
        // canvas reports that. Staying silent here avoids two errors for
        // one cause.
      });

    return () => {
      isCurrent = false;
    };
  }, [pdf, pageNumber]);

  return size;
}
