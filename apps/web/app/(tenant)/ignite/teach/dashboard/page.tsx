'use client';

export const dynamic = 'force-dynamic';

import { AlertTriangle, BookOpen, Clock, TrendingDown, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock instructor dashboard data - TODO: Replace with Firestore queries
const dashboardData = {
  stats: {
    activeLearners: 156,
    learnersChange: 12,
    coursesManaged: 8,
    avgCompletion: 72,
    completionChange: 5,
    atRiskLearners: 14,
  },
  recentSubmissions: [
    {
      id: '1',
      learner: 'John Smith',
      course: 'Leadership Fundamentals',
      assignment: 'Final Assessment',
      submittedAt: '2024-01-15T10:30:00',
      status: 'pending_review',
    },
    {
      id: '2',
      learner: 'Sarah Johnson',
      course: 'Workplace Safety',
      assignment: 'Module 3 Quiz',
      submittedAt: '2024-01-15T09:15:00',
      status: 'graded',
      score: 92,
    },
    {
      id: '3',
      learner: 'Mike Davis',
      course: 'Data Analytics',
      assignment: 'Practical Exercise',
      submittedAt: '2024-01-14T16:45:00',
      status: 'pending_review',
    },
  ],
  atRiskLearners: [
    {
      id: '1',
      name: 'Emily Brown',
      course: 'Compliance Training',
      lastActivity: '2024-01-08',
      progress: 35,
      risk: 'high',
    },
    {
      id: '2',
      name: 'David Wilson',
      course: 'Leadership Fundamentals',
      lastActivity: '2024-01-10',
      progress: 45,
      risk: 'medium',
    },
    {
      id: '3',
      name: 'Lisa Anderson',
      course: 'Project Management',
      lastActivity: '2024-01-11',
      progress: 50,
      risk: 'medium',
    },
  ],
};

/**
 * Instructor Dashboard - Overview of teaching activities
 */
export default function TeachDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Instructor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your courses and learners</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Active Learners"
          value={dashboardData.stats.activeLearners}
          change={dashboardData.stats.learnersChange}
          changeType="positive"
        />
        <StatCard
          icon={BookOpen}
          label="Courses Managed"
          value={dashboardData.stats.coursesManaged}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Completion"
          value={`${dashboardData.stats.avgCompletion}%`}
          change={dashboardData.stats.completionChange}
          changeType="positive"
        />
        <StatCard
          icon={AlertTriangle}
          label="At-Risk Learners"
          value={dashboardData.stats.atRiskLearners}
          changeType="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary">Recent Submissions</CardTitle>
            <CardDescription>Assignments and assessments awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-lxd-dark-bg/50"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-primary">{submission.learner}</p>
                    <p className="text-xs text-muted-foreground">
                      {submission.course} - {submission.assignment}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3 inline mr-1" aria-hidden="true" />
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {submission.status === 'pending_review' ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                        Needs Review
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                        {submission.score}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/(tenant)/ignite/teach/gradebook"
              className="block mt-4 text-sm text-lxd-purple hover:underline text-center"
            >
              View All in Gradebook →
            </Link>
          </CardContent>
        </Card>

        {/* At-Risk Learners */}
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary">At-Risk Learners</CardTitle>
            <CardDescription>Learners who may need intervention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.atRiskLearners.map((learner) => (
                <div
                  key={learner.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-lxd-dark-bg/50"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-primary">{learner.name}</p>
                    <p className="text-xs text-muted-foreground">{learner.course}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active: {new Date(learner.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        learner.risk === 'high'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {learner.progress}% complete
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/(tenant)/ignite/teach/learners?filter=at-risk"
              className="block mt-4 text-sm text-lxd-purple hover:underline text-center"
            >
              View All At-Risk Learners →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'warning';
}

function StatCard({ icon: Icon, label, value, change, changeType }: StatCardProps) {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Icon className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs ${
                changeType === 'positive'
                  ? 'text-green-500'
                  : changeType === 'negative'
                    ? 'text-red-500'
                    : 'text-yellow-500'
              }`}
            >
              {changeType === 'positive' ? (
                <TrendingUp className="w-3 h-3" aria-hidden="true" />
              ) : changeType === 'negative' ? (
                <TrendingDown className="w-3 h-3" aria-hidden="true" />
              ) : null}
              {changeType === 'warning' ? 'Attention needed' : `+${change}`}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-brand-primary mt-2">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
