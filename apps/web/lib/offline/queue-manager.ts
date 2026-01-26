/**
 * =============================================================================
 * LXD360 Offline Queue Service - Queue Manager
 * =============================================================================
 *
 * FIFO queue manager with IndexedDB persistence for xAPI statements.
 * Handles queueing, retrieval, and lifecycle management of offline statements.
 *
 * @module lib/offline/queue-manager
 * @version 1.0.0
 */

import { v4 as generateUUID } from 'uuid';
import type { XAPIStatement } from '@/types/xapi';
import {
  createTransaction,
  type FailedStatement,
  getStore,
  openDatabase,
  promisifyRequest,
  promisifyTransaction,
  type QueuedXAPIStatement,
  STORES,
  type SyncMetadata,
} from './indexed-db-schema';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Queue manager configuration options.
 */
export interface QueueManagerConfig {
  /** Maximum number of statements in the queue before trimming (default: 1000) */
  maxQueueSize: number;
  /** Maximum retry attempts before moving to failed (default: 5) */
  maxRetries: number;
  /** Batch size for sync operations (default: 25) */
  batchSize: number;
  /** Tenant ID for multi-tenant isolation */
  tenantId?: string;
}

const DEFAULT_CONFIG: QueueManagerConfig = {
  maxQueueSize: 1000,
  maxRetries: 5,
  batchSize: 25,
};

// =============================================================================
// QUEUE MANAGER CLASS
// =============================================================================

/**
 * Manages the offline xAPI statement queue with IndexedDB persistence.
 */
export class OfflineQueueManager {
  private db: IDBDatabase | null = null;
  private config: QueueManagerConfig;
  private initPromise: Promise<void> | null = null;
  private listeners: Set<() => void> = new Set();

  constructor(config: Partial<QueueManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------

  /**
   * Initializes the queue manager and opens the database connection.
   * Safe to call multiple times - subsequent calls return the same promise.
   */
  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      this.db = await openDatabase();
    } catch (error) {
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * Ensures the database is initialized before operations.
   */
  private async ensureInitialized(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initialize();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }

  /**
   * Closes the database connection and cleans up.
   */
  destroy(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.initPromise = null;
    this.listeners.clear();
  }

  // ---------------------------------------------------------------------------
  // QUEUE OPERATIONS
  // ---------------------------------------------------------------------------

  /**
   * Adds a single xAPI statement to the queue.
   *
   * @param statement - The xAPI statement to queue
   * @param priority - Priority level (default: 'normal')
   * @returns The queued statement entry
   */
  async enqueue(
    statement: XAPIStatement,
    priority: QueuedXAPIStatement['priority'] = 'normal',
  ): Promise<QueuedXAPIStatement> {
    const entries = await this.enqueueBatch([statement], priority);
    return entries[0];
  }

  /**
   * Adds multiple xAPI statements to the queue.
   *
   * @param statements - Array of xAPI statements to queue
   * @param priority - Priority level (default: 'normal')
   * @returns Array of queued statement entries
   */
  async enqueueBatch(
    statements: XAPIStatement[],
    priority: QueuedXAPIStatement['priority'] = 'normal',
  ): Promise<QueuedXAPIStatement[]> {
    const db = await this.ensureInitialized();
    const now = new Date().toISOString();

    const entries: QueuedXAPIStatement[] = statements.map((statement) => ({
      id: statement.id || generateUUID(),
      statement: {
        ...statement,
        id: statement.id || generateUUID(),
        timestamp: statement.timestamp || now,
      },
      queuedAt: now,
      attempts: 0,
      priority,
      tenantId: this.config.tenantId,
    }));

    const transaction = createTransaction(db, STORES.XAPI_QUEUE, 'readwrite');
    const store = getStore(transaction, STORES.XAPI_QUEUE);

    for (const entry of entries) {
      store.add(entry);
    }

    await promisifyTransaction(transaction);

    // Trim queue if necessary
    await this.trimQueue();

    // Notify listeners
    this.notifyListeners();

    return entries;
  }

  /**
   * Retrieves the next batch of statements to sync (FIFO order, priority weighted).
   *
   * @param limit - Maximum number of statements to retrieve (default: batchSize)
   * @returns Array of queued statements, ordered by priority then queuedAt
   */
  async dequeueBatch(limit?: number): Promise<QueuedXAPIStatement[]> {
    const db = await this.ensureInitialized();
    const batchSize = limit ?? this.config.batchSize;

    const transaction = createTransaction(db, STORES.XAPI_QUEUE, 'readonly');
    const store = getStore(transaction, STORES.XAPI_QUEUE);

    // Get all entries and sort client-side for priority ordering
    const request = store.getAll();
    const allEntries = await promisifyRequest(request);

    // Sort by priority (high > normal > low) then by queuedAt (oldest first)
    const priorityOrder: Record<QueuedXAPIStatement['priority'], number> = {
      high: 0,
      normal: 1,
      low: 2,
    };

    const sorted = (allEntries as QueuedXAPIStatement[]).sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime();
    });

