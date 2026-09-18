'use client';

import { useState } from 'react';
import { SignaturePad } from '@/components/editor/SignaturePad';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CursorIcon,
  EllipseIcon,
  FitWidthIcon,
  HighlighterIcon,
  LineIcon,
  PenIcon,
  RectangleIcon,
  RedoIcon,
  RotateCounterClockwiseIcon,
  RotateIcon,
  SignatureIcon,
  TrashIcon,
  TypeIcon,
  UndoIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@/components/ui/icon/icons';
import { ANNOTATION_COLORS, ANNOTATION_TOOL_LABELS } from '@/constants/annotations';
import { ZOOM_LIMITS } from '@/constants/limits';
import { useEditorStore } from '@/store/editorStore';
import type { AnnotationTool } from '@/types/annotation';
import { cn } from '@/utils/commonFunctions/cn';

function ToolbarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  // Grouping is announced rather than purely visual, so the controls are
  // navigable as "zoom" and "page" clusters instead of one flat run.
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1">
      {children}
    </div>
  );
}

const DRAW_TOOLS: readonly AnnotationTool[] = [
  'select',
  'text',
  'draw',
  'highlight',
  'rectangle',
  'ellipse',
  'line',
  'signature',
];

const TOOL_ICONS: Record<AnnotationTool, typeof CursorIcon> = {
  select: CursorIcon,
  text: TypeIcon,
  draw: PenIcon,
  highlight: HighlighterIcon,
  rectangle: RectangleIcon,
  ellipse: EllipseIcon,
  line: LineIcon,
  signature: SignatureIcon,
};

