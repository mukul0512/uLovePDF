import { ROUTES } from './routes';

/**
 * Header and product-footer navigation.
 *
 * These point at landing-page sections rather than individual tool routes so
 * the chrome stays short and every destination exists.
 */
export const PRIMARY_NAV = [
  { label: 'Tools', href: '/#tools' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Privacy', href: '/#privacy' },
] as const;

export const LEGAL_NAV = [{ label: 'Privacy policy', href: ROUTES.privacy }] as const;

export type NavItem = (typeof PRIMARY_NAV)[number] | (typeof LEGAL_NAV)[number];
