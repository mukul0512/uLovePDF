'use client';

import { useEffect, useId, useRef } from 'react';
import { MonitorIcon, MoonIcon, SunIcon } from '@/components/ui/icon/icons';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { THEME_LABELS, THEME_PREFERENCES, type ThemePreference } from '@/constants/theme';
import { Z_INDEX } from '@/constants/ui';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/commonFunctions/cn';

const PREFERENCE_ICON = {
  system: MonitorIcon,
  light: SunIcon,
  dark: MoonIcon,
} as const;

/**
 * Header control for light, dark, or match-device.
 *
 * A menu rather than a two-way toggle, because "system" would otherwise be
 * unreachable after the first click. The trigger icon shows the stored
 * preference (a monitor when following the OS) so the third state stays
 * visible rather than looking like light or dark.
 */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const { isOpen, close, toggle } = useDisclosure();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const TriggerIcon = PREFERENCE_ICON[preference];

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      close();
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  const handleSelect = (next: ThemePreference) => {
    setPreference(next);
    close();
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        className="text-foreground hover:bg-surface rounded-control inline-flex h-10 w-10 items-center justify-center"
      >
        <TriggerIcon size="md" />
        <VisuallyHidden>Colour scheme: {THEME_LABELS[preference]}</VisuallyHidden>
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label="Colour scheme"
        hidden={!isOpen}
        style={{ zIndex: Z_INDEX.dropdown }}
        className="border-line bg-surface-raised rounded-control absolute top-full right-0 mt-1 min-w-44 border py-1 shadow-lg"
      >
        {THEME_PREFERENCES.map((option) => {
          const Icon = PREFERENCE_ICON[option];
          const isSelected = option === preference;
          return (
            <button
              key={option}
              type="button"
              role="menuitemradio"
              aria-checked={isSelected}
              onClick={() => handleSelect(option)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                isSelected
                  ? 'text-foreground bg-surface'
                  : 'text-muted hover:bg-surface hover:text-foreground',
              )}
            >
              <Icon size="sm" />
              {THEME_LABELS[option]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
