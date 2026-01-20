/**
 * =============================================================================
 * INSPIRE Studio - LRS Client (Dual-Mode)
 * =============================================================================
 *
 * Client for communicating with Learning Record Store (LRS) endpoints.
 * Supports dual-mode operation:
 * - Internal: Stores statements directly in Firestore (for LXP360 platform)
 * - External: Sends statements to configured external LRS (for published packages)
 *
 * @module lib/xapi/lrs-client
 * @version 3.0.0
 */

import { v4 as generateUUID } from 'uuid';
import type {
  BatchSendResult,
  ExternalTrackingConfig,
  InternalTrackingConfig,
  LRSConfig,
  LRSResponse,
  QueuedStatement,
  QueueStatus,
  StatementQueueConfig,
  TrackingConfig,
  XAPIStatement,
} from '@/types/xapi';

// =============================================================================
// BASE CLIENT INTERFACE
// =============================================================================

/**
 * Common interface for all LRS client implementations.
 */
export interface ILRSClient {
  sendStatement(statement: XAPIStatement): Promise<LRSResponse>;
  sendStatements(statements: XAPIStatement[]): Promise<LRSResponse>;
  queueStatement(statement: XAPIStatement, priority?: QueuedStatement['priority']): void;
  queueStatements(statements: XAPIStatement[], priority?: QueuedStatement['priority']): void;
  flush(): Promise<BatchSendResult>;
  getQueueStatus(): QueueStatus;
  onStatusChange(callback: (status: QueueStatus) => void): () => void;
  clearQueue(): void;
  ping(): Promise<boolean>;
  destroy(): void;
}

// =============================================================================
// INTERNAL LRS CLIENT (Firestore)
// =============================================================================

/**
 * Internal LRS Client that stores statements directly in Firestore.
 * Used when lessons are played within the LXP360 platform.
 */
export class InternalLRSClient implements ILRSClient {
  private config: InternalTrackingConfig;
  private queue: QueuedStatement[] = [];
  private listeners: Set<(status: QueueStatus) => void> = new Set();
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isFlushing = false;

  constructor(config: InternalTrackingConfig) {
    this.config = config;
    this.startAutoFlush();
  }

  async sendStatement(statement: XAPIStatement): Promise<LRSResponse> {
    return this.sendStatements([statement]);
  }

