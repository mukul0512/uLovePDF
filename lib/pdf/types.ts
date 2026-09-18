import type { Annotation } from '@/types/annotation';
import type { PageSizeInPoints, RotationDegrees } from '@/types/document';
import type { EditorPage } from '@/types/editor';

export interface RenderPageOptions {
  /** One-based, matching how PDFs number their own pages. */
  readonly pageNumber: number;
  readonly canvas: HTMLCanvasElement;
  /**
   * How wide the page should appear, in CSS pixels, *after* rotation. A
   * quarter-turned page is measured across its rotated width, so callers do
   * not have to swap dimensions themselves.
   */
  readonly targetWidthPx: number;
  /** Added to the page's own `/Rotate` entry rather than replacing it. */
  readonly rotationDegrees?: RotationDegrees | undefined;
}

/**
 * A render in progress.
 *
 * Cancellation is part of the contract rather than an afterthought, because
 * rendering is slow enough that a user can always outrun it. Paging quickly
 * through a document starts renders faster than they finish, and pdf.js
 * refuses to draw twice onto the same canvas concurrently.
 */
export interface PdfRenderHandle {
  readonly completed: Promise<void>;
  cancel(): void;
}

/**
 * An open document, described without reference to any particular library.
 *
 * The underlying engine handle is deliberately not exposed. Callers get
 * methods, not a `PDFDocumentProxy`, so the UI layer cannot grow a quiet
 * dependency on pdf.js internals that would block ever replacing it.
 */
export interface LoadedPdfDocument {
  readonly pageCount: number;
  /** From document metadata, which most PDFs leave unset. */
  readonly title: string | null;
  getPageSize(pageNumber: number): Promise<PageSizeInPoints>;
  renderPage(options: RenderPageOptions): PdfRenderHandle;
  /** Frees the worker's memory. Not optional: skipping it leaks megabytes. */
  destroy(): Promise<void>;
}

/** Bytes of a PDF we just wrote. */
export interface WrittenPdf {
  readonly bytes: Uint8Array;
}

export interface WriteEditedPdfInput {
  readonly sourceBytes: Uint8Array;
  readonly pages: readonly EditorPage[];
  readonly annotations: readonly Annotation[];
}

export interface CompressPdfResult {
  readonly bytes: Uint8Array;
  readonly originalByteLength: number;
  readonly compressedByteLength: number;
}
