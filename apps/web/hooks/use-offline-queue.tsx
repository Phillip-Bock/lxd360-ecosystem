'use client';

/**
 * =============================================================================
 * LXD360 Offline Queue Service - useOfflineQueue Hook
 * =============================================================================
 *
 * React hook for queueing xAPI statements with offline support.
 * Automatically queues statements when offline and syncs when online.
 *
 * @module hooks/use-offline-queue
 * @version 1.0.0
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { FailedStatement, QueuedXAPIStatement } from '@/lib/offline/indexed-db-schema';
import { getQueueManager } from '@/lib/offline/queue-manager';
import {
  getSyncService,
  type SyncResult,
  type SyncServiceConfig,
} from '@/lib/offline/sync-service';
import type { XAPIStatement } from '@/types/xapi';

import { useIsOnline } from './use-offline-status';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Queue statistics.
 */
export interface QueueStats {
  total: number;
  pending: number;
  retrying: number;
  failed: number;
  highPriority: number;
  normalPriority: number;
  lowPriority: number;
}

/**
 * Hook configuration options.
 */
export interface UseOfflineQueueOptions {
  /** LRS endpoint for sync (default: '/api/xapi/statements') */
  lrsEndpoint?: string;
  /** Authorization header for LRS */
  lrsAuth?: string;
  /** Tenant ID for multi-tenant */
  tenantId?: string;
  /** Maximum queue size (default: 1000) */
  maxQueueSize?: number;
  /** Maximum retries before marking failed (default: 5) */
  maxRetries?: number;
  /** Auto-start sync service (default: true) */
  autoStart?: boolean;
  /** Auto-sync interval in ms (default: 30000) */
  autoSyncInterval?: number;
}

/**
 * Hook return type.
 */
export interface UseOfflineQueueReturn {
  /** Queue a single statement */
  queueStatement: (
    statement: XAPIStatement,
    priority?: QueuedXAPIStatement['priority'],
  ) => Promise<void>;
  /** Queue multiple statements */
  queueStatements: (
    statements: XAPIStatement[],
    priority?: QueuedXAPIStatement['priority'],
  ) => Promise<void>;
  /** Trigger manual sync */
  sync: () => Promise<SyncResult>;
  /** Clear all queued statements */
  clearQueue: () => Promise<void>;
  /** Get failed statements for review */
  getFailedStatements: () => Promise<FailedStatement[]>;
  /** Retry a failed statement */
  retryFailedStatement: (id: string) => Promise<void>;
  /** Delete a failed statement */
  deleteFailedStatement: (id: string) => Promise<void>;
  /** Current queue statistics */
  stats: QueueStats;
  /** Whether the service is initialized */
  isReady: boolean;
  /** Whether currently syncing */
  isSyncing: boolean;
  /** Online status */
  isOnline: boolean;
  /** Last sync result */
  lastSyncResult: SyncResult | null;
  /** Last error message */
  lastError: string | null;
}

// =============================================================================
// DEFAULT OPTIONS
// =============================================================================

