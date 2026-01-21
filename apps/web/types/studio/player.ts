import type { BlockInstance } from '@/types/blocks';
import type { LayerState } from './layers';
import type { ObjectStateConfig } from './states';
import type { TimelineState, TimeMs } from './timeline';
import type { Trigger, TriggerAction } from './triggers';

// =============================================================================
// PLAYER MODE
// =============================================================================

/**
 * Player operating mode.
 * - preview: Author preview mode with debug overlays
 * - player: Learner-facing playback mode
 * - scorm: SCORM/LMS-embedded mode
 * - standalone: Self-contained standalone mode
 */
export type PlayerMode = 'preview' | 'player' | 'scorm' | 'standalone';

/**
 * Navigation mode for slide progression.
 */
export type NavigationMode = 'free' | 'linear' | 'restricted' | 'locked';

// =============================================================================
// SLIDE TYPES
// =============================================================================

/**
 * Slide definition for playback.
 */
export interface PlayerSlide {
  id: string;
  name: string;
  index: number;
  blocks: BlockInstance[];
  timeline?: TimelineState;
  triggers: Trigger[];
  objectStates: ObjectStateConfig[];
  layers: LayerState;
  duration?: TimeMs;
  autoAdvance?: boolean;
  autoAdvanceDelay?: TimeMs;
  navigationLocked?: boolean;
  requiredInteractions?: string[];
  completionCriteria?: SlideCompletionCriteria;
  transition?: SlideTransition;
  background?: SlideBackground;
  metadata?: SlideMetadata;
}

/**
 * Slide completion criteria.
 */
export interface SlideCompletionCriteria {
  type: 'view' | 'time' | 'interaction' | 'assessment' | 'custom';
  viewDuration?: TimeMs;
  requiredBlockIds?: string[];
  assessmentPassScore?: number;
  customExpression?: string;
}

/**
 * Slide transition animation.
 */
export interface SlideTransition {
  type: 'none' | 'fade' | 'slide' | 'zoom' | 'flip' | 'cube' | 'flow';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration: TimeMs;
  easing?: string;
}

/**
 * Slide background configuration.
 */
export interface SlideBackground {
  type: 'color' | 'gradient' | 'image' | 'video';
  value: string;
  opacity?: number;
  blur?: number;
  overlay?: string;
}

/**
 * Slide metadata.
 */
export interface SlideMetadata {
  title?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  estimatedDuration?: TimeMs;
}

// =============================================================================
// LESSON TYPES
// =============================================================================

/**
 * Complete lesson definition for playback.
 */
export interface PlayerLesson {
  id: string;
  title: string;
  description?: string;
  version?: string;
  slides: PlayerSlide[];
  globalTriggers: Trigger[];
  variables: LessonVariable[];
  settings: LessonSettings;
  metadata: LessonMetadata;
}

/**
 * Lesson variable definition.
 */
export interface LessonVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue: unknown;
  persist?: boolean;
  scope?: 'slide' | 'lesson' | 'session';
}

/**
 * Lesson settings.
 */
export interface LessonSettings {
  navigationMode: NavigationMode;
  allowRestart: boolean;
  allowReview: boolean;
  showProgress: boolean;
  showSlideNumbers: boolean;
  showTimer: boolean;
  autoSaveProgress: boolean;
  saveInterval?: TimeMs;
  passingScore?: number;
  maxAttempts?: number;
  timeLimit?: TimeMs;
  resumeFromBookmark: boolean;
  enableKeyboardNav: boolean;
  enableSwipeNav: boolean;
  enableWheelNav: boolean;
  theme?: string;
  locale?: string;
}

/**
 * Lesson metadata.
 */
export interface LessonMetadata {
  author?: string;
  organization?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  language?: string;
  duration?: TimeMs;
  keywords?: string[];
  learningObjectives?: string[];
  prerequisites?: string[];
  targetAudience?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// =============================================================================
// PLAYER STATE
// =============================================================================

/**
 * Player playback state.
 */
export type PlaybackState = 'idle' | 'playing' | 'paused' | 'ended' | 'loading' | 'error';

/**
 * Navigation target for slide navigation.
 */
export interface NavigationTarget {
  type: 'slide' | 'block' | 'layer' | 'bookmark';
  slideId?: string;
  slideIndex?: number;
  blockId?: string;
  layerId?: string;
  bookmarkId?: string;
}

/**
 * Navigation history entry.
 */
export interface NavigationHistoryEntry {
  slideId: string;
  slideIndex: number;
  timestamp: number;
  duration?: TimeMs;
}

/**
 * Complete player state.
 */
export interface PlayerState {
  // Mode & Status
  mode: PlayerMode;
  playbackState: PlaybackState;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Lesson & Slide
  lesson: PlayerLesson | null;
  currentSlideIndex: number;
  currentSlideId: string | null;
  previousSlideIndex: number | null;

