import { siteConfig } from '@/config/site';
import { logger } from '@/utils/commonFunctions/logger';
import { yieldToUi } from '@/utils/commonFunctions/yieldToUi';
import { PdfError } from '../errors';
import type { WriteEditedPdfInput, WrittenPdf } from '../types';
import { drawAnnotations } from './drawAnnotations';
import { loadPdfLibDocument } from './loadPdfLibDocument';
import { mapPdfLibError } from './mapPdfLibError';
import { getFlattenedPagePlacement, normalizeRotationDegrees } from './pagePlacement';
import { loadPdfLib } from './pdfLib';

/**
 * Combines the source file with the edit model into a new PDF.
 *
 * The source bytes are never mutated. Each editor page is flattened onto a
 * fresh unrotated page (source `/Rotate` plus the editor turn baked in) and
 * annotations are drawn in that displayed space. Drawing onto a page that
 * still carries `/Rotate` would double-turn the marks relative to the canvas.
 */
export async function writeEditedPdf(input: WriteEditedPdfInput): Promise<WrittenPdf> {
  const { sourceBytes, pages, annotations } = input;

  if (pages.length === 0) {
    throw new PdfError('export-failed', 'The document has no pages to export');
  }

  const pdfLib = await loadPdfLib();
  const source = await loadPdfLibDocument(sourceBytes);
  const sourcePages = source.getPages();

  try {
    const output = await pdfLib.PDFDocument.create();
    output.setProducer(siteConfig.name);
    output.setCreator(siteConfig.name);

    const font = await output.embedFont(pdfLib.StandardFonts.Helvetica);

    for (let index = 0; index < pages.length; index += 1) {
      const editorPage = pages[index];
      if (editorPage === undefined) continue;

      const sourcePage = sourcePages[editorPage.sourcePageNumber - 1];
      if (sourcePage === undefined) {
        throw new PdfError(
          'export-failed',
          `Source page ${editorPage.sourcePageNumber} is missing`,
        );
      }

      const combinedRotation = normalizeRotationDegrees(
        sourcePage.getRotation().angle + editorPage.rotation,
      );
      const placement = getFlattenedPagePlacement(
        sourcePage.getWidth(),
        sourcePage.getHeight(),
        combinedRotation,
      );

      const embedded = await output.embedPage(sourcePage);
      const page = output.addPage([placement.width, placement.height]);
      page.drawPage(embedded, {
        x: placement.x,
        y: placement.y,
        rotate: pdfLib.degrees(placement.rotateCcw),
      });

      const pageAnnotations = annotations.filter(
        (annotation) => annotation.pageId === editorPage.id,
      );
      drawAnnotations(page, pageAnnotations, placement.height, font, pdfLib);

      logger.debug('export', `flattened page ${index + 1}/${pages.length}`, {
        sourcePageNumber: editorPage.sourcePageNumber,
        editorRotation: editorPage.rotation,
        combinedRotation,
        annotationCount: pageAnnotations.length,
      });

      await yieldToUi();
    }

    const bytes = await output.save({ useObjectStreams: true });
    logger.debug('export', 'wrote edited pdf', {
      pageCount: pages.length,
      byteLength: bytes.byteLength,
    });
    return { bytes };
  } catch (error) {
    throw mapPdfLibError(error, 'export-failed');
  }
}
