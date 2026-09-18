/**
 * PDF points to CSS pixels at 100% zoom.
 *
 * A PDF point is 1/72 inch and a CSS pixel is 1/96 inch, so "actual size"
 * means multiplying by 96/72. Without this the document renders about 25%
 * too small and 100% zoom quietly means something other than actual size.
 */
export const CSS_PX_PER_PT = 96 / 72;

/** Offered in the zoom menu. The toolbar steps through these in order. */
export const ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4] as const;

export const THUMBNAIL = {
  /** Render width in CSS pixels. Small enough that a page costs ~90 KB. */
  widthPx: 112,
  /**
   * How far outside the scroll viewport a thumbnail starts rendering.
   * Large enough to stay ahead of a deliberate scroll, small enough that a
   * 500-page document never holds more than a few dozen live canvases.
   */
  overscanPx: 600,
} as const;
