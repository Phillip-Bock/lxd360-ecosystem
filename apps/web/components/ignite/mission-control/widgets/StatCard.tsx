'use client';

import { cn } from '@/lib/utils';

export interface StatCardProps {
  /** Metric label */
  label: string;
  /** Metric value */
  value: string | number;
  /** Icon emoji or component */
  icon?: React.ReactNode;
  /** Accent color */
  color?: 'cyan' | 'purple' | 'success' | 'warning' | 'danger';
  /** Change indicator */
  change?: {
    value: number;
    label: string;
  };
  /** Additional class names */
  className?: string;
}

const colorClasses = {
  cyan: 'text-cyan-400',
  purple: 'text-violet-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  danger: 'text-red-400',
};

/**
 * StatCard - Single metric display card
 *
 * Features:
 * - Large value display
 * - Change indicator with trend
 * - Icon support
 * - Color coding
 */
export function StatCard({ label, value, icon, color = 'cyan', change, className }: StatCardProps) {
  const isPositive = change && change.value >= 0;

  return (
    <div
      className={cn(
        'p-4 rounded-xl',
        'bg-card/40 backdrop-blur-sm border border-border/50',
        className,
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>

      <div className={cn('text-2xl font-bold font-mono', colorClasses[color])}>{value}</div>

      {change && (
        <div className="flex items-center gap-1 mt-2">
          <span
            className={cn(
              'text-xs font-semibold',
              isPositive ? 'text-emerald-400' : 'text-red-400',
            )}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
          </span>
          <span className="text-xs text-muted-foreground">{change.label}</span>
        </div>
      )}
    </div>
  );
}
