'use client';

import {
  AlertCircle,
  Bell,
  Calendar,
  MoreVertical,
  RefreshCw,
  Search,
  UserMinus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export type EnrollmentStatus = 'active' | 'completed' | 'withdrawn' | 'expired';

export interface Enrollment {
  id: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: Date;
  enrolledBy: string;
  status: EnrollmentStatus;
  progress: number;
  dueDate?: Date;
  completedAt?: Date;
}

interface EnrollmentTableProps {
  enrollments: Enrollment[];
  onWithdraw?: (enrollmentId: string) => void;
  onExtend?: (enrollmentId: string) => void;
  onRemind?: (enrollmentId: string) => void;
}

// ============================================================================
// STATUS BADGE
// ============================================================================

function getStatusBadge(status: EnrollmentStatus) {
  const variants: Record<EnrollmentStatus, { className: string; label: string }> = {
    active: {
      className: 'bg-[var(--color-lxd-primary)]/15 text-[var(--color-lxd-primary)] border-0',
      label: 'Active',
    },
    completed: {
      className: 'bg-[var(--color-lxd-success)]/15 text-[var(--color-lxd-success)] border-0',
      label: 'Completed',
    },
    withdrawn: {
      className: 'bg-muted/50 text-muted-foreground/70 border-0',
      label: 'Withdrawn',
    },
    expired: {
      className: 'bg-[var(--color-lxd-error)]/15 text-[var(--color-lxd-error)] border-0',
      label: 'Expired',
    },
  };

  const { className, label } = variants[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            progress === 100
              ? 'bg-[var(--color-lxd-success)]'
              : progress >= 50
                ? 'bg-[var(--color-lxd-primary)]'
                : 'bg-[var(--color-lxd-caution)]',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm tabular-nums text-muted-foreground w-10">{progress}%</span>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EnrollmentTable({
  enrollments,
  onWithdraw,
  onExtend,
  onRemind,
}: EnrollmentTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'all'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  // Get unique courses for filter dropdown
  const uniqueCourses = useMemo(() => {
    const courses = new Map<string, string>();
    for (const e of enrollments) {
      courses.set(e.courseId, e.courseTitle);
    }
    return Array.from(courses.entries());
  }, [enrollments]);

  // Filter enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const matchesSearch =
        enrollment.learnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.learnerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
      const matchesCourse = courseFilter === 'all' || enrollment.courseId === courseFilter;
      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [enrollments, searchQuery, statusFilter, courseFilter]);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (enrollment: Enrollment): boolean => {
    if (!enrollment.dueDate || enrollment.status !== 'active') return false;
    return new Date(enrollment.dueDate) < new Date();
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50">
        <h3 className="text-lg font-semibold text-foreground">Enrollments</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage learner enrollments across all courses
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-border/50 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search by name, email, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-[var(--color-lxd-primary)]/50"
            aria-label="Search enrollments"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EnrollmentStatus | 'all')}
          className="px-4 py-2 bg-background border border-border rounded-lg text-foreground"
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="expired">Expired</option>
        </select>

        {/* Course filter */}
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-lg text-foreground max-w-[200px]"
          aria-label="Filter by course"
        >
          <option value="all">All Courses</option>
          {uniqueCourses.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <div className="px-6 py-2 text-sm text-muted-foreground border-b border-border/50">
        Showing {filteredEnrollments.length} of {enrollments.length} enrollments
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/50">
            <TableHead className="h-12 px-6 font-medium">Learner</TableHead>
            <TableHead className="h-12 px-4 font-medium">Course</TableHead>
            <TableHead className="h-12 px-4 font-medium w-[100px]">Status</TableHead>
            <TableHead className="h-12 px-4 font-medium w-[160px]">Progress</TableHead>
            <TableHead className="h-12 px-4 font-medium">Due Date</TableHead>
            <TableHead className="h-12 px-4 font-medium">Enrolled</TableHead>
            <TableHead className="h-12 px-4 font-medium w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEnrollments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <p>No enrollments found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredEnrollments.map((enrollment) => (
              <TableRow key={enrollment.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="h-16 px-6">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-[var(--color-lxd-primary)]/20 flex items-center justify-center text-[var(--color-lxd-primary)] text-sm font-medium">
                      {enrollment.learnerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{enrollment.learnerName}</p>
                      <p className="text-xs text-muted-foreground">{enrollment.learnerEmail}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="h-16 px-4">
                  <p className="text-sm text-foreground">{enrollment.courseTitle}</p>
                </TableCell>
                <TableCell className="h-16 px-4">{getStatusBadge(enrollment.status)}</TableCell>
                <TableCell className="h-16 px-4">
                  <ProgressBar progress={enrollment.progress} />
                </TableCell>
                <TableCell className="h-16 px-4">
                  {enrollment.dueDate ? (
                    <div className="flex items-center gap-1.5">
                      {isOverdue(enrollment) && (
                        <AlertCircle
                          className="w-4 h-4 text-[var(--color-lxd-error)]"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          isOverdue(enrollment)
                            ? 'text-[var(--color-lxd-error)]'
                            : 'text-foreground',
                        )}
                      >
                        {formatDate(enrollment.dueDate)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No deadline</span>
                  )}
                </TableCell>
                <TableCell className="h-16 px-4">
                  <span className="text-sm text-foreground">
                    {formatDate(enrollment.enrolledAt)}
                  </span>
                </TableCell>
                <TableCell className="h-16 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`Actions for ${enrollment.learnerName}`}
                      >
                        <MoreVertical className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {enrollment.status === 'active' && (
                        <>
                          <DropdownMenuItem onClick={() => onRemind?.(enrollment.id)}>
                            <Bell className="size-4 mr-2" aria-hidden="true" />
                            Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onExtend?.(enrollment.id)}>
                            <Calendar className="size-4 mr-2" aria-hidden="true" />
                            Extend Due Date
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {enrollment.status === 'expired' && (
                        <DropdownMenuItem onClick={() => onExtend?.(enrollment.id)}>
                          <RefreshCw className="size-4 mr-2" aria-hidden="true" />
                          Reactivate
                        </DropdownMenuItem>
                      )}
                      {enrollment.status !== 'withdrawn' && enrollment.status !== 'completed' && (
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => onWithdraw?.(enrollment.id)}
                        >
                          <UserMinus className="size-4 mr-2" aria-hidden="true" />
                          Withdraw
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default EnrollmentTable;
