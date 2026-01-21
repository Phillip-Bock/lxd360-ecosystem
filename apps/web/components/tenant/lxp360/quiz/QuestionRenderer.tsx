'use client';

import { CheckCircle2, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/core/utils';

// Question types
export type QuestionType =
  | 'multiple_choice_single'
  | 'multiple_choice_multiple'
  | 'true_false'
  | 'fill_blank'
  | 'matching'
  | 'ordering'
  | 'short_answer'
  | 'essay'
  | 'likert'
  | 'numeric';

interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  points: number;
  hint?: string;
  explanation?: string;
  required?: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice_single' | 'multiple_choice_multiple';
  options: { id: string; text: string; isCorrect?: boolean }[];
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  correctAnswer: boolean;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill_blank';
  blanks: { id: string; correctAnswers: string[] }[];
  text: string; // Text with {{blank_id}} placeholders
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: { id: string; left: string; right: string }[];
}

export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  items: { id: string; text: string; correctPosition: number }[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short_answer';
  maxLength?: number;
  correctAnswers?: string[];
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  minWords?: number;
  maxWords?: number;
}

export interface LikertQuestion extends BaseQuestion {
  type: 'likert';
  scale: { value: number; label: string }[];
  statements: { id: string; text: string }[];
}

export interface NumericQuestion extends BaseQuestion {
  type: 'numeric';
  correctAnswer: number;
  tolerance?: number;
  unit?: string;
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | MatchingQuestion
  | OrderingQuestion
  | ShortAnswerQuestion
  | EssayQuestion
  | LikertQuestion
  | NumericQuestion;

interface QuestionRendererProps {
  question: Question;
  answer: unknown;
  onAnswer: (answer: unknown) => void;
  showFeedback?: boolean;
  isCorrect?: boolean;
  disabled?: boolean;
  questionNumber: number;
}

// Multiple choice single answer
function MultipleChoiceSingle({
  question,
  answer,
  onAnswer,
  showFeedback,
  disabled,
}: {
  question: MultipleChoiceQuestion;
  answer: string | null;
  onAnswer: (answer: string) => void;
  showFeedback?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      {question.options.map((option) => {
        const isSelected = answer === option.id;
        const isCorrect = showFeedback && option.isCorrect;
        const isWrong = showFeedback && isSelected && !option.isCorrect;

        return (
          <button
            type="button"
            key={option.id}
            onClick={() => !disabled && onAnswer(option.id)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
              isSelected && !showFeedback
                ? 'bg-(--brand-primary)/10 border-(--brand-primary)/50'
                : 'bg-(--surface-card) border-(--border-subtle) hover:border-(--brand-primary)/30',
              isCorrect && 'bg-brand-success/10 border-emerald-500/50',
              isWrong && 'bg-brand-error/10 border-brand-error/50',
              disabled && 'cursor-default',
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0',
                isSelected && !showFeedback ? 'border-(--brand-primary)' : 'border-border',
                isCorrect && 'border-emerald-500',
                isWrong && 'border-brand-error',
              )}
            >
              {isSelected && (
                <div
                  className={cn(
                    'w-3 h-3 rounded-full',
                    showFeedback
                      ? isCorrect
                        ? 'bg-brand-success'
                        : 'bg-brand-error'
                      : 'bg-(--brand-primary)',
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                'flex-1',
                isCorrect
                  ? 'text-brand-success'
                  : isWrong
                    ? 'text-brand-error'
                    : 'text-brand-primary',
              )}
            >
              {option.text}
            </span>
            {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-brand-success" />}
          </button>
        );
      })}
    </div>
  );
}

// Multiple choice multiple answers
function MultipleChoiceMultiple({
  question,
  answer,
  onAnswer,
  showFeedback,
  disabled,
}: {
  question: MultipleChoiceQuestion;
  answer: string[];
  onAnswer: (answer: string[]) => void;
  showFeedback?: boolean;
  disabled?: boolean;
}) {
  const toggleOption = (optionId: string) => {
    if (disabled) return;
    const newAnswer = answer.includes(optionId)
      ? answer.filter((id) => id !== optionId)
      : [...answer, optionId];
    onAnswer(newAnswer);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-2">Select all that apply</p>
      {question.options.map((option) => {
        const isSelected = answer.includes(option.id);
        const isCorrect = showFeedback && option.isCorrect;
        const isWrong = showFeedback && isSelected && !option.isCorrect;

        return (
          <button
            type="button"
            key={option.id}
            onClick={() => toggleOption(option.id)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
              isSelected && !showFeedback
                ? 'bg-(--brand-primary)/10 border-(--brand-primary)/50'
                : 'bg-(--surface-card) border-(--border-subtle) hover:border-(--brand-primary)/30',
              isCorrect && 'bg-brand-success/10 border-emerald-500/50',
              isWrong && 'bg-brand-error/10 border-brand-error/50',
              disabled && 'cursor-default',
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded border-2 flex items-center justify-center shrink-0',
                isSelected && !showFeedback
                  ? 'border-(--brand-primary) bg-(--brand-primary)'
                  : 'border-border',
                isCorrect && 'border-emerald-500 bg-brand-success',
                isWrong && 'border-brand-error bg-brand-error',
              )}
            >
              {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-primary" />}
            </div>
            <span
              className={cn(
                'flex-1',
                isCorrect
                  ? 'text-brand-success'
                  : isWrong
                    ? 'text-brand-error'
                    : 'text-brand-primary',
              )}
            >
              {option.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// True/False
function TrueFalse({
  question,
  answer,
  onAnswer,
  showFeedback,
  disabled,
}: {
  question: TrueFalseQuestion;
  answer: boolean | null;
  onAnswer: (answer: boolean) => void;
  showFeedback?: boolean;
  disabled?: boolean;
}) {
  const options = [
    { value: true, label: 'True' },
    { value: false, label: 'False' },
  ];

  return (
    <div className="flex gap-4">
      {options.map((option) => {
        const isSelected = answer === option.value;
        const isCorrect = showFeedback && option.value === question.correctAnswer;
        const isWrong = showFeedback && isSelected && option.value !== question.correctAnswer;

        return (
          <button
            type="button"
            key={option.label}
            onClick={() => !disabled && onAnswer(option.value)}
            disabled={disabled}
            className={cn(
              'flex-1 py-4 rounded-xl border transition-all font-medium',
              isSelected && !showFeedback
                ? 'bg-(--brand-primary)/10 border-(--brand-primary)/50 text-(--brand-primary)'
                : 'bg-(--surface-card) border-(--border-subtle) text-brand-primary hover:border-(--brand-primary)/30',
              isCorrect && 'bg-brand-success/10 border-emerald-500/50 text-brand-success',
              isWrong && 'bg-brand-error/10 border-brand-error/50 text-brand-error',
              disabled && 'cursor-default',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// Short answer
function ShortAnswer({
  question,
  answer,
  onAnswer,
  showFeedback,
  disabled,
}: {
  question: ShortAnswerQuestion;
  answer: string;
  onAnswer: (answer: string) => void;
  showFeedback?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <input
        type="text"
        value={answer}
        onChange={(e) => onAnswer(e.target.value)}
        disabled={disabled}
        maxLength={question.maxLength}
        placeholder="Type your answer..."
        className={cn(
          'w-full p-4 bg-(--surface-card) border rounded-xl text-brand-primary placeholder-muted-foreground focus:outline-hidden transition-colors',
          showFeedback
            ? question.correctAnswers?.some((a) => a.toLowerCase() === answer.toLowerCase())
              ? 'border-emerald-500/50'
              : 'border-brand-error/50'
            : 'border-(--border-subtle) focus:border-(--brand-primary)/50',
        )}
      />
      {question.maxLength && (
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {answer.length}/{question.maxLength} characters
        </p>
      )}
    </div>
  );
}

// Essay
function Essay({
  question,
  answer,
  onAnswer,
  disabled,
}: {
  question: EssayQuestion;
  answer: string;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}) {
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div>
      <textarea
        value={answer}
        onChange={(e) => onAnswer(e.target.value)}
        disabled={disabled}
        placeholder="Write your response..."
        rows={8}
        className="w-full p-4 bg-(--surface-card) border border-(--border-subtle) rounded-xl text-brand-primary placeholder-muted-foreground focus:outline-hidden focus:border-(--brand-primary)/50 resize-none"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <span>
          {wordCount} words
          {question.minWords && ` (minimum: ${question.minWords})`}
          {question.maxWords && ` (maximum: ${question.maxWords})`}
        </span>
        {question.minWords && wordCount < question.minWords && (
          <span className="text-brand-warning">
            {question.minWords - wordCount} more words needed
          </span>
        )}
      </div>
    </div>
  );
}

// Numeric
function Numeric({
  question,
  answer,
  onAnswer,
  showFeedback,
  disabled,
}: {
  question: NumericQuestion;
  answer: string;
  onAnswer: (answer: string) => void;
  showFeedback?: boolean;
  disabled?: boolean;
}) {
  const numericAnswer = parseFloat(answer);
  const isCorrect =
    !Number.isNaN(numericAnswer) &&
    (question.tolerance
      ? Math.abs(numericAnswer - question.correctAnswer) <= question.tolerance
      : numericAnswer === question.correctAnswer);

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={answer}
        onChange={(e) => onAnswer(e.target.value)}
        disabled={disabled}
        placeholder="Enter a number..."
        className={cn(
          'flex-1 p-4 bg-(--surface-card) border rounded-xl text-brand-primary placeholder-muted-foreground focus:outline-hidden transition-colors',
          showFeedback
            ? isCorrect
              ? 'border-emerald-500/50'
              : 'border-brand-error/50'
            : 'border-(--border-subtle) focus:border-(--brand-primary)/50',
        )}
      />
      {question.unit && <span className="text-muted-foreground">{question.unit}</span>}
    </div>
  );
}

// Likert scale
function Likert({
  question,
  answer,
  onAnswer,
  disabled,
}: {
  question: LikertQuestion;
  answer: Record<string, number>;
  onAnswer: (answer: Record<string, number>) => void;
  disabled?: boolean;
}) {
  const handleSelect = (statementId: string, value: number) => {
    if (disabled) return;
    onAnswer({ ...answer, [statementId]: value });
  };

  return (
    <div className="space-y-6">
      {/* Scale header */}
      <div className="flex">
        <div className="flex-1" />
        <div className="flex gap-2">
          {question.scale.map((s) => (
            <div key={s.value} className="w-20 text-center text-xs text-muted-foreground">
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Statements */}
      {question.statements.map((statement) => (
        <div key={statement.id} className="flex items-center gap-4">
          <p className="flex-1 text-brand-primary">{statement.text}</p>
          <div className="flex gap-2">
            {question.scale.map((s) => (
              <button
                type="button"
                key={s.value}
                onClick={() => handleSelect(statement.id, s.value)}
                disabled={disabled}
                className={cn(
                  'w-20 h-10 rounded-lg border transition-colors',
                  answer[statement.id] === s.value
                    ? 'bg-(--brand-primary)/20 border-(--brand-primary)/50'
                    : 'bg-(--surface-card) border-(--border-subtle) hover:border-(--brand-primary)/30',
                )}
              >
                {answer[statement.id] === s.value && (
                  <div className="w-3 h-3 bg-(--brand-primary) rounded-full mx-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Main question renderer component
export function QuestionRenderer({
  question,
  answer,
  onAnswer,
  showFeedback,
  isCorrect,
  disabled,
  questionNumber,
}: QuestionRendererProps) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="space-y-4">
      {/* Question header */}
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-8 h-8 rounded-lg bg-(--brand-primary)/20 flex items-center justify-center text-(--brand-primary) font-bold">
          {questionNumber}
        </span>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <p className="text-brand-primary font-medium">{question.question}</p>
            <span className="text-xs text-muted-foreground shrink-0 ml-2">
              {question.points} {question.points === 1 ? 'point' : 'points'}
            </span>
          </div>
          {question.required && <span className="text-xs text-brand-error">* Required</span>}
        </div>
      </div>

      {/* Hint button */}
      {question.hint && !showFeedback && (
        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-2 text-sm text-(--brand-primary) hover:underline"
        >
          <HelpCircle className="w-4 h-4" />
          {showHint ? 'Hide hint' : 'Show hint'}
        </button>
      )}
      {showHint && question.hint && (
        <div className="p-3 bg-(--brand-primary)/10 border border-(--brand-primary)/30 rounded-lg text-sm text-(--brand-primary)">
          {question.hint}
        </div>
      )}

      {/* Question content based on type */}
      <div className="mt-4">
        {question.type === 'multiple_choice_single' && (
          <MultipleChoiceSingle
            question={question as MultipleChoiceQuestion}
            answer={(answer as string | null) ?? null}
            onAnswer={onAnswer}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        )}
        {question.type === 'multiple_choice_multiple' && (
          <MultipleChoiceMultiple
            question={question as MultipleChoiceQuestion}
            answer={Array.isArray(answer) ? answer : []}
            onAnswer={onAnswer}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        )}
        {question.type === 'true_false' && (
          <TrueFalse
            question={question as TrueFalseQuestion}
            answer={(answer as boolean | null) ?? null}
            onAnswer={onAnswer}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        )}
        {question.type === 'short_answer' && (
          <ShortAnswer
            question={question as ShortAnswerQuestion}
            answer={typeof answer === 'string' ? answer : ''}
            onAnswer={onAnswer}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        )}
        {question.type === 'essay' && (
          <Essay
            question={question as EssayQuestion}
            answer={typeof answer === 'string' ? answer : ''}
            onAnswer={onAnswer}
            disabled={disabled}
          />
        )}
        {question.type === 'numeric' && (
          <Numeric
            question={question as NumericQuestion}
            answer={typeof answer === 'string' ? answer : ''}
            onAnswer={onAnswer}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        )}
        {question.type === 'likert' && (
          <Likert
            question={question as LikertQuestion}
            answer={
              typeof answer === 'object' && answer !== null && !Array.isArray(answer)
                ? (answer as Record<string, number>)
                : {}
            }
            onAnswer={onAnswer}
            disabled={disabled}
          />
        )}
      </div>

      {/* Feedback / Explanation */}
      {showFeedback && question.explanation && (
        <div
          className={cn(
            'p-4 rounded-lg border mt-4',
            isCorrect
              ? 'bg-brand-success/10 border-emerald-500/30'
              : 'bg-brand-warning/10 border-amber-500/30',
          )}
        >
          <p
            className={cn(
              'text-sm font-medium mb-1',
              isCorrect ? 'text-brand-success' : 'text-brand-warning',
            )}
          >
            {isCorrect ? 'Correct!' : 'Explanation:'}
          </p>
          <p className="text-sm text-brand-secondary">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
