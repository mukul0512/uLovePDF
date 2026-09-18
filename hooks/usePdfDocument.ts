'use client';

import { useEffect, useState } from 'react';
import { loadPdfDocument, PdfError, type LoadedPdfDocument } from '@/lib/pdf';
import { logger } from '@/utils/commonFunctions/logger';

/**
 * Modelled as a discriminated union so impossible combinations cannot be
 * represented. `document` is non-null exactly when the status is `ready`,
 * which the compiler then enforces at every call site.
 */
export type PdfDocumentState =
  | { readonly status: 'idle'; readonly document: null; readonly error: null }
  | { readonly status: 'loading'; readonly document: null; readonly error: null }
  | { readonly status: 'ready'; readonly document: LoadedPdfDocument; readonly error: null }
  | { readonly status: 'error'; readonly document: null; readonly error: PdfError };

const IDLE: PdfDocumentState = { status: 'idle', document: null, error: null };
const LOADING: PdfDocumentState = { status: 'loading', document: null, error: null };

/**
 * Opens a file as a PDF and keeps its lifetime tied to the component.
 *
 * The tricky part is not loading, it is disposal. An open document holds
 * memory in the pdf.js worker that garbage collection will never reclaim on
 * its own, so every path out of this effect has to call `destroy()`. There
 * are two: the document may resolve after the component has moved on, or it
 * may still be loading when the effect is torn down. The `isCurrent` flag
 * covers the first and the closure over `opened` covers the second.
 */
export function usePdfDocument(file: File | null): PdfDocumentState {
  const [state, setState] = useState<PdfDocumentState>(IDLE);
  const [loadedFile, setLoadedFile] = useState<File | null>(null);

  // Reset synchronously when the file identity changes. Doing this in an
  // effect would cascade a second render; adjusting during render is the
  // pattern React recommends for "state that follows a prop".
  if (file !== loadedFile) {
    setLoadedFile(file);
    setState(file === null ? IDLE : LOADING);
  }

  useEffect(() => {
    if (file === null) return;

    let isCurrent = true;
    let opened: LoadedPdfDocument | null = null;

    void loadPdfDocument(file)
      .then((document) => {
        opened = document;

        // The user switched files while this was parsing. Nothing will ever
        // render it, so close it immediately rather than leaking the worker.
        if (!isCurrent) {
          void document.destroy();
          return;
        }

        setState({ status: 'ready', document, error: null });
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;

        const pdfError =
          error instanceof PdfError
            ? error
            : new PdfError('load-failed', 'Unexpected failure while opening', { cause: error });

        logger.warn('pdf', `could not open "${file.name}"`, pdfError.code, pdfError.cause);
        setState({ status: 'error', document: null, error: pdfError });
      });

    return () => {
      isCurrent = false;
      if (opened !== null) void opened.destroy();
    };
  }, [file]);

  return state;
}
