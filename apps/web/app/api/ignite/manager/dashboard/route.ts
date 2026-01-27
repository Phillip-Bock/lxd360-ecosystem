import { NextResponse } from 'next/server';
import type {
  ComplianceStatus,
  DueDateItem,
  TeamMember,
  TeamStats,
} from '@/components/ignite/manager/types';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-manager-dashboard' });

// Personas that can access manager dashboard
const MANAGER_PERSONAS = ['owner', 'manager'];

/** Response shape for manager dashboard */
interface ManagerDashboardResponse {
  teamStats: TeamStats;
  teamMembers: TeamMember[];
  complianceData: ComplianceStatus[];
  dueDates: DueDateItem[];
}

/** Firestore user document shape */
interface UserDoc {
  displayName?: string;
  email?: string;
  photoURL?: string;
  lastLoginAt?: { toDate: () => Date };
  createdAt?: { toDate: () => Date };
}

/** Firestore enrollment document shape */
interface EnrollmentDoc {
  learnerId: string;
  courseId: string;
  status: string;
  progress: number;
  score?: number;
  dueDate?: { toDate: () => Date };
  completedAt?: { toDate: () => Date };
  lastAccessedAt?: { toDate: () => Date };
}

/** Firestore course document shape */
interface CourseDoc {
  title: string;
  category?: string;
  isCompliance?: boolean;
}

/**
 * GET /api/ignite/manager/dashboard
 *
 * Fetch dashboard data for managers.
 * Returns team statistics, member progress, compliance status, and due dates.
 */
