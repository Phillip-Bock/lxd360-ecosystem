'use client';

import { ChevronDown, Download, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock gradebook data - TODO(LXD-301): Replace with Firestore queries
const gradebookData = {
  courses: [
    { id: 'course-1', name: 'Leadership Fundamentals' },
    { id: 'course-2', name: 'Workplace Safety' },
    { id: 'course-3', name: 'Data Analytics Essentials' },
  ],
  learners: [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      progress: 85,
      avgScore: 92,
      lastActivity: '2024-01-15T10:30:00',
      status: 'on_track',
      assignments: [
        { id: 'a1', name: 'Module 1 Quiz', score: 95, maxScore: 100, submitted: true },
        { id: 'a2', name: 'Module 2 Quiz', score: 88, maxScore: 100, submitted: true },
        { id: 'a3', name: 'Final Assessment', score: null, maxScore: 100, submitted: false },
      ],
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      progress: 100,
      avgScore: 96,
      lastActivity: '2024-01-15T09:15:00',
      status: 'completed',
      assignments: [
        { id: 'a1', name: 'Module 1 Quiz', score: 100, maxScore: 100, submitted: true },
        { id: 'a2', name: 'Module 2 Quiz', score: 92, maxScore: 100, submitted: true },
        { id: 'a3', name: 'Final Assessment', score: 96, maxScore: 100, submitted: true },
      ],
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike.davis@example.com',
      progress: 45,
      avgScore: 78,
      lastActivity: '2024-01-10T16:45:00',
      status: 'at_risk',
      assignments: [
        { id: 'a1', name: 'Module 1 Quiz', score: 78, maxScore: 100, submitted: true },
        { id: 'a2', name: 'Module 2 Quiz', score: null, maxScore: 100, submitted: false },
        { id: 'a3', name: 'Final Assessment', score: null, maxScore: 100, submitted: false },
      ],
    },
    {
      id: '4',
      name: 'Emily Brown',
      email: 'emily.brown@example.com',
      progress: 70,
      avgScore: 85,
      lastActivity: '2024-01-14T14:20:00',
      status: 'on_track',
      assignments: [
        { id: 'a1', name: 'Module 1 Quiz', score: 90, maxScore: 100, submitted: true },
        { id: 'a2', name: 'Module 2 Quiz', score: 80, maxScore: 100, submitted: true },
        { id: 'a3', name: 'Final Assessment', score: null, maxScore: 100, submitted: false },
      ],
    },
  ],
};

export default function GradebookPage() {
  const [selectedCourse, setSelectedCourse] = useState(gradebookData.courses[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLearners = gradebookData.learners.filter((learner) => {
    const matchesSearch =
      learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || learner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gradebook</h1>
          <p className="text-muted-foreground mt-1">View and manage learner grades and progress</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" aria-hidden="true" />
          Export Grades
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Course selector */}
            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 bg-background border border-border rounded-lg text-foreground appearance-none cursor-pointer"
                aria-label="Select course"
              >
                {gradebookData.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search learners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-[var(--color-lxd-primary)]/50"
                aria-label="Search learners"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-40 pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground appearance-none cursor-pointer"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="on_track">On Track</option>
                <option value="at_risk">At Risk</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gradebook Table */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Learner
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                  Progress
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                  Avg Score
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                  Module 1
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                  Module 2
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                  Final
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLearners.map((learner) => (
                <tr key={learner.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{learner.name}</p>
                      <p className="text-xs text-muted-foreground">{learner.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-lxd-primary)] rounded-full"
                          style={{ width: `${learner.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-foreground">{learner.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        learner.avgScore >= 90
                          ? 'text-[var(--color-lxd-success)]'
                          : learner.avgScore >= 70
                            ? 'text-[var(--color-lxd-caution)]'
                            : 'text-[var(--color-lxd-error)]',
                      )}
                    >
                      {learner.avgScore}%
                    </span>
                  </td>
                  {learner.assignments.map((assignment) => (
                    <td key={assignment.id} className="px-4 py-3 text-center">
                      {assignment.submitted ? (
                        <span
                          className={cn(
                            'text-sm',
                            assignment.score !== null && assignment.score >= 90
                              ? 'text-[var(--color-lxd-success)]'
                              : assignment.score !== null && assignment.score >= 70
                                ? 'text-[var(--color-lxd-caution)]'
                                : 'text-[var(--color-lxd-error)]',
                          )}
                        >
                          {assignment.score ?? '-'}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'px-2 py-1 text-xs rounded-full',
                        learner.status === 'completed' &&
                          'bg-[var(--color-lxd-success)]/20 text-[var(--color-lxd-success)]',
                        learner.status === 'on_track' &&
                          'bg-[var(--color-lxd-info)]/20 text-[var(--color-lxd-info)]',
                        learner.status === 'at_risk' &&
                          'bg-[var(--color-lxd-error)]/20 text-[var(--color-lxd-error)]',
                      )}
                    >
                      {learner.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Class Average</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(
                filteredLearners.reduce((sum, l) => sum + l.avgScore, 0) / filteredLearners.length,
              )}
              %
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(
                (filteredLearners.filter((l) => l.status === 'completed').length /
                  filteredLearners.length) *
                  100,
              )}
              %
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[var(--color-lxd-error)]">
              {filteredLearners.filter((l) => l.status === 'at_risk').length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
