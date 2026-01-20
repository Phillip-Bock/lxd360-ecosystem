/**
 * JSON-compatible type for Firestore documents
 */
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ============================================================================
// ENUMS
// ============================================================================

export type NexusProfileType = 'mentor' | 'mentee';

export type ConnectionStatus = 'pending' | 'active' | 'paused' | 'completed' | 'declined';

export type SessionStatus = 'scheduled' | 'completed' | 'canceled' | 'no_show';

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'abandoned';

export type SkillVerificationStatus =
  | 'self_assessed'
  | 'peer_verified'
  | 'mentor_verified'
  | 'certified';

export type ResourceType =
  | 'document'
  | 'video'
  | 'link'
  | 'template'
  | 'code_snippet'
  | 'presentation';

export type EventType =
  | 'webinar'
  | 'workshop'
  | 'office_hours'
  | 'cohort_session'
  | 'ama'
  | 'networking';

export type ForumCategory =
  | 'general'
  | 'engineering'
  | 'design'
  | 'leadership'
  | 'career'
  | 'announcements'
  | 'introductions'
  | 'resources';

export type InsightType = 'recommendation' | 'reminder' | 'achievement' | 'alert' | 'tip';

// ============================================================================
// CORE USER TYPES
// ============================================================================

export interface NexusUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  job_title: string | null;
  timezone: string;
  bio: string | null;
}

export interface NexusProfile {
  id: string;
  user_id: string;
  profile_type: NexusProfileType;
  bio: string;
  expertise_areas: string[];
  goals: string[];
  availability: AvailabilitySchedule;
  is_verified: boolean;
  is_active: boolean;
  video_intro_url: string | null;
  timezone: string;
  languages: string[];
  mentoring_style: string | null;
  session_rate_cents: number;
  rating_average: number | null;
  rating_count: number;
  total_sessions: number;
  response_time_hours: number | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  company: string | null;
  job_title: string | null;
  years_experience: number | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: NexusUser;
  skills?: UserSkill[];
  gamification?: Gamification;
}

export interface AvailabilitySchedule {
  timezone: string;
  slots: AvailabilitySlot[];
  blocked_dates?: string[];
}

export interface AvailabilitySlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string; // HH:MM format
  end_time: string;
}

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export interface Gamification {
  id: string;
  user_id: string;
  karma_points: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_sessions_completed: number;
  total_hours_mentored: number;
  total_hours_learned: number;
  badges: Badge[];
  achievements: Achievement[];
  level: number;
  experience_points: number;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  progress: number;
  target: number;
  is_completed: boolean;
  completed_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  karma_points: number;
  level: number;
  badges_count: number;
  profile_type: NexusProfileType;
}

// ============================================================================
// SKILLS TYPES
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
  parent_skill_id: string | null;
  icon: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  level: number; // 1-10
  experience_points: number;
  verification_status: SkillVerificationStatus;
  verified_by: string | null;
  verified_at: string | null;
  endorsement_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  skill?: Skill;
}

export interface SkillTreeNode {
  id: string;
  label: string;
  status: 'locked' | 'in-progress' | 'completed';
  level: number;
  x: number;
  y: number;
  connections: string[]; // IDs of connected nodes
}

// ============================================================================
// CONNECTION TYPES
// ============================================================================

export interface NexusConnection {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: ConnectionStatus;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  // Joined data
  mentor?: NexusProfile;
  mentee?: NexusProfile;
  last_message?: NexusMessage;
  upcoming_session?: NexusSession;
  unread_count?: number;
}

export interface MatchSuggestion {
  mentor: NexusProfile;
  match_score: number;
  matching_skills: string[];
  matching_goals: string[];
  availability_overlap: number; // percentage
  reasons: string[];
}

// ============================================================================
// MESSAGING TYPES
// ============================================================================

export interface NexusMessage {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // Joined data
  sender?: NexusUser;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
}

export interface ConversationThread {
  connection: NexusConnection;
  messages: NexusMessage[];
  unread_count: number;
  last_activity: string;
  other_user: NexusUser;
}

