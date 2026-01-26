'use client';

/**
 * =============================================================================
 * LXD360 Offline Queue Service - useOfflineStatus Hook
 * =============================================================================
 *
 * React hook for monitoring online/offline state and sync status.
 * Provides reactive updates for UI components.
 *
 * @module hooks/use-offline-status
 * @version 1.0.0
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { SyncStatus } from '@/lib/offline/sync-service';
import { getSyncService } from '@/lib/offline/sync-service';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Extended status including connection quality.
 */
export interface OfflineStatus extends SyncStatus {
  /** Effective network type (if available) */
  connectionType?: string;
  /** Estimated effective bandwidth in Mbps */
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  /** Estimated round-trip time in ms */
  rtt?: number;
  /** Whether save-data mode is enabled */
  saveData?: boolean;
  /** Time since last successful sync in ms */
  timeSinceLastSync: number | null;
}

/**
 * Hook return type.
 */
export interface UseOfflineStatusReturn {
  /** Full offline status */
  status: OfflineStatus;
  /** Simple boolean for online state */
  isOnline: boolean;
  /** Simple boolean for syncing state */
  isSyncing: boolean;
  /** Number of statements waiting to sync */
  pendingCount: number;
  /** Trigger a manual sync */
  triggerSync: () => Promise<void>;
  /** Refresh status */
  refresh: () => void;
}

// =============================================================================
// ONLINE STATUS STORE (for useSyncExternalStore)
// =============================================================================

function subscribeToOnlineStatus(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);

  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineStatus(): boolean {
  if (typeof navigator === 'undefined') {
    return true; // SSR - assume online
  }
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true; // SSR - assume online
}

// =============================================================================
// NETWORK INFORMATION HELPERS
// =============================================================================

interface NetworkInformation {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  type?: string;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (event: string, handler: () => void) => void;
  removeEventListener?: (event: string, handler: () => void) => void;
}

function getNetworkInfo(): {
  connectionType?: string;
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  rtt?: number;
  saveData?: boolean;
} | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const nav = navigator as Navigator & { connection?: NetworkInformation };

  if (!nav.connection) {
    return null;
  }

  return {
    connectionType: nav.connection.type,
    effectiveType: nav.connection.effectiveType,
    rtt: nav.connection.rtt,
    saveData: nav.connection.saveData,
  };
}

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * React hook for monitoring online/offline status and sync state.
 *
 * @example
 * ```tsx
 * function StatusIndicator() {
 *   const { isOnline, isSyncing, pendingCount, triggerSync } = useOfflineStatus();
 *
 *   return (
 *     <div>
 *       <span>{isOnline ? '🟢 Online' : '🔴 Offline'}</span>
 *       {pendingCount > 0 && (
 *         <button onClick={triggerSync} disabled={!isOnline || isSyncing}>
 *           Sync ({pendingCount})
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useOfflineStatus(): UseOfflineStatusReturn {
  // Use useSyncExternalStore for online status (prevents hydration issues)
  const isOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineStatus,
    getServerSnapshot,
  );

  // Sync service status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    queueSize: 0,
    lastSyncAt: null,
    lastError: null,
    consecutiveFailures: 0,
  });

  // Network info
  const [networkInfo, setNetworkInfo] = useState<ReturnType<typeof getNetworkInfo>>(null);

  // Initialize and subscribe to sync service
  useEffect(() => {
    const service = getSyncService();

    // Get initial status
    service.getStatus().then(setSyncStatus);

    // Subscribe to updates
    const unsubscribe = service.onStatusChange(setSyncStatus);

    return unsubscribe;
  }, []);

  // Monitor network info changes
  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const nav = navigator as Navigator & { connection?: NetworkInformation };

    if (!nav.connection) return;

    const updateNetworkInfo = () => {
      setNetworkInfo(getNetworkInfo());
    };

    // Initial read
    updateNetworkInfo();

    // Listen for changes
    if (nav.connection.addEventListener) {
      nav.connection.addEventListener('change', updateNetworkInfo);

      return () => {
        if (nav.connection?.removeEventListener) {
          nav.connection.removeEventListener('change', updateNetworkInfo);
        }
      };
    }

    return undefined;
  }, []);

  // Calculate time since last sync
  const timeSinceLastSync = syncStatus.lastSyncAt
    ? Date.now() - new Date(syncStatus.lastSyncAt).getTime()
    : null;

  // Combine into full status
  const status: OfflineStatus = {
    ...syncStatus,
    isOnline,
    connectionType: networkInfo?.connectionType,
    effectiveType: networkInfo?.effectiveType,
    rtt: networkInfo?.rtt,
    saveData: networkInfo?.saveData,
    timeSinceLastSync,
  };

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    if (!isOnline) return;

    const service = getSyncService();
    await service.sync();
  }, [isOnline]);

  // Refresh callback - manually fetches latest status
  const refresh = useCallback(() => {
    const service = getSyncService();
    service.getStatus().then(setSyncStatus);
  }, []);

  return {
    status,
    isOnline,
    isSyncing: syncStatus.isSyncing,
    pendingCount: syncStatus.queueSize,
    triggerSync,
    refresh,
  };
}

// =============================================================================
// SIMPLE ONLINE HOOK
// =============================================================================

/**
 * Simple hook that only tracks online/offline state.
 * Use this when you don't need full sync status.
 *
 * @example
 * ```tsx
 * function App() {
 *   const isOnline = useIsOnline();
 *
 *   return isOnline ? <MainContent /> : <OfflineBanner />;
 * }
 * ```
 */
export function useIsOnline(): boolean {
  return useSyncExternalStore(subscribeToOnlineStatus, getOnlineStatus, getServerSnapshot);
}

// =============================================================================
// NETWORK QUALITY HOOK
// =============================================================================

/**
 * Hook for monitoring network quality.
 *
 * @example
 * ```tsx
 * function NetworkQualityIndicator() {
 *   const { effectiveType, rtt, saveData } = useNetworkQuality();
 *
 *   if (effectiveType === 'slow-2g' || effectiveType === '2g') {
 *     return <span>⚠️ Slow connection</span>;
 *   }
 *
 *   return null;
 * }
 * ```
 */
export function useNetworkQuality(): {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  rtt?: number;
  saveData?: boolean;
  isSlowConnection: boolean;
} {
  const [info, setInfo] = useState<ReturnType<typeof getNetworkInfo>>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const nav = navigator as Navigator & { connection?: NetworkInformation };

    if (!nav.connection) return;

    const update = () => setInfo(getNetworkInfo());
    update();

    if (nav.connection.addEventListener) {
      nav.connection.addEventListener('change', update);
      return () => {
        if (nav.connection?.removeEventListener) {
          nav.connection.removeEventListener('change', update);
        }
      };
    }

    return undefined;
  }, []);

  const isSlowConnection =
    info?.effectiveType === 'slow-2g' ||
    info?.effectiveType === '2g' ||
    (info?.rtt !== undefined && info.rtt > 500);

  return {
    effectiveType: info?.effectiveType,
    rtt: info?.rtt,
    saveData: info?.saveData,
    isSlowConnection,
  };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default useOfflineStatus;
