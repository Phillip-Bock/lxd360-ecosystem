'use client';

export const dynamic = 'force-dynamic';

import {
  AlertCircle,
  Edit,
  Eye,
  FileArchive,
  Loader2,
  MoreVertical,
  Plus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { CreateCourseModal } from '@/components/ignite/teach';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserCourses } from '@/lib/actions/courses';
import type { Course } from '@/lib/actions/courses.types';
import { useAuth } from '@/lib/firebase/useAuth';

type CourseStatus = 'draft' | 'published' | 'archived' | 'processing';

function CourseStatusBadge({ status }: { status: CourseStatus }) {
  const styles: Record<CourseStatus, string> = {
    published: 'bg-green-500/20 text-green-400',
    draft: 'bg-yellow-500/20 text-yellow-400',
    archived: 'bg-gray-500/20 text-gray-400',
    processing: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

function CourseTypeBadge({ type }: { type: string }) {
  if (type === 'scorm') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-violet-500/20 text-violet-400">
        <FileArchive className="h-3 w-3" aria-hidden="true" />
        SCORM
      </span>
    );
  }
  return null;
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-lxd-purple mb-4" />
      <p className="text-muted-foreground">Loading your courses...</p>
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-lxd-purple/10 flex items-center justify-center mb-4">
          <Plus className="h-8 w-8 text-lxd-purple" />
        </div>
        <h3 className="text-lg font-semibold text-brand-primary mb-2">No courses yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Create your first course to start engaging learners with INSPIRE-powered content.
        </p>
        <Button
          type="button"
          onClick={onCreateClick}
          className="gap-2 bg-lxd-purple hover:bg-lxd-purple/90"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Create Your First Course
        </Button>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="bg-lxd-dark-surface border-red-500/30">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-brand-primary mb-2">Failed to load courses</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">{message}</p>
        <Button type="button" onClick={onRetry} variant="outline">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

function UnauthorizedState() {
  return (
    <Card className="bg-lxd-dark-surface border-amber-500/30">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-brand-primary mb-2">Access Restricted</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          You need instructor or admin permissions to access this page.
        </p>
        <Link href="/ignite/dashboard">
          <Button type="button" variant="outline">
            Return to Dashboard
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Instructor Courses page - Manage courses
 *
 * Security: Only accessible to users with 'instructor' or 'admin' roles.
 * Data: Fetches courses from Firestore tenants/{tenantId}/courses
 */
export default function TeachCoursesPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get tenantId from profile
  const tenantId = profile?.tenantId;

  // Check role - only instructor or higher can access
  const userRole = profile?.role;
  const authorizedRoles = ['instructor', 'org_admin', 'super_admin'];
  const isAuthorized = userRole ? authorizedRoles.includes(userRole) : false;

  const fetchCourses = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getUserCourses(tenantId);
      if ('data' in result) {
        setCourses(result.data);
      } else {
        setError(result.error ?? 'Failed to fetch courses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && tenantId && isAuthorized) {
      fetchCourses();
    } else if (!authLoading && !isAuthorized) {
      setLoading(false);
    }
  }, [authLoading, tenantId, isAuthorized, fetchCourses]);

  // Handle successful course creation
  const handleCourseCreated = () => {
    // Refresh the course list
    fetchCourses();
  };

  // Show loading while auth is being checked or redirecting
  if (authLoading || !user) {
    return (
      <div className="space-y-6">
        <LoadingState />
      </div>
    );
  }

  // Show unauthorized state if user doesn't have proper role
  if (!isAuthorized) {
    return (
      <div className="space-y-6">
        <UnauthorizedState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">My Courses</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your courses</p>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 bg-lxd-purple hover:bg-lxd-purple/90"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Create Course
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCourses} />
      ) : courses.length === 0 ? (
        <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="bg-lxd-dark-surface border-lxd-dark-border hover:border-lxd-purple/50 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CourseStatusBadge status={course.status as CourseStatus} />
                      <CourseTypeBadge type={course.type} />
                    </div>
                    <CardTitle className="text-brand-primary">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-lxd-dark-border/50 transition-colors"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-brand-primary">
                      {course.enrolledCount ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Enrolled</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-brand-primary">
                      {course.completedCount ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-brand-primary">
                      {course.avgRating ? course.avgRating.toFixed(1) : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-lxd-dark-border">
                  {course.type === 'scorm' && course.packageUrl ? (
                    <>
                      <Link
                        href={`/ignite/teach/courses/${course.id}/settings`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-lxd-dark-border text-sm text-muted-foreground hover:text-brand-primary hover:border-lxd-purple/50 transition-colors"
                      >
                        <Edit className="w-4 h-4" aria-hidden="true" />
                        Settings
                      </Link>
                      <a
                        href={course.packageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-lxd-dark-border text-sm text-muted-foreground hover:text-brand-primary hover:border-lxd-purple/50 transition-colors"
                      >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        Preview
                      </a>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/inspire/course/${course.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-lxd-dark-border text-sm text-muted-foreground hover:text-brand-primary hover:border-lxd-purple/50 transition-colors"
                      >
                        <Edit className="w-4 h-4" aria-hidden="true" />
                        Edit
                      </Link>
                      <Link
                        href={`/ignite/learn/player/${course.id}/1`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-lxd-dark-border text-sm text-muted-foreground hover:text-brand-primary hover:border-lxd-purple/50 transition-colors"
                      >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        Preview
                      </Link>
                    </>
                  )}
                  <Link
                    href={`/ignite/teach/learners?course=${course.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-lxd-dark-border text-sm text-muted-foreground hover:text-brand-primary hover:border-lxd-purple/50 transition-colors"
                  >
                    <Users className="w-4 h-4" aria-hidden="true" />
                    Learners
                  </Link>
                </div>

                <p className="text-xs text-muted-foreground text-right">
                  Last updated:{' '}
                  {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Never'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {tenantId && (
        <CreateCourseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          tenantId={tenantId}
          onCourseCreated={handleCourseCreated}
        />
      )}
    </div>
  );
}
