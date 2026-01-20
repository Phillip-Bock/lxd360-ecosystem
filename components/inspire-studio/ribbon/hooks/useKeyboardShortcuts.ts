'use client';

/**
 * =============================================================================
 * INSPIRE Studio | useKeyboardShortcuts Hook
 * =============================================================================
 *
 * A hook for managing keyboard shortcuts in the ribbon editor.
 * Supports formatting, navigation, and custom commands.
 */

import { useCallback, useEffect } from 'react';

export interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
}

export interface KeyboardShortcutsConfig {
  // File operations
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPreview?: () => void;

  // Formatting
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onStrikethrough?: () => void;

  // Headings
  onHeading1?: () => void;
  onHeading2?: () => void;
  onHeading3?: () => void;
  onParagraph?: () => void;

  // Lists
  onBulletList?: () => void;
  onNumberedList?: () => void;
  onChecklist?: () => void;

  // Insert
  onInsertLink?: () => void;
  onInsertImage?: () => void;

  // Navigation
  onCommandPalette?: () => void;
  onFindReplace?: () => void;
  onFullscreen?: () => void;

  // AI
  onAIAssistant?: () => void;
  onAIGenerate?: () => void;

  // Custom shortcuts
  customShortcuts?: ShortcutHandler[];
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow some shortcuts even in editable content
        const allowedInEditable = ['s', 'z', 'y', 'b', 'i', 'u'];
        if (!e.ctrlKey || !allowedInEditable.includes(e.key.toLowerCase())) {
          return;
        }
      }

      // File operations
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            config.onSave?.();
            return;
          case 'z':
            e.preventDefault();
            config.onUndo?.();
            return;
          case 'y':
            e.preventDefault();
            config.onRedo?.();
            return;
          case 'b':
            e.preventDefault();
            config.onBold?.();
            return;
          case 'i':
            e.preventDefault();
            config.onItalic?.();
            return;
          case 'u':
            e.preventDefault();
            config.onUnderline?.();
            return;
          case 'k':
            e.preventDefault();
            config.onInsertLink?.();
            return;
          case '/':
            e.preventDefault();
            config.onCommandPalette?.();
            return;
          case ' ':
            e.preventDefault();
            config.onAIAssistant?.();
            return;
        }
      }

      // Ctrl+Shift shortcuts
      if (e.ctrlKey && e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            config.onRedo?.();
            return;
          case 'x':
            e.preventDefault();
            config.onStrikethrough?.();
            return;
          case 'p':
            e.preventDefault();
            config.onPreview?.();
            return;
          case 'i':
            e.preventDefault();
            config.onInsertImage?.();
            return;
          case 'f':
            e.preventDefault();
            config.onFindReplace?.();
            return;
          case 'g':
            e.preventDefault();
            config.onAIGenerate?.();
            return;
          case '8':
            e.preventDefault();
            config.onBulletList?.();
            return;
          case '7':
            e.preventDefault();
            config.onNumberedList?.();
            return;
          case '9':
            e.preventDefault();
            config.onChecklist?.();
            return;
        }
      }

      // Ctrl+Alt shortcuts (headings)
      if (e.ctrlKey && e.altKey && !e.shiftKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            config.onHeading1?.();
            return;
          case '2':
            e.preventDefault();
            config.onHeading2?.();
            return;
          case '3':
            e.preventDefault();
            config.onHeading3?.();
            return;
          case '0':
            e.preventDefault();
            config.onParagraph?.();
            return;
        }
      }

      // Function keys
      if (e.key === 'F11') {
        e.preventDefault();
        config.onFullscreen?.();
        return;
      }

      // Custom shortcuts
      if (config.customShortcuts) {
        for (const shortcut of config.customShortcuts) {
          const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
          const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
          const altMatch = shortcut.alt ? e.altKey : !e.altKey;
          const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

          if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
            e.preventDefault();
            shortcut.action();
            return;
          }
        }
      }
    },
    [config],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Export keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = {
  // File operations
  'Ctrl+S': 'Save',
  'Ctrl+Z': 'Undo',
  'Ctrl+Y': 'Redo',
  'Ctrl+Shift+Z': 'Redo',

  // Formatting
  'Ctrl+B': 'Bold',
  'Ctrl+I': 'Italic',
  'Ctrl+U': 'Underline',
  'Ctrl+Shift+X': 'Strikethrough',

  // Headings
  'Ctrl+Alt+1': 'Heading 1',
  'Ctrl+Alt+2': 'Heading 2',
  'Ctrl+Alt+3': 'Heading 3',
  'Ctrl+Alt+0': 'Normal Text',

  // Lists
  'Ctrl+Shift+8': 'Bullet List',
  'Ctrl+Shift+7': 'Numbered List',
  'Ctrl+Shift+9': 'Checklist',

  // Insert
  'Ctrl+K': 'Insert Link',
  'Ctrl+Shift+I': 'Insert Image',

  // Navigation
  'Ctrl+/': 'Command Palette',
  'Ctrl+Shift+P': 'Preview',
  'Ctrl+Shift+F': 'Find & Replace',
  F11: 'Toggle Fullscreen',

  // AI
  'Ctrl+Space': 'AI Assistant',
  'Ctrl+Shift+G': 'AI Generate',
};
