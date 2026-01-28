'use client';

import { Calendar, Check, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Course {
  id: string;
  title: string;
  enrolledCount: number;
}

interface Learner {
  id: string;
  name: string;
  email: string;
}

interface BulkEnrollDialogProps {
  courses: Course[];
  learners: Learner[];
  onEnroll: (data: { courseIds: string[]; learnerIds: string[]; dueDate: string | null }) => void;
  trigger?: React.ReactNode;
}

type Step = 'courses' | 'learners' | 'schedule' | 'confirm';

// ============================================================================
// STEP INDICATOR
// ============================================================================

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'courses', label: 'Courses' },
    { key: 'learners', label: 'Learners' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'confirm', label: 'Confirm' },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
              index < currentIndex
                ? 'bg-[var(--color-lxd-success)] text-white'
                : index === currentIndex
                  ? 'bg-[var(--color-lxd-primary)] text-white'
                  : 'bg-muted text-muted-foreground',
            )}
          >
            {index < currentIndex ? <Check className="w-4 h-4" aria-hidden="true" /> : index + 1}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-8 h-0.5 mx-1',
                index < currentIndex ? 'bg-[var(--color-lxd-success)]' : 'bg-muted',
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BulkEnrollDialog({ courses, learners, onEnroll, trigger }: BulkEnrollDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('courses');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [selectedLearners, setSelectedLearners] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = useCallback(() => {
    setStep('courses');
    setSelectedCourses(new Set());
    setSelectedLearners(new Set());
    setDueDate('');
    setSearchQuery('');
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const toggleLearner = (learnerId: string) => {
    setSelectedLearners((prev) => {
      const next = new Set(prev);
      if (next.has(learnerId)) {
        next.delete(learnerId);
      } else {
        next.add(learnerId);
      }
      return next;
    });
  };

  const toggleAllLearners = () => {
    const filteredLearners = learners.filter(
      (l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (selectedLearners.size === filteredLearners.length) {
      setSelectedLearners(new Set());
    } else {
      setSelectedLearners(new Set(filteredLearners.map((l) => l.id)));
    }
  };

  const handleNext = () => {
    if (step === 'courses') setStep('learners');
    else if (step === 'learners') setStep('schedule');
    else if (step === 'schedule') setStep('confirm');
  };

  const handleBack = () => {
    if (step === 'learners') setStep('courses');
    else if (step === 'schedule') setStep('learners');
    else if (step === 'confirm') setStep('schedule');
  };

  const handleConfirm = () => {
    onEnroll({
      courseIds: Array.from(selectedCourses),
      learnerIds: Array.from(selectedLearners),
      dueDate: dueDate || null,
    });
    setOpen(false);
    resetForm();
  };

  const canProceed = (): boolean => {
    if (step === 'courses') return selectedCourses.size > 0;
    if (step === 'learners') return selectedLearners.size > 0;
    return true;
  };

  const filteredLearners = learners.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedCoursesList = courses.filter((c) => selectedCourses.has(c.id));
  const selectedLearnersList = learners.filter((l) => selectedLearners.has(l.id));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            className="gap-2 bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90"
          >
            <Users className="w-4 h-4" aria-hidden="true" />
            Bulk Enroll
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Enrollment</DialogTitle>
          <DialogDescription>Enroll multiple learners into courses at once</DialogDescription>
        </DialogHeader>

        <StepIndicator currentStep={step} />

        <div className="flex-1 overflow-y-auto min-h-0 px-1">
          {/* Step 1: Select Courses */}
          {step === 'courses' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the courses you want to enroll learners into.
              </p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => toggleCourse(course.id)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors w-full text-left',
                      selectedCourses.has(course.id)
                        ? 'border-[var(--color-lxd-primary)] bg-[var(--color-lxd-primary)]/5'
                        : 'border-border hover:border-border/80',
                    )}
                  >
                    <Checkbox
                      checked={selectedCourses.has(course.id)}
                      onCheckedChange={() => toggleCourse(course.id)}
                      aria-label={`Select ${course.title}`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.enrolledCount} currently enrolled
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedCourses.size} course{selectedCourses.size !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* Step 2: Select Learners */}
          {step === 'learners' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the learners you want to enroll.
              </p>
              <input
                type="search"
                placeholder="Search learners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-[var(--color-lxd-primary)]/50"
                aria-label="Search learners"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={toggleAllLearners}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={
                      filteredLearners.length > 0 &&
                      filteredLearners.every((l) => selectedLearners.has(l.id))
                    }
                    onCheckedChange={toggleAllLearners}
                    aria-label="Select all learners"
                  />
                  <span className="text-sm text-foreground">Select all</span>
                </button>
                <span className="text-sm text-muted-foreground">
                  {selectedLearners.size} selected
                </span>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {filteredLearners.map((learner) => (
                  <button
                    key={learner.id}
                    type="button"
                    onClick={() => toggleLearner(learner.id)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors w-full text-left',
                      selectedLearners.has(learner.id)
                        ? 'border-[var(--color-lxd-primary)] bg-[var(--color-lxd-primary)]/5'
                        : 'border-border hover:border-border/80',
                    )}
                  >
                    <Checkbox
                      checked={selectedLearners.has(learner.id)}
                      onCheckedChange={() => toggleLearner(learner.id)}
                      aria-label={`Select ${learner.name}`}
                    />
                    <div className="w-8 h-8 rounded-full bg-[var(--color-lxd-primary)]/20 flex items-center justify-center text-[var(--color-lxd-primary)] text-xs font-medium">
                      {learner.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{learner.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{learner.email}</p>
                    </div>
                  </button>
                ))}
                {filteredLearners.length === 0 && (
                  <p className="text-center py-4 text-muted-foreground">No learners found</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Set Schedule */}
          {step === 'schedule' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set an optional due date for these enrollments.
              </p>
              <div className="space-y-2">
                <label htmlFor="due-date" className="text-sm font-medium text-foreground">
                  Due Date (Optional)
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-[var(--color-lxd-primary)]/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Leave blank for no deadline</p>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Review your enrollment details before confirming.
              </p>

              <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Courses ({selectedCoursesList.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCoursesList.map((course) => (
                      <span
                        key={course.id}
                        className="px-2 py-1 text-xs rounded-md bg-[var(--color-lxd-primary)]/10 text-[var(--color-lxd-primary)]"
                      >
                        {course.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Learners ({selectedLearnersList.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLearnersList.slice(0, 5).map((learner) => (
                      <span
                        key={learner.id}
                        className="px-2 py-1 text-xs rounded-md bg-muted text-foreground"
                      >
                        {learner.name}
                      </span>
                    ))}
                    {selectedLearnersList.length > 5 && (
                      <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                        +{selectedLearnersList.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">Due Date</p>
                  <p className="text-sm text-muted-foreground">
                    {dueDate
                      ? new Date(dueDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'No deadline'}
                  </p>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-foreground">
                    <strong>Total enrollments:</strong>{' '}
                    {selectedCoursesList.length * selectedLearnersList.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          {step !== 'courses' && (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
              Back
            </Button>
          )}
          {step !== 'confirm' ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleConfirm}
              className="bg-[var(--color-lxd-success)] hover:bg-[var(--color-lxd-success)]/90"
            >
              <Check className="w-4 h-4 mr-1" aria-hidden="true" />
              Confirm Enrollment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BulkEnrollDialog;
