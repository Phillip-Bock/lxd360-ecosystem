'use client';

import { Bell, Lock, Mail, ShieldAlert, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { getPersonaFromClaims, type Persona } from '@/lib/rbac/personas';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

const log = logger.scope('SettingsPage');

interface NotificationToggleProps {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}

function NotificationToggle({ id, label, description, defaultChecked }: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={id} defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-[var(--color-lxd-primary)] transition-colors peer-focus:ring-2 peer-focus:ring-[var(--color-lxd-primary)]/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
      </label>
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading } = useSafeAuth();
  const router = useRouter();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);

  // CV-002: Owner-only guard - Settings is restricted to owners
  useEffect(() => {
    async function checkOwnerAccess() {
      if (loading || !user) return;

      try {
        const tokenResult = await user.getIdTokenResult(true);
        const userPersona = getPersonaFromClaims(tokenResult.claims);
        setPersona(userPersona);

        // Only owners can access settings
        if (userPersona !== 'owner') {
          router.replace('/ignite/dashboard');
          return;
        }

        setAccessChecked(true);
      } catch (error) {
        log.error('Settings access check failed', error);
        router.replace('/ignite/dashboard');
      }
    }

    checkOwnerAccess();
  }, [user, loading, router]);

  // Show loading while checking access
  if (loading || !accessChecked) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // CV-002: Block rendering if not owner (defense in depth)
  if (persona !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">Only account owners can access settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and account</p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
            <div>
              <CardTitle className="text-foreground">Profile</CardTitle>
              <CardDescription>Your profile information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                defaultValue={user?.displayName || ''}
                placeholder="Your name"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-[var(--color-lxd-primary)]/50"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                defaultValue={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              defaultValue=""
              placeholder="e.g., Senior Instructor"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-[var(--color-lxd-primary)]/50"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-[var(--color-lxd-primary)]/50 resize-none"
            />
          </div>
          <Button className="bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90">
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
            <div>
              <CardTitle className="text-foreground">Notifications</CardTitle>
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
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
            <div>
              <CardTitle className="text-foreground">Communication</CardTitle>
              <CardDescription>Manage learner communication preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="replyTo" className="block text-sm font-medium text-foreground mb-1">
              Reply-to Email
            </label>
            <input
              id="replyTo"
              type="email"
              defaultValue={user?.email || ''}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-[var(--color-lxd-primary)]/50"
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
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
            <div>
              <CardTitle className="text-foreground">Privacy</CardTitle>
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
