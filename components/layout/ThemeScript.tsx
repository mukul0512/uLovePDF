import { THEME_BOOTSTRAP_SCRIPT } from '@/config/themeScript';

/**
 * Runs before React hydrates so a saved dark preference never flashes light.
 *
 * A native tag rather than `next/script`: `beforeInteractive` is the same
 * idea, but an inline child of `<body>` is the smallest thing that static
 * export will put in the HTML as a blocking script.
 */
export function ThemeScript() {
  return (
    <script
      id="recto-theme-bootstrap"
      dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
    />
  );
}