    // Filter by tenant if configured
    const filtered = this.config.tenantId
      ? sorted.filter((entry) => entry.tenantId === this.config.tenantId)
      : sorted;

    return filtered.slice(0, batchSize);
  }

  /**
   * Retrieves a specific statement by ID.
   *
   * @param id - The statement ID
   * @returns The queued statement or null if not found
   */
  async getById(id: string): Promise<QueuedXAPIStatement | null> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(db, STORES.XAPI_QUEUE, 'readonly');
    const store = getStore(transaction, STORES.XAPI_QUEUE);

    const request = store.get(id);
    const result = await promisifyRequest(request);

    return (result as QueuedXAPIStatement) || null;
  }

  /**
   * Removes successfully synced statements from the queue.
   *
   * @param ids - Array of statement IDs to remove
   */
  async removeSuccessful(ids: string[]): Promise<void> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(db, STORES.XAPI_QUEUE, 'readwrite');
    const store = getStore(transaction, STORES.XAPI_QUEUE);

    for (const id of ids) {
      store.delete(id);
    }

    await promisifyTransaction(transaction);
    this.notifyListeners();
  }

  /**
   * Updates a statement's attempt count and error after a failed sync.
   *
   * @param id - The statement ID
   * @param error - Error message from the failed attempt
   * @returns True if moved to failed, false if still in queue
   */
  async recordFailedAttempt(id: string, error: string): Promise<boolean> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(
      db,
      [STORES.XAPI_QUEUE, STORES.FAILED_STATEMENTS],
      'readwrite',
    );
    const queueStore = getStore(transaction, STORES.XAPI_QUEUE);
    const failedStore = getStore(transaction, STORES.FAILED_STATEMENTS);

    const request = queueStore.get(id);
    const entry = (await promisifyRequest(request)) as QueuedXAPIStatement | undefined;

    if (!entry) {
      return false;
    }

    const newAttempts = entry.attempts + 1;

    if (newAttempts >= this.config.maxRetries) {
      // Move to failed statements store
      const failedEntry: FailedStatement = {
        id: entry.id,
        statement: entry.statement,
        queuedAt: entry.queuedAt,
        failedAt: new Date().toISOString(),
        attempts: newAttempts,
        error,
        reviewed: false,
      };

      failedStore.add(failedEntry);
      queueStore.delete(id);

      await promisifyTransaction(transaction);
      this.notifyListeners();
      return true;
    }

    // Update attempt count
    const updatedEntry: QueuedXAPIStatement = {
      ...entry,
      attempts: newAttempts,
      lastAttempt: new Date().toISOString(),
      lastError: error,
    };

    queueStore.put(updatedEntry);
    await promisifyTransaction(transaction);
    this.notifyListeners();

    return false;
  }

  /**
   * Gets the current queue size.
   *
   * @returns Number of statements in the queue
   */
  async getQueueSize(): Promise<number> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(db, STORES.XAPI_QUEUE, 'readonly');
    const store = getStore(transaction, STORES.XAPI_QUEUE);

    const request = store.count();
    return promisifyRequest(request);
  }

  /**
   * Gets detailed queue statistics.
   */
  async getQueueStats(): Promise<{
    total: number;
    pending: number;
    retrying: number;
    highPriority: number;
    normalPriority: number;
    lowPriority: number;
  }> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(db, STORES.XAPI_QUEUE, 'readonly');
    const store = getStore(transaction, STORES.XAPI_QUEUE);

    const request = store.getAll();
    const entries = (await promisifyRequest(request)) as QueuedXAPIStatement[];

    return {
      total: entries.length,
      pending: entries.filter((e) => e.attempts === 0).length,
      retrying: entries.filter((e) => e.attempts > 0).length,
      highPriority: entries.filter((e) => e.priority === 'high').length,
      normalPriority: entries.filter((e) => e.priority === 'normal').length,
      lowPriority: entries.filter((e) => e.priority === 'low').length,
    };
  }

  /**
   * Clears all statements from the queue.
   */
  async clearQueue(): Promise<void> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(db, STORES.XAPI_QUEUE, 'readwrite');
    const store = getStore(transaction, STORES.XAPI_QUEUE);

    store.clear();
    await promisifyTransaction(transaction);
    this.notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // FAILED STATEMENTS
  // ---------------------------------------------------------------------------

  /**
   * Gets all failed statements (for manual review).
   */
  async getFailedStatements(): Promise<FailedStatement[]> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(db, STORES.FAILED_STATEMENTS, 'readonly');
    const store = getStore(transaction, STORES.FAILED_STATEMENTS);

    const request = store.getAll();
    return promisifyRequest(request) as Promise<FailedStatement[]>;
  }

  /**
   * Marks a failed statement as reviewed.
   */
  async markAsReviewed(id: string): Promise<void> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(db, STORES.FAILED_STATEMENTS, 'readwrite');
    const store = getStore(transaction, STORES.FAILED_STATEMENTS);

    const request = store.get(id);
    const entry = (await promisifyRequest(request)) as FailedStatement | undefined;

    if (entry) {
      store.put({ ...entry, reviewed: true });
      await promisifyTransaction(transaction);
    }
  }

  /**
   * Retries a failed statement by moving it back to the queue.
   */
  async retryFailedStatement(id: string): Promise<void> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(
      db,
      [STORES.XAPI_QUEUE, STORES.FAILED_STATEMENTS],
      'readwrite',
    );
    const queueStore = getStore(transaction, STORES.XAPI_QUEUE);
    const failedStore = getStore(transaction, STORES.FAILED_STATEMENTS);

    const request = failedStore.get(id);
    const entry = (await promisifyRequest(request)) as FailedStatement | undefined;

    if (!entry) return;

    // Create new queue entry with reset attempts
    const queueEntry: QueuedXAPIStatement = {
      id: entry.id,
      statement: entry.statement,
      queuedAt: new Date().toISOString(),
      attempts: 0,
      priority: 'normal',
      tenantId: this.config.tenantId,
    };

    queueStore.add(queueEntry);
    failedStore.delete(id);

    await promisifyTransaction(transaction);
    this.notifyListeners();
  }

  /**
   * Deletes a failed statement permanently.
   */
  async deleteFailedStatement(id: string): Promise<void> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(db, STORES.FAILED_STATEMENTS, 'readwrite');
    const store = getStore(transaction, STORES.FAILED_STATEMENTS);

    store.delete(id);
    await promisifyTransaction(transaction);
  }

  // ---------------------------------------------------------------------------
  // SYNC METADATA
  // ---------------------------------------------------------------------------

  /**
   * Gets sync metadata.
   */
  async getSyncMetadata(): Promise<SyncMetadata | null> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(db, STORES.SYNC_METADATA, 'readonly');
    const store = getStore(transaction, STORES.SYNC_METADATA);

    const request = store.get('sync');
    const result = await promisifyRequest(request);

    return (result as SyncMetadata) || null;
  }

  /**
   * Updates sync metadata.
   */
  async updateSyncMetadata(updates: Partial<SyncMetadata>): Promise<void> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(db, STORES.SYNC_METADATA, 'readwrite');
    const store = getStore(transaction, STORES.SYNC_METADATA);

    const request = store.get('sync');
    const existing = (await promisifyRequest(request)) as SyncMetadata | undefined;

    const metadata: SyncMetadata = {
      key: 'sync',
      consecutiveFailures: 0,
      isSyncing: false,
      totalSynced: 0,
      totalFailed: 0,
      ...existing,
      ...updates,
    };

    store.put(metadata);
    await promisifyTransaction(transaction);
  }

  // ---------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------------

  /**
   * Trims the queue to the maximum size, removing lowest priority oldest items.
   */
  private async trimQueue(): Promise<void> {
    const db = await this.ensureInitialized();

    const transaction = createTransaction(db, STORES.XAPI_QUEUE, 'readwrite');
    const store = getStore(transaction, STORES.XAPI_QUEUE);

    const countRequest = store.count();
    const count = await promisifyRequest(countRequest);

    if (count <= this.config.maxQueueSize) {
      return;
    }

    // Get all entries and sort by priority (reversed) then by queuedAt (oldest first)
    const allRequest = store.getAll();
    const entries = (await promisifyRequest(allRequest)) as QueuedXAPIStatement[];

    const priorityOrder: Record<QueuedXAPIStatement['priority'], number> = {
      low: 0,
      normal: 1,
      high: 2,
    };

    // Sort to get items to remove (low priority first, then oldest)
    const sorted = entries.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime();
    });

    const toRemove = sorted.slice(0, count - this.config.maxQueueSize);

    for (const entry of toRemove) {
      store.delete(entry.id);
    }

    await promisifyTransaction(transaction);
  }

  // ---------------------------------------------------------------------------
  // LISTENER MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Registers a listener for queue changes.
   *
   * @param listener - Callback to invoke on changes
   * @returns Unsubscribe function
   */
  onQueueChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifies all registered listeners of a queue change.
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {
        // Ignore listener errors
      }
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let defaultManager: OfflineQueueManager | null = null;

/**
 * Gets or creates the default queue manager instance.
 */
export function getQueueManager(config?: Partial<QueueManagerConfig>): OfflineQueueManager {
  if (!defaultManager) {
    defaultManager = new OfflineQueueManager(config);
  }
  return defaultManager;
}

/**
 * Resets the default queue manager (for testing).
 */
export function resetQueueManager(): void {
  if (defaultManager) {
    defaultManager.destroy();
    defaultManager = null;
  }
}
