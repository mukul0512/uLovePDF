'use client';

import { create } from 'zustand';
import { ANNOTATION_DEFAULTS } from '@/constants/annotations';
import { HISTORY_LIMITS, ZOOM_LIMITS } from '@/constants/limits';
import type {
  Annotation,
  AnnotationTool,
  EllipseAnnotation,
  InkAnnotation,
  LineAnnotation,
  PagePoint,
  RectAnnotation,
  SignatureAnnotation,
  TextAnnotation,
} from '@/types/annotation';
import type { AnnotationId, PageId, PageSizeInPoints } from '@/types/document';
import type { EditorPage, HistoryEntry } from '@/types/editor';
import { clamp } from '@/utils/commonFunctions/clamp';
import { createId } from '@/utils/commonFunctions/createId';
import { logger } from '@/utils/commonFunctions/logger';
import {
  rotateAnnotationQuarterTurn,
  translateAnnotation,
} from '@/utils/pdfUtils/annotationGeometry';
import { addQuarterTurns } from '@/utils/pdfUtils/rotation';
import { commitEdit, redoEdit, undoEdit } from './editorHistory';

interface OpenDocumentInput {
  readonly fileName: string;
  readonly pageCount: number;
  readonly firstPageSize: PageSizeInPoints;
}

interface EditorState {
  readonly fileName: string | null;
  /**
   * Size of the first page, used for placeholder boxes before a page has
   * rendered. Measuring every page up front would mean a round trip to the
   * worker per page, which on a 500-page file costs seconds and megabytes
   * to learn something that is almost always uniform. Rendered pages use
   * their own true size, so a document with mixed sizes self-corrects.
   */
  readonly firstPageSize: PageSizeInPoints | null;
  readonly pages: readonly EditorPage[];
  readonly currentPageId: PageId | null;
  readonly zoom: number;
  /** Zoom follows the container width until the user picks a level. */
  readonly isFitWidth: boolean;
  readonly tool: AnnotationTool;
  readonly strokeColor: string;
  readonly annotations: readonly Annotation[];
  readonly selectedAnnotationId: AnnotationId | null;
  /**
   * A captured signature waiting to be stamped. Kept out of `annotations`
   * until the user clicks the page, so cancelling the pad costs nothing.
   */
  readonly pendingSignature: {
    readonly points: readonly PagePoint[];
    readonly sourceWidth: number;
    readonly sourceHeight: number;
  } | null;
  readonly past: readonly HistoryEntry[];
  readonly future: readonly HistoryEntry[];
}

interface EditorActions {
  openDocument(input: OpenDocumentInput): void;
  closeDocument(): void;
  setCurrentPage(id: PageId): void;
  goToAdjacentPage(offset: number): void;
  rotatePage(id: PageId, quarterTurns: number): void;
  rotateAllPages(quarterTurns: number): void;
  deletePage(id: PageId): void;
  movePage(id: PageId, offset: number): void;
  setZoom(zoom: number): void;
  stepZoom(direction: 1 | -1): void;
  enableFitWidth(): void;
  /** Reported by the canvas while fit-to-width is active. */
  syncFitWidthZoom(zoom: number): void;
  setTool(tool: AnnotationTool): void;
  setStrokeColor(color: string): void;
  selectAnnotation(id: AnnotationId | null): void;
  addAnnotation(annotation: Annotation): void;
  updateAnnotation(id: AnnotationId, update: (annotation: Annotation) => Annotation): void;
  deleteAnnotation(id: AnnotationId): void;
  moveAnnotation(id: AnnotationId, dxPt: number, dyPt: number): void;
  setPendingSignature(
    signature: {
      readonly points: readonly PagePoint[];
      readonly sourceWidth: number;
      readonly sourceHeight: number;
    } | null,
  ): void;
  placeSignature(pageId: PageId, origin: PagePoint): void;
  createTextAnnotation(pageId: PageId, origin: PagePoint): AnnotationId;
  createInkAnnotation(
    pageId: PageId,
    points: readonly PagePoint[],
    options?: { readonly isHighlight?: boolean },
  ): AnnotationId | null;
  createRectAnnotation(pageId: PageId, origin: PagePoint, widthPt: number, heightPt: number): void;
  createEllipseAnnotation(
    pageId: PageId,
    origin: PagePoint,
    widthPt: number,
    heightPt: number,
  ): void;
  createLineAnnotation(pageId: PageId, start: PagePoint, end: PagePoint): void;
  undo(): void;
  redo(): void;
}

