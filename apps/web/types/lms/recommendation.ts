/**
 * Recommendation Type Definitions
 *
 * Types for AI-driven course recommendations based on O*NET skill gap analysis.
 * Supports learner review, acceptance/rejection, and manager approval workflows.
 */

import { z } from 'zod';

// ============================================================================
// Recommendation Status
// ============================================================================

/**
 * Status of a recommendation through its lifecycle
 */
export type RecommendationStatus =
  | 'pending' // Awaiting learner review
  | 'accepted' // Learner accepted, may need manager approval
  | 'rejected' // Learner rejected the recommendation
  | 'pending_approval' // Awaiting manager approval
  | 'approved' // Manager approved, enrollment created
  | 'expired' // Recommendation no longer valid
  | 'enrolled'; // Successfully converted to enrollment

/**
 * Source/origin of the recommendation
 */
export type RecommendationSource =
  | 'onet_gap' // From O*NET skill gap analysis
  | 'adaptive' // From adaptive learning engine
  | 'prerequisite' // Prerequisite for another course
  | 'peer' // Based on peer learning patterns
  | 'compliance' // Compliance requirement
  | 'manager'; // Manager suggestion

/**
 * Priority level for recommendations
 */
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

// ============================================================================
// Core Recommendation Interface
// ============================================================================

/**
 * Complete recommendation record
 */
export interface Recommendation {
  /** Unique recommendation ID */
  id: string;

  /** Tenant/organization ID */
  tenantId: string;

  /** ID of the learner receiving the recommendation */
  learnerId: string;

  /** ID of the recommended course */
  courseId: string;

  /** Current recommendation status */
  status: RecommendationStatus;

  /** How the recommendation was generated */
  source: RecommendationSource;

  /** Priority level */
  priority: RecommendationPriority;

  /** Confidence score (0-1) */
  confidence: number;

  /** Human-readable explanation (Glass Box AI) */
  explanation: string;

  /** Skills this course addresses */
  targetSkills: SkillRecommendation[];

  /** Whether manager approval is required */
  requiresApproval: boolean;

  /** User ID of approver (if approved) */
  approvedBy?: string;

  /** Timestamp of approval */
  approvedAt?: Date;

  /** User ID who rejected (if rejected by manager) */
  rejectedBy?: string;

  /** Timestamp of rejection */
  rejectedAt?: Date;

  /** Reason for rejection */
  rejectionReason?: string;

  /** Learner's acceptance/rejection timestamp */
  respondedAt?: Date;

  /** Learner's feedback on rejection */
  learnerFeedback?: string;

  /** Resulting enrollment ID (if converted) */
  enrollmentId?: string;

  /** O*NET gap analysis ID (if from gap analysis) */
  gapAnalysisId?: string;

  /** Target occupation (if from gap analysis) */
  targetOccupation?: {
    code: string;
    title: string;
  };

  /** Estimated training hours */
  estimatedHours: number;

  /** Recommendation expiration date */
  expiresAt?: Date;

  /** Record creation timestamp */
  createdAt: Date;

  /** Record last update timestamp */
  updatedAt: Date;
}

/**
 * Skill targeted by a recommendation
 */
export interface SkillRecommendation {
  /** O*NET skill ID */
  skillId: string;

  /** Skill name */
  skillName: string;

  /** Current level (0-7) */
  currentLevel: number;

  /** Target level (1-7) */
  targetLevel: number;

  /** Gap to close */
  gap: number;

  /** How important this skill is (1-5) */
  importance: number;
}

// ============================================================================
// Request/Response Types
// ============================================================================

/**
 * Request to generate recommendations for a learner
 */
export interface GenerateRecommendationsRequest {
  /** Learner to generate for */
  learnerId: string;

  /** Target occupation (O*NET SOC code) */
  targetOccupation?: string;

  /** Maximum recommendations to generate */
  maxRecommendations?: number;

  /** Minimum confidence threshold */
  minConfidence?: number;
}

/**
 * Response from recommendation generation
 */
export interface GenerateRecommendationsResponse {
  /** Generated recommendations */
  recommendations: Recommendation[];

  /** Total skill gaps identified */
  totalGaps: number;

  /** Overall readiness score */
  readinessScore: number;

  /** Estimated total training hours */
  totalEstimatedHours: number;
}

/**
 * Request to accept or reject a recommendation
 */
export interface RecommendationResponse {
  /** Recommendation ID */
  recommendationId: string;

  /** Whether to accept (true) or reject (false) */
  accepted: boolean;

  /** Feedback if rejected */
  feedback?: string;
}

