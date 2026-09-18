import type { AnnotationId, PageId } from './document';

/**
 * A point in page space.
 *
 * Origin is the top-left of the *displayed* page (after any editor rotation),
 * with Y growing downward. Units are PDF points. Screen pixels are never
 * stored here: zoom and device pixel ratio would otherwise bake into every
 * annotation and break the moment either changes.
 */
export interface PagePoint {
  readonly xPt: number;
  readonly yPt: number;
}

export type AnnotationTool =
  'select' | 'text' | 'draw' | 'highlight' | 'rectangle' | 'ellipse' | 'line' | 'signature';

interface AnnotationBase {
  readonly id: AnnotationId;
  readonly pageId: PageId;
}

export interface TextAnnotation extends AnnotationBase {
  readonly type: 'text';
  readonly origin: PagePoint;
  readonly widthPt: number;
  readonly text: string;
  readonly fontSizePt: number;
  readonly color: string;
}

export interface InkAnnotation extends AnnotationBase {
  readonly type: 'ink';
  /** At least two points; a single-point stroke is discarded on commit. */
  readonly points: readonly PagePoint[];
  readonly strokeWidthPt: number;
  readonly color: string;
  /** Semi-transparent strokes used for highlighter-style marks. */
  readonly opacity: number;
}

export interface RectAnnotation extends AnnotationBase {
  readonly type: 'rectangle';
  readonly origin: PagePoint;
  readonly widthPt: number;
  readonly heightPt: number;
  readonly strokeWidthPt: number;
  readonly color: string;
  readonly fill: string | null;
}

export interface EllipseAnnotation extends AnnotationBase {
  readonly type: 'ellipse';
  readonly origin: PagePoint;
  readonly widthPt: number;
  readonly heightPt: number;
  readonly strokeWidthPt: number;
  readonly color: string;
  readonly fill: string | null;
}

export interface LineAnnotation extends AnnotationBase {
  readonly type: 'line';
  readonly start: PagePoint;
  readonly end: PagePoint;
  readonly strokeWidthPt: number;
  readonly color: string;
}

/**
 * A signature is an ink path with a known bounding box, so it can be scaled
 * and placed like a stamp. Keeping it vector (not a PNG) means export stays
 * resolution-independent and the bytes stay small.
 */
export interface SignatureAnnotation extends AnnotationBase {
  readonly type: 'signature';
  readonly origin: PagePoint;
  readonly widthPt: number;
  readonly heightPt: number;
  readonly points: readonly PagePoint[];
  readonly color: string;
}

export type Annotation =
  | TextAnnotation
  | InkAnnotation
  | RectAnnotation
  | EllipseAnnotation
  | LineAnnotation
  | SignatureAnnotation;

export type AnnotationType = Annotation['type'];
