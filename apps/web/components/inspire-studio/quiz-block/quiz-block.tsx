'use client';

import {
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FillBlankQuestion } from './fill-blank-question';
import { MultipleChoiceQuestion } from './multiple-choice-question';
import { TrueFalseQuestion } from './true-false-question';
import type {
  FillBlankQuestion as FBQuestion,
  MultipleChoiceQuestion as MCQuestion,
  QuizAnswer,
  QuizData,
  QuizState,
  TrueFalseQuestion as TFQuestion,
} from './types';

interface QuizBlockProps {
  quiz: QuizData;
  onComplete?: (score: number, maxScore: number, passed: boolean) => void;
}

const DEFAULT_SETTINGS = {
  shuffleQuestions: false,
  shuffleOptions: false,
  showFeedback: 'on-submit' as const,
  allowRetry: true,
  maxAttempts: 3,
  passingScore: 70,
  timeLimit: undefined,
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function QuizBlock({ quiz, onComplete }: QuizBlockProps): React.JSX.Element {
  const settings = { ...DEFAULT_SETTINGS, ...quiz.settings };

  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    isSubmitted: false,
    showResults: false,
    startedAt: new Date(),
  });

  const [timeRemaining, setTimeRemaining] = useState<number | null>(settings.timeLimit || null);
  const [attempts, setAttempts] = useState(0);

  // Ref to store the latest submit handler to avoid stale closure in timer
  const handleSubmitRef = useRef<() => void>(() => {});

  // Timer
  useEffect(() => {
    if (!settings.timeLimit || state.isSubmitted) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.timeLimit, state.isSubmitted]);

  // Shuffle questions if enabled
  const questions = useMemo(() => {
    if (!settings.shuffleQuestions) return quiz.questions;

    return [...quiz.questions].sort(() => Math.random() - 0.5);
  }, [quiz.questions, settings.shuffleQuestions]);

  const currentQuestion = questions[state.currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((state.currentQuestionIndex + 1) / totalQuestions) * 100;

  // Calculate score
  const calculateScore = useCallback((): { score: number; maxScore: number } => {
    let score = 0;
    let maxScore = 0;

    questions.forEach((q) => {
      maxScore += q.points;
      const answer = state.answers[q.id];

      if (q.type === 'multiple-choice') {
        const mcq = q as MCQuestion;
        const selectedIds = (answer as string[]) || [];
        const correctIds = mcq.options.filter((o) => o.isCorrect).map((o) => o.id);

        const allCorrectSelected = correctIds.every((id) => selectedIds.includes(id));
        const noIncorrectSelected = selectedIds.every((id) => correctIds.includes(id));

        if (allCorrectSelected && noIncorrectSelected) {
          score += q.points;
        } else if (mcq.allowMultiple) {
          // Partial credit for multiple select
          const correctSelected = selectedIds.filter((id) => correctIds.includes(id)).length;
          const incorrectSelected = selectedIds.filter((id) => !correctIds.includes(id)).length;
          const partialScore =
            Math.max(0, (correctSelected - incorrectSelected) / correctIds.length) * q.points;
          score += Math.round(partialScore * 100) / 100;
        }
      } else if (q.type === 'true-false') {
        const tfq = q as TFQuestion;
        if (answer === tfq.correctAnswer) {
          score += q.points;
        }
      } else if (q.type === 'fill-blank') {
        const fbq = q as FBQuestion;
        const blankAnswers = (answer as Record<string, string>) || {};
        let correctBlanks = 0;

        fbq.blanks.forEach((blank) => {
          const userAnswer = blankAnswers[blank.id] || '';
          const isCorrect = blank.correctAnswers.some((correctAnswer) => {
            if (blank.caseSensitive) {
              return userAnswer.trim() === correctAnswer.trim();
            }
            return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
          });
          if (isCorrect) correctBlanks++;
        });

        // Partial credit based on correct blanks
        score += (correctBlanks / fbq.blanks.length) * q.points;
      }
    });

    return { score: Math.round(score * 100) / 100, maxScore };
  }, [questions, state.answers]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (state.currentQuestionIndex < totalQuestions - 1) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  }, [state.currentQuestionIndex, totalQuestions]);

  const handlePrevious = useCallback(() => {
    if (state.currentQuestionIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  }, [state.currentQuestionIndex]);

  const handleGoToQuestion = useCallback((index: number) => {
    setState((prev) => ({ ...prev, currentQuestionIndex: index }));
  }, []);

  // Answer handlers
  const handleAnswerChange = useCallback((questionId: string, answer: QuizAnswer['answer']) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
    }));
  }, []);

  // Submit handler
  const handleSubmit = useCallback(() => {
    const { score, maxScore } = calculateScore();
    const percentage = (score / maxScore) * 100;
    const passed = percentage >= settings.passingScore;

    setState((prev) => ({
      ...prev,
      isSubmitted: true,
      showResults: true,
      score,
    }));

    setAttempts((prev) => prev + 1);
    onComplete?.(score, maxScore, passed);
  }, [calculateScore, settings.passingScore, onComplete]);

  // Keep ref updated with latest handleSubmit
  handleSubmitRef.current = handleSubmit;

  // Retry handler
  const handleRetry = useCallback(() => {
    if (!settings.allowRetry) return;
    if (settings.maxAttempts && attempts >= settings.maxAttempts) return;

    setState({
      currentQuestionIndex: 0,
      answers: {},
      isSubmitted: false,
      showResults: false,
      startedAt: new Date(),
    });

    if (settings.timeLimit) {
      setTimeRemaining(settings.timeLimit);
    }
  }, [settings.allowRetry, settings.maxAttempts, settings.timeLimit, attempts]);

  // Check if all required questions are answered
  const allAnswered = useMemo(() => {
    return questions.every((q) => {
      const answer = state.answers[q.id];
      if (!q.required) return true;

      if (q.type === 'multiple-choice') {
        return Array.isArray(answer) && answer.length > 0;
      } else if (q.type === 'true-false') {
        return typeof answer === 'boolean';
      } else if (q.type === 'fill-blank') {
        const fbq = q as FBQuestion;
        const blankAnswers = answer as Record<string, string> | undefined;
        return fbq.blanks.every((blank) => blankAnswers?.[blank.id]?.trim());
      }
      return false;
    });
  }, [questions, state.answers]);

  const currentAnswer = state.answers[currentQuestion?.id];
  const showFeedback = state.isSubmitted && settings.showFeedback !== 'never';

  // Results view
  if (state.showResults) {
    const { score, maxScore } = calculateScore();
    const percentage = Math.round((score / maxScore) * 100);
    const passed = percentage >= settings.passingScore;
    const canRetry =
      settings.allowRetry && (!settings.maxAttempts || attempts < settings.maxAttempts);

    return (
      <div className="p-6 bg-brand-surface rounded-xl shadow-lg">
        {/* Results Header */}
        <div
          className={cn('text-center p-8 rounded-lg mb-6', passed ? 'bg-green-50' : 'bg-amber-50')}
        >
          <div
            className={cn(
              'w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4',
              passed ? 'bg-brand-success' : 'bg-brand-warning',
            )}
          >
            {passed ? (
              <Award className="w-10 h-10 text-brand-primary" />
            ) : (
              <XCircle className="w-10 h-10 text-brand-primary" />
            )}
          </div>

          <h2
            className={cn('text-2xl font-bold mb-2', passed ? 'text-green-800' : 'text-amber-800')}
          >
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>

          <p className="text-brand-secondary mb-4">
            {passed
              ? 'You passed the quiz!'
              : `You need ${settings.passingScore}% to pass. Try again!`}
          </p>

          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-brand-primary">{percentage}%</p>
              <p className="text-sm text-brand-muted">Score</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-brand-primary">
                {score}/{maxScore}
              </p>
              <p className="text-sm text-brand-muted">Points</p>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Question Review</h3>
          {questions.map((q, index) => {
            const answer = state.answers[q.id];
            let isCorrect = false;

            if (q.type === 'multiple-choice') {
              const mcq = q as MCQuestion;
              const selectedIds = (answer as string[]) || [];
              const correctIds = mcq.options.filter((o) => o.isCorrect).map((o) => o.id);
              isCorrect =
                correctIds.length === selectedIds.length &&
                correctIds.every((id) => selectedIds.includes(id));
            } else if (q.type === 'true-false') {
              const tfq = q as TFQuestion;
              isCorrect = answer === tfq.correctAnswer;
            } else if (q.type === 'fill-blank') {
              const fbq = q as FBQuestion;
              const blankAnswers = (answer as Record<string, string>) || {};
              isCorrect = fbq.blanks.every((blank) => {
                const userAnswer = blankAnswers[blank.id] || '';
                return blank.correctAnswers.some((ca) =>
                  blank.caseSensitive
                    ? userAnswer.trim() === ca.trim()
                    : userAnswer.trim().toLowerCase() === ca.trim().toLowerCase(),
                );
              });
            }

            return (
              <button
                type="button"
                key={q.id}
                onClick={() => handleGoToQuestion(index)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                  'hover:bg-brand-page',
                  isCorrect ? 'border-green-200' : 'border-red-200',
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    isCorrect ? 'bg-green-100' : 'bg-red-100',
                  )}
                >
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Q{index + 1}: {q.question}
                  </p>
                  <p className="text-xs text-brand-muted">
                    {q.points} {q.points === 1 ? 'point' : 'points'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-muted" />
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          {canRetry && (
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
              {settings.maxAttempts && (
                <span className="text-xs opacity-70">({settings.maxAttempts - attempts} left)</span>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Quiz view
  return (
    <div className="bg-brand-surface rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-brand-page">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{quiz.title}</h2>
          {timeRemaining !== null && (
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
                timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700',
              )}
            >
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-sm text-brand-muted">
            {state.currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>
      </div>

      {/* Question Navigation Dots */}
      <div className="flex items-center gap-1 px-6 py-3 border-b overflow-x-auto">
        {questions.map((q, index) => {
          const answered = state.answers[q.id] !== undefined;
          const isCurrent = index === state.currentQuestionIndex;

          return (
            <button
              type="button"
              key={q.id}
              onClick={() => handleGoToQuestion(index)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all shrink-0',
                isCurrent && 'ring-2 ring-brand-primary ring-offset-2',
                answered && !isCurrent && 'bg-blue-100 text-blue-700',
                !answered && !isCurrent && 'bg-brand-surface text-brand-muted',
                isCurrent && 'bg-brand-primary text-brand-primary',
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Question Content */}
      <div className="p-6">
        {/* Question Header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-brand-blue" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-brand-primary">{currentQuestion.question}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-brand-muted">
              <span>
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </span>
              {currentQuestion.required && <span className="text-brand-error">* Required</span>}
            </div>
          </div>
        </div>

        {/* Question Type Component */}
        {currentQuestion.type === 'multiple-choice' && (
          <MultipleChoiceQuestion
            question={currentQuestion as MCQuestion}
            selectedAnswers={(currentAnswer as string[]) || []}
            onAnswerChange={(answers) => handleAnswerChange(currentQuestion.id, answers)}
            showFeedback={showFeedback}
            isSubmitted={state.isSubmitted}
          />
        )}

        {currentQuestion.type === 'true-false' && (
          <TrueFalseQuestion
            question={currentQuestion as TFQuestion}
            selectedAnswer={currentAnswer as boolean | null}
            onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
            showFeedback={showFeedback}
            isSubmitted={state.isSubmitted}
          />
        )}

        {currentQuestion.type === 'fill-blank' && (
          <FillBlankQuestion
            question={currentQuestion as FBQuestion}
            answers={(currentAnswer as Record<string, string>) || {}}
            onAnswerChange={(blankId, value) => {
              const prev = (currentAnswer as Record<string, string>) || {};
              handleAnswerChange(currentQuestion.id, { ...prev, [blankId]: value });
            }}
            showFeedback={showFeedback}
            isSubmitted={state.isSubmitted}
          />
        )}

        {/* Explanation (shown after feedback) */}
        {showFeedback && currentQuestion.explanation && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Explanation</p>
              <p className="text-sm text-blue-700 mt-1">{currentQuestion.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="px-6 py-4 border-t bg-brand-page flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={state.currentQuestionIndex === 0}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {state.currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={state.isSubmitted || !allAnswered}
              className="flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex items-center gap-1">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
