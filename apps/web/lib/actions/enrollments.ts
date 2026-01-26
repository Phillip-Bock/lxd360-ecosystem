'use server';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import {
  type BulkEnrollmentResponse,
  bulkEnrollmentRequestSchema,
  type Enrollment,
  type EnrollmentStats,
  enrollmentApprovalSchema,
  enrollmentRequestSchema,
  progressUpdateSchema,
} from '@/types/lms/enrollment';

const log = logger.child({ module: 'actions-enrollments' });

// ============================================================================
// Types
// ============================================================================

type ActionResult<T = unknown> = { error: string } | { data: T };

interface AuthUser {
  uid: string;
  tenantId: string;
  persona: string;
}

// ============================================================================
// Auth Helper
// ============================================================================

async function getAuthenticatedUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      log.warn('No session cookie found');
      return null;
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const tenantId = decodedToken.tenantId as string | undefined;
    const persona = (decodedToken.persona as string) || (decodedToken.role as string) || 'learner';

    if (!tenantId) {
      log.warn('User has no tenantId in token', { uid: decodedToken.uid });
      return null;
    }

    return { uid: decodedToken.uid, tenantId, persona };
  } catch (error) {
    log.error('Failed to verify session', { error });
    return null;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function firestoreToEnrollment(id: string, data: FirebaseFirestore.DocumentData): Enrollment {
  return {
    id,
    tenantId: data.tenantId,
    learnerId: data.learnerId,
    courseId: data.courseId,
    status: data.status,
    source: data.source,
    requiresApproval: data.requiresApproval || false,
    approvedBy: data.approvedBy,
    approvedAt: data.approvedAt?.toDate?.() || undefined,
    rejectedBy: data.rejectedBy,
    rejectedAt: data.rejectedAt?.toDate?.() || undefined,
    rejectionReason: data.rejectionReason,
    progress: data.progress || 0,
    score: data.score,
    passed: data.passed,
    requestedAt: data.requestedAt?.toDate?.() || new Date(),
    enrolledAt: data.enrolledAt?.toDate?.() || undefined,
    startedAt: data.startedAt?.toDate?.() || undefined,
    completedAt: data.completedAt?.toDate?.() || undefined,
    lastAccessedAt: data.lastAccessedAt?.toDate?.() || undefined,
    expiresAt: data.expiresAt?.toDate?.() || undefined,
    dueDate: data.dueDate?.toDate?.() || undefined,
    assignedBy: data.assignedBy,
    recommendationId: data.recommendationId,
    notes: data.notes,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
}

// ============================================================================
// Enrollment Actions
// ============================================================================

/**
 * Request enrollment in a course (self-enrollment or assignment)
 */
export async function requestEnrollment(
  learnerId: string,
  courseId: string,
  source:
    | 'self_enroll'
    | 'manager_assigned'
    | 'admin_assigned'
    | 'recommendation'
    | 'compliance'
    | 'prerequisite',
  options?: { recommendationId?: string; notes?: string },
): Promise<ActionResult<{ enrollmentId: string; status: string }>> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    // Validate input
    const validationResult = enrollmentRequestSchema.safeParse({
      learnerId,
      courseId,
      source,
      ...options,
    });

    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid enrollment data',
      };
    }

    const { tenantId, uid, persona } = authUser;

    // RBAC: Check permissions
    const isSelfEnrollment = learnerId === uid;
    const canAssignOthers = ['owner', 'manager', 'editor'].includes(persona);

    if (!isSelfEnrollment && !canAssignOthers) {
      return { error: 'Forbidden: You cannot enroll other users' };
    }

    // Check for existing enrollment
    const existingSnapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .where('learnerId', '==', learnerId)
      .where('courseId', '==', courseId)
      .where('status', 'not-in', ['withdrawn', 'rejected', 'expired', 'failed'])
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return { error: 'Learner is already enrolled in this course' };
    }

    // Get course to check enrollment settings
    const courseDoc = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('courses')
      .doc(courseId)
      .get();

    if (!courseDoc.exists) {
      return { error: 'Course not found' };
    }

    const courseData = courseDoc.data();
    const requiresApproval =
      courseData?.enrollmentSettings?.approvalRequired &&
      source === 'self_enroll' &&
      !['owner', 'manager'].includes(persona);

    const initialStatus = requiresApproval ? 'pending_approval' : 'enrolled';

    // Create enrollment
    const enrollmentRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .doc();

    const enrollmentData = {
      tenantId,
      learnerId,
      courseId,
      status: initialStatus,
      source,
      requiresApproval: requiresApproval || false,
      progress: 0,
      requestedAt: FieldValue.serverTimestamp(),
      ...(initialStatus === 'enrolled' && { enrolledAt: FieldValue.serverTimestamp() }),
      ...(!isSelfEnrollment && { assignedBy: uid }),
      ...(options?.recommendationId && { recommendationId: options.recommendationId }),
      ...(options?.notes && { notes: options.notes }),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await enrollmentRef.set(enrollmentData);

    log.info('Enrollment created via action', {
      enrollmentId: enrollmentRef.id,
      learnerId,
      courseId,
      status: initialStatus,
      tenantId,
    });

    revalidatePath('/ignite/courses');
    revalidatePath('/ignite/learners');
    revalidatePath('/ignite/learn');

    return {
      data: {
        enrollmentId: enrollmentRef.id,
        status: initialStatus,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to request enrollment', { error: errorMessage });
    return { error: `Failed to request enrollment: ${errorMessage}` };
  }
}

/**
 * Approve or reject a pending enrollment
 */
export async function approveEnrollment(
  enrollmentId: string,
  approved: boolean,
  reason?: string,
): Promise<ActionResult<{ status: string }>> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    // Validate input
    const validationResult = enrollmentApprovalSchema.safeParse({
      enrollmentId,
      approved,
      reason,
    });

    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid approval data',
      };
    }

    const { tenantId, uid, persona } = authUser;

    // RBAC: Only owners and managers can approve
    if (!['owner', 'manager'].includes(persona)) {
      return { error: 'Forbidden: You cannot approve enrollments' };
    }

    // Get enrollment
    const enrollmentRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .doc(enrollmentId);

    const enrollmentDoc = await enrollmentRef.get();

    if (!enrollmentDoc.exists) {
      return { error: 'Enrollment not found' };
    }

    const existingData = enrollmentDoc.data();

    if (existingData?.status !== 'pending_approval') {
      return { error: `Enrollment is not pending approval. Status: ${existingData?.status}` };
    }

    // Apply approval/rejection
    if (approved) {
      await enrollmentRef.update({
        status: 'enrolled',
        approvedBy: uid,
        approvedAt: FieldValue.serverTimestamp(),
        enrolledAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      log.info('Enrollment approved via action', { enrollmentId, approvedBy: uid, tenantId });

      revalidatePath('/ignite/courses');
      revalidatePath('/ignite/learners');

      return { data: { status: 'enrolled' } };
    } else {
      if (!reason) {
        return { error: 'Rejection reason is required' };
      }

      await enrollmentRef.update({
        status: 'rejected',
        rejectedBy: uid,
        rejectedAt: FieldValue.serverTimestamp(),
        rejectionReason: reason,
        updatedAt: FieldValue.serverTimestamp(),
      });

      log.info('Enrollment rejected via action', {
        enrollmentId,
        rejectedBy: uid,
        reason,
        tenantId,
      });

      revalidatePath('/ignite/courses');
      revalidatePath('/ignite/learners');

      return { data: { status: 'rejected' } };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to approve enrollment', { error: errorMessage });
    return { error: `Failed to process approval: ${errorMessage}` };
  }
}

/**
 * Withdraw from an enrollment
 */
export async function withdrawEnrollment(
  enrollmentId: string,
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    const { tenantId, uid, persona } = authUser;

    // Get enrollment
    const enrollmentRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .doc(enrollmentId);

    const enrollmentDoc = await enrollmentRef.get();

    if (!enrollmentDoc.exists) {
      return { error: 'Enrollment not found' };
    }

    const existingData = enrollmentDoc.data();

    // RBAC: Check access
    const isOwnEnrollment = existingData?.learnerId === uid;
    const canManage = ['owner', 'manager'].includes(persona);

    if (!isOwnEnrollment && !canManage) {
      return { error: 'Forbidden: You cannot withdraw from this enrollment' };
    }

    // Check if can be withdrawn
    const nonWithdrawableStatuses = ['completed', 'withdrawn', 'rejected'];
    if (nonWithdrawableStatuses.includes(existingData?.status)) {
      return { error: `Cannot withdraw from enrollment with status: ${existingData?.status}` };
    }

    // Mark as withdrawn
    await enrollmentRef.update({
      status: 'withdrawn',
      withdrawnAt: FieldValue.serverTimestamp(),
      withdrawnBy: uid,
      updatedAt: FieldValue.serverTimestamp(),
    });

    log.info('Enrollment withdrawn via action', { enrollmentId, withdrawnBy: uid, tenantId });

    revalidatePath('/ignite/courses');
    revalidatePath('/ignite/learn');

    return { data: { success: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to withdraw enrollment', { error: errorMessage });
    return { error: `Failed to withdraw: ${errorMessage}` };
  }
}

/**
 * Bulk enroll multiple learners in multiple courses
 */
export async function bulkEnroll(
  learnerIds: string[],
  courseIds: string[],
  source: 'manager_assigned' | 'admin_assigned' | 'compliance',
  options?: { dueDate?: string; bypassApproval?: boolean },
): Promise<ActionResult<BulkEnrollmentResponse>> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    // Validate input
    const validationResult = bulkEnrollmentRequestSchema.safeParse({
      learnerIds,
      courseIds,
      source,
      ...options,
    });

    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid bulk enrollment data',
      };
    }

    const { tenantId, uid, persona } = authUser;

    // RBAC: Only owners and managers can bulk enroll
    if (!['owner', 'manager'].includes(persona)) {
      return { error: 'Forbidden: You cannot bulk enroll learners' };
    }

    // Check limit
    const totalEnrollments = learnerIds.length * courseIds.length;
    if (totalEnrollments > 500) {
      return { error: `Maximum 500 enrollments per request. Requested: ${totalEnrollments}` };
    }

    // Verify courses exist
    const courseDocs = await Promise.all(
      courseIds.map((id) =>
        adminDb.collection('tenants').doc(tenantId).collection('courses').doc(id).get(),
      ),
    );

    const validCourseIds = new Set<string>();
    const invalidCourseIds: string[] = [];

    courseDocs.forEach((doc, index) => {
      if (doc.exists) {
        validCourseIds.add(courseIds[index]);
      } else {
        invalidCourseIds.push(courseIds[index]);
      }
    });

    if (invalidCourseIds.length > 0) {
      return { error: `Courses not found: ${invalidCourseIds.join(', ')}` };
    }

    // Create enrollments
    const response: BulkEnrollmentResponse = {
      totalCreated: 0,
      failed: [],
      enrollmentIds: [],
    };

    const batch = adminDb.batch();

    for (const learnerId of learnerIds) {
      for (const courseId of courseIds) {
        const enrollmentRef = adminDb
          .collection('tenants')
          .doc(tenantId)
          .collection('enrollments')
          .doc();

        const enrollmentData = {
          tenantId,
          learnerId,
          courseId,
          status: 'enrolled',
          source,
          requiresApproval: false,
          progress: 0,
          requestedAt: FieldValue.serverTimestamp(),
          enrolledAt: FieldValue.serverTimestamp(),
          assignedBy: uid,
          ...(options?.dueDate && { dueDate: new Date(options.dueDate) }),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        batch.set(enrollmentRef, enrollmentData);
        response.enrollmentIds.push(enrollmentRef.id);
        response.totalCreated++;
      }
    }

    await batch.commit();

    log.info('Bulk enrollment completed via action', {
      tenantId,
      uid,
      totalCreated: response.totalCreated,
    });

    revalidatePath('/ignite/courses');
    revalidatePath('/ignite/learners');

    return { data: response };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to bulk enroll', { error: errorMessage });
    return { error: `Failed to bulk enroll: ${errorMessage}` };
  }
}

