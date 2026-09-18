import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { ROUTES } from '@/constants/routes';

/**
 * Crawlable product copy for primary queries ("PDF editor", "edit PDF online").
 * One purpose: explain what Recto is in plain language crawlers and people share.
 */
export function SeoIntro() {
  return (
    <section id="pdf-editor" aria-labelledby="seo-intro-heading" className="scroll-mt-20">
      <Container width="wide" className="border-line border-t py-16 sm:py-20">
        <h2 id="seo-intro-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          A free online PDF editor for private documents
        </h2>
        <div className="text-muted mt-6 max-w-3xl space-y-4 text-base leading-relaxed">
          <p>
            Recto is a free online PDF editor you open in the browser. Annotate pages, highlight
            passages, draw shapes and place a signature, then download a new file. The PDF is read
            with the File API and processed in memory — it never becomes an upload.
          </p>
          <p>
            Need more than markup?{' '}
            <Link href={ROUTES.merge} className="text-foreground font-medium underline-offset-2 hover:underline">
              Merge PDF
            </Link>
            ,{' '}
            <Link href={ROUTES.split} className="text-foreground font-medium underline-offset-2 hover:underline">
              split PDF
            </Link>
            ,{' '}
            <Link href={ROUTES.rotate} className="text-foreground font-medium underline-offset-2 hover:underline">
              rotate PDF
            </Link>{' '}
            and{' '}
            <Link href={ROUTES.compress} className="text-foreground font-medium underline-offset-2 hover:underline">
              compress PDF
            </Link>{' '}
            tools use the same local pipeline. Start in the{' '}
            <Link
              href={ROUTES.editor}
              className="text-foreground font-medium underline-offset-2 hover:underline"
            >
              PDF editor
            </Link>{' '}
            when you want to mark up a document without giving it to a server.
          </p>
        </div>
      </Container>
    </section>
  );
}
