/**
 * Feedback System Types - Phase 8
 * Comprehensive feedback types for assessment, guidance, and progress tracking
 */

// =============================================================================
// FEEDBACK TYPES & CATEGORIES
// =============================================================================

/**
 * Primary feedback type categories
 */
export type FeedbackType =
  | 'assessment' // Quiz/test feedback
  | 'guidance' // Hints, tips, suggestions
  | 'progress' // Completion, milestones
  | 'system' // Errors, warnings, info
  | 'celebration' // Achievements, streaks
  | 'encouragement' // Motivational messages
  | 'correction'; // Error correction, misconception fixes

/**
 * Feedback display modes
 */
export type FeedbackDisplayMode =
  | 'toast' // Transient notification
  | 'inline' // Embedded in content
  | 'modal' // Dialog overlay
  | 'panel' // Side panel
  | 'banner' // Top/bottom banner
  | 'tooltip' // Hover/focus tooltip
  | 'audio'; // Audio-only feedback

/**
 * Feedback sentiment/tone
 */
export type FeedbackSentiment = 'positive' | 'neutral' | 'negative' | 'warning';

/**
 * Feedback priority levels
 */
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Feedback timing options
 */
export type FeedbackTiming =
  | 'immediate' // Show right away
  | 'delayed' // Show after delay
  | 'on-complete' // Show when action completes
  | 'on-error' // Show only on error
  | 'scheduled'; // Show at specific time

// =============================================================================
// CORE FEEDBACK INTERFACES
// =============================================================================

/**
 * Base feedback message structure
 */
