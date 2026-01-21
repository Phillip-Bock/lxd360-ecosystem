'use client';

import { Bell, Mail, Monitor, Smartphone } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export const NotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    inAppEnabled: true,
    pushEnabled: false,
    frequency: 'immediate',
    courseEnrollments: true,
    announcements: true,
    dueDates: true,
    feedback: true,
    forumReplies: true,
    liveSessions: true,
    certificates: true,
    platformUpdates: true,
    marketing: false,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-lxd-text-dark-heading flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notification Preferences
        </h2>
        <p className="text-lxd-text-dark-body mt-1">
          Control how and when you receive notifications
        </p>
      </div>

      {/* Master Toggles */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4">
          Notification Channels
        </h3>
        <div className="space-y-4">
          <label
            htmlFor="NotificationsTab-input-1"
            className="flex items-center justify-between p-4 border border-lxd-light-border rounded-lg hover:bg-lxd-light-card"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-lxd-text-dark-body" />
              <div>
                <div className="font-medium text-lxd-text-dark-heading">Email Notifications</div>
                <div className="text-sm text-lxd-text-dark-muted">
                  Receive notifications via email
                </div>
              </div>
            </div>
            <div className="relative inline-block w-12 h-6">
              <input
                id="NotificationsTab-input-1"
                type="checkbox"
                checked={notifications.emailEnabled}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    emailEnabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-lxd-light-surface peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-brand-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-lxd-light-card after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </div>
          </label>

          <label
            htmlFor="NotificationsTab-input-2"
            className="flex items-center justify-between p-4 border border-lxd-light-border rounded-lg hover:bg-lxd-light-card"
          >
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-lxd-text-dark-body" />
              <div>
                <div className="font-medium text-lxd-text-dark-heading">In-App Notifications</div>
                <div className="text-sm text-lxd-text-dark-muted">
                  Show notifications in the platform
                </div>
              </div>
            </div>
            <div className="relative inline-block w-12 h-6">
              <input
                id="NotificationsTab-input-2"
                type="checkbox"
                checked={notifications.inAppEnabled}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    inAppEnabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-lxd-light-surface peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-brand-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-lxd-light-card after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </div>
          </label>

          <label
            htmlFor="NotificationsTab-input-3"
            className="flex items-center justify-between p-4 border border-lxd-light-border rounded-lg hover:bg-lxd-light-card"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-lxd-text-dark-body" />
              <div>
                <div className="font-medium text-lxd-text-dark-heading">Push Notifications</div>
                <div className="text-sm text-lxd-text-dark-muted">
                  Send notifications to your device
                </div>
              </div>
            </div>
            <div className="relative inline-block w-12 h-6">
              <input
                id="NotificationsTab-input-3"
                type="checkbox"
                checked={notifications.pushEnabled}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    pushEnabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-lxd-light-surface peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-brand-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-lxd-light-card after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Notification Frequency */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4">
          Notification Frequency
        </h3>
        <div className="space-y-2">
          {[
            {
              value: 'immediate',
              label: 'Immediate',
              description: 'Get notified as soon as something happens',
            },
            {
              value: 'daily',
              label: 'Daily Digest',
              description: 'Receive a summary once per day',
            },
            {
              value: 'weekly',
              label: 'Weekly Digest',
              description: 'Receive a summary once per week',
            },
            {
              value: 'never',
              label: 'Never',
              description: 'Do not send notifications',
            },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 border border-lxd-light-border rounded-lg cursor-pointer hover:bg-lxd-light-card"
            >
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={notifications.frequency === option.value}
                onChange={(e) => setNotifications({ ...notifications, frequency: e.target.value })}
                className="text-brand-blue focus:ring-brand-primary"
              />
              <div>
                <div className="font-medium text-lxd-text-dark-heading">{option.label}</div>
                <div className="text-sm text-lxd-text-dark-muted">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Granular Preferences */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4">
          Notification Types
        </h3>
        <div className="space-y-3">
          {[
            {
              key: 'courseEnrollments',
              label: 'Course Enrollments',
              description: 'New course enrollments and completions',
            },
            {
              key: 'announcements',
              label: 'Announcements',
              description: 'Important updates and announcements',
            },
            {
              key: 'dueDates',
              label: 'Due Dates & Reminders',
              description: 'Assignment and course deadline reminders',
            },
            {
              key: 'feedback',
              label: 'Feedback & Grades',
              description: 'Instructor feedback and grade updates',
            },
            {
              key: 'forumReplies',
              label: 'Forum Replies',
              description: 'Replies to your forum posts and comments',
            },
            {
              key: 'liveSessions',
              label: 'Live Sessions',
              description: 'Upcoming webinars and live class reminders',
            },
            {
              key: 'certificates',
              label: 'Certificates & Achievements',
              description: 'New certificates and badge awards',
            },
            {
              key: 'platformUpdates',
              label: 'Platform Updates',
              description: 'New features and platform improvements',
            },
            {
              key: 'marketing',
              label: 'Marketing & Promotions',
              description: 'Special offers and promotional content',
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start justify-between p-3 border border-lxd-light-border rounded-lg hover:bg-lxd-light-card"
            >
              <div className="flex-1">
                <div className="font-medium text-lxd-text-dark-heading">{item.label}</div>
                <div className="text-sm text-lxd-text-dark-muted">{item.description}</div>
              </div>
              <input
                type="checkbox"
                checked={notifications[item.key as keyof typeof notifications] as boolean}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    [item.key]: e.target.checked,
                  })
                }
                className="mt-1 text-brand-blue focus:ring-brand-primary rounded"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-lxd-light-border pt-6 flex justify-end">
        <button
          type="button"
          className="px-6 py-2 bg-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
