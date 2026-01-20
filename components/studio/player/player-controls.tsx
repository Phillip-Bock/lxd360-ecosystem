'use client';

/**
 * =============================================================================
 * INSPIRE Studio - Player Controls Component
 * =============================================================================
 *
 * Navigation and playback controls for the lesson player.
 * Includes slide navigation, timeline controls, and utility buttons.
 *
 * @module components/studio/player/player-controls
 * @version 1.0.0
 */

import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Settings,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { usePlayerContext } from '@/providers/player-provider';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface PlayerControlsProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
  variant?: 'minimal' | 'standard' | 'full';
}

// =============================================================================
// CONTROL BUTTON COMPONENT
// =============================================================================

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary';
}

function ControlButton({
  onClick,
  disabled,
  title,
  children,
  size = 'md',
  variant = 'default',
}: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex items-center justify-center rounded-sm transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        disabled && 'opacity-50 cursor-not-allowed',
        variant === 'default' && 'hover:bg-white/10 text-white',
        variant === 'primary' && 'bg-primary hover:bg-primary/90 text-primary-foreground',
        size === 'sm' && 'w-8 h-8',
        size === 'md' && 'w-10 h-10',
        size === 'lg' && 'w-12 h-12',
      )}
      aria-label={title}
    >
      {children}
    </button>
  );
}

// =============================================================================
// TIMELINE SCRUBBER
// =============================================================================

function TimelineScrubber() {
  const player = usePlayerContext();
  const { currentTime, duration } = player.timelineState;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = percent * duration;
      player.seekTimeline(Math.max(0, Math.min(time, duration)));
    },
    [player, duration],
  );

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (duration === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4">
      <span className="text-xs text-white/70 w-10 text-right">{formatTime(currentTime)}</span>

      <button
        type="button"
        className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer group border-none"
        onClick={handleSeek}
        aria-label="Seek position"
      >
        <div className="h-full bg-primary rounded-full relative" style={{ width: `${progress}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>

      <span className="text-xs text-white/70 w-10">{formatTime(duration)}</span>
    </div>
  );
}

// =============================================================================
// MAIN CONTROLS COMPONENT
// =============================================================================

export function PlayerControls({
  isFullscreen,
  onToggleFullscreen,
  className,
  variant = 'standard',
}: PlayerControlsProps) {
  const player = usePlayerContext();

  // Get slide info
  const currentSlideIndex = player.state.currentSlideIndex;
  const totalSlides = player.state.lesson?.slides.length || 0;
  const showSlideNumbers = player.state.lesson?.settings.showSlideNumbers ?? true;

  // Minimal variant - just navigation
  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-4 p-2 bg-black/60 backdrop-blur-sm',
          className,
        )}
      >
        <ControlButton
          onClick={player.prevSlide}
          disabled={!player.canGoPrev}
          title="Previous slide"
          size="sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </ControlButton>

        {showSlideNumbers && (
          <span className="text-sm text-white/80 min-w-15 text-center">
            {currentSlideIndex + 1} / {totalSlides}
          </span>
        )}

        <ControlButton
          onClick={player.nextSlide}
          disabled={!player.canGoNext}
          title="Next slide"
          size="sm"
        >
          <ChevronRight className="w-5 h-5" />
        </ControlButton>
      </div>
    );
  }

  // Standard variant - navigation + playback
  return (
    <div
      className={cn(
        'bg-linear-to-t from-black/80 via-black/60 to-transparent pt-8 pb-4 px-4',
        className,
      )}
    >
      {/* Timeline scrubber */}
      {variant === 'full' && <TimelineScrubber />}

      {/* Main controls */}
      <div className="flex items-center justify-between mt-2">
        {/* Left section - Navigation */}
        <div className="flex items-center gap-2">
          <ControlButton
            onClick={player.goToFirstSlide}
            disabled={currentSlideIndex === 0}
            title="First slide"
            size="sm"
          >
            <SkipBack className="w-4 h-4" />
          </ControlButton>

          <ControlButton
            onClick={player.prevSlide}
            disabled={!player.canGoPrev}
            title="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </ControlButton>
        </div>

        {/* Center section - Playback + Slide counter */}
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          {player.state.lesson?.slides[currentSlideIndex]?.timeline && (
            <ControlButton
              onClick={player.togglePlayPause}
              title={player.isPlaying ? 'Pause' : 'Play'}
              variant="primary"
              size="lg"
            >
              {player.isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </ControlButton>
          )}

          {/* Slide counter */}
          {showSlideNumbers && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{currentSlideIndex + 1}</span>
              <span className="text-sm text-white/50">/</span>
              <span className="text-sm text-white/70">{totalSlides}</span>
            </div>
          )}
        </div>

        {/* Right section - Navigation + Utilities */}
        <div className="flex items-center gap-2">
          <ControlButton onClick={player.nextSlide} disabled={!player.canGoNext} title="Next slide">
            <ChevronRight className="w-6 h-6" />
          </ControlButton>

          <ControlButton
            onClick={player.goToLastSlide}
            disabled={currentSlideIndex === totalSlides - 1}
            title="Last slide"
            size="sm"
          >
            <SkipForward className="w-4 h-4" />
          </ControlButton>

          {/* Separator */}
          <div className="w-px h-6 bg-white/20 mx-2" />

          {/* Utility buttons */}
          {variant === 'full' && (
            <>
              <ControlButton onClick={() => {}} title="Settings" size="sm">
                <Settings className="w-4 h-4" />
              </ControlButton>

              <ControlButton onClick={player.reset} title="Restart lesson" size="sm">
                <RotateCcw className="w-4 h-4" />
              </ControlButton>
            </>
          )}

          {/* Fullscreen button */}
          {onToggleFullscreen && (
            <ControlButton
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              size="sm"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </ControlButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerControls;
