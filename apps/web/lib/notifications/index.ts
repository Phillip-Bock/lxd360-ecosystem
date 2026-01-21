// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  DeliveryStatus,
  EmailDigestFrequencyType,
  Notification,
  // Channel and type
  NotificationChannel,
  NotificationCounts,
  // Notification
  NotificationPayload,
  // Preferences
  NotificationPreferences,
  NotificationPriorityType,
  // Queries
  NotificationQuery,
  NotificationStatusType,
  // Templates
  NotificationTemplate,
  NotificationType,
  NotificationWithDelivery,
  TypePreference,
  TypePreferences,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  // Defaults
  DEFAULT_PREFERENCES,
  DEFAULT_TYPE_CHANNELS,
  EmailDigestFrequency,
  // Templates
  NOTIFICATION_TEMPLATES,
  // Enums
  NotificationChannels,
  NotificationPriority,
  NotificationStatus,
  NotificationTypes,
} from './types';

// ============================================================================
// SERVICE
// ============================================================================

export {
  cleanupOldNotifications,
  createBatchNotifications,
  // Core
  createNotification,
  dismissNotification,
  getNotificationCounts,
  // Queries
  getNotifications,
  // Preferences
  getUserPreferences,
  markAllAsRead,
  // Actions
  markAsRead,
  // Service object
  notificationService,
  notify,
  updateUserPreferences,
} from './service';
