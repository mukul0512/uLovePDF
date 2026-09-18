import { RENDER_LIMITS } from '@/constants/limits';
import { logger } from '@/utils/commonFunctions/logger';

export interface CanvasLimits {
  readonly maxDimension: number;
  readonly maxArea: number;
}

/**
 * CSS and WebGL commonly refuse sizes above this. Probing higher would only
 * burn iterations on browsers that already failed at 32767.
 */
const CSS_MAX_DIMENSION = 32767;

/**
 * Largest square we are willing to allocate while probing area. 8192² is
 * 256 MB of RGBA; going to 16384² would spike a gigabyte just to ask a
 * question, which is worse than a conservative answer.
 */
const AREA_SIDE_CANDIDATES = [2048, 4096, 6144, 8192] as const;

const FALLBACK_LIMITS: CanvasLimits = {
  maxDimension: RENDER_LIMITS.fallbackMaxCanvasDimension,
  maxArea: RENDER_LIMITS.fallbackMaxCanvasArea,
};

let cached: CanvasLimits | null = null;

/**
 * Browser canvas ceilings, measured once per tab.
 *
 * Assignment to `canvas.width` can succeed on iOS Safari and still refuse to
 * draw, so we paint a pixel and read it back. The result is cached because
 * the answer does not change for the life of the page and the probe itself
 * allocates.
 */
export function getCanvasLimits(): CanvasLimits {
  if (cached !== null) return cached;

  cached = typeof document === 'undefined' ? FALLBACK_LIMITS : probeCanvasLimits();
  logger.debug('render', 'canvas limits', cached);
  return cached;
}

function probeCanvasLimits(): CanvasLimits {
  const canvas = document.createElement('canvas');

  try {
    if (!canDraw(canvas, 1, 1)) return FALLBACK_LIMITS;

    const maxDimension = highestPassing(1, CSS_MAX_DIMENSION, (size) => canDraw(canvas, size, 1));
    const maxSide = highestSquareSide(canvas, maxDimension);

    return {
      maxDimension,
      maxArea: maxSide * maxSide,
    };
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

function highestSquareSide(canvas: HTMLCanvasElement, maxDimension: number): number {
  let best = 1;

  for (const side of AREA_SIDE_CANDIDATES) {
    if (side > maxDimension) break;
    if (!canDraw(canvas, side, side)) break;
    best = side;
  }

  return best;
}

function highestPassing(
  minimum: number,
  maximum: number,
  test: (value: number) => boolean,
): number {
  let low = minimum;
  let high = maximum;

  while (low < high) {
    const mid = Math.ceil((low + high + 1) / 2);
    if (test(mid)) low = mid;
    else high = mid - 1;
  }

  return low;
}

function canDraw(canvas: HTMLCanvasElement, width: number, height: number): boolean {
  try {
    canvas.width = width;
    canvas.height = height;
  } catch {
    return false;
  }

  if (canvas.width !== width || canvas.height !== height) return false;

  const context = canvas.getContext('2d');
  if (context === null) return false;

  try {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 1, 1);
    return context.getImageData(0, 0, 1, 1).data[0] === 255;
  } catch {
    return false;
  }
}
