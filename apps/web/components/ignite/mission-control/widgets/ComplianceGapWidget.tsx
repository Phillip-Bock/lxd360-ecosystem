'use client';

import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComplianceMetric } from '../types';
import { ProgressRing } from './ProgressRing';
import { WidgetCard } from './WidgetCard';

export interface ComplianceGapWidgetProps {
  /** Compliance metrics */
  metrics: ComplianceMetric[];
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

const statusColors = {
  compliant: 'success' as const,
  at_risk: 'warning' as const,
  non_compliant: 'danger' as const,
};

/**
 * ComplianceGapWidget - Compliance vs Competency analyzer
 *
 * Powered by Phase 8C God View Analytics
 *
 * Features:
 * - Compliance rate progress rings
 * - Expiring certifications warning
 * - Status indicators
 */
export function ComplianceGapWidget({
  metrics,
  isLoading = false,
  className,
}: ComplianceGapWidgetProps) {
  // Calculate total expiring
  const totalExpiring = metrics.reduce((sum, m) => sum + m.expiringCount, 0);

  return (
    <WidgetCard
      title="Compliance vs Competency"
      subtitle="Gap analysis"
      icon={<ShieldCheck className="h-4 w-4 text-amber-400" />}
      accentColor="warning"
      size="medium"
      isLoading={isLoading}
      className={className}
    >
      {metrics.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No compliance data available
        </p>
      ) : (
        <>
          {/* Progress Rings */}
          <div className="flex justify-around mb-4">
            {metrics.slice(0, 3).map((metric) => (
              <ProgressRing
                key={metric.name}
                progress={metric.completionRate}
                size={70}
                color={statusColors[metric.status]}
                label={metric.name}
              />
            ))}
          </div>

          {/* Expiring Warning */}
          {totalExpiring > 0 && (
            <div
              className={cn('mt-3 p-3 rounded-lg border', 'bg-amber-500/10 border-amber-500/30')}
            >
              <p className="text-xs text-amber-400 flex items-center gap-2">
                <span>⚠️</span>
                <span>
                  {totalExpiring} certification{totalExpiring !== 1 ? 's' : ''} expiring in 30 days
                </span>
              </p>
            </div>
          )}
        </>
      )}
    </WidgetCard>
  );
}
