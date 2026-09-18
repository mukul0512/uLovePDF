import type { Brand } from './brand';

export type DocumentId = Brand<string, 'DocumentId'>;
export type PageId = Brand<string, 'PageId'>;
export type AnnotationId = Brand<string, 'AnnotationId'>;

/**
 * A PDF page's intrinsic size, in PDF points (1pt = 1/72 inch).
 *
 * Screen pixels are deliberately a separate concept: the mapping between the
 * two depends on zoom and device pixel ratio, and conflating them is the most
 * common source of misplaced annotations.
 */
export interface PageSizeInPoints {
  readonly widthPt: number;
  readonly heightPt: number;
}

/** Page rotation is stored in the PDF as a multiple of 90 degrees. */
export type RotationDegrees = 0 | 90 | 180 | 270;
