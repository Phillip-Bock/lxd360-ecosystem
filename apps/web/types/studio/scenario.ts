/**
 * Scenario Builder Types - Phase 14/17 Combined
 * Full-scale branching scenario editor supporting all media types
 */

// =============================================================================
// CORE NODE TYPES
// =============================================================================

/** Base scenario node */
export interface ScenarioNode {
  id: string;
  type: ScenarioNodeType;
  position: { x: number; y: number };
  data: ScenarioNodeData;
}

export type ScenarioNodeType =
  | 'scene'
  | 'decision'
  | 'branch'
  | 'dialogue'
  | 'narration'
  | 'action'
  | 'feedback'
  | 'assessment'
  | 'variable'
  | 'timer'
  | 'checkpoint'
  | 'end'
  | 'random'
  | 'meter'
  | 'character-select'
  | 'inventory';

// =============================================================================
// SCENE NODE - The Core Content Container
// =============================================================================

/** Scene node - main content container supporting all media */
export interface SceneNodeData {
  nodeType: 'scene';
  title: string;

  // Background
  background: SceneBackground;

  // Characters on screen
  characters: SceneCharacter[];

  // Overlays and annotations
  overlays: SceneOverlay[];

  // Audio
  audio?: SceneAudio;

  // Timing
  duration?: number; // auto-advance after X seconds
  autoAdvance: boolean;

  // Transitions
  enterTransition?: Transition;
  exitTransition?: Transition;

  // Accessibility
  screenReaderText?: string;
  altText?: string;
}

export interface SceneBackground {
  type: 'image' | 'video' | '360-image' | '360-video' | '3d-scene' | 'color' | 'gradient';

  // For image/video backgrounds
  src?: string;
  thumbnailUrl?: string;

  // For video backgrounds
  videoSettings?: {
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    startTime?: number;
    endTime?: number;
  };

  // For color/gradient backgrounds
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    stops: { color: string; position: number }[];
  };

  // For 3D scenes
  modelUrl?: string;
  environmentPreset?: string;

  // Visual effects
  blur?: number;
  brightness?: number;
  overlay?: string; // overlay color with opacity
}

export interface SceneCharacter {
  characterId: string;
  expression: string;
  position: CharacterPosition;
  animation?: CharacterAnimation;
  speaking?: boolean;
  highlighted?: boolean;
}

export type CharacterPosition =
  | 'left'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'right'
  | 'off-left'
  | 'off-right'
  | { x: number; y: number; scale: number };

export interface CharacterAnimation {
  type: 'enter' | 'exit' | 'idle' | 'emphasis' | 'custom';
  name: string;
  duration: number;
  delay?: number;
}

export interface SceneOverlay {
  id: string;
  type: OverlayType;
  position: OverlayPosition;
  timing: OverlayTiming;
  content: OverlayContent;
  style?: OverlayStyle;
  interaction?: OverlayInteraction;
}

export type OverlayType =
  | 'text'
  | 'image'
  | 'button'
  | 'callout'
  | 'tooltip'
  | 'hotspot'
  | 'highlight'
  | 'shape'
  | 'icon'
  | 'progress'
  | 'timer-display'
  | 'variable-display'
  | 'meter-display';

export interface OverlayPosition {
  x: number; // percentage 0-100
  y: number;
  width?: number;
  height?: number;
  anchor: AnchorPoint;
  layer: number; // z-index
}

export type AnchorPoint =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface OverlayTiming {
  startDelay: number; // seconds after scene starts
  duration?: number; // how long to show (null = until scene ends)
  enterAnimation?: AnimationConfig;
  exitAnimation?: AnimationConfig;
}

export interface AnimationConfig {
  type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'shake' | 'pulse' | 'none';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
}

