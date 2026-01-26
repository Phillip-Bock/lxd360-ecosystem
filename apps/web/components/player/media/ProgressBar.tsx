'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatTime } from './types';

/**
 * =============================================================================
 * LXD360 | ProgressBar Component
 * =============================================================================
 *
 * Clickable/draggable progress bar with time display and buffer indicator.
 * Features neural-futuristic theme styling with cyan/purple accents.
 *
 * @version 1.0.0
 * @updated 2026-01-26
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
  /** Additional CSS classes */
  className?: string;
  /** Chapter markers */
  chapters?: ChapterMarker[];
  /** Accessible label */
  label?: string;
}

export interface ChapterMarker {
  id: string;
  time: number;
  title: string;
}

export function ProgressBar({
  currentTime,
  duration,
  buffered = 0,
  onSeek,
  showTooltip = true,
  className,
  chapters = [],
  label = 'Video progress',
}: ProgressBarProps): React.JSX.Element {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

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
      {/* Time Display */}
      <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
        <span className="font-mono">{formatTime(currentTime)}</span>
        {currentChapter && (
          <span className="mx-2 truncate text-cyan-400">{currentChapter.title}</span>
        )}
        <span className="font-mono">{formatTime(duration)}</span>
      </div>

      {/* Progress Bar Container */}
      <div
        ref={progressRef}
        className={cn(
          'group relative h-2 w-full cursor-pointer rounded-full',
          'bg-white/10 backdrop-blur-sm',
          'transition-all duration-200 hover:h-3',
          isDragging && 'h-3',
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
        {/* Buffer Track */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/20"
          style={{ width: `${buffered}%` }}
          aria-hidden="true"
        />

        {/* Progress Track */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_10px_rgba(0,212,255,0.5)]"
          style={{ width: `${progressPercent}%` }}
          aria-hidden="true"
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div
              className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{ animationPlayState: isDragging ? 'paused' : 'running' }}
            />
          </div>
        </div>

        {/* Chapter Markers */}
        {chapters.map((chapter) => {
          const markerPosition = duration > 0 ? (chapter.time / duration) * 100 : 0;
          return (
            <div
              key={chapter.id}
              className="absolute top-1/2 h-full w-0.5 -translate-y-1/2 bg-white/40 transition-all group-hover:h-full"
              style={{ left: `${markerPosition}%` }}
              title={chapter.title}
              aria-hidden="true"
            />
          );
        })}

        {/* Scrubber Handle */}
        <div
          className={cn(
            'absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full',
            'bg-white shadow-[0_0_10px_rgba(0,212,255,0.8)]',
            'opacity-0 transition-all duration-200 group-hover:opacity-100',
            'ring-2 ring-cyan-500/50',
            isDragging && 'scale-125 opacity-100',
          )}
          style={{ left: `${progressPercent}%` }}
          aria-hidden="true"
        />

        {/* Hover Indicator */}
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
              'bg-black/90 px-2 py-1 text-xs font-mono text-white',
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
    </div>
  );
}

export default ProgressBar;
