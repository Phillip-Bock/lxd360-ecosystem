'use client';

import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/core/utils';

interface TrendIndicatorProps {
  value: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TrendIndicator({
  value,
  showIcon = true,
  size = 'sm',
  className,
}: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded',
        sizeClasses[size],
        isPositive && 'bg-brand-success/20 text-brand-success',
        isNegative && 'bg-brand-error/20 text-brand-error',
        isNeutral && 'bg-gray-500/20 dark:bg-gray-600/20 text-brand-muted',
        className,
      )}
    >
      {showIcon && (
        <>
          {isPositive && <TrendingUp className={iconSizes[size]} />}
          {isNegative && <TrendingDown className={iconSizes[size]} />}
          {isNeutral && <Minus className={iconSizes[size]} />}
        </>
      )}
      {isPositive ? '+' : ''}
      {value}%
    </span>
  );
}
