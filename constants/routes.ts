/**
 * Every public route.
 *
 * Each tool has its own URL rather than a shared `/tools/[slug]` so titles,
 * descriptions and sitemap entries stay independent. Add a route here only
 * once the page exists.
 */
export const ROUTES = {
  home: '/',
  designSystem: '/design-system',
  privacy: '/privacy',
  merge: '/merge-pdf',
  split: '/split-pdf',
  rotate: '/rotate-pdf',
  compress: '/compress-pdf',
  editor: '/pdf-editor',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type Route = (typeof ROUTES)[RouteKey];
