/**
 * Manager Dashboard Components
 *
 * Components for the Manager persona dashboard.
 * Provides team oversight, compliance tracking, and learner management.
 */

export { type ApprovalItem, ApprovalQueue, type ApprovalQueueProps } from './approval-queue';
export { ComplianceWidget, type ComplianceWidgetProps } from './compliance-widget';
export { DueDatesList, type DueDatesListProps } from './due-dates-list';
export { type QuickActionItem, QuickActions, type QuickActionsProps } from './quick-actions';
export { TeamOverviewCard, type TeamOverviewCardProps } from './team-overview-card';
export { TeamProgressTable, type TeamProgressTableProps } from './team-progress-table';
export { TeamStatsCard, type TeamStatsCardProps } from './team-stats-card';
export type {
  ComplianceStatus,
  DueDateItem,
  TeamMember,
  TeamStats,
} from './types';
