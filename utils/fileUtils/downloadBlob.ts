import { logger } from '@/utils/commonFunctions/logger';

export const DOWNLOAD_TYPES = {
  pdf: 'application/pdf',
  zip: 'application/zip',
} as const;

/**
 * Triggers a local download of an in-memory blob.
 *
 * The object URL is revoked shortly after the click. Revoking synchronously
 * can cancel the download in some browsers; a short delay is enough for the
 * navigation to start while still avoiding a leak if the user exports often.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1_000);

  logger.debug('export', `download started "${fileName}"`, { byteLength: blob.size });
}

function bytesToBlobPart(bytes: Uint8Array): BlobPart {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}

export function downloadPdf(bytes: Uint8Array, fileName: string): void {
  downloadBlob(new Blob([bytesToBlobPart(bytes)], { type: DOWNLOAD_TYPES.pdf }), fileName);
}

export function downloadZip(bytes: Uint8Array, fileName: string): void {
  downloadBlob(new Blob([bytesToBlobPart(bytes)], { type: DOWNLOAD_TYPES.zip }), fileName);
}
