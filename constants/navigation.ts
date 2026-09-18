import { ROUTES } from './routes';
import { TOOL_LIST } from './tools';

/**
 * Header and product-footer navigation.
 *
 * The PDF editor is a first-class destination (the query the site is built
 * around) so it sits in the header rather than only inside the tools grid.
 */
export const PRIMARY_NAV = [
  { label: 'PDF Editor', href: ROUTES.editor },
  { label: 'Tools', href: '/#tools' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Privacy', href: '/#privacy' },
] as const;

export const TOOL_NAV = TOOL_LIST.flatMap((tool) =>
  tool.href === null ? [] : [{ label: tool.name, href: tool.href }],
);

export const LEGAL_NAV = [{ label: 'Privacy policy', href: ROUTES.privacy }] as const;

export type NavItem =
  (typeof PRIMARY_NAV)[number] | (typeof TOOL_NAV)[number] | (typeof LEGAL_NAV)[number];
