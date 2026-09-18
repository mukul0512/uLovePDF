import { Container } from '@/components/ui/Container';

const STEPS = [
  {
    title: 'Pick a tool',
    body: 'Choose the operation you need. Nothing has left your device at this point, or at any point after it.',
  },
  {
    title: 'Add your PDF',
    body: 'Your browser reads the file straight from disk using the File API. There is no upload request, because there is nowhere to upload to.',
  },
  {
    title: 'Download the result',
    body: 'The new PDF is assembled in memory on your machine and saved directly to your downloads folder.',
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="scroll-mt-20">
      <Container width="wide" className="py-16 sm:py-20">
        <h2 id="how-it-works-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          How it works
        </h2>

        {/* An ordered list, because the steps genuinely happen in sequence.
            Screen readers announce the position and count for free. */}
        <ol className="mt-8 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3">
              <span
                aria-hidden="true"
                className="bg-primary text-on-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
              >
                {index + 1}
              </span>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
