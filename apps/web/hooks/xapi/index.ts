/**
 * =============================================================================
 * INSPIRE Studio - xAPI Hooks Index
 * =============================================================================
 */

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

// xAPI Emitter Hook (Singleton Pattern)
export type {
  ActorContext,
  ActivityContext,
  UseXAPIEmitterOptions,
  UseXAPIEmitterReturn,
} from '../use-xapi-emitter';

export { useXAPIEmitter, useXAPIFocusTracking } from '../use-xapi-emitter';
