import type { AnnotationTool } from '@/types/annotation';

export const ANNOTATION_COLORS = [
  '#1d4275', // brand ink
  '#b91c1c', // red
  '#a16207', // amber
  '#15803d', // green
  '#0f172a', // near-black
] as const;

export type AnnotationColor = (typeof ANNOTATION_COLORS)[number];

export const ANNOTATION_DEFAULTS = {
  color: ANNOTATION_COLORS[0],
  strokeWidthPt: 2,
  highlightStrokeWidthPt: 14,
  highlightOpacity: 0.35,
  inkOpacity: 1,
  fontSizePt: 14,
  textWidthPt: 180,
  /** Default stamp size when placing a captured signature. */
  signatureWidthPt: 160,
  signatureHeightPt: 60,
  /** Drag shorter than this is treated as a click, not a shape. */
  minShapeSizePt: 4,
  /** Strokes with fewer than this many samples are discarded. */
  minInkPoints: 2,
} as const;

export const ANNOTATION_TOOL_LABELS: Record<AnnotationTool, string> = {
  select: 'Select',
  text: 'Text',
  draw: 'Draw',
  highlight: 'Highlight',
  rectangle: 'Rectangle',
  ellipse: 'Ellipse',
  line: 'Line',
  signature: 'Signature',
};
