import Link from 'next/link';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { PRIMARY_NAV } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { Z_INDEX } from '@/constants/ui';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from './ThemeToggle';

/**
 * Global site header.
 *
 * A server component: only the mobile menu and colour-scheme control need
 * interactivity, so only those two children carry `'use client'`. Marking
 * the whole header as client would ship the nav data and markup to the
 * browser for no reason.
 *
 * `sticky` makes this the containing block for the mobile panel's absolute
 * positioning, which is why no explicit `relative` is needed.
 */
export function SiteHeader() {
  return (
    <header
      style={{ zIndex: Z_INDEX.stickyHeader }}
      className="border-line bg-background/90 sticky top-0 border-b backdrop-blur"
    >
      <Container width="wide" className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="rounded-control shrink-0" aria-label="Recto home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted hover:text-foreground hover:bg-surface rounded-control px-3 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <div className="hidden md:block">
            <ButtonLink href={ROUTES.editor} size="sm">
              Open PDF editor
            </ButtonLink>
          </div>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
