import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PrivacySection } from '@/components/home/PrivacySection';
import { ToolsSection } from '@/components/home/ToolsSection';

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
      <HowItWorks />
      <PrivacySection />
    </>
  );
}
