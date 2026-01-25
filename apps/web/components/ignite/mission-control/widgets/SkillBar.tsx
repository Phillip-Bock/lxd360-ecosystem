'use client';

import { cn } from '@/lib/utils';

export interface SkillBarProps {
  /** Skill name */
  skill: string;
  /** Mastery level (0-1) */
  level: number;
  /** Trend indicator */
  trend?: 'up' | 'down' | 'stable';
  /** Bar color - defaults to gradient */
  color?: 'cyan' | 'purple' | 'success' | 'warning' | 'danger' | 'gradient';
  /** Additional class names */
  className?: string;
}

const colorClasses = {
  cyan: 'bg-cyan-500',
  purple: 'bg-violet-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  gradient: 'bg-gradient-to-r from-cyan-500 to-violet-500',
};

const trendIcons = {
  up: '↑',
  down: '↓',
  stable: '→',
};

const trendColors = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  stable: 'text-muted-foreground',
};

/**
 * SkillBar - Horizontal progress bar for skill mastery
 *
 * Features:
 * - Skill name and percentage
 * - Animated fill
 * - Trend indicator
 * - Glow effect
 */
export function SkillBar({ skill, level, trend, color = 'gradient', className }: SkillBarProps) {
  const percentage = Math.min(100, Math.max(0, level * 100));

  return (
    <div className={cn('mb-3', className)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-muted-foreground">{skill}</span>
        <div className="flex items-center gap-2">
          {trend && <span className={cn('text-xs', trendColors[trend])}>{trendIcons[trend]}</span>}
          <span className="text-xs font-mono text-cyan-400">{Math.round(percentage)}%</span>
        </div>
      </div>

      <div className="relative h-1.5 bg-muted/20 rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute h-full rounded-full transition-all duration-500',
            colorClasses[color],
          )}
          style={{
            width: `${percentage}%`,
            boxShadow: '0 0 10px currentColor',
          }}
        />
      </div>
    </div>
  );
}
