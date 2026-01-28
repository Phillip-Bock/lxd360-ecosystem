// Main component
export {
  AccessibilityChecker,
  default as AccessibilityCheckerDefault,
} from './accessibility-checker';
export { AccessibilityMarkers } from './accessibility-markers';
// Sub-components
export { AccessibilityPanel } from './accessibility-panel';
// Utilities
export {
  downloadEARLReport,
  downloadHTMLReport,
  generateEARLReport,
  generateHTMLReport,
} from './earlReportGenerator';
// Types
export type {
  AccessibilityAuditOptions,
  AccessibilityAuditState,
  AxeCheckResult,
  AxeNodeResult,
  AxeResult,
  AxeViolation,
  EARLAssertion,
  EARLReport,
  EARLResult,
  EARLSubject,
  EARLTest,
  TagFilter,
  ViolationImpact,
  ViolationWithElement,
} from './types';
export { IMPACT_COLORS, IMPACT_PRIORITY, TAG_LABELS } from './types';
// Hooks
export { useAccessibilityAudit } from './useAccessibilityAudit';
