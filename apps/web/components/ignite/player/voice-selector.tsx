'use client';

import { Check, ChevronDown, Mic } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// VOICE SELECTOR COMPONENT (WCAG 2.1 AA Compliant)
// Accessible dropdown for selecting Cortex's voice
// Uses listbox pattern for full keyboard navigation
// ============================================================================

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female';
  style: 'neural' | 'studio';
}

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'en-US-Neural2-J',
    name: 'Cortex',
    description: 'Professional male voice',
    gender: 'male',
    style: 'neural',
  },
  {
    id: 'en-US-Neural2-F',
    name: 'Nova',
    description: 'Warm female voice',
    gender: 'female',
    style: 'neural',
  },
  {
    id: 'en-US-Studio-M',
    name: 'Echo',
    description: 'Calm male voice',
    gender: 'male',
    style: 'studio',
  },
  {
    id: 'en-US-Studio-O',
    name: 'Shimmer',
    description: 'Bright female voice',
    gender: 'female',
    style: 'studio',
  },
];

export interface VoiceSelectorProps {
  value: string;
  onChange: (voiceId: string) => void;
  disabled?: boolean;
  className?: string;
  /** ID of external label element for aria-labelledby */
  labelledBy?: string;
}

export function VoiceSelector({
  value,
  onChange,
  disabled = false,
  className,
  labelledBy,
}: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const uniqueId = useId();
  const listboxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedVoice = VOICE_OPTIONS.find((v) => v.id === value) || VOICE_OPTIONS[0];
  const selectedIndex = VOICE_OPTIONS.findIndex((v) => v.id === value);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        // Open on arrow down/up or Enter/Space when closed
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          setIsOpen(true);
          setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, VOICE_OPTIONS.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(VOICE_OPTIONS.length - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0) {
            onChange(VOICE_OPTIONS[focusedIndex].id);
            setIsOpen(false);
            triggerRef.current?.focus();
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    },
    [isOpen, focusedIndex, onChange, selectedIndex],
  );

  // Focus management when opening
  useEffect(() => {
    if (isOpen && listboxRef.current) {
      listboxRef.current.focus();
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, selectedIndex]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!listboxRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const listboxId = `${uniqueId}-listbox`;
  const triggerId = `${uniqueId}-trigger`;

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <Button
        ref={triggerRef}
        id={triggerId}
        type="button"
        variant="ghost"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelledBy ? `${labelledBy} ${triggerId}` : triggerId}
        aria-controls={isOpen ? listboxId : undefined}
        className={cn(
          'w-full justify-between px-3 py-2 h-auto',
          'bg-background/50 hover:bg-background/80',
          'border border-border/50 rounded-lg',
          'text-left',
          'focus:ring-2 focus:ring-lxd-primary/50',
        )}
      >
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">{selectedVoice.name}</p>
            <p className="text-xs text-muted-foreground">{selectedVoice.description}</p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </Button>

      {/* Listbox Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div className="fixed inset-0 z-10" aria-hidden="true" />

          {/* Listbox - using div with role for proper ARIA pattern */}
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={labelledBy || triggerId}
            aria-activedescendant={
              focusedIndex >= 0 ? `${uniqueId}-option-${focusedIndex}` : undefined
            }
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className={cn(
              'absolute top-full left-0 right-0 mt-1 z-20',
              'bg-card/95 backdrop-blur-xl rounded-lg',
              'border border-border/50 shadow-lg',
              'overflow-hidden',
              'focus:outline-none focus:ring-2 focus:ring-lxd-primary/50',
            )}
          >
            {VOICE_OPTIONS.map((voice, index) => (
              <button
                key={voice.id}
                id={`${uniqueId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={voice.id === value}
                onClick={() => {
                  onChange(voice.id);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                onKeyDown={handleKeyDown}
                tabIndex={-1}
                className={cn(
                  'w-full px-3 py-2 text-left cursor-pointer',
                  'flex items-center justify-between',
                  'transition-colors',
                  // Selected state
                  voice.id === value && 'bg-muted/30',
                  // Focused state (keyboard navigation)
                  index === focusedIndex && 'bg-muted/50 outline-none',
                  // Hover state
                  'hover:bg-muted/50',
                )}
              >
                <div>
                  <p className="text-sm font-medium">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">{voice.description}</p>
                </div>
                {voice.id === value && (
                  <Check className="h-4 w-4 text-lxd-primary" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default VoiceSelector;
