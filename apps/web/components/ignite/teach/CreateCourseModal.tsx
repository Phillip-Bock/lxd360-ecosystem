'use client';

import { BookOpen, FileArchive, Loader2, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createCourse } from '@/lib/actions/courses';
import { cn } from '@/lib/utils';
import { ScormUploader, type ScormUploadResult } from './ScormUploader';

type CourseCreationType = 'native' | 'scorm';

export interface CreateCourseModalProps {
  /** Tenant ID for course creation */
  tenantId: string;
  /** Callback when course is created successfully */
  onCourseCreated?: (courseId: string) => void;
  /** Custom trigger element (for uncontrolled mode) */
  trigger?: React.ReactNode;
  /** Controlled open state */
  isOpen?: boolean;
  /** Callback when modal should close (for controlled mode) */
  onClose?: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * CreateCourseModal - Modal for creating new courses
 *
 * Supports two modes:
 * - Native INSPIRE: Standard course creation
 * - SCORM Upload: Import existing SCORM packages
 */
export function CreateCourseModal({
  tenantId,
  onCourseCreated,
  trigger,
  isOpen,
  onClose,
  className,
}: CreateCourseModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Support both controlled and uncontrolled modes
  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      if (!value && onClose) {
        onClose();
      }
    } else {
      setInternalOpen(value);
    }
  };
  const [courseType, setCourseType] = useState<CourseCreationType>('native');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SCORM-specific state
  const [scormUploadResult, setScormUploadResult] = useState<ScormUploadResult | null>(null);

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setCourseType('native');
    setScormUploadResult(null);
    setError(null);
    setIsSubmitting(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      handleReset();
    }
  };

  const handleScormUploadComplete = (result: ScormUploadResult) => {
    setScormUploadResult(result);
    // Auto-fill title from filename if empty
    if (!title) {
      const nameWithoutExt = result.fileName.replace(/\.zip$/i, '').replace(/_/g, ' ');
      setTitle(nameWithoutExt);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (courseType === 'scorm' && !scormUploadResult) {
      setError('Please upload a SCORM package');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createCourse({
        title: title.trim(),
        description: description.trim(),
        type: courseType === 'scorm' ? 'scorm' : 'standard',
        ...(courseType === 'scorm' &&
          scormUploadResult && {
            packageUrl: scormUploadResult.packageUrl,
            scormVersion: '1.2', // Default, could be detected from package
          }),
      });

      if ('error' in result) {
        setError(result.error);
        return;
      }

      onCourseCreated?.(result.courseId);
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    title.trim() && description.trim() && (courseType === 'native' || scormUploadResult);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Only render trigger in uncontrolled mode */}
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              type="button"
              className={cn('gap-2 bg-lxd-purple hover:bg-lxd-purple/90', className)}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Create Course
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-lxd-primary" />
              Create New Course
            </DialogTitle>
            <DialogDescription>Choose how you want to create your course</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Course Type Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCourseType('native')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                  courseType === 'native'
                    ? 'border-lxd-primary bg-lxd-primary/5'
                    : 'border-border hover:border-lxd-primary/50',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    courseType === 'native' ? 'bg-lxd-primary/20' : 'bg-muted',
                  )}
                >
                  <Sparkles
                    className={cn(
                      'h-5 w-5',
                      courseType === 'native' ? 'text-lxd-primary' : 'text-muted-foreground',
                    )}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Native INSPIRE</p>
                  <p className="text-xs text-muted-foreground">Build from scratch</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCourseType('scorm')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                  courseType === 'scorm'
                    ? 'border-lxd-primary bg-lxd-primary/5'
                    : 'border-border hover:border-lxd-primary/50',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    courseType === 'scorm' ? 'bg-lxd-primary/20' : 'bg-muted',
                  )}
                >
                  <FileArchive
                    className={cn(
                      'h-5 w-5',
                      courseType === 'scorm' ? 'text-lxd-primary' : 'text-muted-foreground',
                    )}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">SCORM Upload</p>
                  <p className="text-xs text-muted-foreground">Import existing package</p>
                </div>
              </button>
            </div>

            {/* SCORM Uploader */}
            {courseType === 'scorm' && (
              <ScormUploader
                tenantId={tenantId}
                onUploadComplete={handleScormUploadComplete}
                onUploadError={(err) => setError(err.message)}
                disabled={isSubmitting}
              />
            )}

            {/* Course Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Leadership Fundamentals"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what learners will gain from this course..."
                  rows={3}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="bg-lxd-purple hover:bg-lxd-purple/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
