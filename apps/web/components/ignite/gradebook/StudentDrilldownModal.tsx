'use client';

import { Calendar, Mail, TrendingDown, TrendingUp, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { AssignmentGrade, GradebookEntry, LearnerStatus } from './GradebookTable';

// ============================================================================
// TYPES
// ============================================================================

export interface StudentDrilldownModalProps {
  /** The learner entry to display */
  entry: GradebookEntry | null;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the modal should close */
  onOpenChange: (open: boolean) => void;
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

function getGradeColor(score: number | null, maxScore: number): string {
  if (score === null) return 'text-muted-foreground';

  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) return 'text-[var(--color-lxd-success)]';
  if (percentage >= 70) return 'text-[var(--color-lxd-caution)]';
  return 'text-[var(--color-lxd-error)]';
}

function formatDate(date: Date | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function calculateTrend(assignments: AssignmentGrade[]): 'up' | 'down' | 'stable' {
  const completedAssignments = assignments.filter((a) => a.score !== null);
  if (completedAssignments.length < 2) return 'stable';

  const recentHalf = completedAssignments.slice(-Math.ceil(completedAssignments.length / 2));
  const earlierHalf = completedAssignments.slice(0, Math.floor(completedAssignments.length / 2));

  const recentAvg = recentHalf.reduce((sum, a) => sum + (a.score ?? 0), 0) / recentHalf.length;
  const earlierAvg = earlierHalf.reduce((sum, a) => sum + (a.score ?? 0), 0) / earlierHalf.length;

  if (recentAvg > earlierAvg + 5) return 'up';
  if (recentAvg < earlierAvg - 5) return 'down';
  return 'stable';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StudentDrilldownModal({
  entry,
  open,
  onOpenChange,
  className,
}: StudentDrilldownModalProps): React.ReactElement {
  if (!entry) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn('max-w-2xl', className)}>
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>No student selected</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const completedAssignments = entry.assignments.filter((a) => a.score !== null);
  const completionRate = Math.round((completedAssignments.length / entry.assignments.length) * 100);
  const trend = calculateTrend(entry.assignments);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-2xl max-h-[90vh] overflow-y-auto', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-[var(--color-lxd-primary)]/10">
              <User className="size-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
            </div>
            <span>{entry.learnerName}</span>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4" aria-hidden="true" />
            {entry.learnerEmail}
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Overall Grade</p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  entry.status === 'incomplete'
                    ? 'text-muted-foreground'
                    : getGradeColor(entry.overallGrade, 100),
                )}
              >
                {entry.status === 'incomplete' ? '—' : `${entry.overallGrade}%`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(entry.status)}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Completion</p>
              <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Trend</p>
              <div className="flex items-center gap-1 mt-1">
                {trend === 'up' && (
                  <>
                    <TrendingUp
                      className="size-5 text-[var(--color-lxd-success)]"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-[var(--color-lxd-success)]">
                      Improving
                    </span>
                  </>
                )}
                {trend === 'down' && (
                  <>
                    <TrendingDown
                      className="size-5 text-[var(--color-lxd-error)]"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-[var(--color-lxd-error)]">
                      Declining
                    </span>
                  </>
                )}
                {trend === 'stable' && (
                  <span className="text-sm font-medium text-muted-foreground">Stable</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Table */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-foreground mb-3">Assignment Details</h3>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Percentage</TableHead>
                  <TableHead className="text-right">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.assignments.map((assignment) => {
                  const percentage =
                    assignment.score !== null
                      ? Math.round((assignment.score / assignment.maxScore) * 100)
                      : null;

                  return (
                    <TableRow key={assignment.assignmentId}>
                      <TableCell className="font-medium">{assignment.assignmentName}</TableCell>
                      <TableCell className="text-center">
                        {assignment.score !== null ? (
                          <span className={getGradeColor(assignment.score, assignment.maxScore)}>
                            {assignment.score}/{assignment.maxScore}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {percentage !== null ? (
                          <span
                            className={cn(
                              'inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium',
                              percentage >= 90 &&
                                'bg-[var(--color-lxd-success)]/10 text-[var(--color-lxd-success)]',
                              percentage >= 70 &&
                                percentage < 90 &&
                                'bg-[var(--color-lxd-caution)]/10 text-[var(--color-lxd-caution)]',
                              percentage < 70 &&
                                'bg-[var(--color-lxd-error)]/10 text-[var(--color-lxd-error)]',
                            )}
                          >
                            {percentage}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {assignment.submittedAt ? (
                          <span className="flex items-center justify-end gap-1.5">
                            <Calendar className="size-3" aria-hidden="true" />
                            {formatDate(assignment.submittedAt)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">Not submitted</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StudentDrilldownModal;