  async sendStatements(statements: XAPIStatement[]): Promise<LRSResponse> {
    try {
      // Import Firebase Firestore dynamically to avoid circular dependencies
      const { db } = await import('@/lib/firebase/client');
      const { collection, addDoc } = await import('firebase/firestore');

      const statementsRef = collection(db, 'xapi_statements');
      const ids: string[] = [];

      for (const statement of statements) {
        const docRef = await addDoc(statementsRef, {
          id: statement.id || generateUUID(),
          organization_id: this.config.organizationId,
          session_id: this.config.sessionId,
          statement: statement,
          actor_id: this.extractActorId(statement),
          verb_id: statement.verb.id,
          object_id:
            typeof statement.object === 'object' && 'id' in statement.object
              ? statement.object.id
              : null,
          timestamp: statement.timestamp || new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
        ids.push(docRef.id);
      }

      // Optionally sync to BigQuery for analytics
      if (this.config.enableBigQuerySync) {
        this.syncToBigQuery(statements);
      }

      return {
        success: true,
        statementIds: ids,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  queueStatement(statement: XAPIStatement, priority: QueuedStatement['priority'] = 'normal'): void {
    this.queueStatements([statement], priority);
  }

  queueStatements(
    statements: XAPIStatement[],
    priority: QueuedStatement['priority'] = 'normal',
  ): void {
    const queued = statements.map(
      (statement): QueuedStatement => ({
        id: statement.id || generateUUID(),
        statement,
        attempts: 0,
        priority,
        createdAt: new Date().toISOString(),
      }),
    );

    this.queue.push(...queued);
    this.notifyListeners();
  }

  async flush(): Promise<BatchSendResult> {
    if (this.isFlushing || this.queue.length === 0) {
      return { success: true, sent: 0, failed: 0, errors: [] };
    }

    this.isFlushing = true;
    let totalSent = 0;
    let totalFailed = 0;
    const errors: BatchSendResult['errors'] = [];

    try {
      const batch = [...this.queue];
      this.queue = [];

      const statements = batch.map((q) => q.statement);
      const response = await this.sendStatements(statements);

      if (response.success) {
        totalSent = statements.length;
      } else {
        totalFailed = statements.length;
        errors.push({
          statementId: 'batch',
          error: response.error?.message || 'Unknown error',
        });
      }
    } finally {
      this.isFlushing = false;
      this.notifyListeners();
    }

    return { success: totalFailed === 0, sent: totalSent, failed: totalFailed, errors };
  }

  getQueueStatus(): QueueStatus {
    return {
      length: this.queue.length,
      pending: this.queue.filter((q) => q.attempts === 0).length,
      failed: this.queue.filter((q) => q.attempts > 0).length,
      isOnline: true, // Internal mode assumes always online
      isFlushing: this.isFlushing,
    };
  }

  onStatusChange(callback: (status: QueueStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  clearQueue(): void {
    this.queue = [];
    this.notifyListeners();
  }

  async ping(): Promise<boolean> {
    try {
      const { db } = await import('@/lib/firebase/client');
      const { collection, getDocs, query, limit } = await import('firebase/firestore');

      const statementsRef = collection(db, 'xapi_statements');
      await getDocs(query(statementsRef, limit(1)));
      return true;
    } catch {
      return false;
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.listeners.clear();
  }

  // ----------------------------------------
  // PRIVATE METHODS
  // ----------------------------------------

  private extractActorId(statement: XAPIStatement): string | null {
    const actor = statement.actor;
    if ('mbox' in actor && actor.mbox) {
      return actor.mbox;
    }
    if ('account' in actor && actor.account) {
      return `${actor.account.homePage}::${actor.account.name}`;
    }
    return null;
  }

  private async syncToBigQuery(statements: XAPIStatement[]): Promise<void> {
    // BigQuery sync implementation would go here
    // This is a placeholder for future implementation
    if (statements.length > 0) {
      // Queue for BigQuery sync
    }
  }

  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, 10000);
  }

  private notifyListeners(): void {
    const status = this.getQueueStatus();
    for (const callback of this.listeners) {
      callback(status);
    }
  }
}

// =============================================================================
// EXTERNAL LRS CLIENT (HTTP)
// =============================================================================

/**
 * External LRS Client for sending statements to external LRS endpoints.
 * Used when lessons are exported and played outside the LXP360 platform.
 */
export class ExternalLRSClient implements ILRSClient {
  private _config: ExternalTrackingConfig;
  private queue: QueuedStatement[] = [];
  private queueConfig: StatementQueueConfig;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isOnline = true;
  private isFlushing = false;
  private listeners: Set<(status: QueueStatus) => void> = new Set();

  constructor(config: ExternalTrackingConfig, queueConfig?: Partial<StatementQueueConfig>) {
    this._config = config;

    this.queueConfig = {
      maxBatchSize: 50,
      flushInterval: 10000,
      maxRetries: 3,
      retryDelay: 1000,
      offlineStorage: config.enableOfflineQueue ?? true,
      maxQueueSize: config.offlineQueueSize ?? 1000,
      ...queueConfig,
    };

    this.setupOnlineListener();
    this.loadOfflineQueue();
    this.startAutoFlush();
  }

  /**
   * Get the LRS endpoint URL.
   */
  get endpoint(): string {
    return this._config.lrsEndpoint;
  }

  async sendStatement(statement: XAPIStatement): Promise<LRSResponse> {
    return this.sendStatements([statement]);
  }

  async sendStatements(statements: XAPIStatement[]): Promise<LRSResponse> {
    if (!this.isOnline) {
      this.queueStatements(statements, 'normal');
      return {
        success: false,
        error: { code: 0, message: 'Offline - statements queued' },
      };
    }

    try {
      const response = await this.postStatements(statements);

      // Mirror to LXP360 if configured
      if (this._config.mirrorToLXP360 && this._config.lxp360ApiKey) {
        this.mirrorToLXP360(statements);
      }

      return response;
    } catch (error) {
      this.queueStatements(statements, 'normal');

      return {
        success: false,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  queueStatement(statement: XAPIStatement, priority: QueuedStatement['priority'] = 'normal'): void {
    this.queueStatements([statement], priority);
  }

  queueStatements(
    statements: XAPIStatement[],
    priority: QueuedStatement['priority'] = 'normal',
  ): void {
    const queued = statements.map(
      (statement): QueuedStatement => ({
        id: statement.id || generateUUID(),
        statement,
        attempts: 0,
        priority,
        createdAt: new Date().toISOString(),
      }),
    );

    this.queue.push(...queued);

    // Trim queue if too large
    if (this.queue.length > this.queueConfig.maxQueueSize) {
      this.queue.sort((a, b) => {
        const priorityOrder: Record<QueuedStatement['priority'], number> = {
          high: 0,
          normal: 1,
          low: 2,
        };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      this.queue = this.queue.slice(0, this.queueConfig.maxQueueSize);
    }

    this.saveOfflineQueue();
    this.notifyListeners();
  }

  async flush(): Promise<BatchSendResult> {
    if (this.isFlushing || !this.isOnline || this.queue.length === 0) {
      return { success: true, sent: 0, failed: 0, errors: [] };
    }

    this.isFlushing = true;
    let totalSent = 0;
    let totalFailed = 0;
    const errors: BatchSendResult['errors'] = [];

    try {
      this.queue.sort((a, b) => {
        const priorityOrder: Record<QueuedStatement['priority'], number> = {
          high: 0,
          normal: 1,
          low: 2,
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      while (this.queue.length > 0 && this.isOnline) {
        const batch = this.queue.splice(0, this.queueConfig.maxBatchSize);
        const statements = batch.map((q) => q.statement);

        try {
          const response = await this.postStatements(statements);

          if (response.success) {
            totalSent += statements.length;
          } else {
            const failedItems = batch.filter((item) => {
              item.attempts++;
              item.lastAttempt = new Date().toISOString();
              item.error = response.error?.message;

              if (item.attempts < this.queueConfig.maxRetries) {
                return true;
              }

              totalFailed++;
              errors.push({
                statementId: item.id,
                error: item.error || 'Max retries exceeded',
              });
              return false;
            });

            this.queue.unshift(...failedItems);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';

          const failedItems = batch.filter((item) => {
            item.attempts++;
            item.lastAttempt = new Date().toISOString();
            item.error = errorMessage;

            if (item.attempts < this.queueConfig.maxRetries) {
              return true;
            }

            totalFailed++;
            errors.push({
              statementId: item.id,
              error: item.error || 'Max retries exceeded',
            });
            return false;
          });

          this.queue.unshift(...failedItems);
          break;
        }

        if (this.queue.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    } finally {
      this.isFlushing = false;
      this.saveOfflineQueue();
      this.notifyListeners();
    }

    return {
      success: totalFailed === 0,
      sent: totalSent,
      failed: totalFailed,
      errors,
    };
  }

  getQueueStatus(): QueueStatus {
    return {
      length: this.queue.length,
      pending: this.queue.filter((q) => q.attempts === 0).length,
      failed: this.queue.filter((q) => q.attempts > 0).length,
      isOnline: this.isOnline,
      isFlushing: this.isFlushing,
    };
  }

  onStatusChange(callback: (status: QueueStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  clearQueue(): void {
    this.queue = [];
    this.saveOfflineQueue();
    this.notifyListeners();
  }

  async ping(): Promise<boolean> {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this._config.lrsEndpoint}/about`, {
        method: 'GET',
        headers,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }

    this.listeners.clear();
  }

  // ----------------------------------------
  // PRIVATE METHODS
  // ----------------------------------------

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Experience-API-Version': '1.0.3',
    };

    if (this._config.lrsAuth) {
      headers.Authorization = this._config.lrsAuth;
    }

    return headers;
  }

  private async postStatements(statements: XAPIStatement[]): Promise<LRSResponse> {
    const url = `${this._config.lrsEndpoint}/statements`;
    const headers = this.getAuthHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(statements),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        statementIds: Array.isArray(data) ? data : [data],
      };
    }

    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }

    return {
      success: false,
      error: {
        code: response.status,
        message: errorMessage,
      },
    };
  }

  private setupOnlineListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    this.isOnline = navigator.onLine;
  }

  private handleOnline = (): void => {
    this.isOnline = true;
    this.notifyListeners();
    this.flush();
  };

  private handleOffline = (): void => {
    this.isOnline = false;
    this.notifyListeners();
  };

  private startAutoFlush(): void {
    if (this.queueConfig.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.queueConfig.flushInterval);
    }
  }

  private saveOfflineQueue(): void {
    if (!this.queueConfig.offlineStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('xapi_queue', JSON.stringify(this.queue));
    } catch {
      // localStorage full or unavailable
    }
  }

  private loadOfflineQueue(): void {
    if (!this.queueConfig.offlineStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const saved = localStorage.getItem('xapi_queue');
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch {
      this.queue = [];
    }
  }

  private async mirrorToLXP360(statements: XAPIStatement[]): Promise<void> {
    if (!this._config.lxp360ApiKey) return;

    try {
      await fetch('/api/xapi/mirror', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this._config.lxp360ApiKey}`,
        },
        body: JSON.stringify({ statements }),
      });
    } catch {
      // Silently fail mirroring - primary send succeeded
    }
  }

  private notifyListeners(): void {
    const status = this.getQueueStatus();
    for (const callback of this.listeners) {
      callback(status);
    }
  }
}

// =============================================================================
// DUAL-MODE CLIENT FACTORY
// =============================================================================

/**
 * Creates the appropriate LRS client based on tracking configuration.
 */
export function createLRSClient(
  config: TrackingConfig,
  queueConfig?: Partial<StatementQueueConfig>,
): ILRSClient {
  if (config.mode === 'internal') {
    return new InternalLRSClient(config);
  }
  return new ExternalLRSClient(config, queueConfig);
}

// =============================================================================
// LEGACY LRS CLIENT (for backward compatibility)
// =============================================================================

/**
 * Legacy LRS Client for backward compatibility.
 * @deprecated Use createLRSClient with TrackingConfig instead
 */
export class LRSClient implements ILRSClient {
  private delegate: ILRSClient;

  constructor(config: LRSConfig, queueConfig?: Partial<StatementQueueConfig>) {
    // Convert legacy config to external tracking config
    const trackingConfig: ExternalTrackingConfig = {
      mode: 'external',
      lrsEndpoint: config.endpoint,
      lrsAuth:
        config.auth ||
        (config.username && config.password
          ? `Basic ${btoa(`${config.username}:${config.password}`)}`
          : undefined),
      enableOfflineQueue: queueConfig?.offlineStorage,
      offlineQueueSize: queueConfig?.maxQueueSize,
    };

    this.delegate = new ExternalLRSClient(trackingConfig, queueConfig);
  }

  sendStatement(statement: XAPIStatement): Promise<LRSResponse> {
    return this.delegate.sendStatement(statement);
  }

  sendStatements(statements: XAPIStatement[]): Promise<LRSResponse> {
    return this.delegate.sendStatements(statements);
  }

  queueStatement(statement: XAPIStatement, priority?: QueuedStatement['priority']): void {
    this.delegate.queueStatement(statement, priority);
  }

  queueStatements(statements: XAPIStatement[], priority?: QueuedStatement['priority']): void {
    this.delegate.queueStatements(statements, priority);
  }

  flush(): Promise<BatchSendResult> {
    return this.delegate.flush();
  }

  getQueueStatus(): QueueStatus {
    return this.delegate.getQueueStatus();
  }

  onStatusChange(callback: (status: QueueStatus) => void): () => void {
    return this.delegate.onStatusChange(callback);
  }

  clearQueue(): void {
    this.delegate.clearQueue();
  }

  updateConfig(config: Partial<LRSConfig>): void {
    // Legacy method - no-op in new implementation
    if (config) {
      // Configuration updates not supported in delegate pattern
    }
  }

  ping(): Promise<boolean> {
    return this.delegate.ping();
  }

  async getStatements(params?: {
    agent?: string;
    verb?: string;
    activity?: string;
    registration?: string;
    since?: string;
    until?: string;
    limit?: number;
    ascending?: boolean;
  }): Promise<{ statements: XAPIStatement[]; more?: string }> {
    // This method is only available on ExternalLRSClient
    if (this.delegate instanceof ExternalLRSClient) {
      const client = this.delegate;
      const url = new URL(`${client.endpoint}/statements`);

      if (params?.agent) url.searchParams.set('agent', params.agent);
      if (params?.verb) url.searchParams.set('verb', params.verb);
      if (params?.activity) url.searchParams.set('activity', params.activity);
      if (params?.registration) url.searchParams.set('registration', params.registration);
      if (params?.since) url.searchParams.set('since', params.since);
      if (params?.until) url.searchParams.set('until', params.until);
      if (params?.limit) url.searchParams.set('limit', String(params.limit));
      if (params?.ascending !== undefined)
        url.searchParams.set('ascending', String(params.ascending));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Experience-API-Version': '1.0.3',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get statements: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        statements: data.statements || [],
        more: data.more,
      };
    }

    return { statements: [] };
  }

  destroy(): void {
    this.delegate.destroy();
  }
}

// =============================================================================
// SINGLETON MANAGEMENT
// =============================================================================

let defaultClient: ILRSClient | null = null;

/**
 * Initialize the default LRS client with tracking configuration.
 */
export function initializeTrackingClient(
  config: TrackingConfig,
  queueConfig?: Partial<StatementQueueConfig>,
): ILRSClient {
  if (defaultClient) {
    defaultClient.destroy();
  }

  defaultClient = createLRSClient(config, queueConfig);
  return defaultClient;
}

/**
 * Initialize the default LRS client (legacy).
 * @deprecated Use initializeTrackingClient instead
 */
export function initializeLRS(
  config: LRSConfig,
  queueConfig?: Partial<StatementQueueConfig>,
): LRSClient {
  if (defaultClient) {
    defaultClient.destroy();
  }

  const client = new LRSClient(config, queueConfig);
  defaultClient = client;
  return client;
}

/**
 * Get the default LRS client.
 * @throws Error if not initialized
 */
export function getLRSClient(): ILRSClient {
  if (!defaultClient) {
    throw new Error('LRS client not initialized. Call initializeTrackingClient first.');
  }
  return defaultClient;
}

/**
 * Check if LRS client is initialized.
 */
export function hasLRSClient(): boolean {
  return defaultClient !== null;
}

/**
 * Send a statement using the default client.
 */
export async function sendStatement(statement: XAPIStatement): Promise<LRSResponse> {
  if (!defaultClient) {
    const queue = getLocalQueue();
    queue.push({
      id: statement.id || generateUUID(),
      statement,
      attempts: 0,
      priority: 'normal',
      createdAt: new Date().toISOString(),
    });
    saveLocalQueue(queue);

    return {
      success: false,
      error: { code: 0, message: 'No LRS client - statement queued locally' },
    };
  }

  return defaultClient.sendStatement(statement);
}

/**
 * Queue a statement using the default client.
 */
export function queueStatement(
  statement: XAPIStatement,
  priority: QueuedStatement['priority'] = 'normal',
): void {
  if (!defaultClient) {
    const queue = getLocalQueue();
    queue.push({
      id: statement.id || generateUUID(),
      statement,
      attempts: 0,
      priority,
      createdAt: new Date().toISOString(),
    });
    saveLocalQueue(queue);
    return;
  }

  defaultClient.queueStatement(statement, priority);
}

// Helper for local queue when no client exists
function getLocalQueue(): QueuedStatement[] {
  if (typeof localStorage === 'undefined') return [];

  try {
    const saved = localStorage.getItem('xapi_queue');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalQueue(queue: QueuedStatement[]): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem('xapi_queue', JSON.stringify(queue));
  } catch {
    // Silently fail
  }
}
