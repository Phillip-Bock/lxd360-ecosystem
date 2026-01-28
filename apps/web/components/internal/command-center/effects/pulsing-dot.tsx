'use client';

import { cn } from '@/lib/core/utils';

interface PulsingDotProps {
  status: 'nominal' | 'warning' | 'critical' | 'inactive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PulsingDot({ status, size = 'md', className }: PulsingDotProps) {
  const statusColors = {
    nominal: 'bg-green-400',
    warning: 'bg-amber-400',
    critical: 'bg-red-400',
    inactive: 'bg-gray-500 dark:bg-gray-600',
  };

  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const shouldPulse = status !== 'inactive' && status !== 'nominal';

  return (
    <span className="relative flex">
      <span
        className={cn(
          'rounded-full',
          statusColors[status],
          sizeClasses[size],
          shouldPulse && 'animate-ping absolute inline-flex opacity-75',
          className,
        )}
      />
      <span
        className={cn('relative inline-flex rounded-full', statusColors[status], sizeClasses[size])}
      />
    </span>
  );
}
