import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { ShieldCheckIcon } from '@/components/ui/icon/icons';
import { siteConfig } from '@/config/site';
import { ROUTES } from '@/constants/routes';

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
          Free online PDF editor plus merge, split, rotate and compress. Every operation runs on your
          device, so your documents never touch a server.
        </p>

        <div className="mt-2 flex flex-wrap gap-3">
          <ButtonLink href={ROUTES.editor} size="lg">
            Open PDF editor
          </ButtonLink>
          <ButtonLink href="/#tools" size="lg" variant="secondary">
            Choose a tool
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
