import { JsonLd } from '@/components/seo/JsonLd';
import { Container } from '@/components/ui/Container';
import { buildFaqJsonLd } from '@/config/metadata';
import type { ToolFaq } from '@/constants/tools';

const HOME_FAQS: readonly ToolFaq[] = [
  {
    question: 'What is the best free online PDF editor that does not upload files?',
    answer:
      'Recto is built for that case: a free online PDF editor that reads your file on the device and never sends it to a server. There is no account and no upload API.',
  },
  {
    question: 'How do I edit a PDF online without uploading it?',
    answer:
      'Open the PDF editor, choose a file from disk, add text, highlights, shapes or a signature, then download. The document never becomes a network request.',
  },
  {
    question: 'Can I use Recto as a free PDF editor on any device?',
    answer:
      'Yes, in a modern browser on desktop or mobile. Processing uses your device memory, so very large scanned PDFs may be slower on phones than on a laptop.',
  },
  {
    question: 'What PDF tools does Recto include besides the editor?',
    answer:
      'Merge PDF, split PDF, rotate PDF and compress PDF. Every tool uses the same local pipeline: add a file, adjust, download.',
  },
];

export function HomeFaq() {
  return (
    <section id="faq" aria-labelledby="home-faq-heading" className="scroll-mt-20">
      <JsonLd data={buildFaqJsonLd(HOME_FAQS)} />
      <Container width="wide" className="py-16 sm:py-20">
        <h2 id="home-faq-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Questions about this free online PDF editor
        </h2>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2">
          {HOME_FAQS.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold">{faq.question}</dt>
              <dd className="text-muted mt-2 text-sm leading-relaxed">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
