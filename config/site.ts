/**
 * Branding and canonical origin.
 *
 * Titles, Open Graph tags, JSON-LD and the sitemap all read from here so the
 * name cannot drift between the document, the header and crawler metadata.
 */
export const siteConfig = {
  name: 'Recto',
  /** A recto is the front side of a leaf in a bound document. */
  tagline: 'Free online PDF editor that never uploads your files',
  description:
    'Free online PDF editor — annotate, highlight and sign in your browser. Also merge, split, rotate and compress PDFs on your device. No upload, no account.',
  locale: 'en',
  /** Override with NEXT_PUBLIC_SITE_URL when a custom domain is attached. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://recto.page').replace(/\/+$/, ''),
} as const;

export type SiteConfig = typeof siteConfig;

/** Absolute URL with a trailing slash, matching the static export. */
export function absoluteUrl(path: string): string {
  if (path === '/') {
    return `${siteConfig.url}/`;
  }

  const normalised = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.url}${normalised.endsWith('/') ? normalised : `${normalised}/`}`;
}
