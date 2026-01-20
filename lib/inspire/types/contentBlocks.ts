export interface ContentBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  metadata?: BlockMetadata;
}

/**
 * Union type of all content block type strings
 */
export type ContentBlockType =
  | 'heading'
  | 'text'
  | 'richtext'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'quote'
  | 'list'
  | 'divider'
  | 'spacer'
  | 'callout'
  | 'code'
  | 'table'
  | 'tabs'
  | 'accordion'
  | 'embed'
  | 'html'
  | 'multiple-choice'
  | 'true-false'
  | 'short-answer'
  | 'essay'
  | 'fill-blank'
  | 'matching'
  | 'sorting'
  | 'hotspot'
  | 'timeline'
  | 'flashcard'
  | 'poll'
  | 'survey'
  | 'slider'
  | 'reflection'
  | 'discussion'
  | 'peer-review'
  | 'collaboration'
  | 'scenario'
  | 'simulation'
  | 'decision-tree'
  | 'conversation'
  | 'mind-map'
  | 'interactive-infographic'
  | 'personalized-action-plan'
  | 'diagnostic-test'
  | 'software-simulation'
  | 'vr-simulation'
  | 'ar-portal'
  | 'calculator'
  | 'spreadsheet'
  | 'branching'
  | 'quiz'
  | 'alert'
  | 'button'
  | 'checklist'
  | 'critical-incident'
  | 'moral-dilemma';

export interface BlockMetadata {
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  author?: string;
}

/**
 * Base content extension interface - allows additional properties on block content
 * This enables forward compatibility with new properties added by block editors
 */
export interface ExtendedBlockContent {
  [key: string]: unknown;
}

export interface TextBlockContent {
  text: string;
  format?: 'plain' | 'markdown' | 'html';
}

export type ImageSize = 'small' | 'medium' | 'large' | 'full';
export type ImageAlignment = 'left' | 'center' | 'right';

export interface ImageBlockContent {
  src?: string;
  url?: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  size?: ImageSize;
  alignment?: ImageAlignment;
  link?: string;
  rounded?: boolean;
  shadow?: boolean;
  border?: boolean;
}

export type VideoAspectRatio = '16:9' | '4:3' | '1:1';

export interface VideoBlockContent {
  src?: string;
  url?: string;
  title?: string;
  captions?: string;
  captionsUrl?: string;
  transcript?: string;
  poster?: string;
  aspectRatio?: VideoAspectRatio;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  startTime?: number;
}

