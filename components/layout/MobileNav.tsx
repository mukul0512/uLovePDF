'use client';

import Link from 'next/link';
import { useEffect, useId, useRef } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { CloseIcon, MenuIcon } from '@/components/ui/icon/icons';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { PRIMARY_NAV } from '@/constants/navigation';
import { Z_INDEX } from '@/constants/ui';
import { useDisclosure } from '@/hooks/useDisclosure';

/**
 * Small-screen navigation.
 *
 * Built as a disclosure rather than a modal dialog. A modal would need a
 * focus trap, an inert background and scroll locking; a disclosure panel gets
 * correct keyboard behaviour from the browser for free. The cost is that the
 * page behind stays reachable, which is acceptable for three nav links.
 *
 * The panel stays mounted and toggles the `hidden` attribute so that
 * `aria-controls` always points at a real element.
 */
export function MobileNav() {
  const { isOpen, close, toggle } = useDisclosure();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      close();
      // Returning focus to the trigger stops keyboard users from being
      // dumped back at the top of the document when the panel closes.
      triggerRef.current?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="text-foreground hover:bg-surface rounded-control inline-flex h-10 w-10 items-center justify-center"
      >
        {isOpen ? <CloseIcon size="lg" /> : <MenuIcon size="lg" />}
        <VisuallyHidden>{isOpen ? 'Close menu' : 'Open menu'}</VisuallyHidden>
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        style={{ zIndex: Z_INDEX.dropdown }}
        className="border-line bg-background absolute inset-x-0 top-full border-b shadow-lg"
      >
        <nav aria-label="Primary" className="flex flex-col gap-1 px-4 py-4 sm:px-6">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="text-foreground hover:bg-surface rounded-control px-3 py-2.5 text-base font-medium"
            >
              {item.label}
            </Link>
          ))}
          <ButtonLink href="/#tools" onClick={close} className="mt-2">
            Get started
          </ButtonLink>
        </nav>
      </div>
    </div>
  );
}
