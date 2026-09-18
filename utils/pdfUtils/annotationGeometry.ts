import type { Annotation, PagePoint } from '@/types/annotation';
import type { PageSizeInPoints } from '@/types/document';

/** Normalises a dragged rectangle so origin is the top-left corner. */
export function normaliseRect(
  a: PagePoint,
  b: PagePoint,
): { origin: PagePoint; widthPt: number; heightPt: number } {
  const left = Math.min(a.xPt, b.xPt);
  const top = Math.min(a.yPt, b.yPt);
  return {
    origin: { xPt: left, yPt: top },
    widthPt: Math.abs(b.xPt - a.xPt),
    heightPt: Math.abs(b.yPt - a.yPt),
  };
}

export function translatePoint(point: PagePoint, dx: number, dy: number): PagePoint {
  return { xPt: point.xPt + dx, yPt: point.yPt + dy };
}

export function translateAnnotation(annotation: Annotation, dx: number, dy: number): Annotation {
  switch (annotation.type) {
    case 'text':
    case 'rectangle':
    case 'ellipse':
    case 'signature':
      return { ...annotation, origin: translatePoint(annotation.origin, dx, dy) };
    case 'ink':
      return {
        ...annotation,
        points: annotation.points.map((point) => translatePoint(point, dx, dy)),
      };
    case 'line':
      return {
        ...annotation,
        start: translatePoint(annotation.start, dx, dy),
        end: translatePoint(annotation.end, dx, dy),
      };
  }
}

/**
 * Rotates a point around the page centre by a quarter turn.
 *
 * Annotations live in the displayed page's coordinate system, so when the
 * page itself turns they have to turn with it or they would detach from the
 * content they mark.
 */
export function rotatePointQuarterTurn(
  point: PagePoint,
  pageSize: PageSizeInPoints,
  quarterTurns: number,
): PagePoint {
  const turns = ((quarterTurns % 4) + 4) % 4;
  if (turns === 0) return point;

  let { xPt, yPt } = point;
  let width = pageSize.widthPt;
  let height = pageSize.heightPt;

  for (let i = 0; i < turns; i += 1) {
    const next = { xPt: height - yPt, yPt: xPt };
    xPt = next.xPt;
    yPt = next.yPt;
    const swapped = width;
    width = height;
    height = swapped;
  }

  return { xPt, yPt };
}

export function rotateAnnotationQuarterTurn(
  annotation: Annotation,
  pageSize: PageSizeInPoints,
  quarterTurns: number,
): Annotation {
  const turns = ((quarterTurns % 4) + 4) % 4;
  if (turns === 0) return annotation;

  const rotate = (point: PagePoint): PagePoint =>
    rotatePointQuarterTurn(point, pageSize, quarterTurns);

  switch (annotation.type) {
    case 'text': {
      // A text box's width stays along the reading axis; after a quarter turn
      // the box's footprint swaps, so width and the default height trade.
      const origin = rotate(annotation.origin);
      const corner = rotate({
        xPt: annotation.origin.xPt + annotation.widthPt,
        yPt: annotation.origin.yPt + annotation.fontSizePt * 1.4,
      });
      const left = Math.min(origin.xPt, corner.xPt);
      const top = Math.min(origin.yPt, corner.yPt);
      const widthPt = Math.abs(corner.xPt - origin.xPt);
      return {
        ...annotation,
        origin: { xPt: left, yPt: top },
        widthPt: Math.max(widthPt, annotation.fontSizePt),
      };
    }
    case 'rectangle':
    case 'ellipse':
    case 'signature': {
      const origin = rotate(annotation.origin);
      const corner = rotate({
        xPt: annotation.origin.xPt + annotation.widthPt,
        yPt: annotation.origin.yPt + annotation.heightPt,
      });
      return {
        ...annotation,
        origin: {
          xPt: Math.min(origin.xPt, corner.xPt),
          yPt: Math.min(origin.yPt, corner.yPt),
        },
        widthPt: Math.abs(corner.xPt - origin.xPt),
        heightPt: Math.abs(corner.yPt - origin.yPt),
      };
    }
    case 'ink':
      return { ...annotation, points: annotation.points.map(rotate) };
    case 'line':
      return { ...annotation, start: rotate(annotation.start), end: rotate(annotation.end) };
  }
}

/** Bounding box used for selection chrome and hit testing of stamps. */
export function getAnnotationBounds(annotation: Annotation): {
  origin: PagePoint;
  widthPt: number;
  heightPt: number;
} {
  switch (annotation.type) {
    case 'text':
      return {
        origin: annotation.origin,
        widthPt: annotation.widthPt,
        heightPt: annotation.fontSizePt * 1.6,
      };
    case 'rectangle':
    case 'ellipse':
    case 'signature':
      return {
        origin: annotation.origin,
        widthPt: annotation.widthPt,
        heightPt: annotation.heightPt,
      };
    case 'line': {
      const left = Math.min(annotation.start.xPt, annotation.end.xPt);
      const top = Math.min(annotation.start.yPt, annotation.end.yPt);
      return {
        origin: { xPt: left, yPt: top },
        widthPt: Math.max(Math.abs(annotation.end.xPt - annotation.start.xPt), 1),
        heightPt: Math.max(Math.abs(annotation.end.yPt - annotation.start.yPt), 1),
      };
    }
    case 'ink': {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const point of annotation.points) {
        minX = Math.min(minX, point.xPt);
        minY = Math.min(minY, point.yPt);
        maxX = Math.max(maxX, point.xPt);
        maxY = Math.max(maxY, point.yPt);
      }
      const pad = annotation.strokeWidthPt;
      return {
        origin: { xPt: minX - pad, yPt: minY - pad },
        widthPt: Math.max(maxX - minX + pad * 2, 1),
        heightPt: Math.max(maxY - minY + pad * 2, 1),
      };
    }
  }
}

export function pointsToSvgPath(points: readonly PagePoint[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  if (first === undefined) return '';
  let path = `M ${first.xPt} ${first.yPt}`;
  for (const point of rest) {
    path += ` L ${point.xPt} ${point.yPt}`;
  }
  return path;
}
