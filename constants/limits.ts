/**
 * Hard boundaries imposed by the browser, plus the thresholds we choose.
 *
 * File-size numbers are product policy: 50 MB is where we warn, 200 MB is
 * where we refuse, because a tab that has already spent that much on one
 * `ArrayBuffer` is close to a crash on mid-range phones. Canvas ceilings
 * are measured at runtime (see `utils/pdfUtils/canvasLimits.ts`); the
 * fallbacks below are the conservative iOS-era values used before the
 * probe runs and on environments with no `document`.
 */

const BYTES_PER_MB = 1024 * 1024;

export const FILE_LIMITS = {
  /** Past this we warn that the browser tab may run out of memory. */
  warnBytes: 50 * BYTES_PER_MB,
  /** Past this we refuse the file rather than risk crashing the tab. */
  maxBytes: 200 * BYTES_PER_MB,
  acceptedMimeType: 'application/pdf',
  acceptedExtension: '.pdf',
  /**
   * Ceiling on files held at once. Not a licensing rule: each entry keeps a
   * file handle alive and will later hold parsed page data, so an unbounded
   * list is a memory leak waiting for a user who drags in a whole folder.
   */
  maxFileCount: 30,
  /** Every PDF begins with these bytes; checked before trusting the MIME type. */
  magicBytes: [0x25, 0x50, 0x44, 0x46] as const, // "%PDF"
} as const;

export const ZOOM_LIMITS = {
  min: 0.25,
  max: 8,
  default: 1,
  step: 0.25,
} as const;

export const RENDER_LIMITS = {
  /**
   * Canvas ceilings differ wildly by browser: desktop Chrome allows roughly
   * 16384px per side, while iOS Safari has historically capped total area near
   * 16.7M pixels. `getCanvasLimits()` measures the real values; these are the
   * conservative fallback when the probe cannot run.
   */
  fallbackMaxCanvasArea: 16_777_216,
  fallbackMaxCanvasDimension: 4096,
  /** Device pixel ratio is capped so retina screens do not quadruple memory. */
  maxDevicePixelRatio: 2,
  /** Pages rendered ahead of and behind the viewport during virtualised scroll. */
  pageOverscan: 1,
  thumbnailScale: 0.2,
  /**
   * Simultaneous pdf.js paints. Two keeps the worker busy without letting a
   * fast thumbnail scroll start a render per visible rail item.
   */
  maxConcurrentRenders: 2,
} as const;

export const HISTORY_LIMITS = {
  /**
   * Ceiling on undo steps. Each entry is a snapshot of the edit model
   * (pages + annotations), not the PDF, so fifty is cheap and enough that
   * a long session never feels truncated.
   */
  maxEntries: 50,
  /**
   * Consecutive text edits on the same annotation within this window collapse
   * into one undo step, so Ctrl+Z does not walk back a character at a time.
   */
  textCoalesceMs: 800,
  /**
   * A drag fires `pointermove` tens of times. Treating the whole gesture as
   * one step needs a window longer than any pause while the pointer is down.
   */
  moveCoalesceMs: Number.POSITIVE_INFINITY,
} as const;
