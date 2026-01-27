// =============================================================================
// PLAYER xAPI INTEGRATION
// =============================================================================
// Connects the player state machine to the xAPI emitter.
// Emits Deep Profile statements for player events including:
// - Started/Paused/Completed
// - Hesitation/Skimmed/Engagement
// - Modality switches
// - Offline resume
// =============================================================================

import type { ContentAtom } from '@/types/content/atom';
import type { TrackingConfig } from '@/types/xapi';
import type { DeepXAPIStatement } from '@/types/xapi/deep-profile';
import { type EmitterConfig, XAPIEmitter } from '../xapi/emitter';
import { EngagementLevel, Modality, ModalitySwitchReason } from '../xapi/extensions';
import { createLRSClient, type ILRSClient } from '../xapi/lrs-client';
import type { EngagementMetrics, PlayerContext, PlayerMode, PlayerStateValue } from './machine';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Configuration for the player xAPI integration.
 */
export interface PlayerXAPIConfig {
  /** Actor (learner) information */
  actor: {
    userId: string;
    email?: string;
    name?: string;
  };
  /** Tenant/organization ID */
  tenantId: string;
  /** Session/registration ID */
  sessionId: string;
  /** Base URL for activity IRIs */
  baseUrl?: string;
  /** Tracking configuration (internal or external LRS) */
  tracking: TrackingConfig;
  /** Emitter configuration overrides */
  emitterConfig?: Partial<EmitterConfig>;
}

/**
 * Hesitation data for quiz/assessment interactions.
 */
export interface HesitationData {
  /** Time in ms before learner started answering */
  hesitationTime?: number;
  /** Time to first action (ms) */
  timeToFirstAction?: number;
  /** Number of answer revisions */
  revisionCount?: number;
  /** Pause duration during response (ms) */
  pauseDuration?: number;
  /** Number of option hovers */
  optionHoverCount?: number;
}

/**
 * Engagement data for content consumption.
 */
export interface EngagementData {
  /** Engagement depth (1-5) */
  engagementDepth?: (typeof EngagementLevel)[keyof typeof EngagementLevel];
  /** Interaction count */
  interactionCount?: number;
  /** Scroll depth (0-100) */
  scrollDepth?: number;
  /** Focus loss count */
  focusLossCount?: number;
  /** Background time (ms) */
  backgroundTime?: number;
  /** Rage click count */
  rageClicks?: number;
  /** Active time (ms) */
  activeTime?: number;
}

/**
 * Offline resume data.
 */
export interface OfflineResumeData {
  /** Time spent offline (ms) */
  offlineDuration: number;
  /** Statements queued while offline */
  queuedStatementCount: number;
  /** Position resumed from (seconds) */
  resumePosition: number;
}

/**
 * Completion result data.
 */
export interface CompletionResult {
  /** Was the content fully completed */
  completed: boolean;
  /** Was it successful (for assessments) */
  success?: boolean;
  /** Score (for assessments) */
  score?: {
    scaled?: number;
    raw?: number;
    min?: number;
    max?: number;
  };
  /** Duration in seconds */
  durationSeconds: number;
}

// =============================================================================
// PLAYER XAPI EMITTER CLASS
// =============================================================================

/**
 * Player xAPI Emitter - Bridges the player state machine with xAPI emission.
 *
 * @example
 * ```ts
 * const emitter = new PlayerXAPIEmitter({
 *   actor: { userId: 'user-123', email: 'user@example.com' },
 *   tenantId: 'tenant-abc',
 *   sessionId: 'session-xyz',
 *   tracking: { mode: 'internal', organizationId: 'org-123' },
 * });
 *
 * // Connect to player store
 * emitter.connectToStore(playerStore);
 *
 * // Or emit manually
 * emitter.emitStarted(atom);
 * emitter.emitProgressed(atom, 0.5);
 * emitter.emitCompleted(atom, { completed: true, durationSeconds: 120 });
 * ```
 */
export class PlayerXAPIEmitter {
  private config: PlayerXAPIConfig;
  private emitter: XAPIEmitter;
  private lrsClient: ILRSClient;
  private unsubscribe: (() => void) | null = null;
  private backgroundEnteredAt: number | null = null;

  constructor(config: PlayerXAPIConfig) {
    this.config = config;

    // Get or create the singleton emitter
    this.emitter = XAPIEmitter.getInstance({
      baseUrl: config.baseUrl ?? 'https://lxd360.com',
      ...config.emitterConfig,
    });

    // Create LRS client
    this.lrsClient = createLRSClient(config.tracking);

    // Wire up emitter to LRS client
    // Using unknown cast to bridge between emitter's Statement type and LRS client's XAPIStatement
    this.emitter.setSendHandler(async (statements) => {
      const response = await this.lrsClient.sendStatements(
        statements as unknown as Parameters<typeof this.lrsClient.sendStatements>[0],
      );
      return {
        success: response.success,
        statementIds: response.statementIds,
        error: response.error,
      };
    });
  }

