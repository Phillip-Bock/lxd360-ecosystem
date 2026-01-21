'use client';

import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  Image,
  Loader2,
  Play,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
  AuditCategory,
  AuditConfig,
  AuditIssue,
  AuditSeverity,
  AuditStatus,
  InspireAuditReport,
} from './types';
import { getAuditCategoryDescription, getAuditCategoryLabel, getDefaultAuditConfig } from './types';

// =============================================================================
// COMPONENT
// =============================================================================

interface AuditDashboardProps {
  missionId: string;
  missionTitle?: string;
  onRunAudit?: (config: AuditConfig) => Promise<InspireAuditReport>;
  onViewIssue?: (issue: AuditIssue) => void;
  onFixIssue?: (issue: AuditIssue) => void;
  onExport?: () => void;
  initialReport?: InspireAuditReport;
  className?: string;
}

/**
 * AuditDashboard - Main dashboard for INSPIRE methodology audit
 *
 * Features:
 * - Run comprehensive audits across all categories
 * - View issues by category and severity
 * - Auto-fix available issues
 * - Export audit reports
 */
export function AuditDashboard({
  missionTitle = 'Untitled Mission',
  onRunAudit,
  onViewIssue,
  onFixIssue,
  onExport,
  initialReport,
  className,
}: AuditDashboardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<InspireAuditReport | undefined>(initialReport);
  const [config] = useState<AuditConfig>(getDefaultAuditConfig());
  const [selectedCategory, setSelectedCategory] = useState<AuditCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<AuditSeverity | 'all'>('all');

  const handleRunAudit = useCallback(async () => {
    if (!onRunAudit) return;

    setIsRunning(true);
    try {
      const newReport = await onRunAudit(config);
      setReport(newReport);
    } finally {
      setIsRunning(false);
    }
  }, [config, onRunAudit]);

  const filteredIssues = useMemo(() => {
    if (!report) return [];

    return report.allIssues.filter((issue) => {
      if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
      if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false;
      return true;
    });
  }, [report, selectedCategory, selectedSeverity]);

  const autoFixableIssues = useMemo(() => {
    return report?.allIssues.filter((issue) => issue.autoFixable) ?? [];
  }, [report]);

  const getStatusIcon = (status: AuditStatus) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Eye className="h-5 w-5 text-zinc-500" />;
    }
  };

  const getSeverityBadge = (severity: AuditSeverity) => {
    const config: Record<
      AuditSeverity,
      { variant: 'destructive' | 'secondary' | 'outline' | 'default'; label: string }
    > = {
      critical: { variant: 'destructive', label: 'Critical' },
      major: { variant: 'secondary', label: 'Major' },
      minor: { variant: 'outline', label: 'Minor' },
      info: { variant: 'default', label: 'Info' },
    };
    return config[severity];
  };

  const getCategoryIcon = (category: AuditCategory) => {
    const icons: Record<AuditCategory, React.ReactNode> = {
      'learning-design': <BookOpen className="h-4 w-4" />,
      'cognitive-load': <Brain className="h-4 w-4" />,
      accessibility: <Eye className="h-4 w-4" />,
      'xapi-tracking': <Target className="h-4 w-4" />,
      'content-quality': <FileText className="h-4 w-4" />,
      'media-optimization': <Image className="h-4 w-4" />,
      compliance: <Shield className="h-4 w-4" />,
    };
    return icons[category];
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={cn('flex flex-col gap-6 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">INSPIRE Audit</h2>
          <p className="text-sm text-muted-foreground">{missionTitle}</p>
        </div>
        <div className="flex gap-2">
          {report && (
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          )}
          <Button onClick={handleRunAudit} disabled={isRunning || !onRunAudit}>
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Audit...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Full Audit
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      {report ? (
        <div className="grid gap-4 md:grid-cols-5">
          {/* Overall Score */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardDescription>Overall Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {getStatusIcon(report.overallStatus)}
                <div className={cn('text-5xl font-bold', getScoreColor(report.overallScore))}>
                  {report.overallScore}%
                </div>
              </div>
              <Progress value={report.overallScore} className="mt-4" />
              <div className="mt-3 flex items-center gap-2">
                {report.readyToPublish ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Ready to Publish
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    Not Ready
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Issue Counts */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Critical</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-500" />
                <div className="text-3xl font-bold">{report.issuesBySeverity.critical}</div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Must fix before publish</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Major</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div className="text-3xl font-bold">{report.issuesBySeverity.major}</div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Should fix</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Auto-Fixable</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <div className="text-3xl font-bold">{autoFixableIssues.length}</div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">One-click fixes</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Audit Report Available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Run a full audit to analyze your mission content
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category Scores */}
      {report && (
        <div className="grid gap-4 md:grid-cols-7">
          {(
            [
              { key: 'learning-design', report: report.learningDesign },
              { key: 'cognitive-load', report: report.cognitiveLoad },
              { key: 'accessibility', report: report.accessibility },
              { key: 'xapi-tracking', report: report.xapiTracking },
              { key: 'content-quality', report: report.contentQuality },
              { key: 'media-optimization', report: report.mediaOptimization },
              { key: 'compliance', report: report.compliance },
            ] as const
          ).map(({ key, report: catReport }) => (
            <Card
              key={key}
              className={cn(
                'cursor-pointer transition-colors hover:bg-muted/50',
                selectedCategory === key && 'border-lxd-purple',
              )}
              onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
            >
              <CardContent className="pt-4 pb-3 px-3">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(key)}
                  <span className="text-xs font-medium truncate">{getAuditCategoryLabel(key)}</span>
                </div>
                <div className={cn('text-2xl font-bold', getScoreColor(catReport.score))}>
                  {catReport.score}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {catReport.issues.length} issues
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Results */}
      {report && (
        <Tabs defaultValue="issues" className="w-full">
          <TabsList>
            <TabsTrigger value="issues">All Issues ({report.totalIssues})</TabsTrigger>
            <TabsTrigger value="learning-design">
              Learning Design ({report.learningDesign.issues.length})
            </TabsTrigger>
            <TabsTrigger value="cognitive-load">
              Cognitive Load ({report.cognitiveLoad.issues.length})
            </TabsTrigger>
            <TabsTrigger value="accessibility">
              Accessibility ({report.accessibility.issues.length})
            </TabsTrigger>
            <TabsTrigger value="quickfixes">Quick Fixes ({autoFixableIssues.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Issues</CardTitle>
                  <div className="flex gap-2">
                    {/* Severity Filter */}
                    {(['all', 'critical', 'major', 'minor', 'info'] as const).map((sev) => (
                      <Badge
                        key={sev}
                        variant={selectedSeverity === sev ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedSeverity(sev)}
                      >
                        {sev === 'all' ? 'All' : sev}
                        {sev !== 'all' && ` (${report.issuesBySeverity[sev]})`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <IssueList
                  issues={filteredIssues}
                  onViewIssue={onViewIssue}
                  onFixIssue={onFixIssue}
                  getCategoryIcon={getCategoryIcon}
                  getSeverityBadge={getSeverityBadge}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning-design" className="mt-4">
            <LearningDesignDetails report={report.learningDesign} />
          </TabsContent>

          <TabsContent value="cognitive-load" className="mt-4">
            <CognitiveLoadDetails report={report.cognitiveLoad} />
          </TabsContent>

          <TabsContent value="accessibility" className="mt-4">
            <AccessibilityDetails report={report.accessibility} />
          </TabsContent>

          <TabsContent value="quickfixes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Fixes</CardTitle>
                <CardDescription>These issues can be automatically fixed</CardDescription>
              </CardHeader>
              <CardContent>
                {autoFixableIssues.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <Button
                        onClick={() => {
                          for (const issue of autoFixableIssues) {
                            onFixIssue?.(issue);
                          }
                        }}
                        variant="outline"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Fix All ({autoFixableIssues.length})
                      </Button>
                    </div>
                    <IssueList
                      issues={autoFixableIssues}
                      onViewIssue={onViewIssue}
                      onFixIssue={onFixIssue}
                      getCategoryIcon={getCategoryIcon}
                      getSeverityBadge={getSeverityBadge}
                      showFixButton
                    />
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No auto-fixable issues found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Recommendations */}
      {report && report.topRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.topRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 text-lxd-purple" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Publish Blockers */}
      {report && !report.readyToPublish && report.publishBlockers.length > 0 && (
        <Card className="border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-500">Publish Blockers</CardTitle>
            <CardDescription>These issues must be resolved before publishing</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.publishBlockers.map((blocker, i) => (
                <li key={i} className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-0.5 text-red-500" />
                  <span className="text-sm">{blocker}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Last Run Info */}
      {report && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Last run: {new Date(report.timestamp).toLocaleString()} ({report.duration}ms)
          </span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

interface IssueListProps {
  issues: AuditIssue[];
  onViewIssue?: (issue: AuditIssue) => void;
  onFixIssue?: (issue: AuditIssue) => void;
  getCategoryIcon: (category: AuditCategory) => React.ReactNode;
  getSeverityBadge: (severity: AuditSeverity) => {
    variant: 'destructive' | 'secondary' | 'outline' | 'default';
    label: string;
  };
  showFixButton?: boolean;
}

function IssueList({
  issues,
  onViewIssue,
  onFixIssue,
  getCategoryIcon,
  getSeverityBadge,
  showFixButton = false,
}: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
        <p>No issues found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {issues.map((issue) => {
          const badge = getSeverityBadge(issue.severity);
          return (
            <div
              key={issue.id}
              className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="mt-0.5">{getCategoryIcon(issue.category)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {getAuditCategoryLabel(issue.category)}
                  </span>
                  {issue.wcagCriterion && (
                    <Badge variant="outline" className="text-xs">
                      {issue.wcagCriterion}
                    </Badge>
                  )}
                </div>
                <p className="font-medium">{issue.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                {issue.location?.blockType && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Block: {issue.location.blockType}
                    {issue.location.phase && ` • ${issue.location.phase}`}
                  </div>
                )}
                {issue.recommendation && (
                  <div className="mt-2 text-xs text-lxd-cyan">
                    Recommendation: {issue.recommendation}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {showFixButton && issue.autoFixable && (
                  <Button size="sm" variant="outline" onClick={() => onFixIssue?.(issue)}>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Fix
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => onViewIssue?.(issue)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

interface LearningDesignDetailsProps {
  report: InspireAuditReport['learningDesign'];
}

function LearningDesignDetails({ report }: LearningDesignDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Design Analysis</CardTitle>
        <CardDescription>{getAuditCategoryDescription('learning-design')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phase Completion */}
        <div>
          <h4 className="text-sm font-medium mb-3">INSPIRE Phase Completion</h4>
          <div className="grid gap-4 md:grid-cols-3">
            {(['encoding', 'synthesization', 'assimilation'] as const).map((phase) => {
              const data = report.phaseCompletion[phase];
              return (
                <div key={phase} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{phase}</span>
                    {data.complete ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <Progress value={data.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {data.percentage}% complete
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Objective Coverage */}
        <div>
          <h4 className="text-sm font-medium mb-3">Learning Objective Coverage</h4>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">
              {report.objectivesCovered}/{report.objectivesTotal}
            </div>
            <Progress
              value={(report.objectivesCovered / Math.max(report.objectivesTotal, 1)) * 100}
              className="flex-1"
            />
          </div>
          {report.unmappedBlocks.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {report.unmappedBlocks.length} blocks not mapped to objectives
            </p>
          )}
        </div>

        {/* Bloom's Distribution */}
        <div>
          <h4 className="text-sm font-medium mb-3">Bloom's Taxonomy Distribution</h4>
          <div className="grid gap-2 md:grid-cols-6">
            {(Object.entries(report.bloomsDistribution) as [string, number][]).map(
              ([level, count]) => (
                <div key={level} className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground capitalize">{level}</div>
                </div>
              ),
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CognitiveLoadDetailsProps {
  report: InspireAuditReport['cognitiveLoad'];
}

function CognitiveLoadDetails({ report }: CognitiveLoadDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cognitive Load Analysis</CardTitle>
        <CardDescription>{getAuditCategoryDescription('cognitive-load')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Load Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Average Load</div>
            <div className="text-3xl font-bold">{report.averageLoad.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">out of 10</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Peak Load</div>
            <div className="text-3xl font-bold text-orange-500">{report.peakLoad.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">
              {report.peakLocation?.phase ?? 'Unknown location'}
            </div>
          </div>
          <div className="rounded-lg border p-4 md:col-span-2">
            <div className="text-sm font-medium mb-3">Load Components</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Intrinsic</span>
                <span className="text-xs font-medium">{report.intrinsicLoad.toFixed(1)}</span>
              </div>
              <Progress value={report.intrinsicLoad * 10} className="h-1.5" />
              <div className="flex items-center justify-between">
                <span className="text-xs">Extraneous</span>
                <span className="text-xs font-medium">{report.extraneousLoad.toFixed(1)}</span>
              </div>
              <Progress value={report.extraneousLoad * 10} className="h-1.5 bg-red-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs">Germane</span>
                <span className="text-xs font-medium">{report.germaneLoad.toFixed(1)}</span>
              </div>
              <Progress value={report.germaneLoad * 10} className="h-1.5 bg-green-100" />
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Brain className="h-4 w-4 mt-0.5 text-lxd-purple shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AccessibilityDetailsProps {
  report: InspireAuditReport['accessibility'];
}

function AccessibilityDetails({ report }: AccessibilityDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Accessibility Report</CardTitle>
            <CardDescription>WCAG {report.wcagLevel} Compliance</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{report.score}%</div>
            <div className="text-sm text-muted-foreground">
              {report.wcagPassed} passed, {report.wcagFailed} failed
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* WCAG Principles */}
        <div className="grid gap-4 md:grid-cols-4">
          {(
            [
              { key: 'perceivable', data: report.perceivable },
              { key: 'operable', data: report.operable },
              { key: 'understandable', data: report.understandable },
              { key: 'robust', data: report.robust },
            ] as const
          ).map(({ key, data }) => (
            <div key={key} className="rounded-lg border p-4">
              <div className="text-sm font-medium capitalize mb-2">{key}</div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-medium">{data.passed}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-red-500 font-medium">{data.failed}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Images with Alt Text</div>
            <div className="text-lg">
              <span className="text-green-500 font-bold">{report.imagesWithAlt}</span>
              {' / '}
              <span className="text-muted-foreground">
                {report.imagesWithAlt + report.imagesWithoutAlt}
              </span>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Videos with Captions</div>
            <div className="text-lg">
              <span className="text-green-500 font-bold">{report.videosWithCaptions}</span>
              {' / '}
              <span className="text-muted-foreground">
                {report.videosWithCaptions + report.videosWithoutCaptions}
              </span>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Color Contrast</div>
            <div className="text-lg">
              <span className="text-green-500 font-bold">{report.colorContrastPasses}</span>
              {' / '}
              <span className="text-muted-foreground">
                {report.colorContrastPasses + report.colorContrastFails}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AuditDashboard;
