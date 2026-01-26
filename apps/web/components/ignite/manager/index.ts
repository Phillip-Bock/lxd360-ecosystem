/**
 * Manager Dashboard Components
 *
 * Components for the Manager persona dashboard.
 * Provides team oversight, compliance tracking, and learner management.
 */

export { ComplianceWidget, type ComplianceWidgetProps } from './ComplianceWidget';
export { DueDatesList, type DueDatesListProps } from './DueDatesList';
export { TeamProgressTable, type TeamProgressTableProps } from './TeamProgressTable';
export { TeamStatsCard, type TeamStatsCardProps } from './TeamStatsCard';
export type {
  ComplianceStatus,
  DueDateItem,
  TeamMember,
  TeamStats,
} from './types';
