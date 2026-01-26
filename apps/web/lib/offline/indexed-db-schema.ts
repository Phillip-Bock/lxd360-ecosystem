/**
 * =============================================================================
 * LXD360 Offline Queue Service - IndexedDB Schema
 * =============================================================================
 *
 * Defines the IndexedDB database schema for persistent offline storage.
 * Uses IndexedDB for robust storage that survives browser close.
 *
 * @module lib/offline/indexed-db-schema
 * @version 1.0.0
 */

import type { XAPIStatement } from '@/types/xapi';

// =============================================================================
// DATABASE CONSTANTS
// =============================================================================

export const DB_NAME = 'lxd360-offline';
export const DB_VERSION = 1;

/**
 * Store names in the IndexedDB database.
 */
export const STORES = {
  XAPI_QUEUE: 'xapiQueue',
  PROGRESS_CACHE: 'progressCache',
  SYNC_METADATA: 'syncMetadata',
  FAILED_STATEMENTS: 'failedStatements',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

// =============================================================================
// STORE INTERFACES
// =============================================================================

/**
 * Queued xAPI statement awaiting sync.
 */
export interface QueuedXAPIStatement {
  /** Unique identifier (UUID) */
  id: string;
  /** The xAPI statement to send */
  statement: XAPIStatement;
  /** ISO timestamp when queued */
  queuedAt: string;
  /** Number of sync attempts */
  attempts: number;
  /** ISO timestamp of last sync attempt */
  lastAttempt?: string;
  /** Error message from last failed attempt */
  lastError?: string;
  /** Priority level for processing order */
  priority: 'high' | 'normal' | 'low';
  /** Tenant ID for multi-tenant isolation */
  tenantId?: string;
}

/**
 * Cached progress data for offline access.
 */
export interface ProgressCacheEntry {
  /** Content atom ID */
  contentAtomId: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Position in content (e.g., video time, page number) */
  position: number;
  /** ISO timestamp when updated */
  updatedAt: string;
  /** User ID for multi-user isolation */
  userId?: string;
  /** Additional state data */
  state?: Record<string, unknown>;
}

/**
 * Metadata about sync operations.
 */
export interface SyncMetadata {
  /** Metadata key identifier */
  key: string;
  /** Last successful sync timestamp */
  lastSyncAt?: string;
  /** Last sync error message */
  lastSyncError?: string;
  /** Number of consecutive failures */
  consecutiveFailures: number;
  /** Is sync currently in progress */
  isSyncing: boolean;
  /** Total statements synced */
  totalSynced: number;
  /** Total statements failed */
  totalFailed: number;
}

/**
 * Statement that failed after max retries (for manual review).
 */
export interface FailedStatement {
  /** Original queue entry ID */
  id: string;
  /** The xAPI statement that failed */
  statement: XAPIStatement;
  /** ISO timestamp when originally queued */
  queuedAt: string;
  /** ISO timestamp when moved to failed */
  failedAt: string;
  /** Total attempts made */
  attempts: number;
  /** Final error message */
  error: string;
  /** Whether it's been reviewed */
  reviewed: boolean;
}

// =============================================================================
// DATABASE INITIALIZATION
// =============================================================================

/**
 * Opens or creates the IndexedDB database with the defined schema.
 *
 * @returns Promise resolving to the IDBDatabase instance
 * @throws Error if IndexedDB is not supported or database open fails
 */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // xAPI Queue Store
      if (!db.objectStoreNames.contains(STORES.XAPI_QUEUE)) {
        const xapiStore = db.createObjectStore(STORES.XAPI_QUEUE, { keyPath: 'id' });
        xapiStore.createIndex('queuedAt', 'queuedAt', { unique: false });
        xapiStore.createIndex('priority', 'priority', { unique: false });
        xapiStore.createIndex('attempts', 'attempts', { unique: false });
        xapiStore.createIndex('tenantId', 'tenantId', { unique: false });
      }

      // Progress Cache Store
      if (!db.objectStoreNames.contains(STORES.PROGRESS_CACHE)) {
        const progressStore = db.createObjectStore(STORES.PROGRESS_CACHE, {
          keyPath: 'contentAtomId',
        });
        progressStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        progressStore.createIndex('userId', 'userId', { unique: false });
      }

      // Sync Metadata Store
      if (!db.objectStoreNames.contains(STORES.SYNC_METADATA)) {
        db.createObjectStore(STORES.SYNC_METADATA, { keyPath: 'key' });
      }

      // Failed Statements Store
      if (!db.objectStoreNames.contains(STORES.FAILED_STATEMENTS)) {
        const failedStore = db.createObjectStore(STORES.FAILED_STATEMENTS, { keyPath: 'id' });
        failedStore.createIndex('failedAt', 'failedAt', { unique: false });
        failedStore.createIndex('reviewed', 'reviewed', { unique: false });
      }
    };
  });
}