export async function GET(
  req: Request,
): Promise<NextResponse<ManagerDashboardResponse | { error: string }>> {
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
        { error: 'You do not have permission to access manager dashboard' },
        { status: 403 },
      );
    }

    log.info('Fetching manager dashboard', { userId, tenantId, persona });

    // 4. Fetch tenant members (learners)
    const membersSnapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('members')
      .where('persona', '==', 'learner')
      .limit(100)
      .get();

    const learnerIds = new Set<string>();
    const userMap = new Map<string, UserDoc>();

    for (const doc of membersSnapshot.docs) {
      const data = doc.data();
      learnerIds.add(doc.id);
      userMap.set(doc.id, {
        displayName: data.displayName,
        email: data.email,
        photoURL: data.photoURL,
        lastLoginAt: data.lastLoginAt,
        createdAt: data.createdAt,
      });
    }

    // 5. Fetch all enrollments for learners
    const enrollments: Array<{ id: string; data: EnrollmentDoc }> = [];
    const courseIds = new Set<string>();

    if (learnerIds.size > 0) {
      // Query enrollments (Firestore doesn't support 'in' with more than 30 items)
      const learnerIdsArray = Array.from(learnerIds);
      const batches: string[][] = [];
      for (let i = 0; i < learnerIdsArray.length; i += 30) {
        batches.push(learnerIdsArray.slice(i, i + 30));
      }

      for (const batch of batches) {
        const enrollmentsSnapshot = await adminDb
          .collection('tenants')
          .doc(tenantId)
          .collection('enrollments')
          .where('learnerId', 'in', batch)
          .get();

        for (const doc of enrollmentsSnapshot.docs) {
          const data = doc.data() as EnrollmentDoc;
          enrollments.push({ id: doc.id, data });
          courseIds.add(data.courseId);
        }
      }
    }

    // 6. Fetch course details
    const courseMap = new Map<string, CourseDoc>();

    if (courseIds.size > 0) {
      const courseIdsArray = Array.from(courseIds);
      const batches: string[][] = [];
      for (let i = 0; i < courseIdsArray.length; i += 30) {
        batches.push(courseIdsArray.slice(i, i + 30));
      }

      for (const batch of batches) {
        const coursesSnapshot = await adminDb
          .collection('tenants')
          .doc(tenantId)
          .collection('courses')
          .where('__name__', 'in', batch)
          .get();

        for (const doc of coursesSnapshot.docs) {
          courseMap.set(doc.id, doc.data() as CourseDoc);
        }
      }
    }

    // 7. Build team members with stats
    const memberStatsMap = new Map<
      string,
      {
        assigned: number;
        completed: number;
        overdue: number;
        totalScore: number;
        scoreCount: number;
        lastActive?: Date;
      }
    >();

    // Initialize stats for all learners
    for (const learnerId of learnerIds) {
      memberStatsMap.set(learnerId, {
        assigned: 0,
        completed: 0,
        overdue: 0,
        totalScore: 0,
        scoreCount: 0,
      });
    }

    // Calculate stats from enrollments
    const now = new Date();
    const complianceCounts = new Map<
      string,
      { required: number; completed: number; dueDate?: Date }
    >();
    const dueDateItems: DueDateItem[] = [];

    for (const { data } of enrollments) {
      const stats = memberStatsMap.get(data.learnerId);
      if (!stats) continue;

      stats.assigned++;

      if (data.status === 'completed') {
        stats.completed++;
        if (data.score !== undefined) {
          stats.totalScore += data.score;
          stats.scoreCount++;
        }
      }

      // Track last activity
      const lastAccess = data.lastAccessedAt?.toDate();
      if (lastAccess && (!stats.lastActive || lastAccess > stats.lastActive)) {
        stats.lastActive = lastAccess;
      }

      // Check for overdue
      const dueDate = data.dueDate?.toDate();
      if (dueDate && dueDate < now && data.status !== 'completed') {
        stats.overdue++;
      }

      // Track compliance courses
      const course = courseMap.get(data.courseId);
      if (course?.isCompliance && course.category) {
        const compliance = complianceCounts.get(course.category) || {
          required: 0,
          completed: 0,
        };
        compliance.required++;
        if (data.status === 'completed') {
          compliance.completed++;
        }
        // Track earliest due date for category
        if (dueDate && (!compliance.dueDate || dueDate < compliance.dueDate)) {
          compliance.dueDate = dueDate;
        }
        complianceCounts.set(course.category, compliance);
      }

      // Add to due dates list if upcoming or overdue
      if (dueDate && data.status !== 'completed') {
        const user = userMap.get(data.learnerId);
        const isOverdue = dueDate < now;

        // Only include if due within 30 days or overdue
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (isOverdue || dueDate <= thirtyDaysFromNow) {
          dueDateItems.push({
            id: `${data.learnerId}-${data.courseId}`,
            title: course?.title || 'Unknown Course',
            courseTitle: course?.title || 'Unknown Course',
            learnerName: user?.displayName || user?.email || 'Unknown Learner',
            learnerId: data.learnerId,
            dueDate,
            isOverdue,
          });
        }
      }
    }

    // 8. Build team members array
    const teamMembers: TeamMember[] = [];
    for (const [learnerId, stats] of memberStatsMap) {
      const user = userMap.get(learnerId);
      if (!user) continue;

      teamMembers.push({
        id: learnerId,
        name: user.displayName || user.email?.split('@')[0] || 'Unknown',
        email: user.email || '',
        avatarUrl: user.photoURL,
        coursesAssigned: stats.assigned,
        coursesCompleted: stats.completed,
        completionRate:
          stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0,
        lastActive: stats.lastActive || user.lastLoginAt?.toDate() || new Date(0),
        overdueCount: stats.overdue,
      });
    }

    // Sort by completion rate ascending (lowest performers first for attention)
    teamMembers.sort((a, b) => a.completionRate - b.completionRate);

    // 9. Build compliance data
    const complianceData: ComplianceStatus[] = [];
    for (const [category, counts] of complianceCounts) {
      const percentage = counts.required > 0 ? (counts.completed / counts.required) * 100 : 100;
      let status: 'compliant' | 'at_risk' | 'non_compliant';

      if (percentage >= 90) {
        status = 'compliant';
      } else if (percentage >= 70) {
        status = 'at_risk';
      } else {
        status = 'non_compliant';
      }

      complianceData.push({
        category,
        required: counts.required,
        completed: counts.completed,
        status,
        dueDate: counts.dueDate,
      });
    }

    // Sort by status severity
    const statusOrder = { non_compliant: 0, at_risk: 1, compliant: 2 };
    complianceData.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    // 10. Sort due dates (overdue first, then by date)
    dueDateItems.sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });

    // Limit due dates to most urgent
    const limitedDueDates = dueDateItems.slice(0, 10);

    // 11. Calculate team stats
    const totalLearners = teamMembers.length;
    const totalAssigned = teamMembers.reduce((sum, m) => sum + m.coursesAssigned, 0);
    const totalCompleted = teamMembers.reduce((sum, m) => sum + m.coursesCompleted, 0);
    const avgCompletionRate =
      totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
    const overdueAssignments = teamMembers.reduce((sum, m) => sum + m.overdueCount, 0);

    // Calculate average score from enrollments with scores
    let totalScore = 0;
    let scoreCount = 0;
    for (const { data } of enrollments) {
      if (data.score !== undefined && data.status === 'completed') {
        totalScore += data.score;
        scoreCount++;
      }
    }
    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    // Calculate compliance rate
    const totalComplianceRequired = complianceData.reduce((sum, c) => sum + c.required, 0);
    const totalComplianceCompleted = complianceData.reduce((sum, c) => sum + c.completed, 0);
    const complianceRate =
      totalComplianceRequired > 0
        ? Math.round((totalComplianceCompleted / totalComplianceRequired) * 100)
        : 100;

    const teamStats: TeamStats = {
      totalLearners,
      learnersChange: 0, // Would need historical data
      avgCompletionRate,
      completionChange: 0, // Would need historical data
      avgScore,
      scoreChange: 0, // Would need historical data
      overdueAssignments,
      overdueChange: 0, // Would need historical data
      complianceRate,
      complianceChange: 0, // Would need historical data
    };

    log.info('Manager dashboard fetched', {
      userId,
      tenantId,
      totalLearners,
      totalEnrollments: enrollments.length,
    });

    return NextResponse.json({
      teamStats,
      teamMembers,
      complianceData,
      dueDates: limitedDueDates,
    });
  } catch (error: unknown) {
    log.error('Failed to fetch manager dashboard', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
