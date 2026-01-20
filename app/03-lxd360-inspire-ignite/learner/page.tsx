'use client';

export const dynamic = 'force-dynamic';

import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Play,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { StatCard } from '@/components/lms/cards/StatCard';
import { ProgressRing } from '@/components/lms/progress/ProgressRing';
import { StreakCounter } from '@/components/lms/progress/StreakCounter';
import { XPBar } from '@/components/lms/progress/XPBar';
import { cn } from '@/lib/utils';

// Type definitions
interface Course {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  instructor: string;
  category: string;
  progress?: number;
  nextLesson?: string;
  isRequired?: boolean;
  deadline?: string;
  rating?: number;
  enrolledCount?: number;
  level?: string;
  trending?: boolean;
  isNew?: boolean;
}

// Mock data for the dashboard
const continueLearning: Course[] = [
  {
    id: '1',
    title: 'Advanced Leadership & Management',
    thumbnail:
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    progress: 68,
    duration: '4h 30m',
    nextLesson: 'Effective Communication Strategies',
    instructor: 'Dr. Sarah Chen',
    category: 'Leadership',
  },
  {
    id: '2',
    title: 'Healthcare Safety Protocols 2024',
    thumbnail:
      'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800',
    progress: 45,
    duration: '3h 15m',
    nextLesson: 'Emergency Response Procedures',
    instructor: 'Dr. James Wilson',
    category: 'Compliance',
    isRequired: true,
    deadline: '2024-12-15',
  },
  {
    id: '3',
    title: 'Project Management Fundamentals',
    thumbnail:
      'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    progress: 25,
    duration: '6h 45m',
    nextLesson: 'Agile Methodology Basics',
    instructor: 'Mike Roberts',
    category: 'Professional Skills',
  },
  {
    id: '4',
    title: 'Data Analytics for Business',
    thumbnail:
      'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
    progress: 12,
    duration: '8h 20m',
    nextLesson: 'Introduction to SQL',
    instructor: 'Emma Thompson',
    category: 'Technical',
  },
];

const recommendedCourses: Course[] = [
  {
    id: '5',
    title: 'Emotional Intelligence at Work',
    thumbnail:
      'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '2h 45m',
    rating: 4.9,
    enrolledCount: 12500,
    instructor: 'Dr. Maria Garcia',
    category: 'Soft Skills',
    level: 'Intermediate',
  },
  {
    id: '6',
    title: 'Cybersecurity Essentials',
    thumbnail:
      'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '5h 30m',
    rating: 4.8,
    enrolledCount: 8900,
    instructor: 'Alex Kumar',
    category: 'IT Security',
    level: 'Beginner',
  },
  {
    id: '7',
    title: 'Public Speaking Mastery',
    thumbnail:
      'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '3h 15m',
    rating: 4.7,
    enrolledCount: 15200,
    instructor: 'Jennifer Lee',
    category: 'Communication',
    level: 'All Levels',
  },
  {
    id: '8',
    title: 'Financial Planning Basics',
    thumbnail:
      'https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '4h 00m',
    rating: 4.6,
    enrolledCount: 6700,
    instructor: 'Robert Chen',
    category: 'Finance',
    level: 'Beginner',
  },
  {
    id: '9',
    title: 'Design Thinking Workshop',
    thumbnail:
      'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '3h 45m',
    rating: 4.9,
    enrolledCount: 9800,
    instructor: 'Sophia Martinez',
    category: 'Innovation',
    level: 'Intermediate',
  },
];

const trendingCourses: Course[] = [
  {
    id: '10',
    title: 'AI & Machine Learning Fundamentals',
    thumbnail:
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '10h 00m',
    rating: 4.9,
    enrolledCount: 25000,
    instructor: 'Dr. Alan Turing',
    category: 'Technology',
    level: 'Intermediate',
    trending: true,
  },
  {
    id: '11',
    title: 'Remote Team Leadership',
    thumbnail:
      'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '2h 30m',
    rating: 4.8,
    enrolledCount: 18500,
    instructor: 'Sarah Johnson',
    category: 'Leadership',
    level: 'All Levels',
    isNew: true,
  },
  {
    id: '12',
    title: 'Mindfulness & Productivity',
    thumbnail:
      'https://images.pexels.com/photos/3759657/pexels-photo-3759657.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '1h 45m',
    rating: 4.7,
    enrolledCount: 14200,
    instructor: 'Dr. David Park',
    category: 'Wellness',
    level: 'Beginner',
  },
  {
    id: '13',
    title: 'Excel Advanced Formulas',
    thumbnail:
      'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '4h 15m',
    rating: 4.6,
    enrolledCount: 32000,
    instructor: 'Lisa Wang',
    category: 'Productivity',
    level: 'Advanced',
  },
];

