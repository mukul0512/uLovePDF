import type { ReactNode } from 'react';
import { cn } from '@/utils/commonFunctions/cn';
import { AlertCircleIcon, AlertTriangleIcon, CheckIcon, InfoIcon } from './icon/icons';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const TONE_CLASSES: Record<AlertTone, string> = {
  info: 'bg-info-surface text-info',
  success: 'bg-success-surface text-success',
  warning: 'bg-warning-surface text-warning',
  danger: 'bg-danger-surface text-danger',
};

const TONE_ICON: Record<AlertTone, typeof InfoIcon> = {
  info: InfoIcon,
  success: CheckIcon,
  warning: AlertTriangleIcon,
  danger: AlertCircleIcon,
};

/**
 * Problems and warnings interrupt with `alert`; confirmations and hints use
 * the politer `status`, which waits for a pause in speech. Getting this
 * backwards either talks over the user or buries a real failure.
 */
const TONE_ROLE: Record<AlertTone, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  danger: 'alert',
};

interface AlertProps {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  className?: string;
}

/** Inline feedback for error, warning, success and informational states. */
export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const ToneIcon = TONE_ICON[tone];

  return (
    <div
      role={TONE_ROLE[tone]}
      className={cn('rounded-card flex gap-3 p-4 text-sm', TONE_CLASSES[tone], className)}
    >
      <ToneIcon size="md" className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        {children ? <div className="mt-1 leading-relaxed opacity-90">{children}</div> : null}
      </div>
    </div>
  );
}
