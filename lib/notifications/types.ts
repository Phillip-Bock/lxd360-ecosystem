// ============================================================================
// NOTIFICATION CHANNELS
// ============================================================================

/**
 * Available notification delivery channels
 */
export const NotificationChannels = {
  EMAIL: 'email',
  IN_APP: 'in_app',
  PUSH: 'push',
  SMS: 'sms',
} as const;

export type NotificationChannel = (typeof NotificationChannels)[keyof typeof NotificationChannels];

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

/**
 * All available notification types
 */
export const NotificationTypes = {
  // System
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  SYSTEM_MAINTENANCE: 'system_maintenance',

  // Account
  ACCOUNT_WELCOME: 'account_welcome',
  ACCOUNT_PASSWORD_CHANGED: 'account_password_changed',
  ACCOUNT_EMAIL_VERIFIED: 'account_email_verified',
  ACCOUNT_SECURITY_ALERT: 'account_security_alert',

  // INSPIRE Studio
  PROJECT_INVITE: 'project_invite',
  PROJECT_UPDATE: 'project_update',
  REVIEW_REQUEST: 'review_request',
  REVIEW_COMPLETED: 'review_completed',
  COMMENT_ADDED: 'comment_added',
  MENTION: 'mention',

  // LXP360 LMS
  COURSE_ENROLLED: 'course_enrolled',
  COURSE_COMPLETED: 'course_completed',
  LESSON_AVAILABLE: 'lesson_available',
  ASSESSMENT_DUE: 'assessment_due',
  ASSESSMENT_RESULT: 'assessment_result',
  CERTIFICATE_EARNED: 'certificate_earned',
  PROGRESS_MILESTONE: 'progress_milestone',

  // LXD Nexus
  CONNECTION_REQUEST: 'connection_request',
  CONNECTION_ACCEPTED: 'connection_accepted',
  NEW_MESSAGE: 'new_message',
  SESSION_REMINDER: 'session_reminder',
  SESSION_SCHEDULED: 'session_scheduled',
  SESSION_CANCELED: 'session_canceled',

  // Consultation
  CONSULTATION_REQUEST_RECEIVED: 'consultation_request_received',
  CONSULTATION_PROPOSAL_READY: 'consultation_proposal_ready',
  CONSULTATION_SCHEDULED: 'consultation_scheduled',
  CONSULTATION_REMINDER: 'consultation_reminder',

  // Ecommerce
  ORDER_PLACED: 'order_placed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  REFUND_PROCESSED: 'refund_processed',
} as const;

export type NotificationType = (typeof NotificationTypes)[keyof typeof NotificationTypes];

// ============================================================================
// NOTIFICATION PRIORITY
// ============================================================================

/**
 * Notification priority levels
 */
export const NotificationPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type NotificationPriorityType =
  (typeof NotificationPriority)[keyof typeof NotificationPriority];

// ============================================================================
// NOTIFICATION STATUS
// ============================================================================

/**
 * Notification delivery/read status
 */
export const NotificationStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
  DISMISSED: 'dismissed',
} as const;

export type NotificationStatusType = (typeof NotificationStatus)[keyof typeof NotificationStatus];

// ============================================================================
// NOTIFICATION INTERFACES
// ============================================================================

/**
 * Notification payload for creating a notification
 */
export interface NotificationPayload {
  /** User ID to notify */
  userId: string;
  /** Type of notification */
  type: NotificationType;
  /** Notification title */
  title: string;
  /** Notification body/message */
  body: string;
  /** Priority level */
  priority?: NotificationPriorityType;
  /** Channels to deliver through */
  channels?: NotificationChannel[];
  /** Additional data/metadata */
  data?: Record<string, unknown>;
  /** URL to link to when clicked */
  actionUrl?: string;
  /** Action button text */
  actionText?: string;
  /** Category for grouping */
  category?: string;
  /** Optional image URL */
  imageUrl?: string;
  /** Schedule for later delivery */
  scheduledAt?: Date;
  /** Expiration time */
  expiresAt?: Date;
  /** Group key for notification grouping */
  groupKey?: string;
}

/**
 * Stored notification record
 */
