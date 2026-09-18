import type { PDFDocument } from 'pdf-lib';
import { mapPdfLibError } from './mapPdfLibError';
import { loadPdfLib } from './pdfLib';

/** Opens bytes with pdf-lib, mapping encryption and parse failures. */
export async function loadPdfLibDocument(bytes: Uint8Array): Promise<PDFDocument> {
  const { PDFDocument } = await loadPdfLib();

  try {
    return await PDFDocument.load(bytes);
  } catch (error) {
    throw mapPdfLibError(error, 'corrupt');
  }
}
