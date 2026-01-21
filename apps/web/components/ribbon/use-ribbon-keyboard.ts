'use client';

import * as React from 'react';

interface UseRibbonKeyboardOptions {
  onEscape?: () => void;
  onTab?: (direction: 'next' | 'prev') => void;
}

export function useRibbonKeyboard(options: UseRibbonKeyboardOptions = {}) {
  const { onEscape, onTab } = options;

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Find the ribbon container
      const ribbon = document.querySelector('[role="toolbar"][aria-label="Ribbon toolbar"]');
      if (!ribbon?.contains(document.activeElement)) return;

      switch (event.key) {
        case 'Escape':
          onEscape?.();
          break;

        case 'Tab':
          if (event.shiftKey) {
            onTab?.('prev');
          } else {
            onTab?.('next');
          }
          break;

        case 'ArrowLeft':
        case 'ArrowRight': {
          event.preventDefault();
          const focusableElements = ribbon.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [role="tab"], [tabindex]:not([tabindex="-1"])',
          );
          const currentIndex = Array.from(focusableElements).indexOf(
            document.activeElement as HTMLElement,
          );

          if (currentIndex === -1) return;

          const direction = event.key === 'ArrowLeft' ? -1 : 1;
          const nextIndex =
            (currentIndex + direction + focusableElements.length) % focusableElements.length;
          focusableElements[nextIndex]?.focus();
          break;
        }

        case 'ArrowUp':
        case 'ArrowDown': {
          // Navigate within dropdown menus
          const activeElement = document.activeElement as HTMLElement;
          const menu = activeElement.closest('[role="menu"]');
          if (!menu) return;

          event.preventDefault();
          const menuItems = menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])');
          const currentMenuIndex = Array.from(menuItems).indexOf(activeElement);

          if (currentMenuIndex === -1) return;

          const direction = event.key === 'ArrowUp' ? -1 : 1;
          const nextMenuIndex =
            (currentMenuIndex + direction + menuItems.length) % menuItems.length;
          menuItems[nextMenuIndex]?.focus();
          break;
        }

        case 'Home': {
          event.preventDefault();
          const firstFocusable = ribbon.querySelector<HTMLElement>(
            'button:not([disabled]), [role="tab"]',
          );
          firstFocusable?.focus();
          break;
        }

        case 'End': {
          event.preventDefault();
          const focusables = ribbon.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [role="tab"]',
          );
          focusables[focusables.length - 1]?.focus();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onTab]);
}

// Hook for registering keyboard shortcuts
interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
}

export function useRibbonShortcuts(shortcuts: ShortcutConfig[]) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
