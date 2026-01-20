'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { BlockContent, QuestionOption } from '@/types/blocks';
import type { BlockComponentProps } from '../BlockRenderer';

// Extended interface for KnowledgeCheck with actual implementation properties
interface KnowledgeCheckBlockContent extends BlockContent {
  question?: string;
  type?: 'multiple-choice' | 'true-false' | 'multiple-select';
  options?: QuestionOption[];
  correctAnswer?: string;
  correctAnswers?: string[];
  feedback?: {
    correct?: string;
    incorrect?: string;
  };
  hint?: string;
  style?: 'card' | 'inline' | 'minimal';
  allowRetry?: boolean;
}

const CHECK_TYPES = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'true-false', label: 'True/False' },
  { value: 'multiple-select', label: 'Select All' },
];

const CHECK_STYLES = [
  { value: 'card', label: 'Card' },
  { value: 'inline', label: 'Inline' },
  { value: 'minimal', label: 'Minimal' },
];

/**
 * KnowledgeCheckBlock - Quick inline comprehension check
 */
export function KnowledgeCheckBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<KnowledgeCheckBlockContent>): React.JSX.Element {
  const content = block.content as KnowledgeCheckBlockContent;
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Default values - wrapped in useMemo to maintain stable references
  const question = content.question || 'Check your understanding:';
  const type = content.type || 'multiple-choice';
  const options = useMemo(() => content.options || [], [content.options]);
  const correctAnswer = content.correctAnswer;
  const correctAnswers = useMemo(() => content.correctAnswers || [], [content.correctAnswers]);
  const feedback = content.feedback || {};
  const hint = content.hint;
  const style = content.style || 'card';
  const allowRetry = content.allowRetry !== false;

  // Check if answer is correct
  const isCorrect = useCallback(() => {
    if (!submitted) return null;

    if (type === 'multiple-select') {
      if (!Array.isArray(selectedAnswer)) return false;
      return (
        selectedAnswer.length === correctAnswers.length &&
        selectedAnswer.every((a) => correctAnswers.includes(a))
      );
    }

    return selectedAnswer === correctAnswer;
  }, [submitted, type, selectedAnswer, correctAnswer, correctAnswers]);

  // Handle answer selection
  const handleSelect = useCallback(
    (optionId: string) => {
      if (submitted && !allowRetry) return;

      if (submitted) {
        // Reset for retry
        setSubmitted(false);
      }

      if (type === 'multiple-select') {
        const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
        if (current.includes(optionId)) {
          setSelectedAnswer(current.filter((id) => id !== optionId));
        } else {
          setSelectedAnswer([...current, optionId]);
        }
      } else {
        setSelectedAnswer(optionId);
      }
    },
    [submitted, allowRetry, type, selectedAnswer],
  );

  // Submit answer
  const handleSubmit = useCallback(() => {
    if (!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)) return;
    setSubmitted(true);
  }, [selectedAnswer]);

  // Retry
  const handleRetry = useCallback(() => {
    setSelectedAnswer(type === 'multiple-select' ? [] : null);
    setSubmitted(false);
    setShowHint(false);
  }, [type]);

  // Add option
  const addOption = useCallback(() => {
    const newOption: QuestionOption = {
      id: `opt-${Date.now()}`,
      text: `Option ${options.length + 1}`,
      isCorrect: false,
    };
    onUpdate({
      content: {
        ...content,
        options: [...options, newOption],
      },
    });
  }, [content, options, onUpdate]);

  // Update option
  const updateOption = useCallback(
    (optionId: string, updates: Partial<QuestionOption>) => {
      const newOptions = options.map((o: QuestionOption) =>
        o.id === optionId ? { ...o, ...updates } : o,
      );

      // Handle correct answer update
      if (updates.isCorrect !== undefined) {
        if (type === 'multiple-choice' || type === 'true-false') {
          // Only one correct answer
          newOptions.forEach((o: QuestionOption) => {
            if (o.id !== optionId) o.isCorrect = false;
          });
          onUpdate({
            content: {
              ...content,
              options: newOptions,
              correctAnswer: updates.isCorrect ? optionId : undefined,
            },
          });
          return;
        } else {
          // Multiple correct answers
          const correctIds = newOptions
            .filter((o: QuestionOption) => o.isCorrect)
            .map((o: QuestionOption) => o.id);
          onUpdate({
            content: {
              ...content,
              options: newOptions,
              correctAnswers: correctIds,
            },
          });
          return;
        }
      }

      onUpdate({ content: { ...content, options: newOptions } });
    },
    [content, options, type, onUpdate],
  );

  // Delete option
  const deleteOption = useCallback(
    (optionId: string) => {
      onUpdate({
        content: {
          ...content,
          options: options.filter((o: QuestionOption) => o.id !== optionId),
        },
      });
    },
    [content, options, onUpdate],
  );

  // Get container classes based on style
  const getContainerClasses = (): string => {
    switch (style) {
      case 'inline':
        return 'p-4 border-l-4 border-studio-accent bg-studio-accent/5';
      case 'minimal':
        return 'p-4';
      default:
        return 'p-6 bg-studio-bg rounded-xl border border-studio-surface/30';
    }
  };

  // Preview mode
  if (!isEditing) {
    const correct = isCorrect();

    return (
      <div className={getContainerClasses()}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-studio-accent/20 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4 text-studio-accent" />
          </div>
          <div className="flex-1">
            <p className="text-brand-primary font-medium">{question}</p>
            {type === 'multiple-select' && (
              <p className="text-sm text-studio-text-muted mt-1">Select all that apply</p>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2 ml-11">
          {options.map((option: QuestionOption) => {
            const isSelected =
              type === 'multiple-select'
                ? ((selectedAnswer as string[]) || []).includes(option.id)
                : selectedAnswer === option.id;
            const isThisCorrect = submitted && option.isCorrect;
            const isThisWrong = submitted && isSelected && !option.isCorrect;

            return (
              <button
                type="button"
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={submitted && !allowRetry}
                className={`
                  w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3
                  ${
                    isSelected
                      ? submitted
                        ? isThisCorrect
                          ? 'bg-brand-success/10 border-brand-success/50'
                          : 'bg-brand-error/10 border-brand-error/50'
                        : 'bg-studio-accent/10 border-studio-accent/50'
                      : isThisCorrect
                        ? 'bg-brand-success/5 border-brand-success/30'
                        : 'bg-studio-bg-dark border-studio-surface/50 hover:border-studio-surface'
                  }
                  ${submitted && !allowRetry ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                {/* Selection indicator */}
                <div
                  className={`
                  w-5 h-5 flex items-center justify-center shrink-0 border-2 transition-colors
                  ${type === 'multiple-select' ? 'rounded' : 'rounded-full'}
                  ${
                    isSelected
                      ? 'border-studio-accent bg-studio-accent'
                      : 'border-studio-text-muted'
                  }
                `}
                >
                  {isSelected &&
                    (type === 'multiple-select' ? (
                      <Check className="w-3 h-3 text-brand-primary" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-brand-surface" />
                    ))}
                </div>

                {/* Option text */}
                <span
                  className={`flex-1 ${isSelected ? 'text-brand-primary' : 'text-studio-text'}`}
                >
                  {option.text}
                </span>

                {/* Result indicator */}
                {submitted &&
                  (isThisCorrect ? (
                    <CheckCircle className="w-5 h-5 text-brand-success" />
                  ) : isThisWrong ? (
                    <XCircle className="w-5 h-5 text-brand-error" />
                  ) : null)}
              </button>
            );
          })}
        </div>

        {/* Hint */}
        {hint && !submitted && (
          <div className="mt-4 ml-11">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-sm text-studio-text-muted hover:text-studio-accent transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 text-sm text-studio-text-muted italic"
                >
                  {hint}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Actions & Feedback */}
        <div className="mt-4 ml-11">
          {!submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)
              }
              className="px-4 py-2 bg-studio-accent hover:bg-studio-accent-hover disabled:bg-studio-text-muted text-brand-primary rounded-lg transition-colors"
            >
              Check Answer
            </button>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={correct ? 'correct' : 'incorrect'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  p-4 rounded-lg
                  ${correct ? 'bg-brand-success/10 border border-brand-success/30' : 'bg-brand-error/10 border border-brand-error/30'}
                `}
              >
                <div className="flex items-start gap-3">
                  {correct ? (
                    <CheckCircle className="w-5 h-5 text-brand-success shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-brand-error shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${correct ? 'text-brand-success' : 'text-brand-error'}`}
                    >
                      {correct ? 'Correct!' : 'Not quite right'}
                    </p>
                    {feedback[correct ? 'correct' : 'incorrect'] && (
                      <p className="text-sm text-studio-text mt-1">
                        {feedback[correct ? 'correct' : 'incorrect']}
                      </p>
                    )}
                  </div>
                  {allowRetry && !correct && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-studio-accent hover:text-studio-accent-hover transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      {/* Settings */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-studio-text-muted">Type:</span>
          <select
            value={type}
            onChange={(e) => {
              const newType = e.target.value as unknown;
              let newOptions = options;

              // Initialize true/false options
              if (newType === 'true-false' && options.length === 0) {
                newOptions = [
                  { id: 'true', text: 'True', isCorrect: false },
                  { id: 'false', text: 'False', isCorrect: false },
                ];
              }

              onUpdate({
                content: {
                  ...content,
                  type: newType,
                  options: newOptions,
                  correctAnswer: newType === 'multiple-select' ? undefined : correctAnswer,
                  correctAnswers: newType === 'multiple-select' ? correctAnswers : undefined,
                },
              });
            }}
            className="px-2 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          >
            {CHECK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-studio-text-muted">Style:</span>
          <select
            value={style}
            onChange={(e) =>
              onUpdate({ content: { ...content, style: e.target.value as unknown } })
            }
            className="px-2 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          >
            {CHECK_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allowRetry}
            onChange={(e) => onUpdate({ content: { ...content, allowRetry: e.target.checked } })}
            className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
          />
          <span className="text-sm text-studio-text-muted">Allow Retry</span>
        </label>
      </div>

      {/* Question */}
      <div className={getContainerClasses()}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-studio-accent/20 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4 text-studio-accent" />
          </div>
          <textarea
            value={question}
            onChange={(e) => onUpdate({ content: { ...content, question: e.target.value } })}
            className="flex-1 bg-transparent text-brand-primary font-medium resize-none outline-hidden"
            placeholder="Enter your question..."
            rows={2}
          />
        </div>

        {/* Options editor */}
        <div className="space-y-2 ml-11">
          {options.map((option: QuestionOption, index: number) => (
            <div key={option.id} className="flex items-center gap-2">
              <input
                type={type === 'multiple-select' ? 'checkbox' : 'radio'}
                checked={option.isCorrect}
                onChange={(e) => updateOption(option.id, { isCorrect: e.target.checked })}
                className="w-4 h-4"
              />
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOption(option.id, { text: e.target.value })}
                className="flex-1 px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 && type !== 'true-false' && (
                <button
                  type="button"
                  onClick={() => deleteOption(option.id)}
                  className="p-1 text-studio-text-muted hover:text-brand-error transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {type !== 'true-false' && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1 text-sm text-studio-accent hover:text-studio-accent-hover mt-2"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      <div className="p-4 bg-studio-bg rounded-lg border border-studio-surface/30 space-y-3">
        <h4 className="text-sm font-medium text-studio-text-muted">Feedback</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor={`${block.id}-correct-feedback`}
              className="block text-xs text-brand-success mb-1"
            >
              Correct feedback
            </label>
            <input
              id={`${block.id}-correct-feedback`}
              type="text"
              value={feedback.correct || ''}
              onChange={(e) =>
                onUpdate({
                  content: {
                    ...content,
                    feedback: { ...feedback, correct: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
              placeholder="Great job!"
            />
          </div>
          <div>
            <label
              htmlFor={`${block.id}-incorrect-feedback`}
              className="block text-xs text-brand-error mb-1"
            >
              Incorrect feedback
            </label>
            <input
              id={`${block.id}-incorrect-feedback`}
              type="text"
              value={feedback.incorrect || ''}
              onChange={(e) =>
                onUpdate({
                  content: {
                    ...content,
                    feedback: { ...feedback, incorrect: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
              placeholder="Try again..."
            />
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className="p-4 bg-studio-bg rounded-lg border border-studio-surface/30">
        <label
          htmlFor={`${block.id}-hint`}
          className="flex items-center gap-2 text-sm text-studio-text-muted mb-2"
        >
          <Lightbulb className="w-4 h-4" />
          Hint (optional)
        </label>
        <input
          id={`${block.id}-hint`}
          type="text"
          value={hint || ''}
          onChange={(e) => onUpdate({ content: { ...content, hint: e.target.value } })}
          className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          placeholder="Provide a hint for learners..."
        />
      </div>
    </div>
  );
}

export default KnowledgeCheckBlock;
