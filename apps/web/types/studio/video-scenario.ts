/**
 * Video Scenario Types - Phase 14
 * Branching video and interactive scenario definitions
 */

// =============================================================================
// VIDEO NODE TYPES
// =============================================================================

/** Base video node */
export interface VideoNode {
  id: string;
  type: VideoNodeType;
  position: { x: number; y: number };
  data: VideoNodeData;
}

export type VideoNodeType =
  | 'video'
  | 'decision'
  | 'branch'
  | 'end'
  | 'checkpoint'
  | 'variable'
  | 'condition';

/** Video segment node data */
export interface VideoSegmentData {
  videoUrl: string;
  thumbnailUrl?: string;
  title: string;
  duration: number; // seconds
  startTime?: number;
  endTime?: number;
  autoAdvance: boolean;
  decisionPoint?: DecisionPoint;
  overlays?: VideoOverlay[];
}

/** Decision point within video */
export interface DecisionPoint {
  id: string;
  timestamp: number; // when to show choices (seconds)
  pauseVideo: boolean;
  timeLimit?: number; // seconds to decide
  defaultChoice?: string; // choice ID if time runs out
  choices: DecisionChoice[];
}

/** A single decision choice */
export interface DecisionChoice {
  id: string;
  label: string;
  description?: string;
  imageUrl?: string;
  hotspot?: ChoiceHotspot;
  targetNodeId: string;
  points?: number;
  feedback?: ChoiceFeedback;
  variables?: VariableChange[];
}

/** Hotspot-based choice (click area on video) */
export interface ChoiceHotspot {
  x: number; // percentage 0-100
  y: number;
  width: number;
  height: number;
  shape: 'rect' | 'circle' | 'polygon';
  highlightOnHover: boolean;
}

/** Feedback shown after choice */
export interface ChoiceFeedback {
  type: 'immediate' | 'delayed' | 'end';
  title?: string;
  message: string;
  isCorrect?: boolean;
  showDuration?: number;
}

/** Variable change triggered by choice */
export interface VariableChange {
  variableId: string;
  operation: 'set' | 'add' | 'subtract' | 'multiply' | 'toggle';
  value: number | string | boolean;
}

// =============================================================================
// OVERLAY TYPES
// =============================================================================

/** Overlay displayed on video */
export interface VideoOverlay {
  id: string;
  type: OverlayType;
  startTime: number;
  endTime: number;
  position: OverlayPosition;
  animation?: OverlayAnimation;
  content: OverlayContent;
}

export type OverlayType =
  | 'text'
  | 'image'
  | 'button'
  | 'callout'
  | 'highlight'
  | 'character'
  | 'thought-bubble'
  | 'subtitle';

export interface OverlayPosition {
  x: number; // percentage
  y: number;
  width?: number;
  height?: number;
  anchor:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center-left'
    | 'center'
    | 'center-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
}

export interface OverlayAnimation {
  enter: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'bounce';
  exit: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom';
  duration: number;
}

export type OverlayContent =
  | TextOverlayContent
  | ImageOverlayContent
  | ButtonOverlayContent
  | CalloutOverlayContent
  | CharacterOverlayContent;

export interface TextOverlayContent {
  type: 'text';
  text: string;
  style: TextStyle;
}

export interface ImageOverlayContent {
  type: 'image';
  src: string;
  alt: string;
  opacity?: number;
}

export interface ButtonOverlayContent {
  type: 'button';
  label: string;
  action: OverlayAction;
  style?: ButtonStyle;
}

export interface CalloutOverlayContent {
  type: 'callout';
  title?: string;
  message: string;
  icon?: string;
  variant: 'info' | 'tip' | 'warning' | 'error';
}

export interface CharacterOverlayContent {
  type: 'character';
  characterId: string;
  expression: string;
  dialogue?: string;
  position: 'left' | 'right' | 'center';
}

export interface TextStyle {
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

export interface ButtonStyle {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
}

export type OverlayAction =
  | { type: 'navigate'; targetNodeId: string }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'seek'; time: number }
  | { type: 'setVariable'; variableId: string; value: unknown }
  | { type: 'openUrl'; url: string; newTab?: boolean }
  | { type: 'showOverlay'; overlayId: string }
  | { type: 'hideOverlay'; overlayId: string };

// =============================================================================
// BRANCH NODE TYPES
// =============================================================================

/** Conditional branch node */
export interface BranchNodeData {
  title: string;
  conditions: BranchCondition[];
  defaultTargetId: string;
}

export interface BranchCondition {
  id: string;
  label: string;
  expression: ConditionExpression;
  targetNodeId: string;
}

export interface ConditionExpression {
  type: 'variable' | 'score' | 'path' | 'time' | 'compound';
  variableId?: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: unknown;
  children?: ConditionExpression[];
  logic?: 'and' | 'or';
}

// =============================================================================
// VARIABLE TYPES
// =============================================================================

