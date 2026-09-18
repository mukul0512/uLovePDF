type ClassValue = string | false | null | undefined;

/**
 * Joins conditional Tailwind class names.
 *
 * Deliberately dependency-free. The usual pairing is `clsx` + `tailwind-merge`,
 * but `tailwind-merge` only earns its weight once components accept overriding
 * `className` props that genuinely conflict. Variant buttons exist and still
 * do not need it.
 */
export const cn = (...values: readonly ClassValue[]): string =>
  values.filter((value): value is string => Boolean(value)).join(' ');
