'use client';

import { BookOpen } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  type CatalogCourse,
  CatalogCourseCard,
  CatalogFilters,
  EnrollmentModal,
  filterByDuration,
} from '@/components/ignite/catalog';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

export const dynamic = 'force-dynamic';

// Mock catalog data - TODO(LXD-301): Replace with Firestore queries
const MOCK_COURSES: CatalogCourse[] = [
  {
    id: 'course-1',
    title: 'Advanced Leadership Skills',
    description:
      'Develop essential leadership competencies for modern organizations. Learn how to inspire teams, make strategic decisions, and drive organizational change.',
    shortDescription: 'Develop essential leadership competencies for modern organizations',
    category: 'Leadership',
    difficulty: 'intermediate',
    duration: 270, // 4h 30m in minutes
    lessonCount: 12,
    rating: 4.8,
    enrollmentCount: 1234,
    instructor: 'Dr. Sarah Chen',
    skills: ['Strategic Thinking', 'Team Management', 'Decision Making', 'Communication'],
    isFree: false,
    price: 49,
  },
  {
    id: 'course-2',
    title: 'Workplace Safety Fundamentals',
    description:
      'Essential safety protocols and compliance training for all employees. Covers OSHA requirements, emergency procedures, and hazard identification.',
    shortDescription: 'Essential safety protocols and compliance training',
    category: 'Compliance',
    difficulty: 'beginner',
    duration: 135, // 2h 15m
    lessonCount: 8,
    rating: 4.6,
    enrollmentCount: 5678,
    instructor: 'James Wilson',
    skills: ['Safety Protocols', 'Risk Assessment', 'Emergency Response'],
    isRequired: true,
    isFree: true,
  },
  {
    id: 'course-3',
    title: 'Data Analytics Essentials',
    description:
      'Learn to analyze and visualize data for business insights. Master tools like Excel, SQL, and basic Python for data analysis.',
    shortDescription: 'Learn to analyze and visualize data for business insights',
    category: 'Technology',
    difficulty: 'intermediate',
    duration: 360, // 6h
    lessonCount: 15,
    rating: 4.9,
    enrollmentCount: 2345,
    instructor: 'Maria Rodriguez',
    skills: ['Data Analysis', 'Excel', 'SQL', 'Data Visualization', 'Python Basics'],
    isFree: false,
    price: 79,
  },
  {
    id: 'course-4',
    title: 'Effective Communication',
    description:
      'Master professional communication skills for the workplace. Improve your written and verbal communication, presentation skills, and active listening.',
    shortDescription: 'Master professional communication skills for the workplace',
    category: 'Soft Skills',
    difficulty: 'beginner',
    duration: 180, // 3h
    lessonCount: 10,
    rating: 4.7,
    enrollmentCount: 3456,
    instructor: 'Alex Thompson',
    skills: ['Written Communication', 'Presentation Skills', 'Active Listening', 'Feedback'],
    isFree: true,
  },
  {
    id: 'course-5',
    title: 'Project Management Fundamentals',
    description:
      'Learn core project management methodologies and tools. Covers Agile, Scrum, Waterfall, and essential PM techniques.',
    shortDescription: 'Learn core project management methodologies and tools',
    category: 'Management',
    difficulty: 'intermediate',
    duration: 330, // 5h 30m
    lessonCount: 14,
    rating: 4.5,
    enrollmentCount: 1890,
    instructor: 'Rachel Kim',
    skills: ['Agile', 'Scrum', 'Project Planning', 'Risk Management', 'Stakeholder Management'],
    isFree: false,
    price: 59,
  },
  {
    id: 'course-6',
    title: 'Cybersecurity Awareness',
    description:
      'Protect yourself and your organization from cyber threats. Learn about phishing, malware, password security, and safe browsing practices.',
    shortDescription: 'Protect yourself and your organization from cyber threats',
    category: 'Compliance',
    difficulty: 'beginner',
    duration: 120, // 2h
    lessonCount: 6,
    rating: 4.4,
    enrollmentCount: 7890,
    instructor: 'David Park',
    skills: ['Phishing Prevention', 'Password Security', 'Data Protection'],
    isRequired: true,
    isFree: true,
  },
  {
    id: 'course-7',
    title: 'Advanced Excel Mastery',
    description:
      'Take your Excel skills to the next level with advanced formulas, pivot tables, macros, and data modeling techniques.',
    shortDescription: 'Master advanced Excel formulas, pivot tables, and macros',
    category: 'Technology',
    difficulty: 'advanced',
    duration: 480, // 8h
    lessonCount: 20,
    rating: 4.8,
    enrollmentCount: 1567,
    instructor: 'Lisa Wang',
    skills: ['Advanced Formulas', 'Pivot Tables', 'VBA Macros', 'Data Modeling'],
    isFree: false,
    price: 69,
  },
  {
    id: 'course-8',
    title: 'Diversity and Inclusion Training',
    description:
      'Build an inclusive workplace culture. Learn about unconscious bias, inclusive language, and creating equitable environments.',
    shortDescription: 'Build an inclusive workplace culture',
    category: 'Compliance',
    difficulty: 'beginner',
    duration: 90, // 1h 30m
    lessonCount: 5,
    rating: 4.3,
    enrollmentCount: 4321,
    instructor: 'Michael Brown',
    skills: ['Unconscious Bias', 'Inclusive Communication', 'Cultural Competence'],
    isRequired: true,
    isFree: true,
  },
  {
    id: 'course-9',
    title: 'Machine Learning Fundamentals',
    description:
      'Introduction to machine learning concepts and algorithms. Learn supervised and unsupervised learning with practical examples.',
    shortDescription: 'Introduction to machine learning concepts and algorithms',
    category: 'Technology',
    difficulty: 'expert',
    duration: 720, // 12h
    lessonCount: 24,
    rating: 4.9,
    enrollmentCount: 876,
    instructor: 'Dr. Emily Zhang',
    skills: ['Machine Learning', 'Python', 'Supervised Learning', 'Neural Networks'],
    isFree: false,
    price: 149,
  },
];

