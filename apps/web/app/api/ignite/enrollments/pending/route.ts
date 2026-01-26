import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import type { EnrollmentWithDetails, PendingApproval } from '@/types/lms/enrollment';

const log = logger.child({ module: 'api-ignite-enrollments-pending' });

// Personas that can view pending approvals
const APPROVAL_PERSONAS = ['owner', 'manager'];

/**
 * GET /api/ignite/enrollments/pending
 *
 * Get all enrollments pending approval.
 * - Managers: See pending enrollments for their team members
 * - Owners: See all pending enrollments
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

    // 3. RBAC: Check if user can view pending approvals
    if (!APPROVAL_PERSONAS.includes(persona)) {
      log.warn('Forbidden: user cannot view pending approvals', { userId, persona });
      return NextResponse.json(
        { error: 'You do not have permission to view pending approvals' },
        { status: 403 },
      );
    }

    // 4. Parse query parameters
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 100);
    const offset = Number(url.searchParams.get('offset')) || 0;

    // 5. Query pending enrollments
    const query = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .where('status', '==', 'pending_approval')
      .orderBy('requestedAt', 'desc')
      .limit(limit + 1);

    const snapshot = await query.get();

    // 6. Get unique learner and course IDs for details
    const learnerIds = new Set<string>();
    const courseIds = new Set<string>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      learnerIds.add(data.learnerId);
      courseIds.add(data.courseId);
    });

    // 7. Fetch learner details
    const learnerMap = new Map<string, { name: string; email: string; avatar?: string }>();

    if (learnerIds.size > 0) {
      const learnerDocs = await Promise.all(
        Array.from(learnerIds)
          .slice(0, 10)
          .map((id) =>
            adminDb.collection('tenants').doc(tenantId).collection('learners').doc(id).get(),
          ),
      );

      learnerDocs.forEach((doc) => {
        if (doc.exists) {
          const data = doc.data();
          learnerMap.set(doc.id, {
            name:
              data?.displayName ||
              `${data?.firstName || ''} ${data?.lastName || ''}`.trim() ||
              'Unknown',
            email: data?.email || '',
            avatar: data?.avatar,
          });
        }
      });
    }

    // 8. Fetch course details
    const courseMap = new Map<string, { name: string; thumbnail?: string }>();

    if (courseIds.size > 0) {
      const courseDocs = await Promise.all(
        Array.from(courseIds)
          .slice(0, 10)
          .map((id) =>
            adminDb.collection('tenants').doc(tenantId).collection('courses').doc(id).get(),
          ),
      );

      courseDocs.forEach((doc) => {
        if (doc.exists) {
          const data = doc.data();
          courseMap.set(doc.id, {
            name: data?.title || 'Unknown Course',
            thumbnail: data?.thumbnail,
          });
        }
      });
    }

    // 9. Build response with details
    const pendingApprovals: PendingApproval[] = [];
    let count = 0;

    for (const doc of snapshot.docs) {
      if (count >= offset && pendingApprovals.length < limit) {
        const data = doc.data();
        const requestedAt = data.requestedAt?.toDate?.() || new Date();
        const now = new Date();
        const daysWaiting = Math.floor(
          (now.getTime() - requestedAt.getTime()) / (1000 * 60 * 60 * 24),
        );

        const learner = learnerMap.get(data.learnerId);
        const course = courseMap.get(data.courseId);

        const enrollment: EnrollmentWithDetails = {
          id: doc.id,
          tenantId: data.tenantId,
          learnerId: data.learnerId,
          courseId: data.courseId,
          status: data.status,
          source: data.source,
          requiresApproval: data.requiresApproval || false,
          progress: data.progress || 0,
          requestedAt,
          notes: data.notes,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          // Details
          courseName: course?.name,
          courseThumbnail: course?.thumbnail,
          learnerName: learner?.name,
          learnerEmail: learner?.email,
          learnerAvatar: learner?.avatar,
        };

        pendingApprovals.push({
          enrollment,
          requestedAt,
          daysWaiting,
        });
      }
      count++;
    }

    const hasMore = snapshot.docs.length > limit;

    log.info('Pending approvals fetched', {
      count: pendingApprovals.length,
      tenantId,
      userId,
    });

    return NextResponse.json({
      pendingApprovals,
      total: count,
      limit,
      offset,
      hasMore,
    });
  } catch (error: unknown) {
    log.error('Failed to fetch pending approvals', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