export interface FeedbackMessage {
  /** Unique identifier */
  id: string;
  /** Feedback type category */
  type: FeedbackType;
  /** Display mode */
  displayMode: FeedbackDisplayMode;
  /** Sentiment/tone */
  sentiment: FeedbackSentiment;
  /** Priority level */
  priority: FeedbackPriority;
  /** Primary message text */
  message: string;
  /** Optional detailed explanation */
  details?: string;
  /** Optional title/header */
  title?: string;
  /** Duration to show (ms), 0 = persistent */
  duration: number;
  /** Whether user can dismiss */
  dismissible: boolean;
  /** Optional action buttons */
  actions?: FeedbackActionButton[];
  /** Custom icon name */
  icon?: string;
  /** Timestamp */
  timestamp: string;
  /** Source block/component ID */
  sourceId?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Action button for feedback messages
 */
export interface FeedbackActionButton {
  /** Action ID */
  id: string;
  /** Button label */
  label: string;
  /** Action type */
  actionType: 'dismiss' | 'retry' | 'skip' | 'navigate' | 'custom';
  /** For navigate actions - target URL/route */
  target?: string;
  /** Custom handler name */
  handler?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  /** Is this the primary action? */
  primary?: boolean;
}

// =============================================================================
// ASSESSMENT FEEDBACK
// =============================================================================

/**
 * Assessment-specific feedback for quiz/test results
 */
export interface AssessmentFeedback extends FeedbackMessage {
  type: 'assessment';
  /** Was answer correct? */
  isCorrect: boolean;
  /** Score achieved (0-1 scale) */
  score: number;
  /** Max possible score */
  maxScore: number;
  /** Attempt number */
  attemptNumber: number;
  /** Max attempts allowed */
  maxAttempts: number;
  /** Can retry? */
  canRetry: boolean;
  /** Correct answer text (if revealing) */
  correctAnswer?: string;
  /** User's response */
  userResponse: string | string[];
  /** Choice-specific feedback */
  choiceFeedback?: ChoiceFeedback[];
  /** Time taken (seconds) */
  timeTaken?: number;
  /** Points earned */
  pointsEarned: number;
  /** Bonus points (speed, streaks) */
  bonusPoints?: number;
  /** Explanation for correct answer */
  explanation?: string;
  /** Related learning objectives */
  learningObjectives?: string[];
  /** Suggested next actions */
  nextSteps?: string[];
}

/**
 * Per-choice feedback for MC questions
 */
export interface ChoiceFeedback {
  /** Choice ID */
  choiceId: string;
  /** Was this choice selected? */
  selected: boolean;
  /** Is this choice correct? */
  correct: boolean;
  /** Feedback text for this choice */
  feedback?: string;
}

/**
 * Assessment result state
 */
export type AssessmentResultState =
  | 'correct'
  | 'incorrect'
  | 'partial'
  | 'unanswered'
  | 'skipped'
  | 'timeout';

// =============================================================================
// GUIDANCE FEEDBACK
// =============================================================================

/**
 * Guidance/hint feedback
 */
export interface GuidanceFeedback extends FeedbackMessage {
  type: 'guidance';
  /** Guidance subtype */
  guidanceType: 'hint' | 'tip' | 'suggestion' | 'example' | 'warning' | 'reminder';
  /** Hint level (1 = subtle, 5 = explicit) */
  hintLevel?: number;
  /** Cost to view hint (points) */
  hintCost?: number;
  /** Related content references */
  relatedContent?: ContentReference[];
  /** Prerequisite concepts */
  prerequisites?: string[];
}

/**
 * Reference to related content
 */
export interface ContentReference {
  /** Reference type */
  type: 'lesson' | 'block' | 'resource' | 'external';
  /** Reference ID */
  id: string;
  /** Display title */
  title: string;
  /** URL if external */
  url?: string;
}

// =============================================================================
// PROGRESS FEEDBACK
// =============================================================================

/**
 * Progress/completion feedback
 */
export interface ProgressFeedback extends FeedbackMessage {
  type: 'progress';
  /** Progress subtype */
  progressType: 'milestone' | 'completion' | 'checkpoint' | 'streak' | 'level-up' | 'unlock';
  /** Current progress (0-1) */
  progress: number;
  /** Progress label */
  progressLabel?: string;
  /** Items completed */
  itemsCompleted: number;
  /** Total items */
  totalItems: number;
  /** Time spent (seconds) */
  timeSpent?: number;
  /** Estimated remaining (seconds) */
  estimatedRemaining?: number;
  /** Badges earned */
  badgesEarned?: Badge[];
  /** Points earned */
  pointsEarned?: number;
  /** XP gained */
  xpGained?: number;
  /** New level reached */
  newLevel?: number;
  /** Unlocked content */
  unlockedContent?: string[];
}

/**
 * Badge/achievement
 */
export interface Badge {
  /** Badge ID */
  id: string;
  /** Badge name */
  name: string;
  /** Badge description */
  description: string;
  /** Badge icon */
  icon: string;
  /** Rarity */
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  /** Date earned */
  earnedAt: string;
}

// =============================================================================
// SYSTEM FEEDBACK
// =============================================================================

/**
 * System-level feedback (errors, warnings, info)
 */
export interface SystemFeedback extends FeedbackMessage {
  type: 'system';
  /** System feedback subtype */
  systemType: 'error' | 'warning' | 'info' | 'success' | 'loading';
  /** Error code if applicable */
  errorCode?: string;
  /** Technical details (for debugging) */
  technicalDetails?: string;
  /** Recovery suggestion */
  recoverySuggestion?: string;
  /** Retry information */
  retryInfo?: {
    canRetry: boolean;
    retryAfter?: number;
    maxRetries?: number;
    retriesLeft?: number;
  };
}

// =============================================================================
// CELEBRATION FEEDBACK
// =============================================================================

/**
 * Celebration/achievement feedback
 */
export interface CelebrationFeedback extends FeedbackMessage {
  type: 'celebration';
  /** Celebration subtype */
  celebrationType:
    | 'achievement'
    | 'streak'
    | 'perfect-score'
    | 'first-try'
    | 'speed-bonus'
    | 'completion';
  /** Celebration intensity (1-5) */
  intensity: number;
  /** Show confetti animation? */
  showConfetti?: boolean;
  /** Play sound? */
  playSound?: boolean;
  /** Sound to play */
  soundId?: string;
  /** Achievement details */
  achievement?: Achievement;
  /** Streak count */
  streakCount?: number;
}

/**
 * Achievement definition
 */
export interface Achievement {
  /** Achievement ID */
  id: string;
  /** Achievement name */
  name: string;
  /** Description */
  description: string;
  /** Icon */
  icon: string;
  /** Category */
  category: 'learning' | 'engagement' | 'mastery' | 'social' | 'exploration';
  /** Points value */
  points: number;
  /** Is secret/hidden? */
  isSecret?: boolean;
}

// =============================================================================
// ENCOURAGEMENT FEEDBACK
// =============================================================================

/**
 * Encouragement/motivational feedback
 */
export interface EncouragementFeedback extends FeedbackMessage {
  type: 'encouragement';
  /** Encouragement subtype */
  encouragementType: 'keep-going' | 'almost-there' | 'great-effort' | 'comeback' | 'persistence';
  /** Personalization level */
  personalized: boolean;
  /** Learner name (for personalization) */
  learnerName?: string;
  /** Progress context */
  progressContext?: {
    attemptsOnQuestion: number;
    questionsCompleted: number;
    currentStreak: number;
    bestStreak: number;
  };
}

// =============================================================================
// FEEDBACK QUEUE & STATE
// =============================================================================

/**
 * Feedback queue item with scheduling info
 */
export interface QueuedFeedback {
  /** Feedback message */
  feedback: FeedbackMessage;
  /** Queue position */
  position: number;
  /** Scheduled time */
  scheduledAt?: string;
  /** Delay before showing (ms) */
  delay: number;
  /** Is currently showing? */
  isActive: boolean;
  /** Has been dismissed? */
  isDismissed: boolean;
}

/**
 * Feedback state for context/reducer
 */
export interface FeedbackState {
  /** Active feedback messages */
  activeMessages: FeedbackMessage[];
  /** Queued messages waiting to show */
  queue: QueuedFeedback[];
  /** History of shown messages */
  history: FeedbackMessage[];
  /** Global feedback settings */
  settings: FeedbackSettings;
  /** Is sound enabled? */
  soundEnabled: boolean;
  /** Is currently showing a modal? */
  isModalActive: boolean;
  /** Current toast stack */
  toastStack: FeedbackMessage[];
  /** Max toasts to show at once */
  maxToasts: number;
}

/**
 * Feedback settings
 */
export interface FeedbackSettings {
  /** Enable all feedback */
  enabled: boolean;
  /** Enable audio feedback */
  audioEnabled: boolean;
  /** Audio volume (0-1) */
  audioVolume: number;
  /** Enable haptic feedback */
  hapticEnabled: boolean;
  /** Enable celebration effects */
  celebrationEffects: boolean;
  /** Toast position */
  toastPosition:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center';
  /** Default toast duration (ms) */
  defaultToastDuration: number;
  /** Reduce motion for accessibility */
  reduceMotion: boolean;
  /** Screen reader announcements */
  screenReaderAnnouncements: boolean;
  /** Auto-dismiss behavior */
  autoDismiss: boolean;
  /** Stack toasts or replace */
  stackToasts: boolean;
}

// =============================================================================
// FEEDBACK REDUCER ACTIONS
// =============================================================================

/**
 * Feedback reducer action types
 */
export type FeedbackReducerAction =
  | { type: 'SHOW_FEEDBACK'; payload: FeedbackMessage }
  | { type: 'DISMISS_FEEDBACK'; payload: { id: string } }
  | { type: 'DISMISS_ALL'; payload?: { type?: FeedbackType } }
  | { type: 'QUEUE_FEEDBACK'; payload: { feedback: FeedbackMessage; delay: number } }
  | { type: 'DEQUEUE_FEEDBACK'; payload: { id: string } }
  | { type: 'PROCESS_QUEUE' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<FeedbackSettings> }
  | { type: 'TOGGLE_SOUND'; payload: boolean }
  | { type: 'SET_MODAL_ACTIVE'; payload: boolean }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'ADD_TO_HISTORY'; payload: FeedbackMessage };

