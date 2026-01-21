// =============================================================================
// INSPIRE Studio Audit Module
// =============================================================================
// Exports audit phase components and types for INSPIRE methodology compliance,
// learning design validation, and quality assurance.
// =============================================================================

// Components
export { AuditDashboard } from './AuditDashboard';
// Types
export type {
  AccessibilityReport,
  AuditCategory,
  AuditConfig,
  AuditIssue,
  AuditSeverity,
  AuditStatus,
  CognitiveLoadReport,
  ComplianceReport,
  ContentQualityReport,
  InspireAuditReport,
  LearningDesignReport,
  MediaOptimizationReport,
  XAPITrackingReport,
} from './types';
export {
  AuditCategorySchema,
  AuditSeveritySchema,
  AuditStatusSchema,
  calculateOverallScore,
  getAuditCategoryDescription,
  getAuditCategoryLabel,
  getDefaultAuditConfig,
  getSeverityWeight,
  getStatusFromScore,
} from './types';
