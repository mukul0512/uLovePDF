import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ButtonSize, ButtonVariant } from '@/components/ui/buttonStyles';
import * as icons from '@/components/ui/icon/icons';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
  alternates: { canonical: ROUTES.designSystem },
};

const VARIANTS: readonly ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
const SIZES: readonly ButtonSize[] = ['sm', 'md', 'lg'];

const SEMANTIC_TOKENS = [
  'bg-background',
  'bg-surface',
  'bg-surface-raised',
  'bg-primary',
  'bg-danger-surface',
  'bg-success-surface',
  'bg-warning-surface',
  'bg-info-surface',
] as const;

const BRAND_SHADES = [
  'bg-brand-50',
  'bg-brand-100',
  'bg-brand-200',
  'bg-brand-300',
  'bg-brand-400',
  'bg-brand-500',
  'bg-brand-600',
  'bg-brand-700',
  'bg-brand-800',
  'bg-brand-900',
  'bg-brand-950',
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-line border-b pb-2 text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <Container className="flex flex-col gap-12 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Design system</h1>
        <p className="text-muted">
          Every primitive available to the rest of the app. Use the colour-scheme control in the
          header to switch between light, dark and match-device.
        </p>
      </header>

      <Section title="Brand scale">
        <div className="flex flex-wrap gap-2">
          {BRAND_SHADES.map((shade) => (
            <div key={shade} className="flex flex-col items-center gap-1">
              <div className={`border-line h-12 w-12 rounded-md border ${shade}`} />
              <span className="text-muted text-[10px]">{shade.replace('bg-brand-', '')}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Semantic tokens">
        <div className="flex flex-wrap gap-2">
          {SEMANTIC_TOKENS.map((token) => (
            <div key={token} className="flex flex-col items-center gap-1">
              <div className={`border-line h-12 w-28 rounded-md border ${token}`} />
              <span className="text-muted text-[10px]">{token}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-col gap-4">
          {SIZES.map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-3">
              {VARIANTS.map((variant) => (
                <Button key={variant} variant={variant} size={size}>
                  {variant} {size}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <Button isLoading>Exporting</Button>
            <Button disabled>Disabled</Button>
            <Button variant="secondary">
              <icons.DownloadIcon size="sm" />
              With icon
            </Button>
            <ButtonLink href="/" variant="ghost">
              Link styled as button
            </ButtonLink>
          </div>
          <Button fullWidth variant="secondary">
            Full width
          </Button>
        </div>
      </Section>

      <Section title="Feedback states">
        <div className="flex flex-col gap-3">
          <Alert tone="info" title="Processing happens on your device">
            Recto never uploads your documents.
          </Alert>
          <Alert tone="success" title="Export complete">
            Your file has been saved to your downloads folder.
          </Alert>
          <Alert tone="warning" title="This is a large file">
            Documents over 50 MB may be slow on mobile devices.
          </Alert>
          <Alert tone="danger" title="Could not open this PDF">
            The file appears to be corrupt or password protected.
          </Alert>
        </div>
      </Section>

      <Section title="Containers">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="font-semibold">Card</h3>
            <p className="text-muted mt-1 text-sm">A raised surface for grouped content.</p>
          </Card>
          <Card isInteractive>
            <h3 className="font-semibold">Interactive card</h3>
            <p className="text-muted mt-1 text-sm">Hover to see the border respond.</p>
          </Card>
        </div>
        <EmptyState
          icon={<icons.FileTextIcon size="lg" />}
          title="No document loaded"
          description="Drop a PDF here or choose a file to get started."
          action={<Button>Choose a file</Button>}
        />
      </Section>

      <Section title="Icons">
        <ul className="flex flex-wrap gap-4">
          {Object.entries(icons).map(([name, IconComponent]) => (
            <li key={name} className="text-muted flex w-20 flex-col items-center gap-1.5">
              <IconComponent size="lg" className="text-foreground" />
              <span className="text-center text-[10px] break-all">{name.replace('Icon', '')}</span>
            </li>
          ))}
        </ul>
      </Section>
    </Container>
  );
}
