'use client';

export const dynamic = 'force-dynamic';

import { AlertTriangle, BookOpen, Building, Server, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock admin dashboard data - TODO(LXD-301): Replace with Firestore queries
const dashboardData = {
  stats: {
    totalUsers: 1234,
    usersChange: 56,
    activeOrganizations: 12,
    totalCourses: 89,
    systemHealth: 'healthy',
  },
  alerts: [
    {
      id: '1',
      type: 'warning',
      title: 'Storage nearing capacity',
      description: 'Media storage is at 85% capacity',
      timestamp: '2024-01-15T10:00:00',
    },
    {
      id: '2',
      type: 'info',
      title: 'Scheduled maintenance',
      description: 'System maintenance scheduled for Sunday 2AM UTC',
      timestamp: '2024-01-14T16:00:00',
    },
  ],
  recentActivity: [
    {
      id: '1',
      action: 'User created',
      details: 'john.smith@acme.com',
      timestamp: '2024-01-15T09:30:00',
    },
    {
      id: '2',
      action: 'Course published',
      details: 'Leadership 101',
      timestamp: '2024-01-15T09:15:00',
    },
    {
      id: '3',
      action: 'Organization created',
      details: 'Acme Corp',
      timestamp: '2024-01-15T08:45:00',
    },
    {
      id: '4',
      action: 'Bulk user import',
      details: '45 users imported',
      timestamp: '2024-01-14T16:30:00',
    },
  ],
  topOrganizations: [
    { name: 'Acme Corporation', users: 156, courses: 12 },
    { name: 'Global Industries', users: 89, courses: 8 },
    { name: 'TechStart Inc', users: 67, courses: 5 },
  ],
};

/**
 * Admin Dashboard - System overview and quick actions
 */
export default function ManageDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={dashboardData.stats.totalUsers.toLocaleString()}
          change={`+${dashboardData.stats.usersChange} this month`}
        />
        <StatCard
          icon={Building}
          label="Organizations"
          value={dashboardData.stats.activeOrganizations}
        />
        <StatCard icon={BookOpen} label="Total Courses" value={dashboardData.stats.totalCourses} />
        <StatCard icon={TrendingUp} label="Active Sessions" value="234" change="Real-time" />
        <StatCard icon={Server} label="System Health" value="Healthy" status="healthy" />
      </div>

      {/* Alerts */}
      {dashboardData.alerts.length > 0 && (
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" aria-hidden="true" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg ${
                    alert.type === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-brand-primary">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary">Recent Activity</CardTitle>
            <CardDescription>Latest administrative actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-lxd-dark-bg/50"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-primary">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Organizations */}
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary">Top Organizations</CardTitle>
            <CardDescription>Most active organizations by users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topOrganizations.map((org, index) => (
                <div
                  key={org.name}
                  className="flex items-center gap-4 p-3 rounded-lg bg-lxd-dark-bg/50"
                >
                  <div className="w-8 h-8 rounded-full bg-lxd-purple/20 flex items-center justify-center text-sm font-bold text-lxd-purple">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-primary">{org.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {org.users} users • {org.courses} courses
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/(tenant)/ignite/manage/organizations"
              className="block mt-4 text-sm text-lxd-purple hover:underline text-center"
            >
              View All Organizations →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction href="/(tenant)/ignite/manage/users" icon={Users} label="Add User" />
            <QuickAction
              href="/(tenant)/ignite/manage/organizations"
              icon={Building}
              label="Add Organization"
            />
            <QuickAction
              href="/(tenant)/ignite/manage/reports"
              icon={TrendingUp}
              label="Generate Report"
            />
            <QuickAction
              href="/(tenant)/ignite/manage/compliance"
              icon={Server}
              label="System Audit"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  change?: string;
  status?: 'healthy' | 'warning' | 'error';
}

function StatCard({ icon: Icon, label, value, change, status }: StatCardProps) {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
          {status && (
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'healthy'
                  ? 'bg-green-500'
                  : status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              role="img"
              aria-label={`Status: ${status}`}
            />
          )}
        </div>
        <p className="text-2xl font-bold text-brand-primary">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {change && <p className="text-xs text-green-500 mt-1">{change}</p>}
      </CardContent>
    </Card>
  );
}

interface QuickActionProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function QuickAction({ href, icon: Icon, label }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-lxd-dark-border hover:border-lxd-purple/50 hover:bg-lxd-purple/10 transition-colors"
    >
      <Icon className="w-6 h-6 text-lxd-purple" aria-hidden="true" />
      <span className="text-sm text-brand-primary">{label}</span>
    </Link>
  );
}
