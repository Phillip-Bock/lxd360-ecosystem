'use client';

import { Check, Lock, Play } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

export type LessonState = 'completed' | 'current' | 'locked' | 'available';

export interface LessonIndicatorProps {
  /** Current state of the lesson */
  state: LessonState;
  /** Lesson number (displayed when not completed) */
  lessonNumber?: number;
  /** Size of the indicator */
  size?: 'sm' | 'md' | 'lg';
  /** Color theme for completed state */
  color?: 'cyan' | 'purple' | 'green';
  /** Show pulse animation for current lesson */
  showPulse?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const sizeConfig = {
  sm: {
    container: 'w-6 h-6',
    icon: 'w-3 h-3',
    text: 'text-xs',
    ring: 'ring-2 ring-offset-1',
  },
  md: {
    container: 'w-8 h-8',
    icon: 'w-4 h-4',
    text: 'text-sm',
    ring: 'ring-2 ring-offset-2',
  },
  lg: {
    container: 'w-10 h-10',
    icon: 'w-5 h-5',
    text: 'text-base',
    ring: 'ring-[3px] ring-offset-2',
  },
} as const;

const colorConfig = {
  cyan: {
    bg: 'bg-[var(--color-neural-cyan)]',
    text: 'text-[var(--color-neural-cyan)]',
    ring: 'ring-[var(--color-neural-cyan)]/50',
  },
  purple: {
    bg: 'bg-[var(--color-neural-purple)]',
    text: 'text-[var(--color-neural-purple)]',
    ring: 'ring-[var(--color-neural-purple)]/50',
  },
  green: {
    bg: 'bg-[var(--color-lxd-success)]',
    text: 'text-[var(--color-lxd-success)]',
    ring: 'ring-[var(--color-lxd-success)]/50',
  },
} as const;

export function LessonIndicator({
  state,
  lessonNumber,
  size = 'md',
  color = 'cyan',
  showPulse = true,
  className,
}: LessonIndicatorProps): React.JSX.Element {
  const sizeClasses = sizeConfig[size];
  const colorClasses = colorConfig[color];

  const getStateLabel = (): string => {
    switch (state) {
      case 'completed':
        return 'Lesson completed';
      case 'current':
        return 'Current lesson';
      case 'locked':
        return 'Lesson locked';
      case 'available':
        return 'Lesson available';
    }
  };

  const baseClasses = cn(
    'relative flex items-center justify-center rounded-full',
    'transition-all duration-200 motion-reduce:transition-none',
    sizeClasses.container,
  );

  // Completed state
  if (state === 'completed') {
    return (
      <div
        className={cn(baseClasses, colorClasses.bg, 'text-white', className)}
        role="img"
        aria-label={getStateLabel()}
      >
        <Check className={sizeClasses.icon} strokeWidth={3} aria-hidden="true" />
      </div>
    );
  }

  // Current state
  if (state === 'current') {
    return (
      <div
        className={cn(
          baseClasses,
          'bg-background border-2',
          `border-[var(--color-neural-${color === 'cyan' ? 'cyan' : color === 'purple' ? 'purple' : 'cyan'})]`,
          colorClasses.text,
          sizeClasses.ring,
          colorClasses.ring,
          'ring-offset-background',
          className,
        )}
        role="img"
        aria-label={getStateLabel()}
        aria-current="step"
      >
        {showPulse && (
          <span
            className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-30 motion-reduce:animate-none',
              colorClasses.bg,
            )}
            aria-hidden="true"
          />
        )}
        <Play className={cn(sizeClasses.icon, 'ml-0.5')} fill="currentColor" aria-hidden="true" />
      </div>
    );
  }

  // Locked state
  if (state === 'locked') {
    return (
      <div
        className={cn(
          baseClasses,
          'bg-muted/50 text-muted-foreground/50 cursor-not-allowed',
          className,
        )}
        role="img"
        aria-label={getStateLabel()}
        aria-disabled="true"
      >
        <Lock className={sizeClasses.icon} aria-hidden="true" />
      </div>
    );
  }

  // Available state (shows lesson number)
  return (
    <div
      className={cn(
        baseClasses,
        'bg-muted/30 text-muted-foreground border border-muted/50',
        'hover:bg-muted/50 hover:border-muted',
        className,
      )}
      role="img"
      aria-label={getStateLabel()}
    >
      <span className={cn('font-medium', sizeClasses.text)}>{lessonNumber ?? ''}</span>
    </div>
  );
}

export default LessonIndicator;
