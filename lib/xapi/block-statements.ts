import type { ActivityDefinition, Result, Verb } from './types';
import { ACTIVITY_TYPES, type ActivityTypeKey, VERBS, type VerbKey } from './vocabulary';

// ============================================================================
// CONTENT BLOCK TYPES
// ============================================================================

/**
 * Content block types supported by the LXP
 */
export type ContentBlockType =
  | 'video'
  | 'quiz'
  | 'interactive'
  | 'reading'
  | 'scenario'
  | 'assessment'
  | 'audio'
  | 'document'
  | 'slideshow'
  | 'simulation';

// ============================================================================
// VERB MAPPINGS PER BLOCK TYPE
// ============================================================================

/**
 * Valid verbs for each content block type
 */
export const BLOCK_VERBS: Record<ContentBlockType, VerbKey[]> = {
  video: ['launched', 'played', 'paused', 'seeked', 'progressed', 'completed', 'terminated'],
  quiz: ['launched', 'attempted', 'answered', 'passed', 'failed', 'completed'],
  interactive: ['launched', 'interacted', 'experienced', 'progressed', 'completed'],
  reading: ['launched', 'progressed', 'completed', 'bookmarked'],
  scenario: ['launched', 'interacted', 'progressed', 'completed'],
  assessment: ['launched', 'attempted', 'answered', 'passed', 'failed', 'completed', 'scored'],
  audio: ['launched', 'played', 'paused', 'seeked', 'progressed', 'completed'],
  document: ['launched', 'progressed', 'completed', 'downloaded'],
  slideshow: ['launched', 'progressed', 'completed'],
  simulation: ['launched', 'interacted', 'experienced', 'progressed', 'completed'],
};

/**
 * Map content block type to xAPI activity type
 */
export const BLOCK_ACTIVITY_TYPES: Record<ContentBlockType, ActivityTypeKey> = {
  video: 'video',
  quiz: 'interaction',
  interactive: 'interaction',
  reading: 'article',
  scenario: 'scenario',
  assessment: 'assessment',
  audio: 'audio',
  document: 'document',
  slideshow: 'slideshow',
  simulation: 'simulation',
};

// ============================================================================
// STATEMENT TEMPLATES
// ============================================================================

/**
 * Template for building xAPI statements for specific block types and verbs
 */
export interface BlockStatementTemplate {
  verb: Verb;
  activityType: string;
  resultTemplate?: Partial<Result>;
  contextExtensions?: Record<string, unknown>;
}

/**
 * Get statement template for a block type and verb
 *
 * @param blockType - The content block type
 * @param verbKey - The verb key
 * @returns Statement template or null if invalid combination
 */
export function getBlockStatementTemplate(
  blockType: ContentBlockType,
  verbKey: VerbKey,
): BlockStatementTemplate | null {
  const validVerbs = BLOCK_VERBS[blockType];
  if (!validVerbs.includes(verbKey)) {
    return null;
  }

  const activityType = ACTIVITY_TYPES[BLOCK_ACTIVITY_TYPES[blockType]];
  const verb = VERBS[verbKey];

  return {
    verb,
    activityType,
    resultTemplate: getResultTemplate(blockType, verbKey),
    contextExtensions: getContextExtensions(blockType, verbKey),
  };
}

/**
 * Get result template based on block type and verb
 */
function getResultTemplate(
  blockType: ContentBlockType,
  verbKey: VerbKey,
): Partial<Result> | undefined {
  // Completion verbs
  if (verbKey === 'completed') {
    return {
      completion: true,
    };
  }

  // Pass/fail verbs
  if (verbKey === 'passed') {
    return {
      success: true,
      completion: true,
    };
  }

  if (verbKey === 'failed') {
    return {
      success: false,
      completion: true,
    };
  }

  // Scored verb
  if (verbKey === 'scored') {
    return {
      // Score will be provided by caller
    };
  }

  // Answered verb for quiz/assessment
  if (verbKey === 'answered' && (blockType === 'quiz' || blockType === 'assessment')) {
    return {
      // Response and score will be provided by caller
    };
  }

  // Progress-related verbs
  if (verbKey === 'progressed') {
    return {
      // Duration and completion percentage provided by caller
    };
  }

  return undefined;
}

