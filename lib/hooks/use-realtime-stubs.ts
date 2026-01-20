// ============================================================================
// Types
// ============================================================================

export interface PresenceUser {
  user_id: string;
  metadata?: {
    displayName?: string;
    role?: string;
    currentPage?: string;
    [key: string]: unknown;
  };
}

export interface PresenceOptions {
  metadata?: Record<string, unknown>;
}

export interface PresenceResult {
  users: PresenceUser[];
  isConnected: boolean;
  onlineCount: number;
}

export interface RealtimeHealth {
  healthy: boolean;
  activeChannels: number;
  failedChannels: number;
  reconnectAttempts: number;
  lastError?: {
    message: string;
    channel: string;
    timestamp: string;
  };
}

export interface RealtimeMetrics {
  messageRate?: number;
  averageLatency?: number;
  uptime?: number;
}

export interface SubscriptionOptions<T> {
  onInsert?: (record: T) => void;
  onUpdate?: (record: T) => void;
  onDelete?: (record: T) => void;
}

export interface SubscriptionResult {
  isConnected: boolean;
}

// ============================================================================
// Stub Implementations
// ============================================================================

/**
 * Stub: Track course presence (who's viewing a course)
 * Returns disconnected state until Firebase Realtime Database is integrated
 */
export function useCoursePresence(
  _courseId: string,
  _userId: string,
  _options?: PresenceOptions,
): PresenceResult {
  // Stub implementation - returns disconnected state
  return {
    users: [],
    isConnected: false,
    onlineCount: 0,
  };
}

/**
 * Stub: Monitor real-time system health
 * Returns healthy but inactive state until Firebase integration
 */
export function useRealtimeHealth(_pollInterval?: number): RealtimeHealth {
  // Stub implementation - returns healthy but inactive state
  return {
    healthy: true,
    activeChannels: 0,
    failedChannels: 0,
    reconnectAttempts: 0,
  };
}

/**
 * Stub: Get real-time performance metrics
 * Returns empty metrics until Firebase integration
 */
export function useRealtimeMetrics(_pollInterval?: number): RealtimeMetrics {
  // Stub implementation - returns empty metrics
  return {
    messageRate: 0,
    averageLatency: 0,
    uptime: 0,
  };
}

/**
 * Stub: Subscribe to real-time data changes
 * Returns disconnected state until Firestore onSnapshot is integrated
 */
export function useRealtimeSubscription<T>(
  _table: string,
  _filter: string,
  _options?: SubscriptionOptions<T>,
): SubscriptionResult {
  // Stub implementation - returns disconnected state
  return {
    isConnected: false,
  };
}
