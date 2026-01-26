/**
 * =============================================================================
 * LXD360 xAPI Statement Emitter
 * =============================================================================
 *
 * Singleton emitter class for batching and sending xAPI statements.
 * Features:
 * - Statement batching (configurable batch size and interval)
 * - Automatic retry with exponential backoff
 * - Offline queue with localStorage persistence
 * - Priority-based statement ordering
 * - Integration with LRS client
 *
 * @module lib/xapi/emitter
 * @version 1.0.0
 */

import { v4 as generateUUID } from 'uuid';
import {
  buildDeepProfileExtensions,
  buildModalityExtensions,
  type ConfidenceData,
  type EngagementData,
  type HesitationData,
  type ModalityData,
} from './extensions';
import { StatementBuilder, type ActorOptions, type ActivityOptions } from './statement-builder';
import type { Statement } from './types';
import type { XAPIVerbKey } from './verbs';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Priority levels for statement emission
 */
export type EmitPriority = 'high' | 'normal' | 'low';

/**
 * Configuration for the XAPIEmitter
 */
export interface EmitterConfig {
  /** Base URL for activity IRIs */
  baseUrl?: string;
  /** Maximum statements per batch */
  batchSize?: number;
  /** Interval between batch flushes (ms) */
  flushInterval?: number;
  /** Maximum retry attempts for failed sends */
  maxRetries?: number;
  /** Base delay for exponential backoff (ms) */
  retryBaseDelay?: number;
  /** Maximum queue size before dropping low-priority statements */
  maxQueueSize?: number;
  /** Enable localStorage persistence for offline support */
  enableOfflineStorage?: boolean;
  /** Storage key for offline queue */
  storageKey?: string;
  /** Custom send handler (for integration with LRS client) */
  sendHandler?: (statements: Statement[]) => Promise<SendResult>;
}

/**
 * Result of a send operation
 */
export interface SendResult {
  success: boolean;
  statementIds?: string[];
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Queued statement with metadata
 */
interface QueuedStatement {
  id: string;
  statement: Statement;
  priority: EmitPriority;
  attempts: number;
  createdAt: number;
  lastAttempt?: number;
  error?: string;
}

/**
 * Queue status information
 */
export interface EmitterQueueStatus {
  /** Total statements in queue */
  total: number;
  /** Statements not yet attempted */
  pending: number;
  /** Statements that failed at least once */
  failed: number;
  /** High priority statement count */
  highPriority: number;
  /** Whether currently flushing */
  isFlushing: boolean;
  /** Whether browser is online */
  isOnline: boolean;
}

/**
 * Batch send result
 */
export interface BatchResult {
  sent: number;
  failed: number;
  errors: Array<{ statementId: string; error: string }>;
}

/**
 * Emit options for individual statements
 */
export interface EmitOptions {
  priority?: EmitPriority;
  immediate?: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: Required<Omit<EmitterConfig, 'sendHandler'>> & {
  sendHandler: EmitterConfig['sendHandler'];
} = {
  baseUrl: 'https://lxd360.com',
  batchSize: 25,
  flushInterval: 10000, // 10 seconds
  maxRetries: 3,
  retryBaseDelay: 1000,
  maxQueueSize: 1000,
  enableOfflineStorage: true,
  storageKey: 'lxd360_xapi_queue',
  sendHandler: undefined,
};

// ============================================================================
// XAPI EMITTER CLASS
// ============================================================================

/**
 * Singleton xAPI Statement Emitter
 *
 * @example
 * ```ts
 * const emitter = XAPIEmitter.getInstance();
 *
 * // Configure with custom handler
 * emitter.configure({
 *   sendHandler: async (statements) => {
 *     const response = await lrsClient.sendStatements(statements);
 *     return response;
 *   }
 * });
 *
 * // Emit a statement
 * emitter.emit({
 *   actor: { userId: 'user-123', name: 'John Doe' },
 *   verb: 'completed',
 *   activity: { id: 'lesson-1', name: 'Introduction' }
 * });
 *
 * // Emit with Deep Profile extensions
 * emitter.emitWithProfile({
 *   actor: { userId: 'user-123' },
 *   verb: 'answered',
 *   activity: { id: 'question-1', name: 'Quiz Question' },
 *   hesitation: { hesitationTime: 3500, revisionCount: 2 },
 *   confidence: { inferredConfidence: 0.7 }
 * });
 * ```
 */
export class XAPIEmitter {
  private static instance: XAPIEmitter | null = null;

