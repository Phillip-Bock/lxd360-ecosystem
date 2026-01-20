/**
 * Hooks Index
 * Central export for all custom hooks
 *
 * NOTE: Several hooks were removed during GCP migration:
 * - useAuth, useRBAC, useProjects, useQuestionBanks, useTemplates (legacy database deps)
 * - useNexusRealtime, use-realtime-optimized hooks (legacy realtime deps)
 */

// UI Hooks
export { useDebounce } from './use-debounce';
export { useIntersectionObserver } from './use-intersection-observer';
export { useIsMobile } from './use-mobile';
export type {
  PresenceOptions,
  PresenceResult,
  PresenceUser,
  RealtimeHealth,
  RealtimeMetrics,
  SubscriptionOptions,
  SubscriptionResult,
} from './use-realtime-stubs';
// Real-time Stubs (pending Firebase integration)
export {
  useCoursePresence,
  useRealtimeHealth,
  useRealtimeMetrics,
  useRealtimeSubscription,
} from './use-realtime-stubs';
export { useToast } from './use-toast';

// Feature Hooks
export { useCognitiveTracking } from './useCognitiveTracking';
export { useNotifications } from './useNotifications';
export { useSpacedRepetition } from './useSpacedRepetition';
export { useXAPITracking } from './useXAPITracking';
