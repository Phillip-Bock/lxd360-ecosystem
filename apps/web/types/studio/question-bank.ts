/**
 * Question/Survey Bank Types - Phase 11
 * Defines data structures for question banks, pools, and randomization
 */

// =============================================================================
// CORE QUESTION TYPES
// =============================================================================

/**
 * Base question interface shared by all question types
 */
export interface BaseQuestion {
  /** Unique identifier for the question */
  id: string;
  /** Question text/prompt */
  text: string;
  /** Optional rich text/HTML content */
  richText?: string;
  /** Question type discriminator */
  type: QuestionType;
  /** Difficulty level (1-5) */
  difficulty?: 1 | 2 | 3 | 4 | 5;
  /** Points awarded for correct answer */
  points?: number;
  /** Tags for categorization and filtering */
  tags?: string[];
  /** Feedback shown after answering */
  feedback?: QuestionFeedback;
  /** Accessibility hints */
  a11yHint?: string;
  /** Media attachments */
  media?: QuestionMedia[];
  /** Custom metadata */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt?: string;
  /** Last update timestamp */
  updatedAt?: string;
}

export type QuestionType =
  | 'multiple-choice'
  | 'multiple-select'
  | 'true-false'
  | 'fill-in-blank'
  | 'short-answer'
  | 'essay'
  | 'matching'
  | 'ordering'
  | 'hotspot'
  | 'likert'
  | 'ranking'
  | 'slider';

// =============================================================================
// QUESTION TYPE VARIANTS
// =============================================================================

/**
 * Multiple Choice Question (single correct answer)
 */
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  choices: QuestionChoice[];
  /** ID of the correct choice */
  correctChoiceId: string;
  /** Randomize choice order during delivery */
  shuffleChoices?: boolean;
}

/**
 * Multiple Select Question (multiple correct answers)
 */
export interface MultipleSelectQuestion extends BaseQuestion {
  type: 'multiple-select';
  choices: QuestionChoice[];
  /** IDs of all correct choices */
  correctChoiceIds: string[];
  /** Minimum selections required */
  minSelections?: number;
  /** Maximum selections allowed */
  maxSelections?: number;
  /** Randomize choice order */
  shuffleChoices?: boolean;
  /** Scoring mode for partial credit */
  scoringMode?: 'all-or-nothing' | 'partial' | 'weighted';
}

/**
 * True/False Question
 */
export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer: boolean;
}

/**
 * Fill in the Blank Question
 */
export interface FillInBlankQuestion extends BaseQuestion {
  type: 'fill-in-blank';
  /** Text with blanks marked as {{blank_id}} */
  templateText: string;
  blanks: BlankDefinition[];
  /** Case sensitivity for text matching */
  caseSensitive?: boolean;
}

/**
 * Short Answer Question
 */
export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short-answer';
  /** Accepted answers (any match is correct) */
  acceptedAnswers: string[];
  /** Case sensitivity */
  caseSensitive?: boolean;
  /** Use fuzzy matching */
  fuzzyMatch?: boolean;
  /** Max character length */
  maxLength?: number;
}

/**
 * Essay Question (manually graded or AI-assisted)
 */
export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  /** Minimum word count */
  minWords?: number;
  /** Maximum word count */
  maxWords?: number;
  /** Rubric for grading */
  rubric?: RubricItem[];
  /** Enable AI-assisted grading hints */
  aiAssist?: boolean;
}

/**
 * Matching Question (match items from two columns)
 */
export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  leftItems: MatchItem[];
  rightItems: MatchItem[];
  /** Correct pairings: leftId -> rightId */
  correctPairs: Record<string, string>;
  /** Allow one-to-many matching */
  allowMultipleMatches?: boolean;
}

/**
 * Ordering/Sequencing Question
 */
export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  items: OrderItem[];
  /** Correct order (array of item IDs) */
  correctOrder: string[];
  /** Scoring mode */
  scoringMode?: 'exact' | 'partial-adjacent' | 'partial-position';
}

/**
 * Hotspot Question (click on image areas)
 */
export interface HotspotQuestion extends BaseQuestion {
  type: 'hotspot';
  /** Background image URL */
  imageUrl: string;
  /** Image dimensions */
  imageDimensions: { width: number; height: number };
  /** Defined hotspot areas */
  hotspots: HotspotArea[];
  /** IDs of correct hotspots */
  correctHotspotIds: string[];
  /** Allow multiple selections */
  multiSelect?: boolean;
}

/**
 * Likert Scale Question (survey-style)
 */
export interface LikertQuestion extends BaseQuestion {
  type: 'likert';
  /** Scale options (e.g., Strongly Disagree to Strongly Agree) */
  scale: LikertOption[];
  /** No correct answer for surveys */
  isSurvey: true;
}

/**
 * Ranking Question (order items by preference)
 */
export interface RankingQuestion extends BaseQuestion {
  type: 'ranking';
  items: RankItem[];
  /** Expected ranking for quiz mode, undefined for survey */
  expectedRanking?: string[];
  /** Survey mode (no correct answer) */
  isSurvey?: boolean;
}

