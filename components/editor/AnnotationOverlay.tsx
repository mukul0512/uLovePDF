'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { Annotation, InkAnnotation, PagePoint } from '@/types/annotation';
import type { AnnotationId, PageId, PageSizeInPoints } from '@/types/document';
import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/utils/commonFunctions/cn';
import {
  getAnnotationBounds,
  normaliseRect,
  pointsToSvgPath,
} from '@/utils/pdfUtils/annotationGeometry';

interface AnnotationOverlayProps {
  pageId: PageId;
  pageSize: PageSizeInPoints;
  widthPx: number;
  heightPx: number;
}

type Draft =
  | { readonly kind: 'ink'; readonly points: readonly PagePoint[]; readonly isHighlight: boolean }
  | { readonly kind: 'rect'; readonly start: PagePoint; readonly current: PagePoint }
  | { readonly kind: 'ellipse'; readonly start: PagePoint; readonly current: PagePoint }
  | { readonly kind: 'line'; readonly start: PagePoint; readonly current: PagePoint };

function clientToPagePoint(
  event: { clientX: number; clientY: number },
  element: Element,
  pageSize: PageSizeInPoints,
): PagePoint {
  const rect = element.getBoundingClientRect();
  const xRatio = rect.width === 0 ? 0 : (event.clientX - rect.left) / rect.width;
  const yRatio = rect.height === 0 ? 0 : (event.clientY - rect.top) / rect.height;
  return {
    xPt: xRatio * pageSize.widthPt,
    yPt: yRatio * pageSize.heightPt,
  };
}

