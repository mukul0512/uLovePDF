'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { ResolvedTheme, ThemePreference } from '@/constants/theme';
import {
  parseThemePreference,
  persistTheme,
  readStoredTheme,
  resolveTheme,
  subscribeToTheme,
} from '@/utils/commonFunctions/theme';

const SERVER_SNAPSHOT = 'system:light';

function getServerSnapshot(): string {
  return SERVER_SNAPSHOT;
}

function getClientSnapshot(): string {
  const preference = readStoredTheme();
  const resolved = resolveTheme(
    preference,
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  return `${preference}:${resolved}`;
}

function parseSnapshot(snapshot: string): {
  preference: ThemePreference;
  resolved: ResolvedTheme;
} {
  const separator = snapshot.indexOf(':');
  const preference = parseThemePreference(snapshot.slice(0, separator));
  const resolved = snapshot.slice(separator + 1) === 'dark' ? 'dark' : 'light';
  return { preference, resolved };
}

/**
 * Colour scheme as stored, plus the light/dark value actually painted.
 *
 * `useSyncExternalStore` keeps the first client render on the server snapshot
 * so the toggle icon cannot hydration-mismatch. The blocking script has
 * already painted `<html>`, so the page colour is correct before this runs.
 */
export function useTheme(): {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
} {
  const snapshot = useSyncExternalStore(subscribeToTheme, getClientSnapshot, getServerSnapshot);
  const { preference, resolved } = parseSnapshot(snapshot);

  const setPreference = useCallback((next: ThemePreference) => {
    persistTheme(next);
  }, []);

  return { preference, resolved, setPreference };
}
