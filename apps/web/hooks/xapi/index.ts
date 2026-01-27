/**
 * =============================================================================
 * INSPIRE Studio - xAPI Hooks Index
 * =============================================================================
 */

// Podcast Mode Tracking (Modality Switches)
export type { PodcastModeTrackingConfig } from '../use-podcast-mode-tracking';
export { usePodcastModeTracking } from '../use-podcast-mode-tracking';
// xAPI Emitter Hook (Singleton Pattern)
export type {
  ActivityContext,
  ActorContext,
  UseXAPIEmitterOptions,
  UseXAPIEmitterReturn,
} from '../use-xapi-emitter';
export { useXAPIEmitter, useXAPIFocusTracking } from '../use-xapi-emitter';
export {
  useBlockEventHandler,
  useInteractionTracking,
  useMediaTracking,
  useProgressTracking,
  useQuestionTracking,
  useQuizTracking,
  useSlideTracking,
  useXAPI,
  useXAPIOptional,
  useXAPISession,
} from './use-xapi';