  // ---------------------------------------------------------------------------
  // STORE CONNECTION
  // ---------------------------------------------------------------------------

  /**
   * Connect to a player store to automatically emit statements on state changes.
   * Returns an unsubscribe function.
   */
  connectToStore(store: {
    getState: () => PlayerContext;
    subscribe: (
      selector: (state: PlayerContext) => unknown,
      callback: (state: unknown, prevState: unknown) => void,
    ) => () => void;
  }): () => void {
    // Subscribe to state changes
    const unsubState = store.subscribe(
      (state) => state.state,
      (state, prevState) => {
        const context = store.getState();
        this.handleStateChange(state as PlayerStateValue, prevState as PlayerStateValue, context);
      },
    );

    // Subscribe to mode changes for modality switch tracking
    const unsubMode = store.subscribe(
      (state) => state.mode,
      (mode, prevMode) => {
        const context = store.getState();
        if (context.atom && prevMode !== mode) {
          this.emitModalitySwitch(
            context.atom,
            this.mapPlayerModeToModality(prevMode as PlayerMode),
            this.mapPlayerModeToModality(mode as PlayerMode),
          );
        }
      },
    );

    // Subscribe to background mode changes
    const unsubBackground = store.subscribe(
      (state) => state.isBackgroundMode,
      (isBackground, wasBackground) => {
        const context = store.getState();
        if (context.atom) {
          if (isBackground && !wasBackground) {
            this.backgroundEnteredAt = Date.now();
            this.emitter.emitEnteredBackground(
              this.config.actor,
              this.buildActivity(context.atom),
              this.config.sessionId,
            );
          } else if (!isBackground && wasBackground && this.backgroundEnteredAt) {
            const duration = Date.now() - this.backgroundEnteredAt;
            this.emitter.emitEnteredForeground(
              this.config.actor,
              this.buildActivity(context.atom),
              duration,
              this.config.sessionId,
            );
            this.backgroundEnteredAt = null;
          }
        }
      },
    );

    // Store unsubscribe function
    this.unsubscribe = () => {
      unsubState();
      unsubMode();
      unsubBackground();
    };

    return this.unsubscribe;
  }

