'use client';

import { useCallback, useState } from 'react';

interface Disclosure {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Open/closed state for menus, panels and dialogs.
 *
 * The callbacks are memoised with `useCallback` so passing them to child
 * components does not invalidate their props on every render -- a habit worth
 * keeping now that the editor will re-render frequently.
 */
export function useDisclosure(initiallyOpen = false): Disclosure {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((current) => !current), []);

  return { isOpen, open, close, toggle };
}