export interface Notification {
  /** Unique identifier */
  id: string;
  /** User ID */
  userId: string;
  /** Notification type */
  type: NotificationType;
  /** Title */
  title: string;
  /** Body text */
  body: string;
  /** Priority */
  priority: NotificationPriorityType;
  /** Delivery channels */
  channels: NotificationChannel[];
  /** Current status */
  status: NotificationStatusType;
  /** Additional data */
  data?: Record<string, unknown>;
  /** Action URL */
  actionUrl?: string;
  /** Action text */
  actionText?: string;
  /** Category */
  category?: string;
  /** Image URL */
  imageUrl?: string;
  /** Group key */
  groupKey?: string;
  /** When it was read */
  readAt?: Date;
  /** When it expires */
  expiresAt?: Date;
  /** When it was created */
  createdAt: Date;
  /** When it was last updated */
  updatedAt: Date;
}

/**
 * Notification with delivery details
 */
export interface NotificationWithDelivery extends Notification {
  /** Delivery attempts per channel */
  deliveryStatus: Record<NotificationChannel, DeliveryStatus>;
}

/**
 * Delivery status for a channel
 */
export interface DeliveryStatus {
  /** Channel name */
  channel: NotificationChannel;
  /** Status */
  status: NotificationStatusType;
  /** Delivery timestamp */
  deliveredAt?: Date;
  /** Error if failed */
  error?: string;
  /** Number of attempts */
  attempts: number;
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  /** User ID */
  userId: string;
  /** Global enabled flag */
  enabled: boolean;
  /** Email notifications enabled */
  emailEnabled: boolean;
  /** Push notifications enabled */
  pushEnabled: boolean;
  /** SMS notifications enabled */
  smsEnabled: boolean;
  /** In-app notifications enabled */
  inAppEnabled: boolean;
  /** Quiet hours start (HH:mm) */
  quietHoursStart?: string;
  /** Quiet hours end (HH:mm) */
  quietHoursEnd?: string;
  /** Timezone for quiet hours */
  timezone?: string;
  /** Per-type preferences */
  typePreferences: TypePreferences;
  /** Email digest frequency */
  emailDigest: EmailDigestFrequencyType;
  /** Last updated */
  updatedAt: Date;
}

/**
 * Per-notification-type preferences
 */
export type TypePreferences = Partial<Record<NotificationType, TypePreference>>;

/**
 * Preference for a specific notification type
 */
export interface TypePreference {
  /** Is this type enabled */
  enabled: boolean;
  /** Channels to use for this type */
  channels: NotificationChannel[];
}

/**
 * Email digest frequency options
 */
export const EmailDigestFrequency = {
  INSTANT: 'instant',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  NEVER: 'never',
} as const;

export type EmailDigestFrequencyType =
  (typeof EmailDigestFrequency)[keyof typeof EmailDigestFrequency];

// ============================================================================
// DEFAULT PREFERENCES
// ============================================================================

/**
 * Default notification preferences
 */
export const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'userId'> = {
  enabled: true,
  emailEnabled: true,
  pushEnabled: true,
  smsEnabled: false,
  inAppEnabled: true,
  emailDigest: 'instant',
  typePreferences: {},
  updatedAt: new Date(),
};

/**
 * Default channel configuration per notification type
 */
export const DEFAULT_TYPE_CHANNELS: Record<NotificationType, NotificationChannel[]> = {
  // System - all channels for important announcements
  system_announcement: ['in_app', 'email'],
  system_maintenance: ['in_app', 'email'],

  // Account - email for security-related
  account_welcome: ['email', 'in_app'],
  account_password_changed: ['email', 'in_app'],
  account_email_verified: ['email'],
  account_security_alert: ['email', 'in_app', 'push'],

  // INSPIRE Studio
  project_invite: ['email', 'in_app'],
  project_update: ['in_app'],
  review_request: ['email', 'in_app'],
  review_completed: ['in_app'],
  comment_added: ['in_app'],
  mention: ['email', 'in_app'],

  // LMS
  course_enrolled: ['email', 'in_app'],
  course_completed: ['email', 'in_app'],
  lesson_available: ['in_app'],
  assessment_due: ['email', 'in_app', 'push'],
  assessment_result: ['email', 'in_app'],
  certificate_earned: ['email', 'in_app'],
  progress_milestone: ['in_app'],

  // Nexus
  connection_request: ['email', 'in_app'],
  connection_accepted: ['in_app'],
  new_message: ['email', 'in_app', 'push'],
  session_reminder: ['email', 'in_app', 'push'],
  session_scheduled: ['email', 'in_app'],
  session_canceled: ['email', 'in_app', 'push'],

  // Consultation
  consultation_request_received: ['email', 'in_app'],
  consultation_proposal_ready: ['email', 'in_app'],
  consultation_scheduled: ['email', 'in_app'],
  consultation_reminder: ['email', 'in_app', 'push'],

  // Ecommerce
  order_placed: ['email', 'in_app'],
  order_shipped: ['email', 'in_app'],
  order_delivered: ['email', 'in_app'],
  payment_received: ['email'],
  payment_failed: ['email', 'in_app', 'push'],
  subscription_renewed: ['email'],
  subscription_expiring: ['email', 'in_app'],
  subscription_canceled: ['email', 'in_app'],
  refund_processed: ['email', 'in_app'],
};

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