  // Timeline
  timelineState: TimelinePlaybackState;

  // Navigation
  navigationHistory: NavigationHistoryEntry[];
  canNavigateNext: boolean;
  canNavigatePrev: boolean;
  visitedSlides: Set<string>;

  // Progress
  progress: LessonProgress;

  // Variables
  variables: Map<string, unknown>;

  // Object States
  objectStates: Map<string, string>;

  // Active Layers
  activeLayers: Set<string>;

  // Assessment
  assessmentState: AssessmentState;

  // Session
  sessionId: string;
  startTime: number;
  elapsedTime: TimeMs;

  // Debug (preview mode)
  debugInfo: DebugInfo | null;
}

/**
 * Timeline playback state.
 */
export interface TimelinePlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: TimeMs;
  duration: TimeMs;
  playbackRate: number;
  loop: boolean;
}

/**
 * Lesson progress tracking.
 */
export interface LessonProgress {
  completedSlides: Set<string>;
  totalSlides: number;
  percentComplete: number;
  score: number;
  maxScore: number;
  passed: boolean | null;
  attemptNumber: number;
  timeSpent: TimeMs;
  lastAccessedSlide: string | null;
  bookmark?: BookmarkState;
}

/**
 * Bookmark state for resume functionality.
 */
export interface BookmarkState {
  slideId: string;
  slideIndex: number;
  timelinePosition?: TimeMs;
  variables?: Record<string, unknown>;
  objectStates?: Record<string, string>;
  savedAt: string;
}

/**
 * Assessment state tracking.
 */
export interface AssessmentState {
  attempts: Map<string, QuestionAttempt[]>;
  scores: Map<string, number>;
  totalScore: number;
  maxPossibleScore: number;
  questionsAnswered: number;
  questionsCorrect: number;
  questionsIncorrect: number;
  quizResults: QuizResult[];
}

/**
 * Individual question attempt.
 */
export interface QuestionAttempt {
  questionId: string;
  response: unknown;
  correct: boolean;
  score: number;
  maxScore: number;
  timestamp: number;
  duration?: TimeMs;
}

/**
 * Quiz/assessment result.
 */
export interface QuizResult {
  quizId: string;
  quizName: string;
  score: number;
  maxScore: number;
  passed: boolean;
  duration: TimeMs;
  completedAt: string;
  attempts: QuestionAttempt[];
}

/**
 * Debug info for preview mode.
 */
export interface DebugInfo {
  fps: number;
  memoryUsage: number;
  renderTime: TimeMs;
  activeTimelines: number;
  activeTriggers: number;
  pendingActions: number;
  lastTriggerExecution: TriggerExecutionLog | null;
  logs: DebugLog[];
}

/**
 * Trigger execution log entry.
 */
export interface TriggerExecutionLog {
  triggerId: string;
  triggerName: string;
  event: string;
  timestamp: number;
  duration: TimeMs;
  success: boolean;
  error?: string;
  actionsExecuted: string[];
}

/**
 * Debug log entry.
 */
export interface DebugLog {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: number;
  data?: unknown;
}

// =============================================================================
// PLAYER CONFIG
// =============================================================================

/**
 * Player configuration options.
 */
export interface PlayerConfig {
  // Mode
  mode: PlayerMode;

  // Container
  containerId?: string;
  width?: number | string;
  height?: number | string;
  responsive?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';

  // Navigation
  showControls?: boolean;
  showProgress?: boolean;
  showSlideCount?: boolean;
  showTimer?: boolean;
  enableKeyboard?: boolean;
  enableTouch?: boolean;
  enableWheel?: boolean;

  // Playback
  autoPlay?: boolean;
  autoAdvance?: boolean;
  startSlide?: number | string;
  resumeFromBookmark?: boolean;

  // Timeline
  defaultTimelineAutoPlay?: boolean;
  timelinePlaybackRate?: number;

  // xAPI/LRS
  enableXAPI?: boolean;
  lrsEndpoint?: string;
  lrsAuth?: string;
  actorEmail?: string;
  actorName?: string;
  registration?: string;

