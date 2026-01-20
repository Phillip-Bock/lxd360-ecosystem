'use client';

import type React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'striped';
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'red';
  showLabel?: boolean;
  labelPosition?: 'inside' | 'right' | 'below';
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  color = 'blue',
  showLabel = false,
  labelPosition = 'right',
  animated = true,
  className,
}: ProgressBarProps): React.JSX.Element {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    blue: {
      bg: 'bg-[var(--studio-accent)]',
      gradient: 'bg-linear-to-r from-[var(--studio-accent)] to-studio-accent-hover',
    },
    purple: {
      bg: 'bg-[var(--lxd-purple-light)]',
      gradient: 'bg-linear-to-r from-[var(--lxd-purple-light)] to-lxd-purple',
    },
    emerald: {
      bg: 'bg-brand-success',
      gradient: 'bg-linear-to-r from-emerald-500 to-emerald-400',
    },
    amber: {
      bg: 'bg-brand-warning',
      gradient: 'bg-linear-to-r from-amber-500 to-amber-400',
    },
    red: {
      bg: 'bg-brand-error',
      gradient: 'bg-linear-to-r from-red-500 to-red-400',
    },
  };

  const colors = colorClasses[color];

  const ProgressLabel = (): React.JSX.Element => (
    <span
      className={cn(
        'text-xs font-medium',
        labelPosition === 'inside' ? 'text-brand-primary' : 'text-muted-foreground',
      )}
    >
      {Math.round(percentage)}%
    </span>
  );

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex items-center gap-2',
          labelPosition === 'below' && 'flex-col items-stretch gap-1',
        )}
      >
        <div
          className={cn(
            'flex-1 rounded-full bg-[var(--lxd-dark-surface-alt)]/50 overflow-hidden',
            sizeClasses[size],
          )}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              variant === 'gradient' ? colors.gradient : colors.bg,
              variant === 'striped' &&
                'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]',
              animated && variant === 'striped' && 'animate-[progress-stripes_1s_linear_infinite]',
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
