/**
 * Quiz and assessment type definitions
 */

export type QuestionType =
  | 'multiple-choice'
  | 'multiple-select'
  | 'true-false'
  | 'fill-blank'
  | 'matching'
  | 'ordering'
  | 'short-answer'
  | 'essay'
  | 'hotspot'
  | 'likert'
  | 'numeric'
  | 'file-upload'
  | 'audio-response'
  | 'video-response'
  | 'simulation';

export type AssessmentType =
  | 'quiz'
  | 'exam'
  | 'survey'
  | 'self-assessment'
  | 'diagnostic'
  | 'practice'
  | 'certification';

export type GradingMethod = 'highest' | 'latest' | 'average' | 'first';

export interface Quiz {
  id: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description?: string;
  instructions?: string;
  type: AssessmentType;
  questions: Question[];
  // Settings
  timeLimit?: number; // minutes
  attempts: number; // 0 = unlimited
  passingScore: number; // percentage
  gradingMethod: GradingMethod;
  showResults: 'immediately' | 'after-submission' | 'after-due-date' | 'never';
  showCorrectAnswers: boolean;
  showFeedback: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  questionsPerPage: number;
  allowBacktrack: boolean;
  requireSequential: boolean;
  // Scheduling
  availableFrom?: string;
  availableUntil?: string;
  // Gamification
  xpReward: number;
  badgeOnPass?: string;
  // Proctoring
  proctoringEnabled: boolean;
  webcamRequired: boolean;
  lockdownBrowser: boolean;
  // Adaptive
  isAdaptive: boolean;
  adaptiveSettings?: AdaptiveQuizSettings;
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AdaptiveQuizSettings {
  initialDifficulty: number; // 1-5
  difficultyAdjustment: number;
  minQuestions: number;
  maxQuestions: number;
  masteryThreshold: number;
  confidenceWeight: number;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  text: string;
  media?: QuestionMedia;
  options?: QuestionOption[];
  correctAnswer: unknown; // Varies by type
  explanation?: string;
  hint?: string;
  points: number;
  difficulty: number; // 1-5
  tags: string[];
  skillIds: string[];
  // For matching
  matchingPairs?: MatchingPair[];
  // For ordering
  correctOrder?: string[];
  // For fill-blank
  blanks?: FillBlank[];
  // For hotspot
  hotspots?: Hotspot[];
  // For likert
  likertOptions?: LikertOption[];
  // Time tracking
  timeLimit?: number; // seconds
  // Metadata
  order: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Question type alias for QuizQuestion
 * Used throughout the codebase for quiz/assessment questions
 */
export type Question = QuizQuestion;

export interface QuestionMedia {
  type: 'image' | 'video' | 'audio';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  media?: QuestionMedia;
  isCorrect: boolean;
  feedback?: string;
  order: number;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
  leftMedia?: QuestionMedia;
  rightMedia?: QuestionMedia;
}

export interface FillBlank {
  id: string;
  position: number;
  acceptedAnswers: string[];
  caseSensitive: boolean;
  exactMatch: boolean;
}

export interface Hotspot {
  id: string;
  shape: 'rectangle' | 'circle' | 'polygon';
  coordinates: number[];
  isCorrect: boolean;
  feedback?: string;
}

export interface LikertOption {
  value: number;
  label: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  learnerId: string;
  startedAt: string;
  completedAt?: string;
  timeSpent: number; // seconds
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  answers: QuestionAnswer[];
  status: 'in-progress' | 'completed' | 'abandoned' | 'timed-out';
  attemptNumber: number;
  // Proctoring
  violations?: ProctoringViolation[];
  webcamRecordingUrl?: string;
}

export interface QuestionAnswer {
  questionId: string;
  answer: unknown;
  isCorrect: boolean;
  score: number;
  timeSpent: number;
  confidenceLevel?: number; // 1-5
  attemptedAt: string;
  feedback?: string;
}

export interface ProctoringViolation {
  type: 'tab-switch' | 'copy-paste' | 'face-not-visible' | 'multiple-faces' | 'audio-detected';
  timestamp: string;
  details?: string;
}

export interface QuizResults {
  quizId: string;
  quizTitle: string;
  attempt: QuizAttempt;
  summary: {
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedQuestions: number;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
    averageTimePerQuestion: number;
  };
  questionResults: {
    question: Question;
    answer: QuestionAnswer;
    isCorrect: boolean;
    explanation?: string;
  }[];
  skillsAssessed: {
    skillId: string;
    skillName: string;
    score: number;
    level: string;
  }[];
  recommendations?: string[];
  xpEarned: number;
  badgesEarned: string[];
}

export interface QuizBank {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  tags: string[];
  courseIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
