import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import { enrollmentApprovalSchema } from '@/types/lms/enrollment';

const log = logger.child({ module: 'api-ignite-enrollment-approve' });

// Personas that can approve enrollments
const APPROVAL_PERSONAS = ['owner', 'manager'];

/**
 * POST /api/ignite/enrollments/[enrollmentId]/approve
 *
 * Approve or reject a pending enrollment.
 * - Managers: Can approve enrollments for their team members
 * - Owners: Can approve any enrollment
 */
export async function POST(
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

    // 3. RBAC: Check if user can approve enrollments
    if (!APPROVAL_PERSONAS.includes(persona)) {
      log.warn('Forbidden: user cannot approve enrollments', { userId, persona });
      return NextResponse.json(
        { error: 'You do not have permission to approve enrollments' },
        { status: 403 },
      );
    }

    // 4. Parse and validate body
    const body = await req.json();
    const validationResult = enrollmentApprovalSchema.safeParse({
      ...body,
      enrollmentId,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid approval request', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const { approved, reason } = validationResult.data;

    // 5. Fetch enrollment
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

    // 6. Check if enrollment is pending approval
    if (existingData?.status !== 'pending_approval') {
      return NextResponse.json(
        {
          error: `Enrollment is not pending approval. Current status: ${existingData?.status}`,
        },
        { status: 400 },
      );
    }

    // 7. Apply approval or rejection
    if (approved) {
      await enrollmentRef.update({
        status: 'enrolled',
        approvedBy: userId,
        approvedAt: FieldValue.serverTimestamp(),
        enrolledAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      log.info('Enrollment approved', {
        enrollmentId,
        learnerId: existingData?.learnerId,
        courseId: existingData?.courseId,
        approvedBy: userId,
        tenantId,
      });

      return NextResponse.json({
        success: true,
        message: 'Enrollment approved',
        status: 'enrolled',
      });
    } else {
      // Rejection requires a reason
      if (!reason) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
      }

      await enrollmentRef.update({
        status: 'rejected',
        rejectedBy: userId,
        rejectedAt: FieldValue.serverTimestamp(),
        rejectionReason: reason,
        updatedAt: FieldValue.serverTimestamp(),
      });

      log.info('Enrollment rejected', {
        enrollmentId,
        learnerId: existingData?.learnerId,
        courseId: existingData?.courseId,
        rejectedBy: userId,
        reason,
        tenantId,
      });

      return NextResponse.json({
        success: true,
        message: 'Enrollment rejected',
        status: 'rejected',
      });
    }
  } catch (error: unknown) {
    log.error('Failed to process enrollment approval', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
