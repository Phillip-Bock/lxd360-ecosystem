'use client';

import {
  Accessibility,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Image,
  Info,
  Link2,
  Play,
  RefreshCw,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  IssueCategory,
  IssueSeverity,
  QAReport,
  QAStatus,
  ValidationIssue,
} from '@/types/studio/qa';

interface QADashboardProps {
  lessonId: string;
  lessonTitle?: string;
  onRunCheck?: () => Promise<QAReport>;
  onViewIssue?: (issue: ValidationIssue) => void;
  onFixIssue?: (issue: ValidationIssue) => void;
  initialReport?: QAReport;
}

/**
 * QADashboard - Central hub for QA checks and results
 */
export function QADashboard({
  lessonTitle = 'Untitled Lesson',
  onRunCheck,
  onViewIssue,
  onFixIssue,
  initialReport,
}: QADashboardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<QAReport | undefined>(initialReport);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');

  const handleRunCheck = useCallback(async () => {
    if (!onRunCheck) return;

    setIsRunning(true);
    try {
      const newReport = await onRunCheck();
      setReport(newReport);
    } finally {
      setIsRunning(false);
    }
  }, [onRunCheck]);

  const getStatusIcon = (status: QAStatus) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-zinc-500" />;
    }
  };

  const getSeverityBadge = (severity: IssueSeverity) => {
    const variants: Record<
      IssueSeverity,
      { variant: 'destructive' | 'secondary' | 'outline' | 'default'; label: string }
    > = {
      error: { variant: 'destructive', label: 'Error' },
      warning: { variant: 'secondary', label: 'Warning' },
      info: { variant: 'outline', label: 'Info' },
      suggestion: { variant: 'default', label: 'Suggestion' },
    };
    return variants[severity];
  };

  const getCategoryIcon = (category: IssueCategory) => {
    const icons: Record<IssueCategory, React.ReactNode> = {
      accessibility: <Accessibility className="h-4 w-4" />,
      content: <FileText className="h-4 w-4" />,
      media: <Image className="h-4 w-4" />,
      link: <Link2 className="h-4 w-4" />,
      spelling: <FileText className="h-4 w-4" />,
      grammar: <FileText className="h-4 w-4" />,
      structure: <FileText className="h-4 w-4" />,
      metadata: <Info className="h-4 w-4" />,
      performance: <TrendingUp className="h-4 w-4" />,
      compliance: <CheckCircle2 className="h-4 w-4" />,
    };
    return icons[category];
  };

  const filteredIssues =
    report?.allIssues.filter(
      (issue) => selectedCategory === 'all' || issue.category === selectedCategory,
    ) ?? [];

  const quickFixes = report?.allIssues.filter((issue) => issue.autoFixable) ?? [];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Assurance</h2>
          <p className="text-sm text-muted-foreground">{lessonTitle}</p>
        </div>
        <Button onClick={handleRunCheck} disabled={isRunning || !onRunCheck}>
          {isRunning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running Checks...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run QA Check
            </>
          )}
        </Button>
      </div>

      {/* Score Overview */}
      {report ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Overall Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {getStatusIcon(report.status)}
                <div className="text-3xl font-bold">{report.summary.score}%</div>
              </div>
              <Progress value={report.summary.score} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-500" />
                <div className="text-3xl font-bold">{report.summary.errors}</div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Must be fixed before publishing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div className="text-3xl font-bold">{report.summary.warnings}</div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Recommended to review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Quick Fixes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <div className="text-3xl font-bold">{quickFixes.length}</div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Auto-fixable issues</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Eye className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No QA Report Available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Run a QA check to analyze your lesson content
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      {report && (
        <Tabs defaultValue="issues" className="w-full">
          <TabsList>
            <TabsTrigger value="issues">All Issues ({report.allIssues.length})</TabsTrigger>
            <TabsTrigger value="accessibility">
              Accessibility ({report.summary.byCategory.accessibility || 0})
            </TabsTrigger>
            <TabsTrigger value="content">
              Content (
              {(report.summary.byCategory.spelling || 0) + (report.summary.byCategory.grammar || 0)}
              )
            </TabsTrigger>
            <TabsTrigger value="media">Media ({report.summary.byCategory.media || 0})</TabsTrigger>
            <TabsTrigger value="quickfixes">Quick Fixes ({quickFixes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Issues</CardTitle>
                  <div className="flex gap-2">
                    <Badge
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory('all')}
                    >
                      All
                    </Badge>
                    {Object.entries(report.summary.byCategory)
                      .filter(([, count]) => count > 0)
                      .map(([category, count]) => (
                        <Badge
                          key={category}
                          variant={selectedCategory === category ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => setSelectedCategory(category as IssueCategory)}
                        >
                          {category} ({count})
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

          <TabsContent value="accessibility" className="mt-4">
            <AccessibilitySummary
              report={report.accessibility}
              getCategoryIcon={getCategoryIcon}
              getSeverityBadge={getSeverityBadge}
              onViewIssue={onViewIssue}
              onFixIssue={onFixIssue}
            />
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <ContentSummary
              report={report.content}
              getCategoryIcon={getCategoryIcon}
              getSeverityBadge={getSeverityBadge}
              onViewIssue={onViewIssue}
              onFixIssue={onFixIssue}
            />
          </TabsContent>

          <TabsContent value="media" className="mt-4">
            <MediaSummary
              report={report.media}
              getCategoryIcon={getCategoryIcon}
              getSeverityBadge={getSeverityBadge}
              onViewIssue={onViewIssue}
              onFixIssue={onFixIssue}
            />
          </TabsContent>

          <TabsContent value="quickfixes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Fixes</CardTitle>
                <CardDescription>These issues can be automatically fixed</CardDescription>
              </CardHeader>
              <CardContent>
                {quickFixes.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <Button
                        onClick={() => {
                          quickFixes.forEach((fix) => {
                            onFixIssue?.(fix);
                          });
                        }}
                        variant="outline"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Fix All ({quickFixes.length})
                      </Button>
                    </div>
                    <IssueList
                      issues={quickFixes}
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
  issues: ValidationIssue[];
  onViewIssue?: (issue: ValidationIssue) => void;
  onFixIssue?: (issue: ValidationIssue) => void;
  getCategoryIcon: (category: IssueCategory) => React.ReactNode;
  getSeverityBadge: (severity: IssueSeverity) => {
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
                  <span className="text-xs text-muted-foreground capitalize">{issue.category}</span>
                </div>
                <p className="font-medium">{issue.message}</p>
                {issue.description && (
                  <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                )}
                {issue.location.snippet && (
                  <code className="block mt-2 text-xs bg-muted p-2 rounded">
                    {issue.location.snippet}
                  </code>
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

interface AccessibilitySummaryProps {
  report?: import('@/types/studio/qa').AccessibilityReport;
  getCategoryIcon: (category: IssueCategory) => React.ReactNode;
  getSeverityBadge: (severity: IssueSeverity) => {
    variant: 'destructive' | 'secondary' | 'outline' | 'default';
    label: string;
  };
  onViewIssue?: (issue: ValidationIssue) => void;
  onFixIssue?: (issue: ValidationIssue) => void;
}

function AccessibilitySummary({
  report,
  getCategoryIcon,
  getSeverityBadge,
  onViewIssue,
  onFixIssue,
}: AccessibilitySummaryProps) {
  if (!report) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No accessibility report available
        </CardContent>
      </Card>
    );
  }

  const allIssues = report.checks.flatMap((check) => check.issues);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Accessibility Report</CardTitle>
            <CardDescription>WCAG {report.targetLevel} Compliance</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{report.overallScore}%</div>
            <div className="text-sm text-muted-foreground">
              {report.passed} passed, {report.failed} failed
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {(['perceivable', 'operable', 'understandable', 'robust'] as const).map((principle) => (
            <div key={principle} className="rounded-lg border p-4">
              <div className="text-sm font-medium capitalize mb-2">{principle}</div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">{report.summary[principle].passed}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-red-500">{report.summary[principle].failed}</span>
              </div>
            </div>
          ))}
        </div>
        <IssueList
          issues={allIssues}
          onViewIssue={onViewIssue}
          onFixIssue={onFixIssue}
          getCategoryIcon={getCategoryIcon}
          getSeverityBadge={getSeverityBadge}
        />
      </CardContent>
    </Card>
  );
}

interface ContentSummaryProps {
  report?: import('@/types/studio/qa').ContentValidationReport;
  getCategoryIcon: (category: IssueCategory) => React.ReactNode;
  getSeverityBadge: (severity: IssueSeverity) => {
    variant: 'destructive' | 'secondary' | 'outline' | 'default';
    label: string;
  };
  onViewIssue?: (issue: ValidationIssue) => void;
  onFixIssue?: (issue: ValidationIssue) => void;
}

function ContentSummary({
  report,
  getCategoryIcon,
  getSeverityBadge,
  onViewIssue,
  onFixIssue,
}: ContentSummaryProps) {
  if (!report) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No content report available
        </CardContent>
      </Card>
    );
  }

  const allIssues = [...report.spellingIssues, ...report.grammarIssues];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Validation</CardTitle>
        <CardDescription>Spelling, Grammar & Readability</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Readability Score</div>
            <div className="text-2xl font-bold">
              Grade {report.readability.averageGradeLevel.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Target: {report.targetReadingLevel || '8th grade'}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Word Count</div>
            <div className="text-2xl font-bold">{report.readability.wordCount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {report.readability.sentenceCount} sentences
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Issues Found</div>
            <div className="text-2xl font-bold">{allIssues.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {report.spellingIssues.length} spelling, {report.grammarIssues.length} grammar
            </div>
          </div>
        </div>
        <IssueList
          issues={allIssues}
          onViewIssue={onViewIssue}
          onFixIssue={onFixIssue}
          getCategoryIcon={getCategoryIcon}
          getSeverityBadge={getSeverityBadge}
          showFixButton
        />
      </CardContent>
    </Card>
  );
}

interface MediaSummaryProps {
  report?: import('@/types/studio/qa').MediaValidationReport;
  getCategoryIcon: (category: IssueCategory) => React.ReactNode;
  getSeverityBadge: (severity: IssueSeverity) => {
    variant: 'destructive' | 'secondary' | 'outline' | 'default';
    label: string;
  };
  onViewIssue?: (issue: ValidationIssue) => void;
  onFixIssue?: (issue: ValidationIssue) => void;
}

function MediaSummary({
  report,
  getCategoryIcon,
  getSeverityBadge,
  onViewIssue,
  onFixIssue,
}: MediaSummaryProps) {
  if (!report) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No media report available
        </CardContent>
      </Card>
    );
  }

  const allIssues = report.items.flatMap((item) => item.issues);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Validation</CardTitle>
        <CardDescription>Images, Videos & Links</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Total Media</div>
            <div className="text-2xl font-bold">{report.totalMedia}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatBytes(report.totalSize)}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Valid</div>
            <div className="text-2xl font-bold text-green-500">{report.validMedia}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Broken</div>
            <div className="text-2xl font-bold text-red-500">{report.brokenMedia}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Potential Savings</div>
            <div className="text-2xl font-bold text-purple-500">
              {formatBytes(report.potentialSavings)}
            </div>
          </div>
        </div>
        <IssueList
          issues={allIssues}
          onViewIssue={onViewIssue}
          onFixIssue={onFixIssue}
          getCategoryIcon={getCategoryIcon}
          getSeverityBadge={getSeverityBadge}
        />
      </CardContent>
    </Card>
  );
}
