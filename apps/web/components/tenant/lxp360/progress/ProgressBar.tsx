'use client';

import { cn } from '@/lib/core/utils';

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
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    blue: {
      bg: 'bg-transparent',
      gradient: 'bg-transparent',
      style: { backgroundColor: 'var(--lxd-blue-light)' },
      gradientStyle: {
        backgroundImage: 'linear-gradient(to right, var(--lxd-blue-light), #3a8ae6)',
      },
    },
    purple: {
      bg: 'bg-transparent',
      gradient: 'bg-transparent',
      style: { backgroundColor: 'var(--brand-secondary)' },
      gradientStyle: {
        backgroundImage: 'linear-gradient(to right, var(--brand-secondary), #9c1dd4)',
      },
    },
    emerald: {
      bg: 'bg-transparent',
      gradient: 'bg-transparent',
      style: { backgroundColor: 'var(--color-lxd-success)' },
      gradientStyle: {
        backgroundImage: 'linear-gradient(to right, var(--color-lxd-success), #4ade80)',
      },
    },
    amber: {
      bg: 'bg-transparent',
      gradient: 'bg-transparent',
      style: { backgroundColor: 'var(--color-lxd-warning)' },
      gradientStyle: {
        backgroundImage: 'linear-gradient(to right, var(--color-lxd-warning), #fbbf24)',
      },
    },
    red: {
      bg: 'bg-transparent',
      gradient: 'bg-transparent',
      style: { backgroundColor: 'var(--color-lxd-error)' },
      gradientStyle: {
        backgroundImage: 'linear-gradient(to right, var(--color-lxd-error), #f87171)',
      },
    },
  };

  const colors = colorClasses[color];

  const ProgressLabel = () => (
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
          className={cn('flex-1 rounded-full overflow-hidden', sizeClasses[size])}
          style={{ backgroundColor: 'rgba(30, 58, 95, 0.5)' }}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              variant === 'gradient' ? colors.gradient : colors.bg,
              variant === 'striped' && 'bg-[length:1rem_1rem]',
              animated && variant === 'striped' && 'animate-[progress-stripes_1s_linear_infinite]',
              labelPosition === 'inside' && 'flex items-center justify-end pr-2',
            )}
            style={{
              width: `${percentage}%`,
              ...(variant === 'gradient' ? colors.gradientStyle : colors.style),
              ...(variant === 'striped' && {
                backgroundImage:
                  'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
              }),
            }}
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
