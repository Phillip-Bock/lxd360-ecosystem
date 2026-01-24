'use client';

import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { requireDb } from '@/lib/firebase/client';

// =============================================================================
// Types
// =============================================================================

export interface LockInfo {
  userId: string;
  userName: string;
  userEmail?: string;
  lockedAt: Timestamp;
  lastHeartbeat: Timestamp;
}

export interface UseDraftLockOptions {
  /** User ID of current user */
  userId: string;
  /** User display name */
  userName: string;
  /** User email (optional) */
  userEmail?: string;
  /** Heartbeat interval in ms. Default: 30000 (30s) */
  heartbeatInterval?: number;
  /** Lock timeout in ms. If no heartbeat within this time, lock is stale. Default: 60000 (1m) */
  lockTimeout?: number;
  /** Called when lock is acquired */
  onLockAcquired?: () => void;
  /** Called when lock is lost (another user took over) */
  onLockLost?: (lockedBy: LockInfo) => void;
  /** Called when entering read-only mode */
  onReadOnlyMode?: (lockedBy: LockInfo) => void;
}

export interface UseDraftLockReturn {
  /** Whether the current user has the lock */
  hasLock: boolean;
  /** Whether the document is in read-only mode for current user */
  isReadOnly: boolean;
  /** Info about who currently holds the lock (null if no lock) */
  lockedBy: LockInfo | null;
  /** Whether the lock check is still loading */
  isLoading: boolean;
  /** Manually attempt to acquire the lock */
  acquireLock: () => Promise<boolean>;
  /** Manually release the lock */
  releaseLock: () => Promise<void>;
  /** Force take the lock (use with caution) */
  forceTakeLock: () => Promise<boolean>;
}

// =============================================================================
// useDraftLock Hook
// =============================================================================

