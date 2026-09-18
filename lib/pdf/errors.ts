export type PdfErrorCode =
  /** The document is encrypted and needs a password we do not have. */
  | 'password-protected'
  /** The bytes are not a structurally valid PDF. */
  | 'corrupt'
  /** Opening failed for any other reason: out of memory, a worker that failed to start, a bug. */
  | 'load-failed'
  /** Writing or transforming a PDF failed after it had already opened. */
  | 'export-failed';

/**
 * A failure expressed in our own vocabulary rather than pdf.js's.
 *
 * The point of this class is that nothing outside `lib/pdf/engine` should
 * ever have to know what a `PasswordException` is. Swapping the underlying
 * engine should not ripple into error handling in the UI.
 */
export class PdfError extends Error {
  readonly code: PdfErrorCode;

  constructor(code: PdfErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'PdfError';
    this.code = code;
  }
}