/**
 * Deletes the entire IndexedDB database.
 * Use with caution - this will remove all offline data.
 *
 * @returns Promise that resolves when the database is deleted
 */
export function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      resolve();
      return;
    }

    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onerror = () => {
      reject(new Error(`Failed to delete IndexedDB: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

// =============================================================================
// TRANSACTION HELPERS
// =============================================================================

/**
 * Creates a transaction for the specified stores.
 *
 * @param db - The IDBDatabase instance
 * @param storeNames - Store names to include in the transaction
 * @param mode - Transaction mode ('readonly' or 'readwrite')
 * @returns The IDBTransaction instance
 */
export function createTransaction(
  db: IDBDatabase,
  storeNames: StoreName | StoreName[],
  mode: IDBTransactionMode = 'readonly',
): IDBTransaction {
  const stores = Array.isArray(storeNames) ? storeNames : [storeNames];
  return db.transaction(stores, mode);
}

/**
 * Gets an object store from a transaction.
 *
 * @param transaction - The IDBTransaction instance
 * @param storeName - The store name to retrieve
 * @returns The IDBObjectStore instance
 */
export function getStore(transaction: IDBTransaction, storeName: StoreName): IDBObjectStore {
  return transaction.objectStore(storeName);
}

/**
 * Wraps an IDBRequest in a Promise.
 *
 * @param request - The IDBRequest to wrap
 * @returns Promise resolving to the request result
 */
export function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Wraps an IDBTransaction in a Promise that resolves when complete.
 *
 * @param transaction - The IDBTransaction to wrap
 * @returns Promise that resolves when the transaction completes
 */
export function promisifyTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(new Error('Transaction aborted'));
  });
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is a QueuedXAPIStatement.
 */
export function isQueuedXAPIStatement(value: unknown): value is QueuedXAPIStatement {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.statement === 'object' &&
    typeof obj.queuedAt === 'string' &&
    typeof obj.attempts === 'number' &&
    (obj.priority === 'high' || obj.priority === 'normal' || obj.priority === 'low')
  );
}

/**
 * Type guard to check if a value is a ProgressCacheEntry.
 */
export function isProgressCacheEntry(value: unknown): value is ProgressCacheEntry {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.contentAtomId === 'string' &&
    typeof obj.progress === 'number' &&
    typeof obj.position === 'number' &&
    typeof obj.updatedAt === 'string'
  );
}

/**
 * Type guard to check if a value is a SyncMetadata.
 */
export function isSyncMetadata(value: unknown): value is SyncMetadata {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.key === 'string' &&
    typeof obj.consecutiveFailures === 'number' &&
    typeof obj.isSyncing === 'boolean' &&
    typeof obj.totalSynced === 'number' &&
    typeof obj.totalFailed === 'number'
  );
}

/**
 * Type guard to check if a value is a FailedStatement.
 */
export function isFailedStatement(value: unknown): value is FailedStatement {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.statement === 'object' &&
    typeof obj.queuedAt === 'string' &&
    typeof obj.failedAt === 'string' &&
    typeof obj.attempts === 'number' &&
    typeof obj.error === 'string' &&
    typeof obj.reviewed === 'boolean'
  );
}

// =============================================================================
// SCHEMA EXPORTS
// =============================================================================

export type { XAPIStatement };

/**
 * Complete database schema type.
 */
export interface OfflineDBSchema {
  [STORES.XAPI_QUEUE]: {
    key: string;
    value: QueuedXAPIStatement;
    indexes: {
      queuedAt: string;
      priority: 'high' | 'normal' | 'low';
      attempts: number;
      tenantId: string | undefined;
    };
  };
  [STORES.PROGRESS_CACHE]: {
    key: string;
    value: ProgressCacheEntry;
    indexes: {
      updatedAt: string;
      userId: string | undefined;
    };
  };
  [STORES.SYNC_METADATA]: {
    key: string;
    value: SyncMetadata;
  };
  [STORES.FAILED_STATEMENTS]: {
    key: string;
    value: FailedStatement;
    indexes: {
      failedAt: string;
      reviewed: boolean;
    };
  };
}
