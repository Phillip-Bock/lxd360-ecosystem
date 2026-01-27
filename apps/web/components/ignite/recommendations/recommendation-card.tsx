'use client';

import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  GraduationCap,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { RecommendationPriority, RecommendationWithDetails } from '@/types/lms/recommendation';

export interface RecommendationCardProps {
  /** Recommendation data */
  recommendation: RecommendationWithDetails;
  /** Callback when user accepts the recommendation */
  onAccept?: (id: string) => void | Promise<void>;
  /** Callback when user rejects the recommendation */
  onReject?: (id: string, feedback?: string) => void | Promise<void>;
  /** Callback when user dismisses the recommendation */
  onDismiss?: (id: string) => void | Promise<void>;
  /** Whether actions are loading */
  isLoading?: boolean;
  /** Card variant */
  variant?: 'default' | 'compact' | 'manager';
  /** Additional class names */
  className?: string;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatHours(hours: number): string {
  if (hours < 1) return '< 1 hour';
  if (hours === 1) return '1 hour';
  return `${Math.round(hours)} hours`;
}

function getPriorityConfig(priority: RecommendationPriority): {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof AlertTriangle;
} {
  switch (priority) {
    case 'critical':
      return {
        label: 'Critical Gap',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        icon: AlertTriangle,
      };
    case 'high':
      return {
        label: 'High Priority',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        icon: TrendingUp,
      };
    case 'medium':
      return {
        label: 'Recommended',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        icon: Target,
      };
    case 'low':
      return {
        label: 'Nice to Have',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        icon: Sparkles,
      };
  }
}

/**
 * RecommendationCard - Displays an AI-generated course recommendation
 *
 * Features:
 * - Priority indicator with visual styling
 * - Confidence score display (Glass Box AI)
 * - Target skills visualization
 * - Accept/Reject actions
 * - Responsive layout
 * - Keyboard accessible
 */
export function RecommendationCard({
  recommendation,
  onAccept,
  onReject,
  onDismiss,
  isLoading = false,
  variant = 'default',
  className,
}: RecommendationCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  const priorityConfig = getPriorityConfig(recommendation.priority);
  const PriorityIcon = priorityConfig.icon;
  const confidencePercent = Math.round(recommendation.confidence * 100);

  const handleAccept = async () => {
    if (onAccept) {
      await onAccept(recommendation.id);
    }
  };

  const handleReject = async () => {
    if (onReject) {
      await onReject(recommendation.id, feedback || undefined);
      setShowFeedback(false);
      setFeedback('');
    }
  };

  const handleDismiss = async () => {
    if (onDismiss) {
      await onDismiss(recommendation.id);
    }
  };

  // Compact variant for inline lists
  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'bg-lxd-dark-surface border-lxd-dark-border',
          'hover:border-lxd-primary/50 transition-all duration-200 group',
          className,
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Priority indicator */}
            <div
              className={cn('p-2 rounded-lg shrink-0', priorityConfig.bgColor, priorityConfig.color)}
            >
              <PriorityIcon className="w-5 h-5" aria-hidden />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate group-hover:text-lxd-primary transition-colors">
                {recommendation.courseName || 'Course'}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {recommendation.explanation}
              </p>
            </div>

