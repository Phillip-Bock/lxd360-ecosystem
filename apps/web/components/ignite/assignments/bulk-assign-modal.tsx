'use client';

import {
  AlertCircle,
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Search,
  StickyNote,
  Users,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ModalCourse {
  id: string;
  title: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  enrollmentCount: number;
}

export interface ModalLearner {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  department?: string;
}

export interface BulkAssignData {
  courseIds: string[];
  learnerIds: string[];
  dueDate: string | null;
  priority: 'low' | 'normal' | 'high';
  notes: string;
}

export interface BulkAssignModalProps {
  /** Available courses in catalog */
  courses: ModalCourse[];
  /** Available learners (team members) */
  learners: ModalLearner[];
  /** Callback when assignment is confirmed */
  onAssign: (data: BulkAssignData) => Promise<void>;
  /** Optional trigger element */
  trigger?: React.ReactNode;
  /** Default open state */
  defaultOpen?: boolean;
}

type Step = 'courses' | 'learners' | 'options' | 'confirm';

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

const difficultyColors: Record<string, string> = {
  beginner: 'bg-[var(--color-lxd-success)]/10 text-[var(--color-lxd-success)]',
  intermediate: 'bg-[var(--color-lxd-caution)]/10 text-[var(--color-lxd-caution)]',
  advanced: 'bg-[var(--color-lxd-warning)]/10 text-[var(--color-lxd-warning)]',
  expert: 'bg-[var(--color-lxd-error)]/10 text-[var(--color-lxd-error)]',
};

// ============================================================================
// STEP INDICATOR
// ============================================================================

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'courses', label: 'Courses', icon: <BookOpen className="w-4 h-4" aria-hidden="true" /> },
    { key: 'learners', label: 'Learners', icon: <Users className="w-4 h-4" aria-hidden="true" /> },
    { key: 'options', label: 'Options', icon: <Calendar className="w-4 h-4" aria-hidden="true" /> },
    { key: 'confirm', label: 'Confirm', icon: <Check className="w-4 h-4" aria-hidden="true" /> },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              index < currentIndex
                ? 'bg-[var(--color-lxd-success)] text-white'
                : index === currentIndex
                  ? 'bg-[var(--color-lxd-primary)] text-white'
                  : 'bg-muted text-muted-foreground',
            )}
            title={step.label}
          >
            {index < currentIndex ? <Check className="w-4 h-4" aria-hidden="true" /> : step.icon}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-10 h-0.5 mx-1',
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

/**
 * BulkAssignModal - Multi-step wizard for assigning courses to learners
 *
 * Features:
 * - Step 1: Select courses from catalog
 * - Step 2: Select learners (team members)
 * - Step 3: Set due date, priority, notes
 * - Step 4: Preview and confirm
 */
