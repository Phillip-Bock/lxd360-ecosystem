'use client';

import { cn } from '@/lib/core/utils';
import { PulsingDot } from '../effects/pulsing-dot';

interface StatusDotProps {
  label: string;
  status: 'nominal' | 'warning' | 'critical' | 'inactive';
  showLabel?: boolean;
  className?: string;
}

export function StatusDot({ label, status, showLabel = true, className }: StatusDotProps) {
  const statusLabels = {
    nominal: 'Operational',
    warning: 'Degraded',
    critical: 'Outage',
    inactive: 'Inactive',
  };

  const statusColors = {
    nominal: 'text-brand-success',
    warning: 'text-brand-warning',
    critical: 'text-brand-error',
    inactive: 'text-brand-muted',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <PulsingDot status={status} size="md" />
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-muted font-mono uppercase">{label}</span>
          <span className={cn('text-xs font-medium', statusColors[status])}>
            {statusLabels[status]}
          </span>
        </div>
      )}
    </div>
  );
}
