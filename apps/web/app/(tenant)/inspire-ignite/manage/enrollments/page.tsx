'use client';

import { BulkEnrollDialog } from '@/components/ignite/enrollment/BulkEnrollDialog';
import { EnrollmentStats } from '@/components/ignite/enrollment/EnrollmentStats';
import type { Enrollment } from '@/components/ignite/enrollment/EnrollmentTable';
import { EnrollmentTable } from '@/components/ignite/enrollment/EnrollmentTable';
import type { Invitation } from '@/components/ignite/enrollment/InvitationsList';
import { InvitationsList } from '@/components/ignite/enrollment/InvitationsList';

// ============================================================================
// MOCK DATA - TODO(LXD-341): Replace with Firestore queries
// ============================================================================

const mockCourses = [
  { id: 'course-1', title: 'Leadership Fundamentals', enrolledCount: 245 },
  { id: 'course-2', title: 'Safety Compliance Training', enrolledCount: 412 },
  { id: 'course-3', title: 'Customer Service Excellence', enrolledCount: 128 },
  { id: 'course-4', title: 'Data Privacy & Security', enrolledCount: 89 },
];

const mockLearners = [
  { id: 'learner-1', name: 'John Smith', email: 'john.smith@example.com' },
  { id: 'learner-2', name: 'Sarah Johnson', email: 'sarah.johnson@example.com' },
  { id: 'learner-3', name: 'Mike Davis', email: 'mike.davis@example.com' },
  { id: 'learner-4', name: 'Emily Brown', email: 'emily.brown@example.com' },
  { id: 'learner-5', name: 'David Wilson', email: 'david.wilson@example.com' },
  { id: 'learner-6', name: 'Lisa Anderson', email: 'lisa.anderson@example.com' },
  { id: 'learner-7', name: 'James Taylor', email: 'james.taylor@example.com' },
  { id: 'learner-8', name: 'Jennifer Martinez', email: 'jennifer.martinez@example.com' },
  { id: 'learner-9', name: 'Robert Garcia', email: 'robert.garcia@example.com' },
  { id: 'learner-10', name: 'Michelle Lee', email: 'michelle.lee@example.com' },
];

