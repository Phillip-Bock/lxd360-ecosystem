import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-manager-users' });

// Personas that can access user management
const MANAGER_PERSONAS = ['owner', 'manager'];

/** Team member response shape */
interface TeamMemberResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  persona: string;
  status: 'active' | 'inactive' | 'pending';
  coursesAssigned: number;
  coursesCompleted: number;
  completionRate: number;
  lastActive: string | null;
  overdueCount: number;
  createdAt: string;
}

/** API Response shape */
interface UsersResponse {
  users: TeamMemberResponse[];
  total: number;
  page: number;
  pageSize: number;
}

/** Firestore member document shape */
interface MemberDoc {
  displayName?: string;
  email?: string;
  photoURL?: string;
  persona?: string;
  status?: string;
  lastLoginAt?: { toDate: () => Date };
  createdAt?: { toDate: () => Date };
}

/** Firestore enrollment document shape */
interface EnrollmentDoc {
  learnerId: string;
  courseId: string;
  status: string;
  progress: number;
  dueDate?: { toDate: () => Date };
}

/**
 * GET /api/ignite/manager/users
 *
 * Fetch team members for manager user management.
 * Supports filtering by status and searching by name/email.
 */
export async function GET(req: Request): Promise<NextResponse<UsersResponse | { error: string }>> {
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

    // 3. RBAC: Check manager permissions
    if (!MANAGER_PERSONAS.includes(persona)) {
      log.warn('Forbidden: user lacks manager permissions', { userId, persona });
      return NextResponse.json(
        { error: 'You do not have permission to access user management' },
        { status: 403 },
      );
    }

    // 4. Parse query parameters
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get('status') || 'all';
    const searchQuery = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'name';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const pageSize = Math.min(
      100,
      Math.max(10, parseInt(url.searchParams.get('pageSize') || '50', 10)),
    );

    log.info('Fetching team members', {
      userId,
      tenantId,
      statusFilter,
      searchQuery,
      page,
      pageSize,
    });

    // 5. Fetch all tenant members (learners)
    let membersQuery = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('members')
      .where('persona', '==', 'learner');

    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      membersQuery = membersQuery.where('status', '==', statusFilter);
    }

    const membersSnapshot = await membersQuery.limit(500).get();

    // 6. Build user map and collect learner IDs
    const learnerIds = new Set<string>();
    const memberDataMap = new Map<string, MemberDoc>();

    for (const doc of membersSnapshot.docs) {
      const data = doc.data() as MemberDoc;

      // Apply search filter client-side (Firestore doesn't support full-text search)
      if (searchQuery) {
        const lowerSearch = searchQuery.toLowerCase();
        const name = (data.displayName || '').toLowerCase();
        const email = (data.email || '').toLowerCase();
        if (!name.includes(lowerSearch) && !email.includes(lowerSearch)) {
          continue;
        }
      }

      learnerIds.add(doc.id);
      memberDataMap.set(doc.id, data);
    }

    // 7. Fetch enrollments for learners
    const enrollmentsByLearner = new Map<
      string,
      { assigned: number; completed: number; overdue: number; lastActive?: Date }
    >();

    // Initialize stats for all learners
    for (const learnerId of learnerIds) {
      enrollmentsByLearner.set(learnerId, {
        assigned: 0,
        completed: 0,
        overdue: 0,
      });
    }

    if (learnerIds.size > 0) {
      // Query enrollments in batches (Firestore 'in' limit is 30)
      const learnerIdsArray = Array.from(learnerIds);
      const batches: string[][] = [];
      for (let i = 0; i < learnerIdsArray.length; i += 30) {
        batches.push(learnerIdsArray.slice(i, i + 30));
      }

      const now = new Date();

      for (const batch of batches) {
        const enrollmentsSnapshot = await adminDb
          .collection('tenants')
          .doc(tenantId)
          .collection('enrollments')
          .where('learnerId', 'in', batch)
          .get();

        for (const doc of enrollmentsSnapshot.docs) {
          const data = doc.data() as EnrollmentDoc;
          const stats = enrollmentsByLearner.get(data.learnerId);
          if (!stats) continue;

          stats.assigned++;

          if (data.status === 'completed') {
            stats.completed++;
          }

          // Check for overdue
          const dueDate = data.dueDate?.toDate();
          if (dueDate && dueDate < now && data.status !== 'completed') {
            stats.overdue++;
          }
        }
      }
    }

    // 8. Build response array
    const users: TeamMemberResponse[] = [];

    for (const [learnerId, memberData] of memberDataMap) {
      const stats = enrollmentsByLearner.get(learnerId);
      const lastLogin = memberData.lastLoginAt?.toDate();
      const createdAt = memberData.createdAt?.toDate();

      // Determine status based on activity
      let status: 'active' | 'inactive' | 'pending' =
        (memberData.status as 'active' | 'inactive' | 'pending') || 'active';
      if (!lastLogin) {
        status = 'pending';
      } else {
        const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLogin > 30) {
          status = 'inactive';
        }
      }

      users.push({
        id: learnerId,
        name: memberData.displayName || memberData.email?.split('@')[0] || 'Unknown',
        email: memberData.email || '',
        avatarUrl: memberData.photoURL,
        persona: memberData.persona || 'learner',
        status,
        coursesAssigned: stats?.assigned || 0,
        coursesCompleted: stats?.completed || 0,
        completionRate:
          stats && stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0,
        lastActive: lastLogin?.toISOString() || null,
        overdueCount: stats?.overdue || 0,
        createdAt: createdAt?.toISOString() || new Date().toISOString(),
      });
    }

    // 9. Apply sorting
    users.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'progress':
          comparison = a.completionRate - b.completionRate;
          break;
        case 'lastActive': {
          const aTime = a.lastActive ? new Date(a.lastActive).getTime() : 0;
          const bTime = b.lastActive ? new Date(b.lastActive).getTime() : 0;
          comparison = aTime - bTime;
          break;
        }
        case 'status': {
          const statusOrder = { pending: 0, inactive: 1, active: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // 10. Apply pagination
    const total = users.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedUsers = users.slice(startIndex, startIndex + pageSize);

    log.info('Users fetched', {
      userId,
      tenantId,
      total,
      returned: paginatedUsers.length,
      page,
      pageSize,
    });

    return NextResponse.json({
      users: paginatedUsers,
      total,
      page,
      pageSize,
    });
  } catch (error: unknown) {
    log.error('Failed to fetch users', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/ignite/manager/users
 *
 * Bulk operations on users (assign courses, send reminders)
 */
export async function POST(
  req: Request,
): Promise<NextResponse<{ success: boolean; message: string } | { error: string }>> {
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

    // 3. RBAC: Check manager permissions
    if (!MANAGER_PERSONAS.includes(persona)) {
      log.warn('Forbidden: user lacks manager permissions', { userId, persona });
      return NextResponse.json(
        { error: 'You do not have permission to perform bulk operations' },
        { status: 403 },
      );
    }

    // 4. Parse request body
    const body = await req.json();
    const { action, userIds, data } = body as {
      action: 'assign_courses' | 'send_reminder' | 'update_status';
      userIds: string[];
      data?: { courseIds?: string[]; status?: string };
    };

    if (!action || !userIds || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: action, userIds' },
        { status: 400 },
      );
    }

    log.info('Processing bulk action', { userId, tenantId, action, userCount: userIds.length });

    // 5. Process action
    switch (action) {
      case 'assign_courses': {
        if (!data?.courseIds || data.courseIds.length === 0) {
          return NextResponse.json({ error: 'Missing courseIds for assignment' }, { status: 400 });
        }

        // Create enrollments for each user-course pair
        const batch = adminDb.batch();
        const now = new Date();
        const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

        for (const learnerId of userIds) {
          for (const courseId of data.courseIds) {
            const enrollmentRef = adminDb
              .collection('tenants')
              .doc(tenantId)
              .collection('enrollments')
              .doc(`${learnerId}_${courseId}`);

            batch.set(
              enrollmentRef,
              {
                learnerId,
                courseId,
                status: 'not_started',
                progress: 0,
                assignedAt: now,
                dueDate,
                assignedBy: userId,
              },
              { merge: true },
            );
          }
        }

        await batch.commit();

        return NextResponse.json({
          success: true,
          message: `Assigned ${data.courseIds.length} courses to ${userIds.length} users`,
        });
      }

      case 'send_reminder': {
        // TODO(LXD-340): Implement email reminders via Brevo
        log.info('Reminder requested', { userIds, managerId: userId });

        return NextResponse.json({
          success: true,
          message: `Reminders queued for ${userIds.length} users`,
        });
      }

      case 'update_status': {
        if (!data?.status) {
          return NextResponse.json({ error: 'Missing status for update' }, { status: 400 });
        }

        const batch = adminDb.batch();

        for (const memberId of userIds) {
          const memberRef = adminDb
            .collection('tenants')
            .doc(tenantId)
            .collection('members')
            .doc(memberId);

          batch.update(memberRef, {
            status: data.status,
            updatedAt: new Date(),
            updatedBy: userId,
          });
        }

        await batch.commit();

        return NextResponse.json({
          success: true,
          message: `Updated status to '${data.status}' for ${userIds.length} users`,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: unknown) {
    log.error('Failed to process bulk action', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
