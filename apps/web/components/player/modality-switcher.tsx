'use client';

/**
 * =============================================================================
 * LXD360 | ModalitySwitcher Component
 * =============================================================================
 *
 * Toggle between Watch (video) and Listen (audio) modes.
 * Neural-futuristic styling with smooth animations.
 *
 * @version 1.0.0
 * @updated 2026-01-27
 */

import { Eye, Headphones } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Playback modality
 */
export type PlayerModality = 'video' | 'audio';

/**
 * ModalitySwitcher component props
 */
export interface ModalitySwitcherProps {
  /** Current modality */
  mode: PlayerModality;
  /** Called when modality changes */
  onModeChange: (mode: PlayerModality) => void;
  /** Whether video source is available */
  hasVideo?: boolean;
  /** Whether audio source is available */
  hasAudio?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * ModalitySwitcher - Toggle between video and audio modes
 *
 * Features animated background indicator and disabled states.
 * WCAG 2.2 AA compliant with proper ARIA attributes.
 */
export function ModalitySwitcher({
  mode,
  onModeChange,
  hasVideo = true,
  hasAudio = true,
  size = 'md',
  className,
}: ModalitySwitcherProps): React.JSX.Element | null {
  // Respect reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    <fieldset
      className={cn(
        'relative inline-flex items-center rounded-lg bg-black/20 backdrop-blur-sm border-0 p-0 m-0',
        sizes.container,
        className,
      )}
      aria-label="Playback mode"
    >
      {/* Animated background indicator */}
      <div
        className={cn(
          'absolute top-1 bottom-1 rounded-md bg-gradient-to-r from-cyan-500 to-purple-500',
          !prefersReducedMotion && 'transition-all duration-300 ease-out',
          mode === 'video' ? 'left-1' : 'left-1/2',
        )}
        style={{
          width: 'calc(50% - 4px)',
          transform: mode === 'audio' ? 'translateX(4px)' : 'translateX(0)',
        }}
        aria-hidden="true"
      />

      {/* Watch (video) button */}
      <button
        type="button"
        aria-pressed={mode === 'video'}
        disabled={!hasVideo}
        onClick={() => onModeChange('video')}
        className={cn(
          'relative z-10 inline-flex items-center justify-center rounded-md font-medium',
          !prefersReducedMotion && 'transition-all duration-200',
          sizes.button,
          mode === 'video' ? 'text-white' : 'text-white/60 hover:text-white/80',
          !hasVideo && 'cursor-not-allowed opacity-50',
        )}
      >
        <Eye className={sizes.icon} aria-hidden="true" />
        <span>Watch</span>
      </button>

      {/* Listen (audio) button */}
      <button
        type="button"
        aria-pressed={mode === 'audio'}
        disabled={!hasAudio}
        onClick={() => onModeChange('audio')}
        className={cn(
          'relative z-10 inline-flex items-center justify-center rounded-md font-medium',
          !prefersReducedMotion && 'transition-all duration-200',
          sizes.button,
          mode === 'audio' ? 'text-white' : 'text-white/60 hover:text-white/80',
          !hasAudio && 'cursor-not-allowed opacity-50',
        )}
      >
        <Headphones className={sizes.icon} aria-hidden="true" />
        <span>Listen</span>
      </button>
    </fieldset>
  );
}

/**
 * Compact modality switcher for mini player
 */
export function ModalitySwitcherCompact({
  mode,
  onModeChange,
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
      onClick={() => onModeChange(mode === 'video' ? 'audio' : 'video')}
      className={cn(
        'inline-flex items-center justify-center rounded-full p-2 transition-all duration-200',
        'bg-white/10 hover:bg-white/20 text-white',
        className,
      )}
      aria-label={`Switch to ${mode === 'video' ? 'listen' : 'watch'} mode`}
    >
      {mode === 'video' ? (
        <Headphones className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Eye className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

export default ModalitySwitcher;
