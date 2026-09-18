'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { LoadedPdfDocument } from '@/lib/pdf';

const PdfDocumentContext = createContext<LoadedPdfDocument | null>(null);

/**
 * Carries the open document to the editor tree.
 *
 * This deliberately does not live in the Zustand store. The store holds a
 * plain, serialisable description of the edit — page order and rotations —
 * which is what makes undo possible: you can replay it.
 * A `LoadedPdfDocument` is the opposite of that. It owns worker memory,
 * has a disposal lifecycle, and cannot be snapshotted or replayed.
 *
 * Context is the right tool here precisely because the value changes once
 * per document rather than per interaction, so the re-render cost that
 * makes context a poor fit for editor state does not arise.
 */
export function PdfDocumentProvider({
  document,
  children,
}: {
  document: LoadedPdfDocument;
  children: ReactNode;
}) {
  return <PdfDocumentContext.Provider value={document}>{children}</PdfDocumentContext.Provider>;
}

export function useOpenPdfDocument(): LoadedPdfDocument {
  const document = useContext(PdfDocumentContext);

  if (document === null) {
    throw new Error('useOpenPdfDocument must be used inside a PdfDocumentProvider');
  }

  return document;
}
