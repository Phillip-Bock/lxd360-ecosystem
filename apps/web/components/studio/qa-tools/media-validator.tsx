'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileAudio,
  FileQuestion,
  HardDrive,
  Image,
  Link2,
  Play,
  RefreshCw,
  Video,
  XCircle,
  Zap,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  LinkStatus,
  LinkValidation,
  LinkValidationReport,
  MediaStatus,
  MediaType,
  MediaValidation,
  MediaValidationReport,
} from '@/types/studio/qa';

interface MediaValidatorProps {
  lessonId: string;
  onRunCheck?: (options: MediaCheckOptions) => Promise<{
    media: MediaValidationReport;
    links: LinkValidationReport;
  }>;
  onViewMedia?: (media: MediaValidation) => void;
  onOptimizeMedia?: (media: MediaValidation) => void;
  initialReport?: {
    media?: MediaValidationReport;
    links?: LinkValidationReport;
  };
}

interface MediaCheckOptions {
  validateMedia: boolean;
  validateLinks: boolean;
  checkExternal: boolean;
  checkOptimization: boolean;
}

/**
 * MediaValidator - Media and link validation tool
 */
export function MediaValidator({
  onRunCheck,
  onViewMedia,
  onOptimizeMedia,
  initialReport,
}: MediaValidatorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [mediaReport, setMediaReport] = useState<MediaValidationReport | undefined>(
    initialReport?.media,
  );
  const [linkReport, setLinkReport] = useState<LinkValidationReport | undefined>(
    initialReport?.links,
  );
  const [options, setOptions] = useState<MediaCheckOptions>({
    validateMedia: true,
    validateLinks: true,
    checkExternal: true,
    checkOptimization: true,
  });

  const handleRunCheck = useCallback(async () => {
    if (!onRunCheck) return;

    setIsRunning(true);
    try {
      const result = await onRunCheck(options);
      setMediaReport(result.media);
      setLinkReport(result.links);
    } finally {
      setIsRunning(false);
    }
  }, [onRunCheck, options]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMediaIcon = (type: MediaType) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <FileAudio className="h-4 w-4" />;
      default:
        return <FileQuestion className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: MediaStatus | LinkStatus) => {
    const variants: Record<
      string,
      { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string }
    > = {
      valid: { variant: 'default', label: 'Valid' },
      broken: { variant: 'destructive', label: 'Broken' },
      missing: { variant: 'destructive', label: 'Missing' },
      unoptimized: { variant: 'secondary', label: 'Unoptimized' },
      unchecked: { variant: 'outline', label: 'Unchecked' },
      redirect: { variant: 'secondary', label: 'Redirect' },
      timeout: { variant: 'destructive', label: 'Timeout' },
    };
    return variants[status] || { variant: 'outline', label: status };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image className="h-6 w-6 text-blue-500" />
              <div>
                <CardTitle>Media & Link Validator</CardTitle>
                <CardDescription>Check media files and links for issues</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="validate-media"
                    checked={options.validateMedia}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({ ...prev, validateMedia: checked }))
                    }
                  />
                  <Label htmlFor="validate-media" className="text-sm">
                    Media
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="validate-links"
                    checked={options.validateLinks}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({ ...prev, validateLinks: checked }))
                    }
                  />
                  <Label htmlFor="validate-links" className="text-sm">
                    Links
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="check-external"
                    checked={options.checkExternal}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({ ...prev, checkExternal: checked }))
                    }
                  />
                  <Label htmlFor="check-external" className="text-sm">
                    External
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
      {mediaReport || linkReport ? (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="media">Media ({mediaReport?.totalMedia || 0})</TabsTrigger>
            <TabsTrigger value="links">Links ({linkReport?.totalLinks || 0})</TabsTrigger>
            <TabsTrigger value="optimization">
              Optimization ({mediaReport?.unoptimizedMedia || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Media Summary */}
              {mediaReport && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Media Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <HardDrive className="h-8 w-8 text-blue-500" />
                        <div>
                          <div className="text-2xl font-bold">{mediaReport.totalMedia}</div>
                          <div className="text-sm text-muted-foreground">Total Files</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Download className="h-8 w-8 text-purple-500" />
                        <div>
                          <div className="text-2xl font-bold">
                            {formatBytes(mediaReport.totalSize)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Size</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <div>
                          <div className="text-2xl font-bold">{mediaReport.validMedia}</div>
                          <div className="text-sm text-muted-foreground">Valid</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <XCircle className="h-8 w-8 text-red-500" />
                        <div>
                          <div className="text-2xl font-bold">
                            {mediaReport.brokenMedia + mediaReport.missingMedia}
                          </div>
                          <div className="text-sm text-muted-foreground">Issues</div>
                        </div>
                      </div>
                    </div>
                    {mediaReport.potentialSavings > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">
                            Potential savings:{' '}
                            <strong>{formatBytes(mediaReport.potentialSavings)}</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Link Summary */}
              {linkReport && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="h-5 w-5" />
                      Link Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Link2 className="h-8 w-8 text-blue-500" />
                        <div>
                          <div className="text-2xl font-bold">{linkReport.totalLinks}</div>
                          <div className="text-sm text-muted-foreground">Total Links</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <ExternalLink className="h-8 w-8 text-purple-500" />
                        <div>
                          <div className="text-2xl font-bold">{linkReport.externalLinks}</div>
                          <div className="text-sm text-muted-foreground">External</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <div>
                          <div className="text-2xl font-bold">{linkReport.validLinks}</div>
                          <div className="text-sm text-muted-foreground">Valid</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <XCircle className="h-8 w-8 text-red-500" />
                        <div>
                          <div className="text-2xl font-bold">
                            {linkReport.brokenLinks + linkReport.timeoutLinks}
                          </div>
                          <div className="text-sm text-muted-foreground">Broken</div>
                        </div>
                      </div>
                    </div>
                    {linkReport.redirectedLinks > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">
                            {linkReport.redirectedLinks} links have redirects
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-4">
            <MediaList
              items={mediaReport?.items || []}
              onView={onViewMedia}
              onOptimize={onOptimizeMedia}
              getMediaIcon={getMediaIcon}
              getStatusBadge={getStatusBadge}
              formatBytes={formatBytes}
            />
          </TabsContent>

          <TabsContent value="links" className="mt-4">
            <LinkList items={linkReport?.items || []} getStatusBadge={getStatusBadge} />
          </TabsContent>

          <TabsContent value="optimization" className="mt-4">
            <OptimizationList
              items={mediaReport?.items.filter((m) => m.status === 'unoptimized') || []}
              onOptimize={onOptimizeMedia}
              getMediaIcon={getMediaIcon}
              formatBytes={formatBytes}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Image className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Validation Report</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Run a check to validate media files and links
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

interface MediaListProps {
  items: MediaValidation[];
  onView?: (media: MediaValidation) => void;
  onOptimize?: (media: MediaValidation) => void;
  getMediaIcon: (type: MediaType) => React.ReactNode;
  getStatusBadge: (status: MediaStatus) => {
    variant: 'default' | 'destructive' | 'secondary' | 'outline';
    label: string;
  };
  formatBytes: (bytes: number) => string;
}

function MediaList({
  items,
  onView,
  onOptimize,
  getMediaIcon,
  getStatusBadge,
  formatBytes,
}: MediaListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Image className="h-12 w-12 mx-auto mb-4" />
          <p>No media files found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Files</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {items.map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors ${
                    item.status === 'broken' || item.status === 'missing'
                      ? 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
                      : ''
                  }`}
                >
                  <div className="shrink-0">{getMediaIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">
                        {item.metadata?.filename || item.url.split('/').pop()}
                      </span>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="capitalize">{item.type}</span>
                      {item.metadata?.fileSize && (
                        <span>{formatBytes(item.metadata.fileSize)}</span>
                      )}
                      {item.metadata?.dimensions && (
                        <span>
                          {item.metadata.dimensions.width}x{item.metadata.dimensions.height}
                        </span>
                      )}
                      {item.metadata?.duration && (
                        <span>{Math.round(item.metadata.duration)}s</span>
                      )}
                    </div>
                    {item.issues.length > 0 && (
                      <div className="mt-2">
                        {item.issues.map((issue, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs text-red-500">
                            <AlertTriangle className="h-3 w-3" />
                            {issue.message}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.suggestions && item.suggestions.length > 0 && (
                      <div className="mt-2">
                        {item.suggestions.map((suggestion, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs text-purple-500">
                            <Zap className="h-3 w-3" />
                            {suggestion.message}
                            {suggestion.estimatedSavings && (
                              <span className="text-muted-foreground">
                                (save {formatBytes(suggestion.estimatedSavings)})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {item.suggestions?.some((s) => s.autoApplicable) && (
                      <Button size="sm" variant="outline" onClick={() => onOptimize?.(item)}>
                        <Zap className="h-3 w-3 mr-1" />
                        Optimize
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => onView?.(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface LinkListProps {
  items: LinkValidation[];
  getStatusBadge: (status: LinkStatus) => {
    variant: 'default' | 'destructive' | 'secondary' | 'outline';
    label: string;
  };
}

function LinkList({ items, getStatusBadge }: LinkListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4" />
          <p>No links found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Links</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {items.map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors ${
                    item.status === 'broken' || item.status === 'timeout'
                      ? 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
                      : ''
                  }`}
                >
                  <div className="shrink-0">
                    {item.type === 'external' ? (
                      <ExternalLink className="h-4 w-4" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium truncate hover:underline"
                      >
                        {item.url}
                      </a>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="capitalize">{item.type}</span>
                      {item.statusCode && <span>HTTP {item.statusCode}</span>}
                      {item.responseTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.responseTime}ms
                        </span>
                      )}
                    </div>
                    {item.redirectUrl && (
                      <div className="mt-1 text-xs text-yellow-600">
                        Redirects to: {item.redirectUrl}
                      </div>
                    )}
                    {item.issues.length > 0 && (
                      <div className="mt-2">
                        {item.issues.map((issue, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs text-red-500">
                            <AlertTriangle className="h-3 w-3" />
                            {issue.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface OptimizationListProps {
  items: MediaValidation[];
  onOptimize?: (media: MediaValidation) => void;
  getMediaIcon: (type: MediaType) => React.ReactNode;
  formatBytes: (bytes: number) => string;
}

function OptimizationList({ items, onOptimize, getMediaIcon, formatBytes }: OptimizationListProps) {
  const totalSavings = items.reduce(
    (sum, item) =>
      sum + (item.suggestions?.reduce((s, sug) => s + (sug.estimatedSavings || 0), 0) || 0),
    0,
  );

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-medium">All Media Optimized</h3>
          <p className="text-sm text-muted-foreground mt-1">No optimization opportunities found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Optimization Opportunities</CardTitle>
            <CardDescription>{items.length} files can be optimized</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-500">{formatBytes(totalSavings)}</div>
            <div className="text-sm text-muted-foreground">Potential Savings</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => {
            items.forEach((item) => {
              onOptimize?.(item);
            });
          }}
        >
          <Zap className="mr-2 h-4 w-4" />
          Optimize All ({items.length})
        </Button>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="shrink-0">{getMediaIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {item.metadata?.filename || item.url.split('/').pop()}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Current: {formatBytes(item.metadata?.fileSize || 0)}</span>
                    {item.metadata?.dimensions && (
                      <span>
                        {item.metadata.dimensions.width}x{item.metadata.dimensions.height}
                      </span>
                    )}
                  </div>
                  {item.suggestions?.map((suggestion, i) => (
                    <div key={i} className="flex items-center gap-2 mt-2 text-sm text-purple-600">
                      <Zap className="h-3 w-3" />
                      <span>{suggestion.message}</span>
                      {suggestion.estimatedSavings && (
                        <Badge variant="secondary">
                          Save {formatBytes(suggestion.estimatedSavings)}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" onClick={() => onOptimize?.(item)}>
                  <Zap className="h-3 w-3 mr-1" />
                  Optimize
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
