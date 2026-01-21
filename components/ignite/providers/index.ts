/**
 * INSPIRE Ignite Context Providers
 *
 * These providers manage core learning state throughout the application:
 * - XAPIProvider: xAPI statement tracking and LRS communication
 * - AdaptiveEngineProvider: BKT mastery, cognitive load, recommendations
 * - AccessibilityProvider: WCAG 2.2 AA accessibility settings
 */

export {
  AccessibilityProvider,
  useAccessibility,
  useSkipTarget,
} from './accessibility-provider';

export {
  AdaptiveEngineProvider,
  type ContentModality,
  type FunctionalState,
  type MasteryLevel,
  useAdaptiveEngine,
} from './adaptive-engine-provider';
export { INSPIRE_EXTENSIONS, useXAPI, useXAPIVerbs, VERBS, XAPIProvider } from './xapi-provider';
