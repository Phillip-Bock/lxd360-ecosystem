/**
 * =============================================================================
 * LXP360-SaaS | Interaction Ribbon - Index
 * =============================================================================
 *
 * @fileoverview Central export for interaction ribbon components
 *
 * =============================================================================
 */

export type { ConnectionTestResult, ConnectionTestState } from './connection-utils';
// Connection Utilities
export {
  getQuickConnectionStatus,
  getStatusBgColor,
  getStatusColor,
  getStatusDescription,
  getStatusPriority,
  isOperational,
  sortByStatus,
  useConnectionTest,
} from './connection-utils';

// Status Components
export {
  IntegrationQuickStatus,
  IntegrationStatusBadge,
  IntegrationStatusPanel,
} from './integration-status';
// Tool Registry
export {
  getAllTools,
  getToolById,
  getToolConfig,
  getToolsByCategory,
  getToolsByIntegration,
  RIBBON_CATEGORIES,
  RIBBON_TOOLS,
} from './tool-registry';
// Types
export * from './types';
