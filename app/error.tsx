'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { logger } from '@/utils/commonFunctions/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('app', 'route error', error);
  }, [error]);

  return (
    <Container className="flex flex-col items-start gap-4 py-16 sm:py-24">
      <p className="text-muted text-sm font-medium">Error</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Something went wrong</h1>
      <p className="text-muted max-w-lg text-lg leading-relaxed text-pretty">
        This page hit a problem. Your files were not uploaded. You can try again or go back home.
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
        <ButtonLink href="/" size="lg" variant="secondary">
          Back to Recto
        </ButtonLink>
      </div>
    </Container>
  );
}
