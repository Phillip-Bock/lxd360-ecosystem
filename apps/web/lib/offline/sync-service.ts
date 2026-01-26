/**
 * =============================================================================
 * LXD360 Offline Queue Service - Sync Service
 * =============================================================================
 *
 * Background sync service that automatically syncs queued xAPI statements
 * when the connection is restored. Supports exponential backoff on failures.
 *
 * @module lib/offline/sync-service
 * @version 1.0.0
 */

import type { BatchSendResult, XAPIStatement } from '@/types/xapi';
import { type ConflictResolver, createDefaultResolver } from './conflict-resolver';
import type { QueuedXAPIStatement } from './indexed-db-schema';
import { getQueueManager, type OfflineQueueManager } from './queue-manager';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Sync service configuration options.
 */
export interface SyncServiceConfig {
  /** LRS endpoint URL for sending statements */
  lrsEndpoint: string;
  /** Authorization header for LRS requests */
  lrsAuth?: string;
  /** Tenant ID header for multi-tenant requests */
  tenantId?: string;
  /** Maximum statements per batch request (default: 25) */
  batchSize: number;
  /** Base retry delay in ms for exponential backoff (default: 1000) */
  baseRetryDelay: number;
  /** Maximum retry delay in ms (default: 32000) */
  maxRetryDelay: number;
  /** Interval for automatic sync checks in ms (default: 30000) */
  autoSyncInterval: number;
  /** Enable automatic sync on online event (default: true) */
  syncOnOnline: boolean;
  /** Enable Service Worker background sync (default: true) */
  useServiceWorker: boolean;
}

const DEFAULT_CONFIG: SyncServiceConfig = {
  lrsEndpoint: '/api/xapi/statements',
  batchSize: 25,
  baseRetryDelay: 1000,
  maxRetryDelay: 32000,
  autoSyncInterval: 30000,
  syncOnOnline: true,
  useServiceWorker: true,
};

/**
 * Sync operation result.
 */
export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ statementId: string; error: string }>;
  duration: number;
}

/**
 * Sync status for UI display.
 */
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  queueSize: number;
  lastSyncAt: string | null;
  lastError: string | null;
  consecutiveFailures: number;
}

// =============================================================================
// SYNC SERVICE CLASS
// =============================================================================

/**
 * Manages background synchronization of offline xAPI statements.
 */
export class OfflineSyncService {
  private config: SyncServiceConfig;
  private queueManager: OfflineQueueManager;
  private conflictResolver: ConflictResolver;
  private isOnline = true;
  private isSyncing = false;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private consecutiveFailures = 0;
  private currentRetryDelay: number;

