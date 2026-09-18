import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { MAIN_CONTENT_ID, SkipLink } from '@/components/layout/SkipLink';
import { ThemeScript } from '@/components/layout/ThemeScript';
import { webApplicationJsonLd } from '@/config/metadata';
import { siteConfig } from '@/config/site';
import './globals.css';

// next/font downloads and self-hosts the font at build time, so visitors never
// hit Google's servers. That matters for a tool that promises privacy.
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  referrer: 'no-referrer',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1c2d' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang={siteConfig.locale}
      className={`${geistSans.variable} h-full antialiased`}
      // The bootstrap script adds `.light` / `.dark` before hydration. React
      // would otherwise warn that the server HTML did not include those classes.
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
        />
        <ThemeScript />
        <SkipLink />
        <SiteHeader />
        {/* The single `<main>` landmark lives here so pages cannot accidentally
            render zero or two of them. */}
        <main id={MAIN_CONTENT_ID} className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
