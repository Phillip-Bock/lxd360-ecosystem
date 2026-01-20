import { v4 as uuidv4 } from 'uuid';
import { ACTIVITY_TYPES, type ActivityTypeKey } from './activity-types';
import { EXTENSION_URIS, getEventTemplate } from './templates';
import type {
  Activity,
  ActivityDefinition,
  Actor,
  Context,
  Result,
  Score,
  Statement,
  Verb,
} from './types';
import { XAPI_VERBS, type XAPIVerbKey } from './verbs';
import { formatDuration } from './vocabulary';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for creating an actor
 */
export interface ActorOptions {
  /** User's unique ID in the system */
  userId: string;
  /** User's email address */
  email?: string;
  /** User's display name */
  name?: string;
  /** Home page URL for the account */
  homePage?: string;
}

/**
 * Options for creating an activity
 */
export interface ActivityOptions {
  /** Activity unique identifier */
  id: string;
  /** Activity name */
  name: string;
  /** Activity description */
  description?: string;
  /** Activity type key or IRI */
  type?: ActivityTypeKey | string;
  /** Additional extensions */
  extensions?: Record<string, unknown>;
}

/**
 * Options for the result object
 */
export interface ResultOptions {
  /** Score details */
  score?: Partial<Score>;
  /** Whether the activity was successful */
  success?: boolean;
  /** Whether the activity was completed */
  completion?: boolean;
  /** Response text */
  response?: string;
  /** Duration in seconds */
  durationSeconds?: number;
  /** Additional extensions */
  extensions?: Record<string, unknown>;
}

/**
 * Options for context parent/grouping activities
 */
export interface ContextActivityOptions {
  id: string;
  name: string;
  type?: ActivityTypeKey | string;
}

// ============================================================================
// STATEMENT BUILDER CLASS
// ============================================================================

/**
 * Fluent builder for constructing xAPI statements
 *
 * @example
 * ```ts
 * const statement = new StatementBuilder()
 *   .withActor({ userId: 'user-123', email: 'user@example.com', name: 'John Doe' })
 *   .withVerb('completed')
 *   .withActivity({
 *     id: 'lesson-1',
 *     name: 'Introduction to Safety',
 *     type: 'lesson'
 *   })
 *   .withResult({ completion: true })
 *   .withParentActivity({ id: 'course-1', name: 'Safety Course', type: 'course' })
 *   .build();
 * ```
 */
export class StatementBuilder {
  private baseUrl: string;
  private statementId?: string;
  private actor?: Actor;
  private verb?: Verb;
  private object?: Activity;
  private result?: Result;
  private context?: Context;
  private timestamp?: string;

