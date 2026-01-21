'use client';

import { AlertTriangle, Bell, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import WidgetWrapper from './widget-wrapper';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Mock data - replace with real notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Course Published',
    message: 'Safety Training is now live',
    time: '10 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Storage Warning',
    message: "You're using 80% of your storage",
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'New Comment',
    message: 'Sarah left feedback on Lesson 3',
    time: '3 hours ago',
    read: true,
  },
];

const iconMap: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertTriangle,
};

// Using CSS variables from INSPIRE palette
const colorStyles: Record<NotificationType, { color: string; bg: string }> = {
  info: { color: 'var(--inspire-info)', bg: 'var(--inspire-info-bg)' },
  success: { color: 'var(--inspire-success)', bg: 'var(--inspire-success-bg)' },
  warning: { color: 'var(--inspire-warning)', bg: 'var(--inspire-warning-bg)' },
  error: { color: 'var(--inspire-error)', bg: 'var(--inspire-error-bg)' },
};

export default function NotificationsWidget() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <WidgetWrapper
      title="Notifications"
      size={2}
      headerAction={
        unreadCount > 0 ? (
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
            {unreadCount} new
          </span>
        ) : null
      }
    >
      <div className="space-y-3">
        {mockNotifications.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="w-10 h-10 text-white/50 mx-auto mb-2" />
            <p className="text-sm text-white">No notifications</p>
          </div>
        ) : (
          mockNotifications.map((notification) => {
            const Icon = iconMap[notification.type];
            const styles = colorStyles[notification.type];
            return (
              <div
                key={notification.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer',
                  notification.read ? 'opacity-70' : '',
                )}
                style={{
                  backgroundColor: notification.read
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: styles.bg, color: styles.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn('text-sm', !notification.read && 'font-medium')}
                    style={{ color: 'var(--inspire-text-on-card)' }}
                  >
                    {notification.title}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: 'var(--inspire-text-on-card-secondary)' }}
                  >
                    {notification.message}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--inspire-text-on-card-muted)' }}
                  >
                    {notification.time}
                  </p>
                </div>
                {!notification.read && (
                  <div
                    className="w-2 h-2 rounded-full shrink-0 mt-2"
                    style={{ backgroundColor: 'var(--inspire-unread-dot)' }}
                  />
                )}
              </div>
            );
          })
        )}

        <button
          type="button"
          className="w-full text-center text-xs text-white hover:text-white/80 py-2 transition-colors"
        >
          View all notifications
        </button>
      </div>
    </WidgetWrapper>
  );
}
