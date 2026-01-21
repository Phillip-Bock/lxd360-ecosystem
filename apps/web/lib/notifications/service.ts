import { logger } from '@/lib/logger';
import type {
  EmailDigestFrequencyType,
  Notification,
  NotificationChannel,
  NotificationCounts,
  NotificationPayload,
  NotificationPreferences,
  NotificationPreferencesRow,
  NotificationPriorityType,
  NotificationQuery,
  NotificationRow,
  NotificationStatusType,
  NotificationType,
  PushSubscriptionRow,
  TypePreferences,
} from './types';
import { DEFAULT_PREFERENCES, DEFAULT_TYPE_CHANNELS, NOTIFICATION_TEMPLATES } from './types';

// ============================================================================
// DATABASE HELPERS
// ============================================================================

/**
 * Get Firestore client
 *
 * This function returns a stub that maintains backward compatibility.
 * Notifications will be implemented with Firestore when needed.
 */
async function getFirestoreClient(): Promise<FirestoreStub> {
  // Return a stub that maintains the interface but does nothing
  // This allows the codebase to compile while the notification service
  // is being migrated to Firestore
  return createFirestoreStub();
}

/**
 * Firestore stub interface for backward compatibility
 */
interface FirestoreStub {
  from: (table: string) => {
    select: (columns?: string) => FirestoreStubQuery;
    insert: (data: Record<string, unknown>) => FirestoreStubQuery;
    update: (data: Record<string, unknown>) => FirestoreStubQuery;
    upsert: (data: Record<string, unknown>) => FirestoreStubQuery;
    delete: () => FirestoreStubQuery;
  };
}

interface FirestoreStubQuery
  extends Promise<{ data: unknown[]; error: Error | null; count?: number | null }> {
  select: (columns?: string, options?: { count?: 'exact'; head?: boolean }) => FirestoreStubQuery;
  eq: (column: string, value: unknown) => FirestoreStubQuery;
  in: (column: string, values: unknown[]) => FirestoreStubQuery;
  is: (column: string, value: null) => FirestoreStubQuery;
  lt: (column: string, value: unknown) => FirestoreStubQuery;
  order: (column: string, options?: { ascending?: boolean }) => FirestoreStubQuery;
  limit: (count: number) => FirestoreStubQuery;
  range: (from: number, to: number) => FirestoreStubQuery;
  single: () => Promise<{ data: Record<string, unknown> | null; error: Error | null }>;
}

function createFirestoreStubQuery(): FirestoreStubQuery {
  const stubResult = { data: [] as unknown[], error: null, count: 0 };
  const promise = Promise.resolve(stubResult);

  const query = Object.assign(promise, {
    select: () => query,
    eq: () => query,
    in: () => query,
    is: () => query,
    lt: () => query,
    order: () => query,
    limit: () => query,
    range: () => query,
    single: async () => ({
      data: null,
      error: new Error('Notification service not implemented - pending GCP migration'),
    }),
  }) as FirestoreStubQuery;

  return query;
}

function createFirestoreStub(): FirestoreStub {
  return {
    from: () => ({
      select: () => createFirestoreStubQuery(),
      insert: () => createFirestoreStubQuery(),
      update: () => createFirestoreStubQuery(),
      upsert: () => createFirestoreStubQuery(),
      delete: () => createFirestoreStubQuery(),
    }),
  };
}

/**
 * Type for untyped table operations
 * Used for tables not yet in the Firestore schema types
 */
interface DatabaseClient {
  from: (table: string) => {
    select: (
      columns?: string,
      options?: { count?: 'exact'; head?: boolean },
    ) => UntypedQueryBuilder;
    insert: (data: Record<string, unknown>) => UntypedQueryBuilder;
    update: (data: Record<string, unknown>) => UntypedQueryBuilder;
    upsert: (data: Record<string, unknown>) => UntypedQueryBuilder;
    delete: () => UntypedQueryBuilder;
  };
}