const learningPaths = [
  {
    id: 'lp1',
    title: 'Leadership Excellence',
    description: 'Master the skills needed to lead high-performing teams',
    thumbnail:
      'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800',
    courseCount: 8,
    duration: '32h',
    progress: 45,
    skills: ['Leadership', 'Communication', 'Strategy'],
  },
  {
    id: 'lp2',
    title: 'Data Analytics Professional',
    description: 'Become proficient in data analysis and visualization',
    thumbnail:
      'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=800',
    courseCount: 12,
    duration: '48h',
    progress: 0,
    skills: ['SQL', 'Python', 'Visualization', 'Statistics'],
  },
  {
    id: 'lp3',
    title: 'Project Management Pro',
    description: 'Learn to manage projects from initiation to completion',
    thumbnail:
      'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
    courseCount: 6,
    duration: '24h',
    progress: 20,
    skills: ['Agile', 'Scrum', 'Planning', 'Risk Management'],
  },
];

const upcomingDeadlines = [
  {
    course: 'Healthcare Safety Protocols',
    deadline: 'Dec 15, 2024',
    daysLeft: 7,
    urgent: true,
  },
  {
    course: 'Annual Compliance Training',
    deadline: 'Dec 31, 2024',
    daysLeft: 23,
    urgent: false,
  },
  {
    course: 'Cybersecurity Awareness',
    deadline: 'Jan 15, 2025',
    daysLeft: 38,
    urgent: false,
  },
];

const recentAchievements = [
  {
    name: 'Quick Learner',
    icon: Zap,
    description: 'Completed 5 lessons in one day',
    date: '2 days ago',
  },
  {
    name: 'Streak Master',
    icon: Flame,
    description: '7-day learning streak',
    date: '1 week ago',
  },
  {
    name: 'Knowledge Seeker',
    icon: BookOpen,
    description: 'Enrolled in 10 courses',
    date: '2 weeks ago',
  },
];

// Carousel component for horizontal scrolling
function CourseCarousel({
  title,
  courses,
  showProgress = false,
  viewAllHref,
}: {
  title: string;
  courses: typeof continueLearning | typeof recommendedCourses;
  showProgress?: boolean;
  viewAllHref?: string;
}): React.JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right'): void => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleScroll = (): void => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <div className="relative group">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-brand-primary">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm text-(--brand-primary-hover) hover:text-(--brand-primary-hover)/80 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Carousel container */}
      <div className="relative">
        {/* Left arrow */}
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-lxd-dark-page/90 border border-lxd-dark-border rounded-full flex items-center justify-center text-brand-primary hover:bg-lxd-dark-card transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {courses.map((course) => (
            <div key={course.id} className="shrink-0 w-72">
              {showProgress ? (
                <CourseProgressCard course={course as (typeof continueLearning)[0]} />
              ) : (
                <CourseRecommendCard course={course as (typeof recommendedCourses)[0]} />
              )}
            </div>
          ))}
        </div>

        {/* Right arrow */}
        {showRightArrow && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-lxd-dark-surface/90 border border-studio-surface/50 rounded-full flex items-center justify-center text-brand-primary hover:bg-studio-surface/50 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Course card with progress (for continue learning)
function CourseProgressCard({
  course,
}: {
  course: (typeof continueLearning)[0];
}): React.JSX.Element {
  return (
    <Link
      href={`/lxp360/learner/learn/${course.id}`}
      className="block bg-studio-bg rounded-xl overflow-hidden border border-studio-surface/50 hover:border-(--brand-primary-hover)/50 transition-all group"
    >
      {/* Thumbnail with progress overlay */}
      <div className="relative h-40 overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Progress bar overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-surface-hover">
          <div
            className="h-full bg-linear-to-r from-(--brand-primary-hover) to-(--brand-secondary)"
            style={{ width: `${course.progress}%` }}
          />
        </div>
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-(--brand-primary-hover) flex items-center justify-center">
            <Play className="w-6 h-6 text-brand-primary ml-1" fill="white" />
          </div>
        </div>
        {/* Required badge */}
        {course.isRequired && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-brand-error/90 text-brand-primary text-xs font-medium rounded-md">
            Required
          </span>
        )}
        {/* Progress percentage */}
        <span className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-brand-primary text-xs font-medium rounded-md">
          {course.progress}%
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs text-(--brand-primary-hover) font-medium">{course.category}</span>
        <h3 className="text-brand-primary font-semibold mt-1 line-clamp-2 group-hover:text-(--brand-primary-hover) transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-brand-muted mt-2 line-clamp-1">Next: {course.nextLesson}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-brand-muted">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.duration} remaining
          </span>
        </div>
      </div>
    </Link>
  );
}

