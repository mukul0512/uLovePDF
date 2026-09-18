import { cn } from '@/utils/commonFunctions/cn';
import { siteConfig } from '@/config/site';

interface LogoProps {
  className?: string;
  /** Hide the wordmark when space is tight, e.g. the editor toolbar. */
  markOnly?: boolean;
}

/**
 * Brand mark: an open book with the recto -- the right-hand page -- filled in.
 *
 * Drawn inline rather than loaded as an image file so it inherits
 * `currentColor`, needs no extra network request, and stays crisp at any size.
 */
export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn('text-primary inline-flex items-center gap-2', className)}>
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M12 6.2C10.1 4.9 7.7 4.2 5 4.2H4a1 1 0 00-1 1v12.6a1 1 0 001 1h1c2.7 0 5.1.7 7 2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 6.2c1.9-1.3 4.3-2 7-2h1a1 1 0 011 1v12.6a1 1 0 01-1 1h-1c-2.7 0-5.1.7-7 2z"
          fill="currentColor"
        />
      </svg>
      {markOnly ? null : (
        <span className="text-foreground text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </span>
      )}
    </span>
  );
}
