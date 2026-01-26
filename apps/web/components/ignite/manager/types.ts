/**
 * Manager Dashboard Types
 *
 * Type definitions for the Manager persona dashboard components.
 * These types support team oversight, compliance tracking, and learner management.
 */

/** Team member data for manager oversight */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  coursesAssigned: number;
  coursesCompleted: number;
  completionRate: number;
  lastActive: Date;
  overdueCount: number;
}

/** Compliance status tracking */
export interface ComplianceStatus {
  category: string;
  required: number;
  completed: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  dueDate?: Date;
}

/** Due date item for tracking upcoming deadlines */
export interface DueDateItem {
  id: string;
  title: string;
  courseTitle: string;
  learnerName: string;
  learnerId: string;
  dueDate: Date;
  isOverdue: boolean;
}

/** Team statistics for KPI display */
export interface TeamStats {
  totalLearners: number;
  learnersChange: number;
  avgCompletionRate: number;
  completionChange: number;
  avgScore: number;
  scoreChange: number;
  overdueAssignments: number;
  overdueChange: number;
  complianceRate: number;
  complianceChange: number;
}
