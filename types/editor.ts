import type { Annotation } from './annotation';
import type { AnnotationId, PageId, RotationDegrees } from './document';

/**
 * One page of the document being edited.
 *
 * This is an *instruction*, not content. It says "take page N of the source
 * file and turn it this far", and the source bytes are never touched. Two
 * consequences follow, and both are the reason for the design: reordering or
 * deleting is a cheap array operation rather than a rewrite of the PDF, and
 * the history can snapshot this list instead of copying the PDF bytes.
 *
 * The `id` is stable for the lifetime of the page and survives reordering,
 * which is what lets React keep canvases alive across a move instead of
 * re-rendering the whole rail.
 */
export interface EditorPage {
  readonly id: PageId;
  /** One-based page number in the source file. */
  readonly sourcePageNumber: number;
  /** Applied on top of whatever `/Rotate` the source page already carries. */
  readonly rotation: RotationDegrees;
}

/**
 * The part of editor state that undo restores.
 *
 * Zoom, the active tool and the colour picker are left out on purpose: they
 * are view settings, and undoing a rectangle should not also undo a zoom.
 */
export interface EditSnapshot {
  readonly pages: readonly EditorPage[];
  readonly annotations: readonly Annotation[];
  readonly currentPageId: PageId | null;
  readonly selectedAnnotationId: AnnotationId | null;
}

export interface HistoryEntry {
  readonly label: string;
  /** The edit model as it was *before* the action this entry describes. */
  readonly snapshot: EditSnapshot;
  /**
   * Consecutive actions that share a key (typing into the same text box,
   * dragging the same shape) collapse into one undo step.
   */
  readonly coalesceKey: string | null;
  readonly recordedAt: number;
}
