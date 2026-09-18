import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';
import { buttonStyles, type ButtonStyleOptions } from './buttonStyles';

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>, ButtonStyleOptions {
  children: ReactNode;
  /** Disables the button and swaps the leading slot for a spinner. */
  isLoading?: boolean;
}

/**
 * The standard action control.
 *
 * Note there is no `'use client'` here. A styled `<button>` with no hooks
 * works in both server and client components; marking it as client-only would
 * needlessly drag every page that renders one into the client bundle.
 */
export function Button({
  children,
  variant,
  size,
  fullWidth,
  className,
  isLoading = false,
  disabled = false,
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      // Defaulting to "button" avoids the classic bug where a button inside a
      // form submits it because the HTML default is type="submit".
      type={type}
      className={buttonStyles({ variant, size, fullWidth, className })}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...buttonProps}
    >
      {isLoading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
}