function TextAnnotationEditor({
  annotation,
  pageSize,
}: {
  annotation: Extract<Annotation, { type: 'text' }>;
  pageSize: PageSizeInPoints;
}) {
  const updateAnnotation = useEditorStore((state) => state.updateAnnotation);
  const selectAnnotation = useEditorStore((state) => state.selectAnnotation);
  const selectedAnnotationId = useEditorStore((state) => state.selectedAnnotationId);
  const isSelected = selectedAnnotationId === annotation.id;

  const leftPct = (annotation.origin.xPt / pageSize.widthPt) * 100;
  const topPct = (annotation.origin.yPt / pageSize.heightPt) * 100;
  const widthPct = (annotation.widthPt / pageSize.widthPt) * 100;
  // Font size as a fraction of page height so text scales with zoom the
  // same way the SVG shapes do.
  const fontSizePct = (annotation.fontSizePt / pageSize.heightPt) * 100;

  return (
    <textarea
      value={annotation.text}
      aria-label="Text annotation"
      onFocus={() => selectAnnotation(annotation.id)}
      onPointerDown={(event) => event.stopPropagation()}
      onChange={(event) => {
        const text = event.target.value;
        updateAnnotation(annotation.id, (current) =>
          current.type === 'text' ? { ...current, text } : current,
        );
      }}
      className={cn(
        'absolute resize-none overflow-hidden bg-transparent p-0.5 leading-tight outline-none',
        isSelected ? 'ring-primary ring-2' : 'hover:ring-line-strong hover:ring-1',
      )}
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${widthPct}%`,
        fontSize: `${fontSizePct}cqh`,
        color: annotation.color,
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}
    />
  );
}

function SelectionChrome({ annotation }: { annotation: Annotation }) {
  const bounds = getAnnotationBounds(annotation);
  return (
    <rect
      x={bounds.origin.xPt}
      y={bounds.origin.yPt}
      width={bounds.widthPt}
      height={bounds.heightPt}
      fill="none"
      stroke="var(--primary)"
      strokeWidth={1}
      strokeDasharray="4 3"
      pointerEvents="none"
    />
  );
}

function DraftShape({ draft, color }: { draft: Draft; color: string }) {
  if (draft.kind === 'ink') {
    const preview: Pick<InkAnnotation, 'points' | 'strokeWidthPt' | 'opacity'> = {
      points: draft.points,
      strokeWidthPt: draft.isHighlight ? 14 : 2,
      opacity: draft.isHighlight ? 0.35 : 1,
    };
    return (
      <path
        d={pointsToSvgPath(preview.points)}
        fill="none"
        stroke={color}
        strokeWidth={preview.strokeWidthPt}
        strokeOpacity={preview.opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="none"
      />
    );
  }

  if (draft.kind === 'line') {
    return (
      <line
        x1={draft.start.xPt}
        y1={draft.start.yPt}
        x2={draft.current.xPt}
        y2={draft.current.yPt}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        pointerEvents="none"
      />
    );
  }

  const rect = normaliseRect(draft.start, draft.current);
  if (draft.kind === 'ellipse') {
    return (
      <ellipse
        cx={rect.origin.xPt + rect.widthPt / 2}
        cy={rect.origin.yPt + rect.heightPt / 2}
        rx={rect.widthPt / 2}
        ry={rect.heightPt / 2}
        fill="none"
        stroke={color}
        strokeWidth={2}
        pointerEvents="none"
      />
    );
  }

  return (
    <rect
      x={rect.origin.xPt}
      y={rect.origin.yPt}
      width={rect.widthPt}
      height={rect.heightPt}
      fill="none"
      stroke={color}
      strokeWidth={2}
      pointerEvents="none"
    />
  );
}

function AnnotationShape({
  annotation,
  onBeginMove,
}: {
  annotation: Annotation;
  onBeginMove: (id: AnnotationId, event: React.PointerEvent) => void;
}) {
  const handlePointerDown = (event: React.PointerEvent): void => {
    onBeginMove(annotation.id, event);
  };

  switch (annotation.type) {
    case 'text':
      return null;
    case 'ink':
      return (
        <path
          d={pointsToSvgPath(annotation.points)}
          fill="none"
          stroke={annotation.color}
          strokeWidth={annotation.strokeWidthPt}
          strokeOpacity={annotation.opacity}
          strokeLinecap="round"
          strokeLinejoin="round"
          onPointerDown={handlePointerDown}
        />
      );
    case 'rectangle':
      return (
        <rect
          x={annotation.origin.xPt}
          y={annotation.origin.yPt}
          width={annotation.widthPt}
          height={annotation.heightPt}
          fill={annotation.fill ?? 'transparent'}
          stroke={annotation.color}
          strokeWidth={annotation.strokeWidthPt}
          onPointerDown={handlePointerDown}
        />
      );
    case 'ellipse':
      return (
        <ellipse
          cx={annotation.origin.xPt + annotation.widthPt / 2}
          cy={annotation.origin.yPt + annotation.heightPt / 2}
          rx={annotation.widthPt / 2}
          ry={annotation.heightPt / 2}
          fill={annotation.fill ?? 'transparent'}
          stroke={annotation.color}
          strokeWidth={annotation.strokeWidthPt}
          onPointerDown={handlePointerDown}
        />
      );
    case 'line':
      return (
        <line
          x1={annotation.start.xPt}
          y1={annotation.start.yPt}
          x2={annotation.end.xPt}
          y2={annotation.end.yPt}
          stroke={annotation.color}
          strokeWidth={annotation.strokeWidthPt}
          strokeLinecap="round"
          onPointerDown={handlePointerDown}
        />
      );
    case 'signature': {
      const translated = annotation.points.map((point) => ({
        xPt: annotation.origin.xPt + point.xPt,
        yPt: annotation.origin.yPt + point.yPt,
      }));
      return (
        <g onPointerDown={handlePointerDown}>
          <rect
            x={annotation.origin.xPt}
            y={annotation.origin.yPt}
            width={annotation.widthPt}
            height={annotation.heightPt}
            fill="transparent"
          />
          <path
            d={pointsToSvgPath(translated)}
            fill="none"
            stroke={annotation.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    }
  }
}

/**
 * Interactive annotation surface stacked on the PDF canvas.
 *
 * The SVG's viewBox is the page in points, while its CSS size matches the
 * rendered canvas. That single mapping is what keeps annotations glued to
 * the page as zoom changes: geometry never leaves point space.
 */
export const AnnotationOverlay = memo(function AnnotationOverlay({
  pageId,
  pageSize,
  widthPx,
  heightPx,
}: AnnotationOverlayProps) {
  const tool = useEditorStore((state) => state.tool);
  const strokeColor = useEditorStore((state) => state.strokeColor);
  const annotations = useEditorStore((state) => state.annotations);
  const selectedAnnotationId = useEditorStore((state) => state.selectedAnnotationId);
  const pendingSignature = useEditorStore((state) => state.pendingSignature);

  const selectAnnotation = useEditorStore((state) => state.selectAnnotation);
  const deleteAnnotation = useEditorStore((state) => state.deleteAnnotation);
  const moveAnnotation = useEditorStore((state) => state.moveAnnotation);
  const createTextAnnotation = useEditorStore((state) => state.createTextAnnotation);
  const createInkAnnotation = useEditorStore((state) => state.createInkAnnotation);
  const createRectAnnotation = useEditorStore((state) => state.createRectAnnotation);
  const createEllipseAnnotation = useEditorStore((state) => state.createEllipseAnnotation);
  const createLineAnnotation = useEditorStore((state) => state.createLineAnnotation);
  const placeSignature = useEditorStore((state) => state.placeSignature);

  const surfaceRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  // The pointer-up handler closes over render-time state. Without a ref it
  // would still see `null` after pointerdown's setState, and every shape
  // would vanish on release.
  const draftRef = useRef<Draft | null>(null);
  const dragRef = useRef<{ id: AnnotationId; last: PagePoint } | null>(null);

  const pageAnnotations = annotations.filter((annotation) => annotation.pageId === pageId);
  const selected = pageAnnotations.find((annotation) => annotation.id === selectedAnnotationId);

  const updateDraft = useCallback((next: Draft | null) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
      }
      if (selectedAnnotationId === null) return;
      event.preventDefault();
      deleteAnnotation(selectedAnnotationId);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteAnnotation, selectedAnnotationId]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      const surface = surfaceRef.current;
      if (surface === null) return;

      const point = clientToPagePoint(event, surface, pageSize);

      if (tool === 'select') {
        // Empty-space clicks clear the selection. Annotation shapes stop
        // propagation, so reaching here means the page itself was hit.
        selectAnnotation(null);
        return;
      }

      if (tool === 'text') {
        createTextAnnotation(pageId, point);
        return;
      }

      if (tool === 'signature') {
        if (pendingSignature !== null) placeSignature(pageId, point);
        return;
      }

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic events (and some browsers) reject capture; drawing
        // still works as long as move/up reach this element.
      }

      if (tool === 'draw' || tool === 'highlight') {
        updateDraft({ kind: 'ink', points: [point], isHighlight: tool === 'highlight' });
        return;
      }

      if (tool === 'rectangle') {
        updateDraft({ kind: 'rect', start: point, current: point });
        return;
      }

      if (tool === 'ellipse') {
        updateDraft({ kind: 'ellipse', start: point, current: point });
        return;
      }

      if (tool === 'line') {
        updateDraft({ kind: 'line', start: point, current: point });
      }
    },
    [
      createTextAnnotation,
      pageId,
      pageSize,
      pendingSignature,
      placeSignature,
      selectAnnotation,
      tool,
      updateDraft,
    ],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const surface = surfaceRef.current;
      if (surface === null) return;
      const point = clientToPagePoint(event, surface, pageSize);

      if (dragRef.current !== null) {
        const { id, last } = dragRef.current;
        moveAnnotation(id, point.xPt - last.xPt, point.yPt - last.yPt);
        dragRef.current = { id, last: point };
        return;
      }

      const current = draftRef.current;
      if (current === null) return;

      if (current.kind === 'ink') {
        updateDraft({ ...current, points: [...current.points, point] });
        return;
      }

      updateDraft({ ...current, current: point });
    },
    [moveAnnotation, pageSize, updateDraft],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;

    const current = draftRef.current;
    updateDraft(null);
    if (current === null) return;

    if (current.kind === 'ink') {
      createInkAnnotation(pageId, current.points, { isHighlight: current.isHighlight });
    } else if (current.kind === 'rect') {
      const rect = normaliseRect(current.start, current.current);
      createRectAnnotation(pageId, rect.origin, rect.widthPt, rect.heightPt);
    } else if (current.kind === 'ellipse') {
      const rect = normaliseRect(current.start, current.current);
      createEllipseAnnotation(pageId, rect.origin, rect.widthPt, rect.heightPt);
    } else if (current.kind === 'line') {
      createLineAnnotation(pageId, current.start, current.current);
    }
  }, [
    createEllipseAnnotation,
    createInkAnnotation,
    createLineAnnotation,
    createRectAnnotation,
    pageId,
    updateDraft,
  ]);

  const beginMove = useCallback(
    (id: AnnotationId, event: React.PointerEvent) => {
      event.stopPropagation();
      const surface = surfaceRef.current;
      if (surface === null) return;

      selectAnnotation(id);

      if (tool !== 'select') return;

      try {
        surface.setPointerCapture(event.pointerId);
      } catch {
        // Same capture caveat as drawing; drag still tracks via move events.
      }
      dragRef.current = {
        id,
        last: clientToPagePoint(event, surface, pageSize),
      };
    },
    [pageSize, selectAnnotation, tool],
  );

  return (
    <div
      ref={surfaceRef}
      className={cn(
        'absolute inset-0 touch-none',
        tool === 'select' ? 'cursor-default' : 'cursor-crosshair',
      )}
      style={{ width: widthPx, height: heightPx, containerType: 'size' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <svg
        viewBox={`0 0 ${pageSize.widthPt} ${pageSize.heightPt}`}
        width={widthPx}
        height={heightPx}
        className="absolute inset-0"
        aria-hidden="true"
      >
        {pageAnnotations.map((annotation) => (
          <AnnotationShape key={annotation.id} annotation={annotation} onBeginMove={beginMove} />
        ))}
        {draft !== null ? <DraftShape draft={draft} color={strokeColor} /> : null}
        {selected !== undefined && selected.type !== 'text' ? (
          <SelectionChrome annotation={selected} />
        ) : null}
      </svg>

      {pageAnnotations.map((annotation) =>
        annotation.type === 'text' ? (
          <TextAnnotationEditor key={annotation.id} annotation={annotation} pageSize={pageSize} />
        ) : null,
      )}

      {tool === 'signature' && pendingSignature !== null ? (
        <p className="bg-surface-raised/90 text-muted pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-control px-3 py-1 text-xs shadow-sm">
          Click the page to place your signature
        </p>
      ) : null}
    </div>
  );
});
