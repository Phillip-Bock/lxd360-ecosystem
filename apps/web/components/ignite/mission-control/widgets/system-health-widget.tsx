'use client';

import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceHealth } from '../types';
import { WidgetCard } from './widget-card';

export interface SystemHealthWidgetProps {
  /** Service health data */
  services: ServiceHealth[];
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

const statusColors = {
  healthy: { dot: 'bg-emerald-500', text: 'text-emerald-400' },
  degraded: { dot: 'bg-amber-500', text: 'text-amber-400' },
  down: { dot: 'bg-red-500 animate-pulse', text: 'text-red-400' },
};

/**
 * SystemHealthWidget - Infrastructure monitoring
 *
 * Powered by Phase 8A OpenTelemetry
 *
 * Features:
 * - Service status indicators
 * - Latency display
 * - Real-time updates
 */
export function SystemHealthWidget({
  services,
  isLoading = false,
  className,
}: SystemHealthWidgetProps) {
  return (
    <WidgetCard
      title="System Health"
      subtitle="Infrastructure status"
      icon={<Activity className="h-4 w-4 text-amber-400" />}
      accentColor="warning"
      size="medium"
      isLoading={isLoading}
      className={className}
    >
      <div className="space-y-2">
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No services configured</p>
        ) : (
          services.map((service) => {
            const colors = statusColors[service.status];
            return (
              <div
                key={service.name}
                className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0"
              >
                <div
                  className={cn('h-2 w-2 rounded-full shrink-0', colors.dot)}
                  style={{
                    boxShadow: service.status === 'healthy' ? '0 0 6px #10B981' : undefined,
                  }}
                />
                <span className="flex-1 text-sm">{service.name}</span>
                <span
                  className={cn(
                    'text-xs font-mono',
                    service.latency > 500 ? 'text-amber-400' : 'text-muted-foreground',
                  )}
                >
                  {service.latency}ms
                </span>
              </div>
            );
          })
        )}
      </div>
    </WidgetCard>
  );
}
