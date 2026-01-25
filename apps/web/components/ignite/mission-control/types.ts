/**
 * Mission Control Dashboard Types
 *
 * Type definitions for the NASA-grade dashboard system.
 */

import type { Role } from '@inspire/types';

// =============================================================================
// WIDGET SYSTEM TYPES
// =============================================================================

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export type WidgetCategory =
  | 'learning'
  | 'analytics'
  | 'ai'
  | 'management'
  | 'compliance'
  | 'communication'
  | 'authoring'
  | 'system';

export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  category: WidgetCategory;
  size: WidgetSize;
  roles: Role[];
  hardGate: boolean;
  defaultEnabled: boolean;
  refreshInterval?: number;
  features: string[];
}

// =============================================================================
// DASHBOARD CONTEXT
// =============================================================================

export interface DashboardContext {
  role: Role;
  tenantId: string;
  userId: string;
  enabledWidgets: string[];
  refreshInterval: number;
}

// =============================================================================
// STATS & METRICS
// =============================================================================

export interface StatMetric {
  label: string;
  value: string | number;
  icon: string;
  change?: {
    value: number;
    label: string;
  };
  color?: 'cyan' | 'purple' | 'success' | 'warning' | 'danger';
}

export interface LearnerStats {
  coursesActive: number;
  skillsMastered: number;
  learningStreak: number;
  rank: number;
}

export interface InstructorStats {
  activeCourses: number;
  totalStudents: number;
  avgCompletion: number;
  pendingReviews: number;
}

export interface ManagerStats {
  teamMembers: number;
  complianceRate: number;
  atRiskCount: number;
  roiScore: number;
}

export interface AdminStats {
  activeUsers: number;
  systemUptime: number;
  apiCallsPerMin: number;
  activeTenants: number;
}

// =============================================================================
// SKILL MASTERY
// =============================================================================

export interface SkillMasteryData {
  skillId: string;
  skillName: string;
  mastery: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

// =============================================================================
// JITAI ALERTS
// =============================================================================

export interface JITAIAlert {
  id: string;
  learnerId: string;
  learnerName: string;
  alertType: 'doom_scroll' | 'false_confidence' | 'low_engagement' | 'skill_decay';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  actionable: boolean;
}

// =============================================================================
// HEATMAP
// =============================================================================

export interface HeatmapCell {
  departmentId: string;
  departmentName: string;
  skillId: string;
  skillName: string;
  value: number;
  status: 'critical' | 'at_risk' | 'moderate' | 'strong';
}

export interface HeatmapData {
  departments: string[];
  skills: string[];
  cells: HeatmapCell[];
}

// =============================================================================
// COMPLIANCE
// =============================================================================

export interface ComplianceMetric {
  name: string;
  completionRate: number;
  expiringCount: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
}

// =============================================================================
// SYSTEM HEALTH
// =============================================================================

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  lastCheck: Date;
}

// =============================================================================
// NEURO-NAUT
// =============================================================================

export interface NeuronautMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  glassBoxExplanation?: string;
}

export interface NeuronautContext {
  role: Role;
  currentPage: string;
  recentActivity: string[];
}