/**
 * Get all pending approvals for the current user (manager/owner)
 */
export async function getPendingApprovals(): Promise<
  ActionResult<{ enrollments: Enrollment[]; total: number }>
> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    const { tenantId, persona } = authUser;

    // RBAC: Only owners and managers can view pending approvals
    if (!['owner', 'manager'].includes(persona)) {
      return { error: 'Forbidden: You cannot view pending approvals' };
    }

    const snapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .where('status', '==', 'pending_approval')
      .orderBy('requestedAt', 'desc')
      .limit(100)
      .get();

    const enrollments = snapshot.docs.map((doc) => firestoreToEnrollment(doc.id, doc.data()));

    return { data: { enrollments, total: enrollments.length } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get pending approvals', { error: errorMessage });
    return { error: `Failed to get pending approvals: ${errorMessage}` };
  }
}

/**
 * Get enrollments for the current user (learner view)
 */
export async function getMyEnrollments(): Promise<ActionResult<{ enrollments: Enrollment[] }>> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    const { tenantId, uid } = authUser;

    const snapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .where('learnerId', '==', uid)
      .orderBy('requestedAt', 'desc')
      .get();

    const enrollments = snapshot.docs.map((doc) => firestoreToEnrollment(doc.id, doc.data()));

    return { data: { enrollments } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get my enrollments', { error: errorMessage });
    return { error: `Failed to get enrollments: ${errorMessage}` };
  }
}