  // SCORM
  scormVersion?: '1.2' | '2004';
  scormAutoCommit?: boolean;
  scormCommitInterval?: TimeMs;

  // Theme
  theme?: PlayerTheme;

  // Debug
  debug?: boolean;
  debugOverlay?: boolean;
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug';

  // Callbacks
  onReady?: () => void;
  onSlideChange?: (slideIndex: number, slideId: string) => void;
  onProgress?: (progress: LessonProgress) => void;
  onComplete?: (result: LessonCompletionResult) => void;
  onError?: (error: PlayerError) => void;
  onXAPIStatement?: (statement: unknown) => void;
}

/**
 * Player theme configuration.
 */
export interface PlayerTheme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  controlsPosition?: 'top' | 'bottom' | 'overlay';
  controlsOpacity?: number;
}

/**
 * Lesson completion result.
 */
export interface LessonCompletionResult {
  completed: boolean;
  passed: boolean | null;
  score: number;
  maxScore: number;
  percentComplete: number;
  timeSpent: TimeMs;
  attemptNumber: number;
  completedAt: string;
  assessmentResults: QuizResult[];
}

/**
 * Player error.
 */
export interface PlayerError {
  code: string;
  message: string;
  details?: unknown;
  recoverable: boolean;
}

// =============================================================================
// PLAYER ACTIONS
// =============================================================================

/**
 * Player action types.
 */
export type PlayerAction =
  // Initialization
  | { type: 'INITIALIZE'; lesson: PlayerLesson; config: PlayerConfig }
  | { type: 'RESET' }
  | { type: 'DESTROY' }

  // Playback
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'RESUME' }

  // Navigation
  | { type: 'GO_TO_SLIDE'; target: NavigationTarget }
  | { type: 'NEXT_SLIDE' }
  | { type: 'PREV_SLIDE' }
  | { type: 'GO_TO_FIRST_SLIDE' }
  | { type: 'GO_TO_LAST_SLIDE' }

  // Timeline
  | { type: 'PLAY_TIMELINE' }
  | { type: 'PAUSE_TIMELINE' }
  | { type: 'SEEK_TIMELINE'; time: TimeMs }
  | { type: 'SET_TIMELINE_RATE'; rate: number }

  // Layers
  | { type: 'SHOW_LAYER'; layerId: string }
  | { type: 'HIDE_LAYER'; layerId: string }
  | { type: 'TOGGLE_LAYER'; layerId: string }

  // Variables
  | { type: 'SET_VARIABLE'; variableId: string; value: unknown }
  | { type: 'INCREMENT_VARIABLE'; variableId: string; amount?: number }
  | { type: 'DECREMENT_VARIABLE'; variableId: string; amount?: number }
  | { type: 'RESET_VARIABLE'; variableId: string }

  // Object States
  | { type: 'SET_OBJECT_STATE'; objectId: string; stateId: string }
  | { type: 'NEXT_OBJECT_STATE'; objectId: string }
  | { type: 'PREV_OBJECT_STATE'; objectId: string }
  | { type: 'RESET_OBJECT_STATE'; objectId: string }

  // Assessment
  | { type: 'SUBMIT_ANSWER'; attempt: QuestionAttempt }
  | { type: 'RESET_QUESTION'; questionId: string }
  | { type: 'COMPLETE_QUIZ'; quizId: string }

  // Progress
  | { type: 'MARK_SLIDE_COMPLETE'; slideId: string }
  | { type: 'SAVE_BOOKMARK'; bookmark: BookmarkState }
  | { type: 'RESTORE_BOOKMARK'; bookmark: BookmarkState }
  | { type: 'UPDATE_PROGRESS'; progress: Partial<LessonProgress> }

  // Triggers
  | { type: 'EXECUTE_TRIGGER'; triggerId: string }
  | { type: 'EXECUTE_ACTIONS'; actions: TriggerAction[] }
  | { type: 'DISPATCH_EVENT'; eventName: string; data?: unknown }

  // Debug
  | { type: 'SET_DEBUG_MODE'; enabled: boolean }
  | { type: 'LOG_DEBUG'; log: DebugLog }

  // Error handling
  | { type: 'SET_ERROR'; error: PlayerError | null }
  | { type: 'CLEAR_ERROR' };

// =============================================================================
// PLAYER EVENTS
// =============================================================================

/**
 * Player event types.
 */
