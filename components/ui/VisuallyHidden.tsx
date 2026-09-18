import type { ReactNode } from 'react';

interface VisuallyHiddenProps {
  as?: 'span' | 'div' | 'h2';
  children: ReactNode;
}

/**
 * Hides content visually while keeping it available to screen readers.
 *
 * Uses Tailwind's `sr-only`, which clips the element rather than using
 * `display: none` -- the latter would remove it from the accessibility tree
 * as well, defeating the purpose.
 */
export function VisuallyHidden({ as: Element = 'span', children }: VisuallyHiddenProps) {
  return <Element className="sr-only">{children}</Element>;
}
