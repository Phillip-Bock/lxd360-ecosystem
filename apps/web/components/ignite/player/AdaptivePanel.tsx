'use client';

import type { GlassBoxExplanation as GlassBoxExplanationType } from '@inspire/types';
import {
  Brain,
  ChevronDown,
  Coffee,
  Lightbulb,
  RefreshCw,
  Rocket,
  Video,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlassBoxExplanation } from '@/components/ignite/glass-box';
import { useAdaptiveEngine } from '@/components/ignite/providers/adaptive-engine-provider';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type InterventionType = 'modality_swap' | 'scaffolding' | 'break' | 'review' | 'challenge';

export interface AdaptivePanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when panel should close */
  onClose: () => void;
  /** Intervention type */
  interventionType?: InterventionType;
  /** AI explanation for the intervention */
  explanation?: GlassBoxExplanationType;
  /** AI confidence (0-1) */
  confidence?: number;
  /** Suggested action label */
  suggestedActionLabel?: string;
  /** Callback when user accepts the intervention */
  onAccept?: () => void;
  /** Callback when user dismisses the intervention */
  onDismiss?: () => void;
  /** Callback for Glass Box feedback */
  onExplanationFeedback?: (helpful: boolean) => void;
  /** Additional class names */
  className?: string;
}

function getInterventionIcon(type: InterventionType) {
  switch (type) {
    case 'modality_swap':
      return Video;
    case 'scaffolding':
      return Lightbulb;
    case 'break':
      return Coffee;
    case 'review':
      return RefreshCw;
    case 'challenge':
      return Rocket;
    default:
      return Brain;
  }
}

function getInterventionTitle(type: InterventionType): string {
  switch (type) {
    case 'modality_swap':
      return 'Try a Different Format';
    case 'scaffolding':
      return 'Need Some Help?';
    case 'break':
      return 'Time for a Break';
    case 'review':
      return 'Quick Review';
    case 'challenge':
      return 'Ready for a Challenge?';
    default:
      return 'Adaptive Support';
  }
}

function getInterventionDescription(type: InterventionType): string {
  switch (type) {
    case 'modality_swap':
      return 'Based on your learning patterns, a different content format might help.';
    case 'scaffolding':
      return "We've noticed you might benefit from some additional support.";
    case 'break':
      return "You've been learning for a while. A short break can boost retention.";
    case 'review':
      return 'Reviewing previous concepts could strengthen your understanding.';
    case 'challenge':
      return "You're doing great! Ready to test yourself with something harder?";
    default:
      return 'The adaptive engine has a suggestion for you.';
  }
}

function getInterventionColors(type: InterventionType): {
  bg: string;
  text: string;
  border: string;
} {
  switch (type) {
    case 'modality_swap':
      return {
        bg: 'bg-violet-500/10',
        text: 'text-violet-400',
        border: 'border-violet-500/30',
      };
    case 'scaffolding':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
      };
    case 'break':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
      };
    case 'review':
      return {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
      };
    case 'challenge':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
      };
    default:
      return {
        bg: 'bg-lxd-primary/10',
        text: 'text-lxd-primary',
        border: 'border-lxd-primary/30',
      };
  }
}

