'use client';

export const dynamic = 'force-dynamic';

import { BookOpen, Clock, Play, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock data - TODO(LXD-301): Replace with Firestore queries
const assignedCourses = [
  {
    id: 'course-1',
    title: 'Advanced Leadership Skills',
    description: 'Develop essential leadership competencies for modern organizations',
    progress: 65,
    totalLessons: 12,
    completedLessons: 8,
    estimatedTime: '4h 30m',
    dueDate: '2026-02-15',
    status: 'in-progress',
    thumbnail: '/images/courses/leadership.jpg',
    lastAccessed: '2 hours ago',
  },
  {
    id: 'course-2',
    title: 'Workplace Safety Fundamentals',
    description: 'Essential safety protocols and compliance training',
    progress: 30,
    totalLessons: 8,
    completedLessons: 2,
    estimatedTime: '2h 15m',
    dueDate: '2026-01-30',
    status: 'in-progress',
    thumbnail: '/images/courses/safety.jpg',
    lastAccessed: '1 day ago',
  },
  {
    id: 'course-3',
    title: 'Data Analytics Essentials',
    description: 'Learn to analyze and visualize data for business insights',
    progress: 0,
    totalLessons: 15,
    completedLessons: 0,
    estimatedTime: '6h',
    dueDate: '2026-03-01',
    status: 'not-started',
    thumbnail: '/images/courses/analytics.jpg',
    lastAccessed: null,
  },
];

/**
 * My Learning page - Shows assigned courses and progress
 */
export default function MyLearningPage() {
  const inProgressCourses = assignedCourses.filter((c) => c.status === 'in-progress');
  const notStartedCourses = assignedCourses.filter((c) => c.status === 'not-started');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">My Learning</h1>
        <p className="text-muted-foreground mt-1">
          Track your progress and continue your learning journey
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lxd-purple/20">
                <BookOpen className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary">{assignedCourses.length}</p>
                <p className="text-xs text-muted-foreground">Assigned Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Target className="w-5 h-5 text-green-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary">{inProgressCourses.length}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <TrendingUp className="w-5 h-5 text-blue-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary">47%</p>
                <p className="text-xs text-muted-foreground">Avg. Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Clock className="w-5 h-5 text-orange-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary">12h 45m</p>
                <p className="text-xs text-muted-foreground">Time Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-brand-primary mb-4">Continue Learning</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {inProgressCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Not Started Courses */}
      {notStartedCourses.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-brand-primary mb-4">Ready to Start</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {notStartedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface CourseCardProps {
  course: (typeof assignedCourses)[0];
}

function CourseCard({ course }: CourseCardProps) {
  const isOverdue = new Date(course.dueDate) < new Date();
  const isDueSoon =
    !isOverdue && new Date(course.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border hover:border-lxd-purple/50 transition-colors group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-brand-primary group-hover:text-lxd-purple transition-colors">
              {course.title}
            </CardTitle>
            <CardDescription className="mt-1">{course.description}</CardDescription>
          </div>
          {course.status === 'in-progress' && (
            <span className="px-2 py-1 text-xs rounded-full bg-lxd-purple/20 text-lxd-purple">
              In Progress
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {course.completedLessons} of {course.totalLessons} lessons
            </span>
            <span className="text-brand-primary font-medium">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" aria-hidden="true" />
              {course.estimatedTime}
            </span>
            <span
              className={cn(
                'flex items-center gap-1',
                isOverdue && 'text-brand-error',
                isDueSoon && !isOverdue && 'text-orange-500',
                !isOverdue && !isDueSoon && 'text-muted-foreground',
              )}
            >
              Due: {new Date(course.dueDate).toLocaleDateString()}
            </span>
          </div>

          {course.lastAccessed && (
            <span className="text-muted-foreground text-xs">
              Last accessed: {course.lastAccessed}
            </span>
          )}
        </div>

        {/* Action button */}
        <Link
          href={`/(tenant)/ignite/learn/player/${course.id}/lesson-1`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-lxd-purple hover:bg-lxd-purple/90 text-white font-medium transition-colors"
        >
          <Play className="w-4 h-4" aria-hidden="true" />
          {course.status === 'not-started' ? 'Start Course' : 'Continue'}
        </Link>
      </CardContent>
    </Card>
  );
}
