'use client';

/**
 * =============================================================================
 * LXD360 | ProgressBar Component
 * =============================================================================
 *
 * Seekable timeline with buffered indicator and chapter markers.
 * Neural-futuristic styling with cyan/purple gradient.
 *
 * @version 1.0.0
 * @updated 2026-01-27
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Chapter marker for progress bar
 */
export interface ChapterMarker {
  id: string;
  time: number;
  title: string;
}

/**
 * ProgressBar component props
 */
export interface ProgressBarProps {
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Buffered percentage (0-100) */
  buffered?: number;
  /** Called when user seeks to a new time */
  onSeek: (time: number) => void;
  /** Show time tooltip on hover */
  showTooltip?: boolean;
  /** Chapter markers */
  chapters?: ChapterMarker[];
  /** Compact mode (smaller height) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  label?: string;
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
 * ProgressBar - Seekable timeline with buffering indicator
 *
 * Features:
 * - Click/drag to seek
 * - Time tooltip on hover
 * - Buffer progress indicator
 * - Chapter markers
 * - Keyboard accessible
 */
export function ProgressBar({
  currentTime,
  duration,
  buffered = 0,
  onSeek,
  showTooltip = true,
  chapters = [],
  compact = false,
  className,
  label = 'Playback progress',
}: ProgressBarProps): React.JSX.Element {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  // Respect reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Calculate progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Get time from mouse position
  const getTimeFromPosition = useCallback(
    (clientX: number): number => {
      if (!progressRef.current || duration <= 0) return 0;

      const rect = progressRef.current.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;
      const clampedPosition = Math.max(0, Math.min(1, position));

      return clampedPosition * duration;
    },
    [duration],
  );

  // Handle click to seek
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const time = getTimeFromPosition(e.clientX);
      onSeek(time);
    },
    [getTimeFromPosition, onSeek],
  );

  // Handle mouse move for tooltip
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;

      const rect = progressRef.current.getBoundingClientRect();
      const position = ((e.clientX - rect.left) / rect.width) * 100;
      const time = getTimeFromPosition(e.clientX);

      setHoverPosition(Math.max(5, Math.min(95, position)));
      setHoverTime(time);

      if (isDragging) {
        onSeek(time);
      }
    },
    [getTimeFromPosition, isDragging, onSeek],
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setHoverTime(null);
    }
  }, [isDragging]);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle drag during mouse move (global)
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent): void => {
      const time = getTimeFromPosition(e.clientX);
      onSeek(time);
    };

    const handleGlobalMouseUp = (): void => {
      setIsDragging(false);
      setHoverTime(null);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, getTimeFromPosition, onSeek]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 30 : 10;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onSeek(Math.max(currentTime - step, 0));
          break;
        case 'ArrowRight':
          e.preventDefault();
          onSeek(Math.min(currentTime + step, duration));
          break;
        case 'Home':
          e.preventDefault();
          onSeek(0);
          break;
        case 'End':
          e.preventDefault();
          onSeek(duration);
          break;
      }
    },
    [currentTime, duration, onSeek],
  );

  // Find current chapter
  const currentChapter = chapters
    .slice()
    .reverse()
    .find((chapter) => chapter.time <= currentTime);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Progress bar container */}
      <div
        ref={progressRef}
        className={cn(
          'group relative w-full cursor-pointer rounded-full',
          'bg-white/10 backdrop-blur-sm',
          compact ? 'h-1 hover:h-2' : 'h-2 hover:h-3',
          !prefersReducedMotion && 'transition-all duration-200',
          isDragging && (compact ? 'h-2' : 'h-3'),
        )}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        tabIndex={0}
      >
        {/* Buffer track */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/20"
          style={{ width: `${buffered}%` }}
          aria-hidden="true"
        />

        {/* Progress track */}
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            'bg-gradient-to-r from-cyan-500 to-purple-500',
            'shadow-[0_0_10px_rgba(0,212,255,0.5)]',
          )}
          style={{ width: `${progressPercent}%` }}
          aria-hidden="true"
        >
          {/* Shimmer effect */}
          {!prefersReducedMotion && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ animationPlayState: isDragging ? 'paused' : 'running' }}
              />
            </div>
          )}
        </div>

        {/* Chapter markers */}
        {chapters.map((chapter) => {
          const markerPosition = duration > 0 ? (chapter.time / duration) * 100 : 0;
          return (
            <div
              key={chapter.id}
              className={cn(
                'absolute top-1/2 h-full w-0.5 -translate-y-1/2 bg-white/40',
                !prefersReducedMotion && 'transition-all group-hover:h-full',
              )}
              style={{ left: `${markerPosition}%` }}
              title={chapter.title}
              aria-hidden="true"
            />
          );
        })}

        {/* Scrubber handle */}
        <div
          className={cn(
            'absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full',
            'bg-white shadow-[0_0_10px_rgba(0,212,255,0.8)]',
            'ring-2 ring-cyan-500/50',
            'opacity-0 group-hover:opacity-100',
            !prefersReducedMotion && 'transition-all duration-200',
            isDragging && 'scale-125 opacity-100',
          )}
          style={{ left: `${progressPercent}%` }}
          aria-hidden="true"
        />

        {/* Hover indicator */}
        {hoverTime !== null && !isDragging && (
          <div
            className="absolute top-1/2 h-full w-0.5 -translate-y-1/2 bg-white/40"
            style={{ left: `${hoverPosition}%` }}
            aria-hidden="true"
          />
        )}

        {/* Tooltip */}
        {showTooltip && hoverTime !== null && (
          <div
            className={cn(
              'absolute -top-10 -translate-x-1/2 rounded-md',
              'bg-black/90 px-2 py-1 font-mono text-xs text-white',
              'shadow-[0_0_10px_rgba(0,212,255,0.3)] backdrop-blur-sm',
              'pointer-events-none',
            )}
            style={{ left: `${hoverPosition}%` }}
            aria-hidden="true"
          >
            {formatTime(hoverTime)}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black/90" />
          </div>
        )}
      </div>

      {/* Current chapter display */}
      {currentChapter && !compact && (
        <div className="mt-1 text-center text-xs text-cyan-400">{currentChapter.title}</div>
      )}
    </div>
  );
}

export default ProgressBar;