interface UntypedQueryBuilder {
  select: (columns?: string, options?: { count?: 'exact'; head?: boolean }) => UntypedQueryBuilder;
  eq: (column: string, value: unknown) => UntypedQueryBuilder;
  in: (column: string, values: unknown[]) => UntypedQueryBuilder;
  is: (column: string, value: null) => UntypedQueryBuilder;
  lt: (column: string, value: unknown) => UntypedQueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => UntypedQueryBuilder;
  limit: (count: number) => UntypedQueryBuilder;
  range: (from: number, to: number) => UntypedQueryBuilder;
  single: () => Promise<{ data: Record<string, unknown> | null; error: Error | null }>;
  then: (
    callback: (result: { data: unknown[]; error: Error | null; count?: number | null }) => void,
  ) => Promise<void>;
}

/**
 * Get untyped database client for tables not in schema
 */
function asUntyped(client: Awaited<ReturnType<typeof getFirestoreClient>>): DatabaseClient {
  return client as unknown as DatabaseClient;
}

// ============================================================================
// TEMPLATE RENDERING
// ============================================================================

/**
 * Render template string with variables
 */
function renderTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
}

// ============================================================================
// CORE NOTIFICATION SERVICE
// ============================================================================

/**
 * Create a notification
 */
export async function createNotification(
  payload: NotificationPayload,
): Promise<Notification | null> {
  try {
    const db = await getFirestoreClient();

    // Get user preferences
    const preferences = await getUserPreferences(payload.userId);

    // Check if notifications are enabled for this user
    if (!preferences.enabled) {
      logger.debug(`Notifications disabled for user ${payload.userId}`);
      return null;
    }

    // Determine channels based on preferences
    const channels = resolveChannels(payload.type, payload.channels, preferences);

    // If no channels enabled, skip
    if (channels.length === 0) {
      logger.debug(`No channels enabled for type ${payload.type}, user ${payload.userId}`);
      return null;
    }

    // Get template for defaults
    const template = NOTIFICATION_TEMPLATES[payload.type];

    // Create notification record
    const notification: Omit<Notification, 'id'> = {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      priority: payload.priority || template?.defaultPriority || 'normal',
      channels,
      status: 'pending',
      data: payload.data,
      actionUrl: payload.actionUrl,
      actionText: payload.actionText,
      category: payload.category || template?.category,
      imageUrl: payload.imageUrl,
      groupKey: payload.groupKey,
      expiresAt: payload.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert into database (notifications table not in schema types yet)
    const { data: inserted, error } = await asUntyped(db)
      .from('notifications')
      .insert({
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        priority: notification.priority,
        channels: notification.channels,
        status: notification.status,
        data: notification.data as Record<string, unknown> | undefined,
        action_url: notification.actionUrl,
        action_text: notification.actionText,
        category: notification.category,
        image_url: notification.imageUrl,
        group_key: notification.groupKey,
        expires_at: notification.expiresAt?.toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create notification', error);
      return null;
    }

    if (!inserted || typeof inserted.id !== 'string') {
      logger.error('Failed to create notification: Invalid response');
      return null;
    }

    const createdNotification: Notification = {
      ...notification,
      id: inserted.id,
    };

    // Trigger delivery for each channel
    await deliverNotification(createdNotification, preferences);

    return createdNotification;
  } catch (error) {
    logger.error('Error creating notification', error);
    return null;
  }
}

/**
 * Create multiple notifications (batch)
 */
export async function createBatchNotifications(
  payloads: NotificationPayload[],
): Promise<{ created: number; failed: number }> {
  let created = 0;
  let failed = 0;

  // Process in parallel with concurrency limit
  const CONCURRENCY = 5;
  const chunks: NotificationPayload[][] = [];

  for (let i = 0; i < payloads.length; i += CONCURRENCY) {
    chunks.push(payloads.slice(i, i + CONCURRENCY));
  }

  for (const chunk of chunks) {
    const results = await Promise.all(chunk.map(createNotification));
    for (const result of results) {
      if (result) {
        created++;
      } else {
        failed++;
      }
    }
  }

  return { created, failed };
}

// ============================================================================
// DELIVERY
// ============================================================================

/**
 * Deliver notification through appropriate channels
 */
async function deliverNotification(
  notification: Notification,
  preferences: NotificationPreferences,
): Promise<void> {
  const deliveryPromises: Promise<void>[] = [];

  for (const channel of notification.channels) {
    // Check if in quiet hours
    if (isInQuietHours(preferences) && notification.priority !== 'urgent') {
      continue;
    }

    switch (channel) {
      case 'email':
        if (preferences.emailEnabled) {
          deliveryPromises.push(deliverViaEmail(notification));
        }
        break;

      case 'in_app':
        if (preferences.inAppEnabled) {
          deliveryPromises.push(deliverViaInApp(notification));
        }
        break;

      case 'push':
        if (preferences.pushEnabled) {
          deliveryPromises.push(deliverViaPush(notification));
        }
        break;

      case 'sms':
        if (preferences.smsEnabled) {
          deliveryPromises.push(deliverViaSms(notification));
        }
        break;
    }
  }

  // Execute deliveries in parallel
  await Promise.allSettled(deliveryPromises);
}

/**
 * Deliver via email
 */
async function deliverViaEmail(notification: Notification): Promise<void> {
  try {
    const template = NOTIFICATION_TEMPLATES[notification.type];

    // Get user email
    const db = await getFirestoreClient();
    const { data: user } = await db
      .from('profiles')
      .select('email, full_name')
      .eq('id', notification.userId)
      .single();

    if (!user?.email || typeof user.email !== 'string') {
      logger.warn(`No email for user ${notification.userId}`);
      return;
    }

    const userEmail: string = user.email;
    const fullName = typeof user.full_name === 'string' ? user.full_name : '';

    // Extract first name from full_name
    const firstName = fullName.split(' ')[0] || 'there';

    // Email: Brevo integration pending
    logger.info('Email notification stub', {
      to: userEmail,
      subject: notification.title,
      firstName,
      templateType: template?.emailTemplate,
    });

    await updateDeliveryStatus(notification.id, 'email', 'delivered');
  } catch (error) {
    logger.error('Email delivery failed', error);
    await updateDeliveryStatus(notification.id, 'email', 'failed');
  }
}

/**
 * Deliver via in-app notification
 */
async function deliverViaInApp(notification: Notification): Promise<void> {
  // In-app notifications are stored in the database
  // They're already created, just mark as delivered
  await updateDeliveryStatus(notification.id, 'in_app', 'delivered');
}

/**
 * Deliver via push notification
 */
async function deliverViaPush(notification: Notification): Promise<void> {
  try {
    // Get user's push subscription (push_subscriptions table not in schema types yet)
    const db = await getFirestoreClient();
    const { data: subscriptions } = (await asUntyped(db)
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', notification.userId)) as unknown as { data: PushSubscriptionRow[] | null };

    if (!subscriptions?.length) {
      logger.debug(`No push subscriptions for user ${notification.userId}`);
      return;
    }

    // TODO(LXD-408): Implement push notification delivery via FCM
    // For now, just log in development
    logger.debug('Would send push notification', {
      userId: notification.userId,
      title: notification.title,
      body: notification.body,
      subscriptions: subscriptions.length,
    });

    await updateDeliveryStatus(notification.id, 'push', 'delivered');
  } catch (error) {
    logger.error('Push delivery failed', error);
    await updateDeliveryStatus(notification.id, 'push', 'failed');
  }
}

/**
 * Deliver via SMS
 */
async function deliverViaSms(notification: Notification): Promise<void> {
  try {
    // Get user's phone number
    const db = await getFirestoreClient();
    const { data: user } = await db
      .from('profiles')
      .select('phone')
      .eq('id', notification.userId)
      .single();

    if (!user?.phone) {
      logger.debug(`No phone number for user ${notification.userId}`);
      return;
    }

    // TODO(LXD-408): Implement SMS delivery via Twilio
    // For now, just log in development
    logger.debug('Would send SMS', {
      phone: user.phone,
      body: notification.body,
    });

    await updateDeliveryStatus(notification.id, 'sms', 'delivered');
  } catch (error) {
    logger.error('SMS delivery failed', error);
    await updateDeliveryStatus(notification.id, 'sms', 'failed');
  }
}

/**
 * Update delivery status for a channel
 */
async function updateDeliveryStatus(
  notificationId: string,
  channel: NotificationChannel,
  status: NotificationStatusType,
): Promise<void> {
  try {
    const db = await getFirestoreClient();

    // Update the notification status if this is the primary channel
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status === 'delivered') {
      updateData.status = 'delivered';
    } else if (status === 'failed') {
      // Only mark as failed if all channels fail
      // For now, we're simplifying this
    }

    await asUntyped(db).from('notifications').update(updateData).eq('id', notificationId);

    // Log delivery status (notification_delivery_log table not in schema types yet)
    await asUntyped(db)
      .from('notification_delivery_log')
      .insert({
        notification_id: notificationId,
        channel,
        status,
        delivered_at: status === 'delivered' ? new Date().toISOString() : null,
      });
  } catch (error) {
    logger.error('Failed to update delivery status', error);
  }
}

// ============================================================================
// PREFERENCES
// ============================================================================

/**
 * Get user notification preferences
 */
export async function getUserPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    const db = await getFirestoreClient();

    // notification_preferences table not in schema types yet
    const result = await asUntyped(db)
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data, error } = result as unknown as {
      data: NotificationPreferencesRow | null;
      error: Error | null;
    };

    if (error || !data) {
      // Return defaults if no preferences found
      return {
        ...DEFAULT_PREFERENCES,
        userId,
        updatedAt: new Date(),
      };
    }

    const { EmailDigestFrequency } = await import('./types');

    // Validate email digest value
    const validDigestFrequencies = Object.values(EmailDigestFrequency);
    const emailDigest = validDigestFrequencies.includes(
      data.email_digest as EmailDigestFrequencyType,
    )
      ? (data.email_digest as EmailDigestFrequencyType)
      : EmailDigestFrequency.INSTANT;

    return {
      userId: data.user_id,
      enabled: data.enabled,
      emailEnabled: data.email_enabled,
      pushEnabled: data.push_enabled,
      smsEnabled: data.sms_enabled,
      inAppEnabled: data.in_app_enabled,
      quietHoursStart: data.quiet_hours_start ?? undefined,
      quietHoursEnd: data.quiet_hours_end ?? undefined,
      timezone: data.timezone ?? undefined,
      typePreferences: (data.type_preferences as TypePreferences) || {},
      emailDigest,
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    logger.error('Error getting preferences', error);
    return {
      ...DEFAULT_PREFERENCES,
      userId,
      updatedAt: new Date(),
    };
  }
}

