import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ArrowRightIcon } from '@/components/ui/icon/icons';
import type { ToolDefinition } from '@/constants/tools';
import { TOOL_ICONS } from './toolIcons';

function ToolCardBody({ tool }: { tool: ToolDefinition }) {
  const ToolIcon = TOOL_ICONS[tool.iconKey];
  const isAvailable = tool.href !== null;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="bg-info-surface text-info flex h-10 w-10 items-center justify-center rounded-lg">
          <ToolIcon size="lg" />
        </span>
        {isAvailable ? null : <Badge>Coming soon</Badge>}
      </div>
      <h4 className="mt-4 flex items-center gap-1.5 font-semibold">
        {tool.name}
        {isAvailable ? (
          <ArrowRightIcon
            size="sm"
            className="text-muted transition-transform group-hover:translate-x-0.5"
          />
        ) : null}
      </h4>
      <p className="text-muted mt-1 text-sm leading-relaxed">{tool.summary}</p>
    </>
  );
}

/**
 * A single tool tile.
 *
 * Tools without a route yet render as a plain card rather than a dead link.
 * A link that goes nowhere is worse than an honest "coming soon": it breaks
 * the browser's back button expectations and misleads crawlers.
 */
export function ToolCard({ tool }: { tool: ToolDefinition }) {
  if (tool.href === null) {
    return (
      <li>
        <Card className="h-full opacity-70">
          <ToolCardBody tool={tool} />
        </Card>
      </li>
    );
  }

  return (
    <li>
      <Link href={tool.href} className="rounded-card group block h-full">
        <Card isInteractive className="h-full">
          <ToolCardBody tool={tool} />
        </Card>
      </Link>
    </li>
  );
}
