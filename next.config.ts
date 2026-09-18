import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Recto has no server: every PDF operation runs in the visitor's browser.
  // A static export lets us deploy to Firebase Hosting's CDN on the free tier.
  // Trade-off: `headers`, `redirects` and `rewrites` are inert here and must be
  // declared in `firebase.json` instead.
  output: 'export',

  // The default `next/image` loader needs a server-side optimiser.
  images: { unoptimized: true },

  // Emit `/merge-pdf/index.html` so static hosts resolve routes without rewrites.
  trailingSlash: true,

  reactStrictMode: true,
  poweredByHeader: false,

  // Surface stack traces from the PDF worker chunks in production bug reports.
  productionBrowserSourceMaps: true,
};

export default nextConfig;
