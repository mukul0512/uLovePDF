'use client';

import { useRef } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { getRotatedSize } from '@/utils/pdfUtils/rotation';
import { PageThumbnail } from './PageThumbnail';

/** Used before the document's real page size is known. */
const FALLBACK_ASPECT_RATIO = 595 / 842;

export function PageRail() {
  const pages = useEditorStore((state) => state.pages);
  const currentPageId = useEditorStore((state) => state.currentPageId);
  const firstPageSize = useEditorStore((state) => state.firstPageSize);
  const setCurrentPage = useEditorStore((state) => state.setCurrentPage);

  /**
   * The rail owns its scroll container so it can hand it to each thumbnail
   * as the intersection root. That detail matters: with the default root,
   * `rootMargin` grows the viewport rectangle, which says nothing about
   * how far a thumbnail is from the edge of a rail it is clipped by. The
   * overscan would silently do nothing and pages would only start
   * rendering once already on screen.
   */
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="border-line max-h-40 shrink-0 overflow-auto border-b p-2 md:max-h-none md:w-36 md:border-r md:border-b-0"
    >
      <nav aria-label="Pages">
        {/* An ordered list, because the order is the document's order and a
            screen reader should be told as much. */}
        <ol className="flex gap-2 md:flex-col md:items-center">
          {pages.map((page, index) => {
            const rotated =
              firstPageSize === null ? null : getRotatedSize(firstPageSize, page.rotation);

            return (
              <li key={page.id}>
                <PageThumbnail
                  page={page}
                  index={index}
                  isActive={page.id === currentPageId}
                  aspectRatio={
                    rotated === null ? FALLBACK_ASPECT_RATIO : rotated.widthPt / rotated.heightPt
                  }
                  scrollRootRef={scrollRef}
                  onSelect={setCurrentPage}
                />
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
