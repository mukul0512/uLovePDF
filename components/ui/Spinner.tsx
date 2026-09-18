import { cn } from '@/utils/commonFunctions/cn';
import type { IconSize } from './icon/IconBase';

const SIZE_PX: Record<IconSize, number> = { sm: 16, md: 20, lg: 24 };

interface SpinnerProps {
  size?: IconSize;
  className?: string;
}

/**
 * Purely decorative busy indicator.
 *
 * It is always `aria-hidden`: the surrounding control owns the announcement,
 * via `aria-busy` on a button or a live region on a page-level loading state.
 * A spinner that announces itself alongside its container is a common source
 * of duplicated screen-reader output.
 *
 * Under `prefers-reduced-motion` the global stylesheet stops the rotation, so
 * this must never be the only signal that something is happening.
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  const pixels = SIZE_PX[size];

  return (
    <svg
      className={cn('animate-spin', className)}
      width={pixels}
      height={pixels}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
