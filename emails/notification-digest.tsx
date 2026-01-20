/**
 * =============================================================================
 * LXP360-SaaS | Notification Digest Email Template
 * =============================================================================
 *
 * Sent as a daily or weekly digest of notifications
 */

import { Button, Column, Hr, Link, Row, Section, Text } from '@react-email/components';
import { BaseLayout, buttonPrimary, colors, heading, paragraph } from './components/base-layout';

interface NotificationItem {
  id: string;
  type: 'course' | 'message' | 'achievement' | 'reminder' | 'team' | 'system';
  title: string;
  description: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationDigestEmailProps {
  firstName: string;
  digestType: 'daily' | 'weekly';
  periodStart: string;
  periodEnd: string;
  notifications: NotificationItem[];
  pendingItems?: Array<{
    title: string;
    dueDate?: string;
    url: string;
  }>;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';

const typeIcons: Record<NotificationItem['type'], string> = {
  course: '📚',
  message: '💬',
  achievement: '🏆',
  reminder: '⏰',
  team: '👥',
  system: '🔔',
};

const typeColors: Record<NotificationItem['type'], string> = {
  course: '#3B82F6',
  message: '#10B981',
  achievement: '#F59E0B',
  reminder: '#EF4444',
  team: '#8B5CF6',
  system: '#6B7280',
};

export function NotificationDigestEmail({
  firstName = 'there',
  digestType = 'daily',
  periodStart = 'December 5, 2024',
  periodEnd = 'December 6, 2024',
  notifications = [
    {
      id: '1',
      type: 'course',
      title: 'New module available',
      description: 'Module 3 of "Learning Design Basics" is now available.',
      timestamp: '2 hours ago',
      actionUrl: `${baseUrl}/courses/ld-basics/module-3`,
      actionLabel: 'View Module',
    },
    {
      id: '2',
      type: 'message',
      title: 'New message from Sarah',
      description: 'Sarah Johnson sent you a message about your project.',
      timestamp: '5 hours ago',
      actionUrl: `${baseUrl}/messages`,
      actionLabel: 'Read Message',
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Badge earned!',
      description: 'You earned the "Fast Learner" badge.',
      timestamp: 'Yesterday',
    },
  ],
  pendingItems = [
    {
      title: 'Complete Module 2 Quiz',
      dueDate: 'Tomorrow',
      url: `${baseUrl}/courses/ld-basics/quiz-2`,
    },
    {
      title: 'Submit project draft',
      dueDate: 'Dec 10',
      url: `${baseUrl}/projects/draft`,
    },
  ],
  unsubscribeUrl = `${baseUrl}/unsubscribe?type=digest`,
  preferencesUrl = `${baseUrl}/settings/notifications`,
}: NotificationDigestEmailProps) {
  const digestTitle = digestType === 'daily' ? 'Daily Digest' : 'Weekly Digest';
  const period = digestType === 'daily' ? periodEnd : `${periodStart} - ${periodEnd}`;

  return (
    <BaseLayout preview={`Your ${digestTitle}: ${notifications.length} updates`}>
      <Text style={heading}>Your {digestTitle} 📬</Text>

      <Text style={paragraph}>Hi {firstName},</Text>

      <Text style={paragraph}>
        Here&apos;s a summary of what happened on LXD360 during <strong>{period}</strong>.
      </Text>

      {/* Stats Summary */}
      <Section style={statsSection}>
        <Row>
          <Column style={statColumn}>
            <Text style={statNumber}>{notifications.length}</Text>
            <Text style={statLabel}>Notifications</Text>
          </Column>
          {pendingItems && pendingItems.length > 0 && (
            <Column style={statColumn}>
              <Text style={statNumber}>{pendingItems.length}</Text>
              <Text style={statLabel}>Pending Items</Text>
            </Column>
          )}
        </Row>
      </Section>

      {/* Notifications List */}
      <Section style={notificationsSection}>
        <Text style={sectionHeading}>Recent Activity</Text>

        {notifications.map((notification, index) => (
          <Section key={notification.id}>
            {index > 0 && <Hr style={notificationDivider} />}
            <Section style={notificationItem}>
              <Row>
                <Column style={notificationIconColumn}>
                  <Text
                    style={{
                      ...notificationIcon,
                      backgroundColor: `${typeColors[notification.type]}20`,
                    }}
                  >
                    {typeIcons[notification.type]}
                  </Text>
                </Column>
                <Column style={notificationContent}>
                  <Text style={notificationTitle}>{notification.title}</Text>
                  <Text style={notificationDesc}>{notification.description}</Text>
                  <Row style={notificationMeta}>
                    <Column>
                      <Text style={notificationTime}>{notification.timestamp}</Text>
                    </Column>
                    {notification.actionUrl && (
                      <Column style={notificationAction}>
                        <Link href={notification.actionUrl} style={notificationLink}>
                          {notification.actionLabel || 'View'} →
                        </Link>
                      </Column>
                    )}
                  </Row>
                </Column>
              </Row>
            </Section>
          </Section>
        ))}
      </Section>

      {/* Pending Items */}
      {pendingItems && pendingItems.length > 0 && (
        <Section style={pendingSection}>
          <Text style={sectionHeading}>⚡ Pending Items</Text>
          <Text style={pendingDesc}>Don&apos;t forget to complete these items:</Text>

          {pendingItems.map((item, index) => (
            <Section key={index} style={pendingItem}>
              <Row>
                <Column style={pendingInfo}>
                  <Text style={pendingTitle}>{item.title}</Text>
                  {item.dueDate && <Text style={pendingDue}>Due: {item.dueDate}</Text>}
                </Column>
                <Column style={pendingAction}>
                  <Link href={item.url} style={pendingLink}>
                    Start →
                  </Link>
                </Column>
              </Row>
            </Section>
          ))}
        </Section>
      )}

      <Section style={buttonContainer}>
        <Button href={`${baseUrl}/dashboard`} style={buttonPrimary}>
          Go to Dashboard
        </Button>
      </Section>

      <Hr style={footerDivider} />

      <Section style={preferencesSection}>
        <Text style={preferencesText}>
          You&apos;re receiving this {digestType} digest because you&apos;re subscribed to LXD360
          notifications.
        </Text>
        <Text style={preferencesLinks}>
          <Link href={preferencesUrl} style={preferencesLink}>
            Manage preferences
          </Link>
          {' • '}
          <Link href={unsubscribeUrl} style={preferencesLink}>
            Unsubscribe from digest
          </Link>
        </Text>
      </Section>
    </BaseLayout>
  );
}

// Additional styles
const statsSection = {
  backgroundColor: colors.lxdBlue,
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const statColumn = {
  textAlign: 'center' as const,
  padding: '0 16px',
};

const statNumber = {
  color: colors.white,
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
};

const statLabel = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '12px',
  margin: '4px 0 0 0',
};

const notificationsSection = {
  margin: '24px 0',
};

const sectionHeading = {
  color: colors.textDarkHeading,
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const notificationDivider = {
  borderTop: `1px solid ${colors.border}`,
  margin: '16px 0',
};

const notificationItem = {
  padding: '4px 0',
};

const notificationIconColumn = {
  width: '44px',
  verticalAlign: 'top' as const,
};

const notificationIcon = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  fontSize: '18px',
  textAlign: 'center' as const,
  lineHeight: '36px',
  margin: '0',
};

const notificationContent = {
  paddingLeft: '8px',
  verticalAlign: 'top' as const,
};

const notificationTitle = {
  color: colors.textDarkHeading,
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const notificationDesc = {
  color: colors.textDarkSecondary,
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0 0 8px 0',
};

const notificationMeta = {
  marginTop: '4px',
};

const notificationTime = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  margin: '0',
};

const notificationAction = {
  textAlign: 'right' as const,
};

const notificationLink = {
  color: colors.lxdBlue,
  fontSize: '12px',
  fontWeight: '500',
  textDecoration: 'none',
};

const pendingSection = {
  backgroundColor: '#FEF3C7',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const pendingDesc = {
  color: '#92400E',
  fontSize: '13px',
  margin: '0 0 16px 0',
};

const pendingItem = {
  backgroundColor: colors.white,
  borderRadius: '6px',
  padding: '12px 16px',
  marginBottom: '8px',
};

const pendingInfo = {
  verticalAlign: 'middle' as const,
};

const pendingTitle = {
  color: colors.textDark,
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const pendingDue = {
  color: colors.error,
  fontSize: '12px',
  margin: '2px 0 0 0',
};

const pendingAction = {
  textAlign: 'right' as const,
  verticalAlign: 'middle' as const,
  width: '70px',
};

const pendingLink = {
  color: colors.lxdBlue,
  fontSize: '13px',
  fontWeight: '500',
  textDecoration: 'none',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const footerDivider = {
  borderTop: `1px solid ${colors.border}`,
  margin: '32px 0 24px 0',
};

const preferencesSection = {
  textAlign: 'center' as const,
};

const preferencesText = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 8px 0',
};

const preferencesLinks = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  margin: '0',
};

const preferencesLink = {
  color: colors.lxdBlue,
  textDecoration: 'none',
};

export default NotificationDigestEmail;
