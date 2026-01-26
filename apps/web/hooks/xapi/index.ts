/**
 * =============================================================================
 * INSPIRE Studio - xAPI Hooks Index
 * =============================================================================
 */

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