  /**
   * Disconnect from the player store.
   */
  disconnect(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // ---------------------------------------------------------------------------
  // STATE CHANGE HANDLING
  // ---------------------------------------------------------------------------

  /**
   * Handle player state changes and emit appropriate xAPI statements.
   */
  private handleStateChange(
    newState: PlayerStateValue,
    prevState: PlayerStateValue,
    context: PlayerContext,
  ): void {
    if (!context.atom) return;

    const atom = context.atom;

    switch (newState) {
      case 'playing':
        if (prevState === 'ready' || prevState === 'idle') {
          // Initial start
          this.emitStarted(atom);
        } else if (prevState === 'paused') {
          // Resume from pause
          this.emitter.emitVideoPlayed(
            this.config.actor,
            this.buildActivity(atom),
            context.currentTime,
            this.config.sessionId,
          );
        }
        break;

      case 'paused':
        if (prevState === 'playing') {
          this.emitPaused(atom, context.currentTime);
        }
        break;

      case 'completed':
        this.emitCompleted(atom, {
          completed: true,
          durationSeconds: Math.round(context.sessionTimeMs / 1000),
          score: context.progressPercent >= 100 ? { scaled: 1 } : undefined,
        });
        break;

      case 'error':
        // Emit terminated with error context
        this.emitter.emit({
          actor: this.config.actor,
          verb: 'terminated',
          activity: this.buildActivity(atom),
          context: {
            registration: this.config.sessionId,
            extensions: {
              'https://lxd360.com/xapi/extensions/error': context.error?.message,
              'https://lxd360.com/xapi/extensions/error-type': context.error?.type,
            },
          },
        });
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // STANDARD VERB METHODS
  // ---------------------------------------------------------------------------

  /**
   * Emit a "started" statement when content begins.
   */
  emitStarted(atom: ContentAtom): void {
    this.emitter.emitInitialized(
      this.config.actor,
      this.buildActivity(atom),
      this.config.sessionId,
    );
  }

  /**
   * Emit a "progressed" statement with current progress.
   */
  emitProgressed(atom: ContentAtom, progress: number): void {
    this.emitter.emitProgressed(
      this.config.actor,
      this.buildActivity(atom),
      progress,
      this.config.sessionId,
    );
  }

  /**
   * Emit a "paused" statement.
   */
  emitPaused(atom: ContentAtom, position: number): void {
    this.emitter.emitVideoPaused(
      this.config.actor,
      this.buildActivity(atom),
      position,
      this.config.sessionId,
    );
  }

  /**
   * Emit a "completed" statement with results.
   */
  emitCompleted(atom: ContentAtom, result: CompletionResult): void {
    this.emitter.emitCompleted(
      this.config.actor,
      this.buildActivity(atom),
      {
        success: result.success,
        score: result.score,
        durationSeconds: result.durationSeconds,
      },
      this.config.sessionId,
    );
  }

  // ---------------------------------------------------------------------------
  // DEEP PROFILE VERB METHODS
  // ---------------------------------------------------------------------------

  /**
   * Emit a "hesitated" statement for false confidence detection.
   */
  emitHesitation(atom: ContentAtom, hesitationData: HesitationData): void {
    this.emitter.emitWithProfile({
      actor: this.config.actor,
      verb: 'hesitated',
      activity: this.buildActivity(atom),
      hesitation: {
        hesitationTime: hesitationData.hesitationTime,
        timeToFirstAction: hesitationData.timeToFirstAction,
        revisionCount: hesitationData.revisionCount ?? 0,
        pauseDuration: hesitationData.pauseDuration,
        optionHoverCount: hesitationData.optionHoverCount,
      },
      context: {
        registration: this.config.sessionId,
        sessionId: this.config.sessionId,
        blockId: atom.id,
        blockType: atom.type,
      },
    });
  }

  /**
   * Emit a "skimmed" statement for low engagement detection.
   */
  emitSkimmed(atom: ContentAtom, engagementData: EngagementData): void {
    this.emitter.emitWithProfile({
      actor: this.config.actor,
      verb: 'skimmed',
      activity: this.buildActivity(atom),
      engagement: {
        engagementDepth: engagementData.engagementDepth ?? EngagementLevel.SKIMMED,
        interactionCount: engagementData.interactionCount ?? 0,
        scrollDepth: engagementData.scrollDepth ?? 0,
        focusLossCount: engagementData.focusLossCount ?? 0,
        backgroundTime: engagementData.backgroundTime ?? 0,
        rageClicks: engagementData.rageClicks ?? 0,
        activeTime: engagementData.activeTime ?? 0,
      },
      context: {
        registration: this.config.sessionId,
        sessionId: this.config.sessionId,
        blockId: atom.id,
        blockType: atom.type,
      },
    });
  }

  /**
   * Emit engagement data with Deep Profile extensions.
   */
  emitEngagement(
    atom: ContentAtom,
    engagementData: EngagementData,
    engagement: EngagementMetrics,
  ): void {
    this.emitter.emitWithProfile({
      actor: this.config.actor,
      verb: 'interacted',
      activity: this.buildActivity(atom),
      engagement: {
        engagementDepth: engagementData.engagementDepth ?? this.inferEngagementLevel(engagement),
        interactionCount: engagement.interactionCount,
        scrollDepth: engagementData.scrollDepth ?? 0,
        focusLossCount: engagement.tabSwitches,
        backgroundTime: engagement.blurTimeMs,
        rageClicks: engagementData.rageClicks ?? 0,
        activeTime: engagementData.activeTime ?? 0,
      },
      context: {
        registration: this.config.sessionId,
        sessionId: this.config.sessionId,
        blockId: atom.id,
        blockType: atom.type,
      },
    });
  }

  /**
   * Emit a "switched modality" statement.
   */
  emitModalitySwitch(
    atom: ContentAtom,
    fromModality: string,
    toModality: string,
    reason: string = ModalitySwitchReason.LEARNER_INITIATED,
  ): void {
    this.emitter.emitModalitySwitched(
      this.config.actor,
      this.buildActivity(atom),
      fromModality,
      toModality,
      reason,
      this.config.sessionId,
    );
  }

  /**
   * Emit a "resumed offline" statement when reconnecting.
   */
  emitResumedOffline(atom: ContentAtom, offlineData: OfflineResumeData): void {
    this.emitter.emit({
      actor: this.config.actor,
      verb: 'resumed',
      activity: this.buildActivity(atom),
      result: {
        durationSeconds: Math.round(offlineData.offlineDuration / 1000),
      },
      context: {
        registration: this.config.sessionId,
        extensions: {
          'https://lxd360.com/xapi/extensions/offline-duration': offlineData.offlineDuration,
          'https://lxd360.com/xapi/extensions/queued-statements': offlineData.queuedStatementCount,
          'https://lxd360.com/xapi/extensions/resume-position': offlineData.resumePosition,
          'https://lxd360.com/xapi/extensions/offline-sync': true,
        },
      },
      options: { priority: 'high' },
    });
  }

  // ---------------------------------------------------------------------------
  // BATCH OPERATIONS
  // ---------------------------------------------------------------------------

  /**
   * Emit a batch of pre-built statements.
   */
  emitBatch(statements: DeepXAPIStatement[]): void {
    for (const statement of statements) {
      // Using unknown cast to bridge between DeepXAPIStatement and emitter's Statement type
      this.emitter.emitStatement(
        statement as unknown as Parameters<typeof this.emitter.emitStatement>[0],
      );
    }
  }

  /**
   * Force flush all pending statements.
   */
  async flush(): Promise<void> {
    await this.emitter.forceFlush();
  }

  /**
   * Get current queue status.
   */
  getQueueStatus(): {
    total: number;
    pending: number;
    failed: number;
    isOnline: boolean;
  } {
    return this.emitter.getQueueStatus();
  }

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  /**
   * Build an activity object from a ContentAtom.
   */
  private buildActivity(atom: ContentAtom): {
    id: string;
    name: string;
    type?: string;
    description?: string;
  } {
    return {
      id: atom.xapi_activity_id || atom.id,
      name: atom.title,
      type: atom.xapi_activity_type || this.mapAtomTypeToActivityType(atom.type),
      description: atom.description,
    };
  }

  /**
   * Map atom type to xAPI activity type IRI.
   */
  private mapAtomTypeToActivityType(atomType: string): string {
    const mapping: Record<string, string> = {
      video: 'http://adlnet.gov/expapi/activities/media',
      audio: 'http://adlnet.gov/expapi/activities/media',
      document: 'http://adlnet.gov/expapi/activities/file',
      quiz: 'http://adlnet.gov/expapi/activities/assessment',
      interactive: 'http://adlnet.gov/expapi/activities/interaction',
      scorm: 'http://adlnet.gov/expapi/activities/module',
      roleplay: 'http://adlnet.gov/expapi/activities/simulation',
      simulation: 'http://adlnet.gov/expapi/activities/simulation',
      article: 'http://adlnet.gov/expapi/activities/file',
    };
    return mapping[atomType] || 'http://adlnet.gov/expapi/activities/media';
  }

  /**
   * Map player mode to modality string.
   */
  private mapPlayerModeToModality(mode: PlayerMode): string {
    const mapping: Record<PlayerMode, string> = {
      video: Modality.VIDEO,
      audio: Modality.AUDIO,
      text: Modality.TEXT,
    };
    return mapping[mode] || Modality.VIDEO;
  }

  /**
   * Infer engagement level from metrics.
   */
  private inferEngagementLevel(
    metrics: EngagementMetrics,
  ): (typeof EngagementLevel)[keyof typeof EngagementLevel] {
    // High focus and interactions = deep engagement
    if (metrics.focusScore >= 80 && metrics.interactionCount >= 5) {
      return EngagementLevel.MASTERED;
    }
    if (metrics.focusScore >= 60 && metrics.interactionCount >= 3) {
      return EngagementLevel.EXPLORED;
    }
    if (metrics.focusScore >= 40 && metrics.interactionCount >= 1) {
      return EngagementLevel.INTERACTED;
    }
    if (metrics.focusScore >= 20) {
      return EngagementLevel.READ;
    }
    return EngagementLevel.SKIMMED;
  }

  /**
   * Destroy the emitter and clean up resources.
   */
  destroy(): void {
    this.disconnect();
    this.lrsClient.destroy();
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a PlayerXAPIEmitter instance.
 */
export function createPlayerXAPIEmitter(config: PlayerXAPIConfig): PlayerXAPIEmitter {
  return new PlayerXAPIEmitter(config);
}

// =============================================================================
// SYNC INTEGRATION FOR PLAYER STORE
// =============================================================================

/**
 * Creates a sync function for the player store that uses the LRS client.
 * This can be passed to createPlayerStore options.
 */
export function createPlayerSyncHandler(
  tracking: TrackingConfig,
): (statements: DeepXAPIStatement[]) => Promise<void> {
  const client = createLRSClient(tracking);

  return async (statements: DeepXAPIStatement[]) => {
    if (statements.length === 0) return;

    // Using unknown cast to bridge between DeepXAPIStatement and LRS client's XAPIStatement
    const result = await client.sendStatements(
      statements as unknown as Parameters<typeof client.sendStatements>[0],
    );
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to sync statements');
    }
  };
}

// =============================================================================
// HOOK FOR REACT INTEGRATION
// =============================================================================

/**
 * Options for usePlayerXAPI hook.
 */
export interface UsePlayerXAPIOptions {
  /** Actor information */
  actor: {
    userId: string;
    email?: string;
    name?: string;
  };
  /** Tenant ID */
  tenantId: string;
  /** Session/registration ID */
  sessionId: string;
  /** Tracking configuration */
  tracking: TrackingConfig;
  /** Whether to auto-connect to the store */
  autoConnect?: boolean;
}