  constructor(
    config: Partial<SyncServiceConfig> = {},
    queueManager?: OfflineQueueManager,
    conflictResolver?: ConflictResolver,
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.queueManager = queueManager || getQueueManager({ batchSize: this.config.batchSize });
    this.conflictResolver = conflictResolver || createDefaultResolver();
    this.currentRetryDelay = this.config.baseRetryDelay;

    this.setupEventListeners();
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------

  /**
   * Starts the sync service.
   */
  async start(): Promise<void> {
    await this.queueManager.initialize();

    // Check initial online status
    if (typeof navigator !== 'undefined') {
      this.isOnline = navigator.onLine;
    }

    // Start auto-sync timer
    if (this.config.autoSyncInterval > 0) {
      this.startAutoSync();
    }

    // Register for Service Worker background sync
    if (this.config.useServiceWorker) {
      await this.registerBackgroundSync();
    }

    // Initial sync if online
    if (this.isOnline) {
      this.sync();
    }
  }

  /**
   * Stops the sync service.
   */
  stop(): void {
    this.stopAutoSync();
    this.removeEventListeners();
    this.listeners.clear();
  }

  /**
   * Cleans up and destroys the service.
   */
  destroy(): void {
    this.stop();
    this.queueManager.destroy();
  }

  // ---------------------------------------------------------------------------
  // SYNC OPERATIONS
  // ---------------------------------------------------------------------------

  /**
   * Triggers a manual sync operation.
   *
   * @returns Sync result with statistics
   */
  async sync(): Promise<SyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: [{ statementId: 'all', error: 'Offline' }],
        duration: 0,
      };
    }

    if (this.isSyncing) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: [{ statementId: 'all', error: 'Sync already in progress' }],
        duration: 0,
      };
    }

    this.isSyncing = true;
    await this.queueManager.updateSyncMetadata({ isSyncing: true });
    this.notifyListeners();

    const startTime = Date.now();
    let totalSynced = 0;
    let totalFailed = 0;
    const errors: SyncResult['errors'] = [];

    try {
      while (this.isOnline) {
        const batch = await this.queueManager.dequeueBatch(this.config.batchSize);

        if (batch.length === 0) {
          break;
        }

        const result = await this.sendBatch(batch);

        if (result.success) {
          // Remove successful statements
          const successIds = batch.map((entry) => entry.id);
          await this.queueManager.removeSuccessful(successIds);
          totalSynced += result.sent;

          // Reset retry delay on success
          this.consecutiveFailures = 0;
          this.currentRetryDelay = this.config.baseRetryDelay;
        } else {
          // Record failed attempts
          for (const entry of batch) {
            const errorMsg = result.errors.find((e) => e.statementId === entry.id)?.error;
            const movedToFailed = await this.queueManager.recordFailedAttempt(
              entry.id,
              errorMsg || 'Unknown error',
            );

            if (movedToFailed) {
              totalFailed++;
              errors.push({
                statementId: entry.id,
                error: errorMsg || 'Max retries exceeded',
              });
            }
          }

          // Increment failure counter and backoff
          this.consecutiveFailures++;
          this.currentRetryDelay = Math.min(this.currentRetryDelay * 2, this.config.maxRetryDelay);

          // Wait before next batch attempt
          await this.delay(this.currentRetryDelay);
        }
      }

      // Update sync metadata
      const metadata = await this.queueManager.getSyncMetadata();
      await this.queueManager.updateSyncMetadata({
        lastSyncAt: new Date().toISOString(),
        lastSyncError: errors.length > 0 ? errors[0].error : undefined,
        consecutiveFailures: this.consecutiveFailures,
        totalSynced: (metadata?.totalSynced || 0) + totalSynced,
        totalFailed: (metadata?.totalFailed || 0) + totalFailed,
      });

      return {
        success: totalFailed === 0,
        synced: totalSynced,
        failed: totalFailed,
        errors,
        duration: Date.now() - startTime,
      };
    } finally {
      this.isSyncing = false;
      await this.queueManager.updateSyncMetadata({ isSyncing: false });
      this.notifyListeners();
    }
  }

  /**
   * Sends a batch of statements to the LRS.
   */
  private async sendBatch(batch: QueuedXAPIStatement[]): Promise<BatchSendResult> {
    const statements = batch.map((entry) => entry.statement);

    try {
      // Resolve any conflicts before sending
      const resolvedStatements = await this.resolveConflicts(statements);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Experience-API-Version': '1.0.3',
      };

      if (this.config.lrsAuth) {
        headers.Authorization = this.config.lrsAuth;
      }

      if (this.config.tenantId) {
        headers['X-Tenant-ID'] = this.config.tenantId;
      }

      const response = await fetch(this.config.lrsEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(resolvedStatements),
      });

      if (response.ok) {
        return {
          success: true,
          sent: resolvedStatements.length,
          failed: 0,
          errors: [],
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
        sent: 0,
        failed: batch.length,
        errors: batch.map((entry) => ({
          statementId: entry.id,
          error: `HTTP ${response.status}: ${errorMessage}`,
        })),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';

      return {
        success: false,
        sent: 0,
        failed: batch.length,
        errors: batch.map((entry) => ({
          statementId: entry.id,
          error: errorMessage,
        })),
      };
    }
  }

  /**
   * Resolves conflicts in a batch of statements.
   */
  private async resolveConflicts(statements: XAPIStatement[]): Promise<XAPIStatement[]> {
    const resolved: XAPIStatement[] = [];

    for (const statement of statements) {
      const result = await this.conflictResolver.resolve(statement);

      if (result.action === 'use_local' || result.action === 'merge') {
        resolved.push(result.resolvedStatement || statement);
      }
      // 'use_remote' and 'skip' mean we don't send the local statement
    }

    return resolved;
  }

  // ---------------------------------------------------------------------------
  // STATUS
  // ---------------------------------------------------------------------------

  /**
   * Gets the current sync status.
   */
  async getStatus(): Promise<SyncStatus> {
    const queueSize = await this.queueManager.getQueueSize();
    const metadata = await this.queueManager.getSyncMetadata();

    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueSize,
      lastSyncAt: metadata?.lastSyncAt || null,
      lastError: metadata?.lastSyncError || null,
      consecutiveFailures: metadata?.consecutiveFailures || 0,
    };
  }

  /**
   * Registers a listener for status changes.
   *
   * @param listener - Callback to invoke on status change
   * @returns Unsubscribe function
   */
  onStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // ---------------------------------------------------------------------------
  // EVENT HANDLING
  // ---------------------------------------------------------------------------

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private removeEventListeners(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  private handleOnline = (): void => {
    this.isOnline = true;
    this.notifyListeners();

    if (this.config.syncOnOnline) {
      this.sync();
    }
  };

  private handleOffline = (): void => {
    this.isOnline = false;
    this.notifyListeners();
  };

  // ---------------------------------------------------------------------------
  // AUTO SYNC
  // ---------------------------------------------------------------------------

  private startAutoSync(): void {
    if (this.syncTimer) return;

    this.syncTimer = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync();
      }
    }, this.config.autoSyncInterval);
  }

  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  // ---------------------------------------------------------------------------
  // SERVICE WORKER INTEGRATION
  // ---------------------------------------------------------------------------

  /**
   * Registers for Service Worker background sync.
   */
  private async registerBackgroundSync(): Promise<void> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      if ('sync' in registration) {
        await (
          registration as ServiceWorkerRegistration & {
            sync: { register: (tag: string) => Promise<void> };
          }
        ).sync.register('xapi-sync');
      }
    } catch {
      // Background sync not supported or failed to register
    }
  }

  /**
   * Handles Service Worker sync event (called from SW context).
   */
  async handleBackgroundSyncEvent(): Promise<void> {
    await this.sync();
  }

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async notifyListeners(): Promise<void> {
    const status = await this.getStatus();

    for (const listener of this.listeners) {
      try {
        listener(status);
      } catch {
        // Ignore listener errors
      }
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let defaultService: OfflineSyncService | null = null;

/**
 * Gets or creates the default sync service instance.
 */
export function getSyncService(config?: Partial<SyncServiceConfig>): OfflineSyncService {
  if (!defaultService) {
    defaultService = new OfflineSyncService(config);
  }
  return defaultService;
}

/**
 * Resets the default sync service (for testing).
 */
export function resetSyncService(): void {
  if (defaultService) {
    defaultService.destroy();
    defaultService = null;
  }
}

// =============================================================================
// SERVICE WORKER HANDLER
// =============================================================================

/**
 * Handler for Service Worker sync events.
 * Add this to your Service Worker file.
 *
 * @example
 * ```typescript
 * // In your service-worker.ts
 * import { handleSyncEvent } from '@/lib/offline/sync-service';
 *
 * self.addEventListener('sync', (event) => {
 *   if (event.tag === 'xapi-sync') {
 *     event.waitUntil(handleSyncEvent());
 *   }
 * });
 * ```
 */
export async function handleSyncEvent(): Promise<void> {
  const service = getSyncService();
  await service.handleBackgroundSyncEvent();
}