// ============================================================================
// SESSION TYPES
// ============================================================================

export interface NexusSession {
  id: string;
  connection_id: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  notes: string | null;
  status: SessionStatus;
  created_at: string;
  // Joined data
  connection?: NexusConnection;
  agenda?: SessionAgendaItem[];
  feedback?: SessionFeedback[];
  recording?: SessionRecording;
}

export interface SessionAgendaItem {
  id: string;
  session_id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  is_completed: boolean;
  order_index: number;
  ai_suggested: boolean;
  created_at: string;
}

export interface SessionRecording {
  id: string;
  session_id: string;
  recording_url: string | null;
  transcript: string | null;
  highlights: SessionHighlight[];
  duration_seconds: number | null;
  is_public: boolean;
  created_at: string;
}

export interface SessionHighlight {
  timestamp_seconds: number;
  content: string;
  type: 'key_insight' | 'action_item' | 'question' | 'decision';
}

export interface SessionFeedback {
  id: string;
  session_id: string;
  reviewer_id: string;
  rating: number; // 1-5
  feedback_text: string | null;
  was_helpful: boolean | null;
  topics_covered: string[];
  skills_practiced: string[];
  created_at: string;
}

export interface SessionAnalytics {
  talk_to_listen_ratio: number;
  topics_discussed: string[];
  sentiment_score: number;
  key_insights: string[];
  action_items: string[];
  follow_up_recommendations: string[];
}

// ============================================================================
// GOALS TYPES
// ============================================================================

export interface NexusGoal {
  id: string;
  user_id: string;
  connection_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  status: GoalStatus;
  target_date: string | null;
  progress_percent: number;
  success_criteria: string[];
  action_items: GoalActionItem[];
  reflection: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  // Joined data
  milestones?: GoalMilestone[];
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  order_index: number;
  created_at: string;
}

export interface GoalActionItem {
  id: string;
  title: string;
  is_completed: boolean;
  due_date?: string;
  assigned_to?: string;
}

// ============================================================================
// LEARNING TYPES
// ============================================================================

export interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number | null;
  thumbnail_url: string | null;
  skills_covered: string[];
  prerequisites: string[];
  outcomes: string[];
  is_featured: boolean;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  modules?: LearningPathModule[];
  user_progress?: UserLearningProgress;
  enrollment_count?: number;
}

export interface LearningPathModule {
  id: string;
  learning_path_id: string;
  title: string;
  description: string | null;
  content_type: 'video' | 'article' | 'exercise' | 'quiz' | 'project';
  content_url: string | null;
  content_data: Json;
  duration_minutes: number | null;
  order_index: number;
  is_required: boolean;
  created_at: string;
  // Joined data
  user_progress?: UserLearningProgress;
}

