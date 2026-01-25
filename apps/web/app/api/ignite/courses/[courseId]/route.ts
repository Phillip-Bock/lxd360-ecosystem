import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-ignite-course-detail' });

/**
 * GET /api/ignite/courses/[courseId]
 *
 * Fetches a single course by ID with RBAC enforcement.
 * - Learners: Must be enrolled in the course
 * - Managers/Editors/Owners: Full access to tenant courses
 */
export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;

    // 1. AUTHENTICATION
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // 2. Get tenant context
    const tenantId =
      (decodedToken.tenantId as string) || req.headers.get('x-tenant-id') || 'lxd360-dev';

    // 3. Get persona for RBAC
    const persona = (decodedToken.persona as string) || (decodedToken.role as string) || 'learner';

    // 4. Fetch the course
    const courseRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('courses')
      .doc(courseId);

    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      log.warn('Course not found', { courseId, tenantId, userId });
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseData = courseDoc.data();

    // 5. RBAC: Learners need enrollment check
    if (persona === 'learner') {
      // Check if learner is enrolled
      const enrollmentSnapshot = await adminDb
        .collection('tenants')
        .doc(tenantId)
        .collection('enrollments')
        .where('userId', '==', userId)
        .where('courseId', '==', courseId)
        .limit(1)
        .get();

      if (enrollmentSnapshot.empty) {
        log.warn('Learner not enrolled in course', { courseId, userId, tenantId });
        return NextResponse.json({ error: 'You are not enrolled in this course' }, { status: 403 });
      }
    }

    // 6. Build the response
    const course = {
      id: courseDoc.id,
      title: courseData?.title || 'Untitled Course',
      description: courseData?.description || null,
      type: courseData?.type || 'native',
      status: courseData?.status || 'draft',
      thumbnail: courseData?.thumbnail || null,
      scormPackagePath: courseData?.scormPackagePath || null,
      settings: courseData?.settings || {},
      tenantId,
      authorId: courseData?.authorId || null,
      createdAt: courseData?.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: courseData?.updatedAt?.toDate?.()?.toISOString() || null,
    };

    log.info('Course fetched', { courseId, tenantId, userId, persona });

    return NextResponse.json(course);
  } catch (error: unknown) {
    log.error('Failed to fetch course', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
