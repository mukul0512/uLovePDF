import { FILE_LIMITS } from '@/constants/limits';
import { logger } from '@/utils/commonFunctions/logger';

/** Something about the file itself is wrong. Decided by inspecting the file. */
export type ContentRejectionReason =
  'empty-file' | 'wrong-extension' | 'not-a-pdf' | 'too-large' | 'unreadable';

/**
 * The file is fine, but it does not fit the current selection. Only the
 * selection reducer can decide these, because they depend on what is already
 * in the list rather than on the file.
 */
export type SelectionRejectionReason = 'duplicate' | 'limit-reached' | 'single-file-only';

export type FileRejectionReason = ContentRejectionReason | SelectionRejectionReason;

export type PdfFileValidation =
  { readonly ok: true } | { readonly ok: false; readonly reason: ContentRejectionReason };

const ACCEPTED: PdfFileValidation = { ok: true };

const reject = (reason: ContentRejectionReason): PdfFileValidation => ({ ok: false, reason });

/**
 * Cheap checks that need no disk read.
 *
 * Split out from the content check so callers can reject the obvious cases
 * before paying for I/O, and so this half stays synchronously testable.
 */
export function validateFileMetadata(file: File): PdfFileValidation {
  if (file.size === 0) return reject('empty-file');
  if (file.size > FILE_LIMITS.maxBytes) return reject('too-large');

  // Extension and MIME type are both supplied by the client, so neither is
  // trustworthy on its own. We check the extension only to give a fast, clear
  // message for the honest mistake of picking a .docx.
  const hasPdfExtension = file.name.toLowerCase().endsWith(FILE_LIMITS.acceptedExtension);
  if (!hasPdfExtension) return reject('wrong-extension');

  return ACCEPTED;
}

/**
 * Confirms the file really is a PDF by reading its first four bytes.
 *
 * Why bother when the name ends in `.pdf`? Because a file's name and reported
 * MIME type are metadata the browser passes through from the OS; neither
 * describes the contents. Without this check a renamed ZIP would sail through
 * and fail much later inside the PDF parser, surfacing as an unintelligible
 * stack trace instead of "this is not a PDF".
 *
 * `file.slice(0, 4)` reads four bytes, not the whole file, so this stays cheap
 * even for a 200 MB document.
 */
export async function validatePdfFile(file: File): Promise<PdfFileValidation> {
  const metadata = validateFileMetadata(file);
  if (!metadata.ok) {
    logger.debug('upload', `rejected "${file.name}" on metadata`, {
      reason: metadata.reason,
      sizeBytes: file.size,
      type: file.type,
    });
    return metadata;
  }

  try {
    const header = new Uint8Array(await file.slice(0, FILE_LIMITS.magicBytes.length).arrayBuffer());
    const isPdf = FILE_LIMITS.magicBytes.every((byte, index) => header[index] === byte);

    if (!isPdf) {
      logger.debug('upload', `rejected "${file.name}": header is not %PDF`, {
        header: Array.from(header),
      });
      return reject('not-a-pdf');
    }
  } catch (error) {
    // Reachable in practice: the file can be moved, renamed or deleted between
    // the user picking it and us reading it, and a revoked permission on a
    // network drive behaves the same way.
    logger.warn('upload', `could not read "${file.name}"`, error);
    return reject('unreadable');
  }

  logger.debug('upload', `accepted "${file.name}"`, { sizeBytes: file.size });
  return ACCEPTED;
}

/**
 * Fingerprint used to spot the same file being added twice.
 *
 * Hashing the contents would be exact but means reading every byte of every
 * file. Name, size and modified time together are wrong only for genuinely
 * pathological cases, and the cost of being wrong is one duplicate page range.
 */
export const getFileFingerprint = (file: File): string =>
  `${file.name}|${file.size}|${file.lastModified}`;
