'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { GradeCell } from './GradeCell';

// ============================================================================
// TYPES
// ============================================================================

export type LearnerStatus = 'passing' | 'failing' | 'incomplete';

export interface AssignmentGrade {
  assignmentId: string;
  assignmentName: string;
  score: number | null;
  maxScore: number;
  submittedAt?: Date;
  gradedAt?: Date;
}

export interface GradebookEntry {
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  assignments: AssignmentGrade[];
  overallGrade: number;
  status: LearnerStatus;
}

export interface Assignment {
  id: string;
  name: string;
  maxScore: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: string;
  direction: SortDirection;
}

export interface GradebookTableProps {
  /** List of learner entries */
  entries: GradebookEntry[];
  /** List of assignments (column definitions) */
  assignments: Assignment[];
  /** Status filter */
  statusFilter?: LearnerStatus | 'all';
  /** Search query */
  searchQuery?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getStatusBadge(status: LearnerStatus): React.ReactElement {
  const variants: Record<LearnerStatus, { className: string; label: string }> = {
    passing: {
      className: 'bg-[var(--color-lxd-success)]/15 text-[var(--color-lxd-success)] border-0',
      label: 'Passing',
    },
    failing: {
      className: 'bg-[var(--color-lxd-error)]/15 text-[var(--color-lxd-error)] border-0',
      label: 'Failing',
    },
    incomplete: {
      className: 'bg-muted text-muted-foreground border-0',
      label: 'Incomplete',
    },
  };

  const { className, label } = variants[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function SortIcon({ direction }: { direction?: SortDirection }): React.ReactElement {
  if (direction === 'asc') {
    return <ArrowUp className="size-4" aria-hidden="true" />;
  }
  if (direction === 'desc') {
    return <ArrowDown className="size-4" aria-hidden="true" />;
  }
  return <ArrowUpDown className="size-4 opacity-50" aria-hidden="true" />;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GradebookTable({
  entries,
  assignments,
  statusFilter = 'all',
  searchQuery = '',
  isLoading = false,
  className,
}: GradebookTableProps): React.ReactElement {
  const [sortState, setSortState] = useState<SortState | null>(null);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Apply status filter
      if (statusFilter !== 'all' && entry.status !== statusFilter) {
        return false;
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = entry.learnerName.toLowerCase().includes(query);
        const matchesEmail = entry.learnerEmail.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) {
          return false;
        }
      }

      return true;
    });
  }, [entries, statusFilter, searchQuery]);

  // Sort entries
  const sortedEntries = useMemo(() => {
    if (!sortState) return filteredEntries;

    const sorted = [...filteredEntries];
    const { column, direction } = sortState;
    const multiplier = direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      switch (column) {
        case 'name':
          return multiplier * a.learnerName.localeCompare(b.learnerName);
        case 'grade':
          return multiplier * (a.overallGrade - b.overallGrade);
        case 'status': {
          const statusOrder: Record<LearnerStatus, number> = {
            passing: 0,
            incomplete: 1,
            failing: 2,
          };
          return multiplier * (statusOrder[a.status] - statusOrder[b.status]);
        }
        default: {
          // Sort by assignment score
          const assignmentIdMatch = column.match(/^assignment-(.+)$/);
          if (assignmentIdMatch) {
            const assignmentId = assignmentIdMatch[1];
            const aGrade = a.assignments.find((g) => g.assignmentId === assignmentId);
            const bGrade = b.assignments.find((g) => g.assignmentId === assignmentId);
            const aScore = aGrade?.score ?? -1;
            const bScore = bGrade?.score ?? -1;
            return multiplier * (aScore - bScore);
          }
          return 0;
        }
      }
    });

    return sorted;
  }, [filteredEntries, sortState]);

  // Handle sort toggle
  const handleSort = (column: string): void => {
    setSortState((prev) => {
      if (prev?.column === column) {
        // Toggle direction or clear
        if (prev.direction === 'asc') {
          return { column, direction: 'desc' };
        }
        return null; // Clear sort
      }
      return { column, direction: 'asc' };
    });
  };

  // Get sort direction for a column
  const getSortDirection = (column: string): SortDirection | undefined => {
    if (sortState?.column === column) {
      return sortState.direction;
    }
    return undefined;
  };

  // Loading state
  if (isLoading) {
    return (
      <Table className={className}>
        <TableHeader>
          <TableRow>
            <TableHead>Learner</TableHead>
            <TableHead className="text-center">Grade</TableHead>
            {assignments.map((a) => (
              <TableHead key={a.id} className="text-center">
                {a.name}
              </TableHead>
            ))}
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-40 bg-muted/50 animate-pulse rounded" />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="h-6 w-12 bg-muted animate-pulse rounded mx-auto" />
              </TableCell>
              {assignments.map((a) => (
                <TableCell key={a.id} className="text-center">
                  <div className="h-6 w-12 bg-muted animate-pulse rounded mx-auto" />
                </TableCell>
              ))}
              <TableCell className="text-center">
                <div className="h-6 w-16 bg-muted animate-pulse rounded mx-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // Empty state
  if (sortedEntries.length === 0) {
    return (
      <Table className={className}>
        <TableHeader>
          <TableRow>
            <TableHead>Learner</TableHead>
            <TableHead className="text-center">Grade</TableHead>
            {assignments.map((a) => (
              <TableHead key={a.id} className="text-center">
                {a.name}
              </TableHead>
            ))}
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={3 + assignments.length}
              className="h-32 text-center text-muted-foreground"
            >
              {searchQuery || statusFilter !== 'all'
                ? 'No learners match the current filters'
                : 'No learners enrolled in this course'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table className={cn('', className)}>
      <TableHeader>
        <TableRow>
          {/* Learner column - sortable */}
          <TableHead className="min-w-[200px]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 font-medium hover:bg-transparent"
              onClick={() => handleSort('name')}
              aria-label={`Sort by name${getSortDirection('name') ? `, currently ${getSortDirection('name')}ending` : ''}`}
            >
              Learner
              <SortIcon direction={getSortDirection('name')} />
            </Button>
          </TableHead>

          {/* Overall grade column - sortable */}
          <TableHead className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 font-medium hover:bg-transparent"
              onClick={() => handleSort('grade')}
              aria-label={`Sort by grade${getSortDirection('grade') ? `, currently ${getSortDirection('grade')}ending` : ''}`}
            >
              Grade
              <SortIcon direction={getSortDirection('grade')} />
            </Button>
          </TableHead>

          {/* Assignment columns - sortable */}
          {assignments.map((assignment) => (
            <TableHead key={assignment.id} className="text-center min-w-[100px]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                onClick={() => handleSort(`assignment-${assignment.id}`)}
                aria-label={`Sort by ${assignment.name}${getSortDirection(`assignment-${assignment.id}`) ? `, currently ${getSortDirection(`assignment-${assignment.id}`)}ending` : ''}`}
              >
                <span className="truncate max-w-[80px]">{assignment.name}</span>
                <SortIcon direction={getSortDirection(`assignment-${assignment.id}`)} />
              </Button>
            </TableHead>
          ))}

          {/* Status column - sortable */}
          <TableHead className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 font-medium hover:bg-transparent"
              onClick={() => handleSort('status')}
              aria-label={`Sort by status${getSortDirection('status') ? `, currently ${getSortDirection('status')}ending` : ''}`}
            >
              Status
              <SortIcon direction={getSortDirection('status')} />
            </Button>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {sortedEntries.map((entry) => (
          <TableRow key={entry.learnerId}>
            {/* Learner info */}
            <TableCell>
              <div>
                <p className="font-medium text-foreground">{entry.learnerName}</p>
                <p className="text-xs text-muted-foreground">{entry.learnerEmail}</p>
              </div>
            </TableCell>

            {/* Overall grade */}
            <TableCell className="text-center">
              <GradeCell
                score={entry.status === 'incomplete' ? null : entry.overallGrade}
                maxScore={100}
                submitted={entry.status !== 'incomplete'}
                showPercentage
              />
            </TableCell>

            {/* Assignment grades */}
            {assignments.map((assignment) => {
              const grade = entry.assignments.find((g) => g.assignmentId === assignment.id);
              return (
                <TableCell key={assignment.id} className="text-center">
                  <GradeCell
                    score={grade?.score ?? null}
                    maxScore={assignment.maxScore}
                    submitted={grade?.submittedAt !== undefined}
                    assignmentName={assignment.name}
                    submittedAt={grade?.submittedAt}
                    gradedAt={grade?.gradedAt}
                  />
                </TableCell>
              );
            })}

            {/* Status badge */}
            <TableCell className="text-center">{getStatusBadge(entry.status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default GradebookTable;
