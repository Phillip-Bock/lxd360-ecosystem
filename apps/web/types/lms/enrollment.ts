/**
 * Enrollment Type Definitions
 *
 * Complete type system for managing learner enrollments in the LXP360 LMS.
 * Supports self-enrollment, manager assignment, compliance tracking, and approval workflows.
 */

import { z } from 'zod';

// ============================================================================
// Enrollment Status
// ============================================================================

/**
 * Status of an enrollment through its lifecycle
 */
export type EnrollmentStatus =
  | 'pending_approval' // Awaiting manager/admin approval
  | 'approved' // Approved but not yet started
  | 'enrolled' // Active enrollment, not started
  | 'in_progress' // Learner has started the course
  | 'completed' // Successfully completed
  | 'failed' // Failed to meet requirements
  | 'expired' // Past due date without completion
  | 'withdrawn' // Learner withdrew from course
  | 'rejected'; // Enrollment request denied

/**
 * Source/origin of the enrollment
 */
export type EnrollmentSource =
  | 'self_enroll' // Learner enrolled themselves
  | 'manager_assigned' // Assigned by their manager
  | 'admin_assigned' // Assigned by admin/owner
  | 'recommendation' // From AI recommendation system
  | 'compliance' // Required compliance training
  | 'prerequisite'; // Auto-enrolled from prerequisite completion

// ============================================================================
// Core Enrollment Interface
// ============================================================================

/**
 * Complete enrollment record
 */
export interface Enrollment {
  /** Unique enrollment ID */
  id: string;

  /** Tenant/organization ID */
  tenantId: string;

  /** ID of the enrolled learner */
  learnerId: string;

  /** ID of the course */
  courseId: string;

  /** Current enrollment status */
  status: EnrollmentStatus;

  /** How the enrollment was created */
  source: EnrollmentSource;

  /** Whether approval is required before enrollment is active */
  requiresApproval: boolean;

  /** User ID of approver (if approved) */
  approvedBy?: string;

  /** Timestamp of approval */
  approvedAt?: Date;

  /** User ID who rejected (if rejected) */
  rejectedBy?: string;

  /** Timestamp of rejection */
  rejectedAt?: Date;

  /** Reason for rejection */
  rejectionReason?: string;

  /** Progress percentage (0-100) */
  progress: number;

  /** Final score (if assessment completed) */
  score?: number;

  /** Whether the learner passed */
  passed?: boolean;

  /** When the enrollment was requested */
  requestedAt: Date;

  /** When the enrollment became active */
  enrolledAt?: Date;

  /** When the learner first accessed the course */
  startedAt?: Date;

  /** When the course was completed */
  completedAt?: Date;

  /** Last time the learner accessed the course */
  lastAccessedAt?: Date;

  /** When access to the course expires */
  expiresAt?: Date;

  /** Required completion date (for compliance) */
  dueDate?: Date;

  /** User ID who assigned (for manager/admin assigned) */
  assignedBy?: string;

  /** Link to recommendation (if from recommendation) */
  recommendationId?: string;

  /** Additional notes about the enrollment */
  notes?: string;

  /** Record creation timestamp */
  createdAt: Date;

  /** Record last update timestamp */
  updatedAt: Date;
}

// ============================================================================
// Request/Response Types
// ============================================================================

/**
 * Request to create a new enrollment
 */
export interface EnrollmentRequest {
  /** Learner to enroll */
  learnerId: string;

  /** Course to enroll in */
  courseId: string;

  /** Source of enrollment */
  source: EnrollmentSource;

  /** Optional recommendation link */
  recommendationId?: string;

  /** Optional notes */
  notes?: string;
}

/**
 * Request to approve or reject an enrollment
 */
export interface EnrollmentApproval {
  /** Enrollment to approve/reject */
  enrollmentId: string;

  /** Whether to approve (true) or reject (false) */
  approved: boolean;

  /** Reason for decision (required for rejection) */
  reason?: string;
}

/**
 * Request to bulk enroll multiple learners in multiple courses
 */
export interface BulkEnrollmentRequest {
  /** Learners to enroll */
  learnerIds: string[];

  /** Courses to enroll in */
  courseIds: string[];

  /** Source of enrollment */
  source: EnrollmentSource;

  /** Optional due date (ISO string) */
  dueDate?: string;

  /** Skip approval workflow */
  bypassApproval?: boolean;
}

/**
 * Response from bulk enrollment operation
 */
export interface BulkEnrollmentResponse {
  /** Total enrollments created */
  totalCreated: number;

  /** Enrollments that failed */
  failed: Array<{
    learnerId: string;
    courseId: string;
    error: string;
  }>;

