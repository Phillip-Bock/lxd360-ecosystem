'use client';

import { Filter, Search } from 'lucide-react';
import { useState } from 'react';
import type { Assignment, GradebookEntry, LearnerStatus } from '@/components/ignite/gradebook';
import {
  CourseSelector,
  ExportButton,
  GradebookTable,
  GradeSummary,
  StudentDrilldownModal,
} from '@/components/ignite/gradebook';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============================================================================
// MOCK DATA - TODO(LXD-301): Replace with Firestore queries
// ============================================================================

const mockCourses = [
  { id: 'course-1', name: 'Leadership Fundamentals', enrolledCount: 15 },
  { id: 'course-2', name: 'Workplace Safety', enrolledCount: 22 },
  { id: 'course-3', name: 'Data Analytics Essentials', enrolledCount: 8 },
];

const mockAssignments: Assignment[] = [
  { id: 'a1', name: 'Module 1 Quiz', maxScore: 100 },
  { id: 'a2', name: 'Module 2 Quiz', maxScore: 100 },
  { id: 'a3', name: 'Midterm Project', maxScore: 100 },
  { id: 'a4', name: 'Final Assessment', maxScore: 100 },
];

// Generate mock learner data (15 learners with varied grades)
const mockLearners: GradebookEntry[] = [
  {
    learnerId: '1',
    learnerName: 'John Smith',
    learnerEmail: 'john.smith@example.com',
    overallGrade: 92,
    status: 'passing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 95,
        maxScore: 100,
        submittedAt: new Date('2026-01-10T10:30:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 88,
        maxScore: 100,
        submittedAt: new Date('2026-01-15T14:20:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 92,
        maxScore: 100,
        submittedAt: new Date('2026-01-18T09:15:00'),
      },
      {
        assignmentId: 'a4',
        assignmentName: 'Final Assessment',
        score: 93,
        maxScore: 100,
        submittedAt: new Date('2026-01-22T11:45:00'),
      },
    ],
  },
  {
    learnerId: '2',
    learnerName: 'Sarah Johnson',
    learnerEmail: 'sarah.johnson@example.com',
    overallGrade: 96,
    status: 'passing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 100,
        maxScore: 100,
        submittedAt: new Date('2026-01-09T08:00:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 95,
        maxScore: 100,
        submittedAt: new Date('2026-01-14T16:30:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 94,
        maxScore: 100,
        submittedAt: new Date('2026-01-17T13:00:00'),
      },
      {
        assignmentId: 'a4',
        assignmentName: 'Final Assessment',
        score: 96,
        maxScore: 100,
        submittedAt: new Date('2026-01-21T10:00:00'),
      },
    ],
  },
  {
    learnerId: '3',
    learnerName: 'Mike Davis',
    learnerEmail: 'mike.davis@example.com',
    overallGrade: 58,
    status: 'failing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 65,
        maxScore: 100,
        submittedAt: new Date('2026-01-12T11:00:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 52,
        maxScore: 100,
        submittedAt: new Date('2026-01-16T15:45:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 58,
        maxScore: 100,
        submittedAt: new Date('2026-01-19T09:30:00'),
      },
      { assignmentId: 'a4', assignmentName: 'Final Assessment', score: null, maxScore: 100 },
    ],
  },
  {
    learnerId: '4',
    learnerName: 'Emily Brown',
    learnerEmail: 'emily.brown@example.com',
    overallGrade: 85,
    status: 'passing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 88,
        maxScore: 100,
        submittedAt: new Date('2026-01-10T14:00:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 82,
        maxScore: 100,
        submittedAt: new Date('2026-01-15T10:15:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 85,
        maxScore: 100,
        submittedAt: new Date('2026-01-18T16:00:00'),
      },
      { assignmentId: 'a4', assignmentName: 'Final Assessment', score: null, maxScore: 100 },
    ],
  },
  {
    learnerId: '5',
    learnerName: 'Robert Wilson',
    learnerEmail: 'robert.wilson@example.com',
    overallGrade: 78,
    status: 'passing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 75,
        maxScore: 100,
        submittedAt: new Date('2026-01-11T09:00:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 80,
        maxScore: 100,
        submittedAt: new Date('2026-01-14T12:30:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 78,
        maxScore: 100,
        submittedAt: new Date('2026-01-18T11:00:00'),
      },
      { assignmentId: 'a4', assignmentName: 'Final Assessment', score: null, maxScore: 100 },
    ],
  },
  {
    learnerId: '6',
    learnerName: 'Jennifer Martinez',
    learnerEmail: 'jennifer.martinez@example.com',
    overallGrade: 0,
    status: 'incomplete',
    assignments: [
      { assignmentId: 'a1', assignmentName: 'Module 1 Quiz', score: null, maxScore: 100 },
      { assignmentId: 'a2', assignmentName: 'Module 2 Quiz', score: null, maxScore: 100 },
      { assignmentId: 'a3', assignmentName: 'Midterm Project', score: null, maxScore: 100 },
      { assignmentId: 'a4', assignmentName: 'Final Assessment', score: null, maxScore: 100 },
    ],
  },
  {
    learnerId: '7',
    learnerName: 'David Lee',
    learnerEmail: 'david.lee@example.com',
    overallGrade: 91,
    status: 'passing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 92,
        maxScore: 100,
        submittedAt: new Date('2026-01-09T10:00:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 89,
        maxScore: 100,
        submittedAt: new Date('2026-01-13T14:00:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 93,
        maxScore: 100,
        submittedAt: new Date('2026-01-17T09:00:00'),
      },
      {
        assignmentId: 'a4',
        assignmentName: 'Final Assessment',
        score: 90,
        maxScore: 100,
        submittedAt: new Date('2026-01-21T15:30:00'),
      },
    ],
  },
  {
    learnerId: '8',
    learnerName: 'Amanda Taylor',
    learnerEmail: 'amanda.taylor@example.com',
    overallGrade: 63,
    status: 'failing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 70,
        maxScore: 100,
        submittedAt: new Date('2026-01-10T16:00:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 58,
        maxScore: 100,
        submittedAt: new Date('2026-01-15T11:30:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 62,
        maxScore: 100,
        submittedAt: new Date('2026-01-19T14:00:00'),
      },
      { assignmentId: 'a4', assignmentName: 'Final Assessment', score: null, maxScore: 100 },
    ],
  },
  {
    learnerId: '9',
    learnerName: 'Christopher Anderson',
    learnerEmail: 'chris.anderson@example.com',
    overallGrade: 88,
    status: 'passing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 85,
        maxScore: 100,
        submittedAt: new Date('2026-01-11T13:00:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 90,
        maxScore: 100,
        submittedAt: new Date('2026-01-14T09:30:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 88,
        maxScore: 100,
        submittedAt: new Date('2026-01-18T10:00:00'),
      },
      { assignmentId: 'a4', assignmentName: 'Final Assessment', score: null, maxScore: 100 },
    ],
  },
  {
    learnerId: '10',
    learnerName: 'Michelle Garcia',
    learnerEmail: 'michelle.garcia@example.com',
    overallGrade: 94,
    status: 'passing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 96,
        maxScore: 100,
        submittedAt: new Date('2026-01-09T11:00:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 92,
        maxScore: 100,
        submittedAt: new Date('2026-01-13T16:00:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 95,
        maxScore: 100,
        submittedAt: new Date('2026-01-17T14:30:00'),
      },
      {
        assignmentId: 'a4',
        assignmentName: 'Final Assessment',
        score: 93,
        maxScore: 100,
        submittedAt: new Date('2026-01-22T09:00:00'),
      },
    ],
  },
  {
    learnerId: '11',
    learnerName: 'James Thompson',
    learnerEmail: 'james.thompson@example.com',
    overallGrade: 0,
    status: 'incomplete',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 72,
        maxScore: 100,
        submittedAt: new Date('2026-01-12T10:00:00'),
      },
      { assignmentId: 'a2', assignmentName: 'Module 2 Quiz', score: null, maxScore: 100 },
      { assignmentId: 'a3', assignmentName: 'Midterm Project', score: null, maxScore: 100 },
      { assignmentId: 'a4', assignmentName: 'Final Assessment', score: null, maxScore: 100 },
    ],
  },
  {
    learnerId: '12',
    learnerName: 'Patricia White',
    learnerEmail: 'patricia.white@example.com',
    overallGrade: 81,
    status: 'passing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 80,
        maxScore: 100,
        submittedAt: new Date('2026-01-10T09:00:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 78,
        maxScore: 100,
        submittedAt: new Date('2026-01-14T15:00:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 84,
        maxScore: 100,
        submittedAt: new Date('2026-01-18T12:00:00'),
      },
      { assignmentId: 'a4', assignmentName: 'Final Assessment', score: null, maxScore: 100 },
    ],
  },
  {
    learnerId: '13',
    learnerName: 'Daniel Harris',
    learnerEmail: 'daniel.harris@example.com',
    overallGrade: 72,
    status: 'passing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 70,
        maxScore: 100,
        submittedAt: new Date('2026-01-11T14:00:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 74,
        maxScore: 100,
        submittedAt: new Date('2026-01-15T10:00:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 71,
        maxScore: 100,
        submittedAt: new Date('2026-01-19T11:00:00'),
      },
      { assignmentId: 'a4', assignmentName: 'Final Assessment', score: null, maxScore: 100 },
    ],
  },
  {
    learnerId: '14',
    learnerName: 'Elizabeth Clark',
    learnerEmail: 'elizabeth.clark@example.com',
    overallGrade: 87,
    status: 'passing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 90,
        maxScore: 100,
        submittedAt: new Date('2026-01-09T15:00:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 85,
        maxScore: 100,
        submittedAt: new Date('2026-01-13T11:00:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 86,
        maxScore: 100,
        submittedAt: new Date('2026-01-17T16:00:00'),
      },
      { assignmentId: 'a4', assignmentName: 'Final Assessment', score: null, maxScore: 100 },
    ],
  },
  {
    learnerId: '15',
    learnerName: 'William Robinson',
    learnerEmail: 'william.robinson@example.com',
    overallGrade: 55,
    status: 'failing',
    assignments: [
      {
        assignmentId: 'a1',
        assignmentName: 'Module 1 Quiz',
        score: 60,
        maxScore: 100,
        submittedAt: new Date('2026-01-12T09:00:00'),
      },
      {
        assignmentId: 'a2',
        assignmentName: 'Module 2 Quiz',
        score: 50,
        maxScore: 100,
        submittedAt: new Date('2026-01-16T14:00:00'),
      },
      {
        assignmentId: 'a3',
        assignmentName: 'Midterm Project',
        score: 55,
        maxScore: 100,
        submittedAt: new Date('2026-01-20T10:00:00'),
      },
      { assignmentId: 'a4', assignmentName: 'Final Assessment', score: null, maxScore: 100 },
    ],
  },
];

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function GradebookPage(): React.ReactElement {
  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LearnerStatus | 'all'>('all');
  const [selectedEntry, setSelectedEntry] = useState<GradebookEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedCourseName = mockCourses.find((c) => c.id === selectedCourse)?.name;

  const handleRowClick = (entry: GradebookEntry): void => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  // Convert mock data to summary format for GradeSummary
  const summaryEntries = mockLearners.map((l) => ({
    learnerId: l.learnerId,
    learnerName: l.learnerName,
    learnerEmail: l.learnerEmail,
    overallGrade: l.overallGrade,
    status: l.status,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gradebook</h1>
          <p className="text-muted-foreground mt-1">View and manage learner grades and progress</p>
        </div>
        <ExportButton
          entries={mockLearners}
          assignments={mockAssignments}
          courseName={selectedCourseName}
          className="self-start sm:self-auto"
        />
      </div>

      {/* Filters Card */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Course selector */}
            <CourseSelector
              courses={mockCourses}
              selectedCourseId={selectedCourse}
              onCourseChange={setSelectedCourse}
              className="lg:w-64"
            />

            {/* Search input */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search learners by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-[var(--color-lxd-primary)]/50 focus:ring-1 focus:ring-[var(--color-lxd-primary)]/50"
                aria-label="Search learners"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as LearnerStatus | 'all')}
              >
                <SelectTrigger className="w-36" aria-label="Filter by status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="passing">Passing</SelectItem>
                  <SelectItem value="failing">Failing</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <GradeSummary learners={summaryEntries} />

      {/* Gradebook Table */}
      <GradebookTable
        entries={mockLearners}
        assignments={mockAssignments}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onRowClick={handleRowClick}
      />

      {/* Student Drilldown Modal */}
      <StudentDrilldownModal
        entry={selectedEntry}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
