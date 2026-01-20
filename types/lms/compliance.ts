/**
 * Compliance and certification tracking type definitions
 */

export type ComplianceStatus =
  | 'compliant'
  | 'at-risk'
  | 'non-compliant'
  | 'expired'
  | 'pending'
  | 'exempt';

export type ComplianceType =
  | 'annual'
  | 'one-time'
  | 'recurring'
  | 'certification'
  | 'onboarding'
  | 'regulatory'
  | 'safety';

export type RegulatoryBody =
  | 'OSHA'
  | 'HIPAA'
  | 'FDA'
  | 'FAA'
  | 'DOT'
  | 'EPA'
  | 'SEC'
  | 'FINRA'
  | 'PCI'
  | 'GDPR'
  | 'SOX'
  | 'ITAR'
  | 'ISO'
  | 'CMMC'
  | 'custom';

export interface ComplianceRequirement {
  id: string;
  name: string;
  code: string;
  description: string;
  type: ComplianceType;
  regulatoryBody?: RegulatoryBody;
  // Timing
  frequency: number | null; // days, null = one-time
  gracePeriod: number; // days
  expirationWarningDays: number[];
  // Content
  courseId?: string;
  pathId?: string;
  assessmentId?: string;
  // Applicability
  applicableTo: {
    all: boolean;
    departments?: string[];
    roles?: string[];
    locations?: string[];
    teams?: string[];
    jobTitles?: string[];
  };
  // Exemptions
  exemptionRoles?: string[];
  exemptionProcess?: string;
  // Completion
  passingScore?: number;
  attemptsAllowed?: number;
  // Consequences
  consequence?: string;
  escalationPath?: string[];
  autoSuspend?: boolean;
  suspendAfterDays?: number;
  // Metadata
  effectiveDate: string;
  retirementDate?: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearnerComplianceRecord {
  id: string;
  learnerId: string;
  requirementId: string;
  requirement: ComplianceRequirement;
  // Status
  status: ComplianceStatus;
  // Dates
  assignedAt: string;
  dueDate: string;
  gracePeriodEnd?: string;
  completedAt?: string;
  expiresAt?: string;
  lastReminderAt?: string;
  // Progress
  enrollmentId?: string;
  progress: number;
  attempts: number;
  // Results
  score?: number;
  passed?: boolean;
  certificateId?: string;
  // Exemption
  isExempt: boolean;
  exemptionReason?: string;
  exemptedBy?: string;
  exemptedAt?: string;
  exemptionExpires?: string;
}

export interface ComplianceDashboard {
  organizationId: string;
  overallCompliance: number;
  totalRequirements: number;
  totalLearners: number;
  // Status breakdown
  compliant: number;
  atRisk: number;
  nonCompliant: number;
  expired: number;
  pending: number;
  exempt: number;
  // By requirement
  requirementStats: RequirementStat[];
  // By department
  departmentStats: DepartmentComplianceStat[];
  // Trends
  complianceTrend: ComplianceTrendPoint[];
  // Alerts
  upcomingDeadlines: UpcomingDeadline[];
  overdueAssignments: OverdueAssignment[];
  // Generated
  generatedAt: string;
}

export interface RequirementStat {
  requirementId: string;
  requirementName: string;
  regulatoryBody?: string;
  totalAssigned: number;
  compliant: number;
  atRisk: number;
  nonCompliant: number;
  complianceRate: number;
  averageScore?: number;
  nextDeadline?: string;
}

export interface DepartmentComplianceStat {
  departmentId: string;
  departmentName: string;
  learnerCount: number;
  complianceRate: number;
  atRiskCount: number;
  overdueCount: number;
  requirements: RequirementStat[];
}

export interface ComplianceTrendPoint {
  date: string;
  complianceRate: number;
  compliant: number;
  nonCompliant: number;
}

export interface UpcomingDeadline {
  requirementId: string;
  requirementName: string;
  learnerId: string;
  learnerName: string;
  dueDate: string;
  daysRemaining: number;
  status: ComplianceStatus;
}

export interface OverdueAssignment {
  requirementId: string;
  requirementName: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  managerId?: string;
  managerName?: string;
  dueDate: string;
  daysOverdue: number;
  gracePeriodEnd?: string;
  consequence?: string;
}

export interface ComplianceAuditLog {
  id: string;
  requirementId: string;
  learnerId?: string;
  action: ComplianceAction;
  actor: string;
  actorRole: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}

export type ComplianceAction =
  | 'requirement_created'
  | 'requirement_updated'
  | 'requirement_retired'
  | 'assigned'
  | 'completed'
  | 'expired'
  | 'exempted'
  | 'exemption_revoked'
  | 'reminder_sent'
  | 'escalated'
  | 'certificate_issued'
  | 'certificate_revoked';

export interface ComplianceReminder {
  id: string;
  type: 'upcoming' | 'overdue' | 'expiring';
  recipientId: string;
  recipientEmail: string;
  requirementId: string;
  requirementName: string;
  dueDate: string;
  scheduledFor: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface ComplianceReport {
  id: string;
  name: string;
  type: 'status' | 'completion' | 'audit' | 'expiration' | 'custom';
  filters: {
    requirements?: string[];
    departments?: string[];
    statuses?: ComplianceStatus[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  columns: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    recipients: string[];
  };
  lastRunAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface ComplianceAutomation {
  id: string;
  name: string;
  description?: string;
  trigger: {
    type:
      | 'user_created'
      | 'role_assigned'
      | 'department_changed'
      | 'date'
      | 'certification_expired';
    conditions: Record<string, unknown>;
  };
  actions: {
    type: 'assign_course' | 'assign_path' | 'send_notification' | 'update_status';
    config: Record<string, unknown>;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
}
