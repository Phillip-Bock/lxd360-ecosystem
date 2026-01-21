import { v4 as uuidv4 } from 'uuid';
import {
  BLOCK_ACTIVITY_TYPES,
  type ContentBlockType,
  INTERACTION_EXTENSIONS,
  isValidBlockVerb,
  READING_EXTENSIONS,
  SCENARIO_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from './block-statements';
import type { Activity, ActivityDefinition, Actor, Context, Result, Statement } from './types';
import { LXP360Extensions } from './types';
import type { ActivityTypeKey, VerbKey } from './vocabulary';
import { ACTIVITY_TYPES, buildActivityId, formatDuration, VERBS } from './vocabulary';

// ============================================================================
// TYPES
// ============================================================================

export interface GenerateStatementOptions {
  /** Unique ID for the activity */
  activityId: string;
  /** Human-readable name of the activity */
  activityName: string;
  /** Optional description */
  activityDescription?: string;
  /** Result data */
  result?: Partial<Result>;
  /** Context data */
  context?: Partial<Context>;
  /** Statement timestamp (defaults to now) */
  timestamp?: string;
  /** Registration UUID for the learning session */
  registration?: string;
  /** Parent activity (e.g., course, module) */
  parentActivity?: {
    id: string;
    name: string;
    type: ActivityTypeKey;
  };
  /** Grouping activities */
  groupingActivities?: Array<{
    id: string;
    name: string;
    type: ActivityTypeKey;
  }>;
}

export interface VideoStatementOptions extends GenerateStatementOptions {
  /** Current playback time in seconds */
  time?: number;
  /** Progress as decimal (0-1) */
  progress?: number;
  /** Video duration in seconds */
  duration?: number;
  /** Playback rate (e.g., 1.0, 1.5, 2.0) */
  playbackRate?: number;
  /** Video quality setting */
  quality?: string;
  /** Is fullscreen */
  fullScreen?: boolean;
  /** Volume level (0-1) */
  volume?: number;
  /** Seek from time (for seeked verb) */
  seekFrom?: number;
  /** Seek to time (for seeked verb) */
  seekTo?: number;
  /** Session ID for video playback tracking */
  videoSessionId?: string;
}

export interface QuizStatementOptions extends GenerateStatementOptions {
  /** Question ID */
  questionId?: string;
  /** User's response */
  response?: string;
  /** Score details */
  score?: {
    scaled?: number;
    raw?: number;
    min?: number;
    max?: number;
  };
  /** Whether the answer was correct */
  success?: boolean;
  /** Attempt number */
  attemptNumber?: number;
  /** Time spent on question */
  timeSpent?: number;
  /** Hints used count */
  hintsUsed?: number;
  /** Interaction type */
  interactionType?:
    | 'true-false'
    | 'choice'
    | 'fill-in'
    | 'matching'
    | 'sequencing'
    | 'likert'
    | 'numeric';
  /** Available choices */
  choices?: Array<{ id: string; description: string }>;
  /** Correct response pattern */
  correctResponses?: string[];
}

export interface ReadingStatementOptions extends GenerateStatementOptions {
  /** Current page number */
  pageNumber?: number;
  /** Total pages */
  totalPages?: number;
  /** Scroll percentage (0-100) */
  scrollPercentage?: number;
  /** Time spent reading in seconds */
  timeSpent?: number;
  /** Bookmark position */
  bookmarkPosition?: string;
}

export interface ScenarioStatementOptions extends GenerateStatementOptions {
  /** Choice ID selected */
  choiceId?: string;
  /** Choice text */
  choiceText?: string;
  /** Branch ID navigated to */
  branchId?: string;
  /** Whether this was the optimal path */
  isOptimalPath?: boolean;
  /** Path taken through scenario */
  scenarioPath?: string[];
}

// ============================================================================
// CORE GENERATOR FUNCTION
// ============================================================================

/**
 * Generate an xAPI statement for a content block interaction
 *
 * @param blockType - The type of content block
 * @param verb - The verb describing the interaction
 * @param actor - The learner performing the action
 * @param options - Statement options
 * @returns Complete xAPI statement ready for storage
 *
 * @throws Error if the verb is not valid for the block type
 *
 * @example
 * ```ts
 * const statement = generateBlockStatement(
 *   'video',
 *   'played',
 *   { objectType: 'Agent', mbox: 'mailto:user@example.com', name: 'John Doe' },
 *   {
 *     activityId: 'intro-video-1',
 *     activityName: 'Introduction to Safety',
 *     time: 45,
 *     duration: 300,
 *   }
 * )
 * ```
 */
export function generateBlockStatement(
  blockType: ContentBlockType,
  verb: VerbKey,
  actor: Actor,
  options: GenerateStatementOptions,
): Statement {
  // Validate verb for block type
  if (!isValidBlockVerb(blockType, verb)) {
    throw new Error(`Invalid verb "${verb}" for block type "${blockType}"`);
  }

  // Build activity object
  const activityType = BLOCK_ACTIVITY_TYPES[blockType];
  const activity = buildActivity(
    options.activityId,
    options.activityName,
    activityType,
    options.activityDescription,
  );

  // Build context with parent/grouping if provided
  const context = buildContext(options);

  // Build the statement
  const statement: Statement = {
    id: uuidv4(),
    actor,
    verb: VERBS[verb],
    object: activity,
    timestamp: options.timestamp ?? new Date().toISOString(),
    version: '1.0.3',
  };

  // Add result if provided
  if (options.result && Object.keys(options.result).length > 0) {
    statement.result = options.result;
  }

  // Add context
  if (Object.keys(context).length > 0) {
    statement.context = context;
  }

  return statement;
}

// ============================================================================
// SPECIALIZED GENERATORS
// ============================================================================

/**
 * Generate a video interaction statement
 */
export function generateVideoStatement(
  verb: 'launched' | 'played' | 'paused' | 'seeked' | 'progressed' | 'completed' | 'terminated',
  actor: Actor,
  options: VideoStatementOptions,
): Statement {
  // Build result with video-specific extensions
  const result: Result = {
    ...options.result,
    extensions: {
      ...options.result?.extensions,
    },
  };

  // Add time extension
  if (options.time !== undefined) {
    result.extensions = {
      ...result.extensions,
      [VIDEO_EXTENSIONS.time]: options.time,
    };
  }

  // Add progress
  if (options.progress !== undefined) {
    result.extensions = {
      ...result.extensions,
      [VIDEO_EXTENSIONS.progress]: options.progress,
    };
  }

  // For completed verb, mark completion
  if (verb === 'completed') {
    result.completion = true;
    if (options.duration !== undefined) {
      result.duration = formatDuration(options.duration);
    }
  }

  // For seeked verb, add seek times
  if (verb === 'seeked') {
    result.extensions = {
      ...result.extensions,
      [VIDEO_EXTENSIONS.timeFrom]: options.seekFrom ?? 0,
      [VIDEO_EXTENSIONS.timeTo]: options.seekTo ?? options.time ?? 0,
    };
  }

  // Build context extensions
  const contextExtensions: Record<string, unknown> = {};
  if (options.duration !== undefined) {
    contextExtensions[VIDEO_EXTENSIONS.length] = options.duration;
  }
  if (options.fullScreen !== undefined) {
    contextExtensions[VIDEO_EXTENSIONS.fullScreen] = options.fullScreen;
  }
  if (options.quality !== undefined) {
    contextExtensions[VIDEO_EXTENSIONS.quality] = options.quality;
  }
  if (options.volume !== undefined) {
    contextExtensions[VIDEO_EXTENSIONS.volume] = options.volume;
  }
  if (options.videoSessionId !== undefined) {
    contextExtensions[VIDEO_EXTENSIONS.sessionId] = options.videoSessionId;
  }

  const baseOptions: GenerateStatementOptions = {
    ...options,
    result:
      Object.keys(result.extensions ?? {}).length > 0 || result.completion ? result : undefined,
    context: {
      ...options.context,
      extensions: {
        ...options.context?.extensions,
        ...contextExtensions,
      },
    },
  };

  return generateBlockStatement('video', verb, actor, baseOptions);
}

/**
 * Generate a quiz/assessment interaction statement
 */
export function generateQuizStatement(
  verb: 'launched' | 'attempted' | 'answered' | 'passed' | 'failed' | 'completed' | 'scored',
  actor: Actor,
  options: QuizStatementOptions,
): Statement {
  // Build result
  const result: Result = {
    ...options.result,
  };

  // Add response
  if (options.response !== undefined) {
    result.response = options.response;
  }

  // Add score
  if (options.score) {
    result.score = options.score;
  }

  // Add success for answered/passed/failed
  if (verb === 'passed') {
    result.success = true;
    result.completion = true;
  } else if (verb === 'failed') {
    result.success = false;
    result.completion = true;
  } else if (verb === 'answered' && options.success !== undefined) {
    result.success = options.success;
  }

  // Completed verb
  if (verb === 'completed') {
    result.completion = true;
  }

  // Add quiz-specific extensions
  const resultExtensions: Record<string, unknown> = {
    ...result.extensions,
  };

  if (options.attemptNumber !== undefined) {
    resultExtensions[INTERACTION_EXTENSIONS.attemptNumber] = options.attemptNumber;
  }
  if (options.questionId !== undefined) {
    resultExtensions[INTERACTION_EXTENSIONS.questionId] = options.questionId;
  }
  if (options.timeSpent !== undefined) {
    resultExtensions[INTERACTION_EXTENSIONS.timeSpent] = options.timeSpent;
    result.duration = formatDuration(options.timeSpent);
  }
  if (options.hintsUsed !== undefined) {
    resultExtensions[INTERACTION_EXTENSIONS.hintsUsed] = options.hintsUsed;
  }

  if (Object.keys(resultExtensions).length > 0) {
    result.extensions = resultExtensions;
  }

  // Build activity definition with interaction type
  const baseOptions: GenerateStatementOptions = {
    ...options,
    result: Object.keys(result).length > 0 ? result : undefined,
  };

  return generateBlockStatement('quiz', verb, actor, baseOptions);
}

/**
 * Generate a reading/document progress statement
 */
export function generateReadingStatement(
  verb: 'launched' | 'progressed' | 'completed' | 'bookmarked',
  actor: Actor,
  options: ReadingStatementOptions,
): Statement {
  // Build result
  const result: Result = {
    ...options.result,
  };

  // Build extensions
  const extensions: Record<string, unknown> = {
    ...result.extensions,
  };

  if (options.pageNumber !== undefined) {
    extensions[READING_EXTENSIONS.pageNumber] = options.pageNumber;
  }
  if (options.totalPages !== undefined) {
    extensions[READING_EXTENSIONS.totalPages] = options.totalPages;
  }
  if (options.scrollPercentage !== undefined) {
    extensions[READING_EXTENSIONS.scrollPercentage] = options.scrollPercentage;
  }
  if (options.bookmarkPosition !== undefined) {
    extensions[READING_EXTENSIONS.bookmarkPosition] = options.bookmarkPosition;
  }

  if (Object.keys(extensions).length > 0) {
    result.extensions = extensions;
  }

  // Add duration if time spent provided
  if (options.timeSpent !== undefined) {
    result.duration = formatDuration(options.timeSpent);
  }

  // Completion
  if (verb === 'completed') {
    result.completion = true;
  }

  const baseOptions: GenerateStatementOptions = {
    ...options,
    result: Object.keys(result).length > 0 ? result : undefined,
  };

  return generateBlockStatement('reading', verb, actor, baseOptions);
}

/**
 * Generate a scenario/branching content statement
 */
export function generateScenarioStatement(
  verb: 'launched' | 'interacted' | 'progressed' | 'completed',
  actor: Actor,
  options: ScenarioStatementOptions,
): Statement {
  // Build result
  const result: Result = {
    ...options.result,
  };

  // Add choice as response
  if (options.choiceId !== undefined) {
    result.response = options.choiceId;
  }

  // Build extensions
  const extensions: Record<string, unknown> = {
    ...result.extensions,
  };

  if (options.choiceId !== undefined) {
    extensions[SCENARIO_EXTENSIONS.choiceId] = options.choiceId;
  }
  if (options.choiceText !== undefined) {
    extensions[SCENARIO_EXTENSIONS.choiceText] = options.choiceText;
  }
  if (options.branchId !== undefined) {
    extensions[SCENARIO_EXTENSIONS.branchId] = options.branchId;
  }
  if (options.isOptimalPath !== undefined) {
    extensions[SCENARIO_EXTENSIONS.optimalPath] = options.isOptimalPath;
  }
  if (options.scenarioPath !== undefined) {
    extensions[SCENARIO_EXTENSIONS.scenarioPath] = options.scenarioPath;
  }

  if (Object.keys(extensions).length > 0) {
    result.extensions = extensions;
  }

  // Completion
  if (verb === 'completed') {
    result.completion = true;
  }

  const baseOptions: GenerateStatementOptions = {
    ...options,
    result: Object.keys(result).length > 0 ? result : undefined,
  };

  return generateBlockStatement('scenario', verb, actor, baseOptions);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build an activity object
 */
function buildActivity(
  id: string,
  name: string,
  type: ActivityTypeKey,
  description?: string,
): Activity {
  const activityId = id.startsWith('http') ? id : buildActivityId(type, id);

  const definition: ActivityDefinition = {
    type: ACTIVITY_TYPES[type],
    name: { 'en-US': name },
  };

  if (description) {
    definition.description = { 'en-US': description };
  }

  return {
    objectType: 'Activity',
    id: activityId,
    definition,
  };
}

/**
 * Build context object from options
 */
function buildContext(options: GenerateStatementOptions): Context {
  const context: Context = {
    ...options.context,
    platform: 'LXP360',
  };

  // Add registration
  if (options.registration) {
    context.registration = options.registration;
  }

  // Build context activities
  if (options.parentActivity || options.groupingActivities) {
    context.contextActivities = {
      ...options.context?.contextActivities,
    };

    if (options.parentActivity) {
      const parentActivity = buildActivity(
        options.parentActivity.id,
        options.parentActivity.name,
        options.parentActivity.type,
      );
      context.contextActivities.parent = [parentActivity];
    }

    if (options.groupingActivities && options.groupingActivities.length > 0) {
      context.contextActivities.grouping = options.groupingActivities.map((g) =>
        buildActivity(g.id, g.name, g.type),
      );
    }
  }

  // Merge extensions
  if (options.context?.extensions) {
    context.extensions = {
      ...context.extensions,
      ...options.context.extensions,
    };
  }

  return context;
}

/**
 * Create an actor from user data
 *
 * @param userId - User's unique ID
 * @param email - User's email address
 * @param name - User's display name
 * @returns Actor object
 */
export function createActor(userId: string, email: string, name?: string): Actor {
  return {
    objectType: 'Agent',
    account: {
      homePage: 'https://lxp360.com',
      name: userId,
    },
    mbox: `mailto:${email}`,
    ...(name && { name }),
  };
}

/**
 * Add cognitive load data to a statement
 */
export function addCognitiveLoadContext(
  context: Context,
  cognitiveLoadIndex: number,
  sessionId?: string,
): Context {
  let level: 'low' | 'optimal' | 'high' | 'overload';
  if (cognitiveLoadIndex < 15) level = 'low';
  else if (cognitiveLoadIndex < 40) level = 'optimal';
  else if (cognitiveLoadIndex < 70) level = 'high';
  else level = 'overload';

  return {
    ...context,
    extensions: {
      ...context.extensions,
      [LXP360Extensions.cognitiveLoadIndex]: cognitiveLoadIndex,
      [LXP360Extensions.cognitiveLoadLevel]: level,
      ...(sessionId && { [LXP360Extensions.sessionId]: sessionId }),
    },
  };
}
