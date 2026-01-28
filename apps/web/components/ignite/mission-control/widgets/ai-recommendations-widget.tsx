'use client';

import type { ActiveRecommendation } from '@inspire/types';
import { Brain, RefreshCw, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { GlassBoxExplanation } from '@/components/ignite/glass-box';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WidgetCard } from './widget-card';

export interface AIRecommendationsWidgetProps {
  /** Recommendations from HBTN adaptive engine */
  recommendations: ActiveRecommendation[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when recommendation is accepted */
  onAccept?: (recommendation: ActiveRecommendation) => void;
  /** Callback when recommendation is dismissed */
  onDismiss?: (recommendation: ActiveRecommendation) => void;
  /** Callback to refresh */
  onRefresh?: () => void;
  /** Glass Box feedback callback */
  onExplanationFeedback?: (recId: string, helpful: boolean) => void;
  /** Additional class names */
  className?: string;
}

const priorityColors = {
  high: 'border-red-500/30 bg-red-500/5',
  medium: 'border-amber-500/30 bg-amber-500/5',
  low: 'border-border/50 bg-transparent',
};

const priorityIndicator = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-cyan-500',
};

function getPriority(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

/**
 * AIRecommendationsWidget - HBTN-powered personalized recommendations
 *
 * Powered by Phase 7 HBTN (Hybrid Bayesian-Transformer Network)
 *
 * Features:
 * - Glass Box AI explanations (EU AI Act compliant)
 * - Priority-coded recommendations
 * - Accept/dismiss actions
 * - Learner override options
 */
export function AIRecommendationsWidget({
  recommendations,
  isLoading = false,
  onAccept,
  onDismiss,
  onRefresh,
  onExplanationFeedback,
  className,
}: AIRecommendationsWidgetProps) {
  return (
    <WidgetCard
      title="AI Recommendations"
      subtitle="Glass Box explanations"
      icon={<Brain className="h-4 w-4 text-fuchsia-400" />}
      accentColor="magenta"
      size="medium"
      isLoading={isLoading}
      headerActions={
        onRefresh && (
          <Button type="button" variant="ghost" size="icon" onClick={onRefresh} className="h-7 w-7">
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="sr-only">Refresh recommendations</span>
          </Button>
        )
      }
      className={className}
    >
      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/20 mb-2">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No recommendations yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Keep learning and we&apos;ll suggest content for you
            </p>
          </div>
        ) : (
          recommendations.slice(0, 3).map((rec) => {
            const priority = getPriority(rec.confidence);
            return (
              <div
                key={rec.id}
                className={cn('rounded-lg border p-3 space-y-2', priorityColors[priority])}
              >
                {/* Header */}
                <div className="flex items-start gap-2">
                  <div
                    className={cn(
                      'mt-1.5 h-1.5 w-1.5 rounded-full shrink-0',
                      priorityIndicator[priority],
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{rec.targetActivityName}</h4>
                    <p className="text-xs text-muted-foreground">
                      {(rec.confidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                </div>

                {/* Glass Box Explanation */}
                <GlassBoxExplanation
                  explanation={rec.explanation}
                  confidence={rec.confidence}
                  onFeedback={
                    onExplanationFeedback
                      ? (helpful) => onExplanationFeedback(rec.id, helpful)
                      : undefined
                  }
                />

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => onAccept?.(rec)}
                  >
                    <Zap className="h-3.5 w-3.5 mr-1" />
                    Try This
                  </Button>
                  {rec.overrideOptions.canSkip && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => onDismiss?.(rec)}
                    >
                      Skip
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {recommendations.length > 3 && (
          <Link
            href="/ignite/learn/recommendations"
            className="block text-center text-xs text-muted-foreground hover:text-foreground py-2"
          >
            View all {recommendations.length} recommendations →
          </Link>
        )}
      </div>
    </WidgetCard>
  );
}
