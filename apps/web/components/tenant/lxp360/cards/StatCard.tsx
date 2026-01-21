'use client';

import { type LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/core/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
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
  icon: Icon,
  trend,
  variant = 'default',
  color = 'blue',
  className,
}: StatCardProps) {
  const colorClasses = {
    blue: {
      icon: 'text-(--lxd-blue-light)',
      iconBg: 'bg-(--lxd-blue-light)/10',
      gradient: 'from-(--lxd-blue-light)/20 to-transparent',
      trendUp: 'text-brand-success',
      trendDown: 'text-brand-error',
    },
    purple: {
      icon: 'text-(--brand-secondary)',
      iconBg: 'bg-(--brand-secondary)/10',
      gradient: 'from-(--brand-secondary)/20 to-transparent',
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
          'bg-(--lxd-blue-dark-700) border border-(--lxd-blue-dark-700)/50',
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
          <p className="text-lg font-semibold text-brand-primary">{value}</p>
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
        'bg-(--lxd-blue-dark-700) border border-(--lxd-blue-dark-700)/50',
        'hover:border-(--lxd-blue-light)/30 transition-colors',
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
          <span className="text-3xl font-bold text-brand-primary">{value}</span>
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
