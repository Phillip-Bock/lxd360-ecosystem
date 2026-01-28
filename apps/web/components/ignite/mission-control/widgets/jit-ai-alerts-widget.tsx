'use client';

import { AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { JITAIAlert } from '../types';
import { WidgetCard } from './widget-card';

export interface JITAIAlertsWidgetProps {
  /** JITAI alerts from behavioral intelligence */
  alerts: JITAIAlert[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when intervention is triggered */
  onIntervene?: (alert: JITAIAlert) => void;
  /** Callback when alert is dismissed */
  onDismiss?: (alert: JITAIAlert) => void;
  /** Additional class names */
  className?: string;
}

const alertTypeLabels = {
  doom_scroll: 'Doom-scroll detected',
  false_confidence: 'False confidence',
  low_engagement: 'Low engagement',
  skill_decay: 'Skill decay',
};

const severityColors = {
  critical: 'border-red-500/50 bg-red-500/10',
  high: 'border-red-500/30 bg-red-500/5',
  medium: 'border-amber-500/30 bg-amber-500/5',
  low: 'border-border/50 bg-transparent',
};

const severityIndicator = {
  critical: 'bg-red-500 animate-pulse',
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-cyan-500',
};

/**
 * JITAIAlertsWidget - At-Risk Students with JITAI interventions
 *
 * Powered by Phase 8B JITAI (Just-In-Time Adaptive Interventions)
 *
 * Features:
 * - Doom-scroll detection alerts
 * - False confidence warnings
 * - Low engagement flags
 * - Skill decay notifications
 * - One-click intervention triggers
 */
export function JITAIAlertsWidget({
  alerts,
  isLoading = false,
  onIntervene,
  onDismiss: _onDismiss, // Reserved for future dismiss functionality
  className,
}: JITAIAlertsWidgetProps) {
  return (
    <WidgetCard
      title="At-Risk Students"
      subtitle="JITAI intervention triggers"
      icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
      accentColor="warning"
      size="medium"
      isLoading={isLoading}
      className={className}
    >
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 mb-2">
              <span className="text-emerald-400 text-lg">✓</span>
            </div>
            <p className="text-sm text-emerald-400 font-medium">All learners on track</p>
            <p className="text-xs text-muted-foreground mt-1">No behavioral alerts detected</p>
          </div>
        ) : (
          alerts.slice(0, 4).map((alert) => (
            <div
              key={alert.id}
              className={cn('rounded-lg border p-3', severityColors[alert.severity])}
            >
              <div className="flex items-start gap-3">
                {/* Avatar placeholder */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/30 shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium truncate">{alert.learnerName}</h4>
                    <div
                      className={cn(
                        'h-1.5 w-1.5 rounded-full shrink-0',
                        severityIndicator[alert.severity],
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {alertTypeLabels[alert.alertType]}
                  </p>
                </div>

                {/* Action */}
                {alert.actionable && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs shrink-0 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-400"
                    onClick={() => onIntervene?.(alert)}
                  >
                    Intervene
                  </Button>
                )}
              </div>

              {/* Message */}
              {alert.message && (
                <p className="text-xs text-muted-foreground mt-2 pl-11">{alert.message}</p>
              )}
            </div>
          ))
        )}

        {alerts.length > 4 && (
          <p className="text-center text-xs text-muted-foreground py-1">
            +{alerts.length - 4} more alerts
          </p>
        )}
      </div>
    </WidgetCard>
  );
}
