import { Z_INDEX } from '@/constants/ui';

export const MAIN_CONTENT_ID = 'main-content';

/**
 * Lets keyboard and screen-reader users jump past the header.
 *
 * Hidden until focused, which is the first thing Tab reaches on every page.
 * Without it, reaching the page content means tabbing through the entire
 * navigation on every single navigation -- a WCAG 2.4.1 failure.
 */
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      style={{ zIndex: Z_INDEX.toast }}
      className="bg-primary text-on-primary rounded-control sr-only px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to main content
    </a>
  );
}
