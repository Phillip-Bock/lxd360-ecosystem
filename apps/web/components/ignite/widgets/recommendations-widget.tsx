'use client';

import type { ActiveRecommendation, RecommendationType } from '@inspire/types';
import { ArrowRight, Brain, Play, RefreshCw, Sparkles, Video, Zap } from 'lucide-react';
import Link from 'next/link';
import { GlassBoxExplanation } from '@/components/ignite/glass-box';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface RecommendationsWidgetProps {
  /** Active recommendation from adaptive engine */
  recommendation: ActiveRecommendation | null;
  /** All pending recommendations */
  recommendations?: ActiveRecommendation[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when recommendation is accepted */
  onAccept?: (recommendation: ActiveRecommendation) => void;
  /** Callback when recommendation is dismissed */
  onDismiss?: (recommendation: ActiveRecommendation) => void;
  /** Callback for Glass Box feedback */
  onExplanationFeedback?: (recommendationId: string, helpful: boolean) => void;
  /** Callback to refresh recommendations */
  onRefresh?: () => void;
  /** Additional class names */
  className?: string;
}

function getRecommendationIcon(type: RecommendationType) {
  switch (type) {
    case 'modality':
      return Video;
    case 'intervention':
      return Brain;
    case 'review':
      return RefreshCw;
    case 'content':
      return Sparkles;
  }
}

function getRecommendationLabel(type: RecommendationType): string {
  switch (type) {
    case 'modality':
      return 'Try Different Format';
    case 'intervention':
      return 'Adaptive Support';
    case 'review':
      return 'Review Suggestion';
    case 'content':
      return 'Recommended For You';
  }
}

function getRecommendationColor(type: RecommendationType): string {
  switch (type) {
    case 'modality':
      return 'text-violet-400 bg-violet-500/10';
    case 'intervention':
      return 'text-amber-400 bg-amber-500/10';
    case 'review':
      return 'text-cyan-400 bg-cyan-500/10';
    case 'content':
      return 'text-emerald-400 bg-emerald-500/10';
  }
}

function SkeletonLoader() {
  return (
    <Card variant="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-muted/30 animate-pulse" />
          <div className="h-5 w-40 bg-muted/30 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-20 w-full bg-muted/30 rounded-lg animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 flex-1 bg-muted/30 rounded animate-pulse" />
          <div className="h-9 w-24 bg-muted/30 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <Card variant="glass">
      <CardContent className="flex flex-col items-center justify-center py-8 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-3">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="text-sm font-medium mb-1">No Recommendations</h4>
        <p className="text-xs text-muted-foreground max-w-[200px] mb-4">
          Keep learning and we&apos;ll suggest personalized content for you.
        </p>
        {onRefresh && (
          <Button type="button" variant="ghost" size="sm" onClick={onRefresh} className="text-xs">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Check Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function RecommendationCard({
  recommendation,
  onAccept,
  onDismiss,
  onExplanationFeedback,
}: {
  recommendation: ActiveRecommendation;
  onAccept?: (rec: ActiveRecommendation) => void;
  onDismiss?: (rec: ActiveRecommendation) => void;
  onExplanationFeedback?: (recId: string, helpful: boolean) => void;
}) {
  const Icon = getRecommendationIcon(recommendation.type);
  const label = getRecommendationLabel(recommendation.type);
  const colorClasses = getRecommendationColor(recommendation.type);

  return (
    <div className="rounded-lg bg-card/40 border border-border/50 p-4 space-y-3">
      {/* Type Badge */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            colorClasses,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        <span className="text-xs text-muted-foreground">
          {(recommendation.confidence * 100).toFixed(0)}% match
        </span>
      </div>

      {/* Activity Info */}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold line-clamp-1">{recommendation.targetActivityName}</h4>
        {recommendation.suggestedModality && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Play className="h-3.5 w-3.5" />
            <span className="capitalize">{recommendation.suggestedModality} format</span>
          </div>
        )}
      </div>

      {/* Glass Box Explanation Trigger */}
      <GlassBoxExplanation
        explanation={recommendation.explanation}
        confidence={recommendation.confidence}
        onFeedback={
          onExplanationFeedback
            ? (helpful) => onExplanationFeedback(recommendation.id, helpful)
            : undefined
        }
      />

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={() => onAccept?.(recommendation)}
        >
          <Zap className="h-3.5 w-3.5 mr-1.5" />
          Try This
        </Button>
        {recommendation.overrideOptions.canSkip && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDismiss?.(recommendation)}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
        )}
      </div>

      {/* Alternatives (if available) */}
      {recommendation.overrideOptions.alternatives.length > 0 && (
        <div className="border-t border-border/50 pt-3 mt-2">
          <p className="text-xs text-muted-foreground mb-2">Or try these alternatives:</p>
          <div className="flex flex-wrap gap-2">
            {recommendation.overrideOptions.alternatives.slice(0, 2).map((alt) => (
              <Link
                key={alt.activityId}
                href={`/learn/activity/${alt.activityId}`}
                className="inline-flex items-center gap-1 rounded-full bg-muted/30 px-2.5 py-1 text-xs hover:bg-muted/50 transition-colors"
              >
                {alt.activityName}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * RecommendationsWidget - AI-powered personalized learning recommendations
 *
 * Displays activeRecommendation from Firestore with Glass Box explanations
 * for EU AI Act compliance transparency.
 *
 * @example
 * ```tsx
 * <RecommendationsWidget
 *   recommendation={activeRecommendation}
 *   onAccept={(rec) => acceptRecommendation(rec)}
 *   onDismiss={(rec) => dismissRecommendation(rec)}
 *   onExplanationFeedback={(id, helpful) => trackFeedback(id, helpful)}
 * />
 * ```
 */
export function RecommendationsWidget({
  recommendation,
  recommendations = [],
  isLoading = false,
  onAccept,
  onDismiss,
  onExplanationFeedback,
  onRefresh,
  className,
}: RecommendationsWidgetProps) {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  // Combine primary recommendation with list
  const allRecommendations = recommendation
    ? [recommendation, ...recommendations.filter((r) => r.id !== recommendation.id)]
    : recommendations;

  if (allRecommendations.length === 0) {
    return <EmptyState onRefresh={onRefresh} />;
  }

  return (
    <Card variant="glass" className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-lxd-primary" />
            AI Recommendations
          </CardTitle>
          {onRefresh && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh recommendations</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {allRecommendations.slice(0, 3).map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onAccept={onAccept}
            onDismiss={onDismiss}
            onExplanationFeedback={onExplanationFeedback}
          />
        ))}

        {allRecommendations.length > 3 && (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            href="/learn/recommendations"
          >
            View All Recommendations ({allRecommendations.length})
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
