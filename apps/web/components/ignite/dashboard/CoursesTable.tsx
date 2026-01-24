'use client';

import { BarChart3, Edit, Eye, MoreVertical, Pause, Play, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export type CourseStatus = 'draft' | 'published' | 'archived' | 'in-review';

export interface InstructorCourse {
  id: string;
  title: string;
  status: CourseStatus;
  enrolledCount: number;
  completionRate: number;
  avgScore: number;
  lastUpdated: string;
  thumbnail?: string;
}

// ============================================================================
// MOCK DATA - Replace with Firestore
// ============================================================================

const mockCourses: InstructorCourse[] = [
  {
    id: 'course-1',
    title: 'Leadership Fundamentals',
    status: 'published',
    enrolledCount: 245,
    completionRate: 78,
    avgScore: 85.2,
    lastUpdated: '2026-01-20',
  },
  {
    id: 'course-2',
    title: 'Safety Compliance Training',
    status: 'published',
    enrolledCount: 412,
    completionRate: 92,
    avgScore: 91.5,
    lastUpdated: '2026-01-18',
  },
  {
    id: 'course-3',
    title: 'Customer Service Excellence',
    status: 'draft',
    enrolledCount: 0,
    completionRate: 0,
    avgScore: 0,
    lastUpdated: '2026-01-22',
  },
  {
    id: 'course-4',
    title: 'Data Privacy & Security',
    status: 'in-review',
    enrolledCount: 0,
    completionRate: 0,
    avgScore: 0,
    lastUpdated: '2026-01-21',
  },
  {
    id: 'course-5',
    title: 'Onboarding Essentials',
    status: 'archived',
    enrolledCount: 1205,
    completionRate: 95,
    avgScore: 88.7,
    lastUpdated: '2025-12-15',
  },
];

// ============================================================================
// STATUS BADGE
// ============================================================================

function getStatusBadge(status: CourseStatus) {
  const variants: Record<CourseStatus, { className: string; label: string }> = {
    draft: {
      className: 'bg-muted text-muted-foreground border-0',
      label: 'Draft',
    },
    published: {
      className: 'bg-[var(--color-lxd-success)]/15 text-[var(--color-lxd-success)] border-0',
      label: 'Published',
    },
    archived: {
      className: 'bg-muted/50 text-muted-foreground/70 border-0',
      label: 'Archived',
    },
    'in-review': {
      className: 'bg-[var(--color-lxd-caution)]/15 text-[var(--color-lxd-caution)] border-0',
      label: 'In Review',
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
// COMPONENT
// ============================================================================

export function CoursesTable({ courses = mockCourses }: { courses?: InstructorCourse[] }) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const router = useRouter();

  const handlePreview = (courseId: string) => {
    // Navigate to the course player in preview/demo mode
    router.push(`/ignite/learn/player/${courseId}?mode=preview`);
  };

  const handleEdit = (courseId: string) => {
    router.push(`/ignite/courses/${courseId}/edit`);
  };

  const handleAnalytics = (courseId: string) => {
    router.push(`/ignite/analytics/course/${courseId}`);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50">
        <h3 className="text-lg font-semibold text-foreground">My Courses</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and monitor your course portfolio
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/50">
            <TableHead className="h-12 px-6 font-medium">Course</TableHead>
            <TableHead className="h-12 px-4 font-medium w-[100px]">Status</TableHead>
            <TableHead className="h-12 px-4 font-medium text-right">Enrolled</TableHead>
            <TableHead className="h-12 px-4 font-medium text-right">Completion</TableHead>
            <TableHead className="h-12 px-4 font-medium text-right">Avg. Score</TableHead>
            <TableHead className="h-12 px-4 font-medium w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <p>No courses yet</p>
                  <p className="text-sm">Create your first course to get started</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => (
              <TableRow
                key={course.id}
                className={cn(
                  'hover:bg-muted/30 transition-colors cursor-pointer',
                  selectedCourse === course.id && 'bg-muted/50',
                )}
                onClick={() => setSelectedCourse(course.id)}
              >
                <TableCell className="h-16 px-6">
                  <div>
                    <p className="font-medium text-foreground">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(course.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="h-16 px-4">{getStatusBadge(course.status)}</TableCell>
                <TableCell className="h-16 px-4 text-right tabular-nums">
                  {course.enrolledCount.toLocaleString()}
                </TableCell>
                <TableCell className="h-16 px-4 text-right tabular-nums">
                  {course.completionRate > 0 ? `${course.completionRate}%` : '—'}
                </TableCell>
                <TableCell className="h-16 px-4 text-right tabular-nums">
                  {course.avgScore > 0 ? `${course.avgScore.toFixed(1)}%` : '—'}
                </TableCell>
                <TableCell className="h-16 px-4">
                  <TooltipProvider>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(course.id);
                            }}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Preview Course</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnalytics(course.id);
                            }}
                          >
                            <BarChart3 className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Analytics</TooltipContent>
                      </Tooltip>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(course.id);
                            }}
                          >
                            <Edit className="size-4 mr-2" />
                            Edit Course
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/ignite/learners?course=${course.id}`}>
                              <Users className="size-4 mr-2" />
                              Manage Learners
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {course.status === 'published' ? (
                            <DropdownMenuItem>
                              <Pause className="size-4 mr-2" />
                              Unpublish
                            </DropdownMenuItem>
                          ) : course.status === 'draft' ? (
                            <DropdownMenuItem>
                              <Play className="size-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default CoursesTable;
