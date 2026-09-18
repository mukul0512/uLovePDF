import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { ShieldCheckIcon } from '@/components/ui/icon/icons';
import { siteConfig } from '@/config/site';
import { LEGAL_NAV, PRIMARY_NAV, TOOL_NAV } from '@/constants/navigation';
import { Logo } from './Logo';

// Evaluated during `next build`, so a static export freezes this until the
// next deploy. Acceptable for a copyright line; never use it for real dates.
const BUILD_YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-line bg-surface mt-auto border-t">
      <Container width="wide" className="py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="text-muted mt-3 text-sm leading-relaxed">{siteConfig.description}</p>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <nav aria-label="Product" className="flex flex-col gap-2">
              <h2 className="text-foreground text-sm font-semibold">Product</h2>
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted hover:text-foreground text-sm transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="PDF tools" className="flex flex-col gap-2">
              <h2 className="text-foreground text-sm font-semibold">PDF tools</h2>
              {TOOL_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted hover:text-foreground text-sm transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="Legal" className="flex flex-col gap-2">
              <h2 className="text-foreground text-sm font-semibold">Legal</h2>
              {LEGAL_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted hover:text-foreground text-sm transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-line mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted flex items-center gap-2 text-xs">
            <ShieldCheckIcon size="sm" className="text-success" />
            Files are processed on your device and never uploaded.
          </p>
          <p className="text-muted text-xs">
            © {BUILD_YEAR} {siteConfig.name}
          </p>
        </div>
      </Container>
    </footer>
  );
}
