import type { RotationDegrees } from '@/types/document';

export interface FlattenedPagePlacement {
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
  /**
   * Counter-clockwise degrees for pdf-lib's `drawPage` rotate.
   *
   * PDF content-stream rotation is CCW. Our editor (and PDF `/Rotate`) are
   * clockwise, so a displayed 90° turn is written as −90 here.
   */
  readonly rotateCcw: number;
}

/** Snaps an arbitrary angle onto a quarter turn, wrapping negatives. */
export function normalizeRotationDegrees(angle: number): RotationDegrees {
  const wrapped = ((angle % 360) + 360) % 360;
  if (wrapped === 90 || wrapped === 180 || wrapped === 270) return wrapped;
  return 0;
}

/**
 * Places an unrotated MediaBox onto a new page so the result matches a
 * clockwise display rotation (source `/Rotate` plus editor turns).
 *
 * `embedPage` copies the raw content stream and ignores `/Rotate`. Drawing
 * that stream without a compensating transform would show the page "unturned"
 * relative to the editor, and annotations — stored in displayed space — would
 * land on the wrong edge.
 */
export function getFlattenedPagePlacement(
  mediaWidth: number,
  mediaHeight: number,
  clockwiseDegrees: RotationDegrees,
): FlattenedPagePlacement {
  switch (clockwiseDegrees) {
    case 0:
      return { width: mediaWidth, height: mediaHeight, x: 0, y: 0, rotateCcw: 0 };
    case 90:
      return {
        width: mediaHeight,
        height: mediaWidth,
        x: 0,
        y: mediaWidth,
        rotateCcw: -90,
      };
    case 180:
      return {
        width: mediaWidth,
        height: mediaHeight,
        x: mediaWidth,
        y: mediaHeight,
        rotateCcw: 180,
      };
    case 270:
      return {
        width: mediaHeight,
        height: mediaWidth,
        x: mediaHeight,
        y: 0,
        rotateCcw: 90,
      };
  }
}
