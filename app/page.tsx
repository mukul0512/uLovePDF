import { Hero } from '@/components/home/Hero';
import { HomeFaq } from '@/components/home/HomeFaq';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PrivacySection } from '@/components/home/PrivacySection';
import { SeoIntro } from '@/components/home/SeoIntro';
import { ToolsSection } from '@/components/home/ToolsSection';
import { buildPageMetadata } from '@/config/metadata';
import { siteConfig } from '@/config/site';
import { ROUTES } from '@/constants/routes';

export const metadata = buildPageMetadata({
  title: 'Free Online PDF Editor',
  description: siteConfig.description,
  path: ROUTES.home,
});

/**
 * Landing page.
 *
 * Composition only: each section owns its own markup and copy. Keeping the
 * route file this thin means the page reads as a table of contents, and a
 * section can be reordered or reused without untangling it from siblings.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ToolsSection />
      <SeoIntro />
      <HowItWorks />
      <HomeFaq />
      <PrivacySection />
    </>
  );
}
