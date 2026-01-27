import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-manager-compliance' });

// Personas that can access compliance data
const MANAGER_PERSONAS = ['owner', 'manager'];

/** Compliance requirement response shape */
interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  courseId: string;
  courseTitle: string;
  dueDate?: string;
  totalLearners: number;
  completedCount: number;
  inProgressCount: number;
  overdueCount: number;
  complianceRate: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
}

/** Learner compliance status */
interface LearnerComplianceStatus {
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  requirementId: string;
  requirementName: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'overdue';
  progress: number;
  dueDate?: string;
  completedAt?: string;
}

/** API Response shape */
interface ComplianceResponse {
  requirements: ComplianceRequirement[];
  overdueLearners: LearnerComplianceStatus[];
  summary: {
    totalRequirements: number;
    compliantCount: number;
    atRiskCount: number;
    nonCompliantCount: number;
    overallComplianceRate: number;
  };
}

/** Firestore course document shape */
interface CourseDoc {
  title: string;
  description?: string;
  category?: string;
  isCompliance: boolean;
  complianceDueDate?: { toDate: () => Date };
}

/** Firestore enrollment document shape */
interface EnrollmentDoc {
  learnerId: string;
  courseId: string;
  status: string;
  progress: number;
  dueDate?: { toDate: () => Date };
  completedAt?: { toDate: () => Date };
}

/** Firestore member document shape */
interface MemberDoc {
  displayName?: string;
  email?: string;
  persona?: string;
}

/**
 * GET /api/ignite/manager/compliance
 *
 * Fetch compliance requirements and learner status.
 * Returns aggregated compliance data for manager oversight.
 */
