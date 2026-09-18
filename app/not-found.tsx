import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start gap-4 py-16 sm:py-24">
      <p className="text-muted text-sm font-medium">404</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        This page does not exist
      </h1>
      <p className="text-muted max-w-lg text-lg leading-relaxed text-pretty">
        The link may be outdated. Merge, split, rotate, compress and edit still live on the home
        page.
      </p>
      <ButtonLink href="/" size="lg" className="mt-2">
        Back to Recto
      </ButtonLink>
    </Container>
  );
}