const EMPTY_STATE: EditorState = {
  fileName: null,
  firstPageSize: null,
  pages: [],
  currentPageId: null,
  zoom: ZOOM_LIMITS.default,
  isFitWidth: true,
  tool: 'select',
  strokeColor: ANNOTATION_DEFAULTS.color,
  annotations: [],
  selectedAnnotationId: null,
  pendingSignature: null,
  past: [],
  future: [],
};

/** Replaces one page, leaving every other object reference untouched. */
function replacePage(
  pages: readonly EditorPage[],
  id: PageId,
  update: (page: EditorPage) => EditorPage,
): readonly EditorPage[] {
  return pages.map((page) => (page.id === id ? update(page) : page));
}

function replaceAnnotation(
  annotations: readonly Annotation[],
  id: AnnotationId,
  update: (annotation: Annotation) => Annotation,
): readonly Annotation[] {
  return annotations.map((annotation) => (annotation.id === id ? update(annotation) : annotation));
}

export const useEditorStore = create<EditorState & EditorActions>()((set, get) => ({
  ...EMPTY_STATE,

  openDocument({ fileName, pageCount, firstPageSize }) {
    const pages: EditorPage[] = Array.from({ length: pageCount }, (_unused, index) => ({
      id: createId() as PageId,
      sourcePageNumber: index + 1,
      rotation: 0,
    }));

    set({
      ...EMPTY_STATE,
      fileName,
      firstPageSize,
      pages,
      currentPageId: pages[0]?.id ?? null,
    });

    logger.debug('editor', `opened editor model for "${fileName}"`, { pageCount });
  },

  closeDocument() {
    set({ ...EMPTY_STATE });
  },

  setCurrentPage(id) {
    set({ currentPageId: id, selectedAnnotationId: null });
  },

  goToAdjacentPage(offset) {
    const { pages, currentPageId } = get();
    const index = pages.findIndex((page) => page.id === currentPageId);
    if (index === -1) return;

    const next = pages[clamp(index + offset, 0, pages.length - 1)];
    if (next !== undefined) set({ currentPageId: next.id, selectedAnnotationId: null });
  },

  rotatePage(id, quarterTurns) {
    const { firstPageSize } = get();
    set((state) =>
      commitEdit(state, 'Rotate page', {
        pages: replacePage(state.pages, id, (page) => ({
          ...page,
          rotation: addQuarterTurns(page.rotation, quarterTurns),
        })),
        // Annotations are stored in the displayed page's coordinate system, so
        // they have to turn with the page or they detach from the content.
        annotations:
          firstPageSize === null
            ? state.annotations
            : state.annotations.map((annotation) =>
                annotation.pageId === id
                  ? rotateAnnotationQuarterTurn(annotation, firstPageSize, quarterTurns)
                  : annotation,
              ),
      }),
    );
  },

  rotateAllPages(quarterTurns) {
    const { firstPageSize } = get();
    set((state) =>
      commitEdit(state, 'Rotate all pages', {
        pages: state.pages.map((page) => ({
          ...page,
          rotation: addQuarterTurns(page.rotation, quarterTurns),
        })),
        annotations:
          firstPageSize === null
            ? state.annotations
            : state.annotations.map((annotation) =>
                rotateAnnotationQuarterTurn(annotation, firstPageSize, quarterTurns),
              ),
      }),
    );
  },

  deletePage(id) {
    set((state) => {
      // Refuse to empty the document: a zero-page PDF cannot be exported,
      // and "delete everything" is better expressed as closing the file.
      if (state.pages.length <= 1) return state;

      const index = state.pages.findIndex((page) => page.id === id);
      if (index === -1) return state;

      const pages = state.pages.filter((page) => page.id !== id);
      const annotations = state.annotations.filter((annotation) => annotation.pageId !== id);

      // Deleting the page being viewed should land somewhere sensible
      // rather than blanking the canvas. The page that slid into this slot
      // is the natural choice, falling back to the new last page.
      const currentPageId =
        state.currentPageId === id
          ? (pages[Math.min(index, pages.length - 1)]?.id ?? null)
          : state.currentPageId;

      return commitEdit(state, 'Delete page', {
        pages,
        annotations,
        currentPageId,
        selectedAnnotationId: null,
      });
    });
  },

  movePage(id, offset) {
    set((state) => {
      const from = state.pages.findIndex((page) => page.id === id);
      if (from === -1) return state;

      const to = clamp(from + offset, 0, state.pages.length - 1);
      if (to === from) return state;

      const pages = [...state.pages];
      const [moved] = pages.splice(from, 1);
      if (moved === undefined) return state;
      pages.splice(to, 0, moved);

      return commitEdit(state, 'Reorder page', { pages });
    });
  },

  setZoom(zoom) {
    set({ zoom: clamp(zoom, ZOOM_LIMITS.min, ZOOM_LIMITS.max), isFitWidth: false });
  },

  stepZoom(direction) {
    const { zoom } = get();
    set({
      zoom: clamp(zoom + direction * ZOOM_LIMITS.step, ZOOM_LIMITS.min, ZOOM_LIMITS.max),
      isFitWidth: false,
    });
  },

  enableFitWidth() {
    set({ isFitWidth: true });
  },

  syncFitWidthZoom(zoom) {
    // Guarded because this is called from a layout effect that runs after
    // the render it would trigger. Without the equality check the canvas
    // and the store would push each other around forever.
    const state = get();
    if (!state.isFitWidth || state.zoom === zoom) return;
    set({ zoom });
  },

  setTool(tool) {
    set({
      tool,
      selectedAnnotationId: tool === 'select' ? get().selectedAnnotationId : null,
      // Leaving signature mode without placing cancels the pending stamp.
      pendingSignature: tool === 'signature' ? get().pendingSignature : null,
    });
  },

  setStrokeColor(color) {
    set({ strokeColor: color });
  },

  selectAnnotation(id) {
    set({ selectedAnnotationId: id, tool: 'select' });
  },

  addAnnotation(annotation) {
    set((state) =>
      commitEdit(state, `Add ${annotation.type}`, {
        annotations: [...state.annotations, annotation],
        selectedAnnotationId: annotation.id,
        tool: 'select',
      }),
    );
    logger.debug('editor', `added ${annotation.type} annotation`, annotation.id);
  },

  updateAnnotation(id, update) {
    set((state) =>
      commitEdit(
        state,
        'Edit text',
        {
          annotations: replaceAnnotation(state.annotations, id, update),
        },
        { coalesceKey: `text:${id}`, coalesceWindowMs: HISTORY_LIMITS.textCoalesceMs },
      ),
    );
  },

  deleteAnnotation(id) {
    set((state) =>
      commitEdit(state, 'Delete annotation', {
        annotations: state.annotations.filter((annotation) => annotation.id !== id),
        selectedAnnotationId: state.selectedAnnotationId === id ? null : state.selectedAnnotationId,
      }),
    );
  },

  moveAnnotation(id, dxPt, dyPt) {
    if (dxPt === 0 && dyPt === 0) return;
    set((state) =>
      commitEdit(
        state,
        'Move annotation',
        {
          annotations: replaceAnnotation(state.annotations, id, (annotation) =>
            translateAnnotation(annotation, dxPt, dyPt),
          ),
        },
        { coalesceKey: `move:${id}`, coalesceWindowMs: HISTORY_LIMITS.moveCoalesceMs },
      ),
    );
  },

  setPendingSignature(signature) {
    set({
      pendingSignature: signature,
      tool: signature === null ? 'select' : 'signature',
    });
  },

  placeSignature(pageId, origin) {
    const { pendingSignature, strokeColor } = get();
    if (pendingSignature === null) return;

    const widthPt = ANNOTATION_DEFAULTS.signatureWidthPt;
    const heightPt = ANNOTATION_DEFAULTS.signatureHeightPt;
    const scaleX = widthPt / pendingSignature.sourceWidth;
    const scaleY = heightPt / pendingSignature.sourceHeight;

    const annotation: SignatureAnnotation = {
      id: createId() as AnnotationId,
      type: 'signature',
      pageId,
      origin,
      widthPt,
      heightPt,
      color: strokeColor,
      points: pendingSignature.points.map((point) => ({
        xPt: point.xPt * scaleX,
        yPt: point.yPt * scaleY,
      })),
    };

    set((state) =>
      commitEdit(state, 'Add signature', {
        annotations: [...state.annotations, annotation],
        selectedAnnotationId: annotation.id,
        pendingSignature: null,
        tool: 'select',
      }),
    );
  },

  createTextAnnotation(pageId, origin) {
    const { strokeColor } = get();
    const id = createId() as AnnotationId;
    const annotation: TextAnnotation = {
      id,
      type: 'text',
      pageId,
      origin,
      widthPt: ANNOTATION_DEFAULTS.textWidthPt,
      text: 'Text',
      fontSizePt: ANNOTATION_DEFAULTS.fontSizePt,
      color: strokeColor,
    };
    set((state) =>
      commitEdit(state, 'Add text', {
        annotations: [...state.annotations, annotation],
        selectedAnnotationId: id,
        tool: 'select',
      }),
    );
    return id;
  },

  createInkAnnotation(pageId, points, options) {
    if (points.length < ANNOTATION_DEFAULTS.minInkPoints) return null;

    const { strokeColor } = get();
    const isHighlight = options?.isHighlight === true;
    const id = createId() as AnnotationId;
    const annotation: InkAnnotation = {
      id,
      type: 'ink',
      pageId,
      points,
      color: strokeColor,
      strokeWidthPt: isHighlight
        ? ANNOTATION_DEFAULTS.highlightStrokeWidthPt
        : ANNOTATION_DEFAULTS.strokeWidthPt,
      opacity: isHighlight ? ANNOTATION_DEFAULTS.highlightOpacity : ANNOTATION_DEFAULTS.inkOpacity,
    };

    set((state) =>
      commitEdit(state, isHighlight ? 'Highlight' : 'Draw', {
        annotations: [...state.annotations, annotation],
        selectedAnnotationId: id,
      }),
    );
    return id;
  },

  createRectAnnotation(pageId, origin, widthPt, heightPt) {
    if (
      widthPt < ANNOTATION_DEFAULTS.minShapeSizePt ||
      heightPt < ANNOTATION_DEFAULTS.minShapeSizePt
    ) {
      return;
    }

    const { strokeColor } = get();
    const annotation: RectAnnotation = {
      id: createId() as AnnotationId,
      type: 'rectangle',
      pageId,
      origin,
      widthPt,
      heightPt,
      strokeWidthPt: ANNOTATION_DEFAULTS.strokeWidthPt,
      color: strokeColor,
      fill: null,
    };
    set((state) =>
      commitEdit(state, 'Add rectangle', {
        annotations: [...state.annotations, annotation],
        selectedAnnotationId: annotation.id,
        tool: 'select',
      }),
    );
  },

  createEllipseAnnotation(pageId, origin, widthPt, heightPt) {
    if (
      widthPt < ANNOTATION_DEFAULTS.minShapeSizePt ||
      heightPt < ANNOTATION_DEFAULTS.minShapeSizePt
    ) {
      return;
    }

    const { strokeColor } = get();
    const annotation: EllipseAnnotation = {
      id: createId() as AnnotationId,
      type: 'ellipse',
      pageId,
      origin,
      widthPt,
      heightPt,
      strokeWidthPt: ANNOTATION_DEFAULTS.strokeWidthPt,
      color: strokeColor,
      fill: null,
    };
    set((state) =>
      commitEdit(state, 'Add ellipse', {
        annotations: [...state.annotations, annotation],
        selectedAnnotationId: annotation.id,
        tool: 'select',
      }),
    );
  },

  createLineAnnotation(pageId, start, end) {
    const dx = Math.abs(end.xPt - start.xPt);
    const dy = Math.abs(end.yPt - start.yPt);
    if (dx < ANNOTATION_DEFAULTS.minShapeSizePt && dy < ANNOTATION_DEFAULTS.minShapeSizePt) {
      return;
    }

    const { strokeColor } = get();
    const annotation: LineAnnotation = {
      id: createId() as AnnotationId,
      type: 'line',
      pageId,
      start,
      end,
      strokeWidthPt: ANNOTATION_DEFAULTS.strokeWidthPt,
      color: strokeColor,
    };
    set((state) =>
      commitEdit(state, 'Add line', {
        annotations: [...state.annotations, annotation],
        selectedAnnotationId: annotation.id,
        tool: 'select',
      }),
    );
  },

  undo() {
    set((state) => {
      if (state.past.length === 0) return state;
      const label = state.past[state.past.length - 1]?.label ?? 'edit';
      logger.debug('editor', `undo: ${label}`);
      return undoEdit(state);
    });
  },

  redo() {
    set((state) => {
      if (state.future.length === 0) return state;
      const label = state.future[state.future.length - 1]?.label ?? 'edit';
      logger.debug('editor', `redo: ${label}`);
      return redoEdit(state);
    });
  },
}));
