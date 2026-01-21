// TODO(LXD-301): Replace with Firestore client type
// This interface defines the expected shape for database operations
interface LRSClientDatabase {
  from(table: string): {
    insert(data: Record<string, unknown> | Array<Record<string, unknown>>): Promise<{
      error: { message: string } | null;
    }>;
  };
}

type DatabaseClient = LRSClientDatabase;

import type {
  XApiActor,
  XApiContext,
  XApiObject,
  XApiResult,
  XApiStatement,
  XApiVerb,
} from '../types/xapi';
import { LXP360ExtensionKeys, XApiVerbs } from '../types/xapi';

export interface LRSClientConfig {
  db: DatabaseClient;
  tableName?: string;
  webhookUrl?: string;
  defaultActor?: XApiActor;
  sessionId?: string;
  deviceType?: 'Mobile' | 'Desktop' | 'Tablet' | 'VR Headset';
  userCohort?: string;
}

export interface StatementOptions {
  trackTiming?: boolean;
  startTime?: number; // timestamp when interaction started
}

/**
 * LRS Client for sending xAPI statements to Firestore
 */
export class LRSClient {
  private config: LRSClientConfig;
  private tableName: string;
  private sessionId: string;
  private pendingStatements: XApiStatement[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config: LRSClientConfig) {
    this.config = config;
    this.tableName = config.tableName ?? 'xapi_events';
    this.sessionId = config.sessionId ?? crypto.randomUUID();
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Create a new statement with LXP360 context extensions
   */
  createStatement(params: {
    actor?: XApiActor;
    verb: XApiVerb;
    object: XApiObject;
    result?: XApiResult;
    context?: Partial<XApiContext>;
    masteryScore?: number;
  }): XApiStatement {
    const actor = params.actor ?? this.config.defaultActor;
    if (!actor) {
      throw new Error('Actor is required. Provide actor in params or set defaultActor in config.');
    }

    // Build context with LXP360 extensions
    const contextExtensions: Record<string, unknown> = {
      [LXP360ExtensionKeys.sessionId]: this.sessionId,
    };

    if (this.config.deviceType) {
      contextExtensions[LXP360ExtensionKeys.deviceType] = this.config.deviceType;
    }

    if (params.masteryScore !== undefined) {
      contextExtensions[LXP360ExtensionKeys.masteryScore] = params.masteryScore;
    }

    if (this.config.userCohort) {
      contextExtensions[LXP360ExtensionKeys.userCohort] = this.config.userCohort;
    }

    const context: XApiContext = {
      ...params.context,
      platform: 'LXP360',
      extensions: {
        ...contextExtensions,
        ...params.context?.extensions,
      },
    };

    return {
      id: crypto.randomUUID(),
      actor,
      verb: params.verb,
      object: params.object,
      result: params.result,
      context,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * Send a single statement to the LRS
   */
  async sendStatement(statement: XApiStatement): Promise<{ success: boolean; error?: string }> {
    try {
      // If webhook URL is configured, use it (for edge function)
      if (this.config.webhookUrl) {
        const response = await fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(statement),
        });

        if (!response.ok) {
          const error = await response.json();
          return { success: false, error: error.message ?? 'Failed to send statement' };
        }

        return { success: true };
      }

      // Otherwise, insert directly into Firestore
      const { error } = await this.config.db.from(this.tableName).insert({ event_data: statement });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Queue a statement for batch sending
   */
  queueStatement(statement: XApiStatement): void {
    this.pendingStatements.push(statement);
  }

  /**
   * Send all queued statements
   */
  async flushStatements(): Promise<{ success: boolean; sent: number; errors: string[] }> {
    if (this.pendingStatements.length === 0) {
      return { success: true, sent: 0, errors: [] };
    }

    const statements = [...this.pendingStatements];
    this.pendingStatements = [];

    const errors: string[] = [];
    let sent = 0;

    // Send in batches of 10
    const batchSize = 10;
    for (let i = 0; i < statements.length; i += batchSize) {
      const batch = statements.slice(i, i + batchSize);

      try {
        const { error } = await this.config.db
          .from(this.tableName)
          .insert(batch.map((s) => ({ event_data: s })));

        if (error) {
          errors.push(error.message);
        } else {
          sent += batch.length;
        }
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    return {
      success: errors.length === 0,
      sent,
      errors,
    };
  }

  /**
   * Start automatic flushing at interval (ms)
   */
  startAutoFlush(intervalMs: number = 5000): void {
    this.stopAutoFlush();
    this.flushInterval = setInterval(() => {
      this.flushStatements();
    }, intervalMs);
  }

  /**
   * Stop automatic flushing
   */
  stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Helper: Track answered event (for assessment blocks)
   */
  async trackAnswered(params: {
    activityId: string;
    activityName: string;
    interactionType:
      | 'choice'
      | 'fill-in'
      | 'matching'
      | 'true-false'
      | 'sequencing'
      | 'likert'
      | 'long-fill-in';
    response: string;
    success: boolean;
    duration?: number; // seconds
    correctPattern?: string[];
    choices?: Array<{ id: string; description: string }>;
    extensions?: Record<string, unknown>;
  }): Promise<{ success: boolean; error?: string }> {
    const statement = this.createStatement({
      verb: XApiVerbs.answered,
      object: {
        id: params.activityId,
        objectType: 'Activity',
        definition: {
          type: 'http://adlnet.gov/expapi/activities/cmi.interaction',
          name: { 'en-US': params.activityName },
          interactionType: params.interactionType,
          correctResponsesPattern: params.correctPattern,
          choices: params.choices?.map((c) => ({
            id: c.id,
            description: { 'en-US': c.description },
          })),
        },
      },
      result: {
        response: params.response,
        success: params.success,
        duration: params.duration ? `PT${params.duration}S` : undefined,
        extensions: params.extensions,
      },
    });

    return this.sendStatement(statement);
  }

  /**
   * Helper: Track completed event
   */
  async trackCompleted(params: {
    activityId: string;
    activityName: string;
    duration?: number; // seconds
    score?: { scaled?: number; raw?: number; min?: number; max?: number };
    extensions?: Record<string, unknown>;
  }): Promise<{ success: boolean; error?: string }> {
    const statement = this.createStatement({
      verb: XApiVerbs.completed,
      object: {
        id: params.activityId,
        objectType: 'Activity',
        definition: {
          name: { 'en-US': params.activityName },
        },
      },
      result: {
        completion: true,
        duration: params.duration ? `PT${params.duration}S` : undefined,
        score: params.score,
        extensions: params.extensions,
      },
    });

    return this.sendStatement(statement);
  }

  /**
   * Helper: Track progressed event (for navigation/progression)
   */
  async trackProgressed(params: {
    activityId: string;
    activityName: string;
    progressPercent: number; // 0-100
    extensions?: Record<string, unknown>;
  }): Promise<{ success: boolean; error?: string }> {
    const statement = this.createStatement({
      verb: XApiVerbs.progressed,
      object: {
        id: params.activityId,
        objectType: 'Activity',
        definition: {
          name: { 'en-US': params.activityName },
        },
      },
      result: {
        score: { scaled: params.progressPercent / 100 },
        extensions: params.extensions,
      },
    });

    return this.sendStatement(statement);
  }

  /**
   * Helper: Track interacted event (for interactive blocks)
   */
  async trackInteracted(params: {
    activityId: string;
    activityName: string;
    description?: string;
    extensions?: Record<string, unknown>;
  }): Promise<{ success: boolean; error?: string }> {
    const statement = this.createStatement({
      verb: XApiVerbs.interacted,
      object: {
        id: params.activityId,
        objectType: 'Activity',
        definition: {
          name: { 'en-US': params.activityName },
          description: params.description ? { 'en-US': params.description } : undefined,
        },
      },
      result: {
        extensions: params.extensions,
      },
    });

    return this.sendStatement(statement);
  }

  /**
   * Helper: Track media playback events
   */
  async trackMediaEvent(params: {
    verb: 'played' | 'paused' | 'completed';
    activityId: string;
    activityName: string;
    mediaType: 'video' | 'audio';
    currentTime?: number; // seconds
    duration?: number; // seconds
    extensions?: Record<string, unknown>;
  }): Promise<{ success: boolean; error?: string }> {
    const verb =
      params.verb === 'played'
        ? XApiVerbs.played
        : params.verb === 'paused'
          ? XApiVerbs.paused
          : XApiVerbs.completed;

    const statement = this.createStatement({
      verb,
      object: {
        id: params.activityId,
        objectType: 'Activity',
        definition: {
          type:
            params.mediaType === 'video'
              ? 'http://activitystrea.ms/schema/1.0/video'
              : 'http://activitystrea.ms/schema/1.0/audio',
          name: { 'en-US': params.activityName },
        },
      },
      result: {
        duration: params.duration ? `PT${params.duration}S` : undefined,
        extensions: {
          'http://id.tincanapi.com/extension/time': params.currentTime,
          ...params.extensions,
        },
      },
    });

    return this.sendStatement(statement);
  }

  /**
   * Helper: Track session lifecycle events
   */
  async trackSessionEvent(params: {
    verb: 'initialized' | 'suspended' | 'resumed' | 'terminated';
    activityId: string;
    activityName: string;
    extensions?: Record<string, unknown>;
  }): Promise<{ success: boolean; error?: string }> {
    const verbMap = {
      initialized: XApiVerbs.initialized,
      suspended: XApiVerbs.suspended,
      resumed: XApiVerbs.resumed,
      terminated: XApiVerbs.terminated,
    };

    const statement = this.createStatement({
      verb: verbMap[params.verb],
      object: {
        id: params.activityId,
        objectType: 'Activity',
        definition: {
          name: { 'en-US': params.activityName },
        },
      },
      result: {
        extensions: params.extensions,
      },
    });

    return this.sendStatement(statement);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopAutoFlush();
    this.flushStatements();
  }
}

/**
 * Create a configured LRS client
 */
export function createLRSClient(config: LRSClientConfig): LRSClient {
  return new LRSClient(config);
}
