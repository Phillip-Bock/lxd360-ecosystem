'use client';

import {
  ArrowDownIcon,
  ArrowUpDown,
  ArrowUpIcon,
  Download,
  Search,
  UserCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { TeamMember } from './types';

export interface TeamProgressTableProps {
  /** Team member data */
  members: TeamMember[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when export button is clicked */
  onExport?: () => void;
  /** Additional class names */
  className?: string;
}

type SortField = 'name' | 'completionRate' | 'lastActive' | 'overdueCount';
type SortDirection = 'asc' | 'desc';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatLastActive(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getCompletionBadgeVariant(rate: number): 'success' | 'warning' | 'destructive' | 'default' {
  if (rate >= 80) return 'success';
  if (rate >= 50) return 'warning';
  if (rate > 0) return 'destructive';
  return 'default';
}

/**
 * TeamProgressTable - DataTable with team member progress
 *
 * Features:
 * - Sortable columns
 * - Search/filter functionality
 * - Completion rate badges
 * - Overdue indicators
 * - Export button placeholder
 */
export function TeamProgressTable({
  members,
  isLoading = false,
  onExport,
  className,
}: TeamProgressTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = members.filter(
        (m) =>
          m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query)
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'completionRate':
          comparison = a.completionRate - b.completionRate;
          break;
        case 'lastActive':
          comparison = a.lastActive.getTime() - b.lastActive.getTime();
          break;
        case 'overdueCount':
          comparison = a.overdueCount - b.overdueCount;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [members, searchQuery, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
    ) : (
      <ArrowDownIcon className="h-4 w-4" aria-hidden="true" />
    );
  };

  if (isLoading) {
    return (
      <Card className={cn('bg-card/60 backdrop-blur-sm', className)}>
        <CardHeader>
          <CardTitle>Team Progress</CardTitle>
          <CardDescription>Loading team data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-muted/30 rounded-lg" />
            <div className="h-64 bg-muted/30 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-card/60 backdrop-blur-sm', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-lxd-primary" aria-hidden="true" />
              Team Progress
            </CardTitle>
            <CardDescription>
              {filteredAndSortedMembers.length} of {members.length} team members
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Input */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search team members"
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="gap-1 -ml-3 font-medium"
                  >
                    Team Member
                    <SortIcon field="name" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Courses</TableHead>
                <TableHead>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('completionRate')}
                    className="gap-1 -ml-3 font-medium"
                  >
                    Completion
                    <SortIcon field="completionRate" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('overdueCount')}
                    className="gap-1 -ml-3 font-medium"
                  >
                    Overdue
                    <SortIcon field="overdueCount" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('lastActive')}
                    className="gap-1 -ml-3 font-medium"
                  >
                    Last Active
                    <SortIcon field="lastActive" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UserCircle className="h-8 w-8" aria-hidden="true" />
                      <p>No team members found</p>
                      {searchQuery && (
                        <p className="text-sm">Try adjusting your search query</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {member.avatarUrl && (
                            <AvatarImage
                              src={member.avatarUrl}
                              alt={`${member.name}'s avatar`}
                            />
                          )}
                          <AvatarFallback className="bg-lxd-primary/10 text-lxd-primary text-sm">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-muted-foreground">
                              {member.coursesCompleted}/{member.coursesAssigned}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {member.coursesCompleted} completed of {member.coursesAssigned}{' '}
                            assigned
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              member.completionRate >= 80
                                ? 'bg-emerald-500'
                                : member.completionRate >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                            )}
                            style={{ width: `${member.completionRate}%` }}
                          />
                        </div>
                        <Badge variant={getCompletionBadgeVariant(member.completionRate)}>
                          {member.completionRate}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.overdueCount > 0 ? (
                        <Badge variant="destructive">{member.overdueCount} overdue</Badge>
                      ) : (
                        <Badge variant="success">On track</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatLastActive(member.lastActive)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default TeamProgressTable;
