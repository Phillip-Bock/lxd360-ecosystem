/**
 * useFeedback Hook - Phase 8
 * Enhanced feedback hook with assessment helpers and feedback utilities
 */

import { useCallback } from 'react';
import {
  useFeedback as useFeedbackContext,
  useFeedbackModal,
  useFeedbackSettings,
  useToasts,
} from '@/providers/feedback-provider';
import type {
  AssessmentFeedback,
  AssessmentResultState,
  ChoiceFeedback,
  FeedbackSentiment,
} from '@/types/studio/feedback';

// =============================================================================
// TYPES
// =============================================================================

interface AssessmentOptions {
  blockId: string;
  blockType: 'mc-question' | 'fitb-question';
  userResponse: string | string[];
  correctResponse: string | string[];
  points: number;
  maxAttempts: number;
  attemptNumber: number;
  timeTaken?: number;
  partialCredit?: boolean;
  choiceFeedback?: ChoiceFeedback[];
  feedbackMessages?: {
    correct?: string;
    incorrect?: string;
    partial?: string;
  };
  explanation?: string;
  showCorrectAnswer?: boolean;
}

interface ProgressOptions {
  current: number;
  total: number;
  label?: string;
  milestoneMessage?: string;
  showModal?: boolean;
}

interface StreakOptions {
  count: number;
  milestone?: number;
  showCelebration?: boolean;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useAssessmentFeedback() {
  const feedback = useFeedbackContext();

  /**
   * Calculate assessment result from user response
   */
  const calculateResult = useCallback(
    (options: AssessmentOptions): { state: AssessmentResultState; score: number } => {
      const { userResponse, correctResponse, partialCredit } = options;

      const userAnswers = Array.isArray(userResponse) ? userResponse : [userResponse];
      const correctAnswers = Array.isArray(correctResponse) ? correctResponse : [correctResponse];

      const correctCount = userAnswers.filter((a) => correctAnswers.includes(a)).length;
      const incorrectCount = userAnswers.filter((a) => !correctAnswers.includes(a)).length;

      // All correct and no incorrect
      if (correctCount === correctAnswers.length && incorrectCount === 0) {
        return { state: 'correct', score: 1 };
      }

      // Some correct answers (partial credit)
      if (partialCredit && correctCount > 0) {
        const score = correctCount / correctAnswers.length;
        return { state: 'partial', score };
      }

      // All wrong
      return { state: 'incorrect', score: 0 };
    },
    [],
  );

  /**
   * Show assessment feedback based on result
   */
  const showAssessmentResult = useCallback(
    (options: AssessmentOptions): string => {
      const { state, score } = calculateResult(options);
      const {
        blockId,
        points,
        maxAttempts,
        attemptNumber,
        timeTaken,
        choiceFeedback,
        feedbackMessages,
        explanation,
        correctResponse,
        showCorrectAnswer,
        userResponse,
      } = options;

      const isCorrect = state === 'correct';
      const canRetry = attemptNumber < maxAttempts;
      const pointsEarned = Math.round(score * points);

      // Determine sentiment
      const sentiment: FeedbackSentiment =
        state === 'correct' ? 'positive' : state === 'partial' ? 'warning' : 'negative';

      // Get appropriate message
      let message = '';
      if (state === 'correct' && feedbackMessages?.correct) {
        message = feedbackMessages.correct;
      } else if (state === 'partial' && feedbackMessages?.partial) {
        message = feedbackMessages.partial;
      } else if (state === 'incorrect' && feedbackMessages?.incorrect) {
        message = feedbackMessages.incorrect;
      } else {
        message =
          state === 'correct'
            ? 'Great job! You got it right.'
            : state === 'partial'
              ? "You're on the right track, but not quite there."
              : "That's not quite right. Try again!";
      }

      const assessmentFeedback: Omit<AssessmentFeedback, 'id' | 'timestamp'> = {
        type: 'assessment',
        displayMode: 'inline',
        sentiment,
        priority: 'medium',
        message,
        duration: 0, // Persist until dismissed
        dismissible: true,
        isCorrect,
        score,
        maxScore: 1,
        attemptNumber,
        maxAttempts,
        canRetry,
        userResponse,
        correctAnswer:
          showCorrectAnswer && !isCorrect
            ? Array.isArray(correctResponse)
              ? correctResponse.join(', ')
              : correctResponse
            : undefined,
        choiceFeedback,
        timeTaken,
        pointsEarned,
        explanation,
        sourceId: blockId,
      };

      return feedback.showAssessmentFeedback(assessmentFeedback);
    },
    [calculateResult, feedback],
  );

  /**
   * Show correct answer celebration
   */
  const celebrateCorrect = useCallback(
    (options?: { points?: number; streak?: number; firstTry?: boolean }) => {
      const { streak, firstTry } = options || {};

      let title = 'Correct!';
      let message = 'Great job!';

      if (firstTry) {
        title = 'Perfect!';
        message = 'You got it right on the first try!';
      } else if (streak && streak >= 3) {
        title = `${streak} in a row!`;
        message = "You're on fire! Keep up the great work!";
      }

      return feedback.showCelebrationFeedback({
        displayMode: 'toast',
        sentiment: 'positive',
        priority: 'medium',
        message,
        title,
        duration: 3000,
        dismissible: true,
        celebrationType: firstTry ? 'first-try' : streak ? 'streak' : 'achievement',
        intensity: firstTry ? 4 : streak && streak >= 5 ? 5 : 3,
        showConfetti: firstTry || Boolean(streak && streak >= 5),
        playSound: true,
        soundId: 'correct',
        streakCount: streak,
      });
    },
    [feedback],
  );

  /**
   * Show encouragement after incorrect answer
   */
  const encourageRetry = useCallback(
    (attemptNumber: number, maxAttempts: number) => {
      const attemptsLeft = maxAttempts - attemptNumber;
      let message: string;
      let title: string;

      if (attemptsLeft > 2) {
        title = 'Keep trying!';
        message = `You have ${attemptsLeft} more attempts. You can do this!`;
      } else if (attemptsLeft === 2) {
        title = 'Almost there';
        message = "Take your time and think it through. You've got 2 attempts left.";
      } else if (attemptsLeft === 1) {
        title = 'Last chance';
        message = 'This is your final attempt. Take your time and review your answer carefully.';
      } else {
        title = "Don't give up";
        message = 'Learning takes practice. Review the explanation and try again later.';
      }

      return feedback.showEncouragementFeedback({
        displayMode: 'inline',
        sentiment: attemptsLeft <= 1 ? 'warning' : 'neutral',
        priority: 'medium',
        message,
        title,
        duration: 5000,
        dismissible: true,
        encouragementType: attemptsLeft <= 1 ? 'almost-there' : 'keep-going',
        personalized: false,
      });
    },
    [feedback],
  );

  return {
    ...feedback,
    calculateResult,
    showAssessmentResult,
    celebrateCorrect,
    encourageRetry,
  };
}

// =============================================================================
// PROGRESS FEEDBACK HOOK
// =============================================================================

export function useProgressFeedback() {
  const feedback = useFeedbackContext();

  /**
   * Update and optionally show progress feedback
   */
  const updateProgress = useCallback(
    (options: ProgressOptions): string | null => {
      const { current, total, label, milestoneMessage, showModal } = options;
      const progress = current / total;
      const progressPercent = Math.round(progress * 100);

      // Check for milestones (25%, 50%, 75%, 100%)
      const milestones = [0.25, 0.5, 0.75, 1];
      const hitMilestone = milestones.some((m) => progress >= m && (current - 1) / total < m);

      if (!hitMilestone && !showModal) {
        return null;
      }

      let title: string;
      let message: string;
      let progressType: 'milestone' | 'completion' | 'checkpoint' = 'checkpoint';

      if (progress >= 1) {
        title = 'Complete!';
        message = milestoneMessage || "Congratulations! You've completed this section.";
        progressType = 'completion';
      } else if (progress >= 0.75) {
        title = 'Almost there!';
        message = milestoneMessage || "You're 75% done. Just a little more to go!";
        progressType = 'milestone';
      } else if (progress >= 0.5) {
        title = 'Halfway there!';
        message = milestoneMessage || "Great progress! You're halfway through.";
        progressType = 'milestone';
      } else if (progress >= 0.25) {
        title = 'Good start!';
        message = milestoneMessage || "You've completed 25%. Keep going!";
        progressType = 'milestone';
      } else {
        title = 'Progress update';
        message = `${progressPercent}% complete`;
      }

      return feedback.showProgressFeedback({
        displayMode: showModal ? 'modal' : 'toast',
        sentiment: 'positive',
        priority: progress >= 1 ? 'high' : 'medium',
        message,
        title,
        duration: showModal ? 0 : 4000,
        dismissible: true,
        progressType,
        progress,
        progressLabel: label,
        itemsCompleted: current,
        totalItems: total,
      });
    },
    [feedback],
  );

  /**
   * Show completion celebration
   */
  const celebrateCompletion = useCallback(
    (title?: string, message?: string) => {
      return feedback.showCelebrationFeedback({
        displayMode: 'modal',
        sentiment: 'positive',
        priority: 'high',
        message: message || "You've successfully completed this section!",
        title: title || 'Congratulations!',
        duration: 0,
        dismissible: true,
        celebrationType: 'completion',
        intensity: 5,
        showConfetti: true,
        playSound: true,
        soundId: 'complete',
      });
    },
    [feedback],
  );

  return {
    ...feedback,
    updateProgress,
    celebrateCompletion,
  };
}

// =============================================================================
// STREAK FEEDBACK HOOK
// =============================================================================

export function useStreakFeedback() {
  const feedback = useFeedbackContext();

  /**
   * Update streak and show feedback at milestones
   */
  const updateStreak = useCallback(
    (options: StreakOptions): string | null => {
      const { count, milestone = 5, showCelebration = true } = options;

      // Check if we hit a milestone
      if (count > 0 && count % milestone === 0 && showCelebration) {
        return feedback.showCelebrationFeedback({
          displayMode: count >= 10 ? 'modal' : 'toast',
          sentiment: 'positive',
          priority: 'high',
          message: `You've answered ${count} questions correctly in a row!`,
          title: `${count} Streak!`,
          duration: count >= 10 ? 0 : 4000,
          dismissible: true,
          celebrationType: 'streak',
          intensity: Math.min(5, Math.floor(count / milestone)),
          showConfetti: count >= 10,
          playSound: true,
          soundId: 'streak',
          streakCount: count,
        });
      }

      return null;
    },
    [feedback],
  );

  /**
   * Show streak broken feedback
   */
  const streakBroken = useCallback(
    (previousStreak: number) => {
      if (previousStreak < 3) return null;

      return feedback.toast(`Your ${previousStreak} question streak has ended. Start a new one!`, {
        title: 'Streak ended',
        sentiment: 'neutral',
        duration: 3000,
      });
    },
    [feedback],
  );

  return {
    ...feedback,
    updateStreak,
    streakBroken,
  };
}

// =============================================================================
// GUIDANCE FEEDBACK HOOK
// =============================================================================

export function useGuidanceFeedback() {
  const feedback = useFeedbackContext();

  /**
   * Show a hint
   */
  const showHint = useCallback(
    (message: string, options?: { level?: number; cost?: number }) => {
      const { level = 1, cost } = options || {};

      return feedback.showGuidanceFeedback({
        displayMode: 'inline',
        sentiment: 'neutral',
        priority: 'medium',
        message,
        title: cost ? `Hint (−${cost} pts)` : 'Hint',
        duration: 0,
        dismissible: true,
        guidanceType: 'hint',
        hintLevel: level,
        hintCost: cost,
      });
    },
    [feedback],
  );

  /**
   * Show a tip
   */
  const showTip = useCallback(
    (message: string, title?: string) => {
      return feedback.showGuidanceFeedback({
        displayMode: 'toast',
        sentiment: 'neutral',
        priority: 'low',
        message,
        title: title || 'Tip',
        duration: 5000,
        dismissible: true,
        guidanceType: 'tip',
      });
    },
    [feedback],
  );

  /**
   * Show a warning
   */
  const showGuidanceWarning = useCallback(
    (message: string, title?: string) => {
      return feedback.showGuidanceFeedback({
        displayMode: 'inline',
        sentiment: 'warning',
        priority: 'medium',
        message,
        title: title || 'Heads up',
        duration: 0,
        dismissible: true,
        guidanceType: 'warning',
      });
    },
    [feedback],
  );

  return {
    ...feedback,
    showHint,
    showTip,
    showGuidanceWarning,
  };
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export { useFeedbackContext as useFeedback };
export { useFeedbackSettings, useToasts, useFeedbackModal };
