import type { PDFFont, PDFPage } from 'pdf-lib';
import type { Annotation, PagePoint } from '@/types/annotation';
import { pointsToSvgPath } from '@/utils/pdfUtils/annotationGeometry';
import { hexToRgb01 } from './hexColor';
import type { PdfLibModule } from './pdfLib';

/**
 * Helvetica (WinAnsi) cannot encode every Unicode character. Anything outside
 * the Latin-1 block becomes `?` rather than aborting the whole export.
 */
function toWinAnsi(text: string): string {
  let result = '';
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code === 9) {
      result += '  ';
    } else if (code >= 32 && code <= 126) {
      result += char;
    } else if (code >= 160 && code <= 255) {
      result += char;
    } else {
      result += '?';
    }
  }
  return result;
}

function toPdfY(pageHeight: number, yDown: number): number {
  return pageHeight - yDown;
}

function strokeRgb(pdfLib: PdfLibModule, hex: string) {
  return pdfLib.rgb(...hexToRgb01(hex));
}

function drawInkPath(
  page: PDFPage,
  points: readonly PagePoint[],
  pageHeight: number,
  color: string,
  strokeWidthPt: number,
  opacity: number,
  pdfLib: PdfLibModule,
): void {
  const path = pointsToSvgPath(points);
  if (path === '') return;

  // drawSvgPath flips Y (SVG down → PDF up) around `y`, so placing it at the
  // top of the page makes our top-left page-point path land correctly.
  page.drawSvgPath(path, {
    x: 0,
    y: pageHeight,
    borderColor: strokeRgb(pdfLib, color),
    borderWidth: strokeWidthPt,
    borderOpacity: opacity,
    borderLineCap: pdfLib.LineCapStyle.Round,
  });
}

/**
 * Paints overlay annotations onto a flattened, unrotated PDF page.
 *
 * Geometry in the edit model is top-left, Y-down, in displayed page points.
 * PDF user space is bottom-left, Y-up. Conversion happens here and nowhere
 * else, so a missed flip cannot silently apply twice.
 */
export function drawAnnotations(
  page: PDFPage,
  annotations: readonly Annotation[],
  pageHeight: number,
  font: PDFFont,
  pdfLib: PdfLibModule,
): void {
  for (const annotation of annotations) {
    switch (annotation.type) {
      case 'text': {
        const lines = annotation.text.split(/\r?\n/);
        const lineHeight = annotation.fontSizePt * 1.25;
        const color = strokeRgb(pdfLib, annotation.color);
        lines.forEach((line, index) => {
          const drawn = toWinAnsi(line);
          if (drawn.trim() === '') return;
          page.drawText(drawn, {
            x: annotation.origin.xPt,
            y:
              toPdfY(pageHeight, annotation.origin.yPt) -
              annotation.fontSizePt -
              index * lineHeight,
            size: annotation.fontSizePt,
            font,
            color,
            maxWidth: annotation.widthPt,
          });
        });
        break;
      }
      case 'ink':
        drawInkPath(
          page,
          annotation.points,
          pageHeight,
          annotation.color,
          annotation.strokeWidthPt,
          annotation.opacity,
          pdfLib,
        );
        break;
      case 'rectangle': {
        const color = strokeRgb(pdfLib, annotation.color);
        page.drawRectangle({
          x: annotation.origin.xPt,
          y: toPdfY(pageHeight, annotation.origin.yPt + annotation.heightPt),
          width: annotation.widthPt,
          height: annotation.heightPt,
          borderColor: color,
          borderWidth: annotation.strokeWidthPt,
          ...(annotation.fill === null ? {} : { color: strokeRgb(pdfLib, annotation.fill) }),
        });
        break;
      }
      case 'ellipse': {
        const color = strokeRgb(pdfLib, annotation.color);
        page.drawEllipse({
          x: annotation.origin.xPt + annotation.widthPt / 2,
          y: toPdfY(pageHeight, annotation.origin.yPt + annotation.heightPt / 2),
          xScale: annotation.widthPt / 2,
          yScale: annotation.heightPt / 2,
          borderColor: color,
          borderWidth: annotation.strokeWidthPt,
          ...(annotation.fill === null ? {} : { color: strokeRgb(pdfLib, annotation.fill) }),
        });
        break;
      }
      case 'line':
        page.drawLine({
          start: {
            x: annotation.start.xPt,
            y: toPdfY(pageHeight, annotation.start.yPt),
          },
          end: {
            x: annotation.end.xPt,
            y: toPdfY(pageHeight, annotation.end.yPt),
          },
          thickness: annotation.strokeWidthPt,
          color: strokeRgb(pdfLib, annotation.color),
          lineCap: pdfLib.LineCapStyle.Round,
        });
        break;
      case 'signature': {
        const translated = annotation.points.map((point) => ({
          xPt: annotation.origin.xPt + point.xPt,
          yPt: annotation.origin.yPt + point.yPt,
        }));
        drawInkPath(page, translated, pageHeight, annotation.color, 2, 1, pdfLib);
        break;
      }
    }
  }
}
