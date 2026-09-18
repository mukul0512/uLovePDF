import type * as PdfjsNamespace from 'pdfjs-dist';
import { PDFJS_ASSETS } from '@/constants/pdf';
import { logger } from '@/utils/commonFunctions/logger';

type PdfjsModule = typeof PdfjsNamespace;

let modulePromise: Promise<PdfjsModule> | null = null;

/**
 * Loads and configures pdf.js, once.
 *
 * We load the **legacy** build deliberately. The default build of pdf.js 6.3
 * calls `Map.prototype.getOrInsertComputed`, a 2025 TC39 addition that even
 * Chrome 144 does not have; on anything older the library throws a
 * `TypeError` during parsing that surfaces as "this file could not be
 * opened". The legacy build is the same code with the polyfills included.
 * It costs roughly 60 KB more and supports browsers people actually run.
 *
 * The import is dynamic so the library lands in its own chunk. That keeps
 * around 500 KB out of the initial payload of every tool page, and defers
 * the cost to the moment someone actually opens a file.
 *
 * The promise is cached rather than the module, so concurrent callers during
 * the first load share one import instead of racing to configure the worker.
 */
export function loadPdfjs(): Promise<PdfjsModule> {
  modulePromise ??= import('pdfjs-dist/legacy/build/pdf.mjs').then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_ASSETS.workerSrc;
    logger.debug('pdf', 'pdf.js loaded', { workerSrc: PDFJS_ASSETS.workerSrc });
    return pdfjs;
  });

  return modulePromise;
}
