import { buildStatement, type LRSClient } from '@/lib/inspire-ignite/client';
import type { CognitiveLoadIndex } from '@/lib/inspire-ignite/cognitive-load';
import { LXP360ExtensionKeys, XApiVerbs } from '@/lib/inspire-ignite/types/xapi';

export interface TrackerConfig {
  lrsClient: LRSClient;
  userId: string;
  userEmail?: string;
  userName?: string;
  courseId: string;
  courseName: string;
}

/**
 * xAPI Tracker for the INSPIRE Player
 * Handles all learning event tracking
 */
export class InspireTracker {
  private config: TrackerConfig;
  private sessionStartTime: number;

  constructor(config: TrackerConfig) {
    this.config = config;
    this.sessionStartTime = Date.now();
  }

  /**
   * Track session initialization
   */
  async trackSessionStart(): Promise<void> {
    const statement = buildStatement()
      .actorFromUser(this.config.userId, this.config.userEmail, this.config.userName)
      .verb(XApiVerbs.initialized)
      .activity({
        id: `${this.config.courseId}`,
        name: this.config.courseName,
        type: 'http://adlnet.gov/expapi/activities/course',
      })
      .withContext({
        sessionId: this.config.lrsClient.getSessionId(),
      })
      .build();

    await this.config.lrsClient.sendStatement(statement);
  }

  /**
   * Track session end
   */
  async trackSessionEnd(): Promise<void> {
    const duration = (Date.now() - this.sessionStartTime) / 1000;

    const statement = buildStatement()
      .actorFromUser(this.config.userId, this.config.userEmail, this.config.userName)
      .verb(XApiVerbs.terminated)
      .activity({
        id: `${this.config.courseId}`,
        name: this.config.courseName,
        type: 'http://adlnet.gov/expapi/activities/course',
      })
      .withResult({ durationSeconds: duration })
      .withContext({
        sessionId: this.config.lrsClient.getSessionId(),
      })
      .build();

    await this.config.lrsClient.sendStatement(statement);
  }

  /**
   * Track block start
   */
  async trackBlockStart(blockId: string, blockName: string, blockType: string): Promise<void> {
    const statement = buildStatement()
      .actorFromUser(this.config.userId, this.config.userEmail, this.config.userName)
      .verb(XApiVerbs.attempted)
      .activity({
        id: `${this.config.courseId}/blocks/${blockId}`,
        name: blockName,
        type: `http://lxp360.com/activity-types/${blockType}`,
      })
      .withContext({
        sessionId: this.config.lrsClient.getSessionId(),
      })
      .build();

    await this.config.lrsClient.sendStatement(statement);
  }

  /**
   * Track assessment answer
   */
  async trackAssessmentAnswer(params: {
    blockId: string;
    blockName: string;
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
    durationSeconds: number;
    score?: number;
    correctPattern?: string[];
    choices?: Array<{ id: string; description: string }>;
    numberOfChanges?: number;
    attemptNumber?: number;
    confidenceInterval?: number;
    distractorType?: string;
  }): Promise<void> {
    const extensions: Record<string, unknown> = {};

    if (params.numberOfChanges !== undefined) {
      extensions[LXP360ExtensionKeys.numberOfChanges] = params.numberOfChanges;
    }
    if (params.attemptNumber !== undefined) {
      extensions[LXP360ExtensionKeys.attemptNumber] = params.attemptNumber;
    }
    if (params.confidenceInterval !== undefined) {
      extensions[LXP360ExtensionKeys.confidenceInterval] = params.confidenceInterval;
    }
    if (params.distractorType) {
      extensions[LXP360ExtensionKeys.distractorType] = params.distractorType;
    }

    await this.config.lrsClient.trackAnswered({
      activityId: `${this.config.courseId}/blocks/${params.blockId}`,
      activityName: params.blockName,
      interactionType: params.interactionType,
      response: params.response,
      success: params.success,
      duration: params.durationSeconds,
      correctPattern: params.correctPattern,
      choices: params.choices,
      extensions,
    });
  }

