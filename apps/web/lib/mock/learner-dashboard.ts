/**
 * Mock data for learner dashboard development
 * TODO(LXD-337): Replace with Firestore queries
 */

import type { ActivityItem } from '@/components/lms/learner/RecentActivity';
import type {
  CompletedCourseRecord,
  LearnerBadge,
  LearnerCourse,
  LearnerDeadline,
  LearnerProgressSummary,
  RecommendedCourse,
} from '@/types/lms/learner-dashboard';

/**
 * Mock progress summary
 */
export const mockProgressSummary: LearnerProgressSummary = {
  totalAssigned: 8,
  inProgress: 3,
  completed: 4,
  overallProgress: 62,
  totalTimeSpent: 1240, // ~20 hours
  currentStreak: 7,
  totalXp: 4250,
  level: 5,
};

/**
 * Mock in-progress courses
 */
export const mockInProgressCourses: LearnerCourse[] = [
  {
    id: 'course-leadership-101',
    title: 'Advanced Leadership Skills',
    description:
      'Develop essential leadership competencies for modern organizations. Learn to inspire teams and drive results.',
    thumbnailUrl: '/images/courses/leadership.jpg',
    progress: 65,
    status: 'in_progress',
    dueDate: new Date('2026-02-15'),
    estimatedMinutes: 270,
    totalLessons: 12,
    completedLessons: 8,
    lastAccessedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRequired: true,
    category: 'Leadership',
    xpReward: 500,
  },
  {
    id: 'course-safety-fundamentals',
    title: 'Workplace Safety Fundamentals',
    description:
      'Essential safety protocols and compliance training for all employees. OSHA-compliant curriculum.',
    thumbnailUrl: '/images/courses/safety.jpg',
    progress: 30,
    status: 'in_progress',
    dueDate: new Date('2026-01-30'),
    estimatedMinutes: 135,
    totalLessons: 8,
    completedLessons: 2,
    lastAccessedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRequired: true,
    category: 'Compliance',
    xpReward: 350,
  },
  {
    id: 'course-data-analytics',
    title: 'Data Analytics Essentials',
    description:
      'Learn to analyze and visualize data for business insights. Master key tools and methodologies.',
    thumbnailUrl: '/images/courses/analytics.jpg',
    progress: 45,
    status: 'in_progress',
    estimatedMinutes: 360,
    totalLessons: 15,
    completedLessons: 7,
    lastAccessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isRequired: false,
    category: 'Technical Skills',
    xpReward: 600,
  },
];

/**
 * Mock assigned courses (not started)
 */
export const mockAssignedCourses: LearnerCourse[] = [
  {
    id: 'course-cybersecurity-101',
    title: 'Cybersecurity Awareness Training',
    description:
      'Protect yourself and the organization from cyber threats. Learn about phishing, password security, and more.',
    thumbnailUrl: '/images/courses/cybersecurity.jpg',
    progress: 0,
    status: 'not_started',
    dueDate: new Date('2026-02-28'),
    estimatedMinutes: 90,
    totalLessons: 6,
    completedLessons: 0,
    isRequired: true,
    category: 'Compliance',
    xpReward: 250,
  },
  {
    id: 'course-dei-fundamentals',
    title: 'Diversity, Equity & Inclusion',
    description:
      'Build an inclusive workplace culture. Understand unconscious bias and inclusive leadership practices.',
    thumbnailUrl: '/images/courses/dei.jpg',
    progress: 0,
    status: 'not_started',
    dueDate: new Date('2026-03-15'),
    estimatedMinutes: 120,
    totalLessons: 8,
    completedLessons: 0,
    isRequired: true,
    category: 'Culture',
    xpReward: 300,
  },
  {
    id: 'course-project-management',
    title: 'Project Management Fundamentals',
    description:
      'Master the basics of project management including planning, execution, and delivery.',
    thumbnailUrl: '/images/courses/project-mgmt.jpg',
    progress: 0,
    status: 'not_started',
    dueDate: new Date('2026-04-01'),
    estimatedMinutes: 240,
    totalLessons: 10,
    completedLessons: 0,
    isRequired: false,
    category: 'Professional Skills',
    xpReward: 450,
  },
  {
    id: 'course-communication-skills',
    title: 'Effective Communication',
    description: 'Enhance your written and verbal communication skills for professional success.',
    progress: 0,
    status: 'not_started',
    estimatedMinutes: 180,
    totalLessons: 9,
    completedLessons: 0,
    isRequired: false,
    category: 'Soft Skills',
    xpReward: 400,
  },
];

