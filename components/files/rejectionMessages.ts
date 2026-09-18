import { FILE_LIMITS } from '@/constants/limits';
import { formatBytes } from '@/utils/fileUtils/formatBytes';
import type { FileRejectionReason } from '@/utils/fileUtils/validatePdfFile';

/**
 * Human wording for each rejection reason.
 *
 * Copy lives in the component layer rather than beside the validator, so the
 * validator stays a pure decision function with no opinion on phrasing. The
 * exhaustive `Record` means a new reason cannot ship without a message.
 */
export const REJECTION_MESSAGES: Record<FileRejectionReason, string> = {
  'empty-file': 'The file is empty.',
  'wrong-extension': `Only ${FILE_LIMITS.acceptedExtension} files can be used here.`,
  'not-a-pdf': 'Despite the name, the contents are not a PDF.',
  'too-large': `Bigger than the ${formatBytes(FILE_LIMITS.maxBytes, 0)} limit.`,
  unreadable: 'Could not be read. It may have been moved or deleted.',
  duplicate: 'Already added.',
  'limit-reached': `Over the limit of ${FILE_LIMITS.maxFileCount} files.`,
  'single-file-only': 'This tool works on one file at a time.',
};
