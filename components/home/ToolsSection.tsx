import { ToolGrid } from '@/components/tools/ToolGrid';
import { Container } from '@/components/ui/Container';

export function ToolsSection() {
  return (
    <section id="tools" aria-labelledby="tools-heading" className="scroll-mt-20">
      <Container width="wide" className="py-16 sm:py-20">
        <h2 id="tools-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Free PDF editor and PDF tools
        </h2>
        <p className="text-muted mt-3 max-w-2xl leading-relaxed">
          Open the free online PDF editor to annotate and sign, or merge, split, rotate and compress.
          Each tool works the same way: add a file, adjust, download the result.
        </p>

        <div className="mt-10">
          <ToolGrid />
        </div>
      </Container>
    </section>
  );
}
