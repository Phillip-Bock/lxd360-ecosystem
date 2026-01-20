'use client';

/**
 * FeedbackInline - Inline feedback component for embedded feedback messages
 * Used for assessment results, hints, and contextual feedback
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Sparkles,
  Trophy,
  X,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  AssessmentFeedback,
  AssessmentResultState,
  FeedbackMessage,
  FeedbackSentiment,
  FeedbackType,
} from '@/types/studio/feedback';

// =============================================================================
// TYPE ICONS
// =============================================================================

const TYPE_ICONS: Record<FeedbackType, React.ComponentType<{ className?: string }>> = {
  assessment: CheckCircle,
  guidance: Lightbulb,
  progress: Trophy,
  system: Info,
  celebration: Sparkles,
  encouragement: Sparkles,
  correction: AlertTriangle,
};

const SENTIMENT_STYLES: Record<FeedbackSentiment, { border: string; bg: string; icon: string }> = {
  positive: {
    border: 'border-green-500/40',
    bg: 'bg-green-500/10',
    icon: 'text-green-500',
  },
  neutral: {
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/10',
    icon: 'text-cyan-500',
  },
  negative: {
    border: 'border-red-500/40',
    bg: 'bg-red-500/10',
    icon: 'text-red-500',
  },
  warning: {
    border: 'border-yellow-500/40',
    bg: 'bg-yellow-500/10',
    icon: 'text-yellow-500',
  },
};

const RESULT_STATE_CONFIG: Record<
  AssessmentResultState,
  { icon: React.ComponentType<{ className?: string }>; label: string; sentiment: FeedbackSentiment }
> = {
  correct: { icon: CheckCircle, label: 'Correct!', sentiment: 'positive' },
  incorrect: { icon: XCircle, label: 'Incorrect', sentiment: 'negative' },
  partial: { icon: AlertTriangle, label: 'Partially Correct', sentiment: 'warning' },
  unanswered: { icon: Info, label: 'Not Answered', sentiment: 'neutral' },
  skipped: { icon: Info, label: 'Skipped', sentiment: 'neutral' },
  timeout: { icon: AlertTriangle, label: "Time's Up", sentiment: 'warning' },
};

// =============================================================================
// INLINE FEEDBACK COMPONENT
// =============================================================================

interface FeedbackInlineProps {
  feedback: FeedbackMessage;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
  showIcon?: boolean;
}

export function FeedbackInline({
  feedback,
  onDismiss,
  className,
  compact = false,
  showIcon = true,
}: FeedbackInlineProps) {
  const styles = SENTIMENT_STYLES[feedback.sentiment];
  const Icon = TYPE_ICONS[feedback.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-lg border',
        styles.border,
        styles.bg,
        compact ? 'px-3 py-2' : 'p-4',
        className,
      )}
      role="alert"
    >
      <div className="flex gap-3">
        {showIcon && (
          <div className={cn('shrink-0', styles.icon)}>
            <Icon className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {feedback.title && (
            <p className={cn('font-medium text-foreground', compact ? 'text-sm' : 'text-base')}>
              {feedback.title}
            </p>
          )}
          <p
            className={cn(
              'text-muted-foreground',
              compact ? 'text-xs' : 'text-sm',
              feedback.title && 'mt-1',
            )}
          >
            {feedback.message}
          </p>

          {feedback.details && (
            <p className="mt-2 text-xs text-muted-foreground/80">{feedback.details}</p>
          )}

          {/* Actions */}
          {feedback.actions && feedback.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {feedback.actions.map((action) => (
                <button
                  type="button"
                  key={action.id}
                  onClick={() => {
                    if (action.actionType === 'dismiss' && onDismiss) {
                      onDismiss();
                    }
                  }}
                  className={cn(
                    'text-xs font-medium transition-colors rounded px-2 py-1',
                    action.primary
                      ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                      : 'bg-background/50 text-muted-foreground hover:text-foreground',
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {feedback.dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// ASSESSMENT FEEDBACK COMPONENT
// =============================================================================

interface AssessmentFeedbackInlineProps {
  feedback: AssessmentFeedback;
  onRetry?: () => void;
  onContinue?: () => void;
  className?: string;
}

export function AssessmentFeedbackInline({
  feedback,
  onRetry,
  onContinue,
  className,
}: AssessmentFeedbackInlineProps) {
  const resultState: AssessmentResultState = feedback.isCorrect
    ? 'correct'
    : feedback.score > 0
      ? 'partial'
      : 'incorrect';

  const config = RESULT_STATE_CONFIG[resultState];
  const styles = SENTIMENT_STYLES[config.sentiment];
  const Icon = config.icon;

  const scorePercentage = Math.round(feedback.score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn('rounded-lg border', styles.border, styles.bg, 'p-4', className)}
      role="alert"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn('shrink-0', styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{config.label}</p>
          {feedback.pointsEarned > 0 && (
            <p className="text-sm text-muted-foreground">
              +{feedback.pointsEarned} points
              {feedback.bonusPoints ? ` (+${feedback.bonusPoints} bonus)` : ''}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{scorePercentage}%</p>
          <p className="text-xs text-muted-foreground">
            {feedback.attemptNumber}/{feedback.maxAttempts} attempts
          </p>
        </div>
      </div>

      {/* Message */}
      {feedback.message && <p className="mt-3 text-sm text-muted-foreground">{feedback.message}</p>}

      {/* Explanation */}
      {feedback.explanation && (
        <div className="mt-3 p-3 rounded bg-background/50">
          <p className="text-xs font-medium text-foreground mb-1">Explanation</p>
          <p className="text-xs text-muted-foreground">{feedback.explanation}</p>
        </div>
      )}

      {/* Correct answer reveal */}
      {feedback.correctAnswer && !feedback.isCorrect && (
        <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
          <p className="text-xs font-medium text-green-500 mb-1">Correct Answer</p>
          <p className="text-sm text-foreground">{feedback.correctAnswer}</p>
        </div>
      )}

      {/* Choice feedback */}
      {feedback.choiceFeedback && feedback.choiceFeedback.length > 0 && (
        <div className="mt-3 space-y-2">
          {feedback.choiceFeedback
            .filter((cf) => cf.feedback && cf.selected)
            .map((cf) => (
              <div
                key={cf.choiceId}
                className={cn(
                  'text-xs p-2 rounded',
                  cf.correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400',
                )}
              >
                {cf.feedback}
              </div>
            ))}
        </div>
      )}

      {/* Next steps */}
      {feedback.nextSteps && feedback.nextSteps.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Next Steps</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {feedback.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-cyan-500">-</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {feedback.canRetry && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 text-sm font-medium rounded bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
          >
            Try Again
          </button>
        )}
        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded transition-colors',
              feedback.canRetry
                ? 'bg-background/50 text-muted-foreground hover:text-foreground'
                : 'bg-cyan-500 text-white hover:bg-cyan-600',
            )}
          >
            Continue
          </button>
        )}
      </div>

      {/* Time taken */}
      {feedback.timeTaken !== undefined && (
        <p className="mt-3 text-xs text-muted-foreground text-right">
          Completed in {Math.round(feedback.timeTaken)}s
        </p>
      )}
    </motion.div>
  );
}

// =============================================================================
// GUIDANCE HINT COMPONENT
// =============================================================================

interface GuidanceHintProps {
  message: string;
  hintLevel?: number;
  hintCost?: number;
  onReveal?: () => void;
  revealed?: boolean;
  className?: string;
}

export function GuidanceHint({
  message,
  hintLevel = 1,
  hintCost,
  onReveal,
  revealed = true,
  className,
}: GuidanceHintProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3', className)}
    >
      <div className="flex items-start gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-yellow-500">
              Hint {hintLevel > 1 ? `(Level ${hintLevel})` : ''}
            </span>
            {hintCost !== undefined && hintCost > 0 && (
              <span className="text-xs text-muted-foreground">-{hintCost} pts</span>
            )}
          </div>
          {revealed ? (
            <p className="text-sm text-muted-foreground">{message}</p>
          ) : (
            <button
              type="button"
              onClick={onReveal}
              className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              Reveal hint{hintCost ? ` (-${hintCost} pts)` : ''}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// WRAPPER FOR ANIMATED FEEDBACK
// =============================================================================

interface AnimatedFeedbackProps {
  show: boolean;
  children: React.ReactNode;
}

export function AnimatedFeedback({ show, children }: AnimatedFeedbackProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FeedbackInline;