  /**
   * Track block completion
   */
  async trackBlockCompletion(params: {
    blockId: string;
    blockName: string;
    durationSeconds: number;
    score?: number;
    success?: boolean;
  }): Promise<void> {
    await this.config.lrsClient.trackCompleted({
      activityId: `${this.config.courseId}/blocks/${params.blockId}`,
      activityName: params.blockName,
      duration: params.durationSeconds,
      score:
        params.score !== undefined
          ? { scaled: params.score / 100, raw: params.score, min: 0, max: 100 }
          : undefined,
    });
  }

  /**
   * Track interactive block interaction
   */
  async trackInteraction(params: {
    blockId: string;
    blockName: string;
    interactionType: string;
    detail?: string;
  }): Promise<void> {
    await this.config.lrsClient.trackInteracted({
      activityId: `${this.config.courseId}/blocks/${params.blockId}`,
      activityName: params.blockName,
      description: params.detail,
      extensions: {
        'http://lxp360.com/extension/interaction_type': params.interactionType,
      },
    });
  }

  /**
   * Track media playback
   */
  async trackMediaPlayback(params: {
    blockId: string;
    blockName: string;
    mediaType: 'video' | 'audio';
    event: 'played' | 'paused' | 'completed';
    currentTime?: number;
    duration?: number;
  }): Promise<void> {
    await this.config.lrsClient.trackMediaEvent({
      verb: params.event,
      activityId: `${this.config.courseId}/blocks/${params.blockId}`,
      activityName: params.blockName,
      mediaType: params.mediaType,
      currentTime: params.currentTime,
      duration: params.duration,
    });
  }

  /**
   * Track progress through course
   */
  async trackProgress(progressPercent: number): Promise<void> {
    await this.config.lrsClient.trackProgressed({
      activityId: this.config.courseId,
      activityName: this.config.courseName,
      progressPercent,
    });
  }

  /**
   * Track cognitive load measurement
   */
  async trackCognitiveLoad(load: CognitiveLoadIndex): Promise<void> {
    const statement = buildStatement()
      .actorFromUser(this.config.userId, this.config.userEmail, this.config.userName)
      .verb(XApiVerbs.experienced)
      .activity({
        id: `${this.config.courseId}/cognitive-load`,
        name: 'Cognitive Load Measurement',
        type: 'http://lxp360.com/activity-types/cognitive-load',
      })
      .withResult({
        score: load.totalLoad,
        extensions: {
          [LXP360ExtensionKeys.cognitiveLoadIndex]: load.totalLoad,
          'http://lxp360.com/extension/intrinsic_load': load.intrinsicLoad,
          'http://lxp360.com/extension/extraneous_load': load.extraneousLoad,
          'http://lxp360.com/extension/germane_load': load.germaneLoad,
          'http://lxp360.com/extension/overload_risk': load.overloadRisk,
        },
      })
      .withContext({
        sessionId: this.config.lrsClient.getSessionId(),
      })
      .build();

    await this.config.lrsClient.sendStatement(statement);
  }

  /**
   * Track break suggestion
   */
  async trackBreakSuggestion(params: {
    fatigueLevel: number;
    accepted: boolean;
    suggestedDuration: number;
  }): Promise<void> {
    const statement = buildStatement()
      .actorFromUser(this.config.userId, this.config.userEmail, this.config.userName)
      .verb(params.accepted ? XApiVerbs.suspended : XApiVerbs.skipped)
      .activity({
        id: `${this.config.courseId}/break-suggestion`,
        name: 'Break Suggestion',
        type: 'http://lxp360.com/activity-types/break-suggestion',
      })
      .withResult({
        extensions: {
          [LXP360ExtensionKeys.fatigueLevel]: params.fatigueLevel,
          [LXP360ExtensionKeys.breakRecommended]: true,
          'http://lxp360.com/extension/break_accepted': params.accepted,
          'http://lxp360.com/extension/suggested_duration': params.suggestedDuration,
        },
      })
      .withContext({
        sessionId: this.config.lrsClient.getSessionId(),
      })
      .build();

    await this.config.lrsClient.sendStatement(statement);
  }
}

/**
 * Create a new tracker instance
 */
export function createTracker(config: TrackerConfig): InspireTracker {
  return new InspireTracker(config);
}