/** Scenario variable node */
export interface VariableNodeData {
  title: string;
  operations: VariableOperation[];
}

export interface VariableOperation {
  variableId: string;
  operation: 'set' | 'add' | 'subtract' | 'multiply' | 'toggle' | 'append';
  value: unknown;
}

/** Variable definition */
export interface ScenarioVariable {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'array';
  defaultValue: unknown;
  description?: string;
  persistent?: boolean; // survives session restart
}

// =============================================================================
// END NODE TYPES
// =============================================================================

/** End node data */
export interface EndNodeData {
  title: string;
  type: 'success' | 'failure' | 'neutral' | 'custom';
  message?: string;
  showResults: boolean;
  resultsSummary?: ResultsSummary;
  nextAction?: EndAction;
}

export interface ResultsSummary {
  showScore: boolean;
  showPath: boolean;
  showTime: boolean;
  showChoices: boolean;
  customMetrics?: CustomMetric[];
}

export interface CustomMetric {
  label: string;
  variableId: string;
  format?: 'number' | 'percentage' | 'time' | 'currency';
  thresholds?: MetricThreshold[];
}

export interface MetricThreshold {
  min: number;
  max: number;
  label: string;
  color: string;
}

export type EndAction =
  | { type: 'restart' }
  | { type: 'retry-decision'; nodeId: string }
  | { type: 'continue'; targetId: string }
  | { type: 'redirect'; url: string }
  | { type: 'callback'; event: string };

// =============================================================================
// CHECKPOINT NODE
// =============================================================================

/** Checkpoint for saving progress */
export interface CheckpointNodeData {
  title: string;
  saveState: boolean;
  autoSave: boolean;
  resumeMessage?: string;
}

// =============================================================================
// EDGE TYPES
// =============================================================================

/** Connection between nodes */
export interface VideoEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  data?: EdgeData;
}

export interface EdgeData {
  condition?: ConditionExpression;
  probability?: number; // for random branching
  priority?: number; // evaluation order
}

// =============================================================================
// SCENARIO DEFINITION
// =============================================================================

/** Complete video scenario */
export interface VideoScenario {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  version: number;
  createdAt: string;
  updatedAt: string;

  // Graph structure
  nodes: VideoNode[];
  edges: VideoEdge[];
  startNodeId: string;

  // Variables
  variables: ScenarioVariable[];

  // Characters
  characters: ScenarioCharacter[];

  // Settings
  settings: ScenarioSettings;

  // Analytics
  analytics?: ScenarioAnalytics;
}

/** Character definition */
export interface ScenarioCharacter {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string;
  expressions: CharacterExpression[];
  voiceId?: string;
}

export interface CharacterExpression {
  id: string;
  name: string;
  imageUrl: string;
}

/** Scenario settings */
export interface ScenarioSettings {
  allowSkip: boolean;
  allowRewind: boolean;
  allowPause: boolean;
  showProgress: boolean;
  showTimer: boolean;
  maxAttempts?: number;
  timeLimit?: number; // total scenario time limit
  passingScore?: number;
  language: string;
  accessibility: AccessibilitySettings;
}

export interface AccessibilitySettings {
  showCaptions: boolean;
  captionsLanguage: string;
  audioDescriptions: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
}

// =============================================================================
// ANALYTICS & TRACKING
// =============================================================================

/** Scenario analytics configuration */
export interface ScenarioAnalytics {
  trackChoices: boolean;
  trackTime: boolean;
  trackRetries: boolean;
  trackPath: boolean;
  xapiEnabled: boolean;
  customEvents: AnalyticsEvent[];
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  trigger: 'choice' | 'node-enter' | 'node-exit' | 'variable-change' | 'end';
  nodeId?: string;
  data?: Record<string, unknown>;
}

// =============================================================================
// PLAYBACK STATE
// =============================================================================

/** Runtime playback state */
export interface ScenarioPlaybackState {
  scenarioId: string;
  currentNodeId: string;
  videoTime: number;
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;

  // Progress
  visitedNodes: string[];
  choicesMade: PlaybackChoice[];
  pathTaken: string[]; // node IDs in order

  // Variables
  variables: Record<string, unknown>;

  // Scoring
  score: number;
  maxScore: number;

  // Time
  startTime: number;
  elapsedTime: number;

  // Attempts
  attempts: number;
  checkpointNodeId?: string;
}

export interface PlaybackChoice {
  nodeId: string;
  decisionId: string;
  choiceId: string;
  timestamp: number;
  timeSpent: number;
}

// =============================================================================
// UNION TYPES
// =============================================================================

export type VideoNodeData =
  | ({ nodeType: 'video' } & VideoSegmentData)
  | ({ nodeType: 'decision' } & VideoSegmentData)
  | ({ nodeType: 'branch' } & BranchNodeData)
  | ({ nodeType: 'variable' } & VariableNodeData)
  | ({ nodeType: 'end' } & EndNodeData)
  | ({ nodeType: 'checkpoint' } & CheckpointNodeData);