export type PlayerEventType =
  | 'ready'
  | 'play'
  | 'pause'
  | 'stop'
  | 'slideEnter'
  | 'slideExit'
  | 'slideComplete'
  | 'timelinePlay'
  | 'timelinePause'
  | 'timelineEnd'
  | 'cuePoint'
  | 'layerShow'
  | 'layerHide'
  | 'variableChange'
  | 'stateChange'
  | 'triggerExecute'
  | 'questionAnswered'
  | 'quizComplete'
  | 'progressUpdate'
  | 'lessonComplete'
  | 'bookmarkSave'
  | 'bookmarkRestore'
  | 'error';

/**
 * Player event data.
 */
export interface PlayerEvent {
  type: PlayerEventType;
  timestamp: number;
  data?: unknown;
}

/**
 * Player event listener.
 */
export type PlayerEventListener = (event: PlayerEvent) => void;

// =============================================================================
// PLAYER API
// =============================================================================

/**
 * Public player API interface.
 */
export interface PlayerAPI {
  // State
  getState(): PlayerState;
  getCurrentSlide(): PlayerSlide | null;
  getLesson(): PlayerLesson | null;
  getProgress(): LessonProgress;

  // Playback
  play(): void;
  pause(): void;
  stop(): void;
  isPlaying(): boolean;

  // Navigation
  goToSlide(target: NavigationTarget): void;
  nextSlide(): void;
  prevSlide(): void;
  goToFirstSlide(): void;
  goToLastSlide(): void;
  canGoNext(): boolean;
  canGoPrev(): boolean;

  // Timeline
  playTimeline(): void;
  pauseTimeline(): void;
  seekTimeline(time: TimeMs): void;
  getTimelinePosition(): TimeMs;
  setTimelineRate(rate: number): void;

  // Layers
  showLayer(layerId: string): void;
  hideLayer(layerId: string): void;
  toggleLayer(layerId: string): void;
  isLayerVisible(layerId: string): boolean;

  // Variables
  getVariable(variableId: string): unknown;
  setVariable(variableId: string, value: unknown): void;
  incrementVariable(variableId: string, amount?: number): void;
  decrementVariable(variableId: string, amount?: number): void;

  // Object States
  getObjectState(objectId: string): string | null;
  setObjectState(objectId: string, stateId: string): void;
  nextObjectState(objectId: string): void;
  prevObjectState(objectId: string): void;

  // Assessment
  submitAnswer(questionId: string, response: unknown): void;
  getQuestionAttempts(questionId: string): QuestionAttempt[];
  getAssessmentResults(): AssessmentState;

  // Progress
  saveBookmark(): BookmarkState;
  restoreBookmark(bookmark: BookmarkState): void;
  completeLesson(): void;

  // Events
  on(event: PlayerEventType, listener: PlayerEventListener): () => void;
  off(event: PlayerEventType, listener: PlayerEventListener): void;
  emit(event: PlayerEvent): void;

  // Triggers
  executeTrigger(triggerId: string): void;
  dispatchEvent(eventName: string, data?: unknown): void;

  // Utilities
  destroy(): void;
  resize(width?: number, height?: number): void;
  fullscreen(enable: boolean): void;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

/**
 * Default player configuration.
 */
export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  mode: 'player',
  responsive: true,
  aspectRatio: '16:9',
  showControls: true,
  showProgress: true,
  showSlideCount: true,
  showTimer: false,
  enableKeyboard: true,
  enableTouch: true,
  enableWheel: false,
  autoPlay: false,
  autoAdvance: false,
  resumeFromBookmark: true,
  defaultTimelineAutoPlay: true,
  timelinePlaybackRate: 1,
  enableXAPI: true,
  debug: false,
  debugOverlay: false,
  logLevel: 'error',
};

/**
 * Default lesson settings.
 */
export const DEFAULT_LESSON_SETTINGS: LessonSettings = {
  navigationMode: 'free',
  allowRestart: true,
  allowReview: true,
  showProgress: true,
  showSlideNumbers: true,
  showTimer: false,
  autoSaveProgress: true,
  saveInterval: 30000,
  resumeFromBookmark: true,
  enableKeyboardNav: true,
  enableSwipeNav: true,
  enableWheelNav: false,
};

/**
 * Default slide transition.
 */
export const DEFAULT_SLIDE_TRANSITION: SlideTransition = {
  type: 'fade',
  duration: 300,
  easing: 'ease-out',
};

/**
 * Initial player state.
 */
