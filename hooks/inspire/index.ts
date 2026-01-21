/**
 * INSPIRE Hooks
 *
 * Custom React hooks for INSPIRE Studio functionality.
 *
 * @module hooks/inspire
 */

export { useCoPilot } from './useCoPilot';
// Draft Locking
export {
  type LockInfo,
  type UseDraftLockOptions,
  type UseDraftLockReturn,
  useDraftLock,
} from './useDraftLock';
export { useResumeUrl } from './useResumeUrl';

// Theme Engine
export {
  generateThemeCSSVariables,
  useThemeSync,
} from './useThemeSync';
export { useWizardNavigation } from './useWizardNavigation';
