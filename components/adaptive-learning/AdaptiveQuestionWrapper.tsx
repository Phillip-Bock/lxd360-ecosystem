'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTelemetry } from '@/lib/adaptive-learning';
import { cn } from '@/lib/utils';
import { CognitiveLoadIndicator, type CognitiveLoadLevel } from './CognitiveLoadIndicator';
import { ConfidenceSlider } from './ConfidenceSlider';
import { type Intervention, InterventionModal } from './InterventionModal';

interface AdaptiveQuestionWrapperProps {
  children: React.ReactNode | ((props: AdaptiveQuestionRenderProps) => React.ReactNode);
  skillId: string;
  skillName?: string;
  sessionId?: string;
  isSafetyCritical?: boolean;
  expectedResponseTimeMs?: number;
  requireConfidence?: boolean;
  showCognitiveLoad?: boolean;
  onComplete?: (result: AdaptiveResult) => void | Promise<void>;
  className?: string;
}

interface AdaptiveResult {
  correct: boolean;
  responseTimeMs: number;
  confidenceRating: number | null;
  revisionCount: number;
  rageClicks: number;
  focusLossCount: number;
  mastery?: {
    probability: number;
    level: string;
    change: number;
  };
  cognitiveLoad?: {
    level: string;
    score: number;
  };
  intervention?: {
    type: string;
    severity: string;
    message: string;
  };
}