export type OverlayContent =
  | { type: 'text'; text: string; richText?: boolean }
  | { type: 'image'; src: string; alt: string }
  | { type: 'button'; label: string; action: ScenarioAction }
  | {
      type: 'callout';
      variant: 'info' | 'tip' | 'warning' | 'error';
      title?: string;
      message: string;
    }
  | { type: 'tooltip'; content: string }
  | { type: 'hotspot'; icon: string; tooltip?: string; action: ScenarioAction }
  | { type: 'highlight'; shape: 'rect' | 'circle' | 'ellipse' }
  | {
      type: 'shape';
      shape: 'rect' | 'circle' | 'triangle' | 'arrow';
      fill?: string;
      stroke?: string;
    }
  | { type: 'icon'; name: string; size: number }
  | { type: 'progress'; variableId: string; max: number; showLabel: boolean }
  | { type: 'timer'; showMinutes: boolean; countDirection: 'up' | 'down' }
  | { type: 'variable'; variableId: string; format?: string }
  | { type: 'meter'; variableId: string; min: number; max: number; label: string };

export interface OverlayStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  shadow?: boolean;
  opacity?: number;
}

export interface OverlayInteraction {
  clickable: boolean;
  action?: ScenarioAction;
  hoverEffect?: 'scale' | 'glow' | 'highlight' | 'none';
  cursor?: 'pointer' | 'default' | 'help';
}

export interface SceneAudio {
  type: 'music' | 'sfx' | 'ambience' | 'voiceover';
  src: string;
  volume: number;
  loop: boolean;
  fadeIn?: number;
  fadeOut?: number;
  startTime?: number;
}

export interface Transition {
  type: 'fade' | 'slide' | 'zoom' | 'wipe' | 'dissolve' | 'none';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration: number;
  easing?: string;
}

// =============================================================================
// DECISION NODE
// =============================================================================

export interface DecisionNodeData {
  nodeType: 'decision';
  title: string;

  // Prompt
  prompt?: string;
  promptPosition: 'top' | 'bottom' | 'center' | 'hidden';

  // Choices
  choices: DecisionChoice[];

  // Settings
  layout: ChoiceLayout;
  timeLimit?: number;
  defaultChoiceId?: string; // if time runs out
  randomizeOrder: boolean;
  allowMultiple: boolean; // can select multiple choices
  minSelections?: number;
  maxSelections?: number;

  // Feedback
  showFeedback: 'immediate' | 'delayed' | 'end' | 'none';
}

export type ChoiceLayout =
  | {
      type: 'buttons';
      alignment: 'horizontal' | 'vertical';
      position: 'bottom' | 'center' | 'sides';
    }
  | { type: 'cards'; columns: 2 | 3 | 4 }
  | { type: 'hotspots' } // click on image areas
  | { type: 'drag-drop'; targets: DropTarget[] }
  | { type: 'slider'; min: number; max: number; step: number; labels?: string[] };

export interface DropTarget {
  id: string;
  label: string;
  position: { x: number; y: number; width: number; height: number };
}

export interface DecisionChoice {
  id: string;

  // Content
  label: string;
  description?: string;
  imageUrl?: string;
  icon?: string;

  // For hotspot layout
  hotspot?: {
    x: number;
    y: number;
    width: number;
    height: number;
    shape: 'rect' | 'circle' | 'polygon';
    points?: { x: number; y: number }[]; // for polygon
  };

  // Results
  targetNodeId: string;

  // Scoring
  points?: number;
  isCorrect?: boolean;

  // Feedback
  feedback?: {
    title?: string;
    message: string;
    variant: 'success' | 'error' | 'info' | 'neutral';
    duration?: number;
  };

  // Side effects
  effects?: ChoiceEffect[];

  // Conditions
  conditions?: ChoiceCondition[];
  showWhen?: ConditionExpression;
  disabledWhen?: ConditionExpression;
}