export interface QuizBlockContent {
  question: string;
  options: QuizOption[];
  correctAnswers: number[];
  explanation?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// Generic Block Types - extending ContentBlock for specific block types
export interface AccordionPanel {
  id: string;
  title: string;
  content: string;
  isOpen?: boolean;
}

export interface AccordionBlock extends ContentBlock {
  type: 'accordion';
  content: {
    items: AccordionPanel[];
    allowMultiple?: boolean;
    [key: string]: unknown;
  };
}

export interface AlertBlock extends ContentBlock {
  type: 'alert';
  content: {
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    dismissible?: boolean;
    [key: string]: unknown;
  };
}

export interface ARPortalBlock extends ContentBlock {
  type: 'ar-portal';
  content: {
    modelUrl: string;
    title?: string;
    description?: string;
    environmentUrl?: string;
    environmentType?: string;
    trigger?: string;
    transitionEffect?: string;
    audioUrl?: string;
    durationSeconds?: number;
    allowNavigation?: boolean;
    showExitButton?: boolean;
    enableHotspots?: boolean;
    gyroscopeControl?: boolean;
    [key: string]: unknown;
  };
}

export interface AudioBlock extends ContentBlock {
  type: 'audio';
  content: {
    src: string;
    url?: string;
    title?: string;
    caption?: string;
    transcript?: string;
    transcriptUrl?: string;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
    allowDownload?: boolean;
    [key: string]: unknown;
  };
}

export type ButtonStyle = 'primary' | 'secondary' | 'success' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonBlock extends ContentBlock {
  type: 'button';
  content: {
    label: string;
    text?: string;
    action: string;
    url?: string;
    variant?: string;
    style?: ButtonStyle;
    size?: ButtonSize;
    [key: string]: unknown;
  };
}

export interface CalculatorVariable {
  id: string;
  name: string;
  label: string;
  defaultValue?: number;
}

export interface CalculatorBlock extends ContentBlock {
  type: 'calculator';
  content: {
    formula: string;
    title?: string;
    description?: string;
    variables: CalculatorVariable[];
    displayMode?: string;
    [key: string]: unknown;
  };
}

export interface ChecklistBlock extends ContentBlock {
  type: 'checklist';
  content: {
    items: Array<{ id: string; text: string; checked?: boolean; [key: string]: unknown }>;
    title?: string;
    showProgress?: boolean;
    [key: string]: unknown;
  };
}

export interface CodeBlock extends ContentBlock {
  type: 'code';
  content: {
    code: string;
    language: string;
    filename?: string;
    showLineNumbers?: boolean;
    wrapLines?: boolean;
    copyButton?: boolean;
    highlightLines?: number[];
    theme?: string;
    [key: string]: unknown;
  };
}

export interface CollaborationBlock extends ContentBlock {
  type: 'collaboration';
  content: {
    tool: string;
    title?: string;
    instruction?: string;
    activityType?: string;
    groupSize?: number;
    config: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export interface IncidentFactor {
  id: string;
  factor: string;
  isCritical: boolean;
  text?: string;
  explanation?: string;
}

export interface IncidentResponseOption {
  id: string;
  response: string;
  isCorrect: boolean;
  feedback: string;
  text?: string;
  isOptimal?: boolean;
  points?: number;
}

export interface CriticalIncidentBlock extends ContentBlock {
  type: 'critical-incident';
  content: {
    title?: string;
    scenario: string;
    incidentType?: string;
    severityLevel?: string;
    imageUrl?: string;
    documentUrl?: string;
    hasTimeLimit?: boolean;
    timeLimitMinutes?: number;
    showFactorsToLearner?: boolean;
    allowMultipleAttempts?: boolean;
    showDetailedFeedback?: boolean;
    requireJustification?: boolean;
    factors?: IncidentFactor[];
    responseOptions?: IncidentResponseOption[];
    options: Array<{ id: string; text: string; outcome: string }>;
    [key: string]: unknown;
  };
}

export interface DecisionTreeBranch {
  label: string;
  targetId: string;
}

export interface DecisionTreeNode {
  id: string;
  type: 'decision' | 'action' | 'outcome';
  label: string;
  description?: string;
  branches?: DecisionTreeBranch[];
  isCorrect?: boolean;
  [key: string]: unknown;
}

export interface DecisionTreeBlock extends ContentBlock {
  type: 'decision-tree';
  content: {
    title?: string;
    instructions?: string;
    nodes: DecisionTreeNode[];
    [key: string]: unknown;
  };
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false';
  options?: string[];
  correctAnswer: number | boolean;
  skillArea: string;
  competencyLevel: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  [key: string]: unknown;
}

export interface DiagnosticTestBlock extends ContentBlock {
  type: 'diagnostic-test';
  content: {
    title?: string;
    instructions?: string;
    questions: DiagnosticQuestion[];
    passingScore?: number;
    timeLimit?: number;
    [key: string]: unknown;
  };
}

export interface DiscussionBlock extends ContentBlock {
  type: 'discussion';
  content: {
    prompt: string;
    moderationEnabled?: boolean;
    allowReplies?: boolean;
    requireApproval?: boolean;
    [key: string]: unknown;
  };
}

export interface DividerBlock extends ContentBlock {
  type: 'divider';
  content: {
    style?: string;
    thickness?: number;
    [key: string]: unknown;
  };
}

export interface DragDropBlock extends ContentBlock {
  type: 'drag-drop';
  content: {
    instruction?: string;
    explanation?: string;
    items: Array<{
      id: string;
      text?: string;
      content?: string;
      correctZone: string;
      [key: string]: unknown;
    }>;
    zones: Array<{ id: string; label: string; [key: string]: unknown }>;
    [key: string]: unknown;
  };
}

export interface EmbedBlock extends ContentBlock {
  type: 'embed';
  content: {
    url: string;
    title?: string;
    provider?: string;
    html?: string;
    embedCode?: string;
    height?: number;
    [key: string]: unknown;
  };
}

export interface RubricLevel {
  name: string;
  points: number;
  description: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

export interface EssayBlock extends ContentBlock {
  type: 'essay';
  content: {
    title?: string;
    prompt: string;
    guidelines?: string;
    minWords?: number;
    maxWords?: number;
    timeLimit?: number;
    rubric?: string;
    rubricCriteria?: RubricCriterion[];
    points?: number;
    passingScore?: number;
    allowDraft?: boolean;
    allowRevision?: boolean;
    requirePeerReview?: boolean;
    plagiarismCheck?: boolean;
    anonymousGrading?: boolean;
    resources?: string;
    [key: string]: unknown;
  };
}

export interface FileBlock extends ContentBlock {
  type: 'file';
  content: {
    url: string;
    filename: string;
    fileType: string;
    size?: number;
    [key: string]: unknown;
  };
}

export interface FillBlankItem {
  id: string;
  correctAnswer: string[];
  position: number;
  caseSensitive?: boolean;
  hint?: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
  points?: number;
}

export interface FillBlankBlock extends ContentBlock {
  type: 'fill-blank';
  content: {
    text: string;
    title?: string;
    instructions?: string;
    blanks: FillBlankItem[];
    points?: number;
    passingScore?: number;
    allowRetry?: boolean;
    showHints?: boolean;
    instantFeedback?: boolean;
    shuffleBlanks?: boolean;
    explanation?: string;
    [key: string]: unknown;
  };
}

export interface FlashcardBlock extends ContentBlock {
  type: 'flashcard';
  content: {
    cards: Array<{ id: string; front: string; back: string; [key: string]: unknown }>;
    shuffleCards?: boolean;
    [key: string]: unknown;
  };
}

export interface HeadingBlock extends ContentBlock {
  type: 'heading';
  content: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
    [key: string]: unknown;
  };
}

export interface HotspotItem {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  content?: string;
  [key: string]: unknown;
}

export interface HotspotBlock extends ContentBlock {
  type: 'hotspot';
  content: {
    imageUrl: string;
    hotspots: HotspotItem[];
    [key: string]: unknown;
  };
}

export interface ImageBlock extends ContentBlock {
  type: 'image';
  content: ImageBlockContent & { [key: string]: unknown };
}

export interface InfographicHotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  content: string;
  icon?: string;
  [key: string]: unknown;
}

export interface InteractiveInfographicBlock extends ContentBlock {
  type: 'interactive-infographic';
  content: {
    title: string;
    imageUrl?: string;
    layoutType?: string;
    animationStyle?: string;
    hotspots?: InfographicHotspot[];
    [key: string]: unknown;
  };
}

export interface SpreadsheetCell {
  value: string;
  type: 'text' | 'number' | 'formula' | 'readonly';
  isEditable: boolean;
  validationFormula?: string;
}

export interface InteractiveSpreadsheetBlock extends ContentBlock {
  type: 'interactive-spreadsheet';
  content: {
    title: string;
    instructions: string;
    grid: SpreadsheetCell[][];
    rows: number;
    cols: number;
    data?: unknown[][];
    editable?: boolean;
    [key: string]: unknown;
  };
}

export type ListStyle = 'number' | 'roman' | 'letter';

export interface ListBlock extends ContentBlock {
  type: 'list';
  content: {
    items: string[];
    ordered?: boolean;
    style?: ListStyle;
    [key: string]: unknown;
  };
}

export interface MatchingBlock extends ContentBlock {
  type: 'matching';
  content: {
    pairs: Array<{ id: string; left: string; right: string; [key: string]: unknown }>;
    [key: string]: unknown;
  };
}

export interface MindMapBlock extends ContentBlock {
  type: 'mind-map';
  content: {
    title: string;
    nodes: Array<{ id: string; text: string; parentId?: string; [key: string]: unknown }>;
    [key: string]: unknown;
  };
}

export interface MoralDilemmaChoiceOption {
  id: string;
  choice: string;
  shortTerm: string;
  longTerm: string;
  stakeholdersAffected: string[];
  ethicalFramework?: string;
  consequences?: string;
}

export interface MoralDilemmaStakeholder {
  id: string;
  name: string;
  role: string;
  interests: string;
}

export interface MoralDilemmaBlock extends ContentBlock {
  type: 'moral-dilemma';
  content: {
    title?: string;
    scenario?: string;
    dilemmaType?: string;
    complexityLevel?: string;
    backgroundContext?: string;
    stakeholders?: MoralDilemmaStakeholder[];
    choices?: MoralDilemmaChoiceOption[];
    requiredFrameworks?: string[];
    requireJustification?: boolean;
    requireFrameworkReference?: boolean;
    requireStakeholderAnalysis?: boolean;
    enablePeerDiscussion?: boolean;
    minWordCount?: number;
    reflectionPrompts?: string;
    [key: string]: unknown;
  };
}

export interface MultipleChoiceBlock extends ContentBlock {
  type: 'multiple-choice';
  content: QuizBlockContent & { [key: string]: unknown };
}

export interface PersonalizedActionPlanBlock extends ContentBlock {
  type: 'personalized-action-plan';
  content: {
    title: string;
    analysisMethod: 'automatic' | 'manual';
    passingThreshold: number;
    includeRemediation: boolean;
    includeStrengths: boolean;
    downloadFormat: 'pdf' | 'docx';
    template?: string;
    fields?: Array<{ id: string; label: string; type: string; [key: string]: unknown }>;
    [key: string]: unknown;
  };
}

export interface PollOption {
  id: string;
  text: string;
  color?: string;
  imageUrl?: string;
}

export interface PollBlock extends ContentBlock {
  type: 'poll';
  content: {
    question: string;
    description?: string;
    options: PollOption[];
    allowMultiple?: boolean;
    multipleChoice?: boolean;
    anonymous?: boolean;
    allowChangeVote?: boolean;
    showResults?: boolean;
    showRealTimeResults?: boolean;
    showVoteCount?: boolean;
    hasTimeLimit?: boolean;
    timeLimitHours?: number;
    resultVisualization?: 'bar' | 'pie' | 'list';
    [key: string]: unknown;
  };
}

export interface QuizBlock extends ContentBlock {
  type: 'quiz';
  content: QuizBlockContent & { [key: string]: unknown };
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: string;
  skillArea?: string;
  competencyLevel?: string;
  options?: QuizOption[];
  correctAnswer?: string | number | number[];
  explanation?: string;
  points?: number;
  [key: string]: unknown;
}

export interface QuoteBlock extends ContentBlock {
  type: 'quote';
  content: {
    text: string;
    author?: string;
    source?: string;
    [key: string]: unknown;
  };
}

export interface ReflectionBlock extends ContentBlock {
  type: 'reflection';
  content: {
    prompt: string;
    guidingQuestions?: string[];
    [key: string]: unknown;
  };
}

export interface JournalPrompt {
  id: string;
  question: string;
  category: string;
  required: boolean;
  [key: string]: unknown;
}

export interface ReflectiveJournalBlock extends ContentBlock {
  type: 'reflective-journal';
  content: {
    title: string;
    description?: string;
    frequency?: string;
    privacy?: string;
    prompts: JournalPrompt[];
    downloadable?: boolean;
    autosave?: boolean;
    showTimestamps?: boolean;
    private?: boolean;
    [key: string]: unknown;
  };
}

export interface RichTextBlock extends ContentBlock {
  type: 'rich-text';
  content: {
    html: string;
    [key: string]: unknown;
  };
}

export interface ScenarioChoice {
  id: string;
  text: string;
  nextSceneId: string;
  feedback?: string;
}

export interface ScenarioScene {
  id: string;
  text: string;
  choices: ScenarioChoice[];
}

export interface ScenarioBlock extends ContentBlock {
  type: 'scenario';
  content: {
    title: string;
    description: string;
    startSceneId?: string;
    scenes: ScenarioScene[];
    branches?: Array<{ id: string; condition: string; outcome: string }>;
    [key: string]: unknown;
  };
}

export interface ShortAnswerBlock extends ContentBlock {
  type: 'short-answer';
  content: {
    question: string;
    maxLength?: number;
    expectedAnswer?: string;
    [key: string]: unknown;
  };
}

export type SimulationDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SimulationBlock extends ContentBlock {
  type: 'simulation';
  content: {
    title: string;
    description: string;
    simulationType: string;
    url?: string;
    difficulty?: SimulationDifficulty;
    objectives?: string;
    timeLimit?: number;
    config?: string;
    enableScoring?: boolean;
    passingScore?: number;
    maxAttempts?: number;
    allowReset?: boolean;
    showInstructions?: boolean;
    fullscreen?: boolean;
    [key: string]: unknown;
  };
}

export interface SliderBlock extends ContentBlock {
  type: 'slider';
  content: {
    question: string;
    min: number;
    max: number;
    step: number;
    correctValue?: number;
    unit?: string;
    explanation?: string;
    defaultValue?: number;
    label?: string;
    [key: string]: unknown;
  };
}

export interface SoftwareSimulationBlock extends ContentBlock {
  type: 'software-simulation';
  content: {
    steps: Array<{ id: string; action: string; screenshot?: string; [key: string]: unknown }>;
    [key: string]: unknown;
  };
}

export interface SortingBlock extends ContentBlock {
  type: 'sorting';
  content: {
    items: Array<{ id: string; text: string; correctPosition: number; [key: string]: unknown }>;
    [key: string]: unknown;
  };
}

export type SurveyQuestionType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'time'
  | 'yes_no'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'rating'
  | 'scale'
  | 'nps'
  | 'emoji'
  | 'star';

export interface SurveyQuestion {
  id: string;
  question: string;
  type: SurveyQuestionType;
  required: boolean;
  description?: string;
  options?: string[];
  min?: number;
  max?: number;
  [key: string]: unknown;
}

export interface SurveyBlock extends ContentBlock {
  type: 'survey';
  content: {
    title: string;
    description?: string;
    questions: SurveyQuestion[];
    anonymous?: boolean;
    showProgressBar?: boolean;
    oneQuestionPerPage?: boolean;
    randomizeQuestions?: boolean;
    [key: string]: unknown;
  };
}

export interface TabPanel {
  id: string;
  title: string;
  content: string;
  [key: string]: unknown;
}

export interface TableBlock extends ContentBlock {
  type: 'table';
  content: {
    headers: string[];
    rows: string[][];
    [key: string]: unknown;
  };
}

export interface TabsBlock extends ContentBlock {
  type: 'tabs';
  content: {
    tabs: TabPanel[];
    [key: string]: unknown;
  };
}

export interface TextBlock extends ContentBlock {
  type: 'text';
  content: TextBlockContent & { [key: string]: unknown };
}

export interface TimelineBlock extends ContentBlock {
  type: 'timeline';
  content: {
    events: Array<{
      id: string;
      date: string;
      title: string;
      description?: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
}

export interface TrueFalseBlock extends ContentBlock {
  type: 'true-false';
  content: {
    question: string;
    correctAnswer: boolean;
    explanation?: string;
    [key: string]: unknown;
  };
}

export interface VideoBlock extends ContentBlock {
  type: 'video';
  content: VideoBlockContent & { [key: string]: unknown };
}

export interface VRSimulationBlock extends ContentBlock {
  type: 'vr-simulation';
  content: {
    title: string;
    description?: string;
    environmentUrl?: string;
    simulationType?: string;
    difficultyLevel?: string;
    compatibleHeadsets?: string[];
    movementType?: string;
    interactionMethod?: string;
    graphicsQuality?: string;
    frameRateTarget?: number;
    durationMinutes?: number;
    taskCount?: number;
    enablePerformanceTracking?: boolean;
    enableRecording?: boolean;
    allowRetry?: boolean;
    showHints?: boolean;
    safetyInstructions?: string;
    enableComfortMode?: boolean;
    showBoundaryWarnings?: boolean;
    interactionPoints?: Array<{
      id: string;
      position: { x: number; y: number; z: number };
      action: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
}

// Wizard and Course Builder Types
export type WizardStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface LearnerPersona {
  id: string;
  name: string;
  role: string;
  experience: string;
  goals: string[];
  challenges: string[];
}

export interface BusinessDriver {
  id: string;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  influence: 'high' | 'medium' | 'low';
  expectations: string[];
}

export interface AccessibilityRequirement {
  id: string;
  type: string;
  description: string;
  wcagLevel: WCAGLevel;
}

export type WCAGLevel = 'A' | 'AA' | 'AAA';

export interface TechnicalEnvironment {
  platform: string;
  devices: string[];
  browsers: string[];
  bandwidth: string;
  lms?: string;
}

export interface LearningModality {
  id: string;
  type: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';
  percentage: number;
}

export interface ModalityMix {
  modalities: LearningModality[];
  primaryModality: string;
}

export interface ReinforcementStrategy {
  id: string;
  type: ReinforcementStrategyType;
  description: string;
  frequency: string;
}

export type ReinforcementStrategyType =
  | 'spaced-repetition'
  | 'practice-tests'
  | 'peer-teaching'
  | 'real-world-application';

export interface ScheduledActivity {
  id: string;
  title: string;
  type: string;
  duration: number;
  date: string;
}

export type ProjectStatus = 'draft' | 'in-progress' | 'review' | 'published' | 'archived';

export type Primitive = string | number | boolean | null | undefined;

export type { ContentBlock as default };
