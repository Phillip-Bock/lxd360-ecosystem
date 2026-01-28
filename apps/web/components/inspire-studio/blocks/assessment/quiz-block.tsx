'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useXAPITracking } from '@/hooks/useXAPITracking';
import type { BlockComponentProps } from '../block-renderer';

// Local types for Quiz Block
interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  feedback?: string;
}

type QuestionType =
  | 'multiple-choice'
  | 'multiple-select'
  | 'true-false'
  | 'short-answer'
  | 'fill-blank'
  | 'matching'
  | 'ordering'
  | 'hotspot';

interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  correctAnswers?: string[];
  acceptedAnswers?: string[];
  points?: number;
  feedback?: {
    correct?: string;
    incorrect?: string;
  };
}

interface QuizBlockContent {
  title?: string;
  description?: string;
  questions?: QuizQuestion[];
  passingScore?: number;
  showFeedback?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  allowRetry?: boolean;
  showCorrectAnswers?: boolean;
}

type QuizAnswer = string | string[] | undefined;

interface QuizAnswers {
  [questionId: string]: QuizAnswer;
}

const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'multiple-select', label: 'Multiple Select' },
  { value: 'true-false', label: 'True/False' },
  { value: 'short-answer', label: 'Short Answer' },
  { value: 'fill-blank', label: 'Fill in the Blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'ordering', label: 'Ordering/Sequence' },
  { value: 'hotspot', label: 'Hotspot' },
] as const;

/**
 * QuizBlock - Comprehensive quiz component
 */