/**
 * Manager approval request
 */
export interface RecommendationApproval {
  /** Recommendation ID */
  recommendationId: string;

  /** Whether to approve (true) or reject (false) */
  approved: boolean;

  /** Reason for decision (required for rejection) */
  reason?: string;
}

// ============================================================================
// Filter and Query Types
// ============================================================================

/**
 * Filters for querying recommendations
 */
export interface RecommendationFilters {
  /** Filter by status */
  status?: RecommendationStatus | RecommendationStatus[];

  /** Filter by source */
  source?: RecommendationSource | RecommendationSource[];

  /** Filter by priority */
  priority?: RecommendationPriority | RecommendationPriority[];

  /** Filter by learner */
  learnerId?: string;

  /** Filter by course */
  courseId?: string;

  /** Filter requiring approval */
  requiresApproval?: boolean;

  /** Minimum confidence score */
  minConfidence?: number;

  /** Include expired recommendations */
  includeExpired?: boolean;

  /** Pagination */
  limit?: number;
  offset?: number;

  /** Sort options */
  sortBy?: 'createdAt' | 'priority' | 'confidence' | 'expiresAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated recommendation response
 */
export interface RecommendationListResponse {
  recommendations: Recommendation[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const recommendationStatusSchema = z.enum([
  'pending',
  'accepted',
  'rejected',
  'pending_approval',
  'approved',
  'expired',
  'enrolled',
]);

export const recommendationSourceSchema = z.enum([
  'onet_gap',
  'adaptive',
  'prerequisite',
  'peer',
  'compliance',
  'manager',
]);

export const recommendationPrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);

export const skillRecommendationSchema = z.object({
  skillId: z.string().min(1),
  skillName: z.string().min(1),
  currentLevel: z.number().min(0).max(7),
  targetLevel: z.number().min(1).max(7),
  gap: z.number().min(0),
  importance: z.number().min(1).max(5),
});

export const generateRecommendationsRequestSchema = z.object({
  learnerId: z.string().min(1, 'Learner ID is required'),
  targetOccupation: z.string().optional(),
  maxRecommendations: z.number().min(1).max(20).optional().default(5),
  minConfidence: z.number().min(0).max(1).optional().default(0.5),
});

export const recommendationResponseSchema = z.object({
  recommendationId: z.string().min(1, 'Recommendation ID is required'),
  accepted: z.boolean(),
  feedback: z.string().max(500).optional(),
});

export const recommendationApprovalSchema = z.object({
  recommendationId: z.string().min(1, 'Recommendation ID is required'),
  approved: z.boolean(),
  reason: z.string().max(500).optional(),
});

export const recommendationFiltersSchema = z.object({
  status: z.union([recommendationStatusSchema, z.array(recommendationStatusSchema)]).optional(),
  source: z.union([recommendationSourceSchema, z.array(recommendationSourceSchema)]).optional(),
  priority: z
    .union([recommendationPrioritySchema, z.array(recommendationPrioritySchema)])
    .optional(),
  learnerId: z.string().optional(),
  courseId: z.string().optional(),
  requiresApproval: z.boolean().optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  includeExpired: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  sortBy: z.enum(['createdAt', 'priority', 'confidence', 'expiresAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ============================================================================
// Type Exports from Zod Schemas
// ============================================================================

export type GenerateRecommendationsRequestInput = z.infer<
  typeof generateRecommendationsRequestSchema
>;
export type RecommendationResponseInput = z.infer<typeof recommendationResponseSchema>;
export type RecommendationApprovalInput = z.infer<typeof recommendationApprovalSchema>;
export type RecommendationFiltersInput = z.infer<typeof recommendationFiltersSchema>;
export type SkillRecommendationInput = z.infer<typeof skillRecommendationSchema>;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Recommendation with related data (course title, learner name, etc.)
 */
export interface RecommendationWithDetails extends Recommendation {
  courseName?: string;
  courseThumbnail?: string;
  courseDescription?: string;
  courseDuration?: number;
  learnerName?: string;
  learnerEmail?: string;
  learnerAvatar?: string;
  approvedByName?: string;
}

/**
 * Summary statistics for recommendations
 */
export interface RecommendationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  pendingApproval: number;
  enrolled: number;
  expired: number;
  averageConfidence: number;
  acceptanceRate: number;
  conversionRate: number;
}

/**
 * Manager approval queue item
 */
export interface PendingRecommendationApproval {
  recommendation: RecommendationWithDetails;
  requestedAt: Date;
  daysWaiting: number;
}
