'use client';

import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  MessageSquare,
  PlayCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RecentStatement } from '@/lib/analytics/types';
import { cn } from '@/lib/core/utils';

export interface ActivityFeedProps {
  title?: string;
  description?: string;
  statements: RecentStatement[];
  isConnected?: boolean;
  maxHeight?: number;
  showTimestamps?: boolean;
  loading?: boolean;
  className?: string;
}

const verbIcons: Record<string, typeof Activity> = {
  completed: CheckCircle2,
  passed: CheckCircle2,
  failed: CheckCircle2,
  experienced: PlayCircle,
  launched: PlayCircle,
  initialized: PlayCircle,
  answered: MessageSquare,
  commented: MessageSquare,
  progressed: BookOpen,
  earned: Award,
};

const verbColors: Record<string, string> = {
  completed: 'bg-brand-success/10 text-green-700 dark:bg-brand-success/20 dark:text-green-300',
  passed: 'bg-brand-success/10 text-green-700 dark:bg-brand-success/20 dark:text-green-300',
  failed: 'bg-brand-error/10 text-red-700 dark:bg-brand-error/20 dark:text-red-300',
  experienced: 'bg-brand-primary/10 text-blue-700 dark:bg-brand-primary/20 dark:text-blue-300',
  launched: 'bg-brand-secondary/10 text-purple-700 dark:bg-brand-secondary/20 dark:text-purple-300',
  answered: 'bg-brand-warning/10 text-yellow-700 dark:bg-brand-warning/20 dark:text-yellow-300',
  progressed: 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  earned: 'bg-brand-warning/10 text-amber-700 dark:bg-brand-warning/20 dark:text-amber-300',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return then.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function ActivityFeed({
  title = 'Recent Activity',
  description,
  statements,
  isConnected,
  maxHeight = 400,
  showTimestamps = true,
  loading = false,
  className,
}: ActivityFeedProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-lxd-purple" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-lxd-purple" />
            {title}
          </CardTitle>
          {isConnected !== undefined && <ConnectionIndicator connected={isConnected} />}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ScrollArea className="pr-4" style={{ height: maxHeight }}>
          <div className="space-y-4">
            {statements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              statements.map((statement) => (
                <ActivityItem
                  key={statement.id}
                  statement={statement}
                  showTimestamp={showTimestamps}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  statement: RecentStatement;
  showTimestamp: boolean;
}

function ActivityItem({ statement, showTimestamp }: ActivityItemProps) {
  const verbKey = statement.verbDisplay.toLowerCase();
  const Icon = verbIcons[verbKey] || Activity;
  const colorClass = verbColors[verbKey] || 'bg-muted text-muted-foreground';

  return (
    <div className="flex gap-3 group">
      <Avatar className="h-8 w-8 shrink-0">
        {statement.avatarUrl && <AvatarImage src={statement.avatarUrl} />}
        <AvatarFallback className="text-xs">{getInitials(statement.displayName)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{statement.displayName}</span>{' '}
          <Badge variant="outline" className={cn('text-xs mx-1', colorClass)}>
            <Icon className="h-3 w-3 mr-1" />
            {statement.verbDisplay}
          </Badge>{' '}
          <span className="text-muted-foreground">{statement.objectName}</span>
        </p>

        <div className="flex items-center gap-2 mt-1">
          {statement.courseName && (
            <span className="text-xs text-muted-foreground truncate">{statement.courseName}</span>
          )}
          {statement.score !== undefined && (
            <Badge variant="secondary" className="text-xs">
              Score: {statement.score.toFixed(0)}%
            </Badge>
          )}
          {showTimestamp && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto shrink-0">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(statement.timestamp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ConnectionIndicator({ connected }: { connected: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
        connected
          ? 'bg-brand-success/10 text-green-700 dark:bg-brand-success/20 dark:text-green-300'
          : 'bg-brand-error/10 text-red-700 dark:bg-brand-error/20 dark:text-red-300',
      )}
    >
      {connected ? (
        <>
          <Wifi className="h-3 w-3" />
          Live
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
    </div>
  );
}

/**
 * Compact activity list without card wrapper
 */
export interface ActivityListProps {
  statements: RecentStatement[];
  limit?: number;
  loading?: boolean;
  className?: string;
}

export function ActivityList({
  statements,
  limit = 10,
  loading = false,
  className,
}: ActivityListProps) {
  const displayStatements = statements.slice(0, limit);

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-6 w-6 bg-muted rounded-full" />
            <div className="flex-1 h-4 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {displayStatements.map((statement) => {
        const verbKey = statement.verbDisplay.toLowerCase();
        const Icon = verbIcons[verbKey] || Activity;

        return (
          <div key={statement.id} className="flex items-center gap-3 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium truncate">{statement.displayName}</span>
            <span className="text-muted-foreground">{statement.verbDisplay}</span>
            <span className="truncate flex-1">{statement.objectName}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatRelativeTime(statement.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
