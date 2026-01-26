import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import { type Enrollment, progressUpdateSchema } from '@/types/lms/enrollment';

const log = logger.child({ module: 'api-ignite-enrollment-detail' });

// Personas that can manage enrollments
const ENROLLMENT_MANAGEMENT_PERSONAS = ['owner', 'manager'];

/**
 * GET /api/ignite/enrollments/[enrollmentId]
 *
 * Get a single enrollment by ID.
 * - Learners: Can only view their own enrollments
 * - Managers/Owners: Can view any enrollment in the tenant
 */
export async function GET(req: Request, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    const { enrollmentId } = await params;

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

    // 3. Fetch enrollment
    const enrollmentRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .doc(enrollmentId);

    const enrollmentDoc = await enrollmentRef.get();

    if (!enrollmentDoc.exists) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    const data = enrollmentDoc.data();

    // 4. RBAC: Check access
    const isOwnEnrollment = data?.learnerId === userId;
    const canManage = ENROLLMENT_MANAGEMENT_PERSONAS.includes(persona);

    if (!isOwnEnrollment && !canManage) {
      log.warn('Forbidden: user cannot access this enrollment', {
        userId,
        enrollmentId,
        persona,
      });
      return NextResponse.json(
        { error: 'You do not have permission to view this enrollment' },
        { status: 403 },
      );
    }

    // 5. Build response
    const enrollment: Enrollment = {
      id: enrollmentDoc.id,
      tenantId: data?.tenantId,
      learnerId: data?.learnerId,
      courseId: data?.courseId,
      status: data?.status,
      source: data?.source,
      requiresApproval: data?.requiresApproval || false,
      approvedBy: data?.approvedBy,
      approvedAt: data?.approvedAt?.toDate?.() || undefined,
      rejectedBy: data?.rejectedBy,
      rejectedAt: data?.rejectedAt?.toDate?.() || undefined,
      rejectionReason: data?.rejectionReason,
      progress: data?.progress || 0,
      score: data?.score,
      passed: data?.passed,
      requestedAt: data?.requestedAt?.toDate?.() || new Date(),
      enrolledAt: data?.enrolledAt?.toDate?.() || undefined,
      startedAt: data?.startedAt?.toDate?.() || undefined,
      completedAt: data?.completedAt?.toDate?.() || undefined,
      lastAccessedAt: data?.lastAccessedAt?.toDate?.() || undefined,
      expiresAt: data?.expiresAt?.toDate?.() || undefined,
      dueDate: data?.dueDate?.toDate?.() || undefined,
      assignedBy: data?.assignedBy,
      recommendationId: data?.recommendationId,
      notes: data?.notes,
      createdAt: data?.createdAt?.toDate?.() || new Date(),
      updatedAt: data?.updatedAt?.toDate?.() || new Date(),
    };

    log.info('Enrollment fetched', { enrollmentId, tenantId, userId });

    return NextResponse.json(enrollment);
  } catch (error: unknown) {
    log.error('Failed to fetch enrollment', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/ignite/enrollments/[enrollmentId]
 *
 * Update enrollment (progress, status, etc.)
 * - Learners: Can update progress on their own enrollments
 * - Managers/Owners: Can update any enrollment
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ enrollmentId: string }> },
) {
  try {
    const { enrollmentId } = await params;

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

    // 3. Fetch enrollment
    const enrollmentRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .doc(enrollmentId);

    const enrollmentDoc = await enrollmentRef.get();

    if (!enrollmentDoc.exists) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    const existingData = enrollmentDoc.data();

    // 4. RBAC: Check access
    const isOwnEnrollment = existingData?.learnerId === userId;
    const canManage = ENROLLMENT_MANAGEMENT_PERSONAS.includes(persona);

    if (!isOwnEnrollment && !canManage) {
      log.warn('Forbidden: user cannot update this enrollment', {
        userId,
        enrollmentId,
        persona,
      });
      return NextResponse.json(
        { error: 'You do not have permission to update this enrollment' },
        { status: 403 },
      );
    }

    // 5. Parse and validate body
    const body = await req.json();
    const validationResult = progressUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const { progress, score, passed, completed } = validationResult.data;

    // 6. Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
      lastAccessedAt: FieldValue.serverTimestamp(),
    };

    if (progress !== undefined) {
      updateData.progress = progress;

      // Auto-transition to in_progress if learner starts
      if (progress > 0 && existingData?.status === 'enrolled' && !existingData?.startedAt) {
        updateData.status = 'in_progress';
        updateData.startedAt = FieldValue.serverTimestamp();
      }
    }

    if (score !== undefined) {
      updateData.score = score;
    }

    if (passed !== undefined) {
      updateData.passed = passed;
    }

    if (completed) {
      updateData.status = passed === false ? 'failed' : 'completed';
      updateData.completedAt = FieldValue.serverTimestamp();
      updateData.progress = 100;
    }

    // 7. Apply update
    await enrollmentRef.update(updateData);

    log.info('Enrollment updated', {
      enrollmentId,
      tenantId,
      userId,
      updates: Object.keys(updateData),
    });

    return NextResponse.json({
      success: true,
      message: 'Enrollment updated',
    });
  } catch (error: unknown) {
    log.error('Failed to update enrollment', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/ignite/enrollments/[enrollmentId]
 *
 * Withdraw from an enrollment.
 * - Learners: Can withdraw from their own enrollments
 * - Managers/Owners: Can withdraw any enrollment
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ enrollmentId: string }> },
) {
  try {
    const { enrollmentId } = await params;

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

    // 3. Fetch enrollment
    const enrollmentRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .doc(enrollmentId);

    const enrollmentDoc = await enrollmentRef.get();

    if (!enrollmentDoc.exists) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    const existingData = enrollmentDoc.data();

    // 4. RBAC: Check access
    const isOwnEnrollment = existingData?.learnerId === userId;
    const canManage = ENROLLMENT_MANAGEMENT_PERSONAS.includes(persona);

    if (!isOwnEnrollment && !canManage) {
      log.warn('Forbidden: user cannot withdraw this enrollment', {
        userId,
        enrollmentId,
        persona,
      });
      return NextResponse.json(
        { error: 'You do not have permission to withdraw this enrollment' },
        { status: 403 },
      );
    }

    // 5. Check if enrollment can be withdrawn
    const nonWithdrawableStatuses = ['completed', 'withdrawn', 'rejected'];
    if (nonWithdrawableStatuses.includes(existingData?.status)) {
      return NextResponse.json(
        { error: `Cannot withdraw from enrollment with status: ${existingData?.status}` },
        { status: 400 },
      );
    }

    // 6. Mark as withdrawn (soft delete)
    await enrollmentRef.update({
      status: 'withdrawn',
      withdrawnAt: FieldValue.serverTimestamp(),
      withdrawnBy: userId,
      updatedAt: FieldValue.serverTimestamp(),
    });

    log.info('Enrollment withdrawn', {
      enrollmentId,
      tenantId,
      userId,
      learnerId: existingData?.learnerId,
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully withdrawn from course',
    });
  } catch (error: unknown) {
    log.error('Failed to withdraw enrollment', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
