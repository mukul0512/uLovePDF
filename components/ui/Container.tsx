import type { ReactNode } from 'react';
import { cn } from '@/utils/commonFunctions/cn';

type ContainerElement = 'div' | 'section' | 'main' | 'header' | 'footer' | 'nav';
type ContainerWidth = 'narrow' | 'default' | 'wide';

const WIDTH: Record<ContainerWidth, string> = {
  narrow: 'max-w-2xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
};

interface ContainerProps {
  as?: ContainerElement;
  width?: ContainerWidth;
  id?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Horizontal layout wrapper: one place that owns page gutters and max widths.
 *
 * `as` is a small fixed union rather than a fully polymorphic `ElementType`.
 * Full polymorphism costs a lot of generic type machinery and slower editor
 * feedback, to support elements a layout container should never be.
 */
export function Container({
  as: Element = 'div',
  width = 'default',
  id,
  className,
  children,
}: ContainerProps) {
  return (
    <Element id={id} className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', WIDTH[width], className)}>
      {children}
    </Element>
  );
}
