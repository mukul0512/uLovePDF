import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';
import { CheckIcon, ChevronRightIcon, ShieldCheckIcon } from '@/components/ui/icon/icons';
import { ROUTES } from '@/constants/routes';
import { TOOL_LIST, type ToolDefinition } from '@/constants/tools';
import { ToolWorkspace } from './ToolWorkspace';

/**
 * Shared frame for every tool page.
 *
 * All tool pages are structurally identical, so the layout lives here and the
 * route files supply only data. That keeps a copy change to one file instead
 * of five, and guarantees the pages cannot drift apart visually.
 *
 * The workspace is the one part that varies: most tools want the standard
 * file intake, while the editor supplies its own. Passing children rather
 * than adding a flag keeps that choice at the call site.
 */
export function ToolPageShell({ tool, children }: { tool: ToolDefinition; children?: ReactNode }) {
  const otherTools = TOOL_LIST.filter((candidate) => candidate.id !== tool.id);

  return (
    <Container className="flex flex-col gap-12 py-10 sm:py-14">
      <nav aria-label="Breadcrumb">
        <ol className="text-muted flex items-center gap-1.5 text-sm">
          <li>
            <Link href={ROUTES.home} className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRightIcon size="sm" />
          </li>
          <li className="text-foreground font-medium" aria-current="page">
            {tool.name}
          </li>
        </ol>
      </nav>

      <header className="flex max-w-2xl flex-col items-start gap-4">
        <Badge tone="success">
          <ShieldCheckIcon size="sm" />
          Runs on your device
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {tool.name}
        </h1>
        <p className="text-muted text-lg leading-relaxed text-pretty">{tool.description}</p>
      </header>

      {children ?? <ToolWorkspace tool={tool} />}

      <section aria-labelledby="tool-notes" className="max-w-2xl">
        <h2 id="tool-notes" className="text-xl font-semibold tracking-tight">
          Good to know
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {tool.notes.map((note) => (
            <li key={note} className="text-muted flex gap-3 text-sm leading-relaxed">
              <CheckIcon size="sm" className="text-success mt-0.5 shrink-0" />
              {note}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="other-tools">
        <h2 id="other-tools" className="text-xl font-semibold tracking-tight">
          Other tools
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {otherTools.map((other) =>
            other.href === null ? null : (
              <li key={other.id}>
                <Link
                  href={other.href}
                  className="border-line text-muted hover:text-foreground hover:border-line-strong rounded-control inline-flex border px-3 py-2 text-sm transition-colors"
                >
                  {other.name}
                </Link>
              </li>
            ),
          )}
        </ul>
      </section>
    </Container>
  );
}
