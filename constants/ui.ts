/**
 * Stacking order for every layer that can overlap.
 *
 * Centralising this is what stops the "z-index: 9999" arms race. The editor
 * stacks several surfaces over the page canvas, so the values are grouped by
 * the context they apply in.
 */
export const Z_INDEX = {
  /** Layers inside the PDF viewport, relative to the page canvas. */
  pageCanvas: 0,
  annotationLayer: 10,
  selectionHandles: 20,

  /** Application chrome. */
  stickyHeader: 100,
  overlay: 200,
  dropdown: 300,
  modal: 400,
  toast: 500,
  tooltip: 600,
} as const;

/**
 * Tailwind's default breakpoints, mirrored for JavaScript.
 *
 * Some behaviour cannot be expressed in CSS alone -- the thumbnail rail
 * collapses to a drawer on small screens, which changes which component
 * renders, not just how it looks. `matchMedia` needs the numbers.
 */
export const BREAKPOINTS_PX = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS_PX;
