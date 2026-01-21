'use client';

import { AlertTriangle, ExternalLink, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/core/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorSummaryItem {
  id: string;
  title: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'critical' | 'error' | 'warning';
  lastSeen: Date;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockErrors: ErrorSummaryItem[] = [
  {
    id: 'err-1',
    title: "TypeError: Cannot read property 'map'",
    count: 23,
    trend: 'up',
    severity: 'error',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'err-2',
    title: 'Network request failed: /api/courses',
    count: 12,
    trend: 'down',
    severity: 'warning',
    lastSeen: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'err-3',
    title: 'Authentication token expired',
    count: 8,
    trend: 'stable',
    severity: 'warning',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'err-4',
    title: 'Database connection timeout',
    count: 3,
    trend: 'down',
    severity: 'critical',
    lastSeen: new Date(Date.now() - 60 * 60 * 1000),
  },
];

// ============================================================================
// HELPERS
// ============================================================================

function formatLastSeen(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getSeverityStyles(severity: ErrorSummaryItem['severity']) {
  switch (severity) {
    case 'critical':
      return {
        badge: 'bg-brand-error/10 text-red-600 border-brand-error/20',
        indicator: 'bg-brand-error',
      };
    case 'error':
      return {
        badge: 'bg-brand-warning/10 text-orange-600 border-orange-500/20',
        indicator: 'bg-brand-warning',
      };
    case 'warning':
      return {
        badge: 'bg-brand-warning/10 text-yellow-600 border-brand-warning/20',
        indicator: 'bg-brand-warning',
      };
  }
}

// ============================================================================
// ERROR ITEM COMPONENT
// ============================================================================

interface ErrorItemProps {
  error: ErrorSummaryItem;
}

function ErrorItem({ error }: ErrorItemProps) {
  const severityStyles = getSeverityStyles(error.severity);

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', severityStyles.indicator)} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{error.title}</p>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="outline" className={cn('text-xs', severityStyles.badge)}>
            {error.severity}
          </Badge>
          <span className="text-xs text-muted-foreground">{formatLastSeen(error.lastSeen)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-right">
        <span className="text-sm font-semibold">{error.count}</span>
        {error.trend === 'up' && <TrendingUp className="h-3 w-3 text-brand-error" />}
        {error.trend === 'down' && <TrendingDown className="h-3 w-3 text-brand-success" />}
      </div>
    </div>
  );
}

// ============================================================================
// ERRORS SUMMARY COMPONENT
// ============================================================================

export function ErrorsSummary() {
  const [errors, setErrors] = React.useState<ErrorSummaryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call
    const fetchErrors = async () => {
      // In production, fetch from /api/admin/errors/summary
      await new Promise((resolve) => setTimeout(resolve, 500));
      setErrors(mockErrors);
      setIsLoading(false);
    };

    fetchErrors();
  }, []);

  const totalErrors = errors.reduce((sum, e) => sum + e.count, 0);
  const criticalCount = errors.filter((e) => e.severity === 'critical').length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" />
            Recent Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <AlertTriangle className="h-4 w-4" />
            Recent Errors
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{totalErrors} total</Badge>
            {criticalCount > 0 && <Badge variant="destructive">{criticalCount} critical</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {errors.length === 0 ? (
          <div className="py-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No errors in the last 24 hours</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {errors.slice(0, 4).map((error) => (
                <ErrorItem key={error.id} error={error} />
              ))}
            </div>

            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/admin/errors">
                  View All Errors
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
