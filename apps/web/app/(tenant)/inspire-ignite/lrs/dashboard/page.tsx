'use client';

export const dynamic = 'force-dynamic';

import { Activity, Clock, Database, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock LRS dashboard data - TODO(LXD-301): Replace with BigQuery queries
const lrsDashboardData = {
  stats: {
    totalStatements: 1234567,
    statementsToday: 12456,
    avgLatency: 45,
    pipelineHealth: 'healthy',
  },
  recentStatements: [
    {
      id: '1',
      actor: 'john.smith@acme.com',
      verb: 'completed',
      object: 'Module 3 Quiz',
      timestamp: '2024-01-15T10:30:00',
    },
    {
      id: '2',
      actor: 'sarah.johnson@acme.com',
      verb: 'answered',
      object: 'Question 5',
      timestamp: '2024-01-15T10:28:00',
    },
    {
      id: '3',
      actor: 'mike.davis@globalind.com',
      verb: 'launched',
      object: 'Data Analytics Course',
      timestamp: '2024-01-15T10:25:00',
    },
    {
      id: '4',
      actor: 'emily.brown@techstart.io',
      verb: 'progressed',
      object: 'Leadership Module',
      timestamp: '2024-01-15T10:22:00',
    },
  ],
  verbDistribution: [
    { verb: 'launched', count: 4567, percentage: 25 },
    { verb: 'completed', count: 3456, percentage: 19 },
    { verb: 'answered', count: 5678, percentage: 31 },
    { verb: 'progressed', count: 2345, percentage: 13 },
    { verb: 'interacted', count: 2190, percentage: 12 },
  ],
  hourlyActivity: [
    { hour: '00', count: 120 },
    { hour: '04', count: 85 },
    { hour: '08', count: 456 },
    { hour: '12', count: 678 },
    { hour: '16', count: 543 },
    { hour: '20', count: 321 },
  ],
};

/**
 * LRS Dashboard - Overview of learning record store
 */
export default function LRSDashboardPage() {
  const maxHourly = Math.max(...lrsDashboardData.hourlyActivity.map((h) => h.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">LRS Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor xAPI statement ingestion and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-brand-primary">
              {lrsDashboardData.stats.totalStatements.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Statements</p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
              <span className="text-xs text-green-500">+23%</span>
            </div>
            <p className="text-2xl font-bold text-brand-primary">
              {lrsDashboardData.stats.statementsToday.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-brand-primary">
              {lrsDashboardData.stats.avgLatency}ms
            </p>
            <p className="text-sm text-muted-foreground">Avg Latency</p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
              <span className="w-3 h-3 rounded-full bg-green-500" role="img" aria-label="Healthy" />
            </div>
            <p className="text-2xl font-bold text-brand-primary capitalize">
              {lrsDashboardData.stats.pipelineHealth}
            </p>
            <p className="text-sm text-muted-foreground">Pipeline Status</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Statements */}
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary">Recent Statements</CardTitle>
            <CardDescription>Latest xAPI statements received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lrsDashboardData.recentStatements.map((statement) => (
                <div key={statement.id} className="p-3 rounded-lg bg-lxd-dark-bg/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-brand-primary">{statement.actor}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(statement.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-lxd-purple">{statement.verb}</span> {statement.object}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verb Distribution */}
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary">Verb Distribution</CardTitle>
            <CardDescription>Statement types by verb</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lrsDashboardData.verbDistribution.map((item) => (
                <div key={item.verb} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-primary capitalize">{item.verb}</span>
                    <span className="text-muted-foreground">
                      {item.count.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-lxd-dark-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lxd-purple rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">Hourly Activity</CardTitle>
          <CardDescription>Statement volume over time (UTC)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-48 gap-2">
            {lrsDashboardData.hourlyActivity.map((hour) => (
              <div key={hour.hour} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-brand-primary">{hour.count}</span>
                <div
                  className="w-full bg-lxd-purple/80 rounded-t transition-all"
                  style={{ height: `${(hour.count / maxHourly) * 150}px` }}
                />
                <span className="text-xs text-muted-foreground">{hour.hour}:00</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
