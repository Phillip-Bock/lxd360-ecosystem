'use client';

import { motion } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KeyboardShortcutsOverlayProps {
  onClose: () => void;
}

const shortcuts = [
  { keys: ['←', '→'], description: 'Navigate slides' },
  { keys: ['↑', '↓'], description: 'Navigate slides' },
  { keys: ['Space'], description: 'Play / Pause' },
  { keys: ['M'], description: 'Toggle menu sidebar' },
  { keys: ['N'], description: 'Open notes panel' },
  { keys: ['G'], description: 'Open glossary' },
  { keys: ['A'], description: 'Toggle Neuronaut AI' },
  { keys: ['F'], description: 'Toggle fullscreen' },
  { keys: ['?'], description: 'Show shortcuts' },
  { keys: ['Esc'], description: 'Close panels' },
];

export function KeyboardShortcutsOverlay({ onClose }: KeyboardShortcutsOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--hud-bg)]/90 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md rounded-2xl border border-[var(--hud-border)] bg-[var(--hud-bg-secondary)] p-6 shadow-2xl shadow-[var(--hud-accent)]/10"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/10 hover:text-[var(--hud-text)]"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--hud-accent)]/15">
            <Keyboard className="h-5 w-5 text-[var(--hud-accent-bright)]" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--hud-text)]">Keyboard Shortcuts</h2>
            <p className="text-xs text-[var(--hud-text-muted)]">Quick navigation commands</p>
          </div>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-[var(--hud-text)]/70">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="min-w-[28px] rounded-md border border-[var(--hud-border)] bg-[var(--hud-bg)]/80 px-2 py-1 text-center text-xs text-[var(--hud-text)]/90"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-xs text-[var(--hud-text-muted)]/50">
          Press{' '}
          <kbd className="rounded border border-[var(--hud-border)] bg-[var(--hud-bg)]/80 px-1.5 py-0.5">
            ?
          </kbd>{' '}
          anytime to toggle this overlay
        </div>
      </motion.div>
    </motion.div>
  );
}
