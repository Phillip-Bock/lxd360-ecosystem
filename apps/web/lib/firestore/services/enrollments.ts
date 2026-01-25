import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { requireDb } from '@/lib/firebase/client';
import { logger } from '@/lib/logger';
import type { Enrollment, EnrollmentSource, EnrollmentStatus } from '@/types/lms/progress';

const log = logger.scope('Enrollments');

// =============================================================================
// COLLECTION HELPERS
// =============================================================================

const COLLECTION_NAME = 'enrollments';

function enrollmentsCollection(organizationId: string) {
  return collection(requireDb(), 'organizations', organizationId, COLLECTION_NAME);
}

function enrollmentRef(organizationId: string, enrollmentId: string) {
  return doc(requireDb(), 'organizations', organizationId, COLLECTION_NAME, enrollmentId);
}

// =============================================================================
// TYPES
// =============================================================================

export interface EnrollmentFilters {
  status?: EnrollmentStatus;
  courseId?: string;
  learnerId?: string;
  source?: EnrollmentSource;
  isRequired?: boolean;
}

export interface PaginationOptions {
  limit?: number;
  cursor?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface CreateEnrollmentInput {
  learnerId: string;
  courseId: string;
  source: EnrollmentSource;
  assignedBy?: string;
  dueDate?: string;
  isRequired?: boolean;
  complianceDeadline?: string;
}

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get a single enrollment by ID
 */
export async function getEnrollment(
  organizationId: string,
  enrollmentId: string,
): Promise<Enrollment | null> {
  try {
    const docRef = enrollmentRef(organizationId, enrollmentId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as Enrollment;
  } catch (error) {
    log.error('Failed to get enrollment', error, { organizationId, enrollmentId });
    throw new Error(`Failed to get enrollment: ${enrollmentId}`);
  }
}

/**
 * Get enrollments for a learner
 */
export async function getLearnerEnrollments(
  organizationId: string,
  learnerId: string,
  status?: EnrollmentStatus,
): Promise<Enrollment[]> {
  try {
    const enrollmentsRef = enrollmentsCollection(organizationId);
    let q = query(
      enrollmentsRef,
      where('learnerId', '==', learnerId),
      orderBy('enrolledAt', 'desc'),
    );

    if (status) {
      q = query(
        enrollmentsRef,
        where('learnerId', '==', learnerId),
        where('status', '==', status),
        orderBy('enrolledAt', 'desc'),
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Enrollment);
  } catch (error) {
    log.error('Failed to get learner enrollments', error, { organizationId, learnerId });
    throw new Error(`Failed to get enrollments for learner: ${learnerId}`);
  }
}

/**
 * Get enrollments for a course
 */
export async function getCourseEnrollments(
  organizationId: string,
  courseId: string,
  options: PaginationOptions = { limit: 50 },
): Promise<PaginatedResponse<Enrollment>> {
  try {
    const enrollmentsRef = enrollmentsCollection(organizationId);
    const q = query(
      enrollmentsRef,
      where('courseId', '==', courseId),
      orderBy('enrolledAt', 'desc'),
      limit((options.limit ?? 50) + 1),
    );

    const snapshot = await getDocs(q);
    const enrollments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Enrollment);

    const hasMore = enrollments.length > (options.limit ?? 50);
    if (hasMore) {
      enrollments.pop();
    }

    return {
      items: enrollments,
      hasMore,
      nextCursor: hasMore ? enrollments[enrollments.length - 1]?.id : undefined,
    };
  } catch (error) {
    log.error('Failed to get course enrollments', error, { organizationId, courseId });
    throw new Error(`Failed to get enrollments for course: ${courseId}`);
  }
}

/**
 * Get in-progress enrollments for a learner (My Learning)
 */
export async function getInProgressEnrollments(
  organizationId: string,
  learnerId: string,
): Promise<Enrollment[]> {
  try {
    const enrollmentsRef = enrollmentsCollection(organizationId);
    const q = query(
      enrollmentsRef,
      where('learnerId', '==', learnerId),
      where('status', '==', 'in-progress'),
      orderBy('lastAccessedAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Enrollment);
  } catch (error) {
    log.error('Failed to get in-progress enrollments', error, { organizationId, learnerId });
    throw new Error(`Failed to get in-progress enrollments for: ${learnerId}`);
  }
}

/**
 * Get completed enrollments for a learner
 */
export async function getCompletedEnrollments(
  organizationId: string,
  learnerId: string,
): Promise<Enrollment[]> {
  try {
    const enrollmentsRef = enrollmentsCollection(organizationId);
    const q = query(
      enrollmentsRef,
      where('learnerId', '==', learnerId),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Enrollment);
  } catch (error) {
    log.error('Failed to get completed enrollments', error, { organizationId, learnerId });
    throw new Error(`Failed to get completed enrollments for: ${learnerId}`);
  }
}

/**
 * Check if a learner is enrolled in a course
 */
export async function isEnrolled(
  organizationId: string,
  learnerId: string,
  courseId: string,
): Promise<boolean> {
  try {
    const enrollmentsRef = enrollmentsCollection(organizationId);
    const q = query(
      enrollmentsRef,
      where('learnerId', '==', learnerId),
      where('courseId', '==', courseId),
      limit(1),
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    log.error('Failed to check enrollment', error, { organizationId, learnerId, courseId });
    throw new Error('Failed to check enrollment status');
  }
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/**
 * Create a new enrollment
 */
export async function createEnrollment(
  organizationId: string,
  input: CreateEnrollmentInput,
): Promise<Enrollment> {
  try {
    const enrollmentsRef = enrollmentsCollection(organizationId);
    const now = serverTimestamp();

    const enrollmentData = {
      learnerId: input.learnerId,
      courseId: input.courseId,
      status: 'enrolled' as EnrollmentStatus,
      source: input.source,
      assignedBy: input.assignedBy,
      enrolledAt: now,
      progress: 0,
      lessonsCompleted: 0,
      lessonsTotal: 0,
      quizzesCompleted: 0,
      quizzesTotal: 0,
      timeSpent: 0,
      isRequired: input.isRequired ?? false,
      dueDate: input.dueDate,
      complianceDeadline: input.complianceDeadline,
      registration: crypto.randomUUID(),
    };

    const docRef = await addDoc(enrollmentsRef, enrollmentData);
    const created = await getDoc(docRef);

    if (!created.exists()) {
      throw new Error('Failed to retrieve created enrollment');
    }

    return { id: created.id, ...created.data() } as Enrollment;
  } catch (error) {
    log.error('Failed to create enrollment', error, { organizationId, input });
    throw new Error('Failed to create enrollment');
  }
}

/**
 * Update enrollment progress
 */
export async function updateEnrollmentProgress(
  organizationId: string,
  enrollmentId: string,
  progress: number,
  timeSpent: number,
): Promise<void> {
  try {
    const docRef = enrollmentRef(organizationId, enrollmentId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error('Enrollment not found');
    }

    const updates: Record<string, unknown> = {
      progress,
      timeSpent,
      lastAccessedAt: serverTimestamp(),
    };

    // Auto-update status based on progress
    if (progress > 0 && snapshot.data().status === 'enrolled') {
      updates.status = 'in-progress';
      updates.startedAt = serverTimestamp();
    }

    if (progress >= 100) {
      updates.status = 'completed';
      updates.completedAt = serverTimestamp();
    }

    await updateDoc(docRef, updates);
  } catch (error) {
    log.error('Failed to update enrollment progress', error, { organizationId, enrollmentId });
    throw new Error(`Failed to update progress for enrollment: ${enrollmentId}`);
  }
}

/**
 * Update enrollment status
 */
export async function updateEnrollmentStatus(
  organizationId: string,
  enrollmentId: string,
  status: EnrollmentStatus,
): Promise<void> {
  try {
    const docRef = enrollmentRef(organizationId, enrollmentId);
    await updateDoc(docRef, {
      status,
      ...(status === 'completed' ? { completedAt: serverTimestamp() } : {}),
    });
  } catch (error) {
    log.error('Failed to update enrollment status', error, {
      organizationId,
      enrollmentId,
      status,
    });
    throw new Error(`Failed to update enrollment status: ${enrollmentId}`);
  }
}
