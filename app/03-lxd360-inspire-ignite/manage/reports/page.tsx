'use client';

export const dynamic = 'force-dynamic';

import { Calendar, Download, FileText, Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock reports data - TODO: Replace with actual report generation
const reportsData = {
  templates: [
    {
      id: 'usage-summary',
      name: 'Usage Summary',
      description: 'Overview of platform usage across organizations',
      lastRun: '2024-01-15T10:00:00',
      schedule: 'weekly',
    },
    {
      id: 'completion-report',
      name: 'Course Completion Report',
      description: 'Detailed completion metrics by course and organization',
      lastRun: '2024-01-14T08:00:00',
      schedule: 'monthly',
    },
    {
      id: 'compliance-audit',
      name: 'Compliance Audit Report',
      description: 'Compliance status and findings across all frameworks',
      lastRun: '2024-01-10T12:00:00',
      schedule: 'monthly',
    },
    {
      id: 'xapi-export',
      name: 'xAPI Statement Export',
      description: 'Export learning record statements for analysis',
      lastRun: '2024-01-15T06:00:00',
      schedule: 'daily',
    },
  ],
  recentReports: [
    {
      id: '1',
      name: 'Usage Summary - January 2024',
      template: 'usage-summary',
      generatedAt: '2024-01-15T10:00:00',
      status: 'ready',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'xAPI Export - 2024-01-15',
      template: 'xapi-export',
      generatedAt: '2024-01-15T06:00:00',
      status: 'ready',
      size: '15.8 MB',
    },
    {
      id: '3',
      name: 'Completion Report - December 2023',
      template: 'completion-report',
      generatedAt: '2024-01-02T08:00:00',
      status: 'ready',
      size: '1.2 MB',
    },
    {
      id: '4',
      name: 'Compliance Audit - Q4 2023',
      template: 'compliance-audit',
      generatedAt: '2024-01-10T12:00:00',
      status: 'ready',
      size: '3.1 MB',
    },
  ],
};

/**
 * Reports page - Generate and download reports
 */
export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and download platform reports</p>
        </div>
        <Button className="gap-2 bg-lxd-purple hover:bg-lxd-purple/90">
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Report
        </Button>
      </div>

      {/* Report Templates */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">Report Templates</CardTitle>
          <CardDescription>Pre-configured reports you can generate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportsData.templates.map((template) => (
              <div
                key={template.id}
                className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border hover:border-lxd-purple/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-lxd-purple mt-0.5" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-medium text-brand-primary">{template.name}</h3>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      {template.schedule}
                    </span>
                    <span>Last: {new Date(template.lastRun).toLocaleDateString()}</span>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Play className="w-3 h-3" aria-hidden="true" />
                    Run
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">Recent Reports</CardTitle>
          <CardDescription>Generated reports available for download</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportsData.recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-lg bg-lxd-dark-bg/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-brand-primary">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Generated: {new Date(report.generatedAt).toLocaleString()} • {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'px-2 py-1 text-xs rounded-full',
                      report.status === 'ready'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400',
                    )}
                  >
                    {report.status}
                  </span>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="w-3 h-3" aria-hidden="true" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
