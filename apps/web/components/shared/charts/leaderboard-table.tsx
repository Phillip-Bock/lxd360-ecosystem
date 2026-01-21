'use client';

import { Award, Crown, Medal, Minus, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LeaderboardEntry } from '@/lib/analytics/types';
import { cn } from '@/lib/core/utils';

export interface LeaderboardTableProps {
  title?: string;
  description?: string;
  entries: LeaderboardEntry[];
  showScore?: boolean;
  showCompletions?: boolean;
  showTimeSpent?: boolean;
  showChange?: boolean;
  limit?: number;
  loading?: boolean;
  className?: string;
}

const rankIcons: Record<number, typeof Trophy> = {
  1: Crown,
  2: Medal,
  3: Award,
};

const rankColors: Record<number, string> = {
  1: 'text-yellow-500 dark:text-brand-warning',
  2: 'text-muted-foreground',
  3: 'text-amber-600 dark:text-amber-500',
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function LeaderboardTable({
  title = 'Leaderboard',
  description,
  entries,
  showScore = true,
  showCompletions = true,
  showTimeSpent = false,
  showChange = true,
  limit,
  loading = false,
  className,
}: LeaderboardTableProps) {
  const displayEntries = limit ? entries.slice(0, limit) : entries;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-lxd-purple" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
                <div className="h-6 w-16 bg-muted rounded" />
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
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-lxd-purple" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Learner</TableHead>
              {showScore && <TableHead className="text-right">Score</TableHead>}
              {showCompletions && <TableHead className="text-right">Completions</TableHead>}
              {showTimeSpent && <TableHead className="text-right">Time</TableHead>}
              {showChange && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayEntries.map((entry) => {
              const RankIcon = rankIcons[entry.rank];
              const rankColor = rankColors[entry.rank];

              return (
                <TableRow key={entry.userId}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {RankIcon ? (
                        <RankIcon className={cn('h-5 w-5', rankColor)} />
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">
                          {entry.rank}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} />}
                        <AvatarFallback className="text-xs">
                          {getInitials(entry.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{entry.displayName}</p>
                        {entry.streak && entry.streak > 0 && (
                          <p className="text-xs text-muted-foreground">{entry.streak} day streak</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  {showScore && (
                    <TableCell className="text-right">
                      <Badge variant="secondary">{entry.score.toFixed(0)}</Badge>
                    </TableCell>
                  )}
                  {showCompletions && (
                    <TableCell className="text-right font-medium">{entry.completions}</TableCell>
                  )}
                  {showTimeSpent && (
                    <TableCell className="text-right text-muted-foreground">
                      {formatDuration(entry.timeSpent)}
                    </TableCell>
                  )}
                  {showChange && entry.change && (
                    <TableCell>
                      <ChangeIndicator change={entry.change} amount={entry.changeAmount} />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ChangeIndicator({ change, amount }: { change: 'up' | 'down' | 'same'; amount?: number }) {
  if (change === 'same') {
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  }

  if (change === 'up') {
    return (
      <div className="flex items-center text-green-600 dark:text-brand-success">
        <TrendingUp className="h-4 w-4" />
        {amount !== undefined && <span className="text-xs ml-1">+{amount}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center text-red-600 dark:text-brand-error">
      <TrendingDown className="h-4 w-4" />
      {amount !== undefined && <span className="text-xs ml-1">-{amount}</span>}
    </div>
  );
}

/**
 * Compact leaderboard for sidebar/widget use
 */
export interface CompactLeaderboardProps {
  entries: LeaderboardEntry[];
  limit?: number;
  loading?: boolean;
  className?: string;
}

export function CompactLeaderboard({
  entries,
  limit = 5,
  loading = false,
  className,
}: CompactLeaderboardProps) {
  const displayEntries = entries.slice(0, limit);

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-6 w-6 bg-muted rounded-full" />
            <div className="h-8 w-8 bg-muted rounded-full" />
            <div className="flex-1 h-4 bg-muted rounded" />
            <div className="h-4 w-8 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {displayEntries.map((entry) => {
        const RankIcon = rankIcons[entry.rank];
        const rankColor = rankColors[entry.rank];

        return (
          <div key={entry.userId} className="flex items-center gap-3">
            <div className="w-6 flex justify-center">
              {RankIcon ? (
                <RankIcon className={cn('h-4 w-4', rankColor)} />
              ) : (
                <span className="text-sm font-medium text-muted-foreground">{entry.rank}</span>
              )}
            </div>
            <Avatar className="h-8 w-8">
              {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} />}
              <AvatarFallback className="text-xs">{getInitials(entry.displayName)}</AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm font-medium truncate">{entry.displayName}</span>
            <span className="text-sm font-bold text-lxd-purple">{entry.score.toFixed(0)}</span>
          </div>
        );
      })}
    </div>
  );
}
