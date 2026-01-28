'use client';

export const dynamic = 'force-dynamic';

import { BarChart3, Clock, Download, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock analytics data - TODO(LXD-301): Replace with BigQuery/LRS queries
const analyticsData = {
  overview: {
    totalLearners: 156,
    learnersTrend: 12,
    avgCompletionRate: 72,
    completionTrend: 5,
    avgTimeSpent: '2h 15m',
    timeTrend: -8,
    avgScore: 84,
    scoreTrend: 3,
  },
  coursePerformance: [
    { name: 'Leadership Fundamentals', completion: 85, avgScore: 88, enrollments: 45 },
    { name: 'Workplace Safety', completion: 92, avgScore: 90, enrollments: 120 },
    { name: 'Data Analytics', completion: 65, avgScore: 78, enrollments: 32 },
    { name: 'Communication Skills', completion: 78, avgScore: 82, enrollments: 67 },
  ],
  engagementByDay: [
    { day: 'Mon', sessions: 45 },
    { day: 'Tue', sessions: 62 },
    { day: 'Wed', sessions: 58 },
    { day: 'Thu', sessions: 71 },
    { day: 'Fri', sessions: 49 },
    { day: 'Sat', sessions: 23 },
    { day: 'Sun', sessions: 18 },
  ],
  topPerformers: [
    { name: 'Sarah Johnson', score: 96, coursesCompleted: 4 },
    { name: 'John Smith', score: 92, coursesCompleted: 3 },
    { name: 'Emily Brown', score: 89, coursesCompleted: 3 },
  ],
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative';
}

function StatCard({ icon: Icon, label, value, change, changeType }: StatCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Icon className="w-5 h-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
          <div
            className={`flex items-center gap-1 text-xs ${
              changeType === 'positive'
                ? 'text-[var(--color-lxd-success)]'
                : 'text-[var(--color-lxd-error)]'
            }`}
          >
            {change > 0 ? (
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-3 h-3" aria-hidden="true" />
            )}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const maxSessions = Math.max(...analyticsData.engagementByDay.map((d) => d.sessions));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track course performance and learner engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-4 py-2 bg-card border border-border rounded-lg text-foreground"
            aria-label="Select time period"
            defaultValue="30d"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" aria-hidden="true" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Learners"
          value={analyticsData.overview.totalLearners}
          change={analyticsData.overview.learnersTrend}
          changeType="positive"
        />
        <StatCard
          icon={BarChart3}
          label="Avg Completion Rate"
          value={`${analyticsData.overview.avgCompletionRate}%`}
          change={analyticsData.overview.completionTrend}
          changeType="positive"
        />
        <StatCard
          icon={Clock}
          label="Avg Time Spent"
          value={analyticsData.overview.avgTimeSpent}
          change={analyticsData.overview.timeTrend}
          changeType="negative"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Score"
          value={`${analyticsData.overview.avgScore}%`}
          change={analyticsData.overview.scoreTrend}
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Course Performance</CardTitle>
            <CardDescription>Completion rates and scores by course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.coursePerformance.map((course) => (
                <div key={course.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate flex-1">
                      {course.name}
                    </span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{course.enrollments} enrolled</span>
                      <span className="text-[var(--color-lxd-success)]">
                        {course.avgScore}% avg
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-lxd-primary)] rounded-full transition-all"
                      style={{ width: `${course.completion}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{course.completion}% completion</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement by Day */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Weekly Engagement</CardTitle>
            <CardDescription>Learning sessions by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-48 gap-2">
              {analyticsData.engagementByDay.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-xs text-foreground mb-1">{day.sessions}</span>
                    <div
                      className="w-full bg-[var(--color-lxd-primary)]/80 rounded-t transition-all"
                      style={{ height: `${(day.sessions / maxSessions) * 150}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Top Performers</CardTitle>
          <CardDescription>Highest scoring learners this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyticsData.topPerformers.map((performer, index) => (
              <div
                key={performer.name}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-lxd-primary)]/20 flex items-center justify-center text-lg font-bold text-[var(--color-lxd-primary)]">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{performer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {performer.score}% avg • {performer.coursesCompleted} courses
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
