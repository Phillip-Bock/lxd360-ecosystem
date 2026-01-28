'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from '@/lib/logger';
import type {
  Notification,
  NotificationChannel,
  NotificationCounts,
  NotificationPreferences,
  NotificationType,
} from '@/lib/notifications/types';

const log = logger.child({ module: 'hooks-useNotifications' });

// ============================================================================
// TYPES
// ============================================================================

interface UseNotificationsOptions {
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  /** Only fetch unread */
  unreadOnly?: boolean;
  /** Filter by type */
  type?: NotificationType | NotificationType[];
  /** Filter by category */
  category?: string;
  /** Page size */
  limit?: number;
  /** Enable polling */
  pollingInterval?: number;
}

interface NotificationsState {
  notifications: Notification[];
  counts: NotificationCounts | null;
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
}

interface UseNotificationsReturn extends NotificationsState {
  /** Refresh notifications */
  refresh: () => Promise<void>;
  /** Load more notifications */
  loadMore: () => Promise<void>;
  /** Mark notification as read */
  markAsRead: (id: string) => Promise<void>;
  /** Mark all as read */
  markAllAsRead: (filters?: { type?: NotificationType; category?: string }) => Promise<void>;
  /** Dismiss notification */
  dismiss: (id: string) => Promise<void>;
  /** Has more pages */
  hasMore: boolean;
}

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: string | null;
  update: (updates: Partial<NotificationPreferences>) => Promise<void>;
  refresh: () => Promise<void>;
}

// ============================================================================
// API HELPERS
// ============================================================================

async function fetchNotifications(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  const response = await fetch(`/api/notifications?${searchParams}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch notifications');
  }

  return response.json();
}

async function fetchPreferences() {
  const response = await fetch('/api/notifications/preferences');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch preferences');
  }

  return response.json();
}

async function updateNotificationPreferences(updates: Partial<NotificationPreferences>) {
  const response = await fetch('/api/notifications/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update preferences');
  }

  return response.json();
}

async function patchNotification(id: string, action: 'read' | 'dismiss') {
  const response = await fetch(`/api/notifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `Failed to ${action} notification`);
  }

  return response.json();
}

async function markAllNotificationsRead(filters?: { type?: NotificationType; category?: string }) {
  const response = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters || {}),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to mark notifications as read');
  }

  return response.json();
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for managing notifications
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    autoFetch = true,
    unreadOnly = false,
    type,
    category,
    limit = 20,
    pollingInterval,
  } = options;

  const [state, setState] = useState<NotificationsState>({
    notifications: [],
    counts: null,
    total: 0,
    page: 1,
    loading: false,
    error: null,
  });

  // Fetch notifications
  const fetchData = useCallback(
    async (page = 1, append = false) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await fetchNotifications({
          unreadOnly,
          type: Array.isArray(type) ? type.join(',') : type,
          category,
          limit,
          offset: (page - 1) * limit,
        });

        setState((prev) => ({
          ...prev,
          notifications: append ? [...prev.notifications, ...result.data] : result.data,
          counts: result.meta?.counts || null,
          total: result.pagination?.total || 0,
          page,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    },
    [unreadOnly, type, category, limit],
  );

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  // Polling
  useEffect(() => {
    if (!pollingInterval) return;

    const interval = setInterval(() => {
      fetchData(1, false);
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval, fetchData]);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchData(1, false);
  }, [fetchData]);

  // Load more
  const loadMore = useCallback(async () => {
    await fetchData(state.page + 1, true);
  }, [fetchData, state.page]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await patchNotification(id, 'read');

      // Update local state
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === id ? { ...n, status: 'read', readAt: new Date() } : n,
        ),
        counts: prev.counts
          ? { ...prev.counts, unread: Math.max(0, prev.counts.unread - 1) }
          : null,
      }));
    } catch (error) {
      log.error('Failed to mark notification as read', { error });
      throw error;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(
    async (filters?: { type?: NotificationType; category?: string }) => {
      try {
        const result = await markAllNotificationsRead(filters);

        // Refresh to get updated state
        await refresh();

        return result;
      } catch (error) {
        log.error('Failed to mark all as read', { error });
        throw error;
      }
    },
    [refresh],
  );

  // Dismiss
  const dismiss = useCallback(async (id: string) => {
    try {
      await patchNotification(id, 'dismiss');

      // Remove from local state
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n.id !== id),
        total: prev.total - 1,
      }));
    } catch (error) {
      log.error('Failed to dismiss notification', { error });
      throw error;
    }
  }, []);

  // Has more
  const hasMore = useMemo(
    () => state.notifications.length < state.total,
    [state.notifications.length, state.total],
  );

  return {
    ...state,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    dismiss,
    hasMore,
  };
}

/**
 * Hook for notification counts only
 */
export function useNotificationCounts(pollingInterval?: number): {
  counts: NotificationCounts | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [counts, setCounts] = useState<NotificationCounts | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchNotifications({ limit: 1 });
      setCounts(result.meta?.counts || null);
    } catch (error) {
      log.error('Failed to fetch notification counts', { error });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Polling
  useEffect(() => {
    if (!pollingInterval) return;

    const interval = setInterval(fetchCounts, pollingInterval);
    return () => clearInterval(interval);
  }, [pollingInterval, fetchCounts]);

  return {
    counts,
    loading,
    refresh: fetchCounts,
  };
}

/**
 * Hook for notification preferences
 */
export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch preferences
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchPreferences();
      setPreferences(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Update preferences
  const update = useCallback(async (updates: Partial<NotificationPreferences>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateNotificationPreferences(updates);
      setPreferences(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    preferences,
    loading,
    error,
    update,
    refresh,
  };
}

/**
 * Hook for a single notification type preference
 */
export function useNotificationTypePreference(notificationType: NotificationType): {
  enabled: boolean;
  channels: NotificationChannel[];
  loading: boolean;
  toggle: () => Promise<void>;
  setChannels: (channels: NotificationChannel[]) => Promise<void>;
} {
  const { preferences, loading, update } = useNotificationPreferences();

  const typePrefs = preferences?.typePreferences[notificationType];
  const isEnabled = typePrefs?.enabled ?? true;
  const channels = useMemo(() => typePrefs?.channels ?? [], [typePrefs?.channels]);

  const toggle = useCallback(async () => {
    await update({
      typePreferences: {
        ...preferences?.typePreferences,
        [notificationType]: {
          enabled: !isEnabled,
          channels,
        },
      },
    });
  }, [preferences, notificationType, isEnabled, channels, update]);

  const setChannels = useCallback(
    async (newChannels: NotificationChannel[]) => {
      await update({
        typePreferences: {
          ...preferences?.typePreferences,
          [notificationType]: {
            enabled: isEnabled,
            channels: newChannels,
          },
        },
      });
    },
    [preferences, notificationType, isEnabled, update],
  );

  return {
    enabled: isEnabled,
    channels,
    loading,
    toggle,
    setChannels,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useNotifications;
