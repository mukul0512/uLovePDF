/**
 * Branding and canonical origin.
 *
 * Titles, Open Graph tags, JSON-LD and the sitemap all read from here so the
 * name cannot drift between the document, the header and crawler metadata.
 */
export const siteConfig = {
  name: 'Recto',
  /** A recto is the front side of a leaf in a bound document. */
  tagline: 'PDF tools that never upload your files',
  description:
    'Merge, split, rotate, annotate and sign PDFs directly in your browser. Your documents are processed on your device and are never uploaded to a server.',
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
