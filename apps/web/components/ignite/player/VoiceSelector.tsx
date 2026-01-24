'use client';

import { Check, ChevronDown, Mic } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// VOICE SELECTOR COMPONENT
// Dropdown for selecting Cortex's voice
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
    description: 'Studio quality male',
    gender: 'male',
    style: 'studio',
  },
  {
    id: 'en-US-Studio-O',
    name: 'Shimmer',
    description: 'Studio quality female',
    gender: 'female',
    style: 'studio',
  },
];

export interface VoiceSelectorProps {
  value: string;
  onChange: (voiceId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceSelector({
  value,
  onChange,
  disabled = false,
  className,
}: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedVoice = VOICE_OPTIONS.find((v) => v.id === value) || VOICE_OPTIONS[0];

  return (
    <div className={cn('relative', className)}>
      {/* Trigger */}
      <Button
        type="button"
        variant="ghost"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full justify-between px-3 py-2 h-auto',
          'bg-background/50 hover:bg-background/80',
          'border border-border/50 rounded-lg',
          'text-left',
        )}
      >
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-muted-foreground" />
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
        />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: Decorative backdrop for closing dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
            role="presentation"
          />

          {/* Menu */}
          <div
            className={cn(
              'absolute top-full left-0 right-0 mt-1 z-20',
              'bg-card/95 backdrop-blur-xl rounded-lg',
              'border border-border/50 shadow-lg',
              'overflow-hidden',
            )}
          >
            {VOICE_OPTIONS.map((voice) => (
              <button
                key={voice.id}
                type="button"
                onClick={() => {
                  onChange(voice.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-3 py-2 text-left',
                  'hover:bg-muted/50 transition-colors',
                  'flex items-center justify-between',
                  voice.id === value && 'bg-muted/30',
                )}
              >
                <div>
                  <p className="text-sm font-medium">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">{voice.description}</p>
                </div>
                {voice.id === value && <Check className="h-4 w-4 text-lxd-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default VoiceSelector;