// =============================================================================
// FEEDBACK TEMPLATES
// =============================================================================

/**
 * Predefined feedback templates
 */
export interface FeedbackTemplate {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Base feedback configuration */
  base: Partial<FeedbackMessage>;
  /** Variations by sentiment */
  variations?: {
    positive?: Partial<FeedbackMessage>;
    negative?: Partial<FeedbackMessage>;
    neutral?: Partial<FeedbackMessage>;
  };
  /** Dynamic message templates */
  messageTemplates?: {
    [key: string]: string; // Supports {{variable}} interpolation
  };
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

/**
 * Default feedback settings
 */
export const DEFAULT_FEEDBACK_SETTINGS: FeedbackSettings = {
  enabled: true,
  audioEnabled: true,
  audioVolume: 0.5,
  hapticEnabled: true,
  celebrationEffects: true,
  toastPosition: 'bottom-right',
  defaultToastDuration: 5000,
  reduceMotion: false,
  screenReaderAnnouncements: true,
  autoDismiss: true,
  stackToasts: true,
};

/**
 * Default feedback state
 */
export const DEFAULT_FEEDBACK_STATE: FeedbackState = {
  activeMessages: [],
  queue: [],
  history: [],
  settings: DEFAULT_FEEDBACK_SETTINGS,
  soundEnabled: true,
  isModalActive: false,
  toastStack: [],
  maxToasts: 3,
};

// =============================================================================
// FEEDBACK SOUND TYPES
// =============================================================================

/**
 * Sound effect identifiers
 */
export type FeedbackSoundId =
  | 'correct'
  | 'incorrect'
  | 'partial'
  | 'complete'
  | 'achievement'
  | 'level-up'
  | 'streak'
  | 'notification'
  | 'error'
  | 'warning'
  | 'success'
  | 'click'
  | 'pop'
  | 'whoosh';

/**
 * Sound configuration
 */
export interface FeedbackSound {
  id: FeedbackSoundId;
  src: string;
  volume: number;
  preload: boolean;
}

// =============================================================================
// FEEDBACK ANIMATION TYPES
// =============================================================================

/**
 * Animation configuration for feedback
 */
export interface FeedbackAnimation {
  /** Animation type */
  type: 'fade' | 'slide' | 'scale' | 'bounce' | 'shake' | 'confetti' | 'pulse';
  /** Duration (ms) */
  duration: number;
  /** Easing function */
  easing: string;
  /** Delay before animation (ms) */
  delay?: number;
  /** Animation direction */
  direction?: 'up' | 'down' | 'left' | 'right';
}

/**
 * Default animations by feedback type
 */
export const DEFAULT_FEEDBACK_ANIMATIONS: Record<FeedbackDisplayMode, FeedbackAnimation> = {
  toast: { type: 'slide', duration: 300, easing: 'ease-out', direction: 'up' },
  inline: { type: 'fade', duration: 200, easing: 'ease-in-out' },
  modal: { type: 'scale', duration: 250, easing: 'ease-out' },
  panel: { type: 'slide', duration: 300, easing: 'ease-out', direction: 'right' },
  banner: { type: 'slide', duration: 300, easing: 'ease-out', direction: 'down' },
  tooltip: { type: 'fade', duration: 150, easing: 'ease-in-out' },
  audio: { type: 'fade', duration: 0, easing: 'linear' },
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Create feedback message helper type
 */
export type CreateFeedbackPayload<T extends FeedbackType> = T extends 'assessment'
  ? Omit<AssessmentFeedback, 'id' | 'timestamp'>
  : T extends 'guidance'
    ? Omit<GuidanceFeedback, 'id' | 'timestamp'>
    : T extends 'progress'
      ? Omit<ProgressFeedback, 'id' | 'timestamp'>
      : T extends 'system'
        ? Omit<SystemFeedback, 'id' | 'timestamp'>
        : T extends 'celebration'
          ? Omit<CelebrationFeedback, 'id' | 'timestamp'>
          : T extends 'encouragement'
            ? Omit<EncouragementFeedback, 'id' | 'timestamp'>
            : Omit<FeedbackMessage, 'id' | 'timestamp'>;

/**
 * Feedback listener callback type
 */
export type FeedbackListener = (feedback: FeedbackMessage) => void;

/**
 * Feedback filter function type
 */
export type FeedbackFilter = (feedback: FeedbackMessage) => boolean;
