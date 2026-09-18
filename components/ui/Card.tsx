import type { ReactNode } from 'react';
import { cn } from '@/utils/commonFunctions/cn';

interface CardProps {
  as?: 'div' | 'article' | 'li';
  /** Adds hover affordance. Use only when the whole card is a link or button. */
  isInteractive?: boolean;
  className?: string;
  children: ReactNode;
}

/** Raised surface used for tool tiles, panels and grouped settings. */
export function Card({
  as: Element = 'div',
  isInteractive = false,
  className,
  children,
}: CardProps) {
  return (
    <Element
      className={cn(
        'bg-surface-raised border-line rounded-card border p-6',
        isInteractive && 'hover:border-line-strong transition-colors',
        className,
      )}
    >
      {children}
    </Element>
  );
}
