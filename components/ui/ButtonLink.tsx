import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { buttonStyles, type ButtonStyleOptions } from './buttonStyles';

interface ButtonLinkProps
  extends Omit<ComponentProps<typeof Link>, 'className'>, ButtonStyleOptions {
  children: ReactNode;
}

/**
 * A link that looks like a button.
 *
 * Kept separate from `Button` on purpose. Navigation is an anchor and actions
 * are buttons: that distinction drives keyboard behaviour, the context menu,
 * and how assistive technology describes the control. Sharing only the styles
 * keeps the appearance consistent without blurring the semantics.
 */
export function ButtonLink({
  children,
  variant,
  size,
  fullWidth,
  className,
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Link className={buttonStyles({ variant, size, fullWidth, className })} {...linkProps}>
      {children}
    </Link>
  );
}
