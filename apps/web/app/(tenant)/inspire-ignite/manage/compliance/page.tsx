'use client';

export const dynamic = 'force-dynamic';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  RefreshCw,
  Shield,
  Users,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** Compliance requirement from API */
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

/** Overdue learner from API */
interface OverdueLearner {
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  requirementId: string;
  requirementName: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'overdue';
  progress: number;
  dueDate?: string;
}

/** API response shape */
interface ComplianceResponse {
  requirements: ComplianceRequirement[];
  overdueLearners: OverdueLearner[];
  summary: {
    totalRequirements: number;
    compliantCount: number;
    atRiskCount: number;
    nonCompliantCount: number;
    overallComplianceRate: number;
  };
}

/** Get Firebase ID token for API authentication */
async function getIdToken(): Promise<string> {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

/**
 * Compliance Dashboard - Monitor learner compliance status
 *
 * Features:
 * - Overall compliance summary
 * - Compliance requirements list with status
 * - Overdue learners breakdown
 * - Export to CSV functionality
 */
export default function CompliancePage() {
  // Data state
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [overdueLearners, setOverdueLearners] = useState<OverdueLearner[]>([]);
  const [summary, setSummary] = useState<ComplianceResponse['summary'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch compliance data
  const fetchCompliance = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const response = await fetch('/api/ignite/manager/compliance', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch compliance data');
      }

      const data: ComplianceResponse = await response.json();
      setRequirements(data.requirements);
      setOverdueLearners(data.overdueLearners);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchCompliance();
  }, [fetchCompliance]);

  // Export to CSV
  const handleExport = async (type: 'requirements' | 'overdue') => {
    setIsExporting(true);

    try {
      const token = await getIdToken();
      const response = await fetch('/api/ignite/manager/compliance', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error('Failed to export');
      }

      const data = await response.json();

      // Download CSV
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Format due date
  const formatDueDate = (dateString?: string): string => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'compliant':
        return 'text-[var(--color-lxd-success)]';
      case 'at_risk':
        return 'text-[var(--color-lxd-caution)]';
      case 'non_compliant':
        return 'text-[var(--color-lxd-error)]';
      default:
        return 'text-muted-foreground';
    }
  };

  // Get status background
  const getStatusBg = (status: string): string => {
    switch (status) {
      case 'compliant':
        return 'bg-[var(--color-lxd-success)]/10';
      case 'at_risk':
        return 'bg-[var(--color-lxd-caution)]/10';
      case 'non_compliant':
        return 'bg-[var(--color-lxd-error)]/10';
      default:
        return 'bg-muted';
    }
  };

  // Get status icon
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4" aria-hidden="true" />;
      case 'at_risk':
        return <AlertTriangle className="w-4 h-4" aria-hidden="true" />;
      case 'non_compliant':
        return <XCircle className="w-4 h-4" aria-hidden="true" />;
      default:
        return <Clock className="w-4 h-4" aria-hidden="true" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Monitor team compliance with required training
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={fetchCompliance}
            disabled={isLoading}
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} aria-hidden="true" />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => handleExport('overdue')}
            disabled={isExporting}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export Overdue
          </Button>
        </div>
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
              onClick={fetchCompliance}
              className="ml-auto"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2
            className="w-8 h-8 animate-spin text-[var(--color-lxd-primary)]"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-5 h-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
                <span
                  className={cn(
                    'w-3 h-3 rounded-full',
                    summary.overallComplianceRate >= 90
                      ? 'bg-[var(--color-lxd-success)]'
                      : summary.overallComplianceRate >= 70
                        ? 'bg-[var(--color-lxd-caution)]'
                        : 'bg-[var(--color-lxd-error)]',
                  )}
                  role="img"
                  aria-label={`Compliance rate: ${summary.overallComplianceRate}%`}
                />
              </div>
              <p className="text-3xl font-bold text-foreground">{summary.overallComplianceRate}%</p>
              <p className="text-sm text-muted-foreground">Overall Compliance</p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4">
              <CheckCircle
                className="w-5 h-5 text-[var(--color-lxd-success)] mb-2"
                aria-hidden="true"
              />
              <p className="text-3xl font-bold text-foreground">{summary.compliantCount}</p>
              <p className="text-sm text-muted-foreground">Compliant Requirements</p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4">
              <AlertTriangle
                className="w-5 h-5 text-[var(--color-lxd-caution)] mb-2"
                aria-hidden="true"
              />
              <p className="text-3xl font-bold text-foreground">{summary.atRiskCount}</p>
              <p className="text-sm text-muted-foreground">At Risk</p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4">
              <XCircle className="w-5 h-5 text-[var(--color-lxd-error)] mb-2" aria-hidden="true" />
              <p className="text-3xl font-bold text-foreground">{summary.nonCompliantCount}</p>
              <p className="text-sm text-muted-foreground">Non-Compliant</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compliance Requirements */}
      {!isLoading && requirements.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Compliance Requirements</CardTitle>
              <CardDescription>Status of mandatory training by requirement</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => handleExport('requirements')}
              disabled={isExporting}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requirements.map((req) => (
                <div key={req.id} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-foreground">{req.name}</h3>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full',
                            getStatusBg(req.status),
                            getStatusColor(req.status),
                          )}
                        >
                          <StatusIcon status={req.status} />
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{req.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{req.complianceRate}%</p>
                      <p className="text-xs text-muted-foreground">
                        {req.completedCount}/{req.totalLearners} complete
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        req.complianceRate >= 90
                          ? 'bg-[var(--color-lxd-success)]'
                          : req.complianceRate >= 70
                            ? 'bg-[var(--color-lxd-caution)]'
                            : 'bg-[var(--color-lxd-error)]',
                      )}
                      style={{ width: `${req.complianceRate}%` }}
                    />
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-1 text-[var(--color-lxd-success)]">
                      <CheckCircle className="w-3 h-3" aria-hidden="true" />
                      <span>{req.completedCount} completed</span>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--color-lxd-caution)]">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      <span>{req.inProgressCount} in progress</span>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--color-lxd-error)]">
                      <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                      <span>{req.overdueCount} overdue</span>
                    </div>
                    {req.dueDate && (
                      <div className="flex items-center gap-1 text-muted-foreground ml-auto">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        <span>{formatDueDate(req.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Learners */}
      {!isLoading && overdueLearners.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[var(--color-lxd-error)]" aria-hidden="true" />
              Overdue Learners
            </CardTitle>
            <CardDescription>Team members who have missed compliance deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Learner
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Requirement
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                      Progress
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overdueLearners.map((learner, index) => (
                    <tr
                      key={`${learner.learnerId}-${learner.requirementId}-${index}`}
                      className="border-b border-border/50 hover:bg-muted/20"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-lxd-error)]/20 flex items-center justify-center text-[var(--color-lxd-error)] text-xs font-medium">
                            {learner.learnerName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {learner.learnerName}
                            </p>
                            <p className="text-xs text-muted-foreground">{learner.learnerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">{learner.requirementName}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-foreground">{learner.progress}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[var(--color-lxd-error)]">
                          {formatDueDate(learner.dueDate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && requirements.length === 0 && !error && (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No compliance requirements
            </h3>
            <p className="text-muted-foreground mb-4">
              No mandatory training courses have been configured yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
