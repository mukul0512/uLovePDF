import type { ReactNode } from 'react';
import { cn } from '@/utils/commonFunctions/cn';

interface EmptyStateProps {
  /** Decorative illustration or icon. Kept as a slot so callers own the art. */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Primary call to action, e.g. an upload button. */
  action?: ReactNode;
  className?: string;
}

/**
 * Shown when a surface has no content yet -- no document loaded, no pages
 * selected, no results. An empty state should always offer the next step,
 * which is why `action` exists alongside the message.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-line rounded-card flex flex-col items-center gap-3 border border-dashed px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? <div className="text-muted">{icon}</div> : null}
      <p className="text-base font-semibold">{title}</p>
      {description ? <p className="text-muted max-w-sm text-sm">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
