/**
 * Social learning and community type definitions
 */

export type DiscussionStatus = 'open' | 'closed' | 'locked' | 'archived';
export type ContentModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  parentId?: string;
  // Stats
  topicCount: number;
  postCount: number;
  lastActivity?: string;
  // Access
  isPublic: boolean;
  allowedRoles?: string[];
  allowedGroups?: string[];
  // Moderation
  requireApproval: boolean;
  moderators: string[];
}

export interface Discussion {
  id: string;
  categoryId?: string;
  courseId?: string;
  lessonId?: string;
  groupId?: string;
  // Content
  title: string;
  body: string;
  bodyHtml: string;
  attachments: Attachment[];
  // Author
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: string;
  // Status
  status: DiscussionStatus;
  moderationStatus: ContentModerationStatus;
  isPinned: boolean;
  isAnnouncement: boolean;
  isFeatured: boolean;
  // Engagement
  views: number;
  replyCount: number;
  upvotes: number;
  downvotes: number;
  score: number;
  // Q&A specific
  isQuestion: boolean;
  isAnswered: boolean;
  acceptedAnswerId?: string;
  // Tags
  tags: string[];
  // Dates
  createdAt: string;
  updatedAt: string;
  lastReplyAt?: string;
  lockedAt?: string;
  // Participants
  participants: string[];
  participantCount: number;
  // Subscription
  subscriberCount: number;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  parentReplyId?: string; // for nested replies
  // Content
  body: string;
  bodyHtml: string;
  attachments: Attachment[];
  // Author
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: string;
  isInstructor: boolean;
  // Status
  moderationStatus: ContentModerationStatus;
  isAcceptedAnswer: boolean;
  isEdited: boolean;
  // Engagement
  upvotes: number;
  downvotes: number;
  score: number;
  // Nested replies
  replies?: DiscussionReply[];
  replyCount: number;
  // Dates
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
}

export interface LearningGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail?: string;
  coverImage?: string;
  // Type
  type: 'cohort' | 'study-group' | 'team' | 'community' | 'interest';
  category?: string;
  // Privacy
  privacy: 'public' | 'private' | 'hidden';
  joinApproval: 'open' | 'request' | 'invite-only';
  // Membership
  memberCount: number;
  maxMembers?: number;
  members: GroupMember[];
  pendingRequests: number;
  // Leadership
  ownerId: string;
  admins: string[];
  moderators: string[];
  // Content
  courses: string[];
  discussions: Discussion[];
  resources: GroupResource[];
  events: GroupEvent[];
  // Activity
  activityScore: number;
  lastActivityAt?: string;
  // Settings
  allowPosts: boolean;
  allowEvents: boolean;
  allowResources: boolean;
  // Dates
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface GroupMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt: string;
  lastActiveAt?: string;
  contributionScore: number;
}

export interface GroupResource {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  type: 'link' | 'file' | 'document' | 'video';
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  downloads: number;
}

export interface GroupEvent {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  type: 'meeting' | 'webinar' | 'study-session' | 'social';
  startTime: string;
  endTime: string;
  timezone: string;
  location?: string;
  meetingUrl?: string;
  maxAttendees?: number;
  attendees: string[];
  attendeeCount: number;
  createdBy: string;
  createdAt: string;
}

export interface ExpertProfile {
  id: string;
  userId: string;
  user: {
    name: string;
    avatar?: string;
    title?: string;
    department?: string;
  };
  // Expertise
  skills: string[];
  topics: string[];
  certifications: string[];
  bio: string;
  // Availability
  isAvailable: boolean;
  availability: {
    hoursPerWeek: number;
    preferredTimes?: string[];
    timezone: string;
  };
  // Mentorship
  acceptingMentees: boolean;
  maxMentees: number;
  currentMentees: number;
  mentorshipAreas: string[];
  mentorshipStyle?: string;
  // Stats
  rating: number;
  reviewCount: number;
  sessionsCompleted: number;
  questionsAnswered: number;
  helpfulVotes: number;
  // Contact
  allowDirectMessage: boolean;
  calendlyUrl?: string;
  linkedIn?: string;
  // Dates
  createdAt: string;
  lastActiveAt?: string;
}

export interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  // Details
  goals: string;
  topics: string[];
  preferredFrequency: 'weekly' | 'bi-weekly' | 'monthly';
  estimatedDuration: number; // months
  // Status
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  // Messages
  message?: string;
  response?: string;
  // Dates
  requestedAt: string;
  respondedAt?: string;
  startedAt?: string;
  endedAt?: string;
}

export interface MentorshipSession {
  id: string;
  requestId: string;
  mentorId: string;
  menteeId: string;
  // Details
  scheduledAt: string;
  duration: number; // minutes
  topic?: string;
  notes?: string;
  meetingUrl?: string;
  // Status
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  // Feedback
  mentorFeedback?: string;
  menteeFeedback?: string;
  rating?: number;
  // Dates
  completedAt?: string;
}

export interface CommunityQuestion {
  id: string;
  title: string;
  body: string;
  bodyHtml: string;
  // Author
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  // Categorization
  tags: string[];
  skillIds: string[];
  courseId?: string;
  // Status
  status: 'open' | 'answered' | 'closed';
  acceptedAnswerId?: string;
  // Engagement
  views: number;
  upvotes: number;
  downvotes: number;
  score: number;
  answerCount: number;
  // Bounty
  bountyPoints?: number;
  bountyExpiresAt?: string;
  // Dates
  createdAt: string;
  updatedAt: string;
  answeredAt?: string;
  closedAt?: string;
  closeReason?: string;
}

export interface CommunityAnswer {
  id: string;
  questionId: string;
  // Content
  body: string;
  bodyHtml: string;
  // Author
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isExpert: boolean;
  // Status
  isAccepted: boolean;
  // Engagement
  upvotes: number;
  downvotes: number;
  score: number;
  // Dates
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
}

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  // Content
  action: string;
  objectType: string;
  objectId: string;
  objectTitle: string;
  objectUrl?: string;
  // Context
  courseId?: string;
  groupId?: string;
  // Metadata
  metadata?: Record<string, unknown>;
  // Dates
  createdAt: string;
}

export type ActivityType =
  | 'course_completed'
  | 'badge_earned'
  | 'certificate_earned'
  | 'level_up'
  | 'streak_milestone'
  | 'skill_gained'
  | 'discussion_created'
  | 'question_asked'
  | 'answer_posted'
  | 'group_joined'
  | 'course_enrolled'
  | 'course_started'
  | 'milestone_reached';

export interface SocialNotification {
  id: string;
  userId: string;
  type: SocialNotificationType;
  title: string;
  body: string;
  // Source
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  // Link
  linkType?: string;
  linkId?: string;
  linkUrl?: string;
  // Status
  isRead: boolean;
  readAt?: string;
  // Dates
  createdAt: string;
}

export type SocialNotificationType =
  | 'reply'
  | 'mention'
  | 'upvote'
  | 'answer_accepted'
  | 'follow'
  | 'group_invite'
  | 'group_request'
  | 'mentorship_request'
  | 'session_scheduled'
  | 'endorsement';