/**
 * Slider Question (numeric range)
 */
export interface SliderQuestion extends BaseQuestion {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
  /** Correct value for quiz mode */
  correctValue?: number;
  /** Acceptable range around correct value */
  tolerance?: number;
  /** Survey mode */
  isSurvey?: boolean;
  /** Unit label (e.g., "%", "years") */
  unit?: string;
}

/**
 * Union type of all question variants
 */
export type Question =
  | MultipleChoiceQuestion
  | MultipleSelectQuestion
  | TrueFalseQuestion
  | FillInBlankQuestion
  | ShortAnswerQuestion
  | EssayQuestion
  | MatchingQuestion
  | OrderingQuestion
  | HotspotQuestion
  | LikertQuestion
  | RankingQuestion
  | SliderQuestion;

// =============================================================================
// SUPPORTING TYPES
// =============================================================================

export interface QuestionChoice {
  id: string;
  text: string;
  richText?: string;
  imageUrl?: string;
  /** Feedback specific to this choice */
  feedback?: string;
}

export interface BlankDefinition {
  id: string;
  /** Accepted answers for this blank */
  acceptedAnswers: string[];
  /** Placeholder text shown in blank */
  placeholder?: string;
}

export interface MatchItem {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface OrderItem {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface HotspotArea {
  id: string;
  /** Shape type */
  shape: 'rect' | 'circle' | 'polygon';
  /** Coordinates based on shape */
  coords: number[];
  /** Label for accessibility */
  label: string;
}

export interface LikertOption {
  value: number;
  label: string;
}

export interface RankItem {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface RubricItem {
  criterion: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  label: string;
  description: string;
  points: number;
}

export interface QuestionFeedback {
  correct?: string;
  incorrect?: string;
  partial?: string;
  /** Per-attempt feedback */
  attempts?: Record<number, string>;
}

export interface QuestionMedia {
  type: 'image' | 'video' | 'audio';
  url: string;
  alt?: string;
  caption?: string;
}

// =============================================================================
// QUESTION BANK
// =============================================================================

/**
 * Question Bank - A collection of questions organized by topic/category
 */
export interface QuestionBank {
  /** Unique identifier */
  id: string;
  /** Bank name */
  name: string;
  /** Description */
  description?: string;
  /** Questions in this bank */
  questions: Question[];
  /** Categories/folders within the bank */
  categories?: BankCategory[];
  /** Bank-level tags */
  tags?: string[];
  /** Bank type */
  bankType: 'quiz' | 'survey' | 'mixed';
  /** Default settings for questions */
  defaults?: QuestionDefaults;
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt: string;
  /** Last update */
  updatedAt: string;
  /** Owner/creator ID */
  ownerId?: string;
  /** Sharing settings */
  sharing?: SharingSettings;
}

export interface BankCategory {
  id: string;
  name: string;
  parentId?: string;
  questionIds: string[];
  color?: string;
  icon?: string;
}

export interface QuestionDefaults {
  points?: number;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  shuffleChoices?: boolean;
  showFeedback?: boolean;
  allowRetry?: boolean;
  maxAttempts?: number;
}

export interface SharingSettings {
  isPublic: boolean;
  sharedWith?: string[];
  allowCopy?: boolean;
  allowModify?: boolean;
}

// =============================================================================
// QUESTION POOL
// =============================================================================

/**
 * Question Pool - Configuration for drawing questions from banks
 */
export interface QuestionPool {
  /** Unique identifier */
  id: string;
  /** Pool name */
  name: string;
  /** Description */
  description?: string;
  /** Source banks to draw from */
  sources: PoolSource[];
  /** Total questions to draw */
  drawCount: number;
  /** Selection strategy */
  selectionStrategy: SelectionStrategy;
  /** Randomization settings */
  randomization: RandomizationSettings;
  /** Presentation settings */
  presentation: PresentationSettings;
  /** Scoring settings */
  scoring: ScoringSettings;
}

export interface PoolSource {
  /** Bank ID to draw from */
  bankId: string;
  /** Specific category IDs (empty = all) */
  categoryIds?: string[];
  /** Filter by tags */
  tags?: string[];
  /** Filter by difficulty range */
  difficultyRange?: { min: 1 | 2 | 3 | 4 | 5; max: 1 | 2 | 3 | 4 | 5 };
  /** Filter by question types */
  questionTypes?: QuestionType[];
  /** Weight for this source (for weighted random) */
  weight?: number;
  /** Maximum questions from this source */
  maxFromSource?: number;
}

export type SelectionStrategy =
  | 'random'
  | 'weighted-random'
  | 'sequential'
  | 'adaptive'
  | 'spaced-repetition';

export interface RandomizationSettings {
  /** Enable question order randomization */
  shuffleQuestions: boolean;
  /** Enable choice order randomization */
  shuffleChoices: boolean;
  /** Seed for reproducible randomization */
  seed?: number;
  /** Lock seed per learner */
  lockSeedPerLearner?: boolean;
}

export interface PresentationSettings {
  /** Show one question at a time */
  oneAtATime: boolean;
  /** Allow navigation between questions */
  allowNavigation: boolean;
  /** Show question numbers */
  showNumbers: boolean;
  /** Show progress indicator */
  showProgress: boolean;
  /** Time limit per question (seconds) */
  timePerQuestion?: number;
  /** Total time limit (seconds) */
  totalTimeLimit?: number;
  /** Show timer */
  showTimer?: boolean;
}

export interface ScoringSettings {
  /** Total points available */
  totalPoints?: number;
  /** Passing score percentage */
  passingScore?: number;
  /** Show score immediately */
  showScoreImmediately: boolean;
  /** Show correct answers after completion */
  showCorrectAnswers: boolean;
  /** When to show correct answers */
  showCorrectAnswersAfter?: 'each-question' | 'completion' | 'review';
  /** Penalty for incorrect answers */
  incorrectPenalty?: number;
  /** Allow partial credit */
  allowPartialCredit: boolean;
}

// =============================================================================
// LEARNER RESPONSE & RESULTS
// =============================================================================

/**
 * Response to a single question
 */
export interface QuestionResponse {
  questionId: string;
  /** Response value (type depends on question type) */
  response: unknown;
  /** Whether the response is correct */
  isCorrect?: boolean;
  /** Partial score (0-1) */
  score?: number;
  /** Points earned */
  pointsEarned?: number;
  /** Time spent on question (ms) */
  duration?: number;
  /** Attempt number */
  attemptNumber: number;
  /** Timestamp */
  timestamp: string;
}

/**
 * Results for a completed pool/quiz
 */
export interface PoolResults {
  poolId: string;
  learnerId: string;
  /** Questions that were drawn */
  drawnQuestionIds: string[];
  /** Responses to each question */
  responses: QuestionResponse[];
  /** Overall score */
  totalScore: number;
  /** Maximum possible score */
  maxScore: number;
  /** Percentage score */
  percentage: number;
  /** Pass/fail status */
  passed: boolean;
  /** Total time spent (ms) */
  totalDuration: number;
  /** Start timestamp */
  startedAt: string;
  /** Completion timestamp */
  completedAt: string;
  /** Number of attempts on this pool */
  attemptNumber: number;
}

// =============================================================================
// ADAPTIVE LEARNING TYPES
// =============================================================================

/**
 * Learner mastery tracking for adaptive selection
 */
export interface LearnerMastery {
  learnerId: string;
  /** Mastery by tag/topic */
  tagMastery: Record<string, MasteryLevel>;
  /** Mastery by question type */
  typeMastery: Record<QuestionType, MasteryLevel>;
  /** Recently answered questions */
  recentQuestions: string[];
  /** Questions that need review (spaced repetition) */
  reviewQueue: ReviewItem[];
}

export interface MasteryLevel {
  /** 0-1 mastery score */
  score: number;
  /** Total attempts */
  attempts: number;
  /** Correct attempts */
  correct: number;
  /** Last attempt timestamp */
  lastAttempt?: string;
}

export interface ReviewItem {
  questionId: string;
  /** Next review date */
  nextReview: string;
  /** Current interval (days) */
  interval: number;
  /** Ease factor */
  easeFactor: number;
}

// =============================================================================
// DRAW RESULT
// =============================================================================

/**
 * Result of drawing questions from a pool
 */
export interface DrawResult {
  /** Drawn questions in order */
  questions: Question[];
  /** Seed used for randomization */
  seed: number;
  /** Source information for each question */
  sourceMap: Record<string, { bankId: string; categoryId?: string }>;
  /** Draw timestamp */
  timestamp: string;
}

// =============================================================================
// BANK OPERATIONS
// =============================================================================

/**
 * Options for importing questions
 */
export interface ImportOptions {
  /** Source format */
  format: 'qti' | 'gift' | 'aiken' | 'json' | 'csv';
  /** Merge with existing or replace */
  mode: 'merge' | 'replace';
  /** Default values for imported questions */
  defaults?: Partial<BaseQuestion>;
}

/**
 * Options for exporting questions
 */
export interface ExportOptions {
  /** Target format */
  format: 'qti' | 'gift' | 'json' | 'csv';
  /** Include metadata */
  includeMetadata?: boolean;
  /** Question IDs to export (empty = all) */
  questionIds?: string[];
}

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Statistics for a question
 */
export interface QuestionStats {
  questionId: string;
  /** Total times answered */
  totalAttempts: number;
  /** Correct answer rate */
  correctRate: number;
  /** Average time to answer (ms) */
  averageTime: number;
  /** Discrimination index */
  discriminationIndex?: number;
  /** Difficulty index (empirical) */
  difficultyIndex?: number;
  /** Per-choice statistics */
  choiceStats?: Record<string, { selected: number; percentage: number }>;
}

/**
 * Statistics for a bank
 */
export interface BankStats {
  bankId: string;
  totalQuestions: number;
  questionsByType: Record<QuestionType, number>;
  questionsByDifficulty: Record<number, number>;
  averageCorrectRate: number;
  totalAttempts: number;
}
