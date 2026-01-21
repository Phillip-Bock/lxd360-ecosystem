/**
 * Progress and enrollment type definitions
 */

export type EnrollmentStatus =
  | 'enrolled'
  | 'in-progress'
  | 'completed'
  | 'dropped'
  | 'expired'
  | 'waitlisted';

export type EnrollmentSource =
  | 'self'
  | 'assigned'
  | 'manager'
  | 'admin'
  | 'automation'
  | 'compliance'
  | 'purchase'
  | 'subscription';

export interface Enrollment {
  id: string;
  learnerId: string;
  courseId: string;
  status: EnrollmentStatus;
  source: EnrollmentSource;
  assignedBy?: string;
  assignedAt?: string;
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  dueDate?: string;
  // Progress
  progress: number; // 0-100
  lessonsCompleted: number;
  lessonsTotal: number;
  quizzesCompleted: number;
  quizzesTotal: number;
  timeSpent: number; // minutes
  lastAccessedAt?: string;
  // Scores
  averageQuizScore?: number;
  finalScore?: number;
  // Certificate
  certificateId?: string;
  certificateIssuedAt?: string;
  // Compliance
  isRequired: boolean;
  complianceDeadline?: string;
  gracePeriodEnd?: string;
  // xAPI
  registration: string; // UUID for xAPI tracking
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  learnerId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number; // 0-100
  timeSpent: number; // seconds
  startedAt?: string;
  completedAt?: string;
  lastPosition?: number; // video timestamp or page number
  // Attempts
  attempts: number;
  // Scores (for interactive content)
  score?: number;
  maxScore?: number;
  // SCORM data
  scormStatus?: string;
  scormScore?: number;
  scormData?: Record<string, unknown>;
  // xAPI
  xapiStatements: number;
}

export interface ModuleProgress {
  moduleId: string;
  enrollmentId: string;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  progress: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  timeSpent: number;
  startedAt?: string;
  completedAt?: string;
}

export interface CourseProgress {
  enrollmentId: string;
  courseId: string;
  learnerId: string;
  overallProgress: number;
  moduleProgress: ModuleProgress[];
  lessonProgress: LessonProgress[];
  quizAttempts: QuizProgressSummary[];
  timeSpent: number;
  sessionsCount: number;
  averageSessionLength: number;
  lastActivityAt?: string;
  estimatedCompletionDate?: string;
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  // XP
  xpEarned: number;
  xpPossible: number;
}

export interface QuizProgressSummary {
  quizId: string;
  quizTitle: string;
  attempts: number;
  bestScore: number;
  latestScore: number;
  averageScore: number;
  passed: boolean;
  passedAt?: string;
  totalTimeSpent: number;
}

export interface LearningStreak {
  learnerId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakHistory: StreakDay[];
  freezesAvailable: number;
  freezesUsed: number;
}

export interface StreakDay {
  date: string;
  activityCount: number;
  minutesLearned: number;
  coursesWorkedOn: string[];
  xpEarned: number;
}

export interface LearningSession {
  id: string;
  learnerId: string;
  courseId: string;
  lessonId?: string;
  startedAt: string;
  endedAt?: string;
  duration: number; // seconds
  activeTime: number; // actual engagement time
  idleTime: number;
  interactions: number;
  // Context
  device: 'desktop' | 'tablet' | 'mobile';
  browser?: string;
  os?: string;
}

export interface LearningGoal {
  id: string;
  learnerId: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  metric: 'minutes' | 'courses' | 'lessons' | 'xp' | 'skills';
  target: number;
  current: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'achieved' | 'missed' | 'expired';
  streak: number;
  notifyOnCompletion: boolean;
}

export interface SavedCourse {
  id: string;
  learnerId: string;
  courseId: string;
  savedAt: string;
  notes?: string;
  reminder?: string;
}

export interface RecentlyViewed {
  id: string;
  learnerId: string;
  resourceType: 'course' | 'lesson' | 'path' | 'skill';
  resourceId: string;
  viewedAt: string;
  duration: number;
}

export interface Transcript {
  learnerId: string;
  entries: TranscriptEntry[];
  totalCredits: number;
  totalCEUs: number;
  totalHours: number;
  certifications: CertificationRecord[];
}

export interface TranscriptEntry {
  id: string;
  courseId: string;
  courseTitle: string;
  category: string;
  completedAt: string;
  score?: number;
  credits?: number;
  ceuCredits?: number;
  hours: number;
  certificateId?: string;
  expiresAt?: string;
  instructor?: string;
  verificationCode?: string;
}

export interface CertificationRecord {
  id: string;
  certificationName: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt?: string;
  credentialId: string;
  verificationUrl?: string;
  status: 'active' | 'expired' | 'revoked';
}
