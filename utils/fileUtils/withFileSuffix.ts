/** Drops a trailing `.pdf`, case-insensitively, leaving any other dots alone. */
export function stripPdfExtension(fileName: string): string {
  return fileName.toLowerCase().endsWith('.pdf') ? fileName.slice(0, -4) : fileName;
}

/** `report.pdf` + `-edited` → `report-edited.pdf`. */
export function withPdfSuffix(fileName: string, suffix: string): string {
  return `${stripPdfExtension(fileName)}${suffix}.pdf`;
}