/**
 * Mock AI-recommended courses
 */
export const mockRecommendedCourses: RecommendedCourse[] = [
  {
    id: 'course-strategic-thinking',
    title: 'Strategic Thinking for Leaders',
    description:
      'Develop strategic mindset and decision-making skills to drive organizational success.',
    thumbnailUrl: '/images/courses/strategy.jpg',
    progress: 0,
    status: 'not_started',
    estimatedMinutes: 210,
    totalLessons: 8,
    completedLessons: 0,
    isRequired: false,
    category: 'Leadership',
    xpReward: 500,
    recommendationReason: 'Based on your progress in Advanced Leadership Skills',
    confidenceScore: 0.92,
    targetSkills: ['Strategic Planning', 'Decision Making', 'Vision Setting'],
  },
  {
    id: 'course-data-visualization',
    title: 'Data Visualization Mastery',
    description: 'Create compelling visualizations that tell stories with data using modern tools.',
    thumbnailUrl: '/images/courses/data-viz.jpg',
    progress: 0,
    status: 'not_started',
    estimatedMinutes: 180,
    totalLessons: 7,
    completedLessons: 0,
    isRequired: false,
    category: 'Technical Skills',
    xpReward: 400,
    recommendationReason: 'Complements your Data Analytics course',
    confidenceScore: 0.88,
    targetSkills: ['Data Visualization', 'Storytelling', 'Tableau'],
  },
  {
    id: 'course-emotional-intelligence',
    title: 'Emotional Intelligence at Work',
    description:
      'Develop self-awareness and empathy to build stronger relationships and lead effectively.',
    thumbnailUrl: '/images/courses/eq.jpg',
    progress: 0,
    status: 'not_started',
    estimatedMinutes: 150,
    totalLessons: 6,
    completedLessons: 0,
    isRequired: false,
    category: 'Leadership',
    xpReward: 350,
    recommendationReason: 'Popular among leaders in your department',
    confidenceScore: 0.85,
    targetSkills: ['Emotional Intelligence', 'Self-Awareness', 'Empathy'],
  },
];

/**
 * Mock completed courses
 */
export const mockCompletedCourses: CompletedCourseRecord[] = [
  {
    id: 'course-onboarding',
    title: 'New Employee Onboarding',
    description: 'Welcome to the team! Complete your onboarding to get started.',
    thumbnailUrl: '/images/courses/onboarding.jpg',
    progress: 100,
    status: 'completed',
    completedAt: new Date('2025-11-15'),
    estimatedMinutes: 60,
    totalLessons: 5,
    completedLessons: 5,
    isRequired: true,
    category: 'Onboarding',
    xpReward: 200,
    finalScore: 100,
    certificateId: 'cert-onboarding-001',
    badgesEarned: ['first-course', 'perfect-score'],
    xpEarned: 250,
    timeSpent: 55,
  },
  {
    id: 'course-harassment-prevention',
    title: 'Harassment Prevention Training',
    description: 'Annual compliance training on preventing workplace harassment.',
    thumbnailUrl: '/images/courses/compliance.jpg',
    progress: 100,
    status: 'completed',
    completedAt: new Date('2025-12-10'),
    estimatedMinutes: 45,
    totalLessons: 4,
    completedLessons: 4,
    isRequired: true,
    category: 'Compliance',
    xpReward: 150,
    finalScore: 95,
    certificateId: 'cert-harassment-001',
    badgesEarned: ['compliance-champion'],
    xpEarned: 180,
    timeSpent: 42,
  },
  {
    id: 'course-time-management',
    title: 'Time Management Mastery',
    description: 'Learn proven techniques to maximize productivity and manage your time.',
    thumbnailUrl: '/images/courses/time.jpg',
    progress: 100,
    status: 'completed',
    completedAt: new Date('2026-01-05'),
    estimatedMinutes: 90,
    totalLessons: 6,
    completedLessons: 6,
    isRequired: false,
    category: 'Professional Skills',
    xpReward: 300,
    finalScore: 88,
    badgesEarned: ['productivity-pro'],
    xpEarned: 320,
    timeSpent: 85,
  },
];

/**
 * Mock achievement badges
 */
