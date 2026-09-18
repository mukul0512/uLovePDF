import { RENDER_LIMITS } from '@/constants/limits';

interface QueuedRender {
  readonly isCancelled: () => boolean;
  readonly run: () => Promise<void>;
  readonly resolve: () => void;
  readonly reject: (error: unknown) => void;
}

let activeCount = 0;
const waiting: QueuedRender[] = [];

/**
 * Runs page rasters with a small concurrency cap.
 *
 * pdf.js will happily start one render per thumbnail that just scrolled into
 * view. On a fast flick through a 300-page rail that is dozens of concurrent
 * decode-and-paint jobs, which both stalls the tab and races two paints onto
 * the same canvas. Cancellation still wins: a queued job that was cancelled
 * before it started is skipped rather than drawn.
 */
export function enqueuePageRender(
  isCancelled: () => boolean,
  run: () => Promise<void>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    waiting.push({ isCancelled, run, resolve, reject });
    pumpRenderQueue();
  });
}

function pumpRenderQueue(): void {
  while (activeCount < RENDER_LIMITS.maxConcurrentRenders && waiting.length > 0) {
    const next = waiting.shift();
    if (next === undefined) return;

    if (next.isCancelled()) {
      next.resolve();
      continue;
    }

    activeCount += 1;
    void next
      .run()
      .then(next.resolve, next.reject)
      .finally(() => {
        activeCount -= 1;
        pumpRenderQueue();
      });
  }
}
