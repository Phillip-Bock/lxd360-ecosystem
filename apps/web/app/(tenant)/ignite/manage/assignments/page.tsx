'use client';

import { AlertCircle, BookOpen, CheckCircle2, ClipboardList, RefreshCw, Users } from 'lucide-react';
import { useCallback, useState, useTransition } from 'react';
import { AssignmentMatrix } from '@/components/ignite/assignments/assignment-matrix';
import { BulkAssignModal } from '@/components/ignite/assignments/bulk-assign-modal';
import { TeamRoster } from '@/components/ignite/assignments/team-roster';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { bulkEnroll } from '@/lib/actions/enrollments';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  department?: string;
  coursesAssigned: number;
  coursesCompleted: number;
}

interface Course {
  id: string;
  title: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  enrollmentCount: number;
}

interface AssignmentOptions {
  dueDate: string | null;
  priority: 'low' | 'normal' | 'high';
  notes: string;
}

type ViewMode = 'select' | 'preview';

// ============================================================================
// MOCK DATA - TODO(LXD-356): Replace with Firestore queries
// ============================================================================

const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Engineering',
    coursesAssigned: 5,
    coursesCompleted: 3,
  },
  {
    id: 'tm-2',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    department: 'Engineering',
    coursesAssigned: 4,
    coursesCompleted: 4,
  },
  {
    id: 'tm-3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    department: 'Design',
    coursesAssigned: 3,
    coursesCompleted: 1,
  },
  {
    id: 'tm-4',
    name: 'David Kim',
    email: 'david.kim@company.com',
    department: 'Product',
    coursesAssigned: 6,
    coursesCompleted: 5,
  },
  {
    id: 'tm-5',
    name: 'Jessica Thompson',
    email: 'jessica.thompson@company.com',
    department: 'Marketing',
    coursesAssigned: 2,
    coursesCompleted: 0,
  },
  {
    id: 'tm-6',
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    department: 'Sales',
    coursesAssigned: 4,
    coursesCompleted: 2,
  },
];

const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Leadership Fundamentals',
    duration: 120,
    difficulty: 'beginner',
    category: 'Leadership',
    enrollmentCount: 45,
  },
  {
    id: 'course-2',
    title: 'Advanced Project Management',
    duration: 180,
    difficulty: 'advanced',
    category: 'Management',
    enrollmentCount: 32,
  },
  {
    id: 'course-3',
    title: 'Effective Communication Skills',
    duration: 90,
    difficulty: 'intermediate',
    category: 'Soft Skills',
    enrollmentCount: 78,
  },
  {
    id: 'course-4',
    title: 'Data Analytics Essentials',
    duration: 240,
    difficulty: 'intermediate',
    category: 'Technical',
    enrollmentCount: 56,
  },
  {
    id: 'course-5',
    title: 'Compliance & Ethics Training',
    duration: 60,
    difficulty: 'beginner',
    category: 'Compliance',
    enrollmentCount: 120,
  },
  {
    id: 'course-6',
    title: 'Cybersecurity Awareness',
    duration: 45,
    difficulty: 'beginner',
    category: 'Security',
    enrollmentCount: 150,
  },
  {
    id: 'course-7',
    title: 'Agile Methodology Mastery',
    duration: 150,
    difficulty: 'advanced',
    category: 'Technical',
    enrollmentCount: 28,
  },
  {
    id: 'course-8',
    title: 'Customer Service Excellence',
    duration: 75,
    difficulty: 'beginner',
    category: 'Soft Skills',
    enrollmentCount: 89,
  },
];

// ============================================================================
// HELPERS
// ============================================================================

