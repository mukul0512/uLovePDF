import type { PageSizeInPoints, RotationDegrees } from '@/types/document';

/**
 * Adds quarter turns to a rotation, wrapping in both directions.
 *
 * The double modulo is not redundant: `%` in JavaScript keeps the sign of
 * the left operand, so turning left from 0 gives -90 without it.
 */
export function addQuarterTurns(rotation: RotationDegrees, quarterTurns: number): RotationDegrees {
  const degrees = (((rotation + quarterTurns * 90) % 360) + 360) % 360;
  return degrees as RotationDegrees;
}

/**
 * The size a page occupies on screen once rotated.
 *
 * A quarter turn swaps width and height, which matters anywhere layout is
 * computed before rendering: placeholder boxes, fit-to-width zoom, and the
 * scroll height of the thumbnail rail.
 */
export function getRotatedSize(
  size: PageSizeInPoints,
  rotation: RotationDegrees,
): PageSizeInPoints {
  if (rotation === 90 || rotation === 270) {
    return { widthPt: size.heightPt, heightPt: size.widthPt };
  }
  return size;
}
