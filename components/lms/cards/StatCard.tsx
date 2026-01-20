'use client';

import { type LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  suffix?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
    direction: 'up' | 'down' | 'neutral';
  };
  variant?: 'default' | 'compact' | 'gradient';
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'red' | 'gray';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  suffix,
  icon: Icon,
  trend,
  variant = 'default',
  color = 'blue',
  className,
}: StatCardProps): React.JSX.Element {
  const colorClasses = {
    blue: {
      icon: 'text-[var(--studio-accent)]',
      iconBg: 'bg-[var(--studio-accent)]/10',
      gradient: 'from-[var(--studio-accent)]/20 to-transparent',
      trendUp: 'text-brand-success',
      trendDown: 'text-brand-error',
    },
    purple: {
      icon: 'text-[var(--lxd-purple-light)]',
      iconBg: 'bg-[var(--lxd-purple-light)]/10',
      gradient: 'from-[var(--lxd-purple-light)]/20 to-transparent',
      trendUp: 'text-brand-success',
      trendDown: 'text-brand-error',
    },
    emerald: {
      icon: 'text-brand-success',
      iconBg: 'bg-brand-success/10',
      gradient: 'from-emerald-500/20 to-transparent',
      trendUp: 'text-brand-success',
      trendDown: 'text-brand-error',
    },
    amber: {
      icon: 'text-brand-warning',
      iconBg: 'bg-brand-warning/10',
      gradient: 'from-amber-500/20 to-transparent',
      trendUp: 'text-brand-success',
      trendDown: 'text-brand-error',
    },
    red: {
      icon: 'text-brand-error',
      iconBg: 'bg-brand-error/10',
      gradient: 'from-red-500/20 to-transparent',
      trendUp: 'text-brand-success',
      trendDown: 'text-brand-error',
    },
    gray: {
      icon: 'text-muted-foreground',
      iconBg: 'bg-muted/10',
      gradient: 'from-muted/20 to-transparent',
      trendUp: 'text-brand-success',
      trendDown: 'text-brand-error',
    },
  };

  const colors = colorClasses[color];

  const TrendIcon =
    trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend?.direction === 'up'
      ? colors.trendUp
      : trend?.direction === 'down'
        ? colors.trendDown
        : 'text-brand-muted';

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl',
          'bg-[var(--studio-bg)] border border-[var(--lxd-dark-surface-alt)]/50',
          className,
        )}
      >
        {Icon && (
          <div className={cn('p-2 rounded-lg', colors.iconBg)}>
            <Icon className={cn('w-4 h-4', colors.icon)} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <p className="text-lg font-semibold text-brand-primary">
            {value}
            {suffix}
          </p>
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 ml-auto', trendColor)}>
            <TrendIcon className="w-3 h-3" />
            <span className="text-xs font-medium">{trend.value}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative p-5 rounded-2xl overflow-hidden',
        'bg-[var(--studio-bg)] border border-[var(--lxd-dark-surface-alt)]/50',
        'hover:border-[var(--studio-accent)]/30 transition-colors',
        className,
      )}
    >
      {/* Gradient overlay for gradient variant */}
      {variant === 'gradient' && (
        <div className={cn('absolute inset-0 bg-linear-to-br opacity-50', colors.gradient)} />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          {Icon && (
            <div className={cn('p-2 rounded-xl', colors.iconBg)}>
              <Icon className={cn('w-5 h-5', colors.icon)} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-brand-primary">
            {value}
            {suffix}
          </span>
          {subtitle && <span className="text-sm text-muted-foreground mb-1">{subtitle}</span>}
        </div>

        {/* Trend */}
        {trend && (
          <div className={cn('flex items-center gap-1.5 mt-3', trendColor)}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
              {Math.abs(trend.value)}%
            </span>
            {trend.label && <span className="text-sm text-muted-foreground">{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
