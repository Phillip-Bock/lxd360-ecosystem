import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import {
  type Enrollment,
  type EnrollmentFiltersInput,
  enrollmentFiltersSchema,
  enrollmentRequestSchema,
} from '@/types/lms/enrollment';

const log = logger.child({ module: 'api-ignite-enrollments' });

// Personas that can manage enrollments (view all, create for others)
const ENROLLMENT_MANAGEMENT_PERSONAS = ['owner', 'manager'];

// Personas that can create enrollments for others
const ENROLLMENT_ASSIGNMENT_PERSONAS = ['owner', 'manager', 'editor'];

/**
 * GET /api/ignite/enrollments
 *
 * List enrollments with optional filters.
 * - Learners: See only their own enrollments
 * - Managers: See enrollments for their team members
 * - Owners: See all tenant enrollments
 */
export async function GET(req: Request) {
  try {
    // 1. AUTHENTICATION
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // 2. Get tenant and persona context
    const tenantId =
      (decodedToken.tenantId as string) || req.headers.get('x-tenant-id') || 'lxd360-dev';
    const persona = (decodedToken.persona as string) || (decodedToken.role as string) || 'learner';

    // 3. Parse query parameters
    const url = new URL(req.url);
    const filters: EnrollmentFiltersInput = {
      status: url.searchParams.get('status')?.split(',') as EnrollmentFiltersInput['status'],
      source: url.searchParams.get('source')?.split(',') as EnrollmentFiltersInput['source'],
      learnerId: url.searchParams.get('learnerId') || undefined,
      courseId: url.searchParams.get('courseId') || undefined,
      assignedBy: url.searchParams.get('assignedBy') || undefined,
      requiresApproval: url.searchParams.get('requiresApproval') === 'true' ? true : undefined,
      limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 50,
      offset: url.searchParams.get('offset') ? Number(url.searchParams.get('offset')) : 0,
      sortBy: (url.searchParams.get('sortBy') as EnrollmentFiltersInput['sortBy']) || 'requestedAt',
      sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Validate filters
    const validationResult = enrollmentFiltersSchema.safeParse(filters);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    // 4. Build Firestore query with RBAC constraints
    let query = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .orderBy(filters.sortBy || 'requestedAt', filters.sortOrder || 'desc');

    // RBAC: Learners can only see their own enrollments
    if (persona === 'learner') {
      query = query.where('learnerId', '==', userId);
    } else if (filters.learnerId) {
      // Manager/owner filtering by specific learner
      query = query.where('learnerId', '==', filters.learnerId);
    }

    // Apply additional filters
    if (filters.courseId) {
      query = query.where('courseId', '==', filters.courseId);
    }

    if (filters.status && filters.status.length === 1) {
      query = query.where('status', '==', filters.status[0]);
    }

    if (filters.source && filters.source.length === 1) {
      query = query.where('source', '==', filters.source[0]);
    }

    if (filters.requiresApproval !== undefined) {
      query = query.where('requiresApproval', '==', filters.requiresApproval);
    }

    // Apply pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.limit(limit + 1); // Fetch one extra to check hasMore

    // 5. Execute query
    const snapshot = await query.get();

    // Process results
    const enrollments: Enrollment[] = [];
    let count = 0;

    for (const doc of snapshot.docs) {
      if (count >= offset && enrollments.length < limit) {
        const data = doc.data();
        enrollments.push({
          id: doc.id,
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
        });
      }
      count++;
    }

    const hasMore = snapshot.docs.length > limit;

    log.info('Enrollments fetched', {
      count: enrollments.length,
      tenantId,
      userId,
      persona,
    });

    return NextResponse.json({
      enrollments,
      total: count,
      limit,
      offset,
      hasMore,
    });
  } catch (error: unknown) {
    log.error('Failed to fetch enrollments', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/ignite/enrollments
 *
 * Create a new enrollment.
 * - Learners: Can self-enroll in open courses
 * - Managers: Can assign courses to team members
 * - Owners: Can assign courses to anyone
 */
export async function POST(req: Request) {
  try {
    // 1. AUTHENTICATION
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // 2. Get tenant and persona context
    const tenantId =
      (decodedToken.tenantId as string) || req.headers.get('x-tenant-id') || 'lxd360-dev';
    const persona = (decodedToken.persona as string) || (decodedToken.role as string) || 'learner';

    // 3. Parse and validate body
    const body = await req.json();
    const validationResult = enrollmentRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid enrollment request', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const { learnerId, courseId, source, recommendationId, notes } = validationResult.data;

    // 4. RBAC: Check permissions
    const isSelfEnrollment = learnerId === userId;
    const canAssignOthers = ENROLLMENT_ASSIGNMENT_PERSONAS.includes(persona);

    if (!isSelfEnrollment && !canAssignOthers) {
      log.warn('Forbidden: user cannot enroll others', { userId, learnerId, persona });
      return NextResponse.json(
        { error: 'You do not have permission to enroll other users' },
        { status: 403 },
      );
    }

    // 5. Check if enrollment already exists
    const existingEnrollment = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .where('learnerId', '==', learnerId)
      .where('courseId', '==', courseId)
      .where('status', 'not-in', ['withdrawn', 'rejected', 'expired', 'failed'])
      .limit(1)
      .get();

    if (!existingEnrollment.empty) {
      return NextResponse.json(
        { error: 'Learner is already enrolled in this course' },
        { status: 409 },
      );
    }

    // 6. Check course exists and get enrollment settings
    const courseDoc = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('courses')
      .doc(courseId)
      .get();

    if (!courseDoc.exists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseData = courseDoc.data();
    const requiresApproval =
      courseData?.enrollmentSettings?.approvalRequired &&
      source === 'self_enroll' &&
      !ENROLLMENT_MANAGEMENT_PERSONAS.includes(persona);

    // 7. Determine initial status
    let initialStatus: string;
    if (requiresApproval) {
      initialStatus = 'pending_approval';
    } else if (source === 'self_enroll') {
      initialStatus = 'enrolled';
    } else {
      initialStatus = 'enrolled';
    }

    // 8. Create enrollment document
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
      ...(!isSelfEnrollment && { assignedBy: userId }),
      ...(recommendationId && { recommendationId }),
      ...(notes && { notes }),
      ...(courseData?.enrollmentSettings?.accessDuration && {
        expiresAt: new Date(
          Date.now() + courseData.enrollmentSettings.accessDuration * 24 * 60 * 60 * 1000,
        ),
      }),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await enrollmentRef.set(enrollmentData);

    log.info('Enrollment created', {
      enrollmentId: enrollmentRef.id,
      learnerId,
      courseId,
      status: initialStatus,
      tenantId,
      createdBy: userId,
    });

    return NextResponse.json({
      success: true,
      enrollmentId: enrollmentRef.id,
      status: initialStatus,
      message:
        initialStatus === 'pending_approval'
          ? 'Enrollment request submitted for approval'
          : 'Successfully enrolled',
    });
  } catch (error: unknown) {
    log.error('Failed to create enrollment', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
