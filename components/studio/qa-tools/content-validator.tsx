'use client';

import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Info,
  Lightbulb,
  Play,
  RefreshCw,
  SpellCheck,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  ContentValidationReport,
  ReadabilityMetrics,
  SpellingGrammarIssue,
} from '@/types/studio/qa';

interface ContentValidatorProps {
  lessonId: string;
  onRunCheck?: (options: ContentCheckOptions) => Promise<ContentValidationReport>;
  onFixIssue?: (issue: SpellingGrammarIssue) => void;
  onViewIssue?: (issue: SpellingGrammarIssue) => void;
  initialReport?: ContentValidationReport;
}

interface ContentCheckOptions {
  spellCheck: boolean;
  grammarCheck: boolean;
  readabilityCheck: boolean;
}

/**
 * ContentValidator - Spelling, grammar, and readability checking
 */
export function ContentValidator({
  onRunCheck,
  onFixIssue,
  onViewIssue,
  initialReport,
}: ContentValidatorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<ContentValidationReport | undefined>(initialReport);
  const [options, setOptions] = useState<ContentCheckOptions>({
    spellCheck: true,
    grammarCheck: true,
    readabilityCheck: true,
  });

  const handleRunCheck = useCallback(async () => {
    if (!onRunCheck) return;

    setIsRunning(true);
    try {
      const newReport = await onRunCheck(options);
      setReport(newReport);
    } finally {
      setIsRunning(false);
    }
  }, [onRunCheck, options]);

  const getReadabilityLevel = (grade: number) => {
    if (grade <= 6) return { label: 'Elementary', color: 'text-green-500' };
    if (grade <= 8) return { label: 'Middle School', color: 'text-green-500' };
    if (grade <= 10) return { label: 'High School', color: 'text-yellow-500' };
    if (grade <= 12) return { label: 'College', color: 'text-yellow-500' };
    return { label: 'Graduate', color: 'text-red-500' };
  };

  const getReadabilityScore = (ease: number) => {
    if (ease >= 80) return { label: 'Very Easy', color: 'text-green-500' };
    if (ease >= 60) return { label: 'Easy', color: 'text-green-500' };
    if (ease >= 40) return { label: 'Moderate', color: 'text-yellow-500' };
    if (ease >= 20) return { label: 'Difficult', color: 'text-orange-500' };
    return { label: 'Very Difficult', color: 'text-red-500' };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-purple-500" />
              <div>
                <CardTitle>Content Validator</CardTitle>
                <CardDescription>Spelling, Grammar & Readability</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="spell-check"
                    checked={options.spellCheck}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({ ...prev, spellCheck: checked }))
                    }
                  />
                  <Label htmlFor="spell-check" className="text-sm">
                    Spelling
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="grammar-check"
                    checked={options.grammarCheck}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({ ...prev, grammarCheck: checked }))
                    }
                  />
                  <Label htmlFor="grammar-check" className="text-sm">
                    Grammar
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="readability-check"
                    checked={options.readabilityCheck}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({ ...prev, readabilityCheck: checked }))
                    }
                  />
                  <Label htmlFor="readability-check" className="text-sm">
                    Readability
                  </Label>
                </div>
              </div>
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="spelling">Spelling ({report.spellingIssues.length})</TabsTrigger>
            <TabsTrigger value="grammar">Grammar ({report.grammarIssues.length})</TabsTrigger>
            <TabsTrigger value="readability">Readability</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {report.spellingIssues.length + report.grammarIssues.length}
                  </div>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-red-500">{report.spellingIssues.length} spelling</span>
                    <span className="text-yellow-500">{report.grammarIssues.length} grammar</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Word Count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {report.readability.wordCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {report.readability.sentenceCount} sentences
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Reading Level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-3xl font-bold ${
                      getReadabilityLevel(report.readability.averageGradeLevel).color
                    }`}
                  >
                    Grade {report.readability.averageGradeLevel.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {getReadabilityLevel(report.readability.averageGradeLevel).label}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Target Met</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {report.meetsReadingLevel ? (
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    )}
                    <div>
                      <div className="font-medium">{report.meetsReadingLevel ? 'Yes' : 'No'}</div>
                      <div className="text-xs text-muted-foreground">
                        Target: {report.targetReadingLevel || '8th grade'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="spelling" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SpellCheck className="h-5 w-5 text-red-500" />
                    <CardTitle>Spelling Issues</CardTitle>
                  </div>
                  {report.spellingIssues.filter((i) => i.autoFixable).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        report.spellingIssues
                          .filter((i) => i.autoFixable)
                          .forEach((issue) => {
                            onFixIssue?.(issue);
                          });
                      }}
                    >
                      Fix All ({report.spellingIssues.filter((i) => i.autoFixable).length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <IssueList issues={report.spellingIssues} onFix={onFixIssue} onView={onViewIssue} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grammar" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-yellow-500" />
                    <CardTitle>Grammar Issues</CardTitle>
                  </div>
                  {report.grammarIssues.filter((i) => i.autoFixable).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        report.grammarIssues
                          .filter((i) => i.autoFixable)
                          .forEach((issue) => {
                            onFixIssue?.(issue);
                          });
                      }}
                    >
                      Fix All ({report.grammarIssues.filter((i) => i.autoFixable).length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <IssueList issues={report.grammarIssues} onFix={onFixIssue} onView={onViewIssue} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="readability" className="mt-4">
            <ReadabilityPanel
              metrics={report.readability}
              targetLevel={report.targetReadingLevel}
              meetsTarget={report.meetsReadingLevel}
              getReadabilityLevel={getReadabilityLevel}
              getReadabilityScore={getReadabilityScore}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Content Report</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Run a check to analyze spelling, grammar, and readability
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

interface IssueListProps {
  issues: SpellingGrammarIssue[];
  onFix?: (issue: SpellingGrammarIssue) => void;
  onView?: (issue: SpellingGrammarIssue) => void;
}

function IssueList({ issues, onFix, onView }: IssueListProps) {
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
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
          >
            {issue.issueType === 'spelling' ? (
              <SpellCheck className="h-4 w-4 text-red-500 mt-1 shrink-0" />
            ) : (
              <BookOpen className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant={issue.issueType === 'spelling' ? 'destructive' : 'secondary'}
                  className="capitalize"
                >
                  {issue.issueType}
                </Badge>
                {issue.word && <code className="text-xs bg-muted px-1 rounded">{issue.word}</code>}
              </div>
              <p className="text-sm">{issue.message}</p>
              <p className="text-xs text-muted-foreground mt-1">...{issue.context}...</p>
              {issue.suggestions.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Lightbulb className="h-3 w-3 text-yellow-500" />
                  <div className="flex flex-wrap gap-1">
                    {issue.suggestions.slice(0, 5).map((suggestion, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => onFix?.(issue)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {issue.autoFixable && issue.suggestions.length > 0 && (
                <Button size="sm" variant="outline" onClick={() => onFix?.(issue)}>
                  Fix
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => onView?.(issue)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

interface ReadabilityPanelProps {
  metrics: ReadabilityMetrics;
  targetLevel?: string;
  meetsTarget: boolean;
  getReadabilityLevel: (grade: number) => { label: string; color: string };
  getReadabilityScore: (ease: number) => { label: string; color: string };
}

function ReadabilityPanel({
  metrics,
  targetLevel,
  meetsTarget,
  getReadabilityLevel,
  getReadabilityScore,
}: ReadabilityPanelProps) {
  const easeScore = getReadabilityScore(metrics.fleschReadingEase);
  const levelInfo = getReadabilityLevel(metrics.averageGradeLevel);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Main Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Readability Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Flesch Reading Ease</span>
              <span className={`font-bold ${easeScore.color}`}>
                {metrics.fleschReadingEase.toFixed(1)}
              </span>
            </div>
            <Progress value={metrics.fleschReadingEase} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{easeScore.label}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Average Grade Level</span>
              <span className={`font-bold ${levelInfo.color}`}>
                {metrics.averageGradeLevel.toFixed(1)}
              </span>
            </div>
            <Progress value={(metrics.averageGradeLevel / 16) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{levelInfo.label}</p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2">
              {meetsTarget ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="text-sm">
                {meetsTarget
                  ? `Meets target reading level (${targetLevel || '8th grade'})`
                  : `Above target reading level (${targetLevel || '8th grade'})`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Detailed Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <MetricItem
              label="Flesch-Kincaid Grade"
              value={metrics.fleschKincaidGrade.toFixed(1)}
            />
            <MetricItem label="Gunning Fog" value={metrics.gunningFog.toFixed(1)} />
            <MetricItem label="SMOG Index" value={metrics.smog.toFixed(1)} />
            <MetricItem label="Coleman-Liau" value={metrics.colemanLiau.toFixed(1)} />
            <MetricItem
              label="Automated Readability"
              value={metrics.automatedReadability.toFixed(1)}
            />
            <MetricItem
              label="Complex Words"
              value={`${metrics.complexWordPercentage.toFixed(1)}%`}
            />
          </div>

          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Text Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <MetricItem label="Total Words" value={metrics.wordCount.toLocaleString()} />
              <MetricItem label="Total Sentences" value={metrics.sentenceCount.toLocaleString()} />
              <MetricItem
                label="Avg Words/Sentence"
                value={metrics.averageWordsPerSentence.toFixed(1)}
              />
              <MetricItem
                label="Avg Syllables/Word"
                value={metrics.averageSyllablesPerWord.toFixed(1)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {metrics.averageWordsPerSentence > 20 && (
              <RecommendationCard
                title="Shorten Sentences"
                description="Average sentence length is high. Consider breaking long sentences into shorter ones."
                metric={`${metrics.averageWordsPerSentence.toFixed(1)} words/sentence`}
                target="< 20 words"
              />
            )}
            {metrics.complexWordPercentage > 15 && (
              <RecommendationCard
                title="Simplify Vocabulary"
                description="High percentage of complex words. Consider using simpler alternatives."
                metric={`${metrics.complexWordPercentage.toFixed(1)}% complex`}
                target="< 15%"
              />
            )}
            {metrics.averageSyllablesPerWord > 1.6 && (
              <RecommendationCard
                title="Use Shorter Words"
                description="Average syllables per word is high. Consider using shorter, simpler words."
                metric={`${metrics.averageSyllablesPerWord.toFixed(1)} syllables/word`}
                target="< 1.6"
              />
            )}
            {metrics.averageWordsPerSentence <= 20 &&
              metrics.complexWordPercentage <= 15 &&
              metrics.averageSyllablesPerWord <= 1.6 && (
                <div className="md:col-span-3 text-center py-4 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>Content readability looks good!</p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricItemProps {
  label: string;
  value: string;
}

function MetricItem({ label, value }: MetricItemProps) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

interface RecommendationCardProps {
  title: string;
  description: string;
  metric: string;
  target: string;
}

function RecommendationCard({ title, description, metric, target }: RecommendationCardProps) {
  return (
    <div className="rounded-lg border p-4 bg-yellow-50/50 dark:bg-yellow-950/20">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="flex justify-between text-xs">
        <span>
          Current: <strong>{metric}</strong>
        </span>
        <span>
          Target: <strong>{target}</strong>
        </span>
      </div>
    </div>
  );
}