export interface ChoiceEffect {
  type:
    | 'set-variable'
    | 'add-variable'
    | 'subtract-variable'
    | 'toggle-variable'
    | 'add-inventory'
    | 'remove-inventory'
    | 'set-meter'
    | 'add-meter'
    | 'play-sound'
    | 'trigger-event'
    | 'set-flag';
  target: string;
  value?: unknown;
}

export interface ChoiceCondition {
  type: 'variable' | 'inventory' | 'meter' | 'flag' | 'path-visited' | 'choice-made';
  target: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'not-contains';
  value: unknown;
}

// =============================================================================
// DIALOGUE NODE
// =============================================================================

export interface DialogueNodeData {
  nodeType: 'dialogue';
  title: string;

  // Speaker
  characterId: string;
  expression?: string;
  nameOverride?: string; // override character name display

  // Content
  lines: DialogueLine[];

  // Display
  textboxStyle: 'bottom' | 'floating' | 'speech-bubble' | 'side' | 'fullscreen';
  typewriterEffect: boolean;
  typewriterSpeed?: number;

  // Audio
  voiceoverUrl?: string;

  // Auto-advance
  autoAdvance: boolean;
  autoAdvanceDelay?: number;
}

export interface DialogueLine {
  id: string;
  text: string;
  emotion?: string;
  voiceoverUrl?: string;
  duration?: number;
  effects?: DialogueEffect[];
}

export interface DialogueEffect {
  type: 'expression-change' | 'emphasis' | 'pause' | 'sfx';
  timing: number; // when during line playback
  value: unknown;
}

// =============================================================================
// NARRATION NODE
// =============================================================================

export interface NarrationNodeData {
  nodeType: 'narration';
  title: string;

  // Content
  text: string;

  // Display
  style: 'overlay' | 'fullscreen' | 'typewriter' | 'cinematic';
  position: 'top' | 'center' | 'bottom';

  // Audio
  voiceoverUrl?: string;
  backgroundMusic?: string;

  // Timing
  duration?: number;
  autoAdvance: boolean;
}

// =============================================================================
// ACTION NODE (Internal Operations)
// =============================================================================

export interface ActionNodeData {
  nodeType: 'action';
  title: string;

  // Actions to execute
  actions: ScenarioAction[];

  // Continue to
  targetNodeId: string;
}

export type ScenarioAction =
  | { type: 'navigate'; nodeId: string }
  | { type: 'set-variable'; variableId: string; value: unknown }
  | { type: 'add-variable'; variableId: string; amount: number }
  | { type: 'toggle-variable'; variableId: string }
  | { type: 'set-meter'; meterId: string; value: number }
  | { type: 'add-meter'; meterId: string; amount: number }
  | { type: 'add-inventory'; itemId: string; quantity?: number }
  | { type: 'remove-inventory'; itemId: string; quantity?: number }
  | { type: 'play-audio'; src: string; audioType: 'sfx' | 'music'; volume?: number }
  | { type: 'stop-audio'; audioType: 'sfx' | 'music' | 'all' }
  | {
      type: 'show-notification';
      message: string;
      variant: 'info' | 'success' | 'warning' | 'error';
    }
  | { type: 'set-flag'; flagId: string; value: boolean }
  | { type: 'trigger-event'; eventName: string; data?: unknown }
  | { type: 'start-timer'; timerId: string; duration: number }
  | { type: 'stop-timer'; timerId: string }
  | { type: 'reset-timer'; timerId: string }
  | { type: 'unlock-achievement'; achievementId: string }
  | { type: 'save-checkpoint' }
  | { type: 'load-checkpoint' }
  | { type: 'custom-script'; code: string };

// =============================================================================
// FEEDBACK NODE
// =============================================================================

export interface FeedbackNodeData {
  nodeType: 'feedback';
  title: string;

  // Content
  variant: 'success' | 'error' | 'info' | 'tip' | 'neutral' | 'custom';
  heading?: string;
  message: string;

  // Details
  details?: string;
  showExplanation?: boolean;
  explanationText?: string;

