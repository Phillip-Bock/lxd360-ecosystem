'use client';

export const dynamic = 'force-dynamic';

import { BarChart3, FileText, Settings, UserPlus } from 'lucide-react';
import Link from 'next/link';
import {
  type ComplianceStatus,
  ComplianceWidget,
  type DueDateItem,
  DueDatesList,
  type TeamMember,
  TeamProgressTable,
  type TeamStats,
  TeamStatsCard,
} from '@/components/ignite/manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// =============================================================================
// MOCK DATA — TODO(LXD-338): Replace with Firestore queries
// =============================================================================

const mockTeamStats: TeamStats = {
  totalLearners: 47,
  learnersChange: 5,
  avgCompletionRate: 72,
  completionChange: 4.2,
  avgScore: 84,
  scoreChange: 2.1,
  overdueAssignments: 8,
  overdueChange: -2,
  complianceRate: 85,
  complianceChange: 3.5,
};

const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@acme.com',
    avatarUrl: undefined,
    coursesAssigned: 5,
    coursesCompleted: 4,
    completionRate: 80,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    overdueCount: 0,
  },
  {
    id: 'tm-002',
    name: 'Marcus Johnson',
    email: 'marcus.j@acme.com',
    avatarUrl: undefined,
    coursesAssigned: 6,
    coursesCompleted: 6,
    completionRate: 100,
    lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    overdueCount: 0,
  },
  {
    id: 'tm-003',
    name: 'Emily Rodriguez',
    email: 'emily.r@acme.com',
    avatarUrl: undefined,
    coursesAssigned: 4,
    coursesCompleted: 2,
    completionRate: 50,
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    overdueCount: 2,
  },
  {
    id: 'tm-004',
    name: 'David Kim',
    email: 'david.kim@acme.com',
    avatarUrl: undefined,
    coursesAssigned: 5,
    coursesCompleted: 3,
    completionRate: 60,
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    overdueCount: 1,
  },
  {
    id: 'tm-005',
    name: 'Lisa Thompson',
    email: 'lisa.t@acme.com',
    avatarUrl: undefined,
    coursesAssigned: 3,
    coursesCompleted: 3,
    completionRate: 100,
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    overdueCount: 0,
  },
  {
    id: 'tm-006',
    name: 'James Wilson',
    email: 'james.w@acme.com',
    avatarUrl: undefined,
    coursesAssigned: 7,
    coursesCompleted: 2,
    completionRate: 29,
    lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    overdueCount: 3,
  },
  {
    id: 'tm-007',
    name: 'Amanda Foster',
    email: 'amanda.f@acme.com',
    avatarUrl: undefined,
    coursesAssigned: 4,
    coursesCompleted: 3,
    completionRate: 75,
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    overdueCount: 0,
  },
  {
    id: 'tm-008',
    name: 'Robert Martinez',
    email: 'robert.m@acme.com',
    avatarUrl: undefined,
    coursesAssigned: 5,
    coursesCompleted: 4,
    completionRate: 80,
    lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    overdueCount: 2,
  },
];

const mockComplianceData: ComplianceStatus[] = [
  {
    category: 'Safety Training',
    required: 47,
    completed: 45,
    status: 'compliant',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    category: 'Data Privacy',
    required: 47,
    completed: 38,
    status: 'at_risk',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    category: 'Harassment Prevention',
    required: 47,
    completed: 47,
    status: 'compliant',
  },
  {
    category: 'Ethics & Compliance',
    required: 47,
    completed: 30,
    status: 'non_compliant',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

const mockDueDates: DueDateItem[] = [
  {
    id: 'dd-001',
    title: 'Complete Ethics Module 3',
    courseTitle: 'Ethics & Compliance',
    learnerName: 'James Wilson',
    learnerId: 'tm-006',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days overdue
    isOverdue: true,
  },
  {
    id: 'dd-002',
    title: 'Final Assessment',
    courseTitle: 'Data Privacy',
    learnerName: 'Emily Rodriguez',
    learnerId: 'tm-003',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day overdue
    isOverdue: true,
  },
  {
    id: 'dd-003',
    title: 'Safety Certification Quiz',
    courseTitle: 'Safety Training',
    learnerName: 'David Kim',
    learnerId: 'tm-004',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Due tomorrow
    isOverdue: false,
  },
  {
    id: 'dd-004',
    title: 'Privacy Policy Acknowledgment',
    courseTitle: 'Data Privacy',
    learnerName: 'Robert Martinez',
    learnerId: 'tm-008',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
    isOverdue: false,
  },
  {
    id: 'dd-005',
    title: 'Annual Compliance Review',
    courseTitle: 'Ethics & Compliance',
    learnerName: 'Amanda Foster',
    learnerId: 'tm-007',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
    isOverdue: false,
  },
  {
    id: 'dd-006',
    title: 'Safety Refresher Course',
    courseTitle: 'Safety Training',
    learnerName: 'Lisa Thompson',
    learnerId: 'tm-005',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Due in 14 days
    isOverdue: false,
  },
];

// =============================================================================
// QUICK ACTIONS
// =============================================================================

interface QuickActionProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

function QuickAction({ href, icon: Icon, label, description }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:border-lxd-primary/30 hover:bg-lxd-primary/5 transition-all group"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lxd-primary/10 group-hover:bg-lxd-primary/20 transition-colors">
        <Icon className="h-5 w-5 text-lxd-primary" aria-hidden="true" />
      </div>
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

/**
 * Manager Dashboard - Team oversight and compliance tracking
 *
 * Provides managers with:
 * - Team overview statistics (KPIs)
 * - Compliance status by category
 * - Team progress table with sorting/filtering
 * - Upcoming due dates and deadlines
 * - Quick actions for common tasks
 */
export default function ManagerDashboardPage() {
  const handleExport = () => {
    // TODO(LXD-339): Implement CSV export functionality
    console.info('Export triggered - to be implemented');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Team oversight and compliance tracking
        </p>
      </div>

      {/* Team Stats Overview */}
      <TeamStatsCard stats={mockTeamStats} />

      {/* Compliance & Due Dates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceWidget complianceData={mockComplianceData} />
        <DueDatesList dueDates={mockDueDates} />
      </div>

      {/* Team Progress Table */}
      <TeamProgressTable members={mockTeamMembers} onExport={handleExport} />

      {/* Quick Actions */}
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              href="/ignite/manage/users"
              icon={UserPlus}
              label="Add Learner"
              description="Invite a new team member"
            />
            <QuickAction
              href="/ignite/manage/reports"
              icon={FileText}
              label="Generate Report"
              description="Export team progress data"
            />
            <QuickAction
              href="/ignite/manage/analytics"
              icon={BarChart3}
              label="View Analytics"
              description="Detailed performance metrics"
            />
            <QuickAction
              href="/ignite/manage/settings"
              icon={Settings}
              label="Team Settings"
              description="Configure team preferences"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