/**
 * Template for generating notification content
 */
export interface NotificationTemplate {
  /** Notification type */
  type: NotificationType;
  /** Title template (supports variables) */
  titleTemplate: string;
  /** Body template (supports variables) */
  bodyTemplate: string;
  /** Default priority */
  defaultPriority: NotificationPriorityType;
  /** Default channels */
  defaultChannels: NotificationChannel[];
  /** Category */
  category: string;
  /** Associated email template (if unknown) */
  emailTemplate?: string;
}

/**
 * Notification template registry
 */
export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  // System
  system_announcement: {
    type: 'system_announcement',
    titleTemplate: '{title}',
    bodyTemplate: '{message}',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'email'],
    category: 'system',
  },
  system_maintenance: {
    type: 'system_maintenance',
    titleTemplate: 'Scheduled Maintenance',
    bodyTemplate: 'Maintenance scheduled for {date}. {message}',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'email'],
    category: 'system',
  },

  // Account
  account_welcome: {
    type: 'account_welcome',
    titleTemplate: 'Welcome to LXD360!',
    bodyTemplate: 'Welcome, {firstName}! Your account has been created successfully.',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'account',
    emailTemplate: 'welcome',
  },
  account_password_changed: {
    type: 'account_password_changed',
    titleTemplate: 'Password Changed',
    bodyTemplate:
      "Your password was changed successfully. If you didn't make this change, please contact support.",
    defaultPriority: 'high',
    defaultChannels: ['email', 'in_app'],
    category: 'account',
  },
  account_email_verified: {
    type: 'account_email_verified',
    titleTemplate: 'Email Verified',
    bodyTemplate: 'Your email address has been verified successfully.',
    defaultPriority: 'normal',
    defaultChannels: ['email'],
    category: 'account',
  },
  account_security_alert: {
    type: 'account_security_alert',
    titleTemplate: 'Security Alert',
    bodyTemplate: '{message}',
    defaultPriority: 'urgent',
    defaultChannels: ['email', 'in_app', 'push'],
    category: 'account',
  },

  // INSPIRE
  project_invite: {
    type: 'project_invite',
    titleTemplate: 'Project Invitation',
    bodyTemplate: '{inviterName} invited you to collaborate on {projectName}',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'inspire',
    emailTemplate: 'project_invite',
  },
  project_update: {
    type: 'project_update',
    titleTemplate: 'Project Update',
    bodyTemplate: '{projectName} has been updated: {updateDescription}',
    defaultPriority: 'low',
    defaultChannels: ['in_app'],
    category: 'inspire',
  },
  review_request: {
    type: 'review_request',
    titleTemplate: 'Review Requested',
    bodyTemplate: '{requesterName} requested your review on {projectName}',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'inspire',
    emailTemplate: 'review_request',
  },
  review_completed: {
    type: 'review_completed',
    titleTemplate: 'Review Completed',
    bodyTemplate: '{reviewerName} completed their review on {projectName}',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    category: 'inspire',
  },
  comment_added: {
    type: 'comment_added',
    titleTemplate: 'New Comment',
    bodyTemplate: '{commenterName} commented on {itemName}',
    defaultPriority: 'low',
    defaultChannels: ['in_app'],
    category: 'inspire',
  },
  mention: {
    type: 'mention',
    titleTemplate: 'You were mentioned',
    bodyTemplate: '{mentionerName} mentioned you in {context}',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'inspire',
  },

  // LMS
  course_enrolled: {
    type: 'course_enrolled',
    titleTemplate: 'Course Enrollment Confirmed',
    bodyTemplate: "You've been enrolled in {courseName}",
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'lms',
    emailTemplate: 'course_enrolled',
  },
  course_completed: {
    type: 'course_completed',
    titleTemplate: 'Course Completed!',
    bodyTemplate: "Congratulations! You've completed {courseName}",
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'lms',
  },
  lesson_available: {
    type: 'lesson_available',
    titleTemplate: 'New Lesson Available',
    bodyTemplate: 'A new lesson is available in {courseName}: {lessonName}',
    defaultPriority: 'low',
    defaultChannels: ['in_app'],
    category: 'lms',
  },
  assessment_due: {
    type: 'assessment_due',
    titleTemplate: 'Assessment Due Soon',
    bodyTemplate: '{assessmentName} is due on {dueDate}',
    defaultPriority: 'high',
    defaultChannels: ['email', 'in_app', 'push'],
    category: 'lms',
  },
  assessment_result: {
    type: 'assessment_result',
    titleTemplate: 'Assessment Results Available',
    bodyTemplate: 'Your results for {assessmentName} are ready',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'lms',
    emailTemplate: 'assessment_complete',
  },
  certificate_earned: {
    type: 'certificate_earned',
    titleTemplate: 'Certificate Earned!',
    bodyTemplate: "You've earned a certificate for completing {courseName}",
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'lms',
    emailTemplate: 'certificate_earned',
  },
  progress_milestone: {
    type: 'progress_milestone',
    titleTemplate: 'Progress Milestone',
    bodyTemplate: "You've reached {milestone}% completion in {courseName}!",
    defaultPriority: 'low',
    defaultChannels: ['in_app'],
    category: 'lms',
  },

  // Nexus
  connection_request: {
    type: 'connection_request',
    titleTemplate: 'New Connection Request',
    bodyTemplate: '{requesterName} wants to connect with you',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'nexus',
    emailTemplate: 'nexus_connection_request',
  },
  connection_accepted: {
    type: 'connection_accepted',
    titleTemplate: 'Connection Accepted',
    bodyTemplate: '{partnerName} accepted your connection request',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    category: 'nexus',
    emailTemplate: 'nexus_connection_accepted',
  },
  new_message: {
    type: 'new_message',
    titleTemplate: 'New Message',
    bodyTemplate: '{senderName}: {preview}',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app', 'push'],
    category: 'nexus',
    emailTemplate: 'nexus_new_message',
  },
  session_reminder: {
    type: 'session_reminder',
    titleTemplate: 'Session Reminder',
    bodyTemplate: 'Your session with {partnerName} starts in {timeUntil}',
    defaultPriority: 'high',
    defaultChannels: ['email', 'in_app', 'push'],
    category: 'nexus',
    emailTemplate: 'nexus_session_reminder',
  },
  session_scheduled: {
    type: 'session_scheduled',
    titleTemplate: 'Session Scheduled',
    bodyTemplate: 'Session with {partnerName} scheduled for {date}',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'nexus',
  },
  session_canceled: {
    type: 'session_canceled',
    titleTemplate: 'Session Canceled',
    bodyTemplate: 'Your session with {partnerName} on {date} has been canceled',
    defaultPriority: 'high',
    defaultChannels: ['email', 'in_app', 'push'],
    category: 'nexus',
  },

  // Consultation
  consultation_request_received: {
    type: 'consultation_request_received',
    titleTemplate: 'Consultation Request Received',
    bodyTemplate: "We've received your request for {serviceName}",
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'consultation',
    emailTemplate: 'consultation_received',
  },
  consultation_proposal_ready: {
    type: 'consultation_proposal_ready',
    titleTemplate: 'Proposal Ready',
    bodyTemplate: 'Your consultation proposal for {serviceName} is ready',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'consultation',
    emailTemplate: 'consultation_proposal',
  },
  consultation_scheduled: {
    type: 'consultation_scheduled',
    titleTemplate: 'Consultation Scheduled',
    bodyTemplate: 'Your consultation with {consultantName} is scheduled for {date}',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'consultation',
    emailTemplate: 'consultation_scheduled',
  },
  consultation_reminder: {
    type: 'consultation_reminder',
    titleTemplate: 'Consultation Reminder',
    bodyTemplate: 'Your consultation is starting in {timeUntil}',
    defaultPriority: 'high',
    defaultChannels: ['email', 'in_app', 'push'],
    category: 'consultation',
  },

  // Ecommerce
  order_placed: {
    type: 'order_placed',
    titleTemplate: 'Order Confirmed',
    bodyTemplate: 'Order #{orderId} has been placed successfully',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'ecommerce',
    emailTemplate: 'order_confirmation',
  },
  order_shipped: {
    type: 'order_shipped',
    titleTemplate: 'Order Shipped',
    bodyTemplate: 'Order #{orderId} has been shipped',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'ecommerce',
  },
  order_delivered: {
    type: 'order_delivered',
    titleTemplate: 'Order Delivered',
    bodyTemplate: 'Order #{orderId} has been delivered',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'ecommerce',
  },
  payment_received: {
    type: 'payment_received',
    titleTemplate: 'Payment Received',
    bodyTemplate: "We've received your payment of {amount}",
    defaultPriority: 'normal',
    defaultChannels: ['email'],
    category: 'ecommerce',
  },
  payment_failed: {
    type: 'payment_failed',
    titleTemplate: 'Payment Failed',
    bodyTemplate: 'Your payment of {amount} could not be processed',
    defaultPriority: 'urgent',
    defaultChannels: ['email', 'in_app', 'push'],
    category: 'ecommerce',
    emailTemplate: 'payment_failed',
  },
  subscription_renewed: {
    type: 'subscription_renewed',
    titleTemplate: 'Subscription Renewed',
    bodyTemplate: 'Your {planName} subscription has been renewed',
    defaultPriority: 'normal',
    defaultChannels: ['email'],
    category: 'ecommerce',
    emailTemplate: 'subscription_renewed',
  },
  subscription_expiring: {
    type: 'subscription_expiring',
    titleTemplate: 'Subscription Expiring',
    bodyTemplate: 'Your {planName} subscription expires on {date}',
    defaultPriority: 'high',
    defaultChannels: ['email', 'in_app'],
    category: 'ecommerce',
    emailTemplate: 'subscription_expiring',
  },
  subscription_canceled: {
    type: 'subscription_canceled',
    titleTemplate: 'Subscription Canceled',
    bodyTemplate: 'Your {planName} subscription has been canceled',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'ecommerce',
    emailTemplate: 'subscription_canceled',
  },
  refund_processed: {
    type: 'refund_processed',
    titleTemplate: 'Refund Processed',
    bodyTemplate: 'Your refund of {amount} has been processed',
    defaultPriority: 'normal',
    defaultChannels: ['email', 'in_app'],
    category: 'ecommerce',
  },
};

