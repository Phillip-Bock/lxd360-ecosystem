'use client';

import type React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  /** Progress value from 0-100 (or 0-max if max is specified) */
  value: number;
  /** Maximum value (defaults to 100) */
  max?: number;
  /** Size of the progress bar */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'gradient' | 'striped' | 'segmented';
  /** Color theme */
  color?: 'cyan' | 'purple' | 'green' | 'blue' | 'amber' | 'red';
  /** Number of segments (only used with variant='segmented') */
  segments?: number;
  /** Completed segments count (alternative to value for segmented variant) */
  completedSegments?: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: 'inside' | 'right' | 'below';
  /** Enable animation */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const sizeConfig = {
  sm: { height: 'h-1.5', gap: 'gap-0.5' },
  md: { height: 'h-2.5', gap: 'gap-1' },
  lg: { height: 'h-4', gap: 'gap-1.5' },
} as const;

const colorConfig = {
  cyan: {
    bg: 'bg-[var(--color-neural-cyan)]',
    gradient: 'bg-gradient-to-r from-[var(--color-neural-cyan)] to-[var(--color-neural-cyan)]/70',
  },
  purple: {
    bg: 'bg-[var(--color-neural-purple)]',
    gradient:
      'bg-gradient-to-r from-[var(--color-neural-purple)] to-[var(--color-neural-purple)]/70',
  },
  green: {
    bg: 'bg-[var(--color-lxd-success)]',
    gradient: 'bg-gradient-to-r from-[var(--color-lxd-success)] to-emerald-400',
  },
  blue: {
    bg: 'bg-[var(--color-lxd-primary)]',
    gradient: 'bg-gradient-to-r from-[var(--color-lxd-primary)] to-[var(--color-lxd-secondary)]',
  },
  amber: {
    bg: 'bg-amber-500',
    gradient: 'bg-gradient-to-r from-amber-500 to-amber-400',
  },
  red: {
    bg: 'bg-[var(--color-lxd-error)]',
    gradient: 'bg-gradient-to-r from-[var(--color-lxd-error)] to-red-400',
  },
} as const;

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  color = 'cyan',
  segments = 5,
  completedSegments,
  showLabel = false,
  labelPosition = 'right',
  animated = true,
  className,
}: ProgressBarProps): React.JSX.Element {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const sizeClasses = sizeConfig[size];
  const colorClasses = colorConfig[color];

  const ProgressLabel = (): React.JSX.Element => (
    <span
      className={cn(
        'text-xs font-medium',
        labelPosition === 'inside' ? 'text-white' : 'text-muted-foreground',
      )}
    >
      {Math.round(percentage)}%
    </span>
  );

  // Segmented variant
  if (variant === 'segmented') {
    const completed = completedSegments ?? Math.round((percentage / 100) * segments);

    return (
      <div
        className={cn('w-full', className)}
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={segments}
        aria-label={`Progress: ${completed} of ${segments} completed`}
      >
        <div
          className={cn(
            'flex items-center',
            sizeClasses.gap,
            labelPosition === 'below' && 'flex-col items-stretch gap-1',
          )}
        >
          <div className={cn('flex flex-1', sizeClasses.gap)}>
            {Array.from({ length: segments }).map((_, index) => {
              const isCompleted = index < completed;
              return (
                <div
                  key={index}
                  className={cn(
                    'flex-1 rounded-sm',
                    sizeClasses.height,
                    isCompleted
                      ? cn(
                          colorClasses.bg,
                          animated &&
                            'transition-colors duration-300 motion-reduce:transition-none',
                        )
                      : 'bg-muted/30',
                  )}
                />
              );
            })}
          </div>
          {showLabel && labelPosition === 'right' && (
            <span className="text-xs font-medium text-muted-foreground">
              {completed}/{segments}
            </span>
          )}
          {showLabel && labelPosition === 'below' && (
            <div className="flex justify-end">
              <span className="text-xs font-medium text-muted-foreground">
                {completed}/{segments}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard progress bar (default, gradient, striped)
  return (
    <div
      className={cn('w-full', className)}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${Math.round(percentage)}%`}
    >
      <div
        className={cn(
          'flex items-center gap-2',
          labelPosition === 'below' && 'flex-col items-stretch gap-1',
        )}
      >
        <div className={cn('flex-1 rounded-full bg-muted/30 overflow-hidden', sizeClasses.height)}>
          <div
            className={cn(
              'h-full rounded-full',
              animated && 'transition-all duration-500 ease-out motion-reduce:transition-none',
              variant === 'gradient' ? colorClasses.gradient : colorClasses.bg,
              variant === 'striped' &&
                'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]',
              animated &&
                variant === 'striped' &&
                'animate-[progress-stripes_1s_linear_infinite] motion-reduce:animate-none',
              labelPosition === 'inside' && 'flex items-center justify-end pr-2',
            )}
            style={{ width: `${percentage}%` }}
          >
            {showLabel && labelPosition === 'inside' && size === 'lg' && percentage > 15 && (
              <ProgressLabel />
            )}
          </div>
        </div>
        {showLabel && labelPosition === 'right' && <ProgressLabel />}
        {showLabel && labelPosition === 'below' && (
          <div className="flex justify-end">
            <ProgressLabel />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressBar;