  /** IDs of successfully created enrollments */
  enrollmentIds: string[];
}

// ============================================================================
// Filter and Query Types
// ============================================================================

/**
 * Filters for querying enrollments
 */
export interface EnrollmentFilters {
  /** Filter by status */
  status?: EnrollmentStatus | EnrollmentStatus[];

  /** Filter by source */
  source?: EnrollmentSource | EnrollmentSource[];

  /** Filter by learner */
  learnerId?: string;

  /** Filter by course */
  courseId?: string;

  /** Filter by assigned manager */
  assignedBy?: string;

  /** Filter enrollments requiring approval */
  requiresApproval?: boolean;

  /** Filter by date range */
  dateRange?: {
    field: 'requestedAt' | 'enrolledAt' | 'completedAt' | 'dueDate';
    start?: string;
    end?: string;
  };

  /** Pagination */
  limit?: number;
  offset?: number;

  /** Sort options */
  sortBy?: 'requestedAt' | 'enrolledAt' | 'progress' | 'dueDate' | 'lastAccessedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated enrollment response
 */
export interface EnrollmentListResponse {
  enrollments: Enrollment[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================================================
// Progress Update Types
// ============================================================================

/**
 * Request to update enrollment progress
 */
export interface ProgressUpdate {
  /** Progress percentage (0-100) */
  progress: number;

  /** Optional score update */
  score?: number;

  /** Optional pass/fail status */
  passed?: boolean;

  /** Mark as completed */
  completed?: boolean;
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const enrollmentStatusSchema = z.enum([
  'pending_approval',
  'approved',
  'enrolled',
  'in_progress',
  'completed',
  'failed',
  'expired',
  'withdrawn',
  'rejected',
]);

export const enrollmentSourceSchema = z.enum([
  'self_enroll',
  'manager_assigned',
  'admin_assigned',
  'recommendation',
  'compliance',
  'prerequisite',
]);

export const enrollmentRequestSchema = z.object({
  learnerId: z.string().min(1, 'Learner ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  source: enrollmentSourceSchema,
  recommendationId: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const enrollmentApprovalSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  approved: z.boolean(),
  reason: z.string().max(500).optional(),
});

export const bulkEnrollmentRequestSchema = z.object({
  learnerIds: z.array(z.string().min(1)).min(1, 'At least one learner is required'),
  courseIds: z.array(z.string().min(1)).min(1, 'At least one course is required'),
  source: enrollmentSourceSchema,
  dueDate: z.string().datetime().optional(),
  bypassApproval: z.boolean().optional(),
});

export const progressUpdateSchema = z.object({
  progress: z.number().min(0).max(100),
  score: z.number().min(0).max(100).optional(),
  passed: z.boolean().optional(),
  completed: z.boolean().optional(),
});

export const enrollmentFiltersSchema = z.object({
  status: z.union([enrollmentStatusSchema, z.array(enrollmentStatusSchema)]).optional(),
  source: z.union([enrollmentSourceSchema, z.array(enrollmentSourceSchema)]).optional(),
  learnerId: z.string().optional(),
  courseId: z.string().optional(),
  assignedBy: z.string().optional(),
  requiresApproval: z.boolean().optional(),
  dateRange: z
    .object({
      field: z.enum(['requestedAt', 'enrolledAt', 'completedAt', 'dueDate']),
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional(),
    })
    .optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  sortBy: z.enum(['requestedAt', 'enrolledAt', 'progress', 'dueDate', 'lastAccessedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ============================================================================
// Type Exports from Zod Schemas
// ============================================================================

export type EnrollmentRequestInput = z.infer<typeof enrollmentRequestSchema>;
export type EnrollmentApprovalInput = z.infer<typeof enrollmentApprovalSchema>;
export type BulkEnrollmentRequestInput = z.infer<typeof bulkEnrollmentRequestSchema>;
export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;
export type EnrollmentFiltersInput = z.infer<typeof enrollmentFiltersSchema>;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Enrollment with related data (course title, learner name, etc.)
 */
export interface EnrollmentWithDetails extends Enrollment {
  courseName?: string;
  courseThumbnail?: string;
  learnerName?: string;
  learnerEmail?: string;
  learnerAvatar?: string;
  assignedByName?: string;
}

/**
 * Enrollment statistics for a course or learner
 */
export interface EnrollmentStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  expired: number;
  averageProgress: number;
  averageScore: number | null;
  completionRate: number;
}

/**
 * Manager approval queue item
 */
export interface PendingApproval {
  enrollment: EnrollmentWithDetails;
  requestedAt: Date;
  daysWaiting: number;
}
