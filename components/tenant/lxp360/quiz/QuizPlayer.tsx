'use client';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProgressBar } from '@/components/tenant/lxp360/progress/ProgressBar';
import { cn } from '@/lib/core/utils';
import {
  type MultipleChoiceQuestion,
  type NumericQuestion,
  type Question,
  QuestionRenderer,
  type ShortAnswerQuestion,
  type TrueFalseQuestion,
} from './QuestionRenderer';

interface QuizPlayerProps {
  title: string;
  description?: string;
  questions: Question[];
  timeLimit?: number; // in seconds
  passingScore?: number; // percentage
  allowRetry?: boolean;
  showFeedbackImmediately?: boolean;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  onComplete?: (result: QuizResult) => void;
  onExit?: () => void;
}

interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  answers: Record<string, unknown>;
  questionResults: { questionId: string; correct: boolean; points: number }[];
}

export function QuizPlayer({
  title,
  questions: initialQuestions,
  timeLimit,
  passingScore = 70,
  allowRetry = true,
  showFeedbackImmediately = false,
  randomizeQuestions = false,
  onComplete,
  onExit,
}: QuizPlayerProps) {
  // Randomize questions if needed
  const questions = useMemo(() => {
    if (randomizeQuestions) {
      return [...initialQuestions].sort(() => Math.random() - 0.5);
    }
    return initialQuestions;
  }, [initialQuestions, randomizeQuestions]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [startTime] = useState(Date.now());
  const [result, setResult] = useState<QuizResult | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer
  const handleAnswer = (answer: unknown) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  // Toggle flag
  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  // Navigation
  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const goNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Calculate results
  const calculateResults = useCallback((): QuizResult => {
    let score = 0;
    const questionResults: { questionId: string; correct: boolean; points: number }[] = [];

    questions.forEach((question) => {
      const answer = answers[question.id];
      let isCorrect = false;

      switch (question.type) {
        case 'multiple_choice_single': {
          const mcQuestion = question as MultipleChoiceQuestion;
          const correctOption = mcQuestion.options.find((o) => o.isCorrect);
          isCorrect = answer === correctOption?.id;
          break;
        }
        case 'multiple_choice_multiple': {
          const mcQuestion = question as MultipleChoiceQuestion;
          const correctIds = mcQuestion.options.filter((o) => o.isCorrect).map((o) => o.id);
          const answerArray = (answer as string[]) || [];
          isCorrect =
            correctIds.length === answerArray.length &&
            correctIds.every((id) => answerArray.includes(id));
          break;
        }
        case 'true_false': {
          const tfQuestion = question as TrueFalseQuestion;
          isCorrect = answer === tfQuestion.correctAnswer;
          break;
        }
        case 'short_answer': {
          const saQuestion = question as ShortAnswerQuestion;
          isCorrect =
            saQuestion.correctAnswers?.some(
              (a) => a.toLowerCase() === ((answer as string) || '').toLowerCase(),
            ) ?? false;
          break;
        }
        case 'numeric': {
          const numQuestion = question as NumericQuestion;
          const numAnswer = parseFloat(answer as string);
          const correctAnswer = numQuestion.correctAnswer;
          const tolerance = numQuestion.tolerance || 0;
          isCorrect = !Number.isNaN(numAnswer) && Math.abs(numAnswer - correctAnswer) <= tolerance;
          break;
        }
        // For essay and likert, manual grading needed
        default:
          isCorrect = false;
      }

      if (isCorrect) {
        score += question.points;
      }

      questionResults.push({
        questionId: question.id,
        correct: isCorrect,
        points: isCorrect ? question.points : 0,
      });
    });

    const percentage = (score / totalPoints) * 100;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    return {
      score,
      totalPoints,
      percentage,
      passed: percentage >= passingScore,
      timeSpent,
      answers,
      questionResults,
    };
  }, [questions, answers, totalPoints, passingScore, startTime]);

  // Submit quiz
  const handleSubmit = useCallback(() => {
    const quizResult = calculateResults();
    setResult(quizResult);
    setIsSubmitted(true);
    setShowResults(true);
    onComplete?.(quizResult);
  }, [calculateResults, onComplete]);

  // Timer
  useEffect(() => {
    if (!timeLimit || isSubmitted) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, isSubmitted, handleSubmit]);

  // Retry quiz
  const handleRetry = () => {
    setAnswers({});
    setFlaggedQuestions(new Set());
    setIsSubmitted(false);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setTimeRemaining(timeLimit || 0);
    setResult(null);
  };

  // Results screen
  if (showResults && result) {
    return (
      <div className="min-h-screen bg-(--surface-page) flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-(--surface-card) rounded-2xl border border-(--border-subtle) p-8">
          {/* Result icon */}
          <div className="flex justify-center mb-6">
            <div
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center',
                result.passed ? 'bg-brand-success/20' : 'bg-brand-error/20',
              )}
            >
              {result.passed ? (
                <Trophy className="w-12 h-12 text-brand-success" />
              ) : (
                <AlertCircle className="w-12 h-12 text-brand-error" />
              )}
            </div>
          </div>

          {/* Title */}
          <h2
            className={cn(
              'text-2xl font-bold text-center mb-2',
              result.passed ? 'text-brand-success' : 'text-brand-error',
            )}
          >
            {result.passed ? 'Congratulations!' : 'Keep Trying!'}
          </h2>
          <p className="text-brand-muted text-center mb-6">
            {result.passed
              ? 'You have successfully passed the quiz.'
              : `You need ${passingScore}% to pass. Keep learning and try again!`}
          </p>

          {/* Score */}
          <div className="bg-(--surface-page) rounded-xl p-6 mb-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-brand-primary mb-2">
                {Math.round(result.percentage)}%
              </p>
              <p className="text-brand-muted">
                {result.score} / {result.totalPoints} points
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-(--border-subtle)">
              <div className="flex justify-between text-sm text-brand-muted">
                <span>Time spent:</span>
                <span className="text-brand-primary">{formatTime(result.timeSpent)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Questions answered:</span>
                <span className="text-brand-primary">
                  {answeredCount} / {questions.length}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Passing score:</span>
                <span className="text-brand-primary">{passingScore}%</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {allowRetry && (
              <button
                type="button"
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-(--surface-card-hover) text-brand-primary rounded-xl hover:bg-(--surface-sidebar-hover) transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Retry Quiz
              </button>
            )}
            <button
              type="button"
              onClick={onExit}
              className="flex-1 py-3 bg-(--brand-primary) text-brand-primary rounded-xl hover:bg-(--brand-primary-hover) transition-colors"
            >
              Continue
            </button>
          </div>

          {/* Review answers button */}
          <button
            type="button"
            onClick={() => setShowResults(false)}
            className="w-full mt-3 py-3 text-(--brand-primary) hover:underline"
          >
            Review Answers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--surface-page) flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-(--surface-card)/95 backdrop-blur-xs border-b border-(--border-subtle)">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onExit}
                className="text-brand-muted hover:text-brand-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-brand-primary font-semibold">{title}</h1>
                <p className="text-xs text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              {timeLimit && !isSubmitted && (
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                    timeRemaining < 60
                      ? 'bg-brand-error/20 text-brand-error'
                      : timeRemaining < 300
                        ? 'bg-brand-warning/20 text-brand-warning'
                        : 'bg-(--surface-card-hover) text-brand-primary',
                  )}
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatTime(timeRemaining)}</span>
                </div>
              )}

              {/* Progress */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {answeredCount}/{questions.length} answered
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <ProgressBar value={progress} size="sm" variant="gradient" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Question area */}
        <div className="flex-1 max-w-4xl mx-auto px-6 py-8">
          <QuestionRenderer
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
            showFeedback={
              isSubmitted || (showFeedbackImmediately && answers[currentQuestion.id] !== undefined)
            }
            isCorrect={
              result?.questionResults.find((r) => r.questionId === currentQuestion.id)?.correct
            }
            disabled={isSubmitted}
            questionNumber={currentQuestionIndex + 1}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-(--border-subtle)">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentQuestionIndex === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                currentQuestionIndex === 0
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'text-muted-foreground hover:text-brand-primary hover:bg-(--surface-card-hover)',
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {!isSubmitted && (
                <button
                  type="button"
                  onClick={toggleFlag}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                    flaggedQuestions.has(currentQuestion.id)
                      ? 'bg-brand-warning/20 text-brand-warning'
                      : 'text-muted-foreground hover:text-brand-primary hover:bg-(--surface-card-hover)',
                  )}
                >
                  <Flag className="w-4 h-4" />
                  {flaggedQuestions.has(currentQuestion.id) ? 'Flagged' : 'Flag'}
                </button>
              )}

              {currentQuestionIndex === questions.length - 1 && !isSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2 bg-(--brand-primary) text-brand-primary rounded-lg hover:bg-(--brand-primary-hover) transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Submit Quiz
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                    currentQuestionIndex === questions.length - 1
                      ? 'text-muted-foreground cursor-not-allowed'
                      : 'bg-(--brand-primary) text-brand-primary hover:bg-(--brand-primary-hover)',
                  )}
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question navigator sidebar */}
        <div className="hidden lg:block w-64 bg-(--surface-card) border-l border-(--border-subtle) p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, index) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = index === currentQuestionIndex;
              const isFlagged = flaggedQuestions.has(q.id);
              const questionResult = result?.questionResults.find((r) => r.questionId === q.id);

              return (
                <button
                  type="button"
                  key={q.id}
                  onClick={() => goToQuestion(index)}
                  className={cn(
                    'w-10 h-10 rounded-lg text-sm font-medium transition-colors relative',
                    isCurrent
                      ? 'bg-(--brand-primary) text-brand-primary'
                      : isSubmitted
                        ? questionResult?.correct
                          ? 'bg-brand-success/20 text-brand-success'
                          : 'bg-brand-error/20 text-brand-error'
                        : isAnswered
                          ? 'bg-(--brand-primary)/20 text-(--brand-primary)'
                          : 'bg-(--surface-card-hover) text-muted-foreground hover:bg-(--surface-sidebar-hover)',
                  )}
                >
                  {index + 1}
                  {isFlagged && !isSubmitted && (
                    <Flag className="absolute -top-1 -right-1 w-3 h-3 text-brand-warning" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-(--brand-primary)/20" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-(--surface-card-hover)" />
              <span>Not answered</span>
            </div>
            {!isSubmitted && (
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-brand-warning" />
                <span>Flagged for review</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
