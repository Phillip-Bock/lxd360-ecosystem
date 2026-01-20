'use client';

import { Check, X } from 'lucide-react';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { MultipleChoiceQuestion as MCQuestion } from './types';

interface MultipleChoiceQuestionProps {
  question: MCQuestion;
  selectedAnswers: string[];
  onAnswerChange: (answers: string[]) => void;
  showFeedback: boolean;
  isSubmitted: boolean;
  disabled?: boolean;
}

export function MultipleChoiceQuestion({
  question,
  selectedAnswers,
  onAnswerChange,
  showFeedback,
  isSubmitted,
  disabled,
}: MultipleChoiceQuestionProps): React.JSX.Element {
  const handleOptionSelect = useCallback(
    (optionId: string) => {
      if (disabled || isSubmitted) return;

      if (question.allowMultiple) {
        // Checkbox behavior
        if (selectedAnswers.includes(optionId)) {
          onAnswerChange(selectedAnswers.filter((id) => id !== optionId));
        } else {
          onAnswerChange([...selectedAnswers, optionId]);
        }
      } else {
        // Radio button behavior
        onAnswerChange([optionId]);
      }
    },
    [question.allowMultiple, selectedAnswers, onAnswerChange, disabled, isSubmitted],
  );

  const isCorrect = useCallback(
    (optionId: string): boolean => {
      const option = question.options.find((o) => o.id === optionId);
      return option?.isCorrect ?? false;
    },
    [question.options],
  );

  const getOptionStatus = useCallback(
    (optionId: string): 'correct' | 'incorrect' | 'missed' | 'neutral' => {
      if (!showFeedback) return 'neutral';

      const isSelected = selectedAnswers.includes(optionId);
      const optionIsCorrect = isCorrect(optionId);

      if (isSelected && optionIsCorrect) return 'correct';
      if (isSelected && !optionIsCorrect) return 'incorrect';
      if (!isSelected && optionIsCorrect) return 'missed';
      return 'neutral';
    },
    [showFeedback, selectedAnswers, isCorrect],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-sm text-brand-muted">
          {question.allowMultiple ? '(Select all that apply)' : '(Select one)'}
        </span>
      </div>

      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswers.includes(option.id);
          const status = getOptionStatus(option.id);

          return (
            <button
              type="button"
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={disabled || isSubmitted}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left',
                !isSubmitted && !disabled && 'hover:border-blue-300 hover:bg-blue-50',
                isSelected && !showFeedback && 'border-brand-primary bg-blue-50',
                !isSelected && !showFeedback && 'border-brand-default',
                status === 'correct' && 'border-brand-success bg-green-50',
                status === 'incorrect' && 'border-brand-error bg-red-50',
                status === 'missed' && 'border-amber-500 bg-amber-50',
                (disabled || isSubmitted) && 'cursor-default',
              )}
            >
              {/* Option indicator */}
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                  !showFeedback && 'bg-brand-surface',
                  status === 'correct' && 'bg-brand-success',
                  status === 'incorrect' && 'bg-brand-error',
                  status === 'missed' && 'bg-brand-warning',
                )}
              >
                {showFeedback ? (
                  status === 'correct' ? (
                    <Check className="w-4 h-4 text-brand-primary" />
                  ) : status === 'incorrect' ? (
                    <X className="w-4 h-4 text-brand-primary" />
                  ) : status === 'missed' ? (
                    <Check className="w-4 h-4 text-brand-primary" />
                  ) : (
                    <span className="text-xs text-brand-muted">
                      {String.fromCharCode(65 + index)}
                    </span>
                  )
                ) : isSelected ? (
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full',
                      question.allowMultiple ? 'rounded-sm' : 'rounded-full',
                      'bg-brand-primary',
                    )}
                  />
                ) : (
                  <span className="text-xs text-brand-muted">
                    {String.fromCharCode(65 + index)}
                  </span>
                )}
              </div>

              {/* Option text */}
              <span
                className={cn(
                  'flex-1',
                  status === 'correct' && 'text-green-800 font-medium',
                  status === 'incorrect' && 'text-red-800',
                  status === 'missed' && 'text-amber-800',
                )}
              >
                {option.text}
              </span>

              {/* Feedback indicator */}
              {showFeedback && (
                <div className="shrink-0">
                  {status === 'correct' && (
                    <span className="text-xs text-green-600 font-medium">Correct!</span>
                  )}
                  {status === 'incorrect' && (
                    <span className="text-xs text-red-600 font-medium">Incorrect</span>
                  )}
                  {status === 'missed' && (
                    <span className="text-xs text-amber-600 font-medium">Correct answer</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