  private config: Required<Omit<EmitterConfig, 'sendHandler'>> & {
    sendHandler: EmitterConfig['sendHandler'];
  };
  private queue: QueuedStatement[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isFlushing = false;
  private isOnline = true;
  private sequenceCounter = 0;
  private statusListeners: Set<(status: EmitterQueueStatus) => void> = new Set();

  // ----------------------------------------
  // SINGLETON MANAGEMENT
  // ----------------------------------------

  private constructor(config?: EmitterConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.setupOnlineListener();
    this.loadOfflineQueue();
    this.startAutoFlush();
  }

  /**
   * Get the singleton XAPIEmitter instance
   */
  static getInstance(config?: EmitterConfig): XAPIEmitter {
    if (!XAPIEmitter.instance) {
      XAPIEmitter.instance = new XAPIEmitter(config);
    }
    return XAPIEmitter.instance;
  }

  /**
   * Reset the singleton instance (for testing)
   */
  static resetInstance(): void {
    if (XAPIEmitter.instance) {
      XAPIEmitter.instance.destroy();
      XAPIEmitter.instance = null;
    }
  }

  /**
   * Check if an instance exists
   */
  static hasInstance(): boolean {
    return XAPIEmitter.instance !== null;
  }

  // ----------------------------------------
  // CONFIGURATION
  // ----------------------------------------

  /**
   * Update emitter configuration
   */
  configure(config: EmitterConfig): void {
    const restartFlush =
      config.flushInterval !== undefined && config.flushInterval !== this.config.flushInterval;

    this.config = { ...this.config, ...config };

    if (restartFlush) {
      this.stopAutoFlush();
      this.startAutoFlush();
    }
  }

  /**
   * Set the send handler for statements
   */
  setSendHandler(handler: (statements: Statement[]) => Promise<SendResult>): void {
    this.config.sendHandler = handler;
  }

  // ----------------------------------------
  // STATEMENT EMISSION
  // ----------------------------------------

  /**
   * Emit a basic xAPI statement
   */
  emit(params: {
    actor: ActorOptions;
    verb: XAPIVerbKey;
    activity: ActivityOptions;
    result?: {
      score?: { scaled?: number; raw?: number; min?: number; max?: number };
      success?: boolean;
      completion?: boolean;
      response?: string;
      durationSeconds?: number;
    };
    context?: {
      registration?: string;
      parentActivity?: { id: string; name: string; type?: string };
      groupingActivity?: { id: string; name: string; type?: string };
      extensions?: Record<string, unknown>;
    };
    options?: EmitOptions;
  }): string {
    const builder = new StatementBuilder(this.config.baseUrl)
      .withActor(params.actor)
      .withVerb(params.verb)
      .withActivity(params.activity);

    // Add result
    if (params.result) {
      builder.withResult(params.result);
    }

    // Add context
    if (params.context) {
      if (params.context.registration) {
        builder.withRegistration(params.context.registration);
      }
      if (params.context.parentActivity) {
        builder.withParentActivity(params.context.parentActivity);
      }
      if (params.context.groupingActivity) {
        builder.withGroupingActivity(params.context.groupingActivity);
      }
      if (params.context.extensions) {
        builder.withContextExtensions(params.context.extensions);
      }
    }

    // Add sequence number
    this.sequenceCounter++;
    builder.withContextExtensions({
      'https://lxd360.com/xapi/extensions/sequence-number': this.sequenceCounter,
    });

    const statement = builder.build();
    const statementId = statement.id ?? generateUUID();

    this.queueStatement(
      { ...statement, id: statementId },
      params.options?.priority ?? 'normal',
      params.options?.immediate ?? false,
    );

    return statementId;
  }

  /**
   * Emit a statement with Deep Profile behavioral extensions
   */
  emitWithProfile(params: {
    actor: ActorOptions;
    verb: XAPIVerbKey;
    activity: ActivityOptions;
    hesitation?: HesitationData;
    confidence?: ConfidenceData;
    engagement?: EngagementData;
    modality?: ModalityData;
    result?: {
      score?: { scaled?: number; raw?: number; min?: number; max?: number };
      success?: boolean;
      completion?: boolean;
      response?: string;
      durationSeconds?: number;
    };
    context?: {
      registration?: string;
      parentActivity?: { id: string; name: string; type?: string };
      groupingActivity?: { id: string; name: string; type?: string };
      sessionId?: string;
      blockId?: string;
      blockType?: string;
    };
    options?: EmitOptions;
  }): string {
    // Build Deep Profile extensions
    const profileExtensions = buildDeepProfileExtensions({
      hesitation: params.hesitation,
      confidence: params.confidence,
      engagement: params.engagement,
      modality: params.modality,
      sessionId: params.context?.sessionId,
      blockId: params.context?.blockId,
      blockType: params.context?.blockType,
      sequenceNumber: ++this.sequenceCounter,
    });

    return this.emit({
      actor: params.actor,
      verb: params.verb,
      activity: params.activity,
      result: params.result,
      context: {
        registration: params.context?.registration,
        parentActivity: params.context?.parentActivity,
        groupingActivity: params.context?.groupingActivity,
        extensions: profileExtensions,
      },
      options: params.options,
    });
  }

  /**
   * Emit a pre-built statement
   */
  emitStatement(statement: Statement, options?: EmitOptions): string {
    const id = statement.id ?? generateUUID();
    const statementWithId = { ...statement, id };

    this.queueStatement(statementWithId, options?.priority ?? 'normal', options?.immediate ?? false);

    return id;
  }

  // ----------------------------------------
  // CONVENIENCE METHODS
  // ----------------------------------------

  /**
   * Emit an "initialized" statement (session start)
   */
  emitInitialized(
    actor: ActorOptions,
    activity: ActivityOptions,
    registration?: string,
  ): string {
    return this.emit({
      actor,
      verb: 'initialized',
      activity,
      context: { registration },
      options: { priority: 'high' },
    });
  }

  /**
   * Emit a "completed" statement
   */
  emitCompleted(
    actor: ActorOptions,
    activity: ActivityOptions,
    result?: {
      score?: { scaled?: number; raw?: number; min?: number; max?: number };
      success?: boolean;
      durationSeconds?: number;
    },
    registration?: string,
  ): string {
    return this.emit({
      actor,
      verb: 'completed',
      activity,
      result: result ? { ...result, completion: true } : { completion: true },
      context: { registration },
      options: { priority: 'high' },
    });
  }

  /**
   * Emit a "progressed" statement
   */
  emitProgressed(
    actor: ActorOptions,
    activity: ActivityOptions,
    progress: number,
    registration?: string,
  ): string {
    return this.emit({
      actor,
      verb: 'progressed',
      activity,
      result: { score: { scaled: progress } },
      context: { registration },
    });
  }

  /**
   * Emit video played statement
   */
  emitVideoPlayed(
    actor: ActorOptions,
    activity: ActivityOptions,
    currentTime: number,
    registration?: string,
  ): string {
    return this.emit({
      actor,
      verb: 'played',
      activity,
      context: {
        registration,
        extensions: {
          'https://w3id.org/xapi/video/extensions/time': currentTime,
        },
      },
    });
  }

  /**
   * Emit video paused statement
   */
  emitVideoPaused(
    actor: ActorOptions,
    activity: ActivityOptions,
    currentTime: number,
    registration?: string,
  ): string {
    return this.emit({
      actor,
      verb: 'paused',
      activity,
      context: {
        registration,
        extensions: {
          'https://w3id.org/xapi/video/extensions/time': currentTime,
        },
      },
    });
  }

  /**
   * Emit video seeked statement
   */
  emitVideoSeeked(
    actor: ActorOptions,
    activity: ActivityOptions,
    fromTime: number,
    toTime: number,
    registration?: string,
  ): string {
    return this.emit({
      actor,
      verb: 'seeked',
      activity,
      context: {
        registration,
        extensions: {
          'https://w3id.org/xapi/video/extensions/time-from': fromTime,
          'https://w3id.org/xapi/video/extensions/time-to': toTime,
        },
      },
    });
  }

  /**
   * Emit modality switched statement
   */
  emitModalitySwitched(
    actor: ActorOptions,
    activity: ActivityOptions,
    fromModality: string,
    toModality: string,
    reason: string,
    registration?: string,
  ): string {
    return this.emit({
      actor,
      verb: 'switchedModality',
      activity,
      context: {
        registration,
        extensions: buildModalityExtensions({
          previousModality: fromModality as ModalityData['previousModality'],
          currentModality: toModality as ModalityData['currentModality'],
          modalitySwitchReason: reason as ModalityData['modalitySwitchReason'],
        }),
      },
    });
  }

  /**
   * Emit entered background statement (tab/app lost focus)
   */
  emitEnteredBackground(
    actor: ActorOptions,
    activity: ActivityOptions,
    registration?: string,
  ): string {
    return this.emit({
      actor,
      verb: 'enteredBackground',
      activity,
      context: { registration },
    });
  }

  /**
   * Emit entered foreground statement (tab/app regained focus)
   */
  emitEnteredForeground(
    actor: ActorOptions,
    activity: ActivityOptions,
    backgroundDuration: number,
    registration?: string,
  ): string {
    return this.emit({
      actor,
      verb: 'enteredForeground',
      activity,
      context: {
        registration,
        extensions: {
          'https://lxd360.com/xapi/extensions/background-time': backgroundDuration,
        },
      },
    });
  }

  // ----------------------------------------
  // QUEUE MANAGEMENT
  // ----------------------------------------

  /**
   * Add a statement to the queue
   */
  private queueStatement(statement: Statement, priority: EmitPriority, immediate: boolean): void {
    const statementId = statement.id ?? generateUUID();
    const queued: QueuedStatement = {
      id: statementId,
      statement: { ...statement, id: statementId },
      priority,
      attempts: 0,
      createdAt: Date.now(),
    };

    this.queue.push(queued);

    // Enforce queue size limits
    this.enforceQueueLimits();

    // Persist to offline storage
    this.saveOfflineQueue();

    // Notify listeners
    this.notifyStatusListeners();

    // Flush immediately if requested or queue is large
    if (immediate || this.queue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Enforce queue size limits by removing low-priority items
   */
  private enforceQueueLimits(): void {
    if (this.queue.length <= this.config.maxQueueSize) return;

    // Sort by priority (high first) and then by age (oldest first)
    this.queue.sort((a, b) => {
      const priorityOrder: Record<EmitPriority, number> = { high: 0, normal: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.createdAt - b.createdAt;
    });

    // Keep only maxQueueSize items
    this.queue = this.queue.slice(0, this.config.maxQueueSize);
  }

  /**
   * Flush the queue (send all pending statements)
   */
  async flush(): Promise<BatchResult> {
    if (this.isFlushing || !this.isOnline || this.queue.length === 0) {
      return { sent: 0, failed: 0, errors: [] };
    }

    if (!this.config.sendHandler) {
      return { sent: 0, failed: 0, errors: [{ statementId: 'N/A', error: 'No send handler configured' }] };
    }

    this.isFlushing = true;
    this.notifyStatusListeners();

    let totalSent = 0;
    let totalFailed = 0;
    const errors: BatchResult['errors'] = [];

    try {
      // Sort queue by priority
      this.queue.sort((a, b) => {
        const priorityOrder: Record<EmitPriority, number> = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      // Process in batches
      while (this.queue.length > 0 && this.isOnline) {
        const batch = this.queue.splice(0, this.config.batchSize);
        const statements = batch.map((q) => q.statement);

        try {
          const result = await this.sendWithRetry(statements, batch);

          if (result.success) {
            totalSent += statements.length;
          } else {
            // Re-queue failed items that haven't exceeded max retries
            const failedItems = batch.filter((item) => {
              item.attempts++;
              item.lastAttempt = Date.now();
              item.error = result.error?.message;

              if (item.attempts < this.config.maxRetries) {
                return true;
              }

              totalFailed++;
              errors.push({
                statementId: item.id,
                error: item.error ?? 'Max retries exceeded',
              });
              return false;
            });

            this.queue.unshift(...failedItems);
          }
        } catch (error) {
          // Re-queue with retry tracking
          const errorMessage = error instanceof Error ? error.message : 'Network error';

          const failedItems = batch.filter((item) => {
            item.attempts++;
            item.lastAttempt = Date.now();
            item.error = errorMessage;

            if (item.attempts < this.config.maxRetries) {
              return true;
            }

            totalFailed++;
            errors.push({
              statementId: item.id,
              error: item.error ?? 'Max retries exceeded',
            });
            return false;
          });

          this.queue.unshift(...failedItems);
          break; // Stop processing if we hit an error
        }

        // Small delay between batches to avoid overwhelming the server
        if (this.queue.length > 0) {
          await this.delay(100);
        }
      }
    } finally {
      this.isFlushing = false;
      this.saveOfflineQueue();
      this.notifyStatusListeners();
    }

    return { sent: totalSent, failed: totalFailed, errors };
  }

  /**
   * Send statements with exponential backoff retry
   */
  private async sendWithRetry(
    statements: Statement[],
    queuedItems: QueuedStatement[],
  ): Promise<SendResult> {
    if (!this.config.sendHandler) {
      return { success: false, error: { code: 0, message: 'No send handler' } };
    }

    const maxAttempts = Math.max(...queuedItems.map((q) => q.attempts)) + 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await this.config.sendHandler(statements);
        if (result.success) {
          return result;
        }

        // Check if we should retry based on error code
        if (result.error && result.error.code >= 500) {
          // Server error - retry with backoff
          const delay = this.config.retryBaseDelay * 2 ** attempt;
          await this.delay(delay);
          continue;
        }

        // Client error (4xx) - don't retry
        return result;
      } catch (error) {
        if (attempt < maxAttempts - 1) {
          const delay = this.config.retryBaseDelay * 2 ** attempt;
          await this.delay(delay);
        } else {
          throw error;
        }
      }
    }

    return { success: false, error: { code: 0, message: 'Max retries exceeded' } };
  }

  /**
   * Force flush all statements immediately
   */
  async forceFlush(): Promise<BatchResult> {
    return this.flush();
  }

  /**
   * Clear all queued statements
   */
  clearQueue(): void {
    this.queue = [];
    this.saveOfflineQueue();
    this.notifyStatusListeners();
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): EmitterQueueStatus {
    return {
      total: this.queue.length,
      pending: this.queue.filter((q) => q.attempts === 0).length,
      failed: this.queue.filter((q) => q.attempts > 0).length,
      highPriority: this.queue.filter((q) => q.priority === 'high').length,
      isFlushing: this.isFlushing,
      isOnline: this.isOnline,
    };
  }

  /**
   * Subscribe to queue status changes
   */
  onStatusChange(callback: (status: EmitterQueueStatus) => void): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  // ----------------------------------------
  // OFFLINE SUPPORT
  // ----------------------------------------

  /**
   * Save queue to localStorage
   */
  private saveOfflineQueue(): void {
    if (!this.config.enableOfflineStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.queue));
    } catch {
      // Storage full or unavailable - silently fail
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadOfflineQueue(): void {
    if (!this.config.enableOfflineStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const saved = localStorage.getItem(this.config.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as QueuedStatement[];
        // Merge with existing queue, avoiding duplicates
        const existingIds = new Set(this.queue.map((q) => q.id));
        const newItems = parsed.filter((q) => !existingIds.has(q.id));
        this.queue.push(...newItems);
      }
    } catch {
      // Invalid data - ignore
    }
  }

  // ----------------------------------------
  // AUTO-FLUSH MANAGEMENT
  // ----------------------------------------

  /**
   * Start automatic flush timer
   */
  private startAutoFlush(): void {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }

  /**
   * Stop automatic flush timer
   */
  private stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // ----------------------------------------
  // ONLINE/OFFLINE DETECTION
  // ----------------------------------------

  /**
   * Setup online/offline event listeners
   */
  private setupOnlineListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    this.isOnline = navigator.onLine;
  }

  private handleOnline = (): void => {
    this.isOnline = true;
    this.notifyStatusListeners();
    this.flush(); // Flush queued statements when coming back online
  };

  private handleOffline = (): void => {
    this.isOnline = false;
    this.notifyStatusListeners();
  };

  // ----------------------------------------
  // HELPERS
  // ----------------------------------------

  /**
   * Notify all status listeners
   */
  private notifyStatusListeners(): void {
    const status = this.getQueueStatus();
    for (const callback of this.statusListeners) {
      callback(status);
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopAutoFlush();

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }

    this.statusListeners.clear();
    this.saveOfflineQueue();
  }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Get the singleton emitter instance
 */
export function getEmitter(config?: EmitterConfig): XAPIEmitter {
  return XAPIEmitter.getInstance(config);
}

/**
 * Check if emitter is initialized
 */
export function hasEmitter(): boolean {
  return XAPIEmitter.hasInstance();
}

/**
 * Quick emit function using singleton
 */
export function emit(params: Parameters<XAPIEmitter['emit']>[0]): string {
  return getEmitter().emit(params);
}

/**
 * Quick emit with profile using singleton
 */
export function emitWithProfile(params: Parameters<XAPIEmitter['emitWithProfile']>[0]): string {
  return getEmitter().emitWithProfile(params);
}
