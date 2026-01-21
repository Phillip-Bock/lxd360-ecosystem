'use client';

/**
 * MCQuestionBlock - Multiple Choice Question using shadcn RadioGroup/Checkbox
 * Supports single/multiple answer, feedback, and xAPI tracking
 */

import { CheckCircle, Plus, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { MCChoice, MCQuestionConfig, MCQuestionContent } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface MCQuestionBlockProps {
  id: string;
  content: MCQuestionContent;
  config: MCQuestionConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: MCQuestionContent) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
  onXAPIEvent?: (verb: string, data?: Record<string, unknown>) => void;
}

type AnswerState = 'unanswered' | 'correct' | 'incorrect' | 'partial';

export function MCQuestionBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
  onXAPIEvent,
}: MCQuestionBlockProps) {
  const [selectedChoices, setSelectedChoices] = useState<Set<string>>(new Set());
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState<MCChoice[]>(content.choices);
  const [startTime] = useState(() => Date.now());

  // Shuffle choices on mount if configured
  useEffect(() => {
    // Use setTimeout to avoid sync setState in effect (React 19 pattern)
    const timeout = setTimeout(() => {
      if (config.shuffleChoices) {
        setShuffledChoices([...content.choices].sort(() => Math.random() - 0.5));
      } else {
        setShuffledChoices(content.choices);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [content.choices, config.shuffleChoices]);

  const handleChoiceSelect = (choiceId: string) => {
    if (answerState !== 'unanswered' && !isEditing) return;

    setSelectedChoices((prev) => {
      const next = new Set(prev);
      if (content.multipleAnswer) {
        if (next.has(choiceId)) {
          next.delete(choiceId);
        } else {
          next.add(choiceId);
        }
      } else {
        next.clear();
        next.add(choiceId);
      }
      return next;
    });
  };

  const handleRadioChange = (value: string) => {
    if (answerState !== 'unanswered' && !isEditing) return;
    setSelectedChoices(new Set([value]));
  };

  const checkAnswer = () => {
    if (selectedChoices.size === 0) return;

    const correctChoices = content.choices.filter((c) => c.correct).map((c) => c.id);
    const selected = Array.from(selectedChoices);

    const allCorrectSelected = correctChoices.every((id) => selectedChoices.has(id));
    const noIncorrectSelected = selected.every((id) => correctChoices.includes(id));

    // Calculate duration for xAPI tracking
    const duration = (Date.now() - startTime) / 1000;
    const maxScore = config.points || 10;

    // Build proper xAPI event data with interactionType
    const baseXAPIData = {
      interactionType: 'choice' as const,
      response: selected.join('[,]'), // xAPI choice format uses [,] separator
      correctResponse: correctChoices.join('[,]'),
      duration,
      attempt: attempts + 1,
      choices: content.choices.map((c) => ({
        id: c.id,
        description: c.text,
      })),
    };

    let newState: AnswerState;
    if (allCorrectSelected && noIncorrectSelected) {
      newState = 'correct';
      onXAPIEvent?.('passed', {
        ...baseXAPIData,
        correct: true,
        score: 1,
        maxScore,
      });
    } else if (config.partialCredit && selected.some((id) => correctChoices.includes(id))) {
      newState = 'partial';
      const correctCount = selected.filter((id) => correctChoices.includes(id)).length;
      const partialScore = correctCount / correctChoices.length;
      onXAPIEvent?.('answered', {
        ...baseXAPIData,
        correct: false,
        score: partialScore * maxScore,
        maxScore,
      });
    } else {
      newState = 'incorrect';
      onXAPIEvent?.('failed', {
        ...baseXAPIData,
        correct: false,
        score: 0,
        maxScore,
      });
    }

    setAnswerState(newState);
    setAttempts((prev) => prev + 1);

    if (config.immediateFeedback) {
      setShowFeedback(true);
    }
  };

  const resetQuestion = () => {
    if (config.maxAttempts && attempts >= config.maxAttempts) return;
    setSelectedChoices(new Set());
    setAnswerState('unanswered');
    setShowFeedback(false);
  };

  const updateChoice = (index: number, updates: Partial<MCChoice>) => {
    const newChoices = [...content.choices];
    newChoices[index] = { ...newChoices[index], ...updates };
    onContentChange?.({ ...content, choices: newChoices });
  };

  const addChoice = () => {
    const newId = `choice-${Date.now()}`;
    onContentChange?.({
      ...content,
      choices: [...content.choices, { id: newId, text: 'New option', correct: false }],
    });
  };

  const removeChoice = (index: number) => {
    if (content.choices.length <= 2) return;
    const newChoices = content.choices.filter((_, i) => i !== index);
    onContentChange?.({ ...content, choices: newChoices });
  };

  const getFeedbackMessage = () => {
    if (!content.feedback) return '';
    switch (answerState) {
      case 'correct':
        return content.feedback.correct;
      case 'incorrect':
        return content.feedback.incorrect;
      case 'partial':
        return content.feedback.partial || content.feedback.incorrect;
      default:
        return '';
    }
  };

  const canRetry = config.maxAttempts === 0 || attempts < (config.maxAttempts || 3);
  const showCorrectAnswers = config.showCorrectAnswer && !canRetry && answerState !== 'correct';

  return (
    <BlockWrapper
      id={id}
      type="Multiple Choice"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      <div className="space-y-4">
        {/* Question stem */}
        <div className="font-medium text-foreground">
          {isEditing ? (
            <textarea
              value={content.question}
              onChange={(e) => onContentChange?.({ ...content, question: e.target.value })}
              placeholder="Enter your question..."
              rows={2}
              className={cn(
                'w-full bg-background px-3 py-2 rounded border border-border',
                'outline-hidden focus:border-cyan-500 resize-y',
              )}
            />
          ) : (
            <p>{content.question}</p>
          )}
        </div>

        {/* Multiple answer indicator */}
        {content.multipleAnswer && !isEditing && (
          <p className="text-sm text-muted-foreground italic">Select all that apply</p>
        )}

        {/* Choices - Using shadcn RadioGroup for single answer */}
        {!content.multipleAnswer && !isEditing ? (
          <RadioGroup
            value={Array.from(selectedChoices)[0] || ''}
            onValueChange={handleRadioChange}
            disabled={answerState !== 'unanswered'}
            className="space-y-2"
          >
            {shuffledChoices.map((choice) => {
              const isChoiceSelected = selectedChoices.has(choice.id);
              const isCorrect = choice.correct;
              const showAsCorrect = showCorrectAnswers && isCorrect;
              const showAsIncorrect =
                answerState !== 'unanswered' && isChoiceSelected && !isCorrect;
              const showAsSelectedCorrect =
                answerState !== 'unanswered' && isChoiceSelected && isCorrect;

              return (
                <div
                  key={choice.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer',
                    answerState === 'unanswered' && 'hover:border-cyan-500/50',
                    isChoiceSelected &&
                      answerState === 'unanswered' &&
                      'border-cyan-500 bg-cyan-500/10',
                    !isChoiceSelected && answerState === 'unanswered' && 'border-border',
                    showAsSelectedCorrect && 'border-green-500 bg-green-500/10',
                    showAsIncorrect && 'border-red-500 bg-red-500/10',
                    showAsCorrect && !isChoiceSelected && 'border-green-500/50 bg-green-500/5',
                  )}
                >
                  <RadioGroupItem
                    value={choice.id}
                    id={`${id}-choice-${choice.id}`}
                    className={cn(
                      'shrink-0',
                      showAsSelectedCorrect && 'border-green-500 text-green-500',
                      showAsIncorrect && 'border-red-500 text-red-500',
                    )}
                  />
                  <Label
                    htmlFor={`${id}-choice-${choice.id}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {choice.text}
                  </Label>
                  {answerState !== 'unanswered' &&
                    (showAsSelectedCorrect || showAsIncorrect || showAsCorrect) && (
                      <div className="shrink-0">
                        {showAsSelectedCorrect || showAsCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </RadioGroup>
        ) : (
          /* Checkboxes for multiple answer or editing mode */
          <div className="space-y-2">
            {(isEditing ? content.choices : shuffledChoices).map((choice, index) => {
              const isChoiceSelected = selectedChoices.has(choice.id);
              const isCorrect = choice.correct;
              const showAsCorrect = showCorrectAnswers && isCorrect;
              const showAsIncorrect =
                answerState !== 'unanswered' && isChoiceSelected && !isCorrect;
              const showAsSelectedCorrect =
                answerState !== 'unanswered' && isChoiceSelected && isCorrect;

              return (
                <div
                  key={choice.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                    isEditing ? 'cursor-default' : 'cursor-pointer',
                    !isEditing && answerState === 'unanswered' && 'hover:border-cyan-500/50',
                    isChoiceSelected &&
                      answerState === 'unanswered' &&
                      'border-cyan-500 bg-cyan-500/10',
                    !isChoiceSelected && answerState === 'unanswered' && 'border-border',
                    showAsSelectedCorrect && 'border-green-500 bg-green-500/10',
                    showAsIncorrect && 'border-red-500 bg-red-500/10',
                    showAsCorrect && !isChoiceSelected && 'border-green-500/50 bg-green-500/5',
                  )}
                >
                  {isEditing ? (
                    /* Editor view with choice text input and correct toggle */
                    <>
                      <Checkbox
                        id={`${id}-edit-${choice.id}`}
                        checked={choice.correct}
                        onCheckedChange={(checked) => updateChoice(index, { correct: !!checked })}
                        className="shrink-0"
                      />
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => updateChoice(index, { text: e.target.value })}
                        className="flex-1 bg-transparent outline-hidden"
                      />
                      <Label
                        htmlFor={`${id}-edit-${choice.id}`}
                        className="text-xs text-muted-foreground shrink-0"
                      >
                        Correct
                      </Label>
                      {content.choices.length > 2 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeChoice(index);
                          }}
                          className="p-1 text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    /* Learner view with checkboxes */
                    <>
                      <Checkbox
                        id={`${id}-choice-${choice.id}`}
                        checked={isChoiceSelected}
                        onCheckedChange={() => handleChoiceSelect(choice.id)}
                        disabled={answerState !== 'unanswered'}
                        className={cn(
                          'shrink-0',
                          showAsSelectedCorrect &&
                            'border-green-500 data-[state=checked]:bg-green-500',
                          showAsIncorrect && 'border-red-500 data-[state=checked]:bg-red-500',
                        )}
                      />
                      <Label
                        htmlFor={`${id}-choice-${choice.id}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {choice.text}
                      </Label>
                      {answerState !== 'unanswered' &&
                        (showAsSelectedCorrect || showAsIncorrect || showAsCorrect) && (
                          <div className="shrink-0">
                            {showAsSelectedCorrect || showAsCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add choice button (editing) */}
        {isEditing && (
          <button
            type="button"
            onClick={addChoice}
            className="w-full py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-cyan-500 hover:text-cyan-500 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Choice
          </button>
        )}

        {/* Submit button */}
        {!isEditing && answerState === 'unanswered' && (
          <button
            type="button"
            onClick={checkAnswer}
            disabled={selectedChoices.size === 0}
            className={cn(
              'px-6 py-2 rounded-lg font-medium transition-colors',
              selectedChoices.size > 0
                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                : 'bg-border text-muted-foreground cursor-not-allowed',
            )}
          >
            Check Answer
          </button>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div
            className={cn(
              'p-4 rounded-lg border',
              answerState === 'correct' && 'bg-green-500/10 border-green-500',
              answerState === 'incorrect' && 'bg-red-500/10 border-red-500',
              answerState === 'partial' && 'bg-yellow-500/10 border-yellow-500',
            )}
          >
            <p className="font-medium mb-1 flex items-center gap-1">
              {answerState === 'correct' && (
                <>
                  <CheckCircle className="h-4 w-4 inline" /> Correct!
                </>
              )}
              {answerState === 'incorrect' && (
                <>
                  <XCircle className="h-4 w-4 inline" /> Incorrect
                </>
              )}
              {answerState === 'partial' && 'Partially Correct'}
            </p>
            <p className="text-sm text-muted-foreground">{getFeedbackMessage()}</p>

            {canRetry && answerState !== 'correct' && (
              <button
                type="button"
                onClick={resetQuestion}
                className="mt-3 text-sm text-cyan-500 hover:text-cyan-400"
              >
                Try Again (
                {config.maxAttempts
                  ? `${config.maxAttempts - attempts} attempts left`
                  : 'unlimited'}
                )
              </button>
            )}
          </div>
        )}

        {/* Attempts indicator */}
        {!isEditing && config.maxAttempts !== 0 && (
          <p className="text-xs text-muted-foreground">
            Attempts: {attempts}/{config.maxAttempts || '∞'}
          </p>
        )}
      </div>
    </BlockWrapper>
  );
}
