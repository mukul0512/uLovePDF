/**
 * The legacy pdf.js build ships without its own type declarations, but its
 * API is identical to the modern entry point — it differs only in transpilation
 * target and bundled polyfills. Re-exporting the published types keeps the
 * engine fully typed against the build we actually load.
 */
declare module 'pdfjs-dist/legacy/build/pdf.mjs' {
  export * from 'pdfjs-dist';
}