export interface UserLearningProgress {
  id: string;
  user_id: string;
  learning_path_id: string;
  module_id: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
  time_spent_minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FORUM TYPES
// ============================================================================

export interface Forum {
  id: string;
  name: string;
  description: string | null;
  category: ForumCategory;
  icon: string | null;
  color: string;
  is_private: boolean;
  is_active: boolean;
  post_count: number;
  last_post_at: string | null;
  created_at: string;
}

export interface ForumPost {
  id: string;
  forum_id: string;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  author?: NexusUser;
  forum?: Forum;
  comments?: ForumComment[];
  has_liked?: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  content: string;
  like_count: number;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: NexusUser;
  replies?: ForumComment[];
  has_liked?: boolean;
}

// ============================================================================
// RESOURCE TYPES
// ============================================================================

export interface NexusResource {
  id: string;
  connection_id: string | null;
  uploaded_by: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  file_url: string | null;
  external_url: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  tags: string[];
  is_public: boolean;
  download_count: number;
  created_at: string;
  // Joined data
  uploader?: NexusUser;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface NexusEvent {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  start_time: string;
  end_time: string;
  meeting_url: string | null;
  max_attendees: number | null;
  is_public: boolean;
  is_recorded: boolean;
  recording_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  host?: NexusUser;
  registrations_count?: number;
  is_registered?: boolean;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  attended: boolean;
  feedback: string | null;
  rating: number | null;
  registered_at: string;
}

// ============================================================================
// AI INSIGHTS TYPES
// ============================================================================

export interface AIInsight {
  id: string;
  user_id: string;
  insight_type: InsightType;
  title: string;
  content: string;
  action_url: string | null;
  action_label: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  priority: number;
  expires_at: string | null;
  metadata: Json;
  created_at: string;
}

export interface AICoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  action_buttons?: AIActionButton[];
}

export interface AIActionButton {
  label: string;
  action: string;
  data?: Json;
}

// ============================================================================
// TALENT GRAPH TYPES (ADMIN)
// ============================================================================

export interface TalentMetric {
  skill: string;
  supply_level: number; // percentage of users with this skill
  demand_level: number; // based on goals mentees are setting
  gap: number;
}

export interface HighPotentialUser {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  job_title: string | null;
  learning_velocity: number; // modules completed per week
  karma_points: number;
  streak: number;
  skills_acquired: number;
  top_skills: string[];
  promotion_readiness: 'ready' | 'developing' | 'early';
}

export interface PlatformAnalytics {
  total_users: number;
  active_mentors: number;
  active_mentees: number;
  total_connections: number;
  active_connections: number;
  total_sessions: number;
  sessions_this_month: number;
  average_session_rating: number;
  total_learning_hours: number;
  top_skills: { skill: string; count: number }[];
  engagement_trend: { date: string; active_users: number }[];
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NexusNotification {
  id: string;
  user_id: string;
  type: 'message' | 'session' | 'connection' | 'goal' | 'achievement' | 'event' | 'system';
  title: string;
  body: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
  metadata: Json;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateProfileFormData {
  profile_type: NexusProfileType;
  bio: string;
  expertise_areas: string[];
  goals: string[];
  availability: AvailabilitySchedule;
  video_intro_url?: string;
  languages: string[];
  mentoring_style?: string;
  session_rate_cents?: number;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  company?: string;
  job_title?: string;
  years_experience?: number;
}

export interface CreateGoalFormData {
  title: string;
  description?: string;
  category?: string;
  target_date?: string;
  success_criteria: string[];
  connection_id?: string;
}

export interface CreateSessionFormData {
  connection_id: string;
  scheduled_at: string;
  duration_minutes: number;
  notes?: string;
}

export interface CreatePostFormData {
  forum_id: string;
  title: string;
  content: string;
  tags: string[];
}

export interface ScheduleEventFormData {
  title: string;
  description?: string;
  event_type: EventType;
  start_time: string;
  end_time: string;
  meeting_url?: string;
  max_attendees?: number;
  is_public: boolean;
  tags: string[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface MentorSearchFilters {
  expertise_areas?: string[];
  languages?: string[];
  availability_day?: string;
  min_rating?: number;
  max_rate?: number;
  is_verified?: boolean;
  timezone?: string;
}

export interface SessionCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: SessionStatus;
  connection_id: string;
  other_user: {
    name: string;
    avatar_url: string | null;
  };
}

// ============================================================================
// WHITEBOARD TYPES
// ============================================================================

export interface WhiteboardElement {
  id: string;
  type: 'path' | 'text' | 'shape' | 'image';
  data: Json;
  color: string;
  strokeWidth: number;
  position: { x: number; y: number };
  created_by: string;
  created_at: number;
}

export interface WhiteboardState {
  elements: WhiteboardElement[];
  version: number;
}

// ============================================================================
// CODE EDITOR TYPES
// ============================================================================

export interface CodeEditorFile {
  id: string;
  name: string;
  language: string;
  content: string;
  is_active: boolean;
}

export interface CodeEditorState {
  files: CodeEditorFile[];
  active_file_id: string | null;
  cursor_positions: { [user_id: string]: { line: number; column: number } };
}
