'use client';

import { Check, X } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { FillBlankQuestion as FBQuestion } from './types';

interface FillBlankQuestionProps {
  question: FBQuestion;
  answers: Record<string, string>;
  onAnswerChange: (blankId: string, value: string) => void;
  showFeedback: boolean;
  isSubmitted: boolean;
  disabled?: boolean;
}

export function FillBlankQuestion({
  question,
  answers,
  onAnswerChange,
  showFeedback,
  isSubmitted,
  disabled,
}: FillBlankQuestionProps): React.JSX.Element {
  // Parse text with blanks and render with input fields
  const renderedContent = useMemo(() => {
    const parts: Array<{ type: 'text' | 'blank'; content: string; blankId?: string }> = [];
    let lastIndex = 0;
    const regex = /\{\{([^}]+)\}\}/g;
    let match = regex.exec(question.textWithBlanks);
    while (match !== null) {
      // Add text before the blank
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: question.textWithBlanks.slice(lastIndex, match.index),
        });
      }

      // Add the blank
      parts.push({
        type: 'blank',
        content: match[1],
        blankId: match[1],
      });

      lastIndex = match.index + match[0].length;
      match = regex.exec(question.textWithBlanks);
    }

    // Add remaining text
    if (lastIndex < question.textWithBlanks.length) {
      parts.push({
        type: 'text',
        content: question.textWithBlanks.slice(lastIndex),
      });
    }

    return parts;
  }, [question.textWithBlanks]);

  const checkAnswer = useCallback(
    (blankId: string): 'correct' | 'incorrect' | null => {
      if (!showFeedback) return null;

      const blank = question.blanks.find((b) => b.id === blankId);
      const userAnswer = answers[blankId] || '';

      if (!blank || !userAnswer) return 'incorrect';

      const isCorrect = blank.correctAnswers.some((correctAnswer) => {
        if (blank.caseSensitive) {
          return userAnswer.trim() === correctAnswer.trim();
        }
        return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      });

      return isCorrect ? 'correct' : 'incorrect';
    },
    [showFeedback, question.blanks, answers],
  );

  const getCorrectAnswer = useCallback(
    (blankId: string): string => {
      const blank = question.blanks.find((b) => b.id === blankId);
      return blank?.correctAnswers[0] || '';
    },
    [question.blanks],
  );

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <p className="text-sm text-brand-muted">Fill in the blanks with the correct answers.</p>

      {/* Text with blanks */}
      <div className="text-lg leading-relaxed flex flex-wrap items-baseline gap-y-2">
        {renderedContent.map((part, index) => {
          if (part.type === 'text') {
            return (
              <span key={index} className="whitespace-pre-wrap">
                {part.content}
              </span>
            );
          }

          const blankId = part.blankId ?? '';
          const status = checkAnswer(blankId);
          const userAnswer = answers[blankId] || '';
          const correctAnswer = getCorrectAnswer(blankId);

          return (
            <span key={index} className="inline-flex items-center gap-1 mx-1">
              <div className="relative">
                <Input
                  value={userAnswer}
                  onChange={(e) => onAnswerChange(blankId, e.target.value)}
                  disabled={disabled || isSubmitted}
                  placeholder="..."
                  className={cn(
                    'w-32 h-8 text-center font-medium',
                    !showFeedback && 'border-blue-300 focus:border-brand-primary',
                    status === 'correct' && 'border-brand-success bg-green-50 text-green-800',
                    status === 'incorrect' && 'border-brand-error bg-red-50 text-red-800',
                  )}
                />
                {showFeedback && (
                  <div
                    className={cn(
                      'absolute -right-2 -top-2 w-5 h-5 rounded-full flex items-center justify-center',
                      status === 'correct' && 'bg-brand-success',
                      status === 'incorrect' && 'bg-brand-error',
                    )}
                  >
                    {status === 'correct' ? (
                      <Check className="w-3 h-3 text-brand-primary" />
                    ) : (
                      <X className="w-3 h-3 text-brand-primary" />
                    )}
                  </div>
                )}
              </div>

              {/* Show correct answer if wrong */}
              {showFeedback && status === 'incorrect' && (
                <span className="text-sm text-amber-600 font-medium">({correctAnswer})</span>
              )}
            </span>
          );
        })}
      </div>

      {/* Alternative display: list of blanks */}
      {question.blanks.length > 3 && (
        <div className="mt-6 p-4 bg-brand-page rounded-lg">
          <h4 className="text-sm font-medium text-brand-secondary mb-3">Your Answers:</h4>
          <div className="space-y-3">
            {question.blanks.map((blank, index) => {
              const status = checkAnswer(blank.id);
              const userAnswer = answers[blank.id] || '';
              const correctAnswer = blank.correctAnswers[0];

              return (
                <div key={blank.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {index + 1}
                  </span>
                  <Input
                    value={userAnswer}
                    onChange={(e) => onAnswerChange(blank.id, e.target.value)}
                    disabled={disabled || isSubmitted}
                    placeholder={`Blank ${index + 1}`}
                    className={cn(
                      'flex-1',
                      status === 'correct' && 'border-brand-success bg-green-50',
                      status === 'incorrect' && 'border-brand-error bg-red-50',
                    )}
                  />
                  {showFeedback && (
                    <div className="flex items-center gap-2">
                      {status === 'correct' ? (
                        <Check className="w-5 h-5 text-brand-success" />
                      ) : (
                        <>
                          <X className="w-5 h-5 text-brand-error" />
                          <span className="text-sm text-amber-600">({correctAnswer})</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