/**
 * Get context extensions based on block type and verb
 */
function getContextExtensions(
  blockType: ContentBlockType,
  verbKey: VerbKey,
): Record<string, unknown> | undefined {
  const extensions: Record<string, unknown> = {};

  // Media-specific extensions
  if (blockType === 'video' || blockType === 'audio') {
    if (verbKey === 'played' || verbKey === 'paused' || verbKey === 'seeked') {
      // These will be provided by caller:
      // - media position
      // - playback rate
      return undefined;
    }
  }

  // Assessment-specific extensions
  if (blockType === 'assessment' || blockType === 'quiz') {
    if (verbKey === 'answered') {
      // These will be provided by caller:
      // - attempt number
      // - question details
      return undefined;
    }
  }

  return Object.keys(extensions).length > 0 ? extensions : undefined;
}

// ============================================================================
// VIDEO-SPECIFIC TEMPLATES
// ============================================================================

export const VIDEO_EXTENSIONS = {
  time: 'https://w3id.org/xapi/video/extensions/time',
  timeFrom: 'https://w3id.org/xapi/video/extensions/time-from',
  timeTo: 'https://w3id.org/xapi/video/extensions/time-to',
  length: 'https://w3id.org/xapi/video/extensions/length',
  progress: 'https://w3id.org/xapi/video/extensions/progress',
  playbackRate: 'https://w3id.org/xapi/video/extensions/played-segments',
  volume: 'https://w3id.org/xapi/video/extensions/volume',
  fullScreen: 'https://w3id.org/xapi/video/extensions/full-screen',
  screenSize: 'https://w3id.org/xapi/video/extensions/screen-size',
  videoPlaybackSize: 'https://w3id.org/xapi/video/extensions/video-playback-size',
  quality: 'https://w3id.org/xapi/video/extensions/quality',
  ccSubtitleEnabled: 'https://w3id.org/xapi/video/extensions/cc-subtitle-enabled',
  ccSubtitleLang: 'https://w3id.org/xapi/video/extensions/cc-subtitle-lang',
  sessionId: 'https://w3id.org/xapi/video/extensions/session-id',
} as const;

/**
 * Build video result extensions
 */
export function buildVideoResultExtensions(options: {
  time?: number;
  progress?: number;
  playedSegments?: string;
}): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  if (options.time !== undefined) {
    extensions[VIDEO_EXTENSIONS.time] = options.time;
  }
  if (options.progress !== undefined) {
    extensions[VIDEO_EXTENSIONS.progress] = options.progress;
  }
  if (options.playedSegments !== undefined) {
    extensions[VIDEO_EXTENSIONS.playbackRate] = options.playedSegments;
  }

  return extensions;
}

/**
 * Build video context extensions
 */
export function buildVideoContextExtensions(options: {
  length?: number;
  fullScreen?: boolean;
  quality?: string;
  volume?: number;
  sessionId?: string;
}): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  if (options.length !== undefined) {
    extensions[VIDEO_EXTENSIONS.length] = options.length;
  }
  if (options.fullScreen !== undefined) {
    extensions[VIDEO_EXTENSIONS.fullScreen] = options.fullScreen;
  }
  if (options.quality !== undefined) {
    extensions[VIDEO_EXTENSIONS.quality] = options.quality;
  }
  if (options.volume !== undefined) {
    extensions[VIDEO_EXTENSIONS.volume] = options.volume;
  }
  if (options.sessionId !== undefined) {
    extensions[VIDEO_EXTENSIONS.sessionId] = options.sessionId;
  }

  return extensions;
}

// ============================================================================
// QUIZ/ASSESSMENT INTERACTION TEMPLATES
// ============================================================================

export const INTERACTION_EXTENSIONS = {
  attemptNumber: 'https://lxp360.com/xapi/extensions/attempt-number',
  questionId: 'https://lxp360.com/xapi/extensions/question-id',
  questionType: 'https://lxp360.com/xapi/extensions/question-type',
  timeSpent: 'https://lxp360.com/xapi/extensions/time-spent',
  hintsUsed: 'https://lxp360.com/xapi/extensions/hints-used',
  feedback: 'https://lxp360.com/xapi/extensions/feedback',
} as const;

/**
 * Build activity definition for quiz/assessment questions
 */
