/**
 * Scoped debug logging that disappears from production bundles.
 *
 * `process.env.NODE_ENV` is statically replaced at build time, so `IS_DEBUG`
 * folds to `false` and the minifier removes these call sites entirely. That
 * lets us instrument the PDF pipeline heavily without shipping noise -- or
 * leaking document details -- to real users.
 *
 * Warnings and errors are intentionally always active: they surface genuine
 * failures that support needs to see.
 */

const IS_DEBUG = process.env.NODE_ENV !== 'production';

/** Areas of the app, so console output can be filtered while debugging. */
export type LogScope = 'app' | 'upload' | 'pdf' | 'render' | 'editor' | 'export' | 'worker';

const format = (scope: LogScope, message: string): string => `[recto:${scope}] ${message}`;

export const logger = {
  debug(scope: LogScope, message: string, ...details: readonly unknown[]): void {
    if (!IS_DEBUG) return;
    console.debug(format(scope, message), ...details);
  },

  warn(scope: LogScope, message: string, ...details: readonly unknown[]): void {
    console.warn(format(scope, message), ...details);
  },

  error(scope: LogScope, message: string, ...details: readonly unknown[]): void {
    console.error(format(scope, message), ...details);
  },

  /**
   * Measures an async operation and logs its duration in debug builds.
   *
   * PDF parsing, rendering and export are the operations most likely to feel
   * slow, and guessing at where time goes is how performance work stalls.
   */
  async time<TResult>(
    scope: LogScope,
    label: string,
    operation: () => Promise<TResult>,
  ): Promise<TResult> {
    if (!IS_DEBUG) return operation();

    const startedAt = performance.now();
    try {
      return await operation();
    } finally {
      const elapsedMs = performance.now() - startedAt;
      console.debug(format(scope, `${label} took ${elapsedMs.toFixed(1)}ms`));
    }
  },
} as const;
