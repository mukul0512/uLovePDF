import type { ReactNode, SVGProps } from 'react';

export type IconSize = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<IconSize, number> = { sm: 16, md: 20, lg: 24 };

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'width' | 'height'> {
  size?: IconSize;
  /**
   * Supply only when the icon conveys meaning that is not already in adjacent
   * text. Most icons sit next to a visible label and should stay silent for
   * screen readers, which is why this defaults to undefined.
   */
  title?: string;
}

/**
 * Shared chrome for every icon: sizing, stroke style and accessibility.
 *
 * Writing icons as local components instead of installing a package keeps the
 * bundle honest -- only the icons actually imported are included -- and lets
 * us control the ARIA semantics rather than inherit someone else's defaults.
 */
export function IconBase({
  size = 'md',
  title,
  children,
  ...svgProps
}: IconProps & { children: ReactNode }) {
  const pixels = SIZE_PX[size];
  const isLabelled = title !== undefined;

  return (
    <svg
      width={pixels}
      height={pixels}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={isLabelled ? 'img' : undefined}
      aria-hidden={isLabelled ? undefined : true}
      focusable="false"
      {...svgProps}
    >
      {isLabelled ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
