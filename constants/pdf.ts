/**
 * Where pdf.js finds its worker and runtime assets.
 *
 * These are copied into `public/pdfjs` by `scripts/copy-pdfjs-assets.mjs`.
 * The trailing slashes are load-bearing: pdf.js concatenates filenames
 * directly onto these strings.
 */
const BASE_PATH = '/pdfjs';

export const PDFJS_ASSETS = {
  /** The parsing worker. Without this, pdf.js falls back to a fake worker
   *  that parses on the main thread and freezes the tab on large files. */
  workerSrc: `${BASE_PATH}/pdf.worker.min.mjs`,
  /** Metrics for the 14 standard fonts, used when a PDF does not embed them. */
  standardFontDataUrl: `${BASE_PATH}/standard_fonts/`,
  /** Character maps for CJK and other non-Latin encodings. */
  cMapUrl: `${BASE_PATH}/cmaps/`,
  /** WebAssembly decoders for JPEG 2000, JBIG2 and colour management. */
  wasmUrl: `${BASE_PATH}/wasm/`,
  /** ICC colour profiles. */
  iccUrl: `${BASE_PATH}/iccs/`,
} as const;
