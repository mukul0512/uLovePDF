import { PdfError, type PdfErrorCode } from '../errors';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '';
}

function isEncryptedError(error: unknown): boolean {
  // EncryptedPDFError does not set `name`, so the message is the stable signal.
  return errorMessage(error).includes('is encrypted');
}

/**
 * Translates pdf-lib failures into our own vocabulary.
 *
 * Callers pick the fallback: a load that explodes is `corrupt`, a save that
 * explodes is `export-failed`. Encryption is recognised either way.
 */
export function mapPdfLibError(error: unknown, fallback: PdfErrorCode): PdfError {
  if (error instanceof PdfError) return error;

  if (isEncryptedError(error)) {
    return new PdfError('password-protected', 'The document requires a password', {
      cause: error,
    });
  }

  const message =
    fallback === 'corrupt' ? 'The document structure is invalid' : 'The PDF could not be written';

  return new PdfError(fallback, message, { cause: error });
}
