'use client';

/**
 * FITBQuestionBlock - Fill in the Blank Question using shadcn Input
 * Template text with {{blank_id}} markers replaced by inputs
 */

import { CheckCircle, Plus, Trash2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { FITBBlank, FITBQuestionConfig, FITBQuestionContent } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface FITBQuestionBlockProps {
  id: string;
  content: FITBQuestionContent;
  config: FITBQuestionConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: FITBQuestionContent) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
  onXAPIEvent?: (verb: string, data?: Record<string, unknown>) => void;
}

type AnswerState = 'unanswered' | 'correct' | 'incorrect' | 'partial';

interface BlankResult {
  id: string;
  correct: boolean;
  userAnswer: string;
  correctAnswers: string[];
}

export function FITBQuestionBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
  onXAPIEvent,
}: FITBQuestionBlockProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [blankResults, setBlankResults] = useState<BlankResult[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime] = useState(() => Date.now());

  // Parse template into segments with blanks
  const parsedTemplate = useMemo(() => {
    const regex = /\{\{([^}]+)\}\}/g;
    const segments: Array<{ type: 'text' | 'blank'; value: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null = null;

    match = regex.exec(content.template);
    while (match) {
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          value: content.template.slice(lastIndex, match.index),
        });
      }
      segments.push({ type: 'blank', value: match[1] });
      lastIndex = match.index + match[0].length;
      match = regex.exec(content.template);
    }

    if (lastIndex < content.template.length) {
      segments.push({
        type: 'text',
        value: content.template.slice(lastIndex),
      });
    }

    return segments;
  }, [content.template]);

  const getBlankById = (blankId: string): FITBBlank | undefined => {
    return content.blanks.find((b) => b.id === blankId);
  };

  const handleAnswerChange = (blankId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const checkAnswers = () => {
    const results: BlankResult[] = content.blanks.map((blank) => {
      const userAnswer = config.trimWhitespace
        ? (answers[blank.id] || '').trim()
        : answers[blank.id] || '';

      const isCorrect = blank.acceptedAnswers.some((accepted) => {
        if (config.caseSensitive) {
          return userAnswer === accepted;
        }
        return userAnswer.toLowerCase() === accepted.toLowerCase();
      });

      return {
        id: blank.id,
        correct: isCorrect,
        userAnswer,
        correctAnswers: blank.acceptedAnswers,
      };
    });

    setBlankResults(results);

    const correctCount = results.filter((r) => r.correct).length;
    const totalBlanks = results.length;

    // Calculate duration for xAPI tracking
    const duration = (Date.now() - startTime) / 1000;
    const maxScore = config.points || 10;

    // Build response in xAPI fill-in format (blank responses separated by [,])
    const responseStrings = content.blanks.map((blank) => answers[blank.id] || '');
    const correctResponseStrings = content.blanks.map((blank) => blank.acceptedAnswers[0]);

    // Build proper xAPI event data with interactionType
    const baseXAPIData = {
      interactionType: 'fill-in' as const,
      response: responseStrings.join('[,]'),
      correctResponse: correctResponseStrings.join('[,]'),
      duration,
      attempt: attempts + 1,
      blanks: content.blanks.map((blank) => ({
        id: blank.id,
        acceptedAnswers: blank.acceptedAnswers,
      })),
      results: results.map((r) => ({
        blankId: r.id,
        correct: r.correct,
        userAnswer: r.userAnswer,
      })),
    };

    let newState: AnswerState;

    if (correctCount === totalBlanks) {
      newState = 'correct';
      onXAPIEvent?.('passed', {
        ...baseXAPIData,
        correct: true,
        score: 1,
        maxScore,
      });
    } else if (correctCount > 0) {
      newState = 'partial';
      const partialScore = correctCount / totalBlanks;
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
    setShowFeedback(true);
  };

  const resetQuestion = () => {
    if (config.maxAttempts && attempts >= config.maxAttempts) return;
    setAnswers({});
    setAnswerState('unanswered');
    setBlankResults([]);
    setShowFeedback(false);
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
  const hasAnswers = Object.values(answers).some((a) => a.trim() !== '');

  // Editing mode handlers
  const updateTemplate = (newTemplate: string) => {
    onContentChange?.({ ...content, template: newTemplate });
  };

  const updateBlank = (index: number, updates: Partial<FITBBlank>) => {
    const newBlanks = [...content.blanks];
    newBlanks[index] = { ...newBlanks[index], ...updates };
    onContentChange?.({ ...content, blanks: newBlanks });
  };

  const addBlank = () => {
    const newId = `blank-${Date.now()}`;
    onContentChange?.({
      ...content,
      blanks: [
        ...content.blanks,
        { id: newId, acceptedAnswers: ['answer'], placeholder: 'Enter answer' },
      ],
      template: `${content.template} {{${newId}}}`,
    });
  };

  const removeBlank = (index: number) => {
    const blankToRemove = content.blanks[index];
    const newBlanks = content.blanks.filter((_, i) => i !== index);
    const newTemplate = content.template.replace(
      new RegExp(`\\{\\{${blankToRemove.id}\\}\\}`, 'g'),
      '',
    );
    onContentChange?.({ ...content, blanks: newBlanks, template: newTemplate });
  };

  return (
    <BlockWrapper
      id={id}
      type="Fill in the Blank"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      <div className="space-y-4">
        {/* Template with blanks - Edit mode */}
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label
                htmlFor={`${id}-template`}
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                Template (use {'{{blank_id}}'} for blanks)
              </label>
              <textarea
                id={`${id}-template`}
                value={content.template}
                onChange={(e) => updateTemplate(e.target.value)}
                placeholder="The capital of {{country}} is {{capital}}."
                rows={3}
                className={cn(
                  'w-full bg-background px-3 py-2 rounded border border-border',
                  'outline-hidden focus:border-cyan-500 resize-y font-mono text-sm',
                )}
              />
            </div>

            <div className="space-y-2">
              <span className="block text-sm font-medium text-muted-foreground">Blanks</span>
              {content.blanks.map((blank, index) => (
                <div
                  key={blank.id}
                  className="flex items-start gap-2 p-3 rounded border border-border bg-card"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        {`{{${blank.id}}}`}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor={`${id}-blank-${blank.id}-answers`}
                        className="text-xs text-muted-foreground"
                      >
                        Accepted Answers
                      </Label>
                      <Input
                        id={`${id}-blank-${blank.id}-answers`}
                        type="text"
                        value={blank.acceptedAnswers.join(', ')}
                        onChange={(e) =>
                          updateBlank(index, {
                            acceptedAnswers: e.target.value.split(',').map((s) => s.trim()),
                          })
                        }
                        placeholder="Accepted answers (comma-separated)"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`${id}-blank-${blank.id}-placeholder`}
                        className="text-xs text-muted-foreground"
                      >
                        Placeholder
                      </Label>
                      <Input
                        id={`${id}-blank-${blank.id}-placeholder`}
                        type="text"
                        value={blank.placeholder || ''}
                        onChange={(e) => updateBlank(index, { placeholder: e.target.value })}
                        placeholder="Placeholder text"
                        className="h-8 text-sm"
                      />
                    </div>
                    {config.showHints && (
                      <div className="space-y-1">
                        <Label
                          htmlFor={`${id}-blank-${blank.id}-hint`}
                          className="text-xs text-muted-foreground"
                        >
                          Hint
                        </Label>
                        <Input
                          id={`${id}-blank-${blank.id}-hint`}
                          type="text"
                          value={blank.hint || ''}
                          onChange={(e) => updateBlank(index, { hint: e.target.value })}
                          placeholder="Hint (optional)"
                          className="h-8 text-sm"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBlank(index)}
                    className="p-1 text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addBlank}
                className="w-full py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-cyan-500 hover:text-cyan-500 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Blank
              </button>
            </div>
          </div>
        ) : (
          /* Learner view */
          <div className="leading-relaxed">
            {parsedTemplate.map((segment, idx) => {
              if (segment.type === 'text') {
                return <span key={idx}>{segment.value}</span>;
              }

              const blank = getBlankById(segment.value);
              if (!blank) return null;

              const result = blankResults.find((r) => r.id === blank.id);
              const isCorrect = result?.correct;
              const showResult = answerState !== 'unanswered';

              return (
                <span key={idx} className="inline-flex items-center mx-1 relative">
                  <Input
                    type="text"
                    value={answers[blank.id] || ''}
                    onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                    placeholder={blank.placeholder}
                    disabled={answerState !== 'unanswered'}
                    title={config.showHints && blank.hint ? blank.hint : undefined}
                    className={cn(
                      'w-32 h-8 px-2 py-1 text-center transition-colors',
                      answerState === 'unanswered' && 'border-border focus:border-cyan-500',
                      showResult && isCorrect && 'border-green-500 bg-green-500/10',
                      showResult && !isCorrect && 'border-red-500 bg-red-500/10',
                    )}
                  />
                  {showResult && (
                    <span className="absolute -right-5 top-1/2 -translate-y-1/2">
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Show correct answers after max attempts */}
        {config.showCorrectAnswers && !canRetry && answerState !== 'correct' && (
          <div className="mt-4 p-3 rounded bg-green-500/10 border border-green-500/50">
            <p className="text-sm font-medium text-green-500 mb-2">Correct Answers:</p>
            <ul className="text-sm space-y-1">
              {content.blanks.map((blank) => (
                <li key={blank.id}>
                  <span className="text-muted-foreground">{blank.id}:</span>{' '}
                  <span className="text-foreground">{blank.acceptedAnswers[0]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit button */}
        {!isEditing && answerState === 'unanswered' && (
          <button
            type="button"
            onClick={checkAnswers}
            disabled={!hasAnswers}
            className={cn(
              'px-6 py-2 rounded-lg font-medium transition-colors',
              hasAnswers
                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                : 'bg-border text-muted-foreground cursor-not-allowed',
            )}
          >
            Check Answers
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
                  <CheckCircle className="h-4 w-4 inline" /> All Correct!
                </>
              )}
              {answerState === 'incorrect' && (
                <>
                  <XCircle className="h-4 w-4 inline" /> Incorrect
                </>
              )}
              {answerState === 'partial' &&
                `~ ${blankResults.filter((r) => r.correct).length}/${blankResults.length} Correct`}
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
