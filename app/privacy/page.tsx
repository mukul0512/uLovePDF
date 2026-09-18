import { buildPageMetadata } from '@/config/metadata';
import { siteConfig } from '@/config/site';
import { ROUTES } from '@/constants/routes';
import { Container } from '@/components/ui/Container';

export const metadata = buildPageMetadata({
  title: 'Privacy',
  description: `${siteConfig.name} never uploads your files. Documents are processed in your browser and are not sent to a server.`,
  path: ROUTES.privacy,
});

export default function PrivacyPage() {
  return (
    <Container width="narrow" className="flex flex-col gap-10 py-16 sm:py-24">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy</h1>
        <p className="text-muted text-lg leading-relaxed text-pretty">
          {siteConfig.name} is a set of static files on a CDN. There is no account, no upload API
          and no document store.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Files stay on your device</h2>
        <p className="text-muted leading-relaxed">
          When you choose a PDF, the browser reads it with the File API. Merge, split, rotate,
          compress and edit all run in that tab. Closing the tab drops the file from memory. We
          cannot see, store or recover a document you opened here.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">What is stored locally</h2>
        <p className="text-muted leading-relaxed">
          Colour-scheme preference (light, dark, or match the device) is saved in{' '}
          <code className="text-foreground">localStorage</code> on your device so the next visit can
          paint the right theme before React loads. Nothing else is written. There are no cookies,
          no analytics beacons and no advertising pixels.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Hosting</h2>
        <p className="text-muted leading-relaxed">
          The site is served as static assets by Firebase Hosting. That CDN can see the same request
          metadata any website sees: IP address, user agent and the page URL. PDF bytes are not part
          of those requests. No Firebase Auth, Firestore or Cloud Storage project is attached.
        </p>
      </section>
    </Container>
  );
}