  // Media
  imageUrl?: string;
  videoUrl?: string;

  // Actions
  primaryAction?: { label: string; targetNodeId: string };
  secondaryAction?: { label: string; targetNodeId: string };

  // Auto-advance
  autoAdvance: boolean;
  autoAdvanceDelay?: number;
  targetNodeId?: string;
}

// =============================================================================
// ASSESSMENT NODE
// =============================================================================

export interface AssessmentNodeData {
  nodeType: 'assessment';
  title: string;

  // Question
  questionType:
    | 'multiple-choice'
    | 'multiple-select'
    | 'true-false'
    | 'fill-blank'
    | 'matching'
    | 'ordering'
    | 'hotspot';
  question: string;

  // Options (for MC/MS/TF)
  options?: AssessmentOption[];

  // For fill-blank
  blanks?: { id: string; correctAnswers: string[]; caseSensitive: boolean }[];

  // For matching
  matchPairs?: { id: string; left: string; right: string }[];

  // For ordering
  orderItems?: { id: string; text: string; correctPosition: number }[];

  // Scoring
  points: number;
  partialCredit: boolean;

  // Feedback
  correctFeedback?: string;
  incorrectFeedback?: string;

  // Attempts
  maxAttempts: number;
  showCorrectOnFail: boolean;

  // Routing
  correctTargetId: string;
  incorrectTargetId: string;
  maxAttemptsTargetId?: string;
}

export interface AssessmentOption {
  id: string;
  text: string;
  imageUrl?: string;
  isCorrect: boolean;
  feedback?: string;
}

// =============================================================================
// VARIABLE NODE
// =============================================================================

export interface VariableNodeData {
  nodeType: 'variable';
  title: string;

  operations: VariableOperation[];

  // Continue
  targetNodeId: string;
}

export interface VariableOperation {
  variableId: string;
  operation: 'set' | 'add' | 'subtract' | 'multiply' | 'divide' | 'toggle' | 'append' | 'remove';
  value: unknown;
}

// =============================================================================
// TIMER NODE
// =============================================================================

export interface TimerNodeData {
  nodeType: 'timer';
  title: string;

  timerId: string;
  action: 'start' | 'stop' | 'reset' | 'branch';

  // For start
  duration?: number;

  // For branch
  conditions?: TimerCondition[];
  defaultTargetId?: string;

  // Continue
  targetNodeId: string;
}

export interface TimerCondition {
  operator: 'elapsed-gt' | 'elapsed-lt' | 'remaining-gt' | 'remaining-lt' | 'expired';
  value?: number;
  targetNodeId: string;
}

// =============================================================================
// BRANCH NODE (Conditional)
// =============================================================================

export interface BranchNodeData {
  nodeType: 'branch';
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
  type: 'simple' | 'compound';

  // For simple
  variableId?: string;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'empty' | 'not-empty';
  value?: unknown;

  // For compound
  logic?: 'and' | 'or';
  children?: ConditionExpression[];
}

// =============================================================================
// RANDOM NODE
// =============================================================================

export interface RandomNodeData {
  nodeType: 'random';
  title: string;

  // Distribution
  branches: RandomBranch[];

  // Settings
  preventRepeat: boolean; // don't repeat same result consecutively
  seedVariable?: string; // for reproducible results
}

export interface RandomBranch {
  id: string;
  label: string;
  weight: number; // probability weight
  targetNodeId: string;
}

// =============================================================================
// METER NODE (Resource tracking)
// =============================================================================

export interface MeterNodeData {
  nodeType: 'meter';
  title: string;

  meterId: string;
  operation: 'set' | 'add' | 'subtract' | 'check';
  value?: number;

  // For check operation
  conditions?: MeterCondition[];
  defaultTargetId?: string;

  // Continue
  targetNodeId: string;
}

export interface MeterCondition {
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'empty' | 'full';
  value?: number;
  targetNodeId: string;
}

