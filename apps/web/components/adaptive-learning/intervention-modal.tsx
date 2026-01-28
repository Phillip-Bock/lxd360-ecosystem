'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { cn } from '@/lib/utils';

export type InterventionType =
  | 'scaffolding'
  | 'misconception_correction'
  | 'engagement'
  | 'pathway_adjustment'
  | 'frustration_support'
  | 'break_suggestion'
  | 'metacognitive_support';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Intervention {
  id: string;
  type: InterventionType;
  severity: Severity;
  message: string;
  action?: string;
}

interface InterventionModalProps {
  intervention: Intervention;
  onAccept: (interventionId: string, action?: string) => void;
  onDismiss: (interventionId: string) => void;
  className?: string;
}

const INTERVENTION_CONFIG: Record<
  InterventionType,
  {
    title: string;
    emoji: string;
    color: string;
    bgColor: string;
    borderColor: string;
    actions: Array<{ label: string; action: string; primary?: boolean }>;
  }
> = {
  scaffolding: {
    title: "Let's Try a Different Approach",
    emoji: '🪜',
    color: 'text-brand-cyan',
    bgColor: 'bg-brand-primary/10',
    borderColor: 'border-brand-primary/30',
    actions: [
      { label: 'Show Example', action: 'worked_example', primary: true },
      { label: 'Break It Down', action: 'decompose_problem' },
      { label: 'Give Me a Hint', action: 'hint' },
    ],
  },
  misconception_correction: {
    title: 'Important Clarification',
    emoji: '⚠️',
    color: 'text-brand-warning',
    bgColor: 'bg-brand-warning/10',
    borderColor: 'border-amber-500/30',
    actions: [
      { label: 'Review Concept', action: 'review_concept', primary: true },
      { label: 'Show Correct Approach', action: 'correct_approach' },
    ],
  },
  engagement: {
    title: 'Take Your Time',
    emoji: '🤔',
    color: 'text-brand-purple',
    bgColor: 'bg-brand-secondary/10',
    borderColor: 'border-brand-secondary/30',
    actions: [
      { label: "I'll Think More", action: 'continue_thinking', primary: true },
      { label: 'Need Help', action: 'request_help' },
    ],
  },
  pathway_adjustment: {
    title: 'Suggested Learning Path',
    emoji: '🗺️',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    actions: [
      { label: 'Review Prerequisites', action: 'prerequisite_review', primary: true },
      { label: 'Continue Anyway', action: 'continue' },
    ],
  },
  frustration_support: {
    title: "I'm Here to Help",
    emoji: '💙',
    color: 'text-sky-400',
    bgColor: 'bg-brand-accent/10',
    borderColor: 'border-sky-500/30',
    actions: [
      { label: 'Try Different Approach', action: 'alternative_explanation', primary: true },
      { label: 'Take a Break', action: 'suggest_break' },
      { label: 'Ask for Help', action: 'request_instructor' },
    ],
  },
  break_suggestion: {
    title: 'Time for a Break?',
    emoji: '☕',
    color: 'text-orange-400',
    bgColor: 'bg-brand-warning/10',
    borderColor: 'border-orange-500/30',
    actions: [
      { label: 'Take 5 Minutes', action: 'take_break', primary: true },
      { label: "I'm Good", action: 'continue' },
    ],
  },
  metacognitive_support: {
    title: "Let's Build Awareness",
    emoji: '🧠',
    color: 'text-brand-purple',
    bgColor: 'bg-brand-secondary/10',
    borderColor: 'border-violet-500/30',
    actions: [
      { label: 'Review My Reasoning', action: 'reasoning_review', primary: true },
      { label: 'Continue', action: 'continue' },
    ],
  },
};

const SEVERITY_STYLES: Record<Severity, string> = {
  low: '',
  medium: 'ring-2 ring-yellow-500/30',
  high: 'ring-2 ring-orange-500/50',
  critical: 'ring-4 ring-red-500/50 animate-pulse',
};

export function InterventionModal({
  intervention,
  onAccept,
  onDismiss,
  className,
}: InterventionModalProps): React.JSX.Element {
  const config = INTERVENTION_CONFIG[intervention.type] || INTERVENTION_CONFIG.scaffolding;
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleAction = useCallback(
    (action: string): void => {
      onAccept(intervention.id, action);
    },
    [intervention.id, onAccept],
  );

  const handleDismiss = useCallback((): void => {
    onDismiss(intervention.id);
  }, [intervention.id, onDismiss]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDismiss]);

  // Focus the dialog when it opens
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/50 backdrop-blur-xs',
      )}
    >
      {/* Backdrop button - accessible way to close modal by clicking outside */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={handleDismiss}
        aria-label="Close modal"
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative max-w-md w-full rounded-xl border-2 p-6',
          'shadow-2xl',
          config.bgColor,
          config.borderColor,
          SEVERITY_STYLES[intervention.severity],
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl" aria-hidden="true">
            {config.emoji}
          </div>
          <div className="flex-1">
            <h3 id={titleId} className={cn('text-lg font-bold', config.color)}>
              {config.title}
            </h3>
            {intervention.severity === 'critical' && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium bg-brand-error/20 text-brand-error">
                <span
                  className="w-2 h-2 rounded-full bg-brand-error animate-pulse"
                  aria-hidden="true"
                />
                Safety Alert
              </span>
            )}
          </div>
          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="text-lxd-text-light-muted hover:text-lxd-text-light-primary transition-colors"
            aria-label="Dismiss intervention"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <title>Close</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Message */}
        <p className="text-lxd-text-light-secondary mb-6">{intervention.message}</p>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {config.actions.map((action) => (
            <button
              type="button"
              key={action.action}
              onClick={() => handleAction(action.action)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                action.primary
                  ? cn(
                      'text-lxd-dark-page',
                      config.color.replace('text-', 'bg-').replace('-400', '-500'),
                      'hover:opacity-90',
                    )
                  : 'bg-lxd-dark-surface text-lxd-text-light-secondary hover:bg-lxd-dark-surface-alt',
              )}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Skip option */}
        <button
          type="button"
          onClick={handleDismiss}
          className="mt-4 w-full text-center text-xs text-lxd-text-light-muted hover:text-lxd-text-light-secondary transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
