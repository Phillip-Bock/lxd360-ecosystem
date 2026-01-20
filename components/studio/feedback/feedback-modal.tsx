'use client';

/**
 * FeedbackModal - Modal dialog for important feedback messages
 * Used for celebrations, achievements, and critical feedback
 */

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, Sparkles, Trophy, X } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useFeedbackModal } from '@/providers/feedback-provider';
import type {
  CelebrationFeedback,
  FeedbackMessage,
  FeedbackSentiment,
  FeedbackType,
  ProgressFeedback,
} from '@/types/studio/feedback';

// =============================================================================
// ICONS & STYLES
// =============================================================================

const TYPE_ICONS: Record<FeedbackType, React.ComponentType<{ className?: string }>> = {
  assessment: CheckCircle,
  guidance: Info,
  progress: Trophy,
  system: Info,
  celebration: Sparkles,
  encouragement: Sparkles,
  correction: AlertTriangle,
};

const SENTIMENT_COLORS: Record<FeedbackSentiment, string> = {
  positive: 'text-green-500',
  neutral: 'text-cyan-500',
  negative: 'text-red-500',
  warning: 'text-yellow-500',
};

// =============================================================================
// CONFETTI COMPONENT
// =============================================================================

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  rotation: number;
}

function Confetti({ count = 50 }: { count?: number }) {
  const colors = ['#00d4ff', '#8b5cf6', '#00C853', '#FF9800', '#F44336', '#0072f5'];

  const pieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, x: `${piece.x}%`, rotate: piece.rotation, opacity: 1 }}
          animate={{
            y: '120%',
            rotate: piece.rotation + 360,
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: piece.delay,
            ease: 'easeOut',
          }}
          className="absolute w-2 h-2"
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
}

// =============================================================================
// FEEDBACK MODAL CONTENT
// =============================================================================

interface FeedbackModalContentProps {
  feedback: FeedbackMessage;
  onDismiss: () => void;
}

function FeedbackModalContent({ feedback, onDismiss }: FeedbackModalContentProps) {
  const Icon = TYPE_ICONS[feedback.type];
  const iconColor = SENTIMENT_COLORS[feedback.sentiment];

  const isCelebration = feedback.type === 'celebration';
  const celebrationFeedback = isCelebration ? (feedback as CelebrationFeedback) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative bg-background border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      {/* Confetti for celebrations */}
      {celebrationFeedback?.showConfetti && <Confetti />}

      {/* Close button */}
      {feedback.dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Icon header */}
      <div className="pt-8 pb-4 flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            feedback.sentiment === 'positive' && 'bg-green-500/20',
            feedback.sentiment === 'neutral' && 'bg-cyan-500/20',
            feedback.sentiment === 'negative' && 'bg-red-500/20',
            feedback.sentiment === 'warning' && 'bg-yellow-500/20',
          )}
        >
          <Icon className={cn('h-8 w-8', iconColor)} />
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 text-center">
        {feedback.title && (
          <motion.h2
            id="feedback-modal-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-foreground mb-2"
          >
            {feedback.title}
          </motion.h2>
        )}

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground"
        >
          {feedback.message}
        </motion.p>

        {feedback.details && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-muted-foreground/80"
          >
            {feedback.details}
          </motion.p>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex gap-3 justify-center"
        >
          {feedback.actions && feedback.actions.length > 0 ? (
            feedback.actions.map((action) => (
              <button
                type="button"
                key={action.id}
                onClick={() => {
                  if (action.actionType === 'dismiss') {
                    onDismiss();
                  }
                }}
                className={cn(
                  'px-6 py-2 rounded-lg font-medium transition-colors',
                  action.primary || action.variant === 'primary'
                    ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                    : 'bg-background border border-border text-foreground hover:bg-muted',
                )}
              >
                {action.label}
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={onDismiss}
              className="px-6 py-2 rounded-lg font-medium bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
            >
              Continue
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// PROGRESS MODAL CONTENT
// =============================================================================

interface ProgressModalContentProps {
  feedback: ProgressFeedback;
  onDismiss: () => void;
}

function ProgressModalContent({ feedback, onDismiss }: ProgressModalContentProps) {
  const progressPercent = Math.round(feedback.progress * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative bg-background border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Achievement celebration */}
      {feedback.progressType === 'milestone' && <Confetti count={30} />}

      {/* Close button */}
      {feedback.dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Icon header */}
      <div className="pt-8 pb-4 flex justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center"
        >
          <Trophy className="h-8 w-8 text-cyan-500" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 text-center">
        {feedback.title && (
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-foreground mb-2"
          >
            {feedback.title}
          </motion.h2>
        )}

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground"
        >
          {feedback.message}
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4"
        >
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>{feedback.progressLabel || 'Progress'}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-cyan-500"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {feedback.itemsCompleted} of {feedback.totalItems} completed
          </p>
        </motion.div>

        {/* Badges earned */}
        {feedback.badgesEarned && feedback.badgesEarned.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <p className="text-sm font-medium text-foreground mb-2">Badges Earned</p>
            <div className="flex justify-center gap-2">
              {feedback.badgesEarned.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.7 }}
                  className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center"
                  title={badge.name}
                >
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Points/XP */}
        {(feedback.pointsEarned || feedback.xpGained) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex justify-center gap-4 text-sm"
          >
            {feedback.pointsEarned !== undefined && (
              <div className="text-cyan-500 font-medium">+{feedback.pointsEarned} pts</div>
            )}
            {feedback.xpGained !== undefined && (
              <div className="text-purple-500 font-medium">+{feedback.xpGained} XP</div>
            )}
          </motion.div>
        )}

        {/* Action */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <button
            type="button"
            onClick={onDismiss}
            className="px-6 py-2 rounded-lg font-medium bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
          >
            Continue
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// MAIN MODAL CONTAINER
// =============================================================================

export function FeedbackModalContainer() {
  const { isOpen, feedback, dismiss } = useFeedbackModal();

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && feedback?.dismissible) {
        dismiss();
      }
    },
    [isOpen, feedback, dismiss],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && feedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => feedback.dismissible && dismiss()}
          />

          {/* Modal content */}
          {feedback.type === 'progress' ? (
            <ProgressModalContent feedback={feedback as ProgressFeedback} onDismiss={dismiss} />
          ) : (
            <FeedbackModalContent feedback={feedback} onDismiss={dismiss} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FeedbackModalContainer;
