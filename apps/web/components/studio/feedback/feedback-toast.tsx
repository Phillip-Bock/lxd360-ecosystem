'use client';

/**
 * FeedbackToast - Toast notification component for feedback messages
 * Supports stacking, auto-dismiss, and various sentiments
 */

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToasts } from '@/providers/feedback-provider';
import type { FeedbackMessage, FeedbackSentiment } from '@/types/studio/feedback';

// =============================================================================
// TOAST ICONS
// =============================================================================

const SENTIMENT_ICONS: Record<FeedbackSentiment, React.ComponentType<{ className?: string }>> = {
  positive: CheckCircle,
  neutral: Info,
  negative: XCircle,
  warning: AlertTriangle,
};

const SENTIMENT_COLORS: Record<FeedbackSentiment, string> = {
  positive: 'text-green-500',
  neutral: 'text-cyan-500',
  negative: 'text-red-500',
  warning: 'text-yellow-500',
};

const SENTIMENT_BORDERS: Record<FeedbackSentiment, string> = {
  positive: 'border-green-500/30',
  neutral: 'border-cyan-500/30',
  negative: 'border-red-500/30',
  warning: 'border-yellow-500/30',
};

const SENTIMENT_BACKGROUNDS: Record<FeedbackSentiment, string> = {
  positive: 'bg-green-500/10',
  neutral: 'bg-cyan-500/10',
  negative: 'bg-red-500/10',
  warning: 'bg-yellow-500/10',
};

// =============================================================================
// POSITION STYLES
// =============================================================================

type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center';

const POSITION_STYLES: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

const ANIMATION_VARIANTS = {
  'top-left': {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  },
  'top-right': {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  },
  'top-center': {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 },
  },
  'bottom-left': {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  },
  'bottom-right': {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  },
  'bottom-center': {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 },
  },
} as const;

// =============================================================================
// SINGLE TOAST
// =============================================================================

interface ToastItemProps {
  feedback: FeedbackMessage;
  onDismiss: () => void;
  position: ToastPosition;
}

function ToastItem({ feedback, onDismiss, position }: ToastItemProps) {
  const Icon = SENTIMENT_ICONS[feedback.sentiment];
  const variants = ANIMATION_VARIANTS[position];

  return (
    <motion.div
      layout
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'pointer-events-auto relative flex w-80 max-w-md gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        'bg-background/95',
        SENTIMENT_BORDERS[feedback.sentiment],
        SENTIMENT_BACKGROUNDS[feedback.sentiment],
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={cn('shrink-0', SENTIMENT_COLORS[feedback.sentiment])}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {feedback.title && <p className="text-sm font-medium text-foreground">{feedback.title}</p>}
        <p className={cn('text-sm text-muted-foreground', feedback.title && 'mt-1')}>
          {feedback.message}
        </p>

        {/* Actions */}
        {feedback.actions && feedback.actions.length > 0 && (
          <div className="mt-3 flex gap-2">
            {feedback.actions.map((action) => (
              <button
                type="button"
                key={action.id}
                onClick={() => {
                  if (action.actionType === 'dismiss') {
                    onDismiss();
                  }
                }}
                className={cn(
                  'text-xs font-medium transition-colors',
                  action.primary
                    ? 'text-cyan-500 hover:text-cyan-400'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {feedback.dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}

// =============================================================================
// TOAST CONTAINER
// =============================================================================

export function FeedbackToastContainer() {
  const { toasts, dismiss, position } = useToasts();
  const safePosition = (position in POSITION_STYLES ? position : 'bottom-right') as ToastPosition;
  const positionClass = POSITION_STYLES[safePosition];

  return (
    <section
      className={cn(
        'fixed z-50 flex flex-col gap-2 pointer-events-none',
        positionClass,
        safePosition.includes('bottom') ? 'flex-col-reverse' : 'flex-col',
      )}
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            feedback={toast}
            onDismiss={() => dismiss(toast.id)}
            position={safePosition}
          />
        ))}
      </AnimatePresence>
    </section>
  );
}

export default FeedbackToastContainer;
