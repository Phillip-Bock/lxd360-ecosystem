// QuizBlock Types

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  points: number;
  explanation?: string;
  required?: boolean;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: MultipleChoiceOption[];
  allowMultiple?: boolean;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer: boolean;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  blanks: BlankSlot[];
  textWithBlanks: string; // Text with {{blank_id}} placeholders
}

export interface BlankSlot {
  id: string;
  correctAnswers: string[]; // Multiple acceptable answers
  caseSensitive?: boolean;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | FillBlankQuestion;

export interface QuizData {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  settings: QuizSettings;
}

export interface QuizSettings {
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showFeedback?: 'immediate' | 'on-submit' | 'never';
  allowRetry?: boolean;
  maxAttempts?: number;
  passingScore?: number;
  timeLimit?: number; // in seconds
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[] | boolean | Record<string, string>;
}

export interface QuizSubmission {
  quizId: string;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  passed: boolean;
  completedAt: Date;
  timeSpent: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, QuizAnswer['answer']>;
  isSubmitted: boolean;
  showResults: boolean;
  score?: number;
  startedAt?: Date;
}
