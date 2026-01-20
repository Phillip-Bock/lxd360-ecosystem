/**
 * Learner and user type definitions
 */

export type UserRole = 'learner' | 'instructor' | 'manager' | 'admin' | 'super-admin';

export type LearnerStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface Learner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  status: LearnerStatus;
  // Profile
  title?: string;
  department?: string;
  location?: string;
  timezone: string;
  locale: string;
  bio?: string;
  // Organization
  organizationId: string;
  managerId?: string;
  teamIds: string[];
  groupIds: string[];
  // Learning
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  longestStreak: number;
  totalCourses: number;
  completedCourses: number;
  totalTimeSpent: number; // minutes
  badges: string[];
  skills: LearnerSkill[];
  // Preferences
  preferences: LearnerPreferences;
  accessibilitySettings: AccessibilitySettings;
  notificationSettings: NotificationSettings;
  // Dates
  joinedAt: string;
  lastActiveAt: string;
  lastLoginAt: string;
  // Compliance
  complianceStatus: 'compliant' | 'at-risk' | 'non-compliant';
  requiredTrainingCount: number;
  overdueTrainingCount: number;
}

export interface LearnerSkill {
  skillId: string;
  skillName: string;
  category: string;
  level: number; // 1-100
  endorsements: number;
  lastAssessedAt?: string;
  courses: string[];
}

export interface LearnerPreferences {
  // Learning
  preferredLanguage: string;
  contentLanguages: string[];
  difficultyPreference: 'easy' | 'moderate' | 'challenging' | 'adaptive';
  learningPace: 'relaxed' | 'standard' | 'intensive';
  preferredContentTypes: string[];
  dailyGoalMinutes: number;
  weeklyGoalCourses: number;
  // Email
  emailDigest: 'daily' | 'weekly' | 'monthly' | 'never';
  // Display
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  showProgress: boolean;
  showLeaderboard: boolean;
  // Privacy
  profileVisibility: 'public' | 'organization' | 'private';
  showActivity: boolean;
  showBadges: boolean;
}

export interface AccessibilitySettings {
  // Visual
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  letterSpacing: 'normal' | 'wide' | 'wider';
  fontFamily: 'default' | 'dyslexic' | 'monospace';
  highContrast: boolean;
  reducedMotion: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  // Audio
  autoPlayCaptions: boolean;
  preferredCaptionLanguage: string;
  screenReaderOptimized: boolean;
  audioDescriptions: boolean;
  // Focus
  focusMode: boolean;
  hideDecorations: boolean;
  showReadingGuide: boolean;
  // Cognitive
  extendedTime: boolean;
  timeExtensionPercent: number;
  breakReminders: boolean;
  breakIntervalMinutes: number;
  simplifiedInterface: boolean;
  chunkContent: boolean;
  // Motor
  keyboardNavigation: boolean;
  stickyKeys: boolean;
  largeClickTargets: boolean;
}

export interface NotificationSettings {
  // Email
  emailNewCourse: boolean;
  emailAssignments: boolean;
  emailDeadlines: boolean;
  emailCompletions: boolean;
  emailBadges: boolean;
  emailDiscussions: boolean;
  emailMentions: boolean;
  emailDigest: boolean;
  // Push
  pushEnabled: boolean;
  pushAssignments: boolean;
  pushDeadlines: boolean;
  pushCompletions: boolean;
  pushBadges: boolean;
  pushDiscussions: boolean;
  pushMentions: boolean;
  // In-App
  inAppEnabled: boolean;
  soundEnabled: boolean;
}

export interface LearnerGroup {
  id: string;
  name: string;
  description?: string;
  type: 'department' | 'team' | 'cohort' | 'role' | 'location' | 'custom';
  parentId?: string;
  members: string[];
  memberCount: number;
  managers: string[];
  courseAssignments: string[];
  pathAssignments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Manager {
  id: string;
  user: Learner;
  teamMembers: string[];
  teamMemberCount: number;
  directReports: Learner[];
  // Team stats
  teamCompletionRate: number;
  teamComplianceRate: number;
  teamAverageScore: number;
  teamTotalHours: number;
  // Permissions
  canAssignCourses: boolean;
  canViewReports: boolean;
  canApproveEnrollments: boolean;
  canViewTranscripts: boolean;
}

export interface InstructorProfile extends Learner {
  // Teaching
  coursesCreated: number;
  coursesPublished: number;
  totalStudents: number;
  totalReviews: number;
  averageRating: number;
  expertise: string[];
  // Bio
  fullBio?: string;
  credentials: string[];
  certifications: string[];
  experience: InstructorExperience[];
  // Social
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    youtube?: string;
  };
  // Revenue (if e-commerce)
  totalRevenue?: number;
  payoutBalance?: number;
}

export interface InstructorExperience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface AdminUser extends Learner {
  permissions: string[];
  managedOrganizations?: string[];
  auditLog: AuditLogEntry[];
  lastPasswordChange: string;
  mfaEnabled: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}