export async function GET(
  req: Request,
): Promise<NextResponse<ComplianceResponse | { error: string }>> {
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
        { error: 'You do not have permission to access compliance data' },
        { status: 403 },
      );
    }

    log.info('Fetching compliance data', { userId, tenantId });

    // 4. Fetch compliance courses
    const coursesSnapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('courses')
      .where('isCompliance', '==', true)
      .get();

    const complianceCourses = new Map<string, CourseDoc>();
    for (const doc of coursesSnapshot.docs) {
      complianceCourses.set(doc.id, doc.data() as CourseDoc);
    }

    if (complianceCourses.size === 0) {
      // No compliance courses, return empty response
      return NextResponse.json({
        requirements: [],
        overdueLearners: [],
        summary: {
          totalRequirements: 0,
          compliantCount: 0,
          atRiskCount: 0,
          nonCompliantCount: 0,
          overallComplianceRate: 100,
        },
      });
    }

    // 5. Fetch all learners
    const membersSnapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('members')
      .where('persona', '==', 'learner')
      .get();

    const learnerMap = new Map<string, MemberDoc>();
    for (const doc of membersSnapshot.docs) {
      learnerMap.set(doc.id, doc.data() as MemberDoc);
    }

    const totalLearners = learnerMap.size;

    // 6. Fetch enrollments for compliance courses
    const courseIds = Array.from(complianceCourses.keys());
    const enrollmentsByCourseLearner = new Map<string, EnrollmentDoc>();

    // Query enrollments in batches
    const batches: string[][] = [];
    for (let i = 0; i < courseIds.length; i += 30) {
      batches.push(courseIds.slice(i, i + 30));
    }

    for (const batch of batches) {
      const enrollmentsSnapshot = await adminDb
        .collection('tenants')
        .doc(tenantId)
        .collection('enrollments')
        .where('courseId', 'in', batch)
        .get();

      for (const doc of enrollmentsSnapshot.docs) {
        const data = doc.data() as EnrollmentDoc;
        // Only include enrollments for actual learners
        if (learnerMap.has(data.learnerId)) {
          enrollmentsByCourseLearner.set(`${data.courseId}_${data.learnerId}`, data);
        }
      }
    }

    // 7. Calculate compliance status for each requirement
    const requirements: ComplianceRequirement[] = [];
    const overdueLearners: LearnerComplianceStatus[] = [];
    const now = new Date();

    for (const [courseId, course] of complianceCourses) {
      let completedCount = 0;
      let inProgressCount = 0;
      let overdueCount = 0;

      // Check each learner's status for this compliance requirement
      for (const [learnerId, learner] of learnerMap) {
        const enrollmentKey = `${courseId}_${learnerId}`;
        const enrollment = enrollmentsByCourseLearner.get(enrollmentKey);

        let status: 'completed' | 'in_progress' | 'not_started' | 'overdue' = 'not_started';
        let progress = 0;
        let dueDate: Date | undefined;

        if (enrollment) {
          progress = enrollment.progress;
          dueDate = enrollment.dueDate?.toDate() || course.complianceDueDate?.toDate();

          if (enrollment.status === 'completed') {
            status = 'completed';
            completedCount++;
          } else if (dueDate && dueDate < now) {
            status = 'overdue';
            overdueCount++;

            // Add to overdue learners list
            overdueLearners.push({
              learnerId,
              learnerName: learner.displayName || learner.email?.split('@')[0] || 'Unknown',
              learnerEmail: learner.email || '',
              requirementId: courseId,
              requirementName: course.title,
              status,
              progress,
              dueDate: dueDate.toISOString(),
            });
          } else if (enrollment.status === 'in_progress' || progress > 0) {
            status = 'in_progress';
            inProgressCount++;
          }
        } else {
          // Not enrolled - consider this as not started
          // Check if course has a global due date that's passed
          dueDate = course.complianceDueDate?.toDate();
          if (dueDate && dueDate < now) {
            status = 'overdue';
            overdueCount++;

            overdueLearners.push({
              learnerId,
              learnerName: learner.displayName || learner.email?.split('@')[0] || 'Unknown',
              learnerEmail: learner.email || '',
              requirementId: courseId,
              requirementName: course.title,
              status,
              progress: 0,
              dueDate: dueDate.toISOString(),
            });
          }
        }
      }

      // Calculate compliance rate and status
      const complianceRate =
        totalLearners > 0 ? Math.round((completedCount / totalLearners) * 100) : 0;

      let requirementStatus: 'compliant' | 'at_risk' | 'non_compliant';
      if (complianceRate >= 90) {
        requirementStatus = 'compliant';
      } else if (complianceRate >= 70) {
        requirementStatus = 'at_risk';
      } else {
        requirementStatus = 'non_compliant';
      }

      requirements.push({
        id: courseId,
        name: course.title,
        description: course.description || '',
        category: course.category || 'General',
        courseId,
        courseTitle: course.title,
        dueDate: course.complianceDueDate?.toDate()?.toISOString(),
        totalLearners,
        completedCount,
        inProgressCount,
        overdueCount,
        complianceRate,
        status: requirementStatus,
      });
    }

    // 8. Sort requirements by status severity
    const statusOrder = { non_compliant: 0, at_risk: 1, compliant: 2 };
    requirements.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    // 9. Sort overdue learners by due date (most overdue first)
    overdueLearners.sort((a, b) => {
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return aDate - bDate;
    });

    // Limit overdue learners to top 50
    const limitedOverdueLearners = overdueLearners.slice(0, 50);

    // 10. Calculate summary
    const compliantCount = requirements.filter((r) => r.status === 'compliant').length;
    const atRiskCount = requirements.filter((r) => r.status === 'at_risk').length;
    const nonCompliantCount = requirements.filter((r) => r.status === 'non_compliant').length;

    const totalCompleted = requirements.reduce((sum, r) => sum + r.completedCount, 0);
    const totalRequired = requirements.length * totalLearners;
    const overallComplianceRate =
      totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 100;

    log.info('Compliance data fetched', {
      userId,
      tenantId,
      requirementsCount: requirements.length,
      overdueLearnerCount: overdueLearners.length,
      overallComplianceRate,
    });

    return NextResponse.json({
      requirements,
      overdueLearners: limitedOverdueLearners,
      summary: {
        totalRequirements: requirements.length,
        compliantCount,
        atRiskCount,
        nonCompliantCount,
        overallComplianceRate,
      },
    });
  } catch (error: unknown) {
    log.error('Failed to fetch compliance data', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/ignite/manager/compliance/export
 *
 * Export compliance data as CSV
 */
export async function POST(
  req: Request,
): Promise<NextResponse<{ csv: string } | { error: string }>> {
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
      return NextResponse.json(
        { error: 'You do not have permission to export compliance data' },
        { status: 403 },
      );
    }

    // 4. Parse request body
    const body = await req.json();
    const { type } = body as { type: 'requirements' | 'overdue' };

    log.info('Exporting compliance data', { userId, tenantId, type });

    // 5. Fetch data (reuse GET logic internally)
    // For simplicity, we'll fetch the data directly here

    // Fetch compliance courses
    const coursesSnapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('courses')
      .where('isCompliance', '==', true)
      .get();

    if (type === 'requirements') {
      // Export requirements summary
      const rows: string[] = [
        'Requirement,Category,Total Learners,Completed,In Progress,Overdue,Compliance Rate,Status',
      ];

      for (const doc of coursesSnapshot.docs) {
        const course = doc.data() as CourseDoc;
        // Simplified: just export course info
        rows.push(`"${course.title}","${course.category || 'General'}",0,0,0,0,0%,Pending`);
      }

      return NextResponse.json({ csv: rows.join('\n') });
    } else {
      // Export overdue learners
      const rows: string[] = ['Learner Name,Email,Requirement,Due Date,Progress,Status'];

      // Fetch learners and enrollments
      const membersSnapshot = await adminDb
        .collection('tenants')
        .doc(tenantId)
        .collection('members')
        .where('persona', '==', 'learner')
        .get();

      const learnerMap = new Map<string, MemberDoc>();
      for (const doc of membersSnapshot.docs) {
        learnerMap.set(doc.id, doc.data() as MemberDoc);
      }

      const courseIds = coursesSnapshot.docs.map((d) => d.id);
      const courseMap = new Map<string, CourseDoc>();
      for (const doc of coursesSnapshot.docs) {
        courseMap.set(doc.id, doc.data() as CourseDoc);
      }

      if (courseIds.length > 0) {
        const now = new Date();
        const batches: string[][] = [];
        for (let i = 0; i < courseIds.length; i += 30) {
          batches.push(courseIds.slice(i, i + 30));
        }

        for (const batch of batches) {
          const enrollmentsSnapshot = await adminDb
            .collection('tenants')
            .doc(tenantId)
            .collection('enrollments')
            .where('courseId', 'in', batch)
            .get();

          for (const doc of enrollmentsSnapshot.docs) {
            const enrollment = doc.data() as EnrollmentDoc;
            const dueDate = enrollment.dueDate?.toDate();

            if (dueDate && dueDate < now && enrollment.status !== 'completed') {
              const learner = learnerMap.get(enrollment.learnerId);
              const course = courseMap.get(enrollment.courseId);

              if (learner && course) {
                rows.push(
                  `"${learner.displayName || 'Unknown'}","${learner.email || ''}","${course.title}","${dueDate.toISOString().split('T')[0]}",${enrollment.progress}%,Overdue`,
                );
              }
            }
          }
        }
      }

      return NextResponse.json({ csv: rows.join('\n') });
    }
  } catch (error: unknown) {
    log.error('Failed to export compliance data', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