// ============================================================================
// QUERY TYPES
// ============================================================================

/**
 * Notification query filters
 */
export interface NotificationQuery {
  /** User ID */
  userId: string;
  /** Filter by status */
  status?: NotificationStatusType | NotificationStatusType[];
  /** Filter by type */
  type?: NotificationType | NotificationType[];
  /** Filter by category */
  category?: string;
  /** Filter by read state */
  unreadOnly?: boolean;
  /** Pagination limit */
  limit?: number;
  /** Pagination offset */
  offset?: number;
  /** Order by field */
  orderBy?: 'createdAt' | 'priority';
  /** Order direction */
  orderDirection?: 'asc' | 'desc';
}

/**
 * Notification count by status
 */
export interface NotificationCounts {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
  byType: Partial<Record<NotificationType, number>>;
}

// ============================================================================
// DATABASE ROW TYPES
// ============================================================================

/**
 * Database row type for notifications table
 */
export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  priority: string;
  channels: string[];
  status: string;
  data: Record<string, unknown> | null;
  action_url: string | null;
  action_text: string | null;
  category: string | null;
  image_url: string | null;
  group_key: string | null;
  read_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database row type for notification_preferences table
 */
export interface NotificationPreferencesRow {
  user_id: string;
  enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string | null;
  type_preferences: TypePreferences | null;
  email_digest: string;
  updated_at: string;
}

/**
 * Database row type for notification_delivery_log table
 */
export interface NotificationDeliveryLogRow {
  id: string;
  notification_id: string;
  channel: string;
  status: string;
  delivered_at: string | null;
  error: string | null;
  created_at: string;
}

/**
 * Database row type for push_subscriptions table
 */
export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  keys: Record<string, string>;
  created_at: string;
}