export const INITIAL_PLAYER_STATE: PlayerState = {
  mode: 'player',
  playbackState: 'idle',
  isInitialized: false,
  isLoading: false,
  error: null,
  lesson: null,
  currentSlideIndex: 0,
  currentSlideId: null,
  previousSlideIndex: null,
  timelineState: {
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    loop: false,
  },
  navigationHistory: [],
  canNavigateNext: false,
  canNavigatePrev: false,
  visitedSlides: new Set(),
  progress: {
    completedSlides: new Set(),
    totalSlides: 0,
    percentComplete: 0,
    score: 0,
    maxScore: 0,
    passed: null,
    attemptNumber: 1,
    timeSpent: 0,
    lastAccessedSlide: null,
  },
  variables: new Map(),
  objectStates: new Map(),
  activeLayers: new Set(),
  assessmentState: {
    attempts: new Map(),
    scores: new Map(),
    totalScore: 0,
    maxPossibleScore: 0,
    questionsAnswered: 0,
    questionsCorrect: 0,
    questionsIncorrect: 0,
    quizResults: [],
  },
  sessionId: '',
  startTime: 0,
  elapsedTime: 0,
  debugInfo: null,
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Serializable player state for persistence.
 */
export interface SerializablePlayerState {
  currentSlideIndex: number;
  currentSlideId: string | null;
  visitedSlides: string[];
  completedSlides: string[];
  variables: Record<string, unknown>;
  objectStates: Record<string, string>;
  progress: Omit<LessonProgress, 'completedSlides' | 'bookmark'> & {
    completedSlides: string[];
  };
  assessmentState: {
    attempts: Record<string, QuestionAttempt[]>;
    scores: Record<string, number>;
    totalScore: number;
    maxPossibleScore: number;
    questionsAnswered: number;
    questionsCorrect: number;
    questionsIncorrect: number;
    quizResults: QuizResult[];
  };
  bookmark?: BookmarkState;
  sessionId: string;
  timeSpent: TimeMs;
  savedAt: string;
}

/**
 * Convert player state to serializable format.
 */
export function serializePlayerState(state: PlayerState): SerializablePlayerState {
  return {
    currentSlideIndex: state.currentSlideIndex,
    currentSlideId: state.currentSlideId,
    visitedSlides: Array.from(state.visitedSlides),
    completedSlides: Array.from(state.progress.completedSlides),
    variables: Object.fromEntries(state.variables),
    objectStates: Object.fromEntries(state.objectStates),
    progress: {
      ...state.progress,
      completedSlides: Array.from(state.progress.completedSlides),
    },
    assessmentState: {
      attempts: Object.fromEntries(state.assessmentState.attempts),
      scores: Object.fromEntries(state.assessmentState.scores),
      totalScore: state.assessmentState.totalScore,
      maxPossibleScore: state.assessmentState.maxPossibleScore,
      questionsAnswered: state.assessmentState.questionsAnswered,
      questionsCorrect: state.assessmentState.questionsCorrect,
      questionsIncorrect: state.assessmentState.questionsIncorrect,
      quizResults: state.assessmentState.quizResults,
    },
    bookmark: state.progress.bookmark,
    sessionId: state.sessionId,
    timeSpent: state.elapsedTime,
    savedAt: new Date().toISOString(),
  };
}

/**
 * Restore player state from serialized format.
 */
export function deserializePlayerState(
  serialized: SerializablePlayerState,
  _baseState: PlayerState,
): Partial<PlayerState> {
  return {
    currentSlideIndex: serialized.currentSlideIndex,
    currentSlideId: serialized.currentSlideId,
    visitedSlides: new Set(serialized.visitedSlides),
    variables: new Map(Object.entries(serialized.variables)),
    objectStates: new Map(Object.entries(serialized.objectStates)),
    progress: {
      ...serialized.progress,
      completedSlides: new Set(serialized.completedSlides),
      bookmark: serialized.bookmark,
    },
    assessmentState: {
      attempts: new Map(Object.entries(serialized.assessmentState.attempts)),
      scores: new Map(Object.entries(serialized.assessmentState.scores)),
      totalScore: serialized.assessmentState.totalScore,
      maxPossibleScore: serialized.assessmentState.maxPossibleScore,
      questionsAnswered: serialized.assessmentState.questionsAnswered,
      questionsCorrect: serialized.assessmentState.questionsCorrect,
      questionsIncorrect: serialized.assessmentState.questionsIncorrect,
      quizResults: serialized.assessmentState.quizResults,
    },
    sessionId: serialized.sessionId,
    elapsedTime: serialized.timeSpent,
  };
}