const DEFAULT_OPTIONS: Required<UseOfflineQueueOptions> = {
  lrsEndpoint: '/api/xapi/statements',
  lrsAuth: '',
  tenantId: '',
  maxQueueSize: 1000,
  maxRetries: 5,
  autoStart: true,
  autoSyncInterval: 30000,
};

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * React hook for queueing xAPI statements with offline support.
 *
 * @example
 * ```tsx
 * function LearnerPlayer() {
 *   const { queueStatement, stats, isOnline, isSyncing } = useOfflineQueue({
 *     tenantId: 'tenant-123',
 *   });
 *
 *   const trackProgress = async (progress: number) => {
 *     await queueStatement({
 *       actor: { ... },
 *       verb: { id: 'http://adlnet.gov/expapi/verbs/progressed', display: { 'en-US': 'progressed' } },
 *       object: { id: 'activity:course/123', definition: { ... } },
 *       result: { extensions: { 'https://w3id.org/xapi/cmi5/result/extensions/progress': progress } },
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <StatusBar isOnline={isOnline} isSyncing={isSyncing} pending={stats.total} />
 *       <VideoPlayer onProgress={trackProgress} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useOfflineQueue(options: UseOfflineQueueOptions = {}): UseOfflineQueueReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Online status
  const isOnline = useIsOnline();

  // State
  const [isReady, setIsReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    retrying: 0,
    failed: 0,
    highPriority: 0,
    normalPriority: 0,
    lowPriority: 0,
  });
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Services (memoized to prevent recreating on each render)
  const { queueManager, syncService } = useMemo(() => {
    const manager = getQueueManager({
      maxQueueSize: opts.maxQueueSize,
      maxRetries: opts.maxRetries,
      batchSize: 25,
      tenantId: opts.tenantId || undefined,
    });

    const serviceConfig: Partial<SyncServiceConfig> = {
      lrsEndpoint: opts.lrsEndpoint,
      batchSize: 25,
      autoSyncInterval: opts.autoSyncInterval,
    };

    if (opts.lrsAuth) {
      serviceConfig.lrsAuth = opts.lrsAuth;
    }

    if (opts.tenantId) {
      serviceConfig.tenantId = opts.tenantId;
    }

    const service = getSyncService(serviceConfig);

    return { queueManager: manager, syncService: service };
  }, [
    opts.lrsEndpoint,
    opts.lrsAuth,
    opts.tenantId,
    opts.maxQueueSize,
    opts.maxRetries,
    opts.autoSyncInterval,
  ]);

  // Refresh stats helper (defined before useEffects that depend on it)
  const refreshStats = useCallback(async () => {
    try {
      const queueStats = await queueManager.getQueueStats();
      const failedStatements = await queueManager.getFailedStatements();

      setStats({
        ...queueStats,
        failed: failedStatements.length,
      });
    } catch {
      // Ignore refresh errors
    }
  }, [queueManager]);

  // Initialize services
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await queueManager.initialize();

        if (opts.autoStart) {
          await syncService.start();
        }

        if (mounted) {
          setIsReady(true);
          await refreshStats();
        }
      } catch (error) {
        if (mounted) {
          setLastError(error instanceof Error ? error.message : 'Failed to initialize');
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [queueManager, syncService, opts.autoStart, refreshStats]);

  // Subscribe to queue changes
  useEffect(() => {
    if (!isReady) return;

    const unsubscribe = queueManager.onQueueChange(() => {
      refreshStats();
    });

    return unsubscribe;
  }, [queueManager, isReady, refreshStats]);

  // Subscribe to sync status changes
  useEffect(() => {
    if (!isReady) return;

    const unsubscribe = syncService.onStatusChange((status) => {
      setIsSyncing(status.isSyncing);
      if (status.lastError) {
        setLastError(status.lastError);
      }
    });

    return unsubscribe;
  }, [syncService, isReady]);

  // Queue a single statement
  const queueStatement = useCallback(
    async (statement: XAPIStatement, priority: QueuedXAPIStatement['priority'] = 'normal') => {
      if (!isReady) {
        throw new Error('Queue service not initialized');
      }

      try {
        await queueManager.enqueue(statement, priority);
        setLastError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to queue statement';
        setLastError(message);
        throw error;
      }
    },
    [queueManager, isReady],
  );

  // Queue multiple statements
  const queueStatements = useCallback(
    async (statements: XAPIStatement[], priority: QueuedXAPIStatement['priority'] = 'normal') => {
      if (!isReady) {
        throw new Error('Queue service not initialized');
      }

      try {
        await queueManager.enqueueBatch(statements, priority);
        setLastError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to queue statements';
        setLastError(message);
        throw error;
      }
    },
    [queueManager, isReady],
  );

  // Manual sync
  const sync = useCallback(async (): Promise<SyncResult> => {
    if (!isReady) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: [{ statementId: 'all', error: 'Queue service not initialized' }],
        duration: 0,
      };
    }

    try {
      const result = await syncService.sync();
      setLastSyncResult(result);

      if (result.errors.length > 0) {
        setLastError(result.errors[0].error);
      } else {
        setLastError(null);
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      setLastError(message);

      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: [{ statementId: 'all', error: message }],
        duration: 0,
      };
    }
  }, [syncService, isReady]);

  // Clear queue
  const clearQueue = useCallback(async () => {
    if (!isReady) return;
    await queueManager.clearQueue();
  }, [queueManager, isReady]);

  // Get failed statements
  const getFailedStatements = useCallback(async () => {
    if (!isReady) return [];
    return queueManager.getFailedStatements();
  }, [queueManager, isReady]);

  // Retry failed statement
  const retryFailedStatement = useCallback(
    async (id: string) => {
      if (!isReady) return;
      await queueManager.retryFailedStatement(id);
    },
    [queueManager, isReady],
  );

  // Delete failed statement
  const deleteFailedStatement = useCallback(
    async (id: string) => {
      if (!isReady) return;
      await queueManager.deleteFailedStatement(id);
      await refreshStats();
    },
    [queueManager, isReady, refreshStats],
  );

  return {
    queueStatement,
    queueStatements,
    sync,
    clearQueue,
    getFailedStatements,
    retryFailedStatement,
    deleteFailedStatement,
    stats,
    isReady,
    isSyncing,
    isOnline,
    lastSyncResult,
    lastError,
  };
}

// =============================================================================
// PROVIDER CONTEXT (for app-wide usage)
// =============================================================================

const OfflineQueueContext = createContext<UseOfflineQueueReturn | null>(null);

/**
 * Provider props.
 */
export interface OfflineQueueProviderProps {
  children: ReactNode;
  options?: UseOfflineQueueOptions;
}

/**
 * Provider component for app-wide offline queue access.
 *
 * @example
 * ```tsx
 * // In your app layout
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <OfflineQueueProvider options={{ tenantId: 'my-tenant' }}>
 *       {children}
 *     </OfflineQueueProvider>
 *   );
 * }
 *
 * // In any component
 * function MyComponent() {
 *   const { queueStatement, isOnline } = useOfflineQueueContext();
 *   // ...
 * }
 * ```
 */
export function OfflineQueueProvider({
  children,
  options = {},
}: OfflineQueueProviderProps): React.JSX.Element {
  const queue = useOfflineQueue(options);

  return <OfflineQueueContext.Provider value={queue}>{children}</OfflineQueueContext.Provider>;
}

/**
 * Hook to access the offline queue from context.
 * Must be used within an OfflineQueueProvider.
 */
export function useOfflineQueueContext(): UseOfflineQueueReturn {
  const context = useContext(OfflineQueueContext);

  if (!context) {
    throw new Error('useOfflineQueueContext must be used within an OfflineQueueProvider');
  }

  return context;
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default useOfflineQueue;
