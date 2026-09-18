'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { PagePoint } from '@/types/annotation';
import { ANNOTATION_DEFAULTS } from '@/constants/annotations';
import { pointsToSvgPath } from '@/utils/pdfUtils/annotationGeometry';

const PAD_WIDTH = 480;
const PAD_HEIGHT = 180;

interface SignaturePadProps {
  color: string;
  onCancel: () => void;
  onConfirm: (result: {
    points: readonly PagePoint[];
    sourceWidth: number;
    sourceHeight: number;
  }) => void;
}

/**
 * Captures a signature as a vector path, not a bitmap.
 *
 * A PNG would look soft when stamped at a different size and would bloat the
 * exported PDF. Keeping the stroke as points means export can write it as a
 * PDF path at whatever resolution the page needs.
 */
export function SignaturePad({ color, onCancel, onConfirm }: SignaturePadProps) {
  const titleId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState<readonly PagePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const toPadPoint = useCallback((event: React.PointerEvent<SVGSVGElement>): PagePoint | null => {
    const svg = svgRef.current;
    if (svg === null) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      xPt: ((event.clientX - rect.left) / rect.width) * PAD_WIDTH,
      yPt: ((event.clientY - rect.top) / rect.height) * PAD_HEIGHT,
    };
  }, []);

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = toPadPoint(event);
    if (point === null) return;
    setIsDrawing(true);
    setPoints([point]);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>): void => {
    if (!isDrawing) return;
    const point = toPadPoint(event);
    if (point === null) return;
    setPoints((current) => [...current, point]);
  };

  const handlePointerUp = (): void => {
    setIsDrawing(false);
  };

  const canSave = points.length >= ANNOTATION_DEFAULTS.minInkPoints;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="border-line bg-surface-raised rounded-card w-full max-w-lg border p-4 shadow-lg"
      >
        <h2 id={titleId} className="text-lg font-semibold tracking-tight">
          Draw your signature
        </h2>
        <p className="text-muted mt-1 text-sm">
          Sign with your pointer or finger. The stroke is kept as a vector so it stays sharp when
          stamped.
        </p>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${PAD_WIDTH} ${PAD_HEIGHT}`}
          className="border-line mt-4 h-44 w-full touch-none rounded-control border bg-white"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <line
            x1="24"
            y1={PAD_HEIGHT - 36}
            x2={PAD_WIDTH - 24}
            y2={PAD_HEIGHT - 36}
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeDasharray="4 4"
          />
          {points.length > 0 ? (
            <path
              d={pointsToSvgPath(points)}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </svg>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPoints([])}
            disabled={points.length === 0}
          >
            Clear
          </Button>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!canSave}
            onClick={() =>
              onConfirm({
                points,
                sourceWidth: PAD_WIDTH,
                sourceHeight: PAD_HEIGHT,
              })
            }
          >
            Use signature
          </Button>
        </div>
      </div>
    </div>
  );
}
