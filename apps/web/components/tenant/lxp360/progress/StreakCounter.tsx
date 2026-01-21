'use client';

import { Flame, Snowflake } from 'lucide-react';
import { cn } from '@/lib/core/utils';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  freezesAvailable?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'detailed' | 'compact';
  className?: string;
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  freezesAvailable = 0,
  size = 'md',
  variant = 'default',
  className,
}: StreakCounterProps) {
  const getStreakColor = () => {
    if (currentStreak >= 100) return 'text-brand-warning';
    if (currentStreak >= 30) return 'text-orange-400';
    if (currentStreak >= 7) return 'text-brand-error';
    return 'text-brand-muted';
  };

  const getStreakBgColor = () => {
    if (currentStreak >= 100) return 'bg-brand-warning/10 border-amber-500/30';
    if (currentStreak >= 30) return 'bg-brand-warning/10 border-orange-500/30';
    if (currentStreak >= 7) return 'bg-brand-error/10 border-brand-error/30';
    return 'bg-gray-500/10 border-gray-500/30';
  };

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1',
      icon: 'w-4 h-4',
      text: 'text-sm',
      detail: 'text-xs',
    },
    md: {
      container: 'px-3 py-2',
      icon: 'w-5 h-5',
      text: 'text-base',
      detail: 'text-sm',
    },
    lg: {
      container: 'px-4 py-3',
      icon: 'w-6 h-6',
      text: 'text-lg',
      detail: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  if (variant === 'compact') {
    return (
      <div className={cn('inline-flex items-center gap-1', getStreakColor(), className)}>
        <Flame className={cn(sizes.icon, currentStreak > 0 && 'animate-pulse')} />
        <span className={cn('font-bold', sizes.text)}>{currentStreak}</span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        className={cn('rounded-2xl border p-4', className)}
        style={{
          backgroundColor: '#0d1829',
          borderColor: 'rgba(30, 58, 95, 0.5)',
        }}
      >
        <div className="flex items-center gap-4">
          {/* Current streak */}
          <div
            className={cn(
              'flex items-center justify-center w-16 h-16 rounded-full border-2',
              getStreakBgColor(),
            )}
          >
            <div className="text-center">
              <Flame
                className={cn(
                  'w-6 h-6 mx-auto',
                  getStreakColor(),
                  currentStreak > 0 && 'animate-pulse',
                )}
              />
              <span className={cn('font-bold', getStreakColor())}>{currentStreak}</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-brand-primary font-semibold">
              {currentStreak} day{currentStreak !== 1 ? 's' : ''} streak
            </p>
            <p className="text-sm text-muted-foreground">
              {currentStreak === 0
                ? 'Start learning to build your streak!'
                : currentStreak >= 7
                  ? 'Keep up the great work!'
                  : 'Learn daily to build your streak'}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-2">
              {longestStreak !== undefined && (
                <div className="text-xs text-muted-foreground">
                  <span className="text-muted-foreground">Best:</span>{' '}
                  <span className="text-brand-primary font-medium">{longestStreak} days</span>
                </div>
              )}
              {freezesAvailable > 0 && (
                <div className="flex items-center gap-1 text-xs text-brand-cyan">
                  <Snowflake className="w-3 h-3" />
                  <span>
                    {freezesAvailable} freeze{freezesAvailable !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Streak calendar preview - last 7 days */}
        <div
          className="flex items-center gap-1 mt-4 pt-4 border-t"
          style={{ borderColor: 'rgba(30, 58, 95, 0.5)' }}
        >
          {Array.from({ length: 7 }).map((_, i) => {
            const isActive = i < Math.min(currentStreak, 7);
            return (
              <div
                key={i}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium',
                  isActive
                    ? 'bg-brand-error/20 text-brand-error border border-brand-error/30'
                    : 'bg-muted/10 text-muted-foreground border border-border',
                )}
              >
                {isActive ? <Flame className="w-4 h-4" /> : ''}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border',
        getStreakBgColor(),
        sizes.container,
        className,
      )}
    >
      <Flame className={cn(sizes.icon, getStreakColor(), currentStreak > 0 && 'animate-pulse')} />
      <span className={cn('font-bold', getStreakColor(), sizes.text)}>{currentStreak}</span>
      <span className={cn('text-muted-foreground', sizes.detail)}>
        day{currentStreak !== 1 ? 's' : ''}
      </span>
      {freezesAvailable > 0 && (
        <>
          <span className="text-muted-foreground">•</span>
          <Snowflake className={cn('w-4 h-4 text-brand-cyan')} />
          <span className={cn('text-brand-cyan', sizes.detail)}>{freezesAvailable}</span>
        </>
      )}
    </div>
  );
}

export default StreakCounter;
