import { siteConfig } from '@/config/site';
import type { RotationDegrees } from '@/types/document';
import { logger } from '@/utils/commonFunctions/logger';
import { yieldToUi } from '@/utils/commonFunctions/yieldToUi';
import { PdfError } from '../errors';
import type { CompressPdfResult, WrittenPdf } from '../types';
import { loadPdfLibDocument } from './loadPdfLibDocument';
import { mapPdfLibError } from './mapPdfLibError';
import { normalizeRotationDegrees } from './pagePlacement';
import { loadPdfLib } from './pdfLib';

async function saveDocument(bytesWriter: () => Promise<Uint8Array>): Promise<Uint8Array> {
  try {
    return await bytesWriter();
  } catch (error) {
    throw mapPdfLibError(error, 'export-failed');
  }
}

/**
 * Concatenates PDFs in the given order by copying pages, not re-encoding them.
 */
export async function mergePdfs(files: readonly Uint8Array[]): Promise<WrittenPdf> {
  if (files.length < 2) {
    throw new PdfError('export-failed', 'Merge needs at least two files');
  }

  const pdfLib = await loadPdfLib();

  const bytes = await saveDocument(async () => {
    const output = await pdfLib.PDFDocument.create();
    output.setProducer(siteConfig.name);
    output.setCreator(siteConfig.name);

    for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
      const fileBytes = files[fileIndex];
      if (fileBytes === undefined) continue;

      const source = await loadPdfLibDocument(fileBytes);
      const indices = source.getPageIndices();
      const copied = await output.copyPages(source, indices);
      for (const page of copied) {
        output.addPage(page);
      }

      logger.debug('export', `merged file ${fileIndex + 1}/${files.length}`, {
        pageCount: indices.length,
      });
      await yieldToUi();
    }

    return output.save({ useObjectStreams: true });
  });

  logger.debug('export', 'wrote merged pdf', { byteLength: bytes.byteLength });
  return { bytes };
}

/**
 * Writes one PDF per page, preserving each page's original size and `/Rotate`.
 */
export async function splitPdfByPage(sourceBytes: Uint8Array): Promise<readonly WrittenPdf[]> {
  const pdfLib = await loadPdfLib();
  const source = await loadPdfLibDocument(sourceBytes);
  const indices = source.getPageIndices();

  const parts: WrittenPdf[] = [];

  try {
    for (const pageIndex of indices) {
      const output = await pdfLib.PDFDocument.create();
      output.setProducer(siteConfig.name);
      output.setCreator(siteConfig.name);
      const [copied] = await output.copyPages(source, [pageIndex]);
      if (copied === undefined) continue;
      output.addPage(copied);
      const bytes = await output.save({ useObjectStreams: true });
      parts.push({ bytes });
      await yieldToUi();
    }
  } catch (error) {
    throw mapPdfLibError(error, 'export-failed');
  }

  logger.debug('export', 'split pdf', { partCount: parts.length });
  return parts;
}

/**
 * Adds a clockwise turn to every page's `/Rotate` entry.
 *
 * The content stream is not rewritten, so the file size stays essentially the
 * same. That is the whole point of this tool relative to the editor export,
 * which flattens rotation so annotations stay glued to the page.
 */
export async function rotatePdfPages(
  sourceBytes: Uint8Array,
  clockwiseDegrees: RotationDegrees,
): Promise<WrittenPdf> {
  const pdfLib = await loadPdfLib();
  const source = await loadPdfLibDocument(sourceBytes);

  const bytes = await saveDocument(async () => {
    for (const page of source.getPages()) {
      const next = normalizeRotationDegrees(page.getRotation().angle + clockwiseDegrees);
      page.setRotation(pdfLib.degrees(next));
    }
    await yieldToUi();
    return source.save({ useObjectStreams: true });
  });

  logger.debug('export', 'rotated pdf', {
    clockwiseDegrees,
    byteLength: bytes.byteLength,
  });
  return { bytes };
}

/**
 * Re-saves the document with object streams.
 *
 * This is not Ghostscript. Images are not downsampled and fonts are not
 * re-subset. Text-only files often stay the same size; the UI shows both
 * lengths so the user can decide whether to keep the result.
 */
export async function compressPdf(sourceBytes: Uint8Array): Promise<CompressPdfResult> {
  const source = await loadPdfLibDocument(sourceBytes);

  const bytes = await saveDocument(async () => {
    await yieldToUi();
    return source.save({ useObjectStreams: true });
  });

  logger.debug('export', 'compressed pdf', {
    originalByteLength: sourceBytes.byteLength,
    compressedByteLength: bytes.byteLength,
  });

  return {
    bytes,
    originalByteLength: sourceBytes.byteLength,
    compressedByteLength: bytes.byteLength,
  };
}