// =============================================================================
// CHARACTER SELECT NODE
// =============================================================================

export interface CharacterSelectNodeData {
  nodeType: 'character-select';
  title: string;

  prompt: string;
  characters: SelectableCharacter[];

  variableToSet: string; // store selected character ID
  targetNodeId: string;
}

export interface SelectableCharacter {
  characterId: string;
  description?: string;
  locked?: boolean;
  unlockCondition?: ConditionExpression;
}

// =============================================================================
// INVENTORY NODE
// =============================================================================

export interface InventoryNodeData {
  nodeType: 'inventory';
  title: string;

  action: 'add' | 'remove' | 'check' | 'use' | 'show';
  itemId?: string;
  quantity?: number;

  // For check
  conditions?: InventoryCondition[];
  defaultTargetId?: string;

  targetNodeId: string;
}

export interface InventoryCondition {
  itemId: string;
  operator: 'has' | 'not-has' | 'quantity-gt' | 'quantity-lt' | 'quantity-eq';
  value?: number;
  targetNodeId: string;
}

// =============================================================================
// CHECKPOINT NODE
// =============================================================================

export interface CheckpointNodeData {
  nodeType: 'checkpoint';
  title: string;

  checkpointId: string;
  saveState: boolean;
  autoSave: boolean;
  resumeMessage?: string;

  targetNodeId: string;
}

// =============================================================================
// END NODE
// =============================================================================

export interface EndNodeData {
  nodeType: 'end';
  title: string;

  endType: 'success' | 'failure' | 'neutral' | 'custom';

  // Summary
  showSummary: boolean;
  summaryConfig?: EndSummaryConfig;

  // Message
  heading?: string;
  message?: string;

  // Media
  imageUrl?: string;
  videoUrl?: string;

  // Actions
  nextActions?: EndAction[];
}

export interface EndSummaryConfig {
  showScore: boolean;
  showTime: boolean;
  showChoices: boolean;
  showPath: boolean;
  showMeters: boolean;
  showAchievements: boolean;
  customMetrics?: CustomMetricConfig[];
}

export interface CustomMetricConfig {
  label: string;
  variableId: string;
  format: 'number' | 'percentage' | 'time' | 'custom';
  formatString?: string;
  thresholds?: { min: number; max: number; label: string; color: string }[];
}

export type EndAction =
  | { type: 'restart' }
  | { type: 'retry-from-checkpoint'; checkpointId?: string }
  | { type: 'continue'; scenarioId: string }
  | { type: 'redirect'; url: string }
  | { type: 'callback'; eventName: string }
  | { type: 'share'; platforms: ('twitter' | 'linkedin' | 'facebook')[] };

// =============================================================================
// EDGE TYPES
// =============================================================================

export interface ScenarioEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
  label?: string;
  data?: EdgeData;
  style?: EdgeStyle;
}

export interface EdgeData {
  condition?: ConditionExpression;
  probability?: number;
  priority?: number;
}

export interface EdgeStyle {
  type: 'default' | 'animated' | 'dashed' | 'dotted';
  color?: string;
  width?: number;
}

// =============================================================================
// SCENARIO DEFINITION
// =============================================================================

/** Complete scenario definition */
export interface Scenario {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  version: number;
  createdAt: string;
  updatedAt: string;

  // Graph
  nodes: ScenarioNode[];
  edges: ScenarioEdge[];
  startNodeId: string;

  // Characters
  characters: Character[];

  // Variables
  variables: Variable[];

  // Meters (health, reputation, etc.)
  meters: Meter[];

  // Inventory items
  inventoryItems: InventoryItem[];

  // Achievements
  achievements: Achievement[];

  // Timers
  timers: Timer[];

  // Flags (simple booleans)
  flags: Flag[];

  // Settings
  settings: ScenarioSettings;

  // Analytics
  analytics?: ScenarioAnalyticsConfig;
}

