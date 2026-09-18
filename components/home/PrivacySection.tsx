import { ButtonLink } from '@/components/ui/ButtonLink';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { ROUTES } from '@/constants/routes';

const CLAIMS = [
  {
    title: 'There is no server',
    body: 'Recto is a set of static files on a CDN. No backend exists that could receive a document, because we never built one.',
  },
  {
    title: 'Your file never becomes a request',
    body: 'PDFs are read with the browser File API and processed in memory. Open your browser developer tools, watch the Network tab, and confirm it yourself.',
  },
  {
    title: 'Nothing to leak',
    body: 'No account, no email, no document history. Close the tab and every trace of your file is gone from memory.',
  },
] as const;

export function PrivacySection() {
  return (
    <section id="privacy" aria-labelledby="privacy-heading" className="bg-surface scroll-mt-20">
      <Container width="wide" className="py-16 sm:py-20">
        <h2 id="privacy-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Why &ldquo;no upload&rdquo; means no upload
        </h2>
        <p className="text-muted mt-3 max-w-2xl leading-relaxed">
          Most online PDF tools send your document to a server, process it there, and promise to
          delete it afterwards. You have to take that promise on trust. Recto removes the need for
          trust by removing the server.
        </p>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {CLAIMS.map((claim) => (
            <Card key={claim.title} as="li">
              <h3 className="font-semibold">{claim.title}</h3>
              <p className="text-muted mt-2 text-sm leading-relaxed">{claim.body}</p>
            </Card>
          ))}
        </ul>

        <ButtonLink href={ROUTES.privacy} variant="secondary" className="mt-8">
          Privacy policy
        </ButtonLink>
      </Container>
    </section>
  );
}
