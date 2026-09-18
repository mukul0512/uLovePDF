/**
 * The public PDF surface.
 *
 * Everything outside `lib/pdf` imports from here and nowhere else. ESLint
 * enforces that: `@/lib/pdf/engine/*` and `pdfjs-dist` are both off limits to
 * `app/`, `components/` and `hooks/`.
 */
export { PdfError, type PdfErrorCode } from './errors';
export { loadPdfDocument } from './engine/loadPdfDocument';
export { writeEditedPdf } from './engine/writeEditedPdf';
export { compressPdf, mergePdfs, rotatePdfPages, splitPdfByPage } from './engine/writeToolPdf';
export type {
  CompressPdfResult,
  LoadedPdfDocument,
  PdfRenderHandle,
  RenderPageOptions,
  WriteEditedPdfInput,
  WrittenPdf,
} from './types';
