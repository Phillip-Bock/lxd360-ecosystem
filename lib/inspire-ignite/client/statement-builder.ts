import type {
  XApiActivityDefinition,
  XApiActor,
  XApiContext,
  XApiObject,
  XApiResult,
  XApiStatement,
  XApiVerb,
} from '../types/xapi';
import { LXP360ExtensionKeys } from '../types/xapi';

/**
 * Fluent builder for xAPI statements
 */
export class StatementBuilder {
  private statement: Partial<XApiStatement> = {
    version: '1.0.0',
  };

  /**
   * Set the actor (learner)
   */
  actor(actor: XApiActor): this {
    this.statement.actor = actor;
    return this;
  }

  /**
   * Set actor from user ID and email
   */
  actorFromUser(userId: string, email?: string, name?: string): this {
    this.statement.actor = {
      objectType: 'Agent',
      name,
      account: {
        homePage: 'https://lxp360.com',
        name: userId,
      },
      mbox: email ? `mailto:${email}` : undefined,
    };
    return this;
  }

  /**
   * Set the verb
   */
  verb(verb: XApiVerb): this {
    this.statement.verb = verb;
    return this;
  }

  /**
   * Set verb from ID and display name
   */
  verbFromId(id: string, displayName: string): this {
    this.statement.verb = {
      id,
      display: { 'en-US': displayName },
    };
    return this;
  }

  /**
   * Set the object (activity)
   */
  object(object: XApiObject): this {
    this.statement.object = object;
    return this;
  }

  /**
   * Set object from activity details
   */
  activity(params: {
    id: string;
    name: string;
    description?: string;
    type?: string;
    definition?: Partial<XApiActivityDefinition>;
  }): this {
    this.statement.object = {
      objectType: 'Activity',
      id: params.id,
      definition: {
        name: { 'en-US': params.name },
        description: params.description ? { 'en-US': params.description } : undefined,
        type: params.type,
        ...params.definition,
      },
    };
    return this;
  }

  /**
   * Set the result
   */
  result(result: XApiResult): this {
    this.statement.result = result;
    return this;
  }

  /**
   * Set result with common fields
   */
  withResult(params: {
    success?: boolean;
    completion?: boolean;
    score?: number; // 0-100, will be scaled
    rawScore?: number;
    minScore?: number;
    maxScore?: number;
    response?: string;
    durationSeconds?: number;
    extensions?: Record<string, unknown>;
  }): this {
    this.statement.result = {
      success: params.success,
      completion: params.completion,
      response: params.response,
      duration: params.durationSeconds ? `PT${params.durationSeconds}S` : undefined,
      score:
        params.score !== undefined || params.rawScore !== undefined
          ? {
              scaled: params.score !== undefined ? params.score / 100 : undefined,
              raw: params.rawScore,
              min: params.minScore,
              max: params.maxScore,
            }
          : undefined,
      extensions: params.extensions,
    };
    return this;
  }

  /**
   * Set the context
   */
  context(context: XApiContext): this {
    this.statement.context = context;
    return this;
  }

  /**
   * Add context with LXP360 extensions
   */
  withContext(params: {
    sessionId?: string;
    deviceType?: 'Mobile' | 'Desktop' | 'Tablet' | 'VR Headset';
    masteryScore?: number;
    userCohort?: string;
    platform?: string;
    language?: string;
    registration?: string;
    extensions?: Record<string, unknown>;
  }): this {
    const extensions: Record<string, unknown> = {};

    if (params.sessionId) {
      extensions[LXP360ExtensionKeys.sessionId] = params.sessionId;
    }
    if (params.deviceType) {
      extensions[LXP360ExtensionKeys.deviceType] = params.deviceType;
    }
    if (params.masteryScore !== undefined) {
      extensions[LXP360ExtensionKeys.masteryScore] = params.masteryScore;
    }
    if (params.userCohort) {
      extensions[LXP360ExtensionKeys.userCohort] = params.userCohort;
    }

    this.statement.context = {
      registration: params.registration,
      platform: params.platform ?? 'LXP360',
      language: params.language,
      extensions: {
        ...extensions,
        ...params.extensions,
      },
    };
    return this;
  }

  /**
   * Add assessment-specific result extensions
   */
  withAssessmentExtensions(params: {
    distractorType?: string;
    numberOfChanges?: number;
    confidenceInterval?: number;
    attemptNumber?: number;
    hintsUsed?: number;
  }): this {
    const extensions: Record<string, unknown> = {};

    if (params.distractorType) {
      extensions[LXP360ExtensionKeys.distractorType] = params.distractorType;
    }
    if (params.numberOfChanges !== undefined) {
      extensions[LXP360ExtensionKeys.numberOfChanges] = params.numberOfChanges;
    }
    if (params.confidenceInterval !== undefined) {
      extensions[LXP360ExtensionKeys.confidenceInterval] = params.confidenceInterval;
    }
    if (params.attemptNumber !== undefined) {
      extensions[LXP360ExtensionKeys.attemptNumber] = params.attemptNumber;
    }

    this.statement.result = {
      ...this.statement.result,
      extensions: {
        ...this.statement.result?.extensions,
        ...extensions,
      },
    };
    return this;
  }

  /**
   * Add cognitive load extensions
   */
  withCognitiveLoadExtensions(params: {
    cognitiveLoadIndex?: number;
    fatigueLevel?: number;
    breakRecommended?: boolean;
  }): this {
    const extensions: Record<string, unknown> = {};

    if (params.cognitiveLoadIndex !== undefined) {
      extensions[LXP360ExtensionKeys.cognitiveLoadIndex] = params.cognitiveLoadIndex;
    }
    if (params.fatigueLevel !== undefined) {
      extensions[LXP360ExtensionKeys.fatigueLevel] = params.fatigueLevel;
    }
    if (params.breakRecommended !== undefined) {
      extensions[LXP360ExtensionKeys.breakRecommended] = params.breakRecommended;
    }

    this.statement.context = {
      ...this.statement.context,
      extensions: {
        ...this.statement.context?.extensions,
        ...extensions,
      },
    };
    return this;
  }

  /**
   * Set timestamp
   */
  timestamp(date: Date | string): this {
    this.statement.timestamp = typeof date === 'string' ? date : date.toISOString();
    return this;
  }

  /**
   * Generate UUID for statement
   */
  withId(id?: string): this {
    this.statement.id = id ?? crypto.randomUUID();
    return this;
  }

  /**
   * Build the final statement
   */
  build(): XApiStatement {
    if (!this.statement.actor) {
      throw new Error('Actor is required');
    }
    if (!this.statement.verb) {
      throw new Error('Verb is required');
    }
    if (!this.statement.object) {
      throw new Error('Object is required');
    }

    return {
      id: this.statement.id ?? crypto.randomUUID(),
      actor: this.statement.actor,
      verb: this.statement.verb,
      object: this.statement.object,
      result: this.statement.result,
      context: this.statement.context,
      timestamp: this.statement.timestamp ?? new Date().toISOString(),
      version: this.statement.version ?? '1.0.0',
    } as XApiStatement;
  }
}

/**
 * Create a new statement builder
 */
export function buildStatement(): StatementBuilder {
  return new StatementBuilder();
}

/**
 * Convert duration in seconds to ISO 8601 format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0 || duration === 'PT') duration += `${secs.toFixed(1)}S`;

  return duration;
}

/**
 * Parse ISO 8601 duration to seconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const seconds = parseFloat(match[3] ?? '0');

  return hours * 3600 + minutes * 60 + seconds;
}
