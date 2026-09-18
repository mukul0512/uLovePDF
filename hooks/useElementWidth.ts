'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Width changes are quantised to this many pixels.
 *
 * Every distinct width triggers a fresh render of the page at a new scale,
 * which is expensive. Without quantising, dragging a window edge would queue
 * a render per pixel of travel. Snapping to a grid makes a slow drag cost a
 * handful of renders instead of hundreds, at the price of being up to 15px
 * narrower than the space available.
 */
const WIDTH_STEP_PX = 16;

/** Observes an element's content width, rounded down to a stable step. */
export function useElementWidth(ref: RefObject<HTMLElement | null>): number | null {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry === undefined) return;

      const stepped = Math.floor(entry.contentRect.width / WIDTH_STEP_PX) * WIDTH_STEP_PX;
      const next = Math.max(stepped, WIDTH_STEP_PX);
      setWidth((current) => (current === next ? current : next));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}