const difficultyColors: Record<string, string> = {
  beginner: 'bg-[var(--color-lxd-success)]/10 text-[var(--color-lxd-success)]',
  intermediate: 'bg-[var(--color-lxd-caution)]/10 text-[var(--color-lxd-caution)]',
  advanced: 'bg-[var(--color-lxd-warning)]/10 text-[var(--color-lxd-warning)]',
  expert: 'bg-[var(--color-lxd-error)]/10 text-[var(--color-lxd-error)]',
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// ============================================================================
// COURSE CATALOG COMPONENT
// ============================================================================

interface CourseCatalogProps {
  courses: Course[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

function CourseCatalog({ courses, selectedIds, onSelectionChange }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...new Set(courses.map((c) => c.category))];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleCourse = (courseId: string) => {
    const next = new Set(selectedIds);
    if (next.has(courseId)) {
      next.delete(courseId);
    } else {
      next.add(courseId);
    }
    onSelectionChange(next);
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
              Course Catalog
            </CardTitle>
            <CardDescription>
              {selectedIds.size} of {courses.length} selected
            </CardDescription>
          </div>
          <Badge variant={selectedIds.size > 0 ? 'default' : 'secondary'}>
            {selectedIds.size} selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            aria-label="Search courses"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg text-foreground"
            aria-label="Filter by category"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Course List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filteredCourses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => toggleCourse(course.id)}
              className={cn(
                'flex items-start gap-3 w-full p-3 rounded-lg border transition-colors text-left',
                selectedIds.has(course.id)
                  ? 'border-[var(--color-lxd-primary)] bg-[var(--color-lxd-primary)]/5'
                  : 'border-border hover:border-border/80 hover:bg-muted/30',
              )}
            >
              <Checkbox
                checked={selectedIds.has(course.id)}
                onCheckedChange={() => toggleCourse(course.id)}
                aria-label={`Select ${course.title}`}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{course.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge className={difficultyColors[course.difficulty]}>{course.difficulty}</Badge>
                  <span className="text-xs text-muted-foreground">
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
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8" aria-hidden="true" />
              <p>No courses found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ManagerAssignmentsPage() {
  const [selectedLearners, setSelectedLearners] = useState<Set<string>>(new Set());
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [options, setOptions] = useState<AssignmentOptions>({
    dueDate: null,
    priority: 'normal',
    notes: '',
  });
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedLearnersList = mockTeamMembers.filter((m) => selectedLearners.has(m.id));
  const selectedCoursesList = mockCourses.filter((c) => selectedCourses.has(c.id));
  const totalAssignments = selectedLearnersList.length * selectedCoursesList.length;

  const canPreview = selectedLearners.size > 0 && selectedCourses.size > 0;

  const handleRemoveLearner = (learnerId: string) => {
    const next = new Set(selectedLearners);
    next.delete(learnerId);
    setSelectedLearners(next);
  };

  const handleRemoveCourse = (courseId: string) => {
    const next = new Set(selectedCourses);
    next.delete(courseId);
    setSelectedCourses(next);
  };

  const handleConfirmAssignment = useCallback(() => {
    startTransition(async () => {
      try {
        const response = await bulkEnroll(
          Array.from(selectedLearners),
          Array.from(selectedCourses),
          'manager_assigned',
          {
            dueDate: options.dueDate || undefined,
          },
        );

        if ('error' in response) {
          setResult({ success: false, message: response.error });
        } else {
          setResult({
            success: true,
            message: `Successfully created ${response.data.totalCreated} enrollments`,
          });
          // Reset selections
          setSelectedLearners(new Set());
          setSelectedCourses(new Set());
          setOptions({ dueDate: null, priority: 'normal', notes: '' });
          setViewMode('select');
        }
      } catch (err) {
        setResult({
          success: false,
          message: err instanceof Error ? err.message : 'An unexpected error occurred',
        });
      }
    });
  }, [selectedLearners, selectedCourses, options.dueDate]);

  const handleBulkAssign = useCallback(
    async (data: {
      courseIds: string[];
      learnerIds: string[];
      dueDate: string | null;
      priority: string;
      notes: string;
    }) => {
      const response = await bulkEnroll(data.learnerIds, data.courseIds, 'manager_assigned', {
        dueDate: data.dueDate || undefined,
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      setResult({
        success: true,
        message: `Successfully created ${response.data.totalCreated} enrollments`,
      });
    },
    [],
  );

  const handleReset = () => {
    setSelectedLearners(new Set());
    setSelectedCourses(new Set());
    setOptions({ dueDate: null, priority: 'normal', notes: '' });
    setViewMode('select');
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-[var(--color-lxd-primary)]" aria-hidden="true" />
            Course Assignments
          </h1>
          <p className="text-muted-foreground mt-1">
            Assign courses to your team members individually or in bulk
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BulkAssignModal
            courses={mockCourses}
            learners={mockTeamMembers}
            onAssign={handleBulkAssign}
          />
          {(selectedLearners.size > 0 || selectedCourses.size > 0) && (
            <Button type="button" variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg',
            result.success
              ? 'bg-[var(--color-lxd-success)]/10 text-[var(--color-lxd-success)]'
              : 'bg-[var(--color-lxd-error)]/10 text-[var(--color-lxd-error)]',
          )}
        >
          {result.success ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          )}
          <span className="font-medium">{result.message}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setResult(null)}
            className="ml-auto"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Summary Bar */}
      {canPreview && viewMode === 'select' && (
        <Card className="bg-[var(--color-lxd-primary)]/5 border-[var(--color-lxd-primary)]/20">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
                  <span className="text-sm text-foreground">
                    <strong>{selectedLearners.size}</strong> learner
                    {selectedLearners.size !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen
                    className="w-5 h-5 text-[var(--color-lxd-primary)]"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-foreground">
                    <strong>{selectedCourses.size}</strong> course
                    {selectedCourses.size !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-sm text-foreground">
                  = <strong>{totalAssignments}</strong> total assignment
                  {totalAssignments !== 1 ? 's' : ''}
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setViewMode('preview')}
                className="bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90"
              >
                Preview Assignments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {viewMode === 'select' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Roster */}
          <TeamRoster
            members={mockTeamMembers}
            selectedIds={selectedLearners}
            onSelectionChange={setSelectedLearners}
          />

          {/* Course Catalog */}
          <CourseCatalog
            courses={mockCourses}
            selectedIds={selectedCourses}
            onSelectionChange={setSelectedCourses}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Options Card */}
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Assignment Options</CardTitle>
              <CardDescription>Configure due date and priority for this assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="due-date" className="text-sm font-medium text-foreground">
                    Due Date (Optional)
                  </label>
                  <Input
                    id="due-date"
                    type="date"
                    value={options.dueDate || ''}
                    onChange={(e) => setOptions({ ...options, dueDate: e.target.value || null })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium text-foreground">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={options.priority}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        priority: e.target.value as AssignmentOptions['priority'],
                      })
                    }
                    className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium text-foreground">
                    Notes (Optional)
                  </label>
                  <Input
                    id="notes"
                    placeholder="Add a note..."
                    value={options.notes}
                    onChange={(e) => setOptions({ ...options, notes: e.target.value })}
                    maxLength={200}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Matrix */}
          <AssignmentMatrix
            learners={selectedLearnersList.map((m) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              avatarUrl: m.avatarUrl,
            }))}
            courses={selectedCoursesList.map((c) => ({
              id: c.id,
              title: c.title,
              duration: c.duration,
            }))}
            options={options}
            onRemoveLearner={handleRemoveLearner}
            onRemoveCourse={handleRemoveCourse}
            onConfirm={handleConfirmAssignment}
            onBack={() => setViewMode('select')}
            isSubmitting={isPending}
          />
        </div>
      )}
    </div>
  );
}
