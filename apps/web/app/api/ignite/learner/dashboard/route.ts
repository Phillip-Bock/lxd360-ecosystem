import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import type {
  CompletedCourseRecord,
  LearnerCourse,
  LearnerProgressSummary,
  RecommendedCourse,
} from '@/types/lms/learner-dashboard';

const log = logger.child({ module: 'api-learner-dashboard' });

/** Response shape for learner dashboard */
interface LearnerDashboardResponse {
  progressSummary: LearnerProgressSummary;
  inProgressCourses: LearnerCourse[];
  assignedCourses: LearnerCourse[];
  recommendedCourses: RecommendedCourse[];
  completedCourses: CompletedCourseRecord[];
}

/** Firestore enrollment document shape */
interface EnrollmentDoc {
  courseId: string;
  status: string;
  progress: number;
  score?: number;
  startedAt?: { toDate: () => Date };
  completedAt?: { toDate: () => Date };
  lastAccessedAt?: { toDate: () => Date };
  dueDate?: { toDate: () => Date };
  requestedAt?: { toDate: () => Date };
  enrolledAt?: { toDate: () => Date };
}

/** Firestore course document shape */
interface CourseDoc {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  estimatedMinutes?: number;
  totalLessons?: number;
  category?: string;
  xpReward?: number;
  isRequired?: boolean;
}

/**
 * GET /api/ignite/learner/dashboard
 *
 * Fetch dashboard data for the authenticated learner.
 * Returns enrollments, progress summary, and course data.
 */
export async function GET(
  req: Request,
): Promise<NextResponse<LearnerDashboardResponse | { error: string }>> {
  try {
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

    log.info('Fetching learner dashboard', { userId, tenantId });

    // 3. Fetch user's enrollments
    const enrollmentsSnapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .where('learnerId', '==', userId)
      .get();

    // 4. Collect unique course IDs
    const courseIds = new Set<string>();
    const enrollments: Array<{ id: string; data: EnrollmentDoc }> = [];

    for (const doc of enrollmentsSnapshot.docs) {
      const data = doc.data() as EnrollmentDoc;
      courseIds.add(data.courseId);
      enrollments.push({ id: doc.id, data });
    }

    // 5. Fetch course details in batch
    const courseMap = new Map<string, CourseDoc>();

    if (courseIds.size > 0) {
      const courseIdsArray = Array.from(courseIds);
      // Firestore in query supports up to 30 items, batch if needed
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

    // 6. Process enrollments into categories
    const inProgressCourses: LearnerCourse[] = [];
    const assignedCourses: LearnerCourse[] = [];
    const completedCourses: CompletedCourseRecord[] = [];
    let totalTimeSpent = 0;
    let totalXp = 0;

    for (const { data } of enrollments) {
      const course = courseMap.get(data.courseId);
      if (!course) continue;

      const baseCourse: LearnerCourse = {
        id: data.courseId,
        title: course.title,
        description: course.description || '',
        thumbnailUrl: course.thumbnailUrl,
        progress: data.progress || 0,
        status: mapEnrollmentStatus(data.status),
        dueDate: data.dueDate?.toDate(),
        estimatedMinutes: course.estimatedMinutes || 60,
        totalLessons: course.totalLessons || 1,
        completedLessons: Math.round(((data.progress || 0) / 100) * (course.totalLessons || 1)),
        lastAccessedAt: data.lastAccessedAt?.toDate(),
        isRequired: course.isRequired || false,
        category: course.category,
        xpReward: course.xpReward || 100,
      };

      // Categorize by status
      if (data.status === 'completed') {
        const completed: CompletedCourseRecord = {
          ...baseCourse,
          status: 'completed',
          progress: 100,
          completedAt: data.completedAt?.toDate(),
          finalScore: data.score,
          badgesEarned: [],
          xpEarned: course.xpReward || 100,
          timeSpent: course.estimatedMinutes || 60,
        };
        completedCourses.push(completed);
        totalXp += completed.xpEarned;
        totalTimeSpent += completed.timeSpent;
      } else if (data.status === 'in_progress' || data.progress > 0) {
        inProgressCourses.push({
          ...baseCourse,
          status: 'in_progress',
        });
        // Estimate time spent based on progress
        totalTimeSpent += Math.round(
          ((data.progress || 0) / 100) * (course.estimatedMinutes || 60),
        );
      } else if (
        data.status === 'enrolled' ||
        data.status === 'assigned' ||
        data.status === 'pending_approval'
      ) {
        assignedCourses.push({
          ...baseCourse,
          status: 'not_started',
        });
      }
    }

    // 7. Sort courses by relevance
    inProgressCourses.sort((a, b) => {
      // Most recently accessed first
      const aTime = a.lastAccessedAt?.getTime() || 0;
      const bTime = b.lastAccessedAt?.getTime() || 0;
      return bTime - aTime;
    });

    assignedCourses.sort((a, b) => {
      // Closest due date first
      const aDate = a.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
      const bDate = b.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });

    completedCourses.sort((a, b) => {
      // Most recently completed first
      const aTime = a.completedAt?.getTime() || 0;
      const bTime = b.completedAt?.getTime() || 0;
      return bTime - aTime;
    });

    // 8. Calculate progress summary
    const totalCourses =
      inProgressCourses.length + assignedCourses.length + completedCourses.length;
    const overallProgress =
      totalCourses > 0 ? Math.round((completedCourses.length / totalCourses) * 100) : 0;

    const progressSummary: LearnerProgressSummary = {
      totalAssigned: totalCourses,
      inProgress: inProgressCourses.length,
      completed: completedCourses.length,
      overallProgress,
      totalTimeSpent,
      currentStreak: 0, // Would need separate tracking
      totalXp,
      level: Math.floor(totalXp / 1000) + 1,
    };

    // 9. Generate recommendations (placeholder - in production would use ML)
    const recommendedCourses: RecommendedCourse[] = [];
    // Recommendations would be fetched from a separate service/collection

    log.info('Learner dashboard fetched', {
      userId,
      tenantId,
      inProgress: inProgressCourses.length,
      assigned: assignedCourses.length,
      completed: completedCourses.length,
    });

    return NextResponse.json({
      progressSummary,
      inProgressCourses,
      assignedCourses,
      recommendedCourses,
      completedCourses,
    });
  } catch (error: unknown) {
    log.error('Failed to fetch learner dashboard', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Map enrollment status to learner course status
 */
function mapEnrollmentStatus(status: string): 'not_started' | 'in_progress' | 'completed' {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'in_progress':
      return 'in_progress';
    default:
      return 'not_started';
  }
}
