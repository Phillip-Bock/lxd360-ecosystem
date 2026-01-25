'use client';

export const dynamic = 'force-dynamic';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock platform analytics - TODO(LXD-301): Replace with BigQuery queries
const analyticsData = {
  platformMetrics: {
    totalStatements: 1234567,
    statementsToday: 12456,
    avgDailyUsers: 234,
    peakConcurrent: 89,
  },
  topCourses: [
    { name: 'Workplace Safety', completions: 456, avgScore: 92 },
    { name: 'Leadership Fundamentals', completions: 321, avgScore: 88 },
    { name: 'Data Analytics', completions: 234, avgScore: 85 },
    { name: 'Communication Skills', completions: 198, avgScore: 90 },
  ],
  organizationActivity: [
    { name: 'Acme Corporation', users: 156, statements: 45678 },
    { name: 'Global Industries', users: 89, statements: 23456 },
    { name: 'Healthcare Partners', users: 234, statements: 78901 },
    { name: 'TechStart Inc', users: 67, statements: 12345 },
  ],
};

/**
 * Platform Analytics page - System-wide analytics
 */
export default function PlatformAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">System-wide metrics and insights</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" aria-hidden="true" />
          Export Data
        </Button>
      </div>

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total xAPI Statements</p>
            <p className="text-2xl font-bold text-brand-primary">
              {analyticsData.platformMetrics.totalStatements.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Statements Today</p>
            <p className="text-2xl font-bold text-brand-primary">
              {analyticsData.platformMetrics.statementsToday.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Daily Users</p>
            <p className="text-2xl font-bold text-brand-primary">
              {analyticsData.platformMetrics.avgDailyUsers}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Peak Concurrent</p>
            <p className="text-2xl font-bold text-brand-primary">
              {analyticsData.platformMetrics.peakConcurrent}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary">Top Courses</CardTitle>
            <CardDescription>Highest completion rates across platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topCourses.map((course, index) => (
                <div key={course.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-lxd-purple/20 flex items-center justify-center text-sm font-bold text-lxd-purple">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-primary">{course.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.completions} completions • {course.avgScore}% avg score
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Organization Activity */}
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary">Organization Activity</CardTitle>
            <CardDescription>Learning activity by organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.organizationActivity.map((org) => (
                <div key={org.name} className="p-3 rounded-lg bg-lxd-dark-bg/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-brand-primary">{org.name}</p>
                    <span className="text-xs text-muted-foreground">{org.users} users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-lxd-dark-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-lxd-purple rounded-full"
                        style={{
                          width: `${(org.statements / analyticsData.organizationActivity[0].statements) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {org.statements.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
