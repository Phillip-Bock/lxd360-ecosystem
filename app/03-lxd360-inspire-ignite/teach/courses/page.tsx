'use client';

export const dynamic = 'force-dynamic';

import { Edit, Eye, MoreVertical, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock courses data - TODO: Replace with Firestore queries
const coursesData = [
  {
    id: 'course-1',
    title: 'Leadership Fundamentals',
    description: 'Essential leadership skills for new managers',
    status: 'published',
    enrolledCount: 45,
    completedCount: 32,
    avgRating: 4.8,
    lastUpdated: '2024-01-10',
  },
  {
    id: 'course-2',
    title: 'Workplace Safety',
    description: 'Comprehensive safety training for all employees',
    status: 'published',
    enrolledCount: 120,
    completedCount: 98,
    avgRating: 4.6,
    lastUpdated: '2024-01-05',
  },
  {
    id: 'course-3',
    title: 'Data Analytics Essentials',
    description: 'Introduction to data analysis and visualization',
    status: 'draft',
    enrolledCount: 0,
    completedCount: 0,
    avgRating: null,
    lastUpdated: '2024-01-15',
  },
  {
    id: 'course-4',
    title: 'Communication Skills',
    description: 'Effective workplace communication techniques',
    status: 'published',
    enrolledCount: 67,
    completedCount: 45,
    avgRating: 4.5,
    lastUpdated: '2024-01-02',
  },
];

/**
 * Instructor Courses page - Manage courses
 */
export default function TeachCoursesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">My Courses</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your courses</p>
        </div>
        <Link href="/02-lxd360-inspire-studio">
          <Button className="gap-2 bg-lxd-purple hover:bg-lxd-purple/90">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coursesData.map((course) => (
          <Card
            key={course.id}
            className="bg-lxd-dark-surface border-lxd-dark-border hover:border-lxd-purple/50 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        course.status === 'published'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <CardTitle className="text-brand-primary">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
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
                  <p className="text-lg font-bold text-brand-primary">{course.enrolledCount}</p>
                  <p className="text-xs text-muted-foreground">Enrolled</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-brand-primary">{course.completedCount}</p>
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
                <Link
                  href={`/02-lxd360-inspire-studio/course/${course.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-lxd-dark-border text-sm text-muted-foreground hover:text-brand-primary hover:border-lxd-purple/50 transition-colors"
                >
                  <Edit className="w-4 h-4" aria-hidden="true" />
                  Edit
                </Link>
                <Link
                  href={`/03-lxd360-inspire-ignite/learn/player/${course.id}/1`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-lxd-dark-border text-sm text-muted-foreground hover:text-brand-primary hover:border-lxd-purple/50 transition-colors"
                >
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  Preview
                </Link>
                <Link
                  href={`/03-lxd360-inspire-ignite/teach/learners?course=${course.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-lxd-dark-border text-sm text-muted-foreground hover:text-brand-primary hover:border-lxd-purple/50 transition-colors"
                >
                  <Users className="w-4 h-4" aria-hidden="true" />
                  Learners
                </Link>
              </div>

              <p className="text-xs text-muted-foreground text-right">
                Last updated: {new Date(course.lastUpdated).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
