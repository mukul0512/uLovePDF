/**
 * Generates a locally unique identifier for documents, pages and annotations.
 *
 * `crypto.randomUUID` needs a secure context, which we always have in
 * production and on localhost. The fallback keeps the editor usable when a
 * browser exposes `crypto` without `randomUUID`; uniqueness only has to hold
 * within a single tab, since ids never leave the device.
 */
export const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${randomPart}`;
};
