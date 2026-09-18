import type * as PdfLibNamespace from 'pdf-lib';
import { logger } from '@/utils/commonFunctions/logger';

export type PdfLibModule = typeof PdfLibNamespace;

let modulePromise: Promise<PdfLibModule> | null = null;

/**
 * Loads pdf-lib, once.
 *
 * The import is dynamic so the write engine stays out of the initial payload
 * of every page. Preview-only visits (the tool-page thumbnail) should not pay
 * for a library they will never call.
 *
 * The promise is cached rather than the module, so concurrent export clicks
 * during the first load share one import instead of racing.
 */
export function loadPdfLib(): Promise<PdfLibModule> {
  modulePromise ??= import('pdf-lib').then((pdfLib) => {
    logger.debug('pdf', 'pdf-lib loaded');
    return pdfLib;
  });

  return modulePromise;
}
