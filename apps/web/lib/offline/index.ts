/**
 * =============================================================================
 * LXD360 Offline Queue Service
 * =============================================================================
 *
 * Offline-first xAPI statement queue with IndexedDB persistence.
 * Provides automatic background sync when connection is restored.
 *
 * @module lib/offline
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * import { getQueueManager, getSyncService } from '@/lib/offline';
 *
 * // Initialize the queue
 * const queue = getQueueManager({ tenantId: 'my-tenant' });
 * await queue.initialize();
 *
 * // Queue statements
 * await queue.enqueue(myStatement);
 *
 * // Start sync service
 * const sync = getSyncService({ lrsEndpoint: '/api/xapi/statements' });
 * await sync.start();
 * ```
 */

// Conflict resolver
export {
  type ConflictAction,
  type ConflictAuditRecord,
  type ConflictResolution,
  type ConflictResolver,
  type CustomResolverOptions,
  createCustomResolver,
  createDefaultResolver,
  LastWriteWinsResolver,
  ScorePreservingResolver,
  statementsMatch,
  TimestampConflictResolver,
} from './conflict-resolver';
// Schema and types
export {
  createTransaction,
  DB_NAME,
  DB_VERSION,
  deleteDatabase,
  type FailedStatement,
  getStore,
  isFailedStatement,
  isProgressCacheEntry,
  isQueuedXAPIStatement,
  isSyncMetadata,
  type OfflineDBSchema,
  openDatabase,
  type ProgressCacheEntry,
  promisifyRequest,
  promisifyTransaction,
  type QueuedXAPIStatement,
  STORES,
  type StoreName,
  type SyncMetadata,
} from './indexed-db-schema';
// Queue manager
export {
  getQueueManager,
  OfflineQueueManager,
  type QueueManagerConfig,
  resetQueueManager,
} from './queue-manager';
// Sync service
export {
  getSyncService,
  handleSyncEvent,
  OfflineSyncService,
  resetSyncService,
  type SyncResult,
  type SyncServiceConfig,
  type SyncStatus,
} from './sync-service';
