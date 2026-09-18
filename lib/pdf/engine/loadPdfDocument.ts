import { RENDER_LIMITS } from '@/constants/limits';
import { PDFJS_ASSETS } from '@/constants/pdf';
import type { PageSizeInPoints } from '@/types/document';
import { logger } from '@/utils/commonFunctions/logger';
import { getCanvasLimits } from '@/utils/pdfUtils/canvasLimits';
import { PdfError } from '../errors';
import type { LoadedPdfDocument, PdfRenderHandle, RenderPageOptions } from '../types';
import { loadPdfjs } from './pdfjs';
import { enqueuePageRender } from './renderQueue';

const getErrorName = (error: unknown): string =>
  typeof error === 'object' && error !== null && 'name' in error
    ? String((error as { name: unknown }).name)
    : '';

/** Translates pdf.js exceptions into our own vocabulary. */
function toPdfError(error: unknown): PdfError {
  if (error instanceof PdfError) return error;

  switch (getErrorName(error)) {
    case 'PasswordException':
      return new PdfError('password-protected', 'The document requires a password', {
        cause: error,
      });
    case 'InvalidPDFException':
      return new PdfError('corrupt', 'The document structure is invalid', { cause: error });
    default:
      return new PdfError('load-failed', 'The document could not be opened', { cause: error });
  }
}

/**
 * Picks a render scale that the browser can actually allocate.
 *
 * Canvas limits are a real ceiling, not a guideline: exceeding them does not
 * throw, it silently yields a blank canvas, which is far harder to diagnose.
 * Both constraints matter independently — a long narrow page can pass the
 * area check while busting the per-side limit.
 */
function resolveRenderScale(widthPt: number, heightPt: number, desiredScale: number): number {
  const { maxDimension, maxArea } = getCanvasLimits();
  const byDimension = Math.min(maxDimension / widthPt, maxDimension / heightPt);
  const byArea = Math.sqrt(maxArea / (widthPt * heightPt));
  const allowed = Math.min(desiredScale, byDimension, byArea);

  if (allowed < desiredScale) {
    logger.debug(
      'render',
      `scale capped ${desiredScale.toFixed(2)} to ${allowed.toFixed(2)} by canvas limits`,
    );
  }

  return Math.max(allowed, 0.01);
}

/**
 * Opens a PDF from a local file.
 *
 * This is the first point where the whole file is read into memory. Up to
 * now we have only held a lazy `File` handle; pdf.js needs the bytes, so a
 * 200 MB document costs 200 MB here. Note also that pdf.js *transfers* the
 * buffer to its worker rather than copying it, which detaches it on this
 * side — the local `bytes` array must not be touched afterwards.
 */
export async function loadPdfDocument(file: File): Promise<LoadedPdfDocument> {
  const pdfjs = await loadPdfjs();
  getCanvasLimits();

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());

    const task = pdfjs.getDocument({
      data: bytes,
      cMapUrl: PDFJS_ASSETS.cMapUrl,
      cMapPacked: true,
      standardFontDataUrl: PDFJS_ASSETS.standardFontDataUrl,
      wasmUrl: PDFJS_ASSETS.wasmUrl,
      iccUrl: PDFJS_ASSETS.iccUrl,
    });

    const proxy = await task.promise;

    // Most PDFs leave Title unset, and some set it to the authoring tool's
    // placeholder, so this is a hint rather than something to rely on.
    const metadata = await proxy.getMetadata().catch(() => null);
    const rawTitle = (metadata?.info as { Title?: unknown } | undefined)?.Title;
    const title = typeof rawTitle === 'string' && rawTitle.trim() !== '' ? rawTitle.trim() : null;

    logger.debug('pdf', `opened "${file.name}"`, { pageCount: proxy.numPages, title });

    return {
      pageCount: proxy.numPages,
      title,

      async getPageSize(pageNumber: number): Promise<PageSizeInPoints> {
        const page = await proxy.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        page.cleanup();
        return { widthPt: viewport.width, heightPt: viewport.height };
      },

      renderPage({
        pageNumber,
        canvas,
        targetWidthPx,
        rotationDegrees = 0,
      }: RenderPageOptions): PdfRenderHandle {
        let isCancelled = false;
        let cancelActiveRender: (() => void) | null = null;

        const completed = enqueuePageRender(
          () => isCancelled,
          async (): Promise<void> => {
            const page = await proxy.getPage(pageNumber);
            if (isCancelled) {
              page.cleanup();
              return;
            }

            // pdf.js treats `rotation` as absolute, so the page's own value
            // has to be folded in or a document that is already landscape
            // would be straightened the moment the user rotates it.
            const rotation = (page.rotate + rotationDegrees) % 360;
            const unscaled = page.getViewport({ scale: 1, rotation });
            const cssScale = targetWidthPx / unscaled.width;
            // Retina screens would otherwise quadruple the pixel count, and
            // beyond 2x the difference is not worth the memory.
            const pixelRatio = Math.min(
              globalThis.devicePixelRatio || 1,
              RENDER_LIMITS.maxDevicePixelRatio,
            );
            const scale = resolveRenderScale(
              unscaled.width,
              unscaled.height,
              cssScale * pixelRatio,
            );
            const viewport = page.getViewport({ scale, rotation });

            // The backing store is sized in device pixels while CSS keeps the
            // element at layout size. That separation is what makes the page
            // sharp on a high-density screen instead of upscaled and soft.
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            canvas.style.width = `${Math.round(unscaled.width * cssScale)}px`;
            canvas.style.height = `${Math.round(unscaled.height * cssScale)}px`;

            const renderTask = page.render({ canvas, viewport });
            cancelActiveRender = () => renderTask.cancel();

            try {
              await renderTask.promise;
            } catch (error) {
              // Cancelling is a normal control-flow event here, not a failure.
              if (getErrorName(error) === 'RenderingCancelledException') return;
              throw toPdfError(error);
            } finally {
              page.cleanup();
            }
          },
        );

        return {
          completed,
          cancel() {
            isCancelled = true;
            cancelActiveRender?.();
          },
        };
      },

      async destroy(): Promise<void> {
        logger.debug('pdf', `closing "${file.name}"`);
        // Disposal goes through the loading task, not the document proxy.
        // `proxy.cleanup()` looks like the right call but only drops cached
        // fonts; the worker and its copy of the file would survive it.
        await task.destroy();
      },
    };
  } catch (error) {
    throw toPdfError(error);
  }
}
