import type { ReactNode } from 'react';
import { cn } from '@/utils/commonFunctions/cn';

type BadgeTone = 'neutral' | 'brand' | 'success';

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-surface text-muted border-line',
  brand: 'bg-info-surface text-info border-transparent',
  success: 'bg-success-surface text-success border-transparent',
};

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

/** Small inline label for status and categorisation. */
export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
