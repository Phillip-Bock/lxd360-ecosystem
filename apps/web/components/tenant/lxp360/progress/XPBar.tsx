'use client';

import { Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/core/utils';
import { ProgressBar } from './ProgressBar';

interface XPBarProps {
  currentXP: number;
  xpToNextLevel: number;
  level: number;
  levelName?: string;
  recentGain?: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function XPBar({
  currentXP,
  xpToNextLevel,
  level,
  levelName,
  recentGain,
  showDetails = true,
  size = 'md',
  className,
}: XPBarProps) {
  const totalXPForLevel = currentXP + xpToNextLevel;
  const progress = (currentXP / totalXPForLevel) * 100;

  const sizeClasses = {
    sm: {
      container: 'p-2',
      level: 'w-8 h-8 text-sm',
      text: 'text-xs',
      bar: 'sm' as const,
    },
    md: {
      container: 'p-3',
      level: 'w-10 h-10 text-base',
      text: 'text-sm',
      bar: 'md' as const,
    },
    lg: {
      container: 'p-4',
      level: 'w-12 h-12 text-lg',
      text: 'text-base',
      bar: 'lg' as const,
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn('rounded-2xl border', sizes.container, className)}
      style={{
        backgroundColor: '#0d1829',
        borderColor: 'rgba(30, 58, 95, 0.5)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Level badge */}
        <div
          className={cn(
            'flex items-center justify-center rounded-xl font-bold text-brand-primary',
            sizes.level,
          )}
          style={{
            backgroundImage:
              'linear-gradient(to bottom right, var(--lxd-blue-light), var(--brand-secondary))',
          }}
        >
          {level}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={cn('font-semibold text-brand-primary', sizes.text)}>
                {levelName || `Level ${level}`}
              </span>
              {recentGain && recentGain > 0 && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full',
                    'bg-brand-success/10 text-brand-success',
                    'text-xs font-medium animate-pulse',
                  )}
                >
                  <TrendingUp className="w-3 h-3" />+{recentGain}
                </span>
              )}
            </div>
            {showDetails && (
              <span className={cn('text-muted-foreground', sizes.text)}>
                {currentXP.toLocaleString()} / {totalXPForLevel.toLocaleString()} XP
              </span>
            )}
          </div>

          {/* Progress bar */}
          <ProgressBar value={progress} size={sizes.bar} variant="gradient" color="purple" />

          {/* Next level info */}
          {showDetails && xpToNextLevel > 0 && (
            <div className={cn('flex items-center justify-between mt-1', sizes.text)}>
              <span className="text-muted-foreground">
                <Sparkles
                  className="w-3 h-3 inline mr-1"
                  style={{ color: 'var(--lxd-blue-light)' }}
                />
                {xpToNextLevel.toLocaleString()} XP to level {level + 1}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default XPBar;
