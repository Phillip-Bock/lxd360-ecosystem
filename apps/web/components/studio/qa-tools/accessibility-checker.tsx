'use client';

import {
  Accessibility,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Play,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  AccessibilityCheck,
  AccessibilityReport,
  ValidationIssue,
  WCAGLevel,
  WCAGPrinciple,
} from '@/types/studio/qa';

interface AccessibilityCheckerProps {
  lessonId: string;
  onRunCheck?: (level: WCAGLevel) => Promise<AccessibilityReport>;
  onViewIssue?: (issue: ValidationIssue) => void;
  initialReport?: AccessibilityReport;
}

/**
 * AccessibilityChecker - WCAG compliance checking tool
 */
export function AccessibilityChecker({
  onRunCheck,
  onViewIssue,
  initialReport,
}: AccessibilityCheckerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [targetLevel, setTargetLevel] = useState<WCAGLevel>('AA');
  const [report, setReport] = useState<AccessibilityReport | undefined>(initialReport);
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set());

  const handleRunCheck = useCallback(async () => {
    if (!onRunCheck) return;

    setIsRunning(true);
    try {
      const newReport = await onRunCheck(targetLevel);
      setReport(newReport);
    } finally {
      setIsRunning(false);
    }
  }, [onRunCheck, targetLevel]);

  const toggleCheck = (checkId: string) => {
    setExpandedChecks((prev) => {
      const next = new Set(prev);
      if (next.has(checkId)) {
        next.delete(checkId);
      } else {
        next.add(checkId);
      }
      return next;
    });
  };

  const getImpactBadge = (impact: string) => {
    const variants: Record<
      string,
      { variant: 'destructive' | 'secondary' | 'outline' | 'default'; label: string }
    > = {
      critical: { variant: 'destructive', label: 'Critical' },
      serious: { variant: 'destructive', label: 'Serious' },
      moderate: { variant: 'secondary', label: 'Moderate' },
      minor: { variant: 'outline', label: 'Minor' },
    };
    return variants[impact] || { variant: 'outline', label: impact };
  };

  const getPrincipleDescription = (principle: WCAGPrinciple) => {
    const descriptions: Record<WCAGPrinciple, string> = {
      perceivable: 'Information must be presentable to users in ways they can perceive',
      operable: 'User interface components must be operable',
      understandable: 'Information and UI operation must be understandable',
      robust: 'Content must be robust enough for a variety of user agents',
    };
    return descriptions[principle];
  };

  const groupChecksByPrinciple = (checks: AccessibilityCheck[]) => {
    const grouped: Record<WCAGPrinciple, AccessibilityCheck[]> = {
      perceivable: [],
      operable: [],
      understandable: [],
      robust: [],
    };

    for (const check of checks) {
      grouped[check.principle].push(check);
    }

    return grouped;
  };

  const groupedChecks = report ? groupChecksByPrinciple(report.checks) : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Accessibility className="h-6 w-6 text-blue-500" />
              <div>
                <CardTitle>Accessibility Checker</CardTitle>
                <CardDescription>WCAG 2.1 Compliance Testing</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={targetLevel} onValueChange={(v) => setTargetLevel(v as WCAGLevel)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="WCAG Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Level A</SelectItem>
                  <SelectItem value="AA">Level AA</SelectItem>
                  <SelectItem value="AAA">Level AAA</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRunCheck} disabled={isRunning || !onRunCheck}>
                {isRunning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Check
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results */}
      {report ? (
        <>
          {/* Score Summary */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`text-5xl font-bold ${
                      report.overallScore >= 90
                        ? 'text-green-500'
                        : report.overallScore >= 70
                          ? 'text-yellow-500'
                          : 'text-red-500'
                    }`}
                  >
                    {report.overallScore}%
                  </div>
                  <div>
                    <div className="text-sm font-medium">Compliance Score</div>
                    <div className="text-xs text-muted-foreground">
                      WCAG {report.targetLevel} Level
                    </div>
                    <Progress value={report.overallScore} className="mt-2 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{report.passed}</div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold">{report.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">{report.warnings}</div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Principle Breakdown */}
          <div className="grid gap-4 md:grid-cols-4">
            {(['perceivable', 'operable', 'understandable', 'robust'] as const).map((principle) => (
              <Card key={principle}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium capitalize">{principle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-green-500">
                      {report.summary[principle].passed}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-lg font-bold text-red-500">
                      {report.summary[principle].failed}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getPrincipleDescription(principle)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Checks</CardTitle>
              <CardDescription>Click each check to see details and fix issues</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {groupedChecks &&
                  (['perceivable', 'operable', 'understandable', 'robust'] as const).map(
                    (principle) => {
                      const checks = groupedChecks[principle];
                      if (checks.length === 0) return null;

                      return (
                        <div key={principle} className="mb-6">
                          <h3 className="text-sm font-medium uppercase text-muted-foreground mb-3">
                            {principle}
                          </h3>
                          <div className="space-y-2">
                            {checks.map((check) => (
                              <CheckItem
                                key={check.id}
                                check={check}
                                isExpanded={expandedChecks.has(check.id)}
                                onToggle={() => toggleCheck(check.id)}
                                onViewIssue={onViewIssue}
                                getImpactBadge={getImpactBadge}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    },
                  )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Accessibility className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Accessibility Report</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Run a check to analyze WCAG compliance
            </p>
          </CardContent>
        </Card>
      )}

      {/* WCAG Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">WCAG 2.1 Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Level A</Badge>
                <span className="text-sm font-medium">Essential</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Basic accessibility features that must be present
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Level AA</Badge>
                <span className="text-sm font-medium">Recommended</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Addresses major accessibility barriers (most common target)
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>Level AAA</Badge>
                <span className="text-sm font-medium">Enhanced</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Highest level of accessibility compliance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

interface CheckItemProps {
  check: AccessibilityCheck;
  isExpanded: boolean;
  onToggle: () => void;
  onViewIssue?: (issue: ValidationIssue) => void;
  getImpactBadge: (impact: string) => {
    variant: 'destructive' | 'secondary' | 'outline' | 'default';
    label: string;
  };
}

function CheckItem({ check, isExpanded, onToggle, onViewIssue, getImpactBadge }: CheckItemProps) {
  const impactBadge = getImpactBadge(check.impact);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div
          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
            !check.passed
              ? 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
              : ''
          }`}
        >
          {check.passed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{check.name}</span>
              <Badge variant="outline" className="text-xs">
                {check.wcagCriterion}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Level {check.wcagLevel}
              </Badge>
              {!check.passed && <Badge variant={impactBadge.variant}>{impactBadge.label}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-1 truncate">{check.description}</p>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-8 mt-2 p-3 rounded-lg bg-muted/50">
          <p className="text-sm mb-3">{check.description}</p>

          {check.issues.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Issues Found ({check.issues.length})</div>
              {check.issues.map((issue) => (
                <button
                  type="button"
                  key={issue.id}
                  className="flex items-start gap-2 p-2 rounded border bg-background cursor-pointer hover:border-primary w-full text-left"
                  onClick={() => onViewIssue?.(issue)}
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{issue.message}</p>
                    {issue.location.snippet && (
                      <code className="block text-xs bg-muted p-1 rounded mt-1">
                        {issue.location.snippet}
                      </code>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {check.issues[0]?.helpUrl && (
            <a
              href={check.issues[0].helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline mt-3"
            >
              Learn more about this criterion
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
