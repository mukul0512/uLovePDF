import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { ShieldCheckIcon } from '@/components/ui/icon/icons';
import { siteConfig } from '@/config/site';

export function Hero() {
  return (
    <section className="from-info-surface to-background border-line border-b bg-gradient-to-b">
      <Container width="wide" className="flex flex-col items-start gap-6 py-16 sm:py-24">
        <Badge tone="success">
          <ShieldCheckIcon size="sm" />
          No uploads, no account, no tracking
        </Badge>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          {siteConfig.tagline}
        </h1>

        <p className="text-muted max-w-2xl text-lg leading-relaxed text-pretty sm:text-xl">
          Merge, split, rotate and compress PDFs in seconds. Every operation runs inside your
          browser, so your documents never touch a server.
        </p>

        <div className="mt-2 flex flex-wrap gap-3">
          <ButtonLink href="/#tools" size="lg">
            Choose a tool
          </ButtonLink>
          <ButtonLink href="/#how-it-works" size="lg" variant="secondary">
            How it works
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