export function useDraftLock(
  tenantId: string,
  courseId: string,
  options: UseDraftLockOptions,
): UseDraftLockReturn {
  const {
    userId,
    userName,
    userEmail,
    heartbeatInterval = 30000, // 30 seconds
    lockTimeout = 60000, // 1 minute
    onLockAcquired,
    onLockLost,
    onReadOnlyMode,
  } = options;

  const [hasLock, setHasLock] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [lockedBy, setLockedBy] = useState<LockInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Get lock document reference
  const getLockRef = useCallback(() => {
    const db = requireDb();
    return doc(db, 'tenants', tenantId, 'courses', courseId, 'lock', 'current');
  }, [tenantId, courseId]);

  // Check if a lock is stale (no heartbeat within timeout)
  const isLockStale = useCallback(
    (lock: LockInfo): boolean => {
      const heartbeatTime = lock.lastHeartbeat?.toMillis?.() ?? 0;
      const now = Date.now();
      return now - heartbeatTime > lockTimeout;
    },
    [lockTimeout],
  );

  // Update heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!hasLock) return;

    try {
      const lockRef = getLockRef();
      await setDoc(
        lockRef,
        {
          lastHeartbeat: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  }, [hasLock, getLockRef]);

  // Acquire lock
  const acquireLock = useCallback(async (): Promise<boolean> => {
    try {
      const lockRef = getLockRef();
      const lockSnap = await getDoc(lockRef);

      if (lockSnap.exists()) {
        const currentLock = lockSnap.data() as LockInfo;

        // If locked by same user, just update heartbeat
        if (currentLock.userId === userId) {
          await sendHeartbeat();
          setHasLock(true);
          setIsReadOnly(false);
          onLockAcquired?.();
          return true;
        }

        // If lock is stale, we can take it
        if (!isLockStale(currentLock)) {
          // Lock is active and held by another user
          setHasLock(false);
          setIsReadOnly(true);
          setLockedBy(currentLock);
          onReadOnlyMode?.(currentLock);
          return false;
        }
      }

      // Create or take over stale lock
      const lockData: LockInfo = {
        userId,
        userName,
        userEmail,
        lockedAt: serverTimestamp() as Timestamp,
        lastHeartbeat: serverTimestamp() as Timestamp,
      };

      await setDoc(lockRef, lockData);
      setHasLock(true);
      setIsReadOnly(false);
      setLockedBy(lockData);
      onLockAcquired?.();
      return true;
    } catch (error) {
      console.error('Failed to acquire lock:', error);
      return false;
    }
  }, [
    getLockRef,
    userId,
    userName,
    userEmail,
    isLockStale,
    sendHeartbeat,
    onLockAcquired,
    onReadOnlyMode,
  ]);

  // Release lock
  const releaseLock = useCallback(async (): Promise<void> => {
    try {
      const lockRef = getLockRef();
      const lockSnap = await getDoc(lockRef);

      // Only release if we own the lock
      if (lockSnap.exists()) {
        const currentLock = lockSnap.data() as LockInfo;
        if (currentLock.userId === userId) {
          await deleteDoc(lockRef);
        }
      }

      setHasLock(false);
      setLockedBy(null);
    } catch (error) {
      console.error('Failed to release lock:', error);
    }
  }, [getLockRef, userId]);

  // Force take lock (admin action)
  const forceTakeLock = useCallback(async (): Promise<boolean> => {
    try {
      const lockRef = getLockRef();
      const lockData: LockInfo = {
        userId,
        userName,
        userEmail,
        lockedAt: serverTimestamp() as Timestamp,
        lastHeartbeat: serverTimestamp() as Timestamp,
      };

      await setDoc(lockRef, lockData);
      setHasLock(true);
      setIsReadOnly(false);
      setLockedBy(lockData);
      onLockAcquired?.();
      return true;
    } catch (error) {
      console.error('Failed to force take lock:', error);
      return false;
    }
  }, [getLockRef, userId, userName, userEmail, onLockAcquired]);

  // Listen for lock changes
  useEffect(() => {
    const lockRef = getLockRef();

    unsubscribeRef.current = onSnapshot(
      lockRef,
      (snapshot) => {
        setIsLoading(false);

        if (!snapshot.exists()) {
          // No lock exists
          setLockedBy(null);
          // Try to acquire if we don't have it
          if (!hasLock) {
            acquireLock();
          }
          return;
        }

        const lockData = snapshot.data() as LockInfo;
        setLockedBy(lockData);

        if (lockData.userId === userId) {
          // We have the lock
          setHasLock(true);
          setIsReadOnly(false);
        } else if (isLockStale(lockData)) {
          // Lock is stale, try to take it
          acquireLock();
        } else {
          // Another user has an active lock
          if (hasLock) {
            // We lost the lock!
            setHasLock(false);
            onLockLost?.(lockData);
          }
          setIsReadOnly(true);
          onReadOnlyMode?.(lockData);
        }
      },
      (error) => {
        console.error('Lock listener error:', error);
        setIsLoading(false);
      },
    );

    return () => {
      unsubscribeRef.current?.();
    };
  }, [getLockRef, userId, hasLock, isLockStale, acquireLock, onLockLost, onReadOnlyMode]);

  // Setup heartbeat interval
  useEffect(() => {
    if (hasLock) {
      // Send immediate heartbeat
      sendHeartbeat();

      // Setup interval
      heartbeatRef.current = setInterval(sendHeartbeat, heartbeatInterval);
    }

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [hasLock, heartbeatInterval, sendHeartbeat]);

  // Release lock on unmount
  useEffect(() => {
    return () => {
      // Release lock when component unmounts
      releaseLock();
    };
  }, [releaseLock]);

  // Handle page visibility change (release lock when page hidden for too long)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, could stop heartbeat
        // But we keep it running to maintain lock during brief tab switches
      } else {
        // Page is visible, send heartbeat
        if (hasLock) {
          sendHeartbeat();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasLock, sendHeartbeat]);

  // Handle beforeunload to release lock
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Attempt to release lock synchronously (may not always work)
      if (hasLock) {
        // Use sendBeacon for better reliability on page close
        const url = `/api/release-lock`;
        const data = JSON.stringify({
          tenantId,
          courseId,
          userId,
        });
        navigator.sendBeacon?.(url, data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasLock, tenantId, courseId, userId]);

  return {
    hasLock,
    isReadOnly,
    lockedBy,
    isLoading,
    acquireLock,
    releaseLock,
    forceTakeLock,
  };
}

export default useDraftLock;
