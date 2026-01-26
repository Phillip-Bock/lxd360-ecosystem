'use client';

import { Eye, Headphones } from 'lucide-react';
import * as React from 'react';
import { type PlaybackModality, usePersistentPlayer } from '@/hooks/use-persistent-player';
import { cn } from '@/lib/utils';

interface ModalitySwitcherProps {
  /** Current modality */
  modality?: PlaybackModality;
  /** Callback when modality changes */
  onModalityChange?: (modality: PlaybackModality) => void;
  /** Whether audio source is available */
  hasAudio?: boolean;
  /** Whether video source is available */
  hasVideo?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
  /** Use internal store state */
  useStore?: boolean;
}

/**
 * Modality Switcher Component
 *
 * Toggle between Watch (video) and Listen (audio-only/podcast) modes
 * with smooth transition animations.
 */
export function ModalitySwitcher({
  modality: controlledModality,
  onModalityChange,
  hasAudio = true,
  hasVideo = true,
  size = 'md',
  className,
  useStore = false,
}: ModalitySwitcherProps): React.JSX.Element | null {
  const player = usePersistentPlayer();

  // Use store state if useStore is true, otherwise use controlled state
  const currentModality = useStore ? player.modality : (controlledModality ?? 'watch');

  const handleModalityChange = React.useCallback(
    (newModality: PlaybackModality) => {
      if (useStore) {
        player.switchModality(newModality);
      }
      onModalityChange?.(newModality);
    },
    [useStore, player, onModalityChange],
  );

  const sizeClasses = {
    sm: {
      container: 'h-8 p-0.5',
      button: 'h-7 px-2.5 text-xs gap-1.5',
      icon: 'h-3.5 w-3.5',
    },
    md: {
      container: 'h-10 p-1',
      button: 'h-8 px-3 text-sm gap-2',
      icon: 'h-4 w-4',
    },
    lg: {
      container: 'h-12 p-1',
      button: 'h-10 px-4 text-base gap-2.5',
      icon: 'h-5 w-5',
    },
  };

  const sizes = sizeClasses[size];

  // Don't render if only one modality is available
  if (!hasAudio && !hasVideo) {
    return null;
  }

  if (!hasAudio || !hasVideo) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative inline-flex items-center rounded-lg bg-black/20 backdrop-blur-sm',
        sizes.container,
        className,
      )}
      role="group"
      aria-label="Playback mode"
    >
      {/* Animated background indicator */}
      <div
        className={cn(
          'absolute top-1 bottom-1 rounded-md bg-gradient-to-r from-lxd-primary to-lxd-secondary transition-all duration-300 ease-out',
          currentModality === 'watch' ? 'left-1' : 'left-1/2',
        )}
        style={{
          width: 'calc(50% - 4px)',
          transform: currentModality === 'listen' ? 'translateX(4px)' : 'translateX(0)',
        }}
        aria-hidden="true"
      />

      {/* Watch button */}
      <button
        type="button"
        aria-pressed={currentModality === 'watch'}
        disabled={!hasVideo}
        onClick={() => handleModalityChange('watch')}
        className={cn(
          'relative z-10 inline-flex items-center justify-center rounded-md font-medium transition-all duration-200',
          sizes.button,
          currentModality === 'watch' ? 'text-white' : 'text-white/60 hover:text-white/80',
          !hasVideo && 'cursor-not-allowed opacity-50',
        )}
      >
        <Eye className={sizes.icon} aria-hidden="true" />
        <span>Watch</span>
      </button>

      {/* Listen button */}
      <button
        type="button"
        aria-pressed={currentModality === 'listen'}
        disabled={!hasAudio}
        onClick={() => handleModalityChange('listen')}
        className={cn(
          'relative z-10 inline-flex items-center justify-center rounded-md font-medium transition-all duration-200',
          sizes.button,
          currentModality === 'listen' ? 'text-white' : 'text-white/60 hover:text-white/80',
          !hasAudio && 'cursor-not-allowed opacity-50',
        )}
      >
        <Headphones className={sizes.icon} aria-hidden="true" />
        <span>Listen</span>
      </button>
    </div>
  );
}

/**
 * Compact modality switcher for mini player
 */
export function ModalitySwitcherCompact({
  modality,
  onModalityChange,
  hasAudio = true,
  hasVideo = true,
  className,
}: Omit<ModalitySwitcherProps, 'size'>): React.JSX.Element | null {
  // Don't render if only one modality is available
  if (!hasAudio || !hasVideo) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => onModalityChange?.(modality === 'watch' ? 'listen' : 'watch')}
      className={cn(
        'inline-flex items-center justify-center rounded-full p-2 transition-all duration-200',
        'bg-white/10 hover:bg-white/20 text-white',
        className,
      )}
      aria-label={`Switch to ${modality === 'watch' ? 'listen' : 'watch'} mode`}
    >
      {modality === 'watch' ? (
        <Headphones className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Eye className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

ModalitySwitcher.displayName = 'ModalitySwitcher';
ModalitySwitcherCompact.displayName = 'ModalitySwitcherCompact';
