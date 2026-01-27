'use client';

import { BookOpen, Check, Users, X } from 'lucide-react';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

// ============================================================================
// TYPES
// ============================================================================

export interface MatrixLearner {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface MatrixCourse {
  id: string;
  title: string;
  duration: number; // minutes
}

export interface AssignmentOptions {
  dueDate: string | null;
  priority: 'low' | 'normal' | 'high';
  notes: string;
}

export interface AssignmentMatrixProps {
  /** Selected learners */
  learners: MatrixLearner[];
  /** Selected courses */
  courses: MatrixCourse[];
  /** Assignment options */
  options: AssignmentOptions;
  /** Callback to remove a learner */
  onRemoveLearner: (learnerId: string) => void;
  /** Callback to remove a course */
  onRemoveCourse: (courseId: string) => void;
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Callback to go back */
  onBack: () => void;
  /** Is currently submitting */
  isSubmitting?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'No deadline';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AssignmentMatrix - Preview grid of assignments before confirming
 *
 * Features:
 * - Visual matrix of learners x courses
 * - Summary statistics
 * - Option details display
 * - Remove individual items
 * - Confirm action
 */
export function AssignmentMatrix({
  learners,
  courses,
  options,
  onRemoveLearner,
  onRemoveCourse,
  onConfirm,
  onBack,
  isSubmitting = false,
  className,
}: AssignmentMatrixProps) {
  const totalAssignments = learners.length * courses.length;
  const totalDuration = useMemo(() => {
    return courses.reduce((sum, c) => sum + c.duration, 0) * learners.length;
  }, [courses, learners.length]);

  const priorityColors = {
    low: 'bg-muted text-muted-foreground',
    normal: 'bg-[var(--color-lxd-primary)]/10 text-[var(--color-lxd-primary)]',
    high: 'bg-[var(--color-lxd-error)]/10 text-[var(--color-lxd-error)]',
  };

  if (learners.length === 0 || courses.length === 0) {
    return (
      <Card className={cn('bg-card/60 backdrop-blur-sm', className)}>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="p-4 rounded-full bg-muted/30">
            <Users className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">No Assignments Selected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Select at least one learner and one course to preview assignments
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onBack}>
            Go Back
          </Button>
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
              <Check className="h-5 w-5 text-[var(--color-lxd-success)]" aria-hidden="true" />
              Assignment Preview
            </CardTitle>
            <CardDescription>Review assignments before confirming</CardDescription>
          </div>
          <Badge variant="default" className="text-lg px-3 py-1">
            {totalAssignments} assignment{totalAssignments !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <p className="text-2xl font-bold text-foreground">{learners.length}</p>
            <p className="text-sm text-muted-foreground">
              Learner{learners.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <p className="text-2xl font-bold text-foreground">{courses.length}</p>
            <p className="text-sm text-muted-foreground">Course{courses.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <p className="text-2xl font-bold text-foreground">{totalAssignments}</p>
            <p className="text-sm text-muted-foreground">Total Assignments</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <p className="text-2xl font-bold text-foreground">{formatDuration(totalDuration)}</p>
            <p className="text-sm text-muted-foreground">Total Learning Time</p>
          </div>
        </div>

        {/* Assignment Options */}
        <div className="p-4 rounded-lg border border-border/50 space-y-3">
          <h4 className="text-sm font-medium text-foreground">Assignment Options</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Due Date:</span>
              <span className="font-medium text-foreground">{formatDate(options.dueDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Priority:</span>
              <Badge className={priorityColors[options.priority]}>{options.priority}</Badge>
            </div>
            {options.notes && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Notes:</span>
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {options.notes}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Learners Section */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" aria-hidden="true" />
            Selected Learners ({learners.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {learners.map((learner) => (
              <TooltipProvider key={learner.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 group">
                      <Avatar className="h-6 w-6">
                        {learner.avatarUrl && (
                          <AvatarImage src={learner.avatarUrl} alt={learner.name} />
                        )}
                        <AvatarFallback className="bg-[var(--color-lxd-primary)]/10 text-[var(--color-lxd-primary)] text-xs">
                          {getInitials(learner.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{learner.name}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveLearner(learner.id)}
                        className="p-0.5 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                        aria-label={`Remove ${learner.name}`}
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{learner.email}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Courses Section */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Selected Courses ({courses.length})
          </h4>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <p className="font-medium text-foreground">{course.title}</p>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDuration(course.duration)}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => onRemoveCourse(course.id)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        aria-label={`Remove ${course.title}`}
                      >
                        <X className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="gap-2 bg-[var(--color-lxd-success)] hover:bg-[var(--color-lxd-success)]/90"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Assigning...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Confirm {totalAssignments} Assignment{totalAssignments !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AssignmentMatrix;