export function AdaptiveQuestionWrapper({
  children,
  skillId,
  skillName,
  sessionId: propSessionId,
  isSafetyCritical = false,
  expectedResponseTimeMs,
  requireConfidence = true,
  showCognitiveLoad = true,
  onComplete,
  className,
}: AdaptiveQuestionWrapperProps): React.JSX.Element {
  // Generate session ID if not provided
  const sessionIdRef = useRef(
    propSessionId || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  // Telemetry capture
  const { telemetry, handlers, recordRevision, setConfidence, reset } = useTelemetry({
    onRageClickDetected: () => {
      // Rage click detected
    },
    onFocusLost: () => {
      // Focus lost
    },
  });

  // State
  const [confidence, setConfidenceValue] = useState(0.5);
  const [hasSetConfidence, setHasSetConfidence] = useState(false);
  const [showConfidenceStep, setShowConfidenceStep] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState<{ answer: unknown; correct: boolean } | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [cognitiveLoad, setCognitiveLoad] = useState<{ level: string; score: number } | null>(null);

  // Ref to store submitToAdaptiveSystem function to avoid circular dependency
  const submitToAdaptiveSystemRef = useRef<
    ((answer: unknown, correct: boolean) => Promise<void>) | null
  >(null);

  // Sync confidence to telemetry
  useEffect(() => {
    if (hasSetConfidence) {
      setConfidence(confidence);
    }
  }, [confidence, hasSetConfidence, setConfidence]);

  // Poll cognitive load periodically
  useEffect(() => {
    if (!showCognitiveLoad) return;

    const pollCognitiveLoad = async () => {
      try {
        const response = await fetch(
          `/api/adaptive/interventions?sessionId=${sessionIdRef.current}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.currentLoad) {
            setCognitiveLoad(data.currentLoad);
          }
          if (data.interventions?.length > 0) {
            setIntervention(data.interventions[0]);
          }
        }
      } catch (error) {
        console.error('[Adaptive] Failed to poll cognitive load:', error);
      }
    };

    const interval = setInterval(pollCognitiveLoad, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [showCognitiveLoad]);

  // Handle confidence change
  const handleConfidenceChange = useCallback((value: number): void => {
    setConfidenceValue(value);
    setHasSetConfidence(true);
  }, []);

  // Handle answer submission - intercept to show confidence step
  const handleSubmitAnswer = useCallback(
    async (answer: unknown, correct: boolean): Promise<void> => {
      if (requireConfidence && !hasSetConfidence) {
        // Show confidence step first
        setPendingAnswer({ answer, correct });
        setShowConfidenceStep(true);
        return;
      }

      // Proceed with submission
      await submitToAdaptiveSystemRef.current?.(answer, correct);
    },
    [requireConfidence, hasSetConfidence],
  );

  // Submit to adaptive learning API
  const submitToAdaptiveSystem = useCallback(
    async (_answer: unknown, correct: boolean): Promise<void> => {
      setIsSubmitting(true);
      setShowConfidenceStep(false);

      try {
        const response = await fetch('/api/adaptive/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            skillId,
            skillName,
            correct,
            responseTimeMs: telemetry.totalTimeMs,
            confidenceRating: hasSetConfidence ? confidence : undefined,
            revisionCount: telemetry.revisionCount,
            rageClicks: telemetry.rageClicks,
            focusLossCount: telemetry.focusLossCount,
            isSafetyCritical,
            expectedResponseTimeMs,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit attempt');
        }

        const data = await response.json();

        // Update cognitive load from response
        if (data.cognitiveLoad) {
          setCognitiveLoad({
            level: data.cognitiveLoad.level,
            score: data.cognitiveLoad.score,
          });
        }

        // Show intervention if needed
        if (data.intervention) {
          setIntervention({
            id: `intervention-${Date.now()}`,
            type: data.intervention.type,
            severity: data.intervention.severity,
            message: data.intervention.message,
          });
        }

        // Build result
        const result: AdaptiveResult = {
          correct,
          responseTimeMs: telemetry.totalTimeMs,
          confidenceRating: hasSetConfidence ? confidence : null,
          revisionCount: telemetry.revisionCount,
          rageClicks: telemetry.rageClicks,
          focusLossCount: telemetry.focusLossCount,
          mastery: data.mastery
            ? {
                probability: data.mastery.probability,
                level: data.mastery.level,
                change: data.mastery.change,
              }
            : undefined,
          cognitiveLoad: data.cognitiveLoad
            ? {
                level: data.cognitiveLoad.level,
                score: data.cognitiveLoad.score,
              }
            : undefined,
          intervention: data.intervention,
        };

        // Notify parent
        await onComplete?.(result);

        // Reset for next question
        reset();
        setHasSetConfidence(false);
        setConfidenceValue(0.5);
        setPendingAnswer(null);
      } catch (error) {
        console.error('[Adaptive] Failed to submit attempt:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      skillId,
      skillName,
      telemetry,
      confidence,
      hasSetConfidence,
      isSafetyCritical,
      expectedResponseTimeMs,
      onComplete,
      reset,
    ],
  );

  // Update ref whenever submitToAdaptiveSystem changes
  submitToAdaptiveSystemRef.current = submitToAdaptiveSystem;

  // Handle confidence step confirmation
  const handleConfidenceConfirm = useCallback((): void => {
    if (pendingAnswer) {
      submitToAdaptiveSystem(pendingAnswer.answer, pendingAnswer.correct);
    }
  }, [pendingAnswer, submitToAdaptiveSystem]);

  // Handle intervention acknowledgment
  const handleInterventionAccept = useCallback(
    async (id: string, action?: string): Promise<void> => {
      try {
        await fetch('/api/adaptive/interventions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interventionId: id, action }),
        });
      } catch (error) {
        console.error('[Adaptive] Failed to acknowledge intervention:', error);
      }
      setIntervention(null);
    },
    [],
  );

  const handleInterventionDismiss = useCallback((): void => {
    setIntervention(null);
  }, []);

  // Expose submit handler to children via context or props
  const enhancedChildren =
    typeof children === 'function'
      ? children({ onSubmit: handleSubmitAnswer, recordRevision })
      : children;

  return (
    <div className={cn('relative', className)} {...handlers}>
      {/* Cognitive load indicator (compact, top-right) */}
      {showCognitiveLoad && cognitiveLoad && (
        <div className="absolute top-2 right-2 z-10">
          <CognitiveLoadIndicator
            level={cognitiveLoad.level as CognitiveLoadLevel}
            score={cognitiveLoad.score}
            compact
          />
        </div>
      )}

      {/* Main content */}
      <div className={cn(showConfidenceStep && 'opacity-50 pointer-events-none')}>
        {enhancedChildren}
      </div>

      {/* Confidence step overlay */}
      {showConfidenceStep && (
        <div className="absolute inset-0 bg-lxd-dark-page/90 backdrop-blur-xs flex items-center justify-center p-4 z-20">
          <div className="max-w-md w-full bg-lxd-dark-surface rounded-xl p-6 border border-lxd-dark-surface-alt">
            <h3 className="text-lg font-bold text-lxd-text-light-primary mb-2">
              How confident are you?
            </h3>
            <p className="text-sm text-lxd-text-light-secondary mb-6">
              Rate your confidence before seeing the result. This helps us personalize your
              learning.
            </p>

            <ConfidenceSlider
              value={confidence}
              onChange={handleConfidenceChange}
              className="mb-6"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfidenceStep(false);
                  setPendingAnswer(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-lxd-dark-surface-alt text-lxd-text-light-secondary hover:bg-lxd-dark-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfidenceConfirm}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-lg bg-lxd-blue text-brand-primary hover:bg-lxd-blue/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intervention modal */}
      {intervention && (
        <InterventionModal
          intervention={intervention}
          onAccept={handleInterventionAccept}
          onDismiss={handleInterventionDismiss}
        />
      )}
    </div>
  );
}

// Export type for children render prop
export type AdaptiveQuestionRenderProps = {
  onSubmit: (answer: unknown, correct: boolean) => Promise<void>;
  recordRevision: () => void;
};
