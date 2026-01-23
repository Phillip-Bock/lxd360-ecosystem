'use client';

export const dynamic = 'force-dynamic';

import { Bell, Lock, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Instructor Settings page - Configure teaching preferences
 */
export default function TeachSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your teaching preferences and account</p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            <div>
              <CardTitle className="text-brand-primary">Profile</CardTitle>
              <CardDescription>Your instructor profile information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-brand-primary mb-1"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                defaultValue="Dr. Sarah Chen"
                className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50"
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-brand-primary mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                defaultValue="Senior Instructor"
                className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50"
              />
            </div>
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-brand-primary mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              defaultValue="Experienced learning and development professional with expertise in leadership training."
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50 resize-none"
            />
          </div>
          <Button className="bg-lxd-purple hover:bg-lxd-purple/90">Save Profile</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            <div>
              <CardTitle className="text-brand-primary">Notifications</CardTitle>
              <CardDescription>Configure how you receive alerts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationToggle
            id="newSubmissions"
            label="New Submissions"
            description="Get notified when learners submit assignments"
            defaultChecked
          />
          <NotificationToggle
            id="atRiskAlerts"
            label="At-Risk Alerts"
            description="Receive alerts for learners falling behind"
            defaultChecked
          />
          <NotificationToggle
            id="courseCompletion"
            label="Course Completions"
            description="Notify when learners complete your courses"
            defaultChecked={false}
          />
          <NotificationToggle
            id="weeklyDigest"
            label="Weekly Digest"
            description="Receive a weekly summary of activity"
            defaultChecked
          />
        </CardContent>
      </Card>

      {/* Communication Settings */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            <div>
              <CardTitle className="text-brand-primary">Communication</CardTitle>
              <CardDescription>Manage learner communication preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="replyTo" className="block text-sm font-medium text-brand-primary mb-1">
              Reply-to Email
            </label>
            <input
              id="replyTo"
              type="email"
              defaultValue="sarah.chen@lxd360.com"
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50"
            />
          </div>
          <NotificationToggle
            id="allowDirectMessages"
            label="Allow Direct Messages"
            description="Let learners send you direct messages"
            defaultChecked
          />
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            <div>
              <CardTitle className="text-brand-primary">Privacy</CardTitle>
              <CardDescription>Control your visibility and data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationToggle
            id="showProfile"
            label="Show Profile to Learners"
            description="Display your bio and photo on course pages"
            defaultChecked
          />
          <NotificationToggle
            id="showStats"
            label="Show Teaching Stats"
            description="Display your course ratings and student count"
            defaultChecked
          />
        </CardContent>
      </Card>
    </div>
  );
}

interface NotificationToggleProps {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}

function NotificationToggle({ id, label, description, defaultChecked }: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-lxd-dark-bg/50">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-brand-primary cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={id} defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-lxd-dark-border rounded-full peer peer-checked:bg-lxd-purple transition-colors peer-focus:ring-2 peer-focus:ring-lxd-purple/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
      </label>
    </div>
  );
}
