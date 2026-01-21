'use client';

export const dynamic = 'force-dynamic';

import { BookOpen, Clock, Grid, List, Search, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock catalog data - TODO: Replace with Firestore queries
const catalogCourses = [
  {
    id: 'course-1',
    title: 'Advanced Leadership Skills',
    description: 'Develop essential leadership competencies for modern organizations',
    category: 'Leadership',
    duration: '4h 30m',
    lessons: 12,
    rating: 4.8,
    enrollments: 1234,
    level: 'Intermediate',
    thumbnail: '/images/courses/leadership.jpg',
    instructor: 'Dr. Sarah Chen',
  },
  {
    id: 'course-2',
    title: 'Workplace Safety Fundamentals',
    description: 'Essential safety protocols and compliance training',
    category: 'Compliance',
    duration: '2h 15m',
    lessons: 8,
    rating: 4.6,
    enrollments: 5678,
    level: 'Beginner',
    thumbnail: '/images/courses/safety.jpg',
    instructor: 'James Wilson',
  },
  {
    id: 'course-3',
    title: 'Data Analytics Essentials',
    description: 'Learn to analyze and visualize data for business insights',
    category: 'Technology',
    duration: '6h',
    lessons: 15,
    rating: 4.9,
    enrollments: 2345,
    level: 'Intermediate',
    thumbnail: '/images/courses/analytics.jpg',
    instructor: 'Maria Rodriguez',
  },
  {
    id: 'course-4',
    title: 'Effective Communication',
    description: 'Master professional communication skills for the workplace',
    category: 'Soft Skills',
    duration: '3h',
    lessons: 10,
    rating: 4.7,
    enrollments: 3456,
    level: 'Beginner',
    thumbnail: '/images/courses/communication.jpg',
    instructor: 'Alex Thompson',
  },
  {
    id: 'course-5',
    title: 'Project Management Fundamentals',
    description: 'Learn core project management methodologies and tools',
    category: 'Management',
    duration: '5h 30m',
    lessons: 14,
    rating: 4.5,
    enrollments: 1890,
    level: 'Intermediate',
    thumbnail: '/images/courses/pm.jpg',
    instructor: 'Rachel Kim',
  },
  {
    id: 'course-6',
    title: 'Cybersecurity Awareness',
    description: 'Protect yourself and your organization from cyber threats',
    category: 'Compliance',
    duration: '2h',
    lessons: 6,
    rating: 4.4,
    enrollments: 7890,
    level: 'Beginner',
    thumbnail: '/images/courses/cybersecurity.jpg',
    instructor: 'David Park',
  },
];

const categories = ['All', 'Leadership', 'Compliance', 'Technology', 'Soft Skills', 'Management'];
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

/**
 * Course Catalog page - Browse and discover courses
 */
export default function CatalogPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');

  // Filter courses
  const filteredCourses = catalogCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All Levels' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Course Catalog</h1>
        <p className="text-muted-foreground mt-1">
          Discover courses to expand your skills and knowledge
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-lxd-dark-surface border border-lxd-dark-border rounded-lg text-brand-primary placeholder-muted-foreground focus:outline-hidden focus:border-lxd-purple/50 transition-colors"
            aria-label="Search courses"
          />
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-lxd-dark-surface border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50"
          aria-label="Filter by category"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Level filter */}
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-4 py-2 bg-lxd-dark-surface border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50"
          aria-label="Filter by level"
        >
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-lxd-dark-surface border border-lxd-dark-border rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'grid'
                ? 'bg-lxd-purple text-white'
                : 'text-muted-foreground hover:text-brand-primary',
            )}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'list'
                ? 'bg-lxd-purple text-white'
                : 'text-muted-foreground hover:text-brand-primary',
            )}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredCourses.length} of {catalogCourses.length} courses
      </p>

      {/* Course grid/list */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CatalogCourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CatalogCourseListItem key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-brand-primary">No courses found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters to find what you&apos;re looking for
          </p>
        </div>
      )}
    </div>
  );
}

interface CourseProps {
  course: (typeof catalogCourses)[0];
}

function CatalogCourseCard({ course }: CourseProps) {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border hover:border-lxd-purple/50 transition-colors group overflow-hidden">
      {/* Thumbnail placeholder */}
      <div className="h-40 bg-linear-to-br from-lxd-purple/20 to-lxd-blue/20 flex items-center justify-center">
        <BookOpen className="w-12 h-12 text-lxd-purple/50" />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 text-xs rounded-full bg-lxd-purple/20 text-lxd-purple">
            {course.category}
          </span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-lxd-dark-border text-muted-foreground">
            {course.level}
          </span>
        </div>
        <CardTitle className="text-brand-primary group-hover:text-lxd-purple transition-colors line-clamp-1">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" aria-hidden="true" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              {course.lessons} lessons
            </span>
          </div>
        </div>

        {/* Rating and enrollments */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
            <span className="text-brand-primary font-medium">{course.rating}</span>
          </div>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4" aria-hidden="true" />
            {course.enrollments.toLocaleString()} enrolled
          </span>
        </div>

        <p className="text-sm text-muted-foreground">By {course.instructor}</p>

        {/* Enroll button */}
        <Link
          href={`/03-lxd360-inspire-ignite/learn/catalog/${course.id}`}
          className="flex items-center justify-center w-full py-2 rounded-lg border border-lxd-purple text-lxd-purple hover:bg-lxd-purple hover:text-white font-medium transition-colors"
        >
          View Course
        </Link>
      </CardContent>
    </Card>
  );
}

function CatalogCourseListItem({ course }: CourseProps) {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border hover:border-lxd-purple/50 transition-colors group">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="w-full sm:w-48 h-32 bg-linear-to-br from-lxd-purple/20 to-lxd-blue/20 flex items-center justify-center shrink-0">
          <BookOpen className="w-10 h-10 text-lxd-purple/50" />
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs rounded-full bg-lxd-purple/20 text-lxd-purple">
                  {course.category}
                </span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-lxd-dark-border text-muted-foreground">
                  {course.level}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-brand-primary group-hover:text-lxd-purple transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
              <p className="text-sm text-muted-foreground mt-2">By {course.instructor}</p>
            </div>

            <Link
              href={`/03-lxd360-inspire-ignite/learn/catalog/${course.id}`}
              className="shrink-0 px-4 py-2 rounded-lg border border-lxd-purple text-lxd-purple hover:bg-lxd-purple hover:text-white font-medium transition-colors"
            >
              View Course
            </Link>
          </div>

          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" aria-hidden="true" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              {course.lessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
              <span className="text-brand-primary">{course.rating}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" aria-hidden="true" />
              {course.enrollments.toLocaleString()} enrolled
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
