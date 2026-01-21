/**
 * Fluent Statement Builder for xAPI
 *
 * @module @inspire/xapi-client/builder/statement-builder
 */

import { INSPIRE_EXTENSIONS } from '@inspire/types';
import { v4 as uuidv4 } from 'uuid';
import type {
  Activity,
  ActivityDefinition,
  Actor,
  Context,
  Result,
  Score,
  Statement,
  Verb,
} from '../schemas';
import { ACTIVITY_TYPES, type ActivityTypeKey } from '../schemas/activity';
import { formatDuration } from '../schemas/result';
import { ALL_VERBS, type VerbKey } from '../schemas/verb';

// ============================================================================
// BUILDER OPTIONS
// ============================================================================

export interface ActorOptions {
  userId: string;
  email?: string;
  name?: string;
  homePage?: string;
}

export interface ActivityOptions {
  id: string;
  name: string;
  description?: string;
  type?: ActivityTypeKey | string;
  extensions?: Record<string, unknown>;
}

export interface ContextActivityOptions {
  id: string;
  name: string;
  type?: ActivityTypeKey | string;
}

// ============================================================================
// STATEMENT BUILDER
// ============================================================================

/**
 * Fluent builder for constructing xAPI statements.
 *
 * @example
 * ```ts
 * const statement = new StatementBuilder()
 *   .withActor({ userId: 'user-123', email: 'user@example.com' })
 *   .withVerb('completed')
 *   .withActivity({ id: 'lesson-1', name: 'Safety Intro', type: 'lesson' })
 *   .withResult({ completion: true })
 *   .withParent({ id: 'course-1', name: 'Safety Course', type: 'course' })
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

  constructor(baseUrl: string = 'https://lxd360.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Set a specific statement ID.
   */
  withId(id: string): this {
    this.statementId = id;
    return this;
  }

  /**
   * Set the actor from options.
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
    };

    return this;
  }

  /**
   * Set the actor directly.
   */
  withActorObject(actor: Actor): this {
    this.actor = actor;
    return this;
  }

  /**
   * Set the verb by key.
   */
  withVerb(verbKey: VerbKey): this {
    this.verb = ALL_VERBS[verbKey];
    return this;
  }

  /**
   * Set the verb directly.
   */
  withVerbObject(verb: Verb): this {
    this.verb = verb;
    return this;
  }

  /**
   * Set the activity from options.
   */
  withActivity(options: ActivityOptions): this {
    const activityId = options.id.startsWith('http')
      ? options.id
      : `${this.baseUrl}/activities/${encodeURIComponent(options.id)}`;

    const typeIri = this.resolveActivityType(options.type);

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
   * Set the activity directly.
   */
  withActivityObject(activity: Activity): this {
    this.object = activity;
    return this;
  }

  /**
   * Set the result.
   */
  withResult(options: {
    score?: Partial<Score>;
    success?: boolean;
    completion?: boolean;
    response?: string;
    durationSeconds?: number;
    extensions?: Record<string, unknown>;
  }): this {
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
   * Add to result score.
   */
  withScore(score: Partial<Score>): this {
    this.result = { ...this.result, score };
    return this;
  }

  /**
   * Set success.
   */
  withSuccess(success: boolean): this {
    this.result = { ...this.result, success };
    return this;
  }

  /**
   * Set completion.
   */
  withCompletion(completion: boolean): this {
    this.result = { ...this.result, completion };
    return this;
  }

  /**
   * Set response.
   */
  withResponse(response: string): this {
    this.result = { ...this.result, response };
    return this;
  }

  /**
   * Set duration in seconds.
   */
  withDuration(seconds: number): this {
    this.result = { ...this.result, duration: formatDuration(seconds) };
    return this;
  }

  /**
   * Add result extensions.
   */
  withResultExtensions(extensions: Record<string, unknown>): this {
    this.result = {
      ...this.result,
      extensions: { ...this.result?.extensions, ...extensions },
    };
    return this;
  }

  /**
   * Set registration UUID.
   */
  withRegistration(registration: string): this {
    this.context = { ...this.context, registration };
    return this;
  }

  /**
   * Add a parent activity.
   */
  withParent(options: ContextActivityOptions): this {
    const activity = this.buildContextActivity(options);
    this.context = {
      ...this.context,
      contextActivities: {
        ...this.context?.contextActivities,
        parent: [...(this.context?.contextActivities?.parent ?? []), activity],
      },
    };
    return this;
  }

  /**
   * Add a grouping activity.
   */
  withGrouping(options: ContextActivityOptions): this {
    const activity = this.buildContextActivity(options);
    this.context = {
      ...this.context,
      contextActivities: {
        ...this.context?.contextActivities,
        grouping: [...(this.context?.contextActivities?.grouping ?? []), activity],
      },
    };
    return this;
  }

  /**
   * Add a category activity.
   */
  withCategory(options: ContextActivityOptions): this {
    const activity = this.buildContextActivity(options);
    this.context = {
      ...this.context,
      contextActivities: {
        ...this.context?.contextActivities,
        category: [...(this.context?.contextActivities?.category ?? []), activity],
      },
    };
    return this;
  }

  /**
   * Set platform.
   */
  withPlatform(platform: string): this {
    this.context = { ...this.context, platform };
    return this;
  }

  /**
   * Set language.
   */
  withLanguage(language: string): this {
    this.context = { ...this.context, language };
    return this;
  }

  /**
   * Add context extensions.
   */
  withContextExtensions(extensions: Record<string, unknown>): this {
    this.context = {
      ...this.context,
      extensions: { ...this.context?.extensions, ...extensions },
    };
    return this;
  }

  /**
   * Add session ID to context.
   */
  withSessionId(sessionId: string): this {
    return this.withContextExtensions({
      [INSPIRE_EXTENSIONS.SESSION_ID]: sessionId,
    });
  }

  /**
   * Add latency to result.
   */
  withLatency(latencyMs: number): this {
    return this.withResultExtensions({
      [INSPIRE_EXTENSIONS.LATENCY]: latencyMs,
    });
  }

  /**
   * Add cognitive load to context.
   */
  withCognitiveLoad(load: number): this {
    return this.withContextExtensions({
      [INSPIRE_EXTENSIONS.COGNITIVE_LOAD]: load,
    });
  }

  /**
   * Add skill ID.
   */
  withSkillId(skillId: string): this {
    return this.withContextExtensions({
      [INSPIRE_EXTENSIONS.SKILL_ID]: skillId,
    });
  }

  /**
   * Add block metadata.
   */
  withBlock(blockId: string, blockType: string): this {
    return this.withContextExtensions({
      [INSPIRE_EXTENSIONS.BLOCK_ID]: blockId,
      [INSPIRE_EXTENSIONS.BLOCK_TYPE]: blockType,
    });
  }

  /**
   * Add consent tier (EU AI Act compliance).
   */
  withConsentTier(tier: number): this {
    return this.withContextExtensions({
      [INSPIRE_EXTENSIONS.CONSENT_TIER]: tier,
    });
  }

  /**
   * Set timestamp.
   */
  withTimestamp(timestamp: string | Date): this {
    this.timestamp = typeof timestamp === 'string' ? timestamp : timestamp.toISOString();
    return this;
  }

  /**
   * Build the statement.
   */
  build(): Statement {
    if (!this.actor) {
      throw new Error('Statement requires an actor. Call withActor() first.');
    }
    if (!this.verb) {
      throw new Error('Statement requires a verb. Call withVerb() first.');
    }
    if (!this.object) {
      throw new Error('Statement requires an object. Call withActivity() first.');
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

    if (this.context) {
      statement.context = {
        ...this.context,
        platform: this.context.platform ?? 'INSPIRE',
      };
    } else {
      statement.context = { platform: 'INSPIRE' };
    }

    return statement;
  }

  /**
   * Reset the builder.
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

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private resolveActivityType(type?: ActivityTypeKey | string): string | undefined {
    if (!type) return undefined;
    if (type in ACTIVITY_TYPES) {
      return ACTIVITY_TYPES[type as ActivityTypeKey];
    }
    return type;
  }

  private buildContextActivity(options: ContextActivityOptions): Activity {
    const activityId = options.id.startsWith('http')
      ? options.id
      : `${this.baseUrl}/activities/${encodeURIComponent(options.id)}`;

    const typeIri = this.resolveActivityType(options.type);

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
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new StatementBuilder.
 */
export function createStatementBuilder(baseUrl?: string): StatementBuilder {
  return new StatementBuilder(baseUrl);
}