export const mockBadges: LearnerBadge[] = [
  {
    id: 'badge-first-course',
    name: 'First Steps',
    description: 'Completed your first course. Welcome to the learning journey!',
    icon: 'star',
    rarity: 'common',
    earnedAt: new Date('2025-11-15'),
    courseId: 'course-onboarding',
    xpReward: 50,
  },
  {
    id: 'badge-perfect-score',
    name: 'Perfect Score',
    description: 'Achieved 100% on a course assessment. Outstanding work!',
    icon: 'trophy',
    rarity: 'rare',
    earnedAt: new Date('2025-11-15'),
    courseId: 'course-onboarding',
    xpReward: 100,
  },
  {
    id: 'badge-compliance-champion',
    name: 'Compliance Champion',
    description: 'Completed all required compliance training ahead of schedule.',
    icon: 'shield',
    rarity: 'rare',
    earnedAt: new Date('2025-12-10'),
    courseId: 'course-harassment-prevention',
    xpReward: 150,
  },
  {
    id: 'badge-week-streak',
    name: 'Week Warrior',
    description: 'Maintained a 7-day learning streak. Keep up the momentum!',
    icon: 'flame',
    rarity: 'common',
    earnedAt: new Date('2026-01-10'),
    xpReward: 75,
  },
  {
    id: 'badge-productivity-pro',
    name: 'Productivity Pro',
    description: 'Mastered time management skills for maximum effectiveness.',
    icon: 'zap',
    rarity: 'epic',
    earnedAt: new Date('2026-01-05'),
    courseId: 'course-time-management',
    xpReward: 200,
  },
  {
    id: 'badge-knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Completed 5 courses. Your dedication to learning is inspiring!',
    icon: 'book-open',
    rarity: 'rare',
    earnedAt: new Date('2026-01-20'),
    xpReward: 150,
  },
  {
    id: 'badge-early-bird',
    name: 'Early Bird',
    description: 'Completed a course before its due date. Great planning!',
    icon: 'target',
    rarity: 'common',
    earnedAt: new Date('2026-01-05'),
    courseId: 'course-time-management',
    xpReward: 50,
  },
  {
    id: 'badge-leadership-legend',
    name: 'Leadership Legend',
    description: 'Demonstrated exceptional leadership competency across multiple courses.',
    icon: 'crown',
    rarity: 'legendary',
    earnedAt: new Date('2026-01-25'),
    xpReward: 500,
  },
];

/**
 * Mock upcoming deadlines (derived from assigned and in-progress courses)
 */
export const mockDeadlines: LearnerDeadline[] = [
  {
    courseId: 'course-safety-fundamentals',
    courseTitle: 'Workplace Safety Fundamentals',
    dueDate: new Date('2026-01-30'),
    progress: 30,
    isRequired: true,
  },
  {
    courseId: 'course-leadership-101',
    courseTitle: 'Advanced Leadership Skills',
    dueDate: new Date('2026-02-15'),
    progress: 65,
    isRequired: true,
  },
  {
    courseId: 'course-cybersecurity-101',
    courseTitle: 'Cybersecurity Awareness Training',
    dueDate: new Date('2026-02-28'),
    progress: 0,
    isRequired: true,
  },
  {
    courseId: 'course-dei-fundamentals',
    courseTitle: 'Diversity, Equity & Inclusion',
    dueDate: new Date('2026-03-15'),
    progress: 0,
    isRequired: true,
  },
  {
    courseId: 'course-project-management',
    courseTitle: 'Project Management Fundamentals',
    dueDate: new Date('2026-04-01'),
    progress: 0,
    isRequired: false,
  },
];

/**
 * Mock recent activities
 */
export const mockActivities: ActivityItem[] = [
  {
    id: 'activity-1',
    type: 'lesson_completed',
    title: 'Completed "Safety Protocols" lesson',
    courseId: 'course-safety-fundamentals',
    courseTitle: 'Workplace Safety Fundamentals',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'activity-2',
    type: 'badge_earned',
    title: 'Earned "Week Warrior" badge',
    badgeId: 'badge-week-streak',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    xpEarned: 75,
  },
  {
    id: 'activity-3',
    type: 'course_started',
    title: 'Started Data Analytics Essentials',
    courseId: 'course-data-analytics',
    courseTitle: 'Data Analytics Essentials',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: 'activity-4',
    type: 'skill_improved',
    title: 'Leadership skill improved to Level 3',
    skillName: 'Leadership',
    skillLevel: 3,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: 'activity-5',
    type: 'course_completed',
    title: 'Completed Time Management Mastery',
    courseId: 'course-time-management',
    courseTitle: 'Time Management Mastery',
    timestamp: new Date('2026-01-05'),
    xpEarned: 320,
  },
];
