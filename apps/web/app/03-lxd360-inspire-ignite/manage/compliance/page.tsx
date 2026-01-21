'use client';

export const dynamic = 'force-dynamic';

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  RefreshCw,
  Shield,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock compliance data - TODO: Replace with actual compliance checks
const complianceData = {
  overview: {
    complianceScore: 94,
    lastAudit: '2024-01-10',
    nextAudit: '2024-02-10',
    openIssues: 3,
  },
  frameworks: [
    {
      id: 'wcag',
      name: 'WCAG 2.2 AA',
      description: 'Web Content Accessibility Guidelines',
      status: 'compliant',
      score: 98,
      lastCheck: '2024-01-15T10:00:00',
    },
    {
      id: 'gdpr',
      name: 'GDPR',
      description: 'General Data Protection Regulation',
      status: 'compliant',
      score: 100,
      lastCheck: '2024-01-15T10:00:00',
    },
    {
      id: 'fedramp',
      name: 'FedRAMP Ready',
      description: 'Federal Risk and Authorization Management Program',
      status: 'in_progress',
      score: 85,
      lastCheck: '2024-01-14T14:00:00',
    },
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      description: 'Service Organization Control',
      status: 'pending',
      score: null,
      lastCheck: null,
    },
    {
      id: 'hipaa',
      name: 'HIPAA',
      description: 'Health Insurance Portability and Accountability',
      status: 'compliant',
      score: 96,
      lastCheck: '2024-01-13T09:00:00',
    },
    {
      id: 'eu-ai-act',
      name: 'EU AI Act',
      description: 'European Union Artificial Intelligence Act',
      status: 'compliant',
      score: 100,
      lastCheck: '2024-01-15T08:00:00',
    },
  ],
  recentFindings: [
    {
      id: '1',
      severity: 'medium',
      framework: 'FedRAMP',
      title: 'Missing audit logs for admin actions',
      status: 'in_progress',
      dueDate: '2024-01-20',
    },
    {
      id: '2',
      severity: 'low',
      framework: 'WCAG 2.2',
      title: 'Color contrast ratio below threshold on 2 pages',
      status: 'open',
      dueDate: '2024-01-25',
    },
    {
      id: '3',
      severity: 'low',
      framework: 'GDPR',
      title: 'Cookie consent banner needs update',
      status: 'open',
      dueDate: '2024-01-30',
    },
  ],
};

/**
 * Compliance Dashboard - Monitor compliance status across frameworks
 */
export default function CompliancePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Compliance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor compliance status across regulatory frameworks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Run Audit
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" aria-hidden="true" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
              <span
                className={cn(
                  'w-3 h-3 rounded-full',
                  complianceData.overview.complianceScore >= 90
                    ? 'bg-green-500'
                    : complianceData.overview.complianceScore >= 70
                      ? 'bg-yellow-500'
                      : 'bg-red-500',
                )}
                aria-label={`Score: ${complianceData.overview.complianceScore}%`}
              />
            </div>
            <p className="text-2xl font-bold text-brand-primary">
              {complianceData.overview.complianceScore}%
            </p>
            <p className="text-sm text-muted-foreground">Overall Score</p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <Clock className="w-5 h-5 text-lxd-purple mb-2" aria-hidden="true" />
            <p className="text-2xl font-bold text-brand-primary">
              {new Date(complianceData.overview.lastAudit).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">Last Audit</p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <FileText className="w-5 h-5 text-lxd-purple mb-2" aria-hidden="true" />
            <p className="text-2xl font-bold text-brand-primary">
              {new Date(complianceData.overview.nextAudit).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">Next Audit</p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mb-2" aria-hidden="true" />
            <p className="text-2xl font-bold text-brand-primary">
              {complianceData.overview.openIssues}
            </p>
            <p className="text-sm text-muted-foreground">Open Issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Frameworks */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">Compliance Frameworks</CardTitle>
          <CardDescription>Status of regulatory compliance across frameworks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceData.frameworks.map((framework) => (
              <div
                key={framework.id}
                className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-brand-primary">{framework.name}</h3>
                    <p className="text-xs text-muted-foreground">{framework.description}</p>
                  </div>
                  <StatusBadge status={framework.status} />
                </div>
                {framework.score !== null && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Compliance Score</span>
                      <span className="text-brand-primary">{framework.score}%</span>
                    </div>
                    <div className="h-2 bg-lxd-dark-border rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          framework.score >= 90
                            ? 'bg-green-500'
                            : framework.score >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500',
                        )}
                        style={{ width: `${framework.score}%` }}
                      />
                    </div>
                  </div>
                )}
                {framework.lastCheck && (
                  <p className="text-xs text-muted-foreground">
                    Last checked: {new Date(framework.lastCheck).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Findings */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">Open Findings</CardTitle>
          <CardDescription>Issues requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceData.recentFindings.map((finding) => (
              <div
                key={finding.id}
                className="flex items-start justify-between p-4 rounded-lg bg-lxd-dark-bg/50"
              >
                <div className="flex items-start gap-3">
                  <SeverityIcon severity={finding.severity} />
                  <div>
                    <p className="text-sm font-medium text-brand-primary">{finding.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {finding.framework} • Due: {new Date(finding.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2 py-1 text-xs rounded-full',
                    finding.status === 'open' && 'bg-red-500/20 text-red-400',
                    finding.status === 'in_progress' && 'bg-yellow-500/20 text-yellow-400',
                    finding.status === 'resolved' && 'bg-green-500/20 text-green-400',
                  )}
                >
                  {finding.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    compliant: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20' },
    in_progress: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
    pending: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-500/20' },
    non_compliant: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/20' },
  };

  const { icon: Icon, color, bg } = config[status as keyof typeof config] || config.pending;

  return (
    <span
      className={cn('inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full', bg, color)}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      {status.replace('_', ' ')}
    </span>
  );
}

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === 'high') {
    return <AlertTriangle className="w-5 h-5 text-red-500" aria-label="High severity" />;
  }
  if (severity === 'medium') {
    return <AlertTriangle className="w-5 h-5 text-yellow-500" aria-label="Medium severity" />;
  }
  return <AlertTriangle className="w-5 h-5 text-blue-500" aria-label="Low severity" />;
}