export function BulkAssignModal({
  courses,
  learners,
  onAssign,
  trigger,
  defaultOpen = false,
}: BulkAssignModalProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [step, setStep] = useState<Step>('courses');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [selectedLearners, setSelectedLearners] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [notes, setNotes] = useState<string>('');
  const [courseSearch, setCourseSearch] = useState('');
  const [learnerSearch, setLearnerSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setStep('courses');
    setSelectedCourses(new Set());
    setSelectedLearners(new Set());
    setDueDate('');
    setPriority('normal');
    setNotes('');
    setCourseSearch('');
    setLearnerSearch('');
    setError(null);
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
    const filtered = learners.filter(
      (l) =>
        l.name.toLowerCase().includes(learnerSearch.toLowerCase()) ||
        l.email.toLowerCase().includes(learnerSearch.toLowerCase()),
    );
    if (selectedLearners.size === filtered.length) {
      setSelectedLearners(new Set());
    } else {
      setSelectedLearners(new Set(filtered.map((l) => l.id)));
    }
  };

  const handleNext = () => {
    setError(null);
    if (step === 'courses') setStep('learners');
    else if (step === 'learners') setStep('options');
    else if (step === 'options') setStep('confirm');
  };

  const handleBack = () => {
    setError(null);
    if (step === 'learners') setStep('courses');
    else if (step === 'options') setStep('learners');
    else if (step === 'confirm') setStep('options');
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onAssign({
        courseIds: Array.from(selectedCourses),
        learnerIds: Array.from(selectedLearners),
        dueDate: dueDate || null,
        priority,
        notes,
      });
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign courses');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = (): boolean => {
    if (step === 'courses') return selectedCourses.size > 0;
    if (step === 'learners') return selectedLearners.size > 0;
    return true;
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(courseSearch.toLowerCase()),
  );

  const filteredLearners = learners.filter(
    (l) =>
      l.name.toLowerCase().includes(learnerSearch.toLowerCase()) ||
      l.email.toLowerCase().includes(learnerSearch.toLowerCase()),
  );

  const selectedCoursesList = courses.filter((c) => selectedCourses.has(c.id));
  const selectedLearnersList = learners.filter((l) => selectedLearners.has(l.id));
  const totalAssignments = selectedCoursesList.length * selectedLearnersList.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            className="gap-2 bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90"
          >
            <Users className="w-4 h-4" aria-hidden="true" />
            Assign Courses
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Course Assignment</DialogTitle>
          <DialogDescription>Assign courses to multiple team members at once</DialogDescription>
        </DialogHeader>

        <StepIndicator currentStep={step} />

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-lxd-error)]/10 text-[var(--color-lxd-error)] text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 px-1">
          {/* Step 1: Select Courses */}
          {step === 'courses' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select courses from the catalog to assign to your team.
              </p>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="pl-10"
                  aria-label="Search courses"
                />
              </div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {filteredCourses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => toggleCourse(course.id)}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors w-full text-left',
                      selectedCourses.has(course.id)
                        ? 'border-[var(--color-lxd-primary)] bg-[var(--color-lxd-primary)]/5'
                        : 'border-border hover:border-border/80',
                    )}
                  >
                    <Checkbox
                      checked={selectedCourses.has(course.id)}
                      onCheckedChange={() => toggleCourse(course.id)}
                      aria-label={`Select ${course.title}`}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{course.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge className={difficultyColors[course.difficulty]}>
                          {course.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {formatDuration(course.duration)}
                        </span>
                        <span className="text-xs text-muted-foreground">{course.category}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {course.enrollmentCount} enrolled
                    </span>
                  </button>
                ))}
                {filteredCourses.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No courses found</p>
                )}
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
                Select team members to receive the course assignment.
              </p>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  placeholder="Search by name or email..."
                  value={learnerSearch}
                  onChange={(e) => setLearnerSearch(e.target.value)}
                  className="pl-10"
                  aria-label="Search learners"
                />
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
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
                  <span className="text-sm font-medium text-foreground">Select all</span>
                </button>
                <span className="text-sm text-muted-foreground">
                  {selectedLearners.size} selected
                </span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
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
                    <Avatar className="h-8 w-8">
                      {learner.avatarUrl && (
                        <AvatarImage src={learner.avatarUrl} alt={`${learner.name}'s avatar`} />
                      )}
                      <AvatarFallback className="bg-[var(--color-lxd-primary)]/20 text-[var(--color-lxd-primary)] text-xs">
                        {getInitials(learner.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{learner.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{learner.email}</p>
                    </div>
                    {learner.department && (
                      <span className="text-xs text-muted-foreground">{learner.department}</span>
                    )}
                  </button>
                ))}
                {filteredLearners.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No learners found</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Set Options */}
          {step === 'options' && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Configure assignment options for the selected courses.
              </p>

              <div className="space-y-2">
                <Label htmlFor="due-date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  Due Date (Optional)
                </Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-muted-foreground">Leave blank for no deadline</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="flex items-center gap-2">
                  <Flag className="w-4 h-4" aria-hidden="true" />
                  Priority Level
                </Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Complete when convenient</SelectItem>
                    <SelectItem value="normal">Normal - Standard priority</SelectItem>
                    <SelectItem value="high">High - Requires immediate attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4" aria-hidden="true" />
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes for this assignment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {notes.length}/500 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Review your assignment details before confirming.
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
                    {selectedLearnersList.slice(0, 8).map((learner) => (
                      <span
                        key={learner.id}
                        className="px-2 py-1 text-xs rounded-md bg-muted text-foreground"
                      >
                        {learner.name}
                      </span>
                    ))}
                    {selectedLearnersList.length > 8 && (
                      <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                        +{selectedLearnersList.length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium text-foreground">
                      {dueDate
                        ? new Date(dueDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'No deadline'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Priority</p>
                    <p className="font-medium text-foreground capitalize">{priority}</p>
                  </div>
                </div>

                {notes && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Notes</p>
                    <p className="font-medium text-foreground">{notes}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-foreground">
                    <strong>Total enrollments:</strong> {totalAssignments}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          {step !== 'courses' && (
            <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
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
              disabled={isSubmitting}
              className="bg-[var(--color-lxd-success)] hover:bg-[var(--color-lxd-success)]/90"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" aria-hidden="true" />
                  Confirm Assignment
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BulkAssignModal;