export function QuizBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<QuizBlockContent>): React.JSX.Element {
  const content = block.content as QuizBlockContent;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const attemptNumberRef = useRef(1);

  // Default values - wrapped in useMemo to maintain stable references
  const questions = useMemo(() => content.questions || [], [content.questions]);
  const title = content.title || 'Quiz';
  const passingScore = content.passingScore ?? 70;

  // xAPI tracking - only track when not in editing mode
  const { emitLaunched, emitQuizAnswer, emitCompleted, isActive } = useXAPITracking({
    activityId: block.id,
    activityName: title,
    activityType: 'quiz',
    activityDescription: content.description,
    autoEmitLaunch: !isEditing,
  });

  // Track quiz start time
  useEffect(() => {
    if (!isEditing) {
      startTimeRef.current = Date.now();
    }
  }, [isEditing]);
  const showFeedback = content.showFeedback !== false;
  const shuffleQuestions = content.shuffleQuestions ?? false;
  const shuffleOptions = content.shuffleOptions ?? false;
  const allowRetry = content.allowRetry !== false;
  const showCorrectAnswers = content.showCorrectAnswers !== false;

  // Shuffle questions if needed
  const displayQuestions = useMemo(() => {
    if (!shuffleQuestions || isEditing) return questions;
    return [...questions].sort(() => Math.random() - 0.5);
  }, [questions, shuffleQuestions, isEditing]);

  // Current question
  const currentQuestion = displayQuestions[currentQuestionIndex];

  // Calculate score
  const calculateScore = useCallback(() => {
    let correct = 0;
    const total = questions.length;

    questions.forEach((q) => {
      const answer = answers[q.id];
      if (!answer) return;

      switch (q.type) {
        case 'multiple-choice':
        case 'true-false':
          if (answer === q.correctAnswer) correct++;
          break;
        case 'multiple-select': {
          const correctAnswers = q.correctAnswers || [];
          if (
            Array.isArray(answer) &&
            answer.length === correctAnswers.length &&
            answer.every((a) => correctAnswers.includes(a))
          ) {
            correct++;
          }
          break;
        }
        case 'short-answer': {
          const acceptedAnswers = q.acceptedAnswers || [q.correctAnswer];
          if (
            typeof answer === 'string' &&
            acceptedAnswers.some((a) => a?.toLowerCase().trim() === answer.toLowerCase().trim())
          ) {
            correct++;
          }
          break;
        }
        case 'fill-blank':
          if (
            typeof answer === 'string' &&
            answer.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim()
          ) {
            correct++;
          }
          break;
      }
    });

    return { correct, total, percentage: Math.round((correct / total) * 100) };
  }, [questions, answers]);

  // Helper to check answer correctness
  const checkAnswerCorrectness = useCallback(
    (question: QuizQuestion, answer: QuizAnswer): boolean => {
      if (!answer) return false;
      switch (question.type) {
        case 'multiple-choice':
        case 'true-false':
          return typeof answer === 'string' && answer === question.correctAnswer;
        case 'multiple-select': {
          const correctAnswers = question.correctAnswers || [];
          return (
            Array.isArray(answer) &&
            answer.length === correctAnswers.length &&
            answer.every((a) => correctAnswers.includes(a))
          );
        }
        case 'short-answer': {
          const acceptedAnswers = question.acceptedAnswers || [question.correctAnswer];
          return (
            typeof answer === 'string' &&
            acceptedAnswers.some((a) => a?.toLowerCase().trim() === answer.toLowerCase().trim())
          );
        }
        case 'fill-blank':
          return (
            typeof answer === 'string' &&
            answer.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()
          );
        default:
          return false;
      }
    },
    [],
  );

  // Handle answer selection with xAPI tracking
  const handleAnswer = useCallback(
    (questionId: string, value: QuizAnswer) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));

      // Track answer in xAPI
      if (isActive && !isEditing) {
        const question = questions.find((q) => q.id === questionId);
        if (question) {
          const responseStr = Array.isArray(value) ? value.join(',') : String(value ?? '');
          const isCorrect = checkAnswerCorrectness(question, value);
          emitQuizAnswer({
            questionId,
            response: responseStr,
            correct: isCorrect,
            attemptNumber: attemptNumberRef.current,
          });
        }
      }
    },
    [isActive, isEditing, questions, emitQuizAnswer, checkAnswerCorrectness],
  );

  // Submit quiz with xAPI tracking
  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setShowResults(true);

    // Calculate and emit completion
    if (isActive && !isEditing) {
      const { percentage } = calculateScore();
      const passed = percentage >= passingScore;
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      emitCompleted({
        duration,
        success: passed,
        score: percentage,
      });
    }
  }, [isActive, isEditing, calculateScore, passingScore, emitCompleted]);

  // Retry quiz with xAPI tracking
  const handleRetry = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setShowResults(false);
    setCurrentQuestionIndex(0);

    // Track retry
    if (isActive && !isEditing) {
      attemptNumberRef.current += 1;
      startTimeRef.current = Date.now();
      emitLaunched();
    }
  }, [isActive, isEditing, emitLaunched]);

  // Add question
  const addQuestion = useCallback(
    (type: QuestionType = 'multiple-choice') => {
      const newQuestion: QuizQuestion = {
        id: `q-${Date.now()}`,
        type: type,
        question: 'New question?',
        options:
          type !== 'short-answer' && type !== 'fill-blank'
            ? [
                { id: 'opt-1', text: 'Option A', isCorrect: true },
                { id: 'opt-2', text: 'Option B', isCorrect: false },
                { id: 'opt-3', text: 'Option C', isCorrect: false },
                { id: 'opt-4', text: 'Option D', isCorrect: false },
              ]
            : undefined,
        correctAnswer: type === 'true-false' ? 'true' : '',
        points: 1,
      };
      onUpdate({
        content: {
          ...content,
          questions: [...questions, newQuestion],
        },
      });
      setEditingQuestionId(newQuestion.id);
    },
    [content, questions, onUpdate],
  );

  // Update question
  const updateQuestion = useCallback(
    (questionId: string, updates: Partial<QuizQuestion>) => {
      onUpdate({
        content: {
          ...content,
          questions: questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
        },
      });
    },
    [content, questions, onUpdate],
  );

  // Delete question
  const deleteQuestion = useCallback(
    (questionId: string) => {
      onUpdate({
        content: {
          ...content,
          questions: questions.filter((q) => q.id !== questionId),
        },
      });
      if (editingQuestionId === questionId) setEditingQuestionId(null);
    },
    [content, questions, editingQuestionId, onUpdate],
  );

  // Render question for taking quiz
  const renderQuestion = (question: QuizQuestion): React.JSX.Element => {
    const answer = answers[question.id];
    const isCorrect = submitted && showCorrectAnswers ? checkAnswer(question, answer) : null;

    return (
      <div className="space-y-4">
        {/* Question text */}
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-8 h-8 rounded-full bg-studio-accent/20 flex items-center justify-center text-studio-accent font-medium">
            {currentQuestionIndex + 1}
          </span>
          <div>
            <p className="text-lg text-brand-primary">{question.question}</p>
            {question.points && question.points > 1 && (
              <p className="text-sm text-studio-text-muted mt-1">{question.points} points</p>
            )}
          </div>
        </div>

        {/* Question-specific UI */}
        {question.type === 'multiple-choice' && renderMultipleChoice(question, answer)}
        {question.type === 'multiple-select' && renderMultipleSelect(question, answer)}
        {question.type === 'true-false' && renderTrueFalse(question, answer)}
        {question.type === 'short-answer' && renderShortAnswer(question, answer, isCorrect)}
        {question.type === 'fill-blank' && renderFillBlank(question, answer, isCorrect)}

        {/* Feedback */}
        {submitted && showFeedback && question.feedback && (
          <div
            className={`
            p-4 rounded-lg mt-4
            ${isCorrect ? 'bg-brand-success/10 border border-brand-success/30' : 'bg-brand-error/10 border border-brand-error/30'}
          `}
          >
            <p className={`text-sm ${isCorrect ? 'text-brand-success' : 'text-brand-error'}`}>
              {isCorrect ? question.feedback.correct : question.feedback.incorrect}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Check if answer is correct
  const checkAnswer = (question: QuizQuestion, answer: QuizAnswer): boolean => {
    if (!answer) return false;

    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return typeof answer === 'string' && answer === question.correctAnswer;
      case 'multiple-select': {
        const correctAnswers = question.correctAnswers || [];
        return (
          Array.isArray(answer) &&
          answer.length === correctAnswers.length &&
          answer.every((a) => correctAnswers.includes(a))
        );
      }
      case 'short-answer': {
        const acceptedAnswers = question.acceptedAnswers || [question.correctAnswer];
        return (
          typeof answer === 'string' &&
          acceptedAnswers.some((a) => a?.toLowerCase().trim() === answer.toLowerCase().trim())
        );
      }
      case 'fill-blank':
        return (
          typeof answer === 'string' &&
          answer.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()
        );
      default:
        return false;
    }
  };

  // Render multiple choice options
  const renderMultipleChoice = (question: QuizQuestion, answer: QuizAnswer): React.JSX.Element => {
    const options =
      shuffleOptions && !isEditing && !submitted
        ? [...(question.options || [])].sort(() => Math.random() - 0.5)
        : question.options || [];

    const answerString = typeof answer === 'string' ? answer : undefined;

    return (
      <div className="space-y-2 pl-11">
        {options.map((option) => {
          const isSelected = answerString === option.id;
          const isThisCorrect = submitted && showCorrectAnswers && option.isCorrect;

          return (
            <button
              type="button"
              key={option.id}
              onClick={() => !submitted && handleAnswer(question.id, option.id)}
              disabled={submitted}
              className={`
                w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3
                ${
                  isSelected
                    ? submitted
                      ? isThisCorrect
                        ? 'bg-brand-success/10 border-brand-success/50 text-brand-primary'
                        : 'bg-brand-error/10 border-brand-error/50 text-brand-primary'
                      : 'bg-studio-accent/10 border-studio-accent/50 text-brand-primary'
                    : isThisCorrect
                      ? 'bg-brand-success/5 border-brand-success/30 text-brand-primary'
                      : 'bg-studio-bg border-studio-surface/50 text-studio-text hover:border-studio-surface'
                }
              `}
            >
              <div
                className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                ${isSelected ? 'border-studio-accent bg-studio-accent' : 'border-studio-text-muted'}
              `}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-brand-surface" />}
              </div>
              <span className="flex-1">{option.text}</span>
              {submitted &&
                showCorrectAnswers &&
                (isThisCorrect ? (
                  <CheckCircle className="w-5 h-5 text-brand-success" />
                ) : isSelected && !isThisCorrect ? (
                  <XCircle className="w-5 h-5 text-brand-error" />
                ) : null)}
            </button>
          );
        })}
      </div>
    );
  };

  // Render multiple select options
  const renderMultipleSelect = (question: QuizQuestion, answer: QuizAnswer): React.JSX.Element => {
    const selected = Array.isArray(answer) ? answer : [];
    const options = question.options || [];

    return (
      <div className="space-y-2 pl-11">
        <p className="text-sm text-studio-text-muted mb-2">Select all that apply</p>
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const isThisCorrect = submitted && showCorrectAnswers && option.isCorrect;

          return (
            <button
              type="button"
              key={option.id}
              onClick={() => {
                if (submitted) return;
                const newSelected = isSelected
                  ? selected.filter((id) => id !== option.id)
                  : [...selected, option.id];
                handleAnswer(question.id, newSelected);
              }}
              disabled={submitted}
              className={`
                w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3
                ${
                  isSelected
                    ? submitted
                      ? isThisCorrect
                        ? 'bg-brand-success/10 border-brand-success/50 text-brand-primary'
                        : 'bg-brand-error/10 border-brand-error/50 text-brand-primary'
                      : 'bg-studio-accent/10 border-studio-accent/50 text-brand-primary'
                    : isThisCorrect
                      ? 'bg-brand-success/5 border-brand-success/30 text-brand-primary'
                      : 'bg-studio-bg border-studio-surface/50 text-studio-text hover:border-studio-surface'
                }
              `}
            >
              <div
                className={`
                w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                ${isSelected ? 'border-studio-accent bg-studio-accent' : 'border-studio-text-muted'}
              `}
              >
                {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
              </div>
              <span className="flex-1">{option.text}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // Render true/false
  const renderTrueFalse = (question: QuizQuestion, answer: QuizAnswer): React.JSX.Element => {
    const answerString = typeof answer === 'string' ? answer : undefined;

    return (
      <div className="flex gap-4 pl-11">
        {['true', 'false'].map((value) => {
          const isSelected = answerString === value;
          const isThisCorrect = submitted && showCorrectAnswers && question.correctAnswer === value;

          return (
            <button
              type="button"
              key={value}
              onClick={() => !submitted && handleAnswer(question.id, value)}
              disabled={submitted}
              className={`
              flex-1 p-4 rounded-lg border text-center font-medium transition-all
              ${
                isSelected
                  ? submitted
                    ? isThisCorrect
                      ? 'bg-brand-success/10 border-brand-success/50 text-brand-success'
                      : 'bg-brand-error/10 border-brand-error/50 text-brand-error'
                    : 'bg-studio-accent/10 border-studio-accent/50 text-studio-accent'
                  : isThisCorrect
                    ? 'bg-brand-success/5 border-brand-success/30 text-brand-success'
                    : 'bg-studio-bg border-studio-surface/50 text-studio-text hover:border-studio-surface'
              }
            `}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          );
        })}
      </div>
    );
  };

  // Render short answer
  const renderShortAnswer = (
    question: QuizQuestion,
    answer: QuizAnswer,
    isCorrect: boolean | null,
  ): React.JSX.Element => {
    const answerString = typeof answer === 'string' ? answer : '';

    return (
      <div className="pl-11">
        <input
          type="text"
          value={answerString}
          onChange={(e) => !submitted && handleAnswer(question.id, e.target.value)}
          disabled={submitted}
          className={`
            w-full px-4 py-3 rounded-lg border text-brand-primary outline-hidden transition-all
            ${
              submitted
                ? isCorrect
                  ? 'bg-brand-success/10 border-brand-success/50'
                  : 'bg-brand-error/10 border-brand-error/50'
                : 'bg-studio-bg border-studio-surface/50 focus:border-studio-accent/50'
            }
          `}
          placeholder="Type your answer..."
        />
        {submitted && showCorrectAnswers && !isCorrect && (
          <p className="mt-2 text-sm text-brand-success">
            Correct answer: {question.correctAnswer}
          </p>
        )}
      </div>
    );
  };

  // Render fill in the blank
  const renderFillBlank = (
    question: QuizQuestion,
    answer: QuizAnswer,
    isCorrect: boolean | null,
  ): React.JSX.Element => {
    const parts = question.question.split('___');
    const answerString = typeof answer === 'string' ? answer : '';

    return (
      <div className="pl-11">
        <div className="flex items-center gap-2 flex-wrap text-lg">
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <span className="text-brand-primary">{part}</span>
              {index < parts.length - 1 && (
                <input
                  type="text"
                  value={answerString}
                  onChange={(e) => !submitted && handleAnswer(question.id, e.target.value)}
                  disabled={submitted}
                  className={`
                    w-32 px-3 py-1 rounded border text-center text-brand-primary outline-hidden
                    ${
                      submitted
                        ? isCorrect
                          ? 'bg-brand-success/10 border-brand-success/50'
                          : 'bg-brand-error/10 border-brand-error/50'
                        : 'bg-studio-bg border-studio-surface/50 focus:border-studio-accent/50'
                    }
                  `}
                  placeholder="..."
                />
              )}
            </React.Fragment>
          ))}
        </div>
        {submitted && showCorrectAnswers && !isCorrect && (
          <p className="mt-2 text-sm text-brand-success">
            Correct answer: {question.correctAnswer}
          </p>
        )}
      </div>
    );
  };

  // Preview mode
  if (!isEditing) {
    // Results screen
    if (showResults) {
      const { correct, total, percentage } = calculateScore();
      const passed = percentage >= passingScore;

      return (
        <div className="bg-studio-bg rounded-xl p-6 border border-studio-surface/30">
          <div className="text-center max-w-md mx-auto">
            {/* Score display */}
            <div
              className={`
              w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center
              ${passed ? 'bg-brand-success/20' : 'bg-brand-error/20'}
            `}
            >
              {passed ? (
                <Award className="w-12 h-12 text-brand-success" />
              ) : (
                <XCircle className="w-12 h-12 text-brand-error" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-brand-primary mb-2">
              {passed ? 'Congratulations!' : 'Keep Trying'}
            </h3>
            <p className="text-studio-text mb-6">
              {passed
                ? 'You passed the quiz!'
                : `You need ${passingScore}% to pass. Keep learning!`}
            </p>

            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-studio-bg-dark rounded-lg p-4">
                <p className="text-3xl font-bold text-brand-primary">{percentage}%</p>
                <p className="text-xs text-studio-text-muted">Score</p>
              </div>
              <div className="bg-studio-bg-dark rounded-lg p-4">
                <p className="text-3xl font-bold text-brand-success">{correct}</p>
                <p className="text-xs text-studio-text-muted">Correct</p>
              </div>
              <div className="bg-studio-bg-dark rounded-lg p-4">
                <p className="text-3xl font-bold text-brand-error">{total - correct}</p>
                <p className="text-xs text-studio-text-muted">Incorrect</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-studio-surface rounded-full overflow-hidden mb-6">
              <div
                className={`h-full rounded-full transition-all ${passed ? 'bg-brand-success' : 'bg-brand-error'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              {allowRetry && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-6 py-3 bg-studio-surface hover:bg-studio-surface/80 text-brand-primary rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowResults(false)}
                className="flex items-center gap-2 px-6 py-3 bg-studio-accent hover:bg-studio-accent-hover text-brand-primary rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5" />
                Review Answers
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Quiz taking view
    if (questions.length === 0) {
      return (
        <div className="p-4 text-center text-studio-text-muted border border-dashed border-studio-surface/50 rounded-lg">
          No questions in this quiz
        </div>
      );
    }

    return (
      <div className="bg-studio-bg rounded-xl border border-studio-surface/30 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-studio-surface/30 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-primary">{title}</h3>
          <span className="text-sm text-studio-text-muted">
            Question {currentQuestionIndex + 1} of {displayQuestions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-studio-surface">
          <div
            className="h-full bg-studio-accent transition-all"
            style={{
              width: `${((currentQuestionIndex + 1) / displayQuestions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion?.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {currentQuestion && renderQuestion(currentQuestion)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-studio-surface/30 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-studio-text-muted hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentQuestionIndex < displayQuestions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-studio-accent hover:bg-studio-accent-hover text-brand-primary rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitted}
              className="flex items-center gap-2 px-6 py-2 bg-brand-success hover:bg-brand-success disabled:bg-studio-text-muted text-brand-primary rounded-lg transition-colors"
            >
              <Check className="w-5 h-5" />
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      {/* Settings bar */}
      <div className="flex items-center gap-4 flex-wrap p-4 bg-studio-bg rounded-lg border border-studio-surface/30">
        <div className="flex items-center gap-2">
          <span className="text-sm text-studio-text-muted">Title:</span>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdate({ content: { ...content, title: e.target.value } })}
            className="px-2 py-1 bg-transparent border-b border-studio-surface/50 text-brand-primary text-sm outline-hidden focus:border-studio-accent/50"
            placeholder="Quiz title..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-studio-text-muted">Pass:</span>
          <input
            type="number"
            value={passingScore}
            onChange={(e) =>
              onUpdate({
                content: { ...content, passingScore: parseInt(e.target.value, 10) },
              })
            }
            min={0}
            max={100}
            className="w-16 px-2 py-1 bg-transparent border-b border-studio-surface/50 text-brand-primary text-sm outline-hidden"
          />
          <span className="text-sm text-studio-text-muted">%</span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={shuffleQuestions}
            onChange={(e) =>
              onUpdate({
                content: { ...content, shuffleQuestions: e.target.checked },
              })
            }
            className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
          />
          <span className="text-sm text-studio-text-muted">Shuffle</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showFeedback}
            onChange={(e) =>
              onUpdate({
                content: { ...content, showFeedback: e.target.checked },
              })
            }
            className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
          />
          <span className="text-sm text-studio-text-muted">Feedback</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allowRetry}
            onChange={(e) =>
              onUpdate({
                content: { ...content, allowRetry: e.target.checked },
              })
            }
            className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
          />
          <span className="text-sm text-studio-text-muted">Allow Retry</span>
        </label>
      </div>

      {/* Add question dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-studio-text-muted">Add question:</span>
        <div className="flex gap-1 flex-wrap">
          {QUESTION_TYPES.slice(0, 5).map((type) => (
            <button
              type="button"
              key={type.value}
              onClick={() => addQuestion(type.value as QuestionType)}
              className="px-3 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-sm text-studio-text hover:border-studio-accent/50 hover:text-brand-primary transition-colors"
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <button
            type="button"
            onClick={() => addQuestion()}
            className="w-full p-8 text-center border-2 border-dashed border-studio-surface/50 rounded-lg cursor-pointer hover:border-studio-accent/50 transition-colors"
          >
            <Plus className="w-8 h-8 text-studio-text-muted mx-auto mb-2" aria-hidden="true" />
            <p className="text-studio-text-muted">Add your first question</p>
          </button>
        ) : (
          questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              isExpanded={editingQuestionId === question.id}
              onToggle={() =>
                setEditingQuestionId(editingQuestionId === question.id ? null : question.id)
              }
              onUpdate={(updates) => updateQuestion(question.id, updates)}
              onDelete={() => deleteQuestion(question.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Question editor component
 */
function QuestionEditor({
  question,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
}: {
  question: QuizQuestion;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
  onDelete: () => void;
}): React.JSX.Element {
  const questionType = QUESTION_TYPES.find((t) => t.value === question.type);

  return (
    <div
      className={`
      p-4 rounded-lg border transition-colors
      ${isExpanded ? 'bg-studio-bg border-studio-accent/30' : 'bg-studio-bg border-studio-surface/30'}
    `}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <GripVertical className="w-4 h-4 text-studio-text-muted cursor-grab" />
        <span className="w-6 h-6 rounded-full bg-studio-surface flex items-center justify-center text-xs text-studio-text-muted">
          {index + 1}
        </span>
        <span className="text-xs px-2 py-0.5 bg-studio-surface/50 rounded text-studio-text-muted">
          {questionType?.label}
        </span>
        <input
          type="text"
          value={question.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          className="flex-1 bg-transparent text-brand-primary outline-hidden"
          placeholder="Question text..."
        />
        <button
          type="button"
          onClick={onToggle}
          className={`p-1 rounded transition-colors ${isExpanded ? 'text-studio-accent' : 'text-studio-text-muted hover:text-brand-primary'}`}
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-studio-text-muted hover:text-brand-error transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded editor */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-studio-surface/30 space-y-4">
          {/* Options editor for multiple choice */}
          {(question.type === 'multiple-choice' || question.type === 'multiple-select') && (
            <div className="space-y-2">
              <span className="block text-sm text-studio-text-muted">Options</span>
              {(question.options || []).map((option, optIndex) => (
                <div key={option.id} className="flex items-center gap-2">
                  <input
                    type={question.type === 'multiple-select' ? 'checkbox' : 'radio'}
                    checked={option.isCorrect}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      if (question.type === 'multiple-choice') {
                        newOptions.forEach((o) => {
                          o.isCorrect = false;
                        });
                      }
                      newOptions[optIndex].isCorrect = e.target.checked;
                      onUpdate({
                        options: newOptions,
                        correctAnswer: e.target.checked ? option.id : question.correctAnswer,
                      });
                    }}
                    className="w-4 h-4"
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[optIndex].text = e.target.value;
                      onUpdate({ options: newOptions });
                    }}
                    className="flex-1 px-3 py-1.5 bg-studio-bg-dark border border-studio-surface/50 rounded text-brand-primary text-sm"
                    placeholder={`Option ${optIndex + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== optIndex);
                      onUpdate({ options: newOptions });
                    }}
                    className="p-1 text-studio-text-muted hover:text-brand-error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newOptions = [
                    ...(question.options || []),
                    { id: `opt-${Date.now()}`, text: '', isCorrect: false },
                  ];
                  onUpdate({ options: newOptions });
                }}
                className="flex items-center gap-1 text-sm text-studio-accent hover:text-studio-accent-hover"
              >
                <Plus className="w-4 h-4" />
                Add Option
              </button>
            </div>
          )}

          {/* True/False correct answer */}
          {question.type === 'true-false' && (
            <div className="flex items-center gap-4">
              <label className="text-sm text-studio-text-muted flex items-center gap-4">
                <span>Correct answer:</span>
                <select
                  value={question.correctAnswer}
                  onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
                  className="px-3 py-1.5 bg-studio-bg-dark border border-studio-surface/50 rounded text-brand-primary text-sm"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </label>
            </div>
          )}

          {/* Short answer / Fill blank correct answer */}
          {(question.type === 'short-answer' || question.type === 'fill-blank') && (
            <label className="block">
              <span className="block text-sm text-studio-text-muted mb-1">Correct answer</span>
              <input
                type="text"
                value={question.correctAnswer || ''}
                onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
                className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded text-brand-primary text-sm"
                placeholder="Correct answer..."
              />
            </label>
          )}

          {/* Points */}
          <label className="flex items-center gap-4">
            <span className="text-sm text-studio-text-muted">Points:</span>
            <input
              type="number"
              value={question.points || 1}
              onChange={(e) => onUpdate({ points: parseInt(e.target.value, 10) })}
              min={1}
              className="w-20 px-3 py-1.5 bg-studio-bg-dark border border-studio-surface/50 rounded text-brand-primary text-sm"
            />
          </label>

          {/* Feedback */}
          <fieldset className="space-y-2">
            <legend className="block text-sm text-studio-text-muted">Feedback (optional)</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="sr-only" htmlFor={`feedback-correct-${question.id}`}>
                Correct feedback
              </label>
              <input
                id={`feedback-correct-${question.id}`}
                type="text"
                value={question.feedback?.correct || ''}
                onChange={(e) =>
                  onUpdate({
                    feedback: { ...question.feedback, correct: e.target.value },
                  })
                }
                className="px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded text-brand-primary text-sm"
                placeholder="Correct feedback..."
              />
              <label className="sr-only" htmlFor={`feedback-incorrect-${question.id}`}>
                Incorrect feedback
              </label>
              <input
                id={`feedback-incorrect-${question.id}`}
                type="text"
                value={question.feedback?.incorrect || ''}
                onChange={(e) =>
                  onUpdate({
                    feedback: {
                      ...question.feedback,
                      incorrect: e.target.value,
                    },
                  })
                }
                className="px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded text-brand-primary text-sm"
                placeholder="Incorrect feedback..."
              />
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}

export default QuizBlock;
