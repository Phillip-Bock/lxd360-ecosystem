'use client';

import type {
  FeatureContribution,
  GlassBoxExplanation as GlassBoxExplanationType,
} from '@inspire/types';
import { Brain, ChevronDown, ChevronUp, Info, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface GlassBoxExplanationProps {
  /** The explanation data from the AI system */
  explanation: GlassBoxExplanationType;
  /** AI confidence score (0-1) */
  confidence: number;
  /** Callback when user provides feedback */
  onFeedback?: (helpful: boolean) => void;
  /** Custom trigger element (defaults to info icon button) */
  trigger?: React.ReactNode;
  /** Whether to show as inline card vs modal trigger */
  variant?: 'modal' | 'inline';
  /** Additional class names */
  className?: string;
}

function FeatureContributionBar({ contribution }: { contribution: FeatureContribution }) {
  const isSupporting = contribution.direction === 'supports';
  const absWeight = Math.abs(contribution.weight) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{contribution.factor}</span>
        <span className={cn('font-medium', isSupporting ? 'text-emerald-400' : 'text-amber-400')}>
          {contribution.value}
        </span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-muted/30 overflow-hidden">
        <div
          className={cn(
            'absolute h-full rounded-full transition-all duration-500',
            isSupporting
              ? 'bg-linear-to-r from-emerald-500/60 to-emerald-400'
              : 'bg-linear-to-r from-amber-500/60 to-amber-400',
          )}
          style={{ width: `${absWeight}%` }}
        />
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
            isSupporting ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400',
          )}
        >
          {isSupporting ? 'Supports' : 'Opposes'}
          <span className="font-mono">{(contribution.weight * 100).toFixed(0)}%</span>
        </span>
      </div>
    </div>
  );
}

function GlassBoxContent({
  explanation,
  confidence,
  onFeedback,
  showExpanded = false,
}: {
  explanation: GlassBoxExplanationType;
  confidence: number;
  onFeedback?: (helpful: boolean) => void;
  showExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(showExpanded);
  const confidencePercent = confidence * 100;

  return (
    <div className="space-y-4">
      {/* AI Confidence Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">AI Confidence</span>
          <span
            className={cn(
              'font-medium',
              confidencePercent >= 80
                ? 'text-emerald-400'
                : confidencePercent >= 60
                  ? 'text-amber-400'
                  : 'text-red-400',
            )}
          >
            {confidencePercent.toFixed(0)}%
          </span>
        </div>
        <Progress value={confidencePercent} className="h-2" />
      </div>

      {/* Short Explanation */}
      <div className="rounded-lg bg-muted/20 p-3 border border-border/50">
        <p className="text-sm text-foreground leading-relaxed">{explanation.shortExplanation}</p>
      </div>

      {/* Feature Contributions (Expandable) */}
      {explanation.featureContributions.length > 0 && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Contributing Factors ({explanation.featureContributions.length})</span>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {expanded && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              {explanation.featureContributions.map((contribution, index) => (
                <FeatureContributionBar key={index} contribution={contribution} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Model Version & Timestamp */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
        <span>Model: {explanation.modelVersion}</span>
        <span>
          Generated:{' '}
          {new Date(explanation.generatedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* Feedback Buttons */}
      {onFeedback && (
        <div className="flex items-center justify-center gap-3 border-t border-border/50 pt-3">
          <span className="text-xs text-muted-foreground">Was this explanation helpful?</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFeedback(true)}
              className="h-8 px-3 hover:bg-emerald-500/10 hover:text-emerald-400"
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Yes
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFeedback(false)}
              className="h-8 px-3 hover:bg-red-500/10 hover:text-red-400"
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              No
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * GlassBoxExplanation - EU AI Act compliant transparency component
 *
 * Displays "Why am I seeing this?" explanations for AI recommendations.
 * Supports both modal (triggered by button) and inline variants.
 *
 * @example
 * ```tsx
 * <GlassBoxExplanation
 *   explanation={recommendation.explanation}
 *   confidence={recommendation.confidence}
 *   onFeedback={(helpful) => trackFeedback(helpful)}
 * />
 * ```
 */
export function GlassBoxExplanation({
  explanation,
  confidence,
  onFeedback,
  trigger,
  variant = 'modal',
  className,
}: GlassBoxExplanationProps) {
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'rounded-xl bg-card/60 backdrop-blur-xl border border-border/50 p-4',
          className,
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lxd-primary/20">
            <Brain className="h-4 w-4 text-lxd-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">AI Rationale</h4>
            <p className="text-xs text-muted-foreground">Why you&apos;re seeing this</p>
          </div>
        </div>
        <GlassBoxContent
          explanation={explanation}
          confidence={confidence}
          onFeedback={onFeedback}
          showExpanded
        />
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn('h-8 px-2 text-muted-foreground hover:text-foreground', className)}
          >
            <Info className="h-4 w-4 mr-1" />
            Why am I seeing this?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lxd-primary/20">
              <Brain className="h-5 w-5 text-lxd-primary" />
            </div>
            <div>
              <DialogTitle>AI Rationale</DialogTitle>
              <DialogDescription>Understanding why this was recommended</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <GlassBoxContent
          explanation={explanation}
          confidence={confidence}
          onFeedback={onFeedback}
        />
      </DialogContent>
    </Dialog>
  );
}
