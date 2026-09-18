import { cn } from '@/utils/commonFunctions/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Note the explicit `| undefined` on each property.
 *
 * Under `exactOptionalPropertyTypes`, `variant?: ButtonVariant` means the key
 * may be *absent* but may not be present holding `undefined`. Forwarding
 * destructured props always produces the second case, so a pass-through
 * options bag has to opt into it.
 */
export interface ButtonStyleOptions {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  fullWidth?: boolean | undefined;
  className?: string | undefined;
}

/*
 * Variant lookup tables instead of `class-variance-authority`.
 *
 * CVA is a fine library, but a typed `Record` gives the same exhaustiveness
 * guarantee -- adding a variant to the union forces a new entry here -- with
 * no dependency and nothing to learn.
 */
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'bg-surface-raised text-foreground border border-line hover:bg-surface',
  ghost: 'text-foreground hover:bg-surface',
  danger: 'bg-danger-solid text-on-danger hover:opacity-90',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const buttonStyles = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}): string =>
  cn(BASE, VARIANT[variant], SIZE[size], fullWidth && 'w-full', className);
