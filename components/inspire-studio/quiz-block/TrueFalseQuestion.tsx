'use client';

import { Check, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { TrueFalseQuestion as TFQuestion } from './types';

interface TrueFalseQuestionProps {
  question: TFQuestion;
  selectedAnswer: boolean | null;
  onAnswerChange: (answer: boolean) => void;
  showFeedback: boolean;
  isSubmitted: boolean;
  disabled?: boolean;
}

export function TrueFalseQuestion({
  question,
  selectedAnswer,
  onAnswerChange,
  showFeedback,
  isSubmitted,
  disabled,
}: TrueFalseQuestionProps): React.JSX.Element {
  const handleSelect = useCallback(
    (answer: boolean): void => {
      if (disabled || isSubmitted) return;
      onAnswerChange(answer);
    },
    [onAnswerChange, disabled, isSubmitted],
  );

  const getStatus = useCallback(
    (buttonValue: boolean): 'correct' | 'incorrect' | 'missed' | 'neutral' => {
      if (!showFeedback) return 'neutral';

      const isSelected = selectedAnswer === buttonValue;
      const isCorrect = question.correctAnswer === buttonValue;

      if (isSelected && isCorrect) return 'correct';
      if (isSelected && !isCorrect) return 'incorrect';
      if (!isSelected && isCorrect) return 'missed';
      return 'neutral';
    },
    [showFeedback, selectedAnswer, question.correctAnswer],
  );

  const trueStatus = getStatus(true);
  const falseStatus = getStatus(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* True Button */}
        <button
          type="button"
          onClick={() => handleSelect(true)}
          disabled={disabled || isSubmitted}
          className={cn(
            'flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all',
            !isSubmitted && !disabled && 'hover:border-green-300 hover:bg-green-50',
            selectedAnswer === true && !showFeedback && 'border-brand-success bg-green-50',
            selectedAnswer !== true && !showFeedback && 'border-brand-default',
            trueStatus === 'correct' && 'border-brand-success bg-green-100',
            trueStatus === 'incorrect' && 'border-brand-error bg-red-100',
            trueStatus === 'missed' && 'border-amber-500 bg-amber-100',
            (disabled || isSubmitted) && 'cursor-default',
          )}
        >
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              !showFeedback && 'bg-green-100',
              trueStatus === 'correct' && 'bg-brand-success',
              trueStatus === 'incorrect' && 'bg-brand-error',
              trueStatus === 'missed' && 'bg-brand-warning',
            )}
          >
            {showFeedback ? (
              trueStatus === 'correct' ? (
                <Check className="w-8 h-8 text-brand-primary" />
              ) : trueStatus === 'incorrect' ? (
                <X className="w-8 h-8 text-brand-primary" />
              ) : trueStatus === 'missed' ? (
                <Check className="w-8 h-8 text-brand-primary" />
              ) : (
                <ThumbsUp className="w-8 h-8 text-green-600" />
              )
            ) : (
              <ThumbsUp
                className={cn(
                  'w-8 h-8',
                  selectedAnswer === true ? 'text-green-600' : 'text-brand-muted',
                )}
              />
            )}
          </div>

          <span
            className={cn(
              'text-xl font-bold',
              !showFeedback && selectedAnswer === true && 'text-green-700',
              !showFeedback && selectedAnswer !== true && 'text-brand-secondary',
              trueStatus === 'correct' && 'text-green-700',
              trueStatus === 'incorrect' && 'text-red-700',
              trueStatus === 'missed' && 'text-amber-700',
            )}
          >
            TRUE
          </span>

          {showFeedback && (
            <span
              className={cn(
                'text-xs font-medium',
                trueStatus === 'correct' && 'text-green-600',
                trueStatus === 'incorrect' && 'text-red-600',
                trueStatus === 'missed' && 'text-amber-600',
              )}
            >
              {trueStatus === 'correct' && 'Correct!'}
              {trueStatus === 'incorrect' && 'Incorrect'}
              {trueStatus === 'missed' && 'Correct answer'}
            </span>
          )}
        </button>

        {/* False Button */}
        <button
          type="button"
          onClick={() => handleSelect(false)}
          disabled={disabled || isSubmitted}
          className={cn(
            'flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all',
            !isSubmitted && !disabled && 'hover:border-red-300 hover:bg-red-50',
            selectedAnswer === false && !showFeedback && 'border-brand-error bg-red-50',
            selectedAnswer !== false && !showFeedback && 'border-brand-default',
            falseStatus === 'correct' && 'border-brand-success bg-green-100',
            falseStatus === 'incorrect' && 'border-brand-error bg-red-100',
            falseStatus === 'missed' && 'border-amber-500 bg-amber-100',
            (disabled || isSubmitted) && 'cursor-default',
          )}
        >
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              !showFeedback && 'bg-red-100',
              falseStatus === 'correct' && 'bg-brand-success',
              falseStatus === 'incorrect' && 'bg-brand-error',
              falseStatus === 'missed' && 'bg-brand-warning',
            )}
          >
            {showFeedback ? (
              falseStatus === 'correct' ? (
                <Check className="w-8 h-8 text-brand-primary" />
              ) : falseStatus === 'incorrect' ? (
                <X className="w-8 h-8 text-brand-primary" />
              ) : falseStatus === 'missed' ? (
                <Check className="w-8 h-8 text-brand-primary" />
              ) : (
                <ThumbsDown className="w-8 h-8 text-red-600" />
              )
            ) : (
              <ThumbsDown
                className={cn(
                  'w-8 h-8',
                  selectedAnswer === false ? 'text-red-600' : 'text-brand-muted',
                )}
              />
            )}
          </div>

          <span
            className={cn(
              'text-xl font-bold',
              !showFeedback && selectedAnswer === false && 'text-red-700',
              !showFeedback && selectedAnswer !== false && 'text-brand-secondary',
              falseStatus === 'correct' && 'text-green-700',
              falseStatus === 'incorrect' && 'text-red-700',
              falseStatus === 'missed' && 'text-amber-700',
            )}
          >
            FALSE
          </span>

          {showFeedback && (
            <span
              className={cn(
                'text-xs font-medium',
                falseStatus === 'correct' && 'text-green-600',
                falseStatus === 'incorrect' && 'text-red-600',
                falseStatus === 'missed' && 'text-amber-600',
              )}
            >
              {falseStatus === 'correct' && 'Correct!'}
              {falseStatus === 'incorrect' && 'Incorrect'}
              {falseStatus === 'missed' && 'Correct answer'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
