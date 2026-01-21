/**
 * xAPI UI Components - Phase 16
 *
 * Complete xAPI configuration panel including:
 * - LRS connection testing
 * - Statement preview with JSON view
 * - Profile selector (xAPI, cmi5, SCORM-to-xAPI)
 * - Custom statement builder UI
 */

// LRS Connection Testing
export { LRSConnectionBadge, LRSConnectionTester } from './lrs-connection-tester';
// Profile Selector
export {
  DEFAULT_PROFILE_CONFIG,
  ProfileSelector,
  type XAPIProfileConfig,
  type XAPIProfileType,
} from './profile-selector';
// Queue Status
export { QueueIndicator, QueueStatus } from './queue-status';
// Statement Builder
export { StatementBuilder } from './statement-builder';
// Statement Preview
export { SAMPLE_STATEMENTS, StatementPreview } from './statement-preview';

// Unified Config Panel
export { default as XAPIConfigPanelDefault, XAPIConfigPanel } from './xapi-config-panel';
