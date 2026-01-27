'use client';

export const dynamic = 'force-dynamic';

import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Play,
  Plus,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/** Report template */
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'team_progress' | 'compliance' | 'course_completion' | 'xapi_export';
  format: 'csv' | 'pdf';
  schedule?: 'daily' | 'weekly' | 'monthly';
  lastRun?: string;
}

/** Generated report */
interface GeneratedReport {
  id: string;
  name: string;
  templateId: string;
  generatedAt: string;
  status: 'generating' | 'ready' | 'failed';
  size?: string;
  downloadUrl?: string;
}

/** Get Firebase ID token for API authentication */
async function getIdToken(): Promise<string> {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

// Pre-defined report templates
const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'team-progress',
    name: 'Team Progress Report',
    description: 'Overview of team member progress across all courses',
    type: 'team_progress',
    format: 'csv',
    schedule: 'weekly',
    lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'compliance-status',
    name: 'Compliance Status Report',
    description: 'Detailed compliance tracking across all requirements',
    type: 'compliance',
    format: 'csv',
    schedule: 'monthly',
    lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'course-completion',
    name: 'Course Completion Report',
    description: 'Completion metrics broken down by course and learner',
    type: 'course_completion',
    format: 'csv',
    schedule: 'weekly',
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'xapi-statements',
    name: 'xAPI Statement Export',
    description: 'Export learning record statements for external analysis',
    type: 'xapi_export',
    format: 'csv',
    schedule: 'daily',
    lastRun: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Reports page - Generate and download reports
 *
 * Features:
 * - Pre-defined report templates
 * - Generate reports on-demand
 * - Export to CSV format
 * - Schedule recurring reports (placeholder)
 */
export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  // Generate a report
  const handleGenerateReport = useCallback(async (template: ReportTemplate) => {
    setIsGenerating(template.id);
    setError(null);

    try {
      const token = await getIdToken();

      // Create a new report entry in generating state
      const reportId = `report-${Date.now()}`;
      const newReport: GeneratedReport = {
        id: reportId,
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        templateId: template.id,
        generatedAt: new Date().toISOString(),
        status: 'generating',
      };

      setGeneratedReports((prev) => [newReport, ...prev]);

      // Fetch data based on template type
      let csvContent = '';
      let response: Response;

      switch (template.type) {
        case 'team_progress': {
          response = await fetch('/api/ignite/manager/users?pageSize=500', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error('Failed to fetch team data');

          const teamData = await response.json();
          csvContent = generateTeamProgressCSV(teamData.users);
          break;
        }

        case 'compliance': {
          response = await fetch('/api/ignite/manager/compliance', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error('Failed to fetch compliance data');

          const complianceData = await response.json();
          csvContent = generateComplianceCSV(complianceData);
          break;
        }

        case 'course_completion': {
          response = await fetch('/api/ignite/manager/dashboard', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error('Failed to fetch dashboard data');

          const dashboardData = await response.json();
          csvContent = generateCourseCompletionCSV(dashboardData);
          break;
        }

        case 'xapi_export':
          // TODO(LXD-341): Implement xAPI statement export from BigQuery
          csvContent = 'Statement ID,Actor,Verb,Object,Timestamp\n';
          csvContent += '"No xAPI statements available for export"';
          break;
      }

      // Create downloadable blob
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      // Update report status to ready
      setGeneratedReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                status: 'ready' as const,
                size: `${(blob.size / 1024).toFixed(1)} KB`,
                downloadUrl: url,
              }
            : r,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');

      // Update report status to failed
      setGeneratedReports((prev) =>
        prev.map((r) =>
          r.templateId === template.id && r.status === 'generating'
            ? { ...r, status: 'failed' as const }
            : r,
        ),
      );
    } finally {
      setIsGenerating(null);
    }
  }, []);

  // Download a report
  const handleDownload = (report: GeneratedReport) => {
    if (!report.downloadUrl) return;

    const a = document.createElement('a');
    a.href = report.downloadUrl;
    a.download = `${report.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format relative time
  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and export team performance reports</p>
        </div>
        <Button
          type="button"
          className="gap-2 bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90"
          onClick={() => setShowScheduleDialog(true)}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Schedule Report
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <Card className="bg-[var(--color-lxd-error)]/10 border-[var(--color-lxd-error)]/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--color-lxd-error)]" aria-hidden="true" />
            <p className="text-sm text-[var(--color-lxd-error)]">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Report Templates */}
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Report Templates</CardTitle>
          <CardDescription>Pre-configured reports you can generate on demand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REPORT_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-[var(--color-lxd-primary)]/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {template.format === 'csv' ? (
                      <FileSpreadsheet
                        className="w-5 h-5 text-[var(--color-lxd-primary)] mt-0.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <FileText
                        className="w-5 h-5 text-[var(--color-lxd-primary)] mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {template.schedule && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        {template.schedule}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {formatRelativeTime(template.lastRun)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => handleGenerateReport(template)}
                    disabled={isGenerating === template.id}
                  >
                    {isGenerating === template.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                    ) : (
                      <Play className="w-3 h-3" aria-hidden="true" />
                    )}
                    {isGenerating === template.id ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      {generatedReports.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Reports</CardTitle>
            <CardDescription>Reports generated in this session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{report.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Generated: {formatDate(report.generatedAt)}
                        {report.size && ` • ${report.size}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2 py-1 text-xs rounded-full',
                        report.status === 'ready' &&
                          'bg-[var(--color-lxd-success)]/20 text-[var(--color-lxd-success)]',
                        report.status === 'generating' &&
                          'bg-[var(--color-lxd-caution)]/20 text-[var(--color-lxd-caution)]',
                        report.status === 'failed' &&
                          'bg-[var(--color-lxd-error)]/20 text-[var(--color-lxd-error)]',
                      )}
                    >
                      {report.status === 'generating' && (
                        <Loader2 className="w-3 h-3 inline mr-1 animate-spin" aria-hidden="true" />
                      )}
                      {report.status === 'ready' && (
                        <Check className="w-3 h-3 inline mr-1" aria-hidden="true" />
                      )}
                      {report.status}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => handleDownload(report)}
                      disabled={report.status !== 'ready'}
                    >
                      <Download className="w-3 h-3" aria-hidden="true" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Configure automated report generation and delivery
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Scheduled reports feature coming soon. For now, you can generate reports on demand
              using the templates above.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to generate team progress CSV
function generateTeamProgressCSV(
  users: Array<{
    name: string;
    email: string;
    status: string;
    coursesAssigned: number;
    coursesCompleted: number;
    completionRate: number;
    overdueCount: number;
    lastActive: string | null;
  }>,
): string {
  const headers = [
    'Name',
    'Email',
    'Status',
    'Courses Assigned',
    'Courses Completed',
    'Completion Rate',
    'Overdue',
    'Last Active',
  ];
  const rows = users.map((user) => [
    `"${user.name}"`,
    `"${user.email}"`,
    user.status,
    user.coursesAssigned.toString(),
    user.coursesCompleted.toString(),
    `${user.completionRate}%`,
    user.overdueCount.toString(),
    user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never',
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

// Helper function to generate compliance CSV
function generateComplianceCSV(data: {
  requirements: Array<{
    name: string;
    category: string;
    totalLearners: number;
    completedCount: number;
    inProgressCount: number;
    overdueCount: number;
    complianceRate: number;
    status: string;
  }>;
  overdueLearners: Array<{
    learnerName: string;
    learnerEmail: string;
    requirementName: string;
    progress: number;
    dueDate?: string;
  }>;
}): string {
  // Requirements section
  let csv = 'COMPLIANCE REQUIREMENTS\n';
  csv +=
    'Requirement,Category,Total Learners,Completed,In Progress,Overdue,Compliance Rate,Status\n';

  for (const req of data.requirements) {
    csv += `"${req.name}","${req.category}",${req.totalLearners},${req.completedCount},${req.inProgressCount},${req.overdueCount},${req.complianceRate}%,${req.status}\n`;
  }

  // Overdue learners section
  csv += '\nOVERDUE LEARNERS\n';
  csv += 'Learner Name,Email,Requirement,Progress,Due Date\n';

  for (const learner of data.overdueLearners) {
    csv += `"${learner.learnerName}","${learner.learnerEmail}","${learner.requirementName}",${learner.progress}%,${learner.dueDate ? new Date(learner.dueDate).toLocaleDateString() : 'N/A'}\n`;
  }

  return csv;
}

// Helper function to generate course completion CSV
function generateCourseCompletionCSV(data: {
  teamMembers: Array<{
    name: string;
    email: string;
    coursesAssigned: number;
    coursesCompleted: number;
    completionRate: number;
  }>;
  teamStats: {
    totalLearners: number;
    avgCompletionRate: number;
    avgScore: number;
  };
}): string {
  let csv = 'COURSE COMPLETION SUMMARY\n';
  csv += `Total Learners,${data.teamStats.totalLearners}\n`;
  csv += `Average Completion Rate,${data.teamStats.avgCompletionRate}%\n`;
  csv += `Average Score,${data.teamStats.avgScore}%\n`;
  csv += '\n';

  csv += 'LEARNER DETAILS\n';
  csv += 'Name,Email,Courses Assigned,Courses Completed,Completion Rate\n';

  for (const member of data.teamMembers) {
    csv += `"${member.name}","${member.email}",${member.coursesAssigned},${member.coursesCompleted},${member.completionRate}%\n`;
  }

  return csv;
}
