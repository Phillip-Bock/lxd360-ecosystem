'use client';

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Star,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { requestEnrollment } from '@/lib/actions/enrollments';
import type { CatalogCourse } from './course-card';

export interface EnrollmentModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Course to enroll in */
  course: CatalogCourse | null;
  /** Current user ID */
  userId: string;
  /** Callback on successful enrollment */
  onEnrollmentSuccess?: (courseId: string, status: string) => void;
  /** Callback on enrollment error */
  onEnrollmentError?: (courseId: string, error: string) => void;
}

/**
 * Format duration from minutes to human readable string
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  return `${hours}h ${mins}m`;
}

/**
 * EnrollmentModal - Confirmation dialog for self-enrollment
 *
 * Features:
 * - Course preview with thumbnail and details
 * - Clear enrollment terms and information
 * - Loading state during enrollment
 * - Success/error feedback
 * - Accessible with keyboard navigation
 */
export function EnrollmentModal({
  isOpen,
  onClose,
  course,
  userId,
  onEnrollmentSuccess,
  onEnrollmentError,
}: EnrollmentModalProps): React.ReactElement | null {
  const [isPending, startTransition] = useTransition();
  const [enrollmentState, setEnrollmentState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>('');

  if (!course) return null;

  function handleEnroll(): void {
    if (!course) return;

    const courseId = course.id;
    startTransition(async () => {
      try {
        const result = await requestEnrollment(userId, courseId, 'self_enroll');

        if ('error' in result) {
          setEnrollmentState('error');
          setErrorMessage(result.error);
          onEnrollmentError?.(courseId, result.error);
        } else {
          setEnrollmentState('success');
          setEnrollmentStatus(result.data.status);
          onEnrollmentSuccess?.(courseId, result.data.status);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        setEnrollmentState('error');
        setErrorMessage(message);
        onEnrollmentError?.(courseId, message);
      }
    });
  }

  function handleClose(): void {
    setEnrollmentState('idle');
    setErrorMessage('');
    setEnrollmentStatus('');
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {enrollmentState === 'success' ? 'Enrollment Successful!' : 'Enroll in Course'}
          </DialogTitle>
          <DialogDescription>
            {enrollmentState === 'success'
              ? 'You have been enrolled in this course.'
              : 'Review the course details before enrolling.'}
          </DialogDescription>
        </DialogHeader>

        {/* Course preview */}
        <div className="space-y-4">
          {/* Thumbnail and basic info */}
          <div className="flex gap-4">
            <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-muted/20">
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lxd-primary/20 to-lxd-secondary/20">
                  <BookOpen className="w-6 h-6 text-lxd-primary/50" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground line-clamp-1">{course.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                {course.instructor}
              </p>
            </div>
          </div>

          {/* Course stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>{formatDuration(course.duration)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>{course.lessonCount} lessons</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
              <span>{course.rating.toFixed(1)} rating</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" aria-hidden="true" />
              <span>{course.enrollmentCount.toLocaleString()} enrolled</span>
            </div>
          </div>

          {/* Skills preview */}
          {course.skills && course.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Skills you'll gain:</p>
              <div className="flex flex-wrap gap-2">
                {course.skills.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {course.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{course.skills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Success state */}
          {enrollmentState === 'success' && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-success">
                  {enrollmentStatus === 'pending_approval'
                    ? 'Enrollment Request Submitted'
                    : 'Successfully Enrolled!'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {enrollmentStatus === 'pending_approval'
                    ? 'Your enrollment request has been submitted and is awaiting approval from a manager.'
                    : 'You can now access this course from your learning dashboard.'}
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {enrollmentState === 'error' && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-error/10 border border-error/20">
              <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-error">Enrollment Failed</p>
                <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Enrollment terms (only show in idle state) */}
          {enrollmentState === 'idle' && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">
                By enrolling, you agree to complete this course according to your organization's
                learning policies. Your progress will be tracked and reported to your manager.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {enrollmentState === 'success' ? (
            <Button onClick={handleClose}>Go to My Learning</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleEnroll} disabled={isPending || enrollmentState === 'error'}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Enrolling...
                  </>
                ) : enrollmentState === 'error' ? (
                  'Try Again'
                ) : course.isFree || !course.price ? (
                  'Enroll Now'
                ) : (
                  `Enroll - $${course.price}`
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