// Extract unique categories from courses
const CATEGORIES = [...new Set(MOCK_COURSES.map((c) => c.category))].sort();

/**
 * Course Catalog page - Browse and discover courses with self-enrollment
 *
 * Features:
 * - Search by title, description, or skills
 * - Filter by category, difficulty, and duration
 * - Grid and list view modes
 * - Self-enrollment with confirmation modal
 * - Real-time enrollment status updates
 */
export default function CatalogPage(): React.ReactElement {
  const { user: firebaseUser } = useSafeAuth();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Enrollment state
  const [selectedCourse, setSelectedCourse] = useState<CatalogCourse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  // Filter courses based on all criteria
  const filteredCourses = useMemo(() => {
    return MOCK_COURSES.filter((course) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.instructor.toLowerCase().includes(searchLower) ||
        course.skills?.some((skill) => skill.toLowerCase().includes(searchLower));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;

      // Difficulty filter
      const matchesDifficulty =
        selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;

      // Duration filter
      const matchesDuration = filterByDuration(course.duration, selectedDuration);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesDuration;
    }).map((course) => ({
      ...course,
      isEnrolled: enrolledCourseIds.has(course.id),
    }));
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedDuration, enrolledCourseIds]);

  // Handle opening enrollment modal
  const handleEnrollClick = useCallback((courseId: string) => {
    const course = MOCK_COURSES.find((c) => c.id === courseId);
    if (course) {
      setSelectedCourse({
        ...course,
        isEnrolled: false,
      });
      setIsModalOpen(true);
    }
  }, []);

  // Handle successful enrollment
  const handleEnrollmentSuccess = useCallback((courseId: string, status: string) => {
    setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
    setEnrollingCourseId(null);

    // If enrollment is immediately active, optionally redirect to my learning
    if (status === 'enrolled') {
      // Close modal after a short delay to show success message
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedCourse(null);
      }, 2000);
    }
  }, []);

  // Handle enrollment error
  const handleEnrollmentError = useCallback(() => {
    setEnrollingCourseId(null);
    // Error is displayed in the modal, so we don't need to do anything else here
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Course Catalog</h1>
        <p className="text-muted-foreground mt-1">
          Discover courses to expand your skills and advance your career
        </p>
      </div>

      {/* Filters */}
      <CatalogFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        selectedDuration={selectedDuration}
        onDurationChange={setSelectedDuration}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        categories={CATEGORIES}
      />

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredCourses.length} of {MOCK_COURSES.length} courses
      </p>

      {/* Course grid/list */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CatalogCourseCard
              key={course.id}
              course={course}
              variant="grid"
              onEnroll={handleEnrollClick}
              isEnrolling={enrollingCourseId === course.id}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CatalogCourseCard
              key={course.id}
              course={course}
              variant="list"
              onEnroll={handleEnrollClick}
              isEnrolling={enrollingCourseId === course.id}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-medium text-foreground">No courses found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters to find what you&apos;re looking for
          </p>
        </div>
      )}

      {/* Enrollment modal */}
      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        course={selectedCourse}
        userId={firebaseUser?.uid || ''}
        onEnrollmentSuccess={handleEnrollmentSuccess}
        onEnrollmentError={handleEnrollmentError}
      />
    </div>
  );
}
