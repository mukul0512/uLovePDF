/**
 * Colour-scheme preference stored in localStorage.
 *
 * `system` means follow `prefers-color-scheme`. Light and dark are explicit
 * overrides so a visitor who disagrees with their OS is not stuck with it.
 */
export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'recto-theme';

/** Dispatched on `window` after this tab writes a new preference. */
export const THEME_CHANGE_EVENT = 'recto-theme-change';

export const THEME_LABELS: Record<ThemePreference, string> = {
  system: 'Match device',
  light: 'Light',
  dark: 'Dark',
};
