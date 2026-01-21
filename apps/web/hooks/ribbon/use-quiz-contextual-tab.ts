/**
 * useQuizContextualTab - Contextual tab for quiz/assessment block editing
 * Provides Question and Feedback tool groups for quiz configuration
 */

import {
  CheckCircle,
  HelpCircle,
  ListChecks,
  MessageSquare,
  RefreshCw,
  Settings,
  Shuffle,
  Star,
  XCircle,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { ContextualTab, UseContextualTabResult } from './types';

interface UseQuizContextualTabOptions {
  /** Current question type */
  questionType?: 'multiple-choice' | 'multiple-select' | 'true-false' | 'fill-blank';
  /** Whether shuffle is enabled */
  isShuffled?: boolean;
  /** Callback to toggle shuffle */
  onToggleShuffle?: () => void;
  /** Callback to open question settings */
  onOpenSettings?: () => void;
  /** Callback to add a choice/option */
  onAddChoice?: () => void;
  /** Callback to mark correct answer */
  onMarkCorrect?: () => void;
  /** Callback to configure points */
  onConfigurePoints?: () => void;
  /** Callback to configure attempts */
  onConfigureAttempts?: () => void;
  /** Callback to edit correct feedback */
  onEditCorrectFeedback?: () => void;
  /** Callback to edit incorrect feedback */
  onEditIncorrectFeedback?: () => void;
  /** Callback to edit hint */
  onEditHint?: () => void;
}

/**
 * Hook that returns a contextual tab configuration for quiz editing
 *
 * @example
 * ```tsx
 * const { tab } = useQuizContextualTab({
 *   questionType: "multiple-choice",
 *   isShuffled,
 *   onToggleShuffle: () => setIsShuffled(!isShuffled),
 *   onOpenSettings: () => setSettingsOpen(true),
 * });
 * ```
 */
export function useQuizContextualTab(
  options: UseQuizContextualTabOptions = {},
): UseContextualTabResult {
  const {
    questionType = 'multiple-choice',
    isShuffled = false,
    onToggleShuffle,
    onOpenSettings,
    onAddChoice,
    onMarkCorrect,
    onConfigurePoints,
    onConfigureAttempts,
    onEditCorrectFeedback,
    onEditIncorrectFeedback,
    onEditHint,
  } = options;

  const [isActive] = useState(false);

  // Determine icon based on question type
  // Wrapped in useCallback to prevent recreation on every render
  const getQuestionIcon = useCallback(() => {
    switch (questionType) {
      case 'multiple-select':
        return ListChecks;
      case 'true-false':
        return CheckCircle;
      case 'fill-blank':
        return MessageSquare;
      default:
        return HelpCircle;
    }
  }, [questionType]);

  const tab = useMemo<ContextualTab>(
    () => ({
      id: 'quiz-tools',
      label: 'Quiz Tools',
      icon: getQuestionIcon(),
      color: 'amber',
      groups: [
        {
          id: 'question',
          label: 'Question',
          tools: [
            {
              id: 'add-choice',
              label: 'Add Choice',
              icon: ListChecks,
              onClick: onAddChoice,
              disabled: questionType === 'true-false' || questionType === 'fill-blank',
            },
            {
              id: 'mark-correct',
              label: 'Mark Correct',
              icon: CheckCircle,
              onClick: onMarkCorrect,
              variant: 'primary',
            },
            {
              id: 'shuffle',
              label: isShuffled ? 'Shuffled' : 'Shuffle',
              icon: Shuffle,
              onClick: onToggleShuffle,
              disabled: questionType === 'fill-blank',
            },
            {
              id: 'points',
              label: 'Points',
              icon: Star,
              onClick: onConfigurePoints,
            },
            {
              id: 'attempts',
              label: 'Attempts',
              icon: RefreshCw,
              onClick: onConfigureAttempts,
            },
            {
              id: 'settings',
              label: 'Settings',
              icon: Settings,
              onClick: onOpenSettings,
            },
          ],
        },
        {
          id: 'feedback',
          label: 'Feedback',
          tools: [
            {
              id: 'correct-feedback',
              label: 'Correct',
              icon: CheckCircle,
              onClick: onEditCorrectFeedback,
            },
            {
              id: 'incorrect-feedback',
              label: 'Incorrect',
              icon: XCircle,
              onClick: onEditIncorrectFeedback,
            },
            {
              id: 'hint',
              label: 'Hint',
              icon: HelpCircle,
              onClick: onEditHint,
            },
          ],
        },
      ],
    }),
    [
      questionType,
      isShuffled,
      onToggleShuffle,
      onOpenSettings,
      onAddChoice,
      onMarkCorrect,
      onConfigurePoints,
      onConfigureAttempts,
      onEditCorrectFeedback,
      onEditIncorrectFeedback,
      onEditHint,
      getQuestionIcon,
    ],
  );

  return { tab, isActive };
}