function CognitiveLoadMeter() {
  const { cognitiveLoad, functionalState } = useAdaptiveEngine();

  const loadPercent = (cognitiveLoad.total / 10) * 100;
  const loadLevel = loadPercent < 40 ? 'Low' : loadPercent < 70 ? 'Moderate' : 'High';
  const loadColor =
    loadPercent < 40 ? 'text-emerald-400' : loadPercent < 70 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="rounded-lg bg-muted/20 border border-border/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Cognitive Load</span>
        <span className={cn('text-sm font-semibold', loadColor)}>{loadLevel}</span>
      </div>

      <Progress value={loadPercent} className="h-2" />

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <p className="text-muted-foreground">Intrinsic</p>
          <p className="font-medium">{cognitiveLoad.intrinsic.toFixed(1)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Extraneous</p>
          <p className="font-medium">{cognitiveLoad.extraneous.toFixed(1)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Germane</p>
          <p className="font-medium">{cognitiveLoad.germane.toFixed(1)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs border-t border-border/50 pt-2">
        <span className="text-muted-foreground">Learning State</span>
        <span className="capitalize font-medium">{functionalState}</span>
      </div>
    </div>
  );
}

/**
 * AdaptivePanel - Slide-up intervention drawer for the learning player
 *
 * Appears when useAdaptiveEngine detects struggle, high cognitive load,
 * or other conditions requiring intervention. Includes Glass Box explanations
 * for EU AI Act compliance.
 *
 * @example
 * ```tsx
 * const { currentRecommendation, getExplanation } = useAdaptiveEngine();
 *
 * <AdaptivePanel
 *   isOpen={!!currentRecommendation}
 *   onClose={() => dismissRecommendation(currentRecommendation.id)}
 *   interventionType={currentRecommendation?.type}
 *   explanation={glassBoxExplanation}
 *   confidence={currentRecommendation?.confidence}
 *   onAccept={() => acceptRecommendation(currentRecommendation.id)}
 * />
 * ```
 */
export function AdaptivePanel({
  isOpen,
  onClose,
  interventionType = 'scaffolding',
  explanation,
  confidence = 0.75,
  suggestedActionLabel,
  onAccept,
  onDismiss,
  onExplanationFeedback,
  className,
}: AdaptivePanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const Icon = getInterventionIcon(interventionType);
  const title = getInterventionTitle(interventionType);
  const description = getInterventionDescription(interventionType);
  const colors = getInterventionColors(interventionType);

  // Auto-expand details after a short delay
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowDetails(true), 500);
      return () => clearTimeout(timer);
    }
    setShowDetails(false);
  }, [isOpen]);

  const handleAccept = () => {
    onAccept?.();
    onClose();
  };

  const handleDismiss = () => {
    onDismiss?.();
    onClose();
  };

  // Default explanation if none provided
  const defaultExplanation: GlassBoxExplanationType = explanation ?? {
    shortExplanation: description,
    featureContributions: [
      {
        factor: 'Response patterns',
        value: 'Multiple hesitations detected',
        weight: 0.6,
        direction: 'supports',
      },
      {
        factor: 'Time on task',
        value: 'Above average for this content',
        weight: 0.4,
        direction: 'supports',
      },
    ],
    modelVersion: 'INSPIRE Adaptive v1.0',
    generatedAt: new Date().toISOString(),
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className={cn(
          'rounded-t-2xl border-t bg-card/95 backdrop-blur-xl max-h-[85vh] overflow-y-auto',
          className,
        )}
      >
        {/* Handle bar for mobile */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-muted" />

        <SheetHeader className="pb-4 pt-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl border',
                  colors.bg,
                  colors.border,
                )}
              >
                <Icon className={cn('h-6 w-6', colors.text)} />
              </div>
              <div>
                <SheetTitle className="text-lg">{title}</SheetTitle>
                <SheetDescription className="text-sm">
                  Adaptive intervention suggestion
                </SheetDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close panel</span>
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-4 pb-6">
          {/* Main message */}
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

          {/* Cognitive Load Meter */}
          <CognitiveLoadMeter />

          {/* Glass Box Explanation */}
          {showDetails && (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
              <GlassBoxExplanation
                explanation={defaultExplanation}
                confidence={confidence}
                onFeedback={onExplanationFeedback}
                variant="inline"
              />
            </div>
          )}

          {/* Toggle details button */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            {showDetails ? 'Hide' : 'Show'} AI Details
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', showDetails && 'rotate-180')}
            />
          </button>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="button" variant="primary" className="flex-1" onClick={handleAccept}>
              <Zap className="h-4 w-4 mr-2" />
              {suggestedActionLabel ?? 'Try Suggestion'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 sm:flex-none"
              onClick={handleDismiss}
            >
              Continue Learning
            </Button>
          </div>

          {/* Confidence indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Brain className="h-3.5 w-3.5" />
            <span>AI Confidence: {(confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Hook to integrate AdaptivePanel with the adaptive engine
 */
export function useAdaptivePanel() {
  const engine = useAdaptiveEngine();
  const [isOpen, setIsOpen] = useState(false);

  // Watch for new recommendations
  useEffect(() => {
    if (engine.currentRecommendation) {
      setIsOpen(true);
    }
  }, [engine.currentRecommendation]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAccept = () => {
    if (engine.currentRecommendation) {
      engine.acceptRecommendation(engine.currentRecommendation.id);
    }
    setIsOpen(false);
  };

  const handleDismiss = () => {
    if (engine.currentRecommendation) {
      engine.dismissRecommendation(engine.currentRecommendation.id);
    }
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    onClose: handleClose,
    onAccept: handleAccept,
    onDismiss: handleDismiss,
    recommendation: engine.currentRecommendation,
    interventionType: engine.currentRecommendation?.type as InterventionType | undefined,
    confidence: engine.currentRecommendation?.confidence,
    triggerCheck: engine.generateRecommendation,
  };
}