export function EditorToolbar() {
  const pages = useEditorStore((state) => state.pages);
  const currentPageId = useEditorStore((state) => state.currentPageId);
  const zoom = useEditorStore((state) => state.zoom);
  const isFitWidth = useEditorStore((state) => state.isFitWidth);
  const tool = useEditorStore((state) => state.tool);
  const strokeColor = useEditorStore((state) => state.strokeColor);
  const selectedAnnotationId = useEditorStore((state) => state.selectedAnnotationId);
  const past = useEditorStore((state) => state.past);
  const future = useEditorStore((state) => state.future);

  const stepZoom = useEditorStore((state) => state.stepZoom);
  const setZoom = useEditorStore((state) => state.setZoom);
  const enableFitWidth = useEditorStore((state) => state.enableFitWidth);
  const rotatePage = useEditorStore((state) => state.rotatePage);
  const deletePage = useEditorStore((state) => state.deletePage);
  const movePage = useEditorStore((state) => state.movePage);
  const setTool = useEditorStore((state) => state.setTool);
  const setStrokeColor = useEditorStore((state) => state.setStrokeColor);
  const deleteAnnotation = useEditorStore((state) => state.deleteAnnotation);
  const setPendingSignature = useEditorStore((state) => state.setPendingSignature);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);

  const index = pages.findIndex((page) => page.id === currentPageId);
  const hasPage = currentPageId !== null && index !== -1;

  const handleToolClick = (next: AnnotationTool): void => {
    if (next === 'signature') {
      setIsSignaturePadOpen(true);
      return;
    }
    setTool(next);
  };

  const lastUndo = past[past.length - 1];
  const lastRedo = future[future.length - 1];

  return (
    <>
      <div className="border-line flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-3 py-2">
        <ToolbarGroup label="History">
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            aria-label={lastUndo === undefined ? 'Undo' : `Undo ${lastUndo.label}`}
            aria-keyshortcuts="Control+Z Meta+Z"
            disabled={lastUndo === undefined}
            onClick={undo}
          >
            <UndoIcon size="sm" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            aria-label={lastRedo === undefined ? 'Redo' : `Redo ${lastRedo.label}`}
            aria-keyshortcuts="Control+Y Meta+Shift+Z"
            disabled={lastRedo === undefined}
            onClick={redo}
          >
            <RedoIcon size="sm" />
          </Button>
        </ToolbarGroup>

        <ToolbarGroup label="Annotate">
          {DRAW_TOOLS.map((candidate) => {
            const Icon = TOOL_ICONS[candidate];
            const isActive =
              tool === candidate || (candidate === 'signature' && isSignaturePadOpen);
            return (
              <Button
                key={candidate}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                className="px-2"
                aria-label={ANNOTATION_TOOL_LABELS[candidate]}
                aria-pressed={isActive}
                onClick={() => handleToolClick(candidate)}
              >
                <Icon size="sm" />
              </Button>
            );
          })}
        </ToolbarGroup>

        <ToolbarGroup label="Colour">
          {ANNOTATION_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Colour ${color}`}
              aria-pressed={strokeColor === color}
              onClick={() => setStrokeColor(color)}
              className={cn(
                'rounded-control size-6 border-2 transition-transform',
                strokeColor === color
                  ? 'border-foreground scale-110'
                  : 'border-transparent hover:scale-105',
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </ToolbarGroup>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Delete annotation"
          disabled={selectedAnnotationId === null}
          onClick={() => selectedAnnotationId !== null && deleteAnnotation(selectedAnnotationId)}
        >
          <TrashIcon size="sm" />
          Annotation
        </Button>

        <ToolbarGroup label="Zoom">
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            aria-label="Zoom out"
            disabled={zoom <= ZOOM_LIMITS.min}
            onClick={() => stepZoom(-1)}
          >
            <ZoomOutIcon size="sm" />
          </Button>

          <span role="status" className="text-muted w-14 text-center text-sm tabular-nums">
            {Math.round(zoom * 100)}%
          </span>

          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            aria-label="Zoom in"
            disabled={zoom >= ZOOM_LIMITS.max}
            onClick={() => stepZoom(1)}
          >
            <ZoomInIcon size="sm" />
          </Button>

          <Button
            variant={isFitWidth ? 'secondary' : 'ghost'}
            size="sm"
            className="px-2"
            aria-label="Fit page to width"
            aria-pressed={isFitWidth}
            onClick={enableFitWidth}
          >
            <FitWidthIcon size="sm" />
          </Button>

          <Button variant="ghost" size="sm" onClick={() => setZoom(1)}>
            Actual size
          </Button>
        </ToolbarGroup>

        <ToolbarGroup label="Rotate page">
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            aria-label="Rotate page anticlockwise"
            disabled={!hasPage}
            onClick={() => currentPageId !== null && rotatePage(currentPageId, -1)}
          >
            <RotateCounterClockwiseIcon size="sm" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            aria-label="Rotate page clockwise"
            disabled={!hasPage}
            onClick={() => currentPageId !== null && rotatePage(currentPageId, 1)}
          >
            <RotateIcon size="sm" />
          </Button>
        </ToolbarGroup>

        <ToolbarGroup label="Reorder page">
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            aria-label="Move page earlier"
            disabled={!hasPage || index === 0}
            onClick={() => currentPageId !== null && movePage(currentPageId, -1)}
          >
            <ChevronLeftIcon size="sm" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            aria-label="Move page later"
            disabled={!hasPage || index === pages.length - 1}
            onClick={() => currentPageId !== null && movePage(currentPageId, 1)}
          >
            <ChevronRightIcon size="sm" />
          </Button>
        </ToolbarGroup>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Delete page"
          disabled={!hasPage || pages.length <= 1}
          onClick={() => currentPageId !== null && deletePage(currentPageId)}
        >
          <TrashIcon size="sm" />
          Page
        </Button>

        <p className="text-muted ml-auto text-sm tabular-nums">
          Page {hasPage ? index + 1 : '–'} of {pages.length}
        </p>
      </div>

      {isSignaturePadOpen ? (
        <SignaturePad
          color={strokeColor}
          onCancel={() => {
            setIsSignaturePadOpen(false);
            setPendingSignature(null);
            setTool('select');
          }}
          onConfirm={(result) => {
            setPendingSignature(result);
            setIsSignaturePadOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
