import {
  THEME_CHANGE_EVENT,
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from '@/constants/theme';
import { logger } from '@/utils/commonFunctions/logger';

export function isThemePreference(value: string | null): value is ThemePreference {
  return THEME_PREFERENCES.some((preference) => preference === value);
}

export function parseThemePreference(value: string | null): ThemePreference {
  return isThemePreference(value) ? value : 'system';
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  if (preference === 'system') return prefersDark ? 'dark' : 'light';
  return preference;
}

function prefersDarkScheme(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Paints the resolved scheme onto `<html>` without waiting for React.
 *
 * The blocking bootstrap script in the root layout does the same work before
 * first paint. This copy exists so later changes (a toggle, another tab, or
 * the OS flipping) stay in lockstep with that first paint.
 */
export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference, prefersDarkScheme());
  const root = document.documentElement;
  const isDark = resolved === 'dark';

  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
  root.dataset.theme = preference;
  root.style.colorScheme = resolved;

  logger.debug('app', 'theme applied', { preference, resolved });
  return resolved;
}

export function readStoredTheme(): ThemePreference {
  return parseThemePreference(localStorage.getItem(THEME_STORAGE_KEY));
}

export function persistTheme(preference: ThemePreference): void {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
  applyTheme(preference);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  logger.debug('app', 'theme preference saved', { preference });
}

/**
 * Notifies React when this tab, another tab, or the OS scheme changes.
 *
 * Media-query and `storage` events also re-apply the class list, because a
 * `system` preference has to follow the OS even when nothing in React fired.
 */
export function subscribeToTheme(onStoreChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
    applyTheme(parseThemePreference(event.newValue));
    onStoreChange();
  };

  const onMediaChange = () => {
    applyTheme(readStoredTheme());
    onStoreChange();
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onMediaChange);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    media.removeEventListener('change', onMediaChange);
  };
}