/**
 * Update progress on an enrollment
 */
export async function updateProgress(
  enrollmentId: string,
  progress: number,
  options?: { score?: number; passed?: boolean; completed?: boolean },
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    // Validate input
    const validationResult = progressUpdateSchema.safeParse({
      progress,
      ...options,
    });

    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid progress data',
      };
    }

    const { tenantId, uid, persona } = authUser;

    // Get enrollment
    const enrollmentRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .doc(enrollmentId);

    const enrollmentDoc = await enrollmentRef.get();

    if (!enrollmentDoc.exists) {
      return { error: 'Enrollment not found' };
    }

    const existingData = enrollmentDoc.data();

    // RBAC: Check access
    const isOwnEnrollment = existingData?.learnerId === uid;
    const canManage = ['owner', 'manager'].includes(persona);

    if (!isOwnEnrollment && !canManage) {
      return { error: 'Forbidden: You cannot update this enrollment' };
    }

    // Build update
    const updateData: Record<string, unknown> = {
      progress,
      lastAccessedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Auto-transition to in_progress
    if (progress > 0 && existingData?.status === 'enrolled' && !existingData?.startedAt) {
      updateData.status = 'in_progress';
      updateData.startedAt = FieldValue.serverTimestamp();
    }

    if (options?.score !== undefined) {
      updateData.score = options.score;
    }

    if (options?.passed !== undefined) {
      updateData.passed = options.passed;
    }

    if (options?.completed) {
      updateData.status = options.passed === false ? 'failed' : 'completed';
      updateData.completedAt = FieldValue.serverTimestamp();
      updateData.progress = 100;
    }

    await enrollmentRef.update(updateData);

    log.info('Progress updated via action', { enrollmentId, progress, tenantId });

    revalidatePath('/ignite/learn');

    return { data: { success: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to update progress', { error: errorMessage });
    return { error: `Failed to update progress: ${errorMessage}` };
  }
}

/**
 * Get enrollment statistics for a course
 */
export async function getEnrollmentStats(courseId: string): Promise<ActionResult<EnrollmentStats>> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    const { tenantId, persona } = authUser;

    // RBAC: Only non-learners can view stats
    if (persona === 'learner') {
      return { error: 'Forbidden: You cannot view enrollment statistics' };
    }

    const snapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .where('courseId', '==', courseId)
      .get();

    let total = 0;
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let failed = 0;
    let expired = 0;
    let totalProgress = 0;
    let totalScore = 0;
    let scoreCount = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      total++;
      totalProgress += data.progress || 0;

      if (data.score !== undefined) {
        totalScore += data.score;
        scoreCount++;
      }

      switch (data.status) {
        case 'pending_approval':
          pending++;
          break;
        case 'enrolled':
        case 'in_progress':
          inProgress++;
          break;
        case 'completed':
          completed++;
          break;
        case 'failed':
          failed++;
          break;
        case 'expired':
          expired++;
          break;
      }
    });

    const stats: EnrollmentStats = {
      total,
      pending,
      inProgress,
      completed,
      failed,
      expired,
      averageProgress: total > 0 ? Math.round(totalProgress / total) : 0,
      averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : null,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };

    return { data: stats };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get enrollment stats', { error: errorMessage });
    return { error: `Failed to get statistics: ${errorMessage}` };
  }
}