/**
 * Update user notification preferences
 */
export async function updateUserPreferences(
  userId: string,
  updates: Partial<Omit<NotificationPreferences, 'userId' | 'updatedAt'>>,
): Promise<NotificationPreferences> {
  const db = await getFirestoreClient();

  const updateData: Record<string, unknown> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
  if (updates.emailEnabled !== undefined) updateData.email_enabled = updates.emailEnabled;
  if (updates.pushEnabled !== undefined) updateData.push_enabled = updates.pushEnabled;
  if (updates.smsEnabled !== undefined) updateData.sms_enabled = updates.smsEnabled;
  if (updates.inAppEnabled !== undefined) updateData.in_app_enabled = updates.inAppEnabled;
  if (updates.quietHoursStart !== undefined) updateData.quiet_hours_start = updates.quietHoursStart;
  if (updates.quietHoursEnd !== undefined) updateData.quiet_hours_end = updates.quietHoursEnd;
  if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
  if (updates.typePreferences !== undefined) updateData.type_preferences = updates.typePreferences;
  if (updates.emailDigest !== undefined) updateData.email_digest = updates.emailDigest;

  await asUntyped(db).from('notification_preferences').upsert(updateData);

  return getUserPreferences(userId);
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get notifications for a user
 */
export async function getNotifications(
  query: NotificationQuery,
): Promise<{ notifications: Notification[]; total: number }> {
  const db = await getFirestoreClient();

  // notifications table not in schema types yet
  let baseQuery = asUntyped(db)
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', query.userId);

  // Apply filters
  if (query.status) {
    if (Array.isArray(query.status)) {
      baseQuery = baseQuery.in('status', query.status);
    } else {
      baseQuery = baseQuery.eq('status', query.status);
    }
  }

  if (query.type) {
    if (Array.isArray(query.type)) {
      baseQuery = baseQuery.in('type', query.type);
    } else {
      baseQuery = baseQuery.eq('type', query.type);
    }
  }

  if (query.category) {
    baseQuery = baseQuery.eq('category', query.category);
  }

  if (query.unreadOnly) {
    baseQuery = baseQuery.is('read_at', null);
  }

  // Apply sorting
  const orderField = query.orderBy === 'priority' ? 'priority' : 'created_at';
  const orderDirection = query.orderDirection === 'asc';
  baseQuery = baseQuery.order(orderField, { ascending: orderDirection });

  // Apply pagination
  if (query.limit) {
    baseQuery = baseQuery.limit(query.limit);
  }
  if (query.offset) {
    baseQuery = baseQuery.range(query.offset, query.offset + (query.limit || 20) - 1);
  }

  const { data, error, count } = (await baseQuery) as unknown as {
    data: NotificationRow[] | null;
    error: Error | null;
    count: number | null;
  };

  if (error) {
    logger.error('Query error', error);
    return { notifications: [], total: 0 };
  }

  const notifications: Notification[] = (data || []).map((n: NotificationRow) => ({
    id: n.id,
    userId: n.user_id,
    type: n.type as NotificationType,
    title: n.title,
    body: n.body,
    priority: n.priority as NotificationPriorityType,
    channels: n.channels as NotificationChannel[],
    status: n.status as NotificationStatusType,
    data: n.data as Record<string, unknown> | undefined,
    actionUrl: n.action_url ?? undefined,
    actionText: n.action_text ?? undefined,
    category: n.category ?? undefined,
    imageUrl: n.image_url ?? undefined,
    groupKey: n.group_key ?? undefined,
    readAt: n.read_at ? new Date(n.read_at) : undefined,
    expiresAt: n.expires_at ? new Date(n.expires_at) : undefined,
    createdAt: new Date(n.created_at),
    updatedAt: new Date(n.updated_at),
  }));

  return { notifications, total: count || 0 };
}

/**
 * Get notification counts for a user
 */
export async function getNotificationCounts(userId: string): Promise<NotificationCounts> {
  const db = await getFirestoreClient();
  const dbClient = asUntyped(db);

  // Get total count (notifications table not in schema types yet)
  const { count: total } = (await dbClient
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)) as unknown as { count: number | null };

  // Get unread count
  const { count: unread } = (await dbClient
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null)) as unknown as { count: number | null };

  // Get counts by category
  const { data: categoryData } = (await dbClient
    .from('notifications')
    .select('category')
    .eq('user_id', userId)
    .is('read_at', null)) as unknown as { data: Array<{ category: string | null }> | null };

  const byCategory: Record<string, number> = {};
  for (const item of categoryData || []) {
    if (item.category) {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    }
  }

  return {
    total: total || 0,
    unread: unread || 0,
    byCategory,
    byType: {}, // TODO(LXD-408): Add type counts if needed
  };
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId: string): Promise<boolean> {
  const db = await getFirestoreClient();

  const { error } = (await asUntyped(db)
    .from('notifications')
    .update({
      status: 'read',
      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .eq('user_id', userId)) as unknown as { error: Error | null };

  return !error;
}

/**
 * Mark multiple notifications as read
 */
export async function markAllAsRead(
  userId: string,
  filters?: { type?: NotificationType; category?: string },
): Promise<number> {
  const db = await getFirestoreClient();

  let query = asUntyped(db)
    .from('notifications')
    .update({
      status: 'read',
      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .is('read_at', null);

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  const { count } = (await query.select('*', { count: 'exact', head: true })) as unknown as {
    count: number | null;
  };

  return count || 0;
}

/**
 * Dismiss a notification
 */
export async function dismissNotification(
  notificationId: string,
  userId: string,
): Promise<boolean> {
  const db = await getFirestoreClient();

  const { error } = (await asUntyped(db)
    .from('notifications')
    .update({
      status: 'dismissed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .eq('user_id', userId)) as unknown as { error: Error | null };

  return !error;
}

/**
 * Delete old notifications
 */
export async function cleanupOldNotifications(daysOld = 30): Promise<number> {
  const db = await getFirestoreClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { count } = (await asUntyped(db)
    .from('notifications')
    .delete()
    .lt('created_at', cutoffDate.toISOString())
    .in('status', ['read', 'dismissed'])
    .select('*', { count: 'exact', head: true })) as unknown as { count: number | null };

  return count || 0;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Resolve which channels to use based on type and preferences
 */
function resolveChannels(
  type: NotificationType,
  requestedChannels: NotificationChannel[] | undefined,
  preferences: NotificationPreferences,
): NotificationChannel[] {
  // Start with requested channels or defaults for this type
  const baseChannels = requestedChannels || DEFAULT_TYPE_CHANNELS[type] || ['in_app'];

  // Check type-specific preferences
  const typePrefs = preferences.typePreferences[type];
  if (typePrefs) {
    if (!typePrefs.enabled) {
      return [];
    }
    if (typePrefs.channels.length > 0) {
      return typePrefs.channels.filter((c) => isChannelEnabled(c, preferences));
    }
  }

  // Filter by global channel preferences
  return baseChannels.filter((c) => isChannelEnabled(c, preferences));
}

/**
 * Check if a channel is enabled in preferences
 */
function isChannelEnabled(
  channel: NotificationChannel,
  preferences: NotificationPreferences,
): boolean {
  switch (channel) {
    case 'email':
      return preferences.emailEnabled;
    case 'in_app':
      return preferences.inAppEnabled;
    case 'push':
      return preferences.pushEnabled;
    case 'sms':
      return preferences.smsEnabled;
    default:
      return false;
  }
}

/**
 * Check if current time is within quiet hours
 */
function isInQuietHours(preferences: NotificationPreferences): boolean {
  if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
    return false;
  }

  const now = new Date();
  const timezone = preferences.timezone || 'UTC';

  // Get current time in user's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const currentTime = formatter.format(now);
  const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
  const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);
  const [currentHour, currentMin] = currentTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const currentMinutes = currentHour * 60 + currentMin;

  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

// ============================================================================
// CONVENIENCE METHODS
// ============================================================================

/**
 * Send a simple notification
 */
export async function notify(
  userId: string,
  type: NotificationType,
  data: Record<string, unknown>,
): Promise<Notification | null> {
  const template = NOTIFICATION_TEMPLATES[type];

  if (!template) {
    logger.error(`Unknown notification type: ${type}`);
    return null;
  }

  return createNotification({
    userId,
    type,
    title: renderTemplate(template.titleTemplate, data),
    body: renderTemplate(template.bodyTemplate, data),
    priority: template.defaultPriority,
    channels: template.defaultChannels,
    category: template.category,
    data,
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export const notificationService = {
  // Core
  create: createNotification,
  createBatch: createBatchNotifications,
  notify,

  // Queries
  get: getNotifications,
  getCounts: getNotificationCounts,

  // Actions
  markAsRead,
  markAllAsRead,
  dismiss: dismissNotification,
  cleanup: cleanupOldNotifications,

  // Preferences
  getPreferences: getUserPreferences,
  updatePreferences: updateUserPreferences,
};

export default notificationService;
