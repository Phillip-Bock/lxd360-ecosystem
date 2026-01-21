'use client';

import { type LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/core/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: number;
  deltaLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  delta,
  deltaLabel,
  icon: Icon,
  iconColor = 'text-lxd-purple',
  loading = false,
  className,
}: StatCardProps) {
  const getDeltaIcon = () => {
    if (delta === undefined || delta === 0) return Minus;
    return delta > 0 ? TrendingUp : TrendingDown;
  };

  const getDeltaColor = () => {
    if (delta === undefined || delta === 0) return 'text-muted-foreground';
    return delta > 0
      ? 'text-green-600 dark:text-brand-success'
      : 'text-red-600 dark:text-brand-error';
  };

  const DeltaIcon = getDeltaIcon();

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-32 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
            <div className="h-12 w-12 bg-muted rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {(delta !== undefined || subtitle) && (
              <div className="flex items-center gap-2">
                {delta !== undefined && (
                  <span
                    className={cn('flex items-center gap-1 text-sm font-medium', getDeltaColor())}
                  >
                    <DeltaIcon className="h-3 w-3" />
                    {Math.abs(delta).toFixed(1)}%
                  </span>
                )}
                {(deltaLabel || subtitle) && (
                  <span className="text-xs text-muted-foreground">{deltaLabel || subtitle}</span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn('rounded-full bg-muted p-3', iconColor)}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