            {/* Confidence badge */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="shrink-0">
                    {confidencePercent}% match
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI confidence score based on skill gap analysis</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleAccept}
                disabled={isLoading}
                className="text-lxd-success hover:text-lxd-success hover:bg-lxd-success/10"
              >
                <Check className="w-4 h-4" aria-hidden />
                <span className="sr-only">Accept</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowFeedback(true)}
                disabled={isLoading}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              >
                <X className="w-4 h-4" aria-hidden />
                <span className="sr-only">Reject</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default full card variant
  return (
    <Card
      className={cn(
        'bg-lxd-dark-surface border-lxd-dark-border overflow-hidden',
        'hover:border-lxd-primary/50 hover:shadow-[0_0_20px_rgba(0,114,245,0.1)]',
        'transition-all duration-200 group',
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden bg-muted/20">
        {recommendation.courseThumbnail ? (
          <Image
            src={recommendation.courseThumbnail}
            alt={recommendation.courseName || 'Course thumbnail'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lxd-primary/20 to-lxd-secondary/20">
            <GraduationCap className="w-12 h-12 text-lxd-primary/40" aria-hidden />
          </div>
        )}

        {/* Priority badge */}
        <div className="absolute top-3 left-3">
          <Badge className={cn(priorityConfig.bgColor, priorityConfig.color, 'border-0')}>
            <PriorityIcon className="w-3 h-3 mr-1" aria-hidden />
            {priorityConfig.label}
          </Badge>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isLoading}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Dismiss recommendation"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        )}

        {/* AI indicator */}
        <div className="absolute bottom-3 right-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="bg-black/60 text-white border-0">
                  <Sparkles className="w-3 h-3 mr-1" aria-hidden />
                  AI Recommendation
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm">
                  Generated by O*NET skill gap analysis with {confidencePercent}% confidence.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Title and description */}
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-lxd-primary transition-colors">
            {recommendation.courseName || 'Recommended Course'}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {recommendation.courseDescription || recommendation.explanation}
          </p>
        </div>

        {/* Glass Box Explanation */}
        <div className="p-3 rounded-lg bg-muted/10 border border-lxd-dark-border">
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-lxd-primary mt-0.5 shrink-0" aria-hidden />
            <div>
              <p className="text-xs font-medium text-lxd-primary mb-1">Why this course?</p>
              <p className="text-sm text-muted-foreground">{recommendation.explanation}</p>
            </div>
          </div>
        </div>

        {/* Target skills */}
        {recommendation.targetSkills.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Skills you&apos;ll develop:</p>
            <div className="space-y-2">
              {recommendation.targetSkills.slice(0, 3).map((skill) => (
                <div key={skill.skillId} className="flex items-center gap-2">
                  <span className="text-sm text-foreground flex-1 truncate">{skill.skillName}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {skill.currentLevel} → {skill.targetLevel}
                    </span>
                    <Progress
                      value={(skill.currentLevel / skill.targetLevel) * 100}
                      className="w-16 h-1.5"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" aria-hidden />
            {recommendation.courseDuration
              ? formatDuration(recommendation.courseDuration)
              : formatHours(recommendation.estimatedHours)}
          </span>
          {recommendation.targetOccupation && (
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5" aria-hidden />
              {recommendation.targetOccupation.title}
            </span>
          )}
        </div>

        {/* Confidence meter */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Match Score</span>
            <span className="font-medium text-foreground">{confidencePercent}%</span>
          </div>
          <Progress value={confidencePercent} className="h-1.5" />
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        {!showFeedback ? (
          <>
            <Button
              type="button"
              className="flex-1 bg-lxd-primary hover:bg-lxd-primary/90"
              onClick={handleAccept}
              disabled={isLoading}
            >
              <Check className="w-4 h-4 mr-2" aria-hidden />
              Accept
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowFeedback(true)}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" aria-hidden />
              Not for me
            </Button>
          </>
        ) : (
          <div className="w-full space-y-3">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us why this isn't right for you (optional)"
              className={cn(
                'w-full px-3 py-2 text-sm rounded-md resize-none',
                'bg-muted/20 border border-lxd-dark-border',
                'focus:outline-none focus:ring-2 focus:ring-lxd-primary focus:border-transparent',
                'placeholder:text-muted-foreground',
              )}
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={handleReject}
                disabled={isLoading}
              >
                Reject
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowFeedback(false);
                  setFeedback('');
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

/**
 * RecommendationCardSkeleton - Loading placeholder for RecommendationCard
 */
export function RecommendationCardSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'compact';
}) {
  if (variant === 'compact') {
    return (
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted/30 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted/30 rounded animate-pulse" />
            </div>
            <div className="h-6 w-20 bg-muted/30 rounded-full animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border overflow-hidden">
      <div className="h-36 bg-muted/30 animate-pulse" />
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="p-3 rounded-lg bg-muted/20">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-24 bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 flex-1 bg-muted/30 rounded-lg animate-pulse" />
          <div className="h-10 flex-1 bg-muted/30 rounded-lg animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