// Course card for recommendations
function CourseRecommendCard({
  course,
}: {
  course: (typeof recommendedCourses)[0];
}): React.JSX.Element {
  return (
    <Link
      href={`/lxp360/learner/courses/${course.id}`}
      className="block bg-studio-bg rounded-xl overflow-hidden border border-studio-surface/50 hover:border-(--brand-primary-hover)/50 transition-all group"
    >
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {course.trending && (
            <span className="px-2 py-1 bg-brand-warning/90 text-brand-primary text-xs font-medium rounded-md flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Trending
            </span>
          )}
          {course.isNew && (
            <span className="px-2 py-1 bg-brand-success/90 text-brand-primary text-xs font-medium rounded-md">
              New
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-(--brand-primary-hover) font-medium">
            {course.category}
          </span>
          <span className="text-xs text-brand-muted">{course.level}</span>
        </div>
        <h3 className="text-brand-primary font-semibold mt-1 line-clamp-2 group-hover:text-(--brand-primary-hover) transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-brand-muted mt-2">{course.instructor}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-brand-muted">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-brand-warning fill-yellow-400" />
            {course.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {course.enrolledCount?.toLocaleString() || '0'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.duration}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Learning path card
function LearningPathCard({ path }: { path: (typeof learningPaths)[0] }): React.JSX.Element {
  return (
    <Link
      href={`/lxp360/learner/learning-paths/${path.id}`}
      className="block bg-studio-bg rounded-xl overflow-hidden border border-studio-surface/50 hover:border-(--brand-secondary)/50 transition-all group"
    >
      {/* Thumbnail */}
      <div className="relative h-32 overflow-hidden">
        <Image
          src={path.thumbnail}
          alt={path.title}
          bg-linear-to-t
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-linear-to-t from-studio-bg to-transparent" />
        {/* Progress ring */}
        {path.progress > 0 && (
          <div className="absolute bottom-2 right-2">
            <ProgressRing value={path.progress} size={48} strokeWidth={4} color="purple" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-brand-primary font-semibold group-hover:text-(--brand-secondary) transition-colors">
          {path.title}
        </h3>
        <p className="text-xs text-brand-muted mt-1 line-clamp-2">{path.description}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-brand-muted">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {path.courseCount} courses
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {path.duration}
          </span>
        </div>
        {/* Skills */}
        <div className="flex flex-wrap gap-1 mt-3">
          {path.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 text-xs bg-(--brand-secondary)/10 text-(--brand-secondary) rounded-full"
            >
              {skill}
            </span>
          ))}
          {path.skills.length > 3 && (
            <span className="px-2 py-0.5 text-xs bg-gray-500/10 text-brand-muted rounded-full">
              +{path.skills.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function LearnerDashboard(): React.JSX.Element {
  // Mock user data
  const user = {
    name: 'Alex',
    level: 12,
    xp: 2450,
    xpToNextLevel: 3000,
    streak: 7,
    coursesInProgress: 4,
    coursesCompleted: 23,
    totalHours: 156,
    skillsAcquired: 18,
  };

  return (
    <div className="min-h-screen bg-lxd-dark-page">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-(--brand-primary-hover)/20 via-studio-bg-dark to-(--brand-secondary)/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-(--brand-primary-hover)/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-(--brand-secondary)/10 rounded-full blur-3xl" />

        <div className="relative px-6 py-8">
          {/* Welcome section */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-brand-primary">
                Welcome back, {user.name}!
              </h1>
              <p className="text-brand-muted mt-2 max-w-xl">
                You're making great progress! Keep up your learning streak and unlock new
                achievements.
              </p>

              {/* Quick stats row */}
              <div className="flex flex-wrap gap-4 mt-6">
                <StreakCounter currentStreak={user.streak} variant="default" size="md" />
                <XPBar
                  currentXP={user.xp}
                  xpToNextLevel={user.xpToNextLevel}
                  level={user.level}
                  size="md"
                  className="flex-1 max-w-xs"
                />
              </div>
            </div>

            {/* Featured course / Continue learning CTA */}
            {continueLearning[0] && (
              <div className="lg:w-96 bg-studio-bg rounded-2xl overflow-hidden border border-studio-surface/50">
                <div className="relative h-40">
                  <Image
                    src={continueLearning[0].thumbnail}
                    alt={continueLearning[0].title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-studio-bg to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-surface-hover">
                    <div
                      className="h-full bg-linear-to-r from-(--brand-primary-hover) to-(--brand-secondary)"
                      style={{ width: `${continueLearning[0].progress}%` }}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-brand-muted uppercase tracking-wide">
                    Continue where you left off
                  </p>
                  <h3 className="text-brand-primary font-semibold mt-1">
                    {continueLearning[0].title}
                  </h3>
                  <p className="text-xs text-brand-muted mt-1">
                    Next: {continueLearning[0].nextLesson}
                  </p>
                  <Link
                    href={`/lxp360/learner/learn/${continueLearning[0].id}`}
                    className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-2.5 bg-linear-to-r from-(--brand-primary-hover) to-(--brand-secondary) text-brand-primary font-medium rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Play className="w-4 h-4" fill="white" />
                    Resume Learning
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="In Progress"
            value={user.coursesInProgress}
            icon={BookOpen}
            color="blue"
            trend={{ value: 2, direction: 'up' }}
          />
          <StatCard
            title="Completed"
            value={user.coursesCompleted}
            icon={CheckCircle2}
            color="emerald"
            trend={{ value: 3, direction: 'up' }}
          />
          <StatCard
            title="Learning Hours"
            value={user.totalHours}
            icon={Clock}
            color="purple"
            suffix="hrs"
          />
          <StatCard
            title="Skills Acquired"
            value={user.skillsAcquired}
            icon={Target}
            color="amber"
            trend={{ value: 2, direction: 'up' }}
          />
        </div>
      </div>

      {/* Continue Learning carousel */}
      <div className="px-6 py-4">
        <CourseCarousel
          title="Continue Learning"
          courses={continueLearning}
          showProgress
          viewAllHref="/lxp360/learner/my-learning"
        />
      </div>

      {/* Two column layout for deadlines and achievements */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming deadlines */}
          <div className="bg-studio-bg rounded-2xl border border-studio-surface/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-brand-primary flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-error" />
                Upcoming Deadlines
              </h2>
              <Link
                href="/lxp360/learner/calendar"
                className="text-sm text-(--brand-primary-hover) hover:underline"
              >
                View Calendar
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border',
                    item.urgent
                      ? 'bg-brand-error/10 border-brand-error/30'
                      : 'bg-lxd-dark-surface border-studio-surface/50',
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-brand-primary">{item.course}</p>
                    <p
                      className={cn(
                        'text-xs mt-0.5',
                        item.urgent ? 'text-brand-error' : 'text-brand-muted',
                      )}
                    >
                      Due: {item.deadline}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      item.urgent
                        ? 'bg-brand-error/20 text-brand-error'
                        : 'bg-gray-500/20 text-brand-muted',
                    )}
                  >
                    {item.daysLeft} days left
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent achievements */}
          <div className="bg-studio-bg rounded-2xl border border-studio-surface/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-brand-primary flex items-center gap-2">
                <Trophy className="w-5 h-5 text-brand-warning" />
                Recent Achievements
              </h2>
              <Link
                href="/lxp360/learner/achievements"
                className="text-sm text-(--brand-primary-hover) hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentAchievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-lxd-dark-surface  border border-studio-surface/50"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <achievement.icon className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-primary">{achievement.name}</p>
                    <p className="text-xs text-brand-muted">{achievement.description}</p>
                  </div>
                  <span className="text-xs text-brand-muted">{achievement.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Paths */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-brand-primary">Your Learning Paths</h2>
          <Link
            href="/lxp360/learner/learning-paths"
            className="flex items-center gap-1 text-sm text-(--brand-primary-hover) hover:text-(--brand-primary-hover)/80 transition-colors"
          >
            Browse All Paths
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {learningPaths.map((path) => (
            <LearningPathCard key={path.id} path={path} />
          ))}
        </div>
      </div>

      {/* Recommended for you */}
      <div className="px-6 py-4">
        <CourseCarousel
          title="Recommended for You"
          courses={recommendedCourses}
          viewAllHref="/lxp360/learner/courses"
        />
      </div>

      {/* Trending now */}
      <div className="px-6 py-4 pb-8">
        <CourseCarousel
          title="Trending Now"
          courses={trendingCourses}
          viewAllHref="/lxp360/learner/courses?sort=trending"
        />
      </div>
    </div>
  );
}
