import type { PdfErrorCode } from '@/lib/pdf';

export const PDF_ERROR_MESSAGES: Record<PdfErrorCode, string> = {
  'password-protected':
    'This PDF is password protected. Unlock it in another application, then add it again.',
  corrupt: 'This PDF appears to be damaged and could not be opened.',
  'load-failed': 'This PDF could not be opened. It may use features we do not support yet.',
  'export-failed':
    'This PDF could not be saved. The file may be damaged, or this tab may have run out of memory.',
};