// =============================================================================
// SUPPORTING DEFINITIONS
// =============================================================================

export interface Character {
  id: string;
  name: string;
  role?: string;
  color?: string;
  avatarUrl?: string;
  expressions: { id: string; name: string; imageUrl: string }[];
  voiceId?: string;
}

export interface Variable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  defaultValue: unknown;
  description?: string;
  persistent?: boolean;
}

export interface Meter {
  id: string;
  name: string;
  min: number;
  max: number;
  defaultValue: number;
  icon?: string;
  color?: string;
  showInHUD?: boolean;
  depletedNodeId?: string; // navigate here if hits min
  filledNodeId?: string; // navigate here if hits max
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  maxQuantity?: number;
  consumable?: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  hidden?: boolean;
  condition?: ConditionExpression;
}

export interface Timer {
  id: string;
  name: string;
  duration?: number;
  showInHUD?: boolean;
  expiredNodeId?: string;
}

export interface Flag {
  id: string;
  name: string;
  defaultValue: boolean;
}

export interface ScenarioSettings {
  // Navigation
  allowSkip: boolean;
  allowRewind: boolean;
  allowSave: boolean;
  autoSave: boolean;

  // Display
  showProgress: boolean;
  showTimer: boolean;
  showMeters: boolean;
  showInventory: boolean;

  // Limits
  maxAttempts?: number;
  timeLimit?: number;
  passingScore?: number;

  // Audio
  defaultMusicVolume: number;
  defaultSfxVolume: number;
  defaultVoiceVolume: number;

  // Language
  language: string;
  availableLanguages?: string[];

  // Accessibility
  accessibility: AccessibilitySettings;

  // Theming
  theme?: ScenarioTheme;
}

export interface AccessibilitySettings {
  showCaptions: boolean;
  captionsLanguage: string;
  audioDescriptions: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
}

export interface ScenarioTheme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  buttonStyle?: 'rounded' | 'square' | 'pill';
  dialogueBoxStyle?: string;
}

export interface ScenarioAnalyticsConfig {
  trackChoices: boolean;
  trackTime: boolean;
  trackAttempts: boolean;
  trackPath: boolean;
  trackMeters: boolean;
  trackInventory: boolean;
  xapiEnabled: boolean;
  customEvents?: { id: string; name: string; trigger: string; nodeId?: string }[];
}

// =============================================================================
// PLAYBACK STATE
// =============================================================================

export interface ScenarioPlaybackState {
  scenarioId: string;
  currentNodeId: string;
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;

  // Path
  visitedNodes: string[];
  pathTaken: PathEntry[];

  // Variables
  variables: Record<string, unknown>;
  meters: Record<string, number>;
  inventory: Record<string, number>;
  flags: Record<string, boolean>;
  timers: Record<string, TimerState>;
  achievements: string[];

  // Scoring
  score: number;
  maxScore: number;
  correctAnswers: number;
  totalAnswers: number;

  // Time
  startTime: number;
  elapsedTime: number;

  // Attempts
  attempts: number;
  checkpoints: Record<string, unknown>;
}

export interface PathEntry {
  nodeId: string;
  timestamp: number;
  choiceId?: string;
  timeSpent: number;
}

export interface TimerState {
  isRunning: boolean;
  elapsed: number;
  remaining?: number;
}

// =============================================================================
// UNION TYPE FOR NODE DATA
// =============================================================================

export type ScenarioNodeData =
  | SceneNodeData
  | DecisionNodeData
  | BranchNodeData
  | DialogueNodeData
  | NarrationNodeData
  | ActionNodeData
  | FeedbackNodeData
  | AssessmentNodeData
  | VariableNodeData
  | TimerNodeData
  | RandomNodeData
  | MeterNodeData
  | CharacterSelectNodeData
  | InventoryNodeData
  | CheckpointNodeData
  | EndNodeData;