  /**
   * Create a new StatementBuilder
   *
   * @param baseUrl - Base URL for activity IRIs (default: https://lxd360.com)
   */
  constructor(baseUrl: string = 'https://lxd360.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Set a specific statement ID (defaults to auto-generated UUID)
   */
  withId(id: string): this {
    this.statementId = id;
    return this;
  }

  /**
   * Set the actor (learner) for the statement
   */
  withActor(options: ActorOptions): this {
    const homePage = options.homePage ?? this.baseUrl;

    this.actor = {
      objectType: 'Agent',
      account: {
        homePage,
        name: options.userId,
      },
      ...(options.name && { name: options.name }),
      ...(options.email && { mbox: `mailto:${options.email}` }),
    };

    return this;
  }

  /**
   * Set the actor directly from an Actor object
   */
  withActorObject(actor: Actor): this {
    this.actor = actor;
    return this;
  }

  /**
   * Set the verb by key from the verb registry
   */
  withVerb(verbKey: XAPIVerbKey): this {
    this.verb = XAPI_VERBS[verbKey];
    return this;
  }

  /**
   * Set the verb directly from a Verb object
   */
  withVerbObject(verb: Verb): this {
    this.verb = verb;
    return this;
  }

  /**
   * Set the activity (object) for the statement
   */
  withActivity(options: ActivityOptions): this {
    const activityId = options.id.startsWith('http')
      ? options.id
      : `${this.baseUrl}/activities/${encodeURIComponent(options.id)}`;

    const typeIri = options.type
      ? options.type in ACTIVITY_TYPES
        ? ACTIVITY_TYPES[options.type as ActivityTypeKey]
        : options.type
      : undefined;

    const definition: ActivityDefinition = {
      name: { 'en-US': options.name },
      ...(typeIri && { type: typeIri }),
      ...(options.description && { description: { 'en-US': options.description } }),
      ...(options.extensions && { extensions: options.extensions }),
    };

    this.object = {
      objectType: 'Activity',
      id: activityId,
      definition,
    };

    return this;
  }

  /**
   * Set the activity directly from an Activity object
   */
  withActivityObject(activity: Activity): this {
    this.object = activity;
    return this;
  }

  /**
   * Set the result for the statement
   */
  withResult(options: ResultOptions): this {
    this.result = {
      ...(options.score && { score: options.score }),
      ...(options.success !== undefined && { success: options.success }),
      ...(options.completion !== undefined && { completion: options.completion }),
      ...(options.response && { response: options.response }),
      ...(options.durationSeconds !== undefined && {
        duration: formatDuration(options.durationSeconds),
      }),
      ...(options.extensions && { extensions: options.extensions }),
    };

    return this;
  }

  /**
   * Add a score to the result
   */
  withScore(score: Partial<Score>): this {
    this.result = {
      ...this.result,
      score,
    };
    return this;
  }

  /**
   * Set success in the result
   */
  withSuccess(success: boolean): this {
    this.result = {
      ...this.result,
      success,
    };
    return this;
  }

  /**
   * Set completion in the result
   */
  withCompletion(completion: boolean): this {
    this.result = {
      ...this.result,
      completion,
    };
    return this;
  }

  /**
   * Set response in the result
   */
  withResponse(response: string): this {
    this.result = {
      ...this.result,
      response,
    };
    return this;
  }

  /**
   * Set duration in the result
   */
  withDuration(seconds: number): this {
    this.result = {
      ...this.result,
      duration: formatDuration(seconds),
    };
    return this;
  }

  /**
   * Add result extensions
   */
  withResultExtensions(extensions: Record<string, unknown>): this {
    this.result = {
      ...this.result,
      extensions: {
        ...this.result?.extensions,
        ...extensions,
      },
    };
    return this;
  }

  /**
   * Set the registration UUID for the learning session
   */
  withRegistration(registration: string): this {
    this.context = {
      ...this.context,
      registration,
    };
    return this;
  }

  /**
   * Add a parent activity to the context
   */
  withParentActivity(options: ContextActivityOptions): this {
    const parentActivity = this.buildContextActivity(options);

    this.context = {
      ...this.context,
      contextActivities: {
        ...this.context?.contextActivities,
        parent: [...(this.context?.contextActivities?.parent ?? []), parentActivity],
      },
    };

    return this;
  }

  /**
   * Add a grouping activity to the context
   */
  withGroupingActivity(options: ContextActivityOptions): this {
    const groupingActivity = this.buildContextActivity(options);

    this.context = {
      ...this.context,
      contextActivities: {
        ...this.context?.contextActivities,
        grouping: [...(this.context?.contextActivities?.grouping ?? []), groupingActivity],
      },
    };

    return this;
  }

  /**
   * Add a category activity to the context
   */
  withCategoryActivity(options: ContextActivityOptions): this {
    const categoryActivity = this.buildContextActivity(options);

    this.context = {
      ...this.context,
      contextActivities: {
        ...this.context?.contextActivities,
        category: [...(this.context?.contextActivities?.category ?? []), categoryActivity],
      },
    };

    return this;
  }

  /**
   * Set the platform in the context
   */
  withPlatform(platform: string): this {
    this.context = {
      ...this.context,
      platform,
    };
    return this;
  }

  /**
   * Set the language in the context
   */
  withLanguage(language: string): this {
    this.context = {
      ...this.context,
      language,
    };
    return this;
  }

  /**
   * Add context extensions
   */
  withContextExtensions(extensions: Record<string, unknown>): this {
    this.context = {
      ...this.context,
      extensions: {
        ...this.context?.extensions,
        ...extensions,
      },
    };
    return this;
  }

  /**
   * Add cognitive load data to context
   */
  withCognitiveLoad(loadIndex: number): this {
    let level: string;
    if (loadIndex < 15) level = 'low';
    else if (loadIndex < 40) level = 'optimal';
    else if (loadIndex < 70) level = 'high';
    else level = 'overload';

    return this.withContextExtensions({
      'https://lxp360.com/xapi/extensions/cognitive-load-index': loadIndex,
      'https://lxp360.com/xapi/extensions/cognitive-load-level': level,
    });
  }

  /**
   * Add session ID to context
   */
  withSessionId(sessionId: string): this {
    return this.withContextExtensions({
      'https://lxp360.com/xapi/extensions/session-id': sessionId,
    });
  }

  /**
   * Set the timestamp (defaults to now)
   */
  withTimestamp(timestamp: string | Date): this {
    this.timestamp = typeof timestamp === 'string' ? timestamp : timestamp.toISOString();
    return this;
  }

  /**
   * Build the statement from a content block event template
   *
   * @param blockType - The content block type
   * @param trigger - The event trigger (e.g., 'viewed', 'completed')
   * @param actor - The actor options
   * @param activity - The activity options
   */
  fromBlockEvent(
    blockType: string,
    trigger: string,
    actor: ActorOptions,
    activity: ActivityOptions,
  ): this {
    const eventTemplate = getEventTemplate(blockType, trigger);

    if (!eventTemplate) {
      throw new Error(`No template found for block type "${blockType}" with trigger "${trigger}"`);
    }

    this.withActor(actor);
    this.withVerb(eventTemplate.verb);
    this.withActivity({
      ...activity,
      type: activity.type ?? (eventTemplate.activityType as ActivityTypeKey),
    });

    // Apply result template if present
    if (eventTemplate.resultTemplate) {
      this.result = {
        ...this.result,
        ...eventTemplate.resultTemplate,
      };
    }

    return this;
  }

  /**
   * Build the final xAPI statement
   *
   * @returns The complete xAPI statement
   * @throws Error if required fields (actor, verb, object) are missing
   */
  build(): Statement {
    if (!this.actor) {
      throw new Error('Statement requires an actor. Call withActor() first.');
    }
    if (!this.verb) {
      throw new Error('Statement requires a verb. Call withVerb() first.');
    }
    if (!this.object) {
      throw new Error('Statement requires an object/activity. Call withActivity() first.');
    }

    const statement: Statement = {
      id: this.statementId ?? uuidv4(),
      actor: this.actor,
      verb: this.verb,
      object: this.object,
      timestamp: this.timestamp ?? new Date().toISOString(),
      version: '1.0.3',
    };

    if (this.result && Object.keys(this.result).length > 0) {
      statement.result = this.result;
    }

    // Ensure context has platform set
    if (this.context || !this.context) {
      const context: Context = {
        ...this.context,
        platform: this.context?.platform ?? 'LXP360',
      };
      statement.context = context;
    }

    return statement;
  }

  /**
   * Reset the builder for reuse
   */
  reset(): this {
    this.statementId = undefined;
    this.actor = undefined;
    this.verb = undefined;
    this.object = undefined;
    this.result = undefined;
    this.context = undefined;
    this.timestamp = undefined;
    return this;
  }

  /**
   * Build a context activity from options
   */
  private buildContextActivity(options: ContextActivityOptions): Activity {
    const activityId = options.id.startsWith('http')
      ? options.id
      : `${this.baseUrl}/activities/${encodeURIComponent(options.id)}`;

    const typeIri = options.type
      ? options.type in ACTIVITY_TYPES
        ? ACTIVITY_TYPES[options.type as ActivityTypeKey]
        : options.type
      : undefined;

    return {
      objectType: 'Activity',
      id: activityId,
      definition: {
        name: { 'en-US': options.name },
        ...(typeIri && { type: typeIri }),
      },
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new StatementBuilder instance
 *
 * @param baseUrl - Optional base URL for activity IRIs
 * @returns New StatementBuilder instance
 */
export function createStatementBuilder(baseUrl?: string): StatementBuilder {
  return new StatementBuilder(baseUrl);
}

/**
 * Build a statement for a content block event
 *
 * @param params - Parameters for building the statement
 * @returns Complete xAPI statement
 */
export function buildBlockStatement(params: {
  actor: ActorOptions;
  blockType: string;
  blockId: string;
  blockName: string;
  eventTrigger: string;
  courseId?: string;
  courseName?: string;
  lessonId?: string;
  lessonName?: string;
  result?: ResultOptions;
  registration?: string;
  sessionId?: string;
  baseUrl?: string;
}): Statement {
  const builder = new StatementBuilder(params.baseUrl).fromBlockEvent(
    params.blockType,
    params.eventTrigger,
    params.actor,
    {
      id: params.blockId,
      name: params.blockName,
    },
  );

  // Add result if provided
  if (params.result) {
    builder.withResult(params.result);
  }

  // Add registration if provided
  if (params.registration) {
    builder.withRegistration(params.registration);
  }

  // Add session ID if provided
  if (params.sessionId) {
    builder.withSessionId(params.sessionId);
  }

  // Add parent lesson if provided
  if (params.lessonId && params.lessonName) {
    builder.withParentActivity({
      id: params.lessonId,
      name: params.lessonName,
      type: 'lesson',
    });
  }

  // Add grouping course if provided
  if (params.courseId && params.courseName) {
    builder.withGroupingActivity({
      id: params.courseId,
      name: params.courseName,
      type: 'course',
    });
  }

  return builder.build();
}

/**
 * Build a video statement with video-specific extensions
 *
 * @param params - Parameters for building the video statement
 * @returns Complete xAPI statement for video interaction
 */
export function buildVideoStatement(params: {
  actor: ActorOptions;
  videoId: string;
  videoName: string;
  verb: 'launched' | 'played' | 'paused' | 'seeked' | 'completed' | 'terminated';
  time?: number;
  duration?: number;
  progress?: number;
  seekFrom?: number;
  seekTo?: number;
  courseId?: string;
  courseName?: string;
  lessonId?: string;
  lessonName?: string;
  registration?: string;
  baseUrl?: string;
}): Statement {
  const builder = new StatementBuilder(params.baseUrl)
    .withActor(params.actor)
    .withVerb(params.verb)
    .withActivity({
      id: params.videoId,
      name: params.videoName,
      type: 'video',
    });

  // Add video-specific result extensions
  const resultExtensions: Record<string, unknown> = {};

  if (params.time !== undefined) {
    resultExtensions[EXTENSION_URIS.videoTime] = params.time;
  }
  if (params.progress !== undefined) {
    resultExtensions[EXTENSION_URIS.videoProgress] = params.progress;
  }
  if (params.verb === 'seeked') {
    resultExtensions[EXTENSION_URIS.videoTimeFrom] = params.seekFrom ?? 0;
    resultExtensions[EXTENSION_URIS.videoTimeTo] = params.seekTo ?? params.time ?? 0;
  }

  if (Object.keys(resultExtensions).length > 0) {
    builder.withResultExtensions(resultExtensions);
  }

  // Add video duration to context
  if (params.duration !== undefined) {
    builder.withContextExtensions({
      [EXTENSION_URIS.videoLength]: params.duration,
    });
  }

  // Mark completed if verb is completed
  if (params.verb === 'completed') {
    builder.withCompletion(true);
    if (params.duration !== undefined) {
      builder.withDuration(params.duration);
    }
  }

  // Add parent/grouping context
  if (params.lessonId && params.lessonName) {
    builder.withParentActivity({
      id: params.lessonId,
      name: params.lessonName,
      type: 'lesson',
    });
  }

  if (params.courseId && params.courseName) {
    builder.withGroupingActivity({
      id: params.courseId,
      name: params.courseName,
      type: 'course',
    });
  }

  if (params.registration) {
    builder.withRegistration(params.registration);
  }

  return builder.build();
}

/**
 * Build a quiz/assessment statement
 *
 * @param params - Parameters for building the quiz statement
 * @returns Complete xAPI statement for quiz interaction
 */
export function buildQuizStatement(params: {
  actor: ActorOptions;
  quizId: string;
  quizName: string;
  verb: 'launched' | 'attempted' | 'answered' | 'passed' | 'failed' | 'completed';
  score?: Partial<Score>;
  success?: boolean;
  response?: string;
  attemptNumber?: number;
  durationSeconds?: number;
  questionId?: string;
  courseId?: string;
  courseName?: string;
  lessonId?: string;
  lessonName?: string;
  registration?: string;
  baseUrl?: string;
}): Statement {
  const builder = new StatementBuilder(params.baseUrl)
    .withActor(params.actor)
    .withVerb(params.verb)
    .withActivity({
      id: params.quizId,
      name: params.quizName,
      type: 'quiz',
    });

  // Add score if provided
  if (params.score) {
    builder.withScore(params.score);
  }

  // Set success/completion based on verb
  if (params.verb === 'passed') {
    builder.withSuccess(true).withCompletion(true);
  } else if (params.verb === 'failed') {
    builder.withSuccess(false).withCompletion(true);
  } else if (params.verb === 'completed') {
    builder.withCompletion(true);
  } else if (params.success !== undefined) {
    builder.withSuccess(params.success);
  }

  // Add response
  if (params.response) {
    builder.withResponse(params.response);
  }

  // Add duration
  if (params.durationSeconds !== undefined) {
    builder.withDuration(params.durationSeconds);
  }

  // Add quiz-specific extensions
  const resultExtensions: Record<string, unknown> = {};
  if (params.attemptNumber !== undefined) {
    resultExtensions[EXTENSION_URIS.attemptNumber] = params.attemptNumber;
  }
  if (params.questionId) {
    resultExtensions[EXTENSION_URIS.questionId] = params.questionId;
  }
  if (Object.keys(resultExtensions).length > 0) {
    builder.withResultExtensions(resultExtensions);
  }

  // Add parent/grouping context
  if (params.lessonId && params.lessonName) {
    builder.withParentActivity({
      id: params.lessonId,
      name: params.lessonName,
      type: 'lesson',
    });
  }

  if (params.courseId && params.courseName) {
    builder.withGroupingActivity({
      id: params.courseId,
      name: params.courseName,
      type: 'course',
    });
  }

  if (params.registration) {
    builder.withRegistration(params.registration);
  }

  return builder.build();
}