export function buildInteractionDefinition(options: {
  type:
    | 'true-false'
    | 'choice'
    | 'fill-in'
    | 'matching'
    | 'sequencing'
    | 'likert'
    | 'numeric'
    | 'other';
  name: string;
  description?: string;
  correctResponses?: string[];
  choices?: Array<{ id: string; description: string }>;
}): ActivityDefinition {
  const definition: ActivityDefinition = {
    type: ACTIVITY_TYPES.interaction,
    name: { 'en-US': options.name },
    interactionType: options.type,
  };

  if (options.description) {
    definition.description = { 'en-US': options.description };
  }

  if (options.correctResponses) {
    definition.correctResponsesPattern = options.correctResponses;
  }

  if (options.choices && (options.type === 'choice' || options.type === 'sequencing')) {
    definition.choices = options.choices.map((choice) => ({
      id: choice.id,
      description: { 'en-US': choice.description },
    }));
  }

  return definition;
}

// ============================================================================
// READING/DOCUMENT TEMPLATES
// ============================================================================

export const READING_EXTENSIONS = {
  pageNumber: 'https://lxp360.com/xapi/extensions/page-number',
  totalPages: 'https://lxp360.com/xapi/extensions/total-pages',
  scrollPercentage: 'https://lxp360.com/xapi/extensions/scroll-percentage',
  timeOnPage: 'https://lxp360.com/xapi/extensions/time-on-page',
  highlightedText: 'https://lxp360.com/xapi/extensions/highlighted-text',
  bookmarkPosition: 'https://lxp360.com/xapi/extensions/bookmark-position',
} as const;

/**
 * Build reading progress result
 */
export function buildReadingProgressResult(options: {
  pageNumber: number;
  totalPages: number;
  scrollPercentage?: number;
  duration?: string;
}): Result {
  const progress = options.pageNumber / options.totalPages;

  return {
    completion: progress >= 1,
    extensions: {
      [READING_EXTENSIONS.pageNumber]: options.pageNumber,
      [READING_EXTENSIONS.totalPages]: options.totalPages,
      ...(options.scrollPercentage !== undefined && {
        [READING_EXTENSIONS.scrollPercentage]: options.scrollPercentage,
      }),
    },
    ...(options.duration && { duration: options.duration }),
  };
}

// ============================================================================
// SCENARIO/BRANCHING TEMPLATES
// ============================================================================

export const SCENARIO_EXTENSIONS = {
  choiceId: 'https://lxp360.com/xapi/extensions/choice-id',
  choiceText: 'https://lxp360.com/xapi/extensions/choice-text',
  branchId: 'https://lxp360.com/xapi/extensions/branch-id',
  scenarioPath: 'https://lxp360.com/xapi/extensions/scenario-path',
  optimalPath: 'https://lxp360.com/xapi/extensions/optimal-path',
  pathDeviation: 'https://lxp360.com/xapi/extensions/path-deviation',
} as const;

/**
 * Build scenario choice result
 */
export function buildScenarioChoiceResult(options: {
  choiceId: string;
  choiceText: string;
  branchId: string;
  isOptimal?: boolean;
}): Result {
  return {
    response: options.choiceId,
    extensions: {
      [SCENARIO_EXTENSIONS.choiceId]: options.choiceId,
      [SCENARIO_EXTENSIONS.choiceText]: options.choiceText,
      [SCENARIO_EXTENSIONS.branchId]: options.branchId,
      ...(options.isOptimal !== undefined && {
        [SCENARIO_EXTENSIONS.optimalPath]: options.isOptimal,
      }),
    },
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if a verb is valid for a given block type
 */
export function isValidBlockVerb(blockType: ContentBlockType, verbKey: VerbKey): boolean {
  return BLOCK_VERBS[blockType]?.includes(verbKey) ?? false;
}

/**
 * Get all valid verbs for a block type
 */
export function getValidVerbs(blockType: ContentBlockType): VerbKey[] {
  return BLOCK_VERBS[blockType] ?? [];
}

/**
 * Get the activity type for a block type
 */
export function getBlockActivityType(blockType: ContentBlockType): string {
  const typeKey = BLOCK_ACTIVITY_TYPES[blockType];
  return ACTIVITY_TYPES[typeKey];
}
