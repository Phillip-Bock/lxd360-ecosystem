'use client';

/**
 * =============================================================================
 * INSPIRE Studio - Progress Bar Component
 * =============================================================================
 *
 * Displays lesson progress as a visual bar with slide completion indicators.
 *
 * @module components/studio/player/progress-bar
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { usePlayerContext } from '@/providers/player-provider';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface ProgressBarProps {
  className?: string;
  variant?: 'simple' | 'detailed' | 'segments';
  showPercentage?: boolean;
}

// =============================================================================
// PROGRESS BAR COMPONENT
// =============================================================================

export function ProgressBar({
  className,
  variant = 'simple',
  showPercentage = false,
}: ProgressBarProps) {
  const player = usePlayerContext();

  const { progress, currentSlideIndex, lesson, visitedSlides } = useMemo(
    () => ({
      progress: player.progress,
      currentSlideIndex: player.state.currentSlideIndex,
      lesson: player.state.lesson,
      visitedSlides: player.state.visitedSlides,
    }),
    [
      player.progress,
      player.state.currentSlideIndex,
      player.state.lesson,
      player.state.visitedSlides,
    ],
  );

  const totalSlides = lesson?.slides.length || 0;
  const percentComplete = progress.percentComplete;

  // Simple variant - single progress bar
  if (variant === 'simple') {
    return (
      <div className={cn('w-full', className)}>
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        {showPercentage && (
          <div className="mt-1 text-xs text-white/70 text-center">
            {Math.round(percentComplete)}% complete
          </div>
        )}
      </div>
    );
  }

  // Detailed variant - shows current position and completion
  if (variant === 'detailed') {
    const currentPosition = totalSlides > 0 ? ((currentSlideIndex + 1) / totalSlides) * 100 : 0;

    return (
      <div className={cn('w-full px-4 py-2', className)}>
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          {/* Completed progress */}
          <div
            className="absolute inset-y-0 left-0 bg-primary/50 transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          />

          {/* Current position indicator */}
          <div
            className="absolute inset-y-0 w-1 bg-white transition-all duration-300"
            style={{ left: `${currentPosition}%`, transform: 'translateX(-50%)' }}
          />
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-xs text-white/70">
            Slide {currentSlideIndex + 1} of {totalSlides}
          </span>
          {showPercentage && (
            <span className="text-xs text-white/70">{Math.round(percentComplete)}% complete</span>
          )}
        </div>
      </div>
    );
  }

  // Segments variant - individual slide segments
  return (
    <div className={cn('w-full px-4 py-2', className)}>
      <div className="flex gap-0.5">
        {Array.from({ length: totalSlides }).map((_, index) => {
          const slideId = lesson?.slides[index]?.id;
          const isCompleted = slideId && progress.completedSlides.has(slideId);
          const isVisited = slideId && visitedSlides.has(slideId);
          const isCurrent = index === currentSlideIndex;

          return (
            <div
              key={index}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all duration-200',
                isCompleted ? 'bg-primary' : isVisited ? 'bg-primary/40' : 'bg-white/20',
                isCurrent && 'ring-1 ring-white',
              )}
              title={`Slide ${index + 1}${isCompleted ? ' (completed)' : isVisited ? ' (visited)' : ''}`}
            />
          );
        })}
      </div>

      {showPercentage && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-white/70">
            {progress.completedSlides.size} of {totalSlides} slides completed
          </span>
          <span className="text-xs text-white/70">{Math.round(percentComplete)}%</span>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