const mockEnrollments: Enrollment[] = [
  {
    id: 'enroll-1',
    learnerId: 'learner-1',
    learnerName: 'John Smith',
    learnerEmail: 'john.smith@example.com',
    courseId: 'course-1',
    courseTitle: 'Leadership Fundamentals',
    enrolledAt: new Date('2026-01-10'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 65,
    dueDate: new Date('2026-02-15'),
  },
  {
    id: 'enroll-2',
    learnerId: 'learner-2',
    learnerName: 'Sarah Johnson',
    learnerEmail: 'sarah.johnson@example.com',
    courseId: 'course-1',
    courseTitle: 'Leadership Fundamentals',
    enrolledAt: new Date('2026-01-08'),
    enrolledBy: 'admin@example.com',
    status: 'completed',
    progress: 100,
    dueDate: new Date('2026-02-01'),
    completedAt: new Date('2026-01-25'),
  },
  {
    id: 'enroll-3',
    learnerId: 'learner-3',
    learnerName: 'Mike Davis',
    learnerEmail: 'mike.davis@example.com',
    courseId: 'course-2',
    courseTitle: 'Safety Compliance Training',
    enrolledAt: new Date('2026-01-05'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 35,
    dueDate: new Date('2026-01-20'),
  },
  {
    id: 'enroll-4',
    learnerId: 'learner-4',
    learnerName: 'Emily Brown',
    learnerEmail: 'emily.brown@example.com',
    courseId: 'course-2',
    courseTitle: 'Safety Compliance Training',
    enrolledAt: new Date('2026-01-12'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 78,
    dueDate: new Date('2026-02-28'),
  },
  {
    id: 'enroll-5',
    learnerId: 'learner-5',
    learnerName: 'David Wilson',
    learnerEmail: 'david.wilson@example.com',
    courseId: 'course-1',
    courseTitle: 'Leadership Fundamentals',
    enrolledAt: new Date('2025-12-01'),
    enrolledBy: 'admin@example.com',
    status: 'expired',
    progress: 20,
    dueDate: new Date('2026-01-15'),
  },
  {
    id: 'enroll-6',
    learnerId: 'learner-6',
    learnerName: 'Lisa Anderson',
    learnerEmail: 'lisa.anderson@example.com',
    courseId: 'course-3',
    courseTitle: 'Customer Service Excellence',
    enrolledAt: new Date('2026-01-15'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 45,
    dueDate: new Date('2026-03-01'),
  },
  {
    id: 'enroll-7',
    learnerId: 'learner-7',
    learnerName: 'James Taylor',
    learnerEmail: 'james.taylor@example.com',
    courseId: 'course-3',
    courseTitle: 'Customer Service Excellence',
    enrolledAt: new Date('2026-01-10'),
    enrolledBy: 'admin@example.com',
    status: 'completed',
    progress: 100,
    completedAt: new Date('2026-01-22'),
  },
  {
    id: 'enroll-8',
    learnerId: 'learner-8',
    learnerName: 'Jennifer Martinez',
    learnerEmail: 'jennifer.martinez@example.com',
    courseId: 'course-4',
    courseTitle: 'Data Privacy & Security',
    enrolledAt: new Date('2026-01-18'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 12,
    dueDate: new Date('2026-02-20'),
  },
  {
    id: 'enroll-9',
    learnerId: 'learner-9',
    learnerName: 'Robert Garcia',
    learnerEmail: 'robert.garcia@example.com',
    courseId: 'course-2',
    courseTitle: 'Safety Compliance Training',
    enrolledAt: new Date('2025-11-20'),
    enrolledBy: 'admin@example.com',
    status: 'withdrawn',
    progress: 55,
  },
  {
    id: 'enroll-10',
    learnerId: 'learner-1',
    learnerName: 'John Smith',
    learnerEmail: 'john.smith@example.com',
    courseId: 'course-2',
    courseTitle: 'Safety Compliance Training',
    enrolledAt: new Date('2026-01-20'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 5,
    dueDate: new Date('2026-03-15'),
  },
  {
    id: 'enroll-11',
    learnerId: 'learner-2',
    learnerName: 'Sarah Johnson',
    learnerEmail: 'sarah.johnson@example.com',
    courseId: 'course-3',
    courseTitle: 'Customer Service Excellence',
    enrolledAt: new Date('2026-01-14'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 88,
    dueDate: new Date('2026-02-10'),
  },
  {
    id: 'enroll-12',
    learnerId: 'learner-10',
    learnerName: 'Michelle Lee',
    learnerEmail: 'michelle.lee@example.com',
    courseId: 'course-1',
    courseTitle: 'Leadership Fundamentals',
    enrolledAt: new Date('2026-01-22'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 0,
    dueDate: new Date('2026-03-22'),
  },
  {
    id: 'enroll-13',
    learnerId: 'learner-4',
    learnerName: 'Emily Brown',
    learnerEmail: 'emily.brown@example.com',
    courseId: 'course-4',
    courseTitle: 'Data Privacy & Security',
    enrolledAt: new Date('2026-01-08'),
    enrolledBy: 'admin@example.com',
    status: 'completed',
    progress: 100,
    completedAt: new Date('2026-01-20'),
  },
  {
    id: 'enroll-14',
    learnerId: 'learner-6',
    learnerName: 'Lisa Anderson',
    learnerEmail: 'lisa.anderson@example.com',
    courseId: 'course-1',
    courseTitle: 'Leadership Fundamentals',
    enrolledAt: new Date('2026-01-05'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 72,
    dueDate: new Date('2026-02-05'),
  },
  {
    id: 'enroll-15',
    learnerId: 'learner-3',
    learnerName: 'Mike Davis',
    learnerEmail: 'mike.davis@example.com',
    courseId: 'course-4',
    courseTitle: 'Data Privacy & Security',
    enrolledAt: new Date('2026-01-19'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 28,
    dueDate: new Date('2026-02-28'),
  },
  {
    id: 'enroll-16',
    learnerId: 'learner-7',
    learnerName: 'James Taylor',
    learnerEmail: 'james.taylor@example.com',
    courseId: 'course-2',
    courseTitle: 'Safety Compliance Training',
    enrolledAt: new Date('2026-01-11'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 92,
    dueDate: new Date('2026-01-30'),
  },
  {
    id: 'enroll-17',
    learnerId: 'learner-8',
    learnerName: 'Jennifer Martinez',
    learnerEmail: 'jennifer.martinez@example.com',
    courseId: 'course-1',
    courseTitle: 'Leadership Fundamentals',
    enrolledAt: new Date('2026-01-16'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 40,
    dueDate: new Date('2026-03-01'),
  },
  {
    id: 'enroll-18',
    learnerId: 'learner-9',
    learnerName: 'Robert Garcia',
    learnerEmail: 'robert.garcia@example.com',
    courseId: 'course-3',
    courseTitle: 'Customer Service Excellence',
    enrolledAt: new Date('2026-01-21'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 15,
    dueDate: new Date('2026-03-10'),
  },
  {
    id: 'enroll-19',
    learnerId: 'learner-10',
    learnerName: 'Michelle Lee',
    learnerEmail: 'michelle.lee@example.com',
    courseId: 'course-2',
    courseTitle: 'Safety Compliance Training',
    enrolledAt: new Date('2026-01-17'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 60,
    dueDate: new Date('2026-02-25'),
  },
  {
    id: 'enroll-20',
    learnerId: 'learner-5',
    learnerName: 'David Wilson',
    learnerEmail: 'david.wilson@example.com',
    courseId: 'course-3',
    courseTitle: 'Customer Service Excellence',
    enrolledAt: new Date('2026-01-13'),
    enrolledBy: 'admin@example.com',
    status: 'completed',
    progress: 100,
    completedAt: new Date('2026-01-24'),
  },
  {
    id: 'enroll-21',
    learnerId: 'learner-1',
    learnerName: 'John Smith',
    learnerEmail: 'john.smith@example.com',
    courseId: 'course-4',
    courseTitle: 'Data Privacy & Security',
    enrolledAt: new Date('2026-01-23'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 8,
    dueDate: new Date('2026-03-20'),
  },
  {
    id: 'enroll-22',
    learnerId: 'learner-2',
    learnerName: 'Sarah Johnson',
    learnerEmail: 'sarah.johnson@example.com',
    courseId: 'course-4',
    courseTitle: 'Data Privacy & Security',
    enrolledAt: new Date('2026-01-06'),
    enrolledBy: 'admin@example.com',
    status: 'completed',
    progress: 100,
    completedAt: new Date('2026-01-18'),
  },
  {
    id: 'enroll-23',
    learnerId: 'learner-6',
    learnerName: 'Lisa Anderson',
    learnerEmail: 'lisa.anderson@example.com',
    courseId: 'course-2',
    courseTitle: 'Safety Compliance Training',
    enrolledAt: new Date('2026-01-09'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 55,
    dueDate: new Date('2026-02-15'),
  },
  {
    id: 'enroll-24',
    learnerId: 'learner-7',
    learnerName: 'James Taylor',
    learnerEmail: 'james.taylor@example.com',
    courseId: 'course-4',
    courseTitle: 'Data Privacy & Security',
    enrolledAt: new Date('2026-01-20'),
    enrolledBy: 'admin@example.com',
    status: 'active',
    progress: 22,
    dueDate: new Date('2026-03-05'),
  },
  {
    id: 'enroll-25',
    learnerId: 'learner-8',
    learnerName: 'Jennifer Martinez',
    learnerEmail: 'jennifer.martinez@example.com',
    courseId: 'course-3',
    courseTitle: 'Customer Service Excellence',
    enrolledAt: new Date('2025-12-15'),
    enrolledBy: 'admin@example.com',
    status: 'expired',
    progress: 45,
    dueDate: new Date('2026-01-10'),
  },
];

const mockInvitations: Invitation[] = [
  {
    id: 'inv-1',
    email: 'newuser1@example.com',
    courseId: 'course-1',
    courseTitle: 'Leadership Fundamentals',
    sentAt: new Date('2026-01-24'),
    expiresAt: new Date('2026-01-31'),
    status: 'pending',
  },
  {
    id: 'inv-2',
    email: 'newuser2@example.com',
    courseId: 'course-2',
    courseTitle: 'Safety Compliance Training',
    sentAt: new Date('2026-01-22'),
    expiresAt: new Date('2026-01-27'),
    status: 'pending',
  },
  {
    id: 'inv-3',
    email: 'contractor@partner.com',
    courseId: 'course-1',
    courseTitle: 'Leadership Fundamentals',
    sentAt: new Date('2026-01-20'),
    expiresAt: new Date('2026-02-03'),
    status: 'pending',
  },
  {
    id: 'inv-4',
    email: 'temp.employee@example.com',
    courseId: 'course-3',
    courseTitle: 'Customer Service Excellence',
    sentAt: new Date('2026-01-18'),
    expiresAt: new Date('2026-01-25'),
    status: 'expired',
  },
  {
    id: 'inv-5',
    email: 'intern@example.com',
    courseId: 'course-4',
    courseTitle: 'Data Privacy & Security',
    sentAt: new Date('2026-01-23'),
    expiresAt: new Date('2026-01-30'),
    status: 'pending',
  },
  {
    id: 'inv-6',
    email: 'remote.worker@example.com',
    courseId: 'course-2',
    courseTitle: 'Safety Compliance Training',
    sentAt: new Date('2026-01-10'),
    expiresAt: new Date('2026-01-17'),
    status: 'expired',
  },
];

// ============================================================================
// COMPUTED STATS
// ============================================================================

function computeStats(enrollments: Enrollment[]): {
  totalEnrolled: number;
  activeLearners: number;
  completionRate: number;
  pendingInvites: number;
} {
  const totalEnrolled = enrollments.length;
  const activeLearners = enrollments.filter((e) => e.status === 'active').length;
  const completed = enrollments.filter((e) => e.status === 'completed').length;
  const completionRate = totalEnrolled > 0 ? Math.round((completed / totalEnrolled) * 100) : 0;
  const pendingInvites = mockInvitations.filter((i) => i.status === 'pending').length;

  return { totalEnrolled, activeLearners, completionRate, pendingInvites };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function EnrollmentsPage() {
  const stats = computeStats(mockEnrollments);

  const handleBulkEnroll = (data: {
    courseIds: string[];
    learnerIds: string[];
    dueDate: string | null;
  }) => {
    // TODO(LXD-341): Implement actual enrollment logic with Firestore
    const totalEnrollments = data.courseIds.length * data.learnerIds.length;
    alert(
      `Enrolling ${data.learnerIds.length} learners into ${data.courseIds.length} courses (${totalEnrollments} total enrollments)`,
    );
  };

  const handleWithdraw = (enrollmentId: string) => {
    // TODO(LXD-341): Implement withdrawal logic
    alert(`Withdrawing enrollment: ${enrollmentId}`);
  };

  const handleExtend = (enrollmentId: string) => {
    // TODO(LXD-341): Implement extend due date logic
    alert(`Extending due date for: ${enrollmentId}`);
  };

  const handleRemind = (enrollmentId: string) => {
    // TODO(LXD-341): Implement send reminder logic
    alert(`Sending reminder for: ${enrollmentId}`);
  };

  const handleResendInvitation = (invitationId: string) => {
    // TODO(LXD-341): Implement resend invitation logic
    alert(`Resending invitation: ${invitationId}`);
  };

  const handleCancelInvitation = (invitationId: string) => {
    // TODO(LXD-341): Implement cancel invitation logic
    alert(`Canceling invitation: ${invitationId}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Enrollments</h1>
          <p className="text-muted-foreground mt-1">
            Manage learner enrollments and course assignments
          </p>
        </div>
        <BulkEnrollDialog
          courses={mockCourses}
          learners={mockLearners}
          onEnroll={handleBulkEnroll}
        />
      </div>

      {/* Stats */}
      <EnrollmentStats
        totalEnrolled={stats.totalEnrolled}
        activeLearners={stats.activeLearners}
        completionRate={stats.completionRate}
        pendingInvites={stats.pendingInvites}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enrollments Table - Takes 2 columns */}
        <div className="lg:col-span-2">
          <EnrollmentTable
            enrollments={mockEnrollments}
            onWithdraw={handleWithdraw}
            onExtend={handleExtend}
            onRemind={handleRemind}
          />
        </div>

        {/* Pending Invitations - Takes 1 column */}
        <div>
          <InvitationsList
            invitations={mockInvitations}
            onResend={handleResendInvitation}
            onCancel={handleCancelInvitation}
          />
        </div>
      </div>
    </div>
  );
}
