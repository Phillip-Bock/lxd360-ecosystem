import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import { type BulkEnrollmentResponse, bulkEnrollmentRequestSchema } from '@/types/lms/enrollment';

const log = logger.child({ module: 'api-ignite-enrollments-bulk' });

// Personas that can bulk enroll
const BULK_ENROLLMENT_PERSONAS = ['owner', 'manager'];

/**
 * POST /api/ignite/enrollments/bulk
 *
 * Bulk enroll multiple learners in multiple courses.
 * - Managers: Can bulk assign courses to team members
 * - Owners: Can bulk assign to anyone
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

    // 3. RBAC: Check if user can bulk enroll
    if (!BULK_ENROLLMENT_PERSONAS.includes(persona)) {
      log.warn('Forbidden: user cannot bulk enroll', { userId, persona });
      return NextResponse.json(
        { error: 'You do not have permission to bulk enroll learners' },
        { status: 403 },
      );
    }

    // 4. Parse and validate body
    const body = await req.json();
    const validationResult = bulkEnrollmentRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid bulk enrollment request', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const { learnerIds, courseIds, source, dueDate, bypassApproval } = validationResult.data;

    // 5. Validate limits
    const totalEnrollments = learnerIds.length * courseIds.length;
    if (totalEnrollments > 500) {
      return NextResponse.json(
        {
          error: `Bulk enrollment limit exceeded. Maximum 500 enrollments per request. Requested: ${totalEnrollments}`,
        },
        { status: 400 },
      );
    }

    // 6. Verify courses exist
    const courseRefs = courseIds.map((courseId) =>
      adminDb.collection('tenants').doc(tenantId).collection('courses').doc(courseId),
    );
    const courseDocs = await Promise.all(courseRefs.map((ref) => ref.get()));

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
      return NextResponse.json(
        {
          error: `Some courses not found: ${invalidCourseIds.join(', ')}`,
        },
        { status: 404 },
      );
    }

    // 7. Check for existing enrollments
    const existingEnrollmentsSnapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .where('learnerId', 'in', learnerIds.slice(0, 10)) // Firestore limit
      .where('status', 'not-in', ['withdrawn', 'rejected', 'expired', 'failed'])
      .get();

    const existingEnrollmentKeys = new Set<string>();
    existingEnrollmentsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      existingEnrollmentKeys.add(`${data.learnerId}:${data.courseId}`);
    });

    // 8. Create enrollments in batches
    const response: BulkEnrollmentResponse = {
      totalCreated: 0,
      failed: [],
      enrollmentIds: [],
    };

    const batch = adminDb.batch();
    let batchCount = 0;
    const batchLimit = 500; // Firestore batch limit

    for (const learnerId of learnerIds) {
      for (const courseId of courseIds) {
        const key = `${learnerId}:${courseId}`;

        // Skip existing enrollments
        if (existingEnrollmentKeys.has(key)) {
          response.failed.push({
            learnerId,
            courseId,
            error: 'Learner already enrolled',
          });
          continue;
        }

        // Determine initial status
        const initialStatus = bypassApproval
          ? 'enrolled'
          : source === 'self_enroll'
            ? 'pending_approval'
            : 'enrolled';

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
          requiresApproval: !bypassApproval && source === 'self_enroll',
          progress: 0,
          requestedAt: FieldValue.serverTimestamp(),
          ...(initialStatus === 'enrolled' && { enrolledAt: FieldValue.serverTimestamp() }),
          assignedBy: userId,
          ...(dueDate && { dueDate: new Date(dueDate) }),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        batch.set(enrollmentRef, enrollmentData);
        response.enrollmentIds.push(enrollmentRef.id);
        response.totalCreated++;
        batchCount++;

        // Commit batch if limit reached
        if (batchCount >= batchLimit) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }

    // Commit remaining batch
    if (batchCount > 0) {
      await batch.commit();
    }

    log.info('Bulk enrollment completed', {
      tenantId,
      userId,
      totalCreated: response.totalCreated,
      totalFailed: response.failed.length,
      learnerCount: learnerIds.length,
      courseCount: courseIds.length,
    });

    return NextResponse.json({
      success: true,
      ...response,
      message: `Successfully created ${response.totalCreated} enrollments`,
    });
  } catch (error: unknown) {
    log.error('Failed to process bulk enrollment', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
