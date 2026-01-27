'use client';

/**
 * =============================================================================
 * LXD360 | PlayerBar Component
 * =============================================================================
 *
 * Persistent footer player bar (Spotify-style design).
 * Contains all playback controls with neural-futuristic styling.
 *
 * @version 1.0.0
 * @updated 2026-01-27
 */

import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { ModalitySwitcher } from './modality-switcher';
import { ProgressBar } from './progress-bar';
import { SpeedControl } from './speed-control';

/**
 * PlayerBar component props
 */
export interface PlayerBarProps {
  /** Track title */
  title: string;
  /** Track subtitle (artist, course, etc.) */
  subtitle?: string;
  /** Thumbnail image URL */
  thumbnail?: string;
  /** Current time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Buffered percentage (0-100) */
  buffered?: number;
  /** Whether playing */
  isPlaying: boolean;
  /** Volume level (0-1) */
  volume: number;
  /** Whether muted */
  isMuted: boolean;
  /** Playback speed */
  playbackSpeed: number;
  /** Current modality (video/audio) */
  modality: 'video' | 'audio';
  /** Whether video is available */
  hasVideo?: boolean;
  /** Whether audio is available */
  hasAudio?: boolean;
  /** Whether minimized */
  isMinimized?: boolean;
  /** Called when play/pause is toggled */
  onPlayPause: () => void;
  /** Called when seeking */
  onSeek: (time: number) => void;
  /** Called when skipping forward */
  onSkipForward?: () => void;
  /** Called when skipping backward */
  onSkipBackward?: () => void;
  /** Called when volume changes */
  onVolumeChange: (volume: number) => void;
  /** Called when mute is toggled */
  onMuteToggle: () => void;
  /** Called when speed changes */
  onSpeedChange: (speed: number) => void;
  /** Called when modality changes */
  onModalityChange: (modality: 'video' | 'audio') => void;
  /** Called when minimize is toggled */
  onMinimizeToggle?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** z-index for the bar */
  zIndex?: number;
}

/**
 * Format time in seconds to MM:SS
 */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * PlayerBar - Persistent footer with all playback controls
 *
 * Spotify-style design with neural-futuristic accents.
 * WCAG 2.2 AA compliant with full keyboard accessibility.
 */
export function PlayerBar({
  title,
  subtitle,
  thumbnail,
  currentTime,
  duration,
  buffered = 0,
  isPlaying,
  volume,
  isMuted,
  playbackSpeed,
  modality,
  hasVideo = true,
  hasAudio = true,
  isMinimized = false,
  onPlayPause,
  onSeek,
  onSkipForward,
  onSkipBackward,
  onVolumeChange,
  onMuteToggle,
  onSpeedChange,
  onModalityChange,
  onMinimizeToggle,
  className,
  zIndex = 50,
}: PlayerBarProps): React.JSX.Element {
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);
  const volumeTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (volumeTimeout.current) {
        clearTimeout(volumeTimeout.current);
      }
    };
  }, []);

  const handleVolumeMouseEnter = React.useCallback(() => {
    if (volumeTimeout.current) {
      clearTimeout(volumeTimeout.current);
    }
    setShowVolumeSlider(true);
  }, []);

  const handleVolumeMouseLeave = React.useCallback(() => {
    volumeTimeout.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 300);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section
      className={cn(
        'fixed bottom-0 left-0 right-0 transition-all duration-300 ease-out',
        isMinimized ? 'h-16' : 'h-20',
        className,
      )}
      style={{ zIndex }}
      aria-label="Media player"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 border-t border-white/10 bg-black/95 backdrop-blur-xl" />

      {/* Progress bar (top edge) */}
      <div
        className="absolute left-0 right-0 top-0 h-1 bg-white/10"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Playback progress"
      >
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      <div className="relative flex h-full items-center gap-4 px-4">
        {/* Thumbnail and info */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
            {thumbnail ? (
              <Image src={thumbnail} alt={title} fill className="object-cover" sizes="48px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                <Play className="h-5 w-5 text-white/50" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{title}</p>
            {subtitle && <p className="truncate text-xs text-white/60">{subtitle}</p>}
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onSkipBackward}
            className="h-10 w-10 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Skip backward 10 seconds"
          >
            <SkipBack className="h-5 w-5" aria-hidden="true" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onPlayPause}
            className={cn(
              'h-12 w-12 rounded-full',
              'bg-white text-black',
              'hover:scale-105 hover:bg-white/90',
              'transition-transform active:scale-95',
            )}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" fill="currentColor" aria-hidden="true" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true" />
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onSkipForward}
            className="h-10 w-10 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Skip forward 10 seconds"
          >
            <SkipForward className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Time display and progress */}
        <div className="hidden flex-1 items-center gap-3 md:flex">
          <span className="w-12 text-right font-mono text-xs text-white/60">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              buffered={buffered}
              onSeek={onSeek}
              showTooltip
              compact
            />
          </div>
          <span className="w-12 font-mono text-xs text-white/60">{formatTime(duration)}</span>
        </div>

        {/* Additional controls */}
        <div className="flex items-center gap-2">
          {/* Modality switcher */}
          {hasVideo && hasAudio && (
            <ModalitySwitcher
              mode={modality}
              onModeChange={onModalityChange}
              hasVideo={hasVideo}
              hasAudio={hasAudio}
              size="sm"
            />
          )}

          {/* Speed control */}
          <SpeedControl speed={playbackSpeed} onSpeedChange={onSpeedChange} size="sm" />

          {/* Volume control */}
          <fieldset
            className="relative flex items-center border-0 p-0 m-0"
            onMouseEnter={handleVolumeMouseEnter}
            onMouseLeave={handleVolumeMouseLeave}
            aria-label="Volume controls"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMuteToggle}
              className="h-10 w-10 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Volume2 className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>

            {/* Volume slider popup */}
            <div
              className={cn(
                'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3',
                'rounded-lg bg-black/90 backdrop-blur-xl border border-white/10',
                'transition-all duration-200',
                showVolumeSlider
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-2 pointer-events-none',
              )}
            >
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                orientation="vertical"
                onValueChange={(value) => onVolumeChange(value[0] / 100)}
                className="h-24"
                aria-label="Volume"
              />
            </div>
          </fieldset>

          {/* Minimize toggle */}
          {onMinimizeToggle && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMinimizeToggle}
              className="h-10 w-10 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              aria-label={isMinimized ? 'Expand player' : 'Minimize player'}
            >
              {isMinimized ? (
                <Maximize2 className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Minimize2 className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export default PlayerBar;
