'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { getUserSettings, updateNotificationPreferences } from '@/lib/actions/user-settings';
import { getPersonaFromClaims, type Persona } from '@/lib/rbac/personas';
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
  notificationPreferencesSchema,
} from '@/types/user-settings';

export default function NotificationsPage(): React.JSX.Element {
  const { user } = useSafeAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [persona, setPersona] = useState<Persona | null>(null);

  const form = useForm<NotificationPreferences>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: DEFAULT_NOTIFICATION_PREFERENCES,
  });

  // Load user settings and persona
  useEffect(() => {
    async function loadSettings(): Promise<void> {
      try {
        // Get persona from Firebase custom claims
        if (user) {
          const tokenResult = await user.getIdTokenResult(true);
          const userPersona = getPersonaFromClaims(tokenResult.claims);
          setPersona(userPersona);
        }

        const result = await getUserSettings();

        if ('error' in result) {
          toast.error(result.error);
          return;
        }

        form.reset(result.data.notifications);
      } catch (_error) {
        toast.error('Failed to load notification settings');
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [form, user]);

  const onSubmit = useCallback(async (data: NotificationPreferences): Promise<void> => {
    setIsSaving(true);
    try {
      const result = await updateNotificationPreferences(data);

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      toast.success('Notification preferences updated');
    } catch (_error) {
      toast.error('Failed to update notification preferences');
    } finally {
      setIsSaving(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  // Check if user is a manager to show manager-specific options
  const isManager = persona === 'owner' || persona === 'manager';

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Notifications Master Toggle */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
                <div>
                  <CardTitle className="text-foreground">Email Notifications</CardTitle>
                  <CardDescription>Manage email notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Email Notifications</FormLabel>
                      <FormDescription>Master toggle for all email notifications</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Separator />

              {/* Learning Notifications */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Learning Updates</h3>

                <FormField
                  control={form.control}
                  name="courseAssignments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Course Assignments</FormLabel>
                        <FormDescription>Get notified when assigned to new courses</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!form.watch('emailNotifications')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDateReminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Due Date Reminders</FormLabel>
                        <FormDescription>Receive reminders before course deadlines</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!form.watch('emailNotifications')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="completionCertificates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Completion Certificates</FormLabel>
                        <FormDescription>Get notified when certificates are issued</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!form.watch('emailNotifications')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weeklyDigest"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Weekly Digest</FormLabel>
                        <FormDescription>
                          Receive a weekly summary of your learning activity
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!form.watch('emailNotifications')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Manager-Only Notifications */}
          {isManager && (
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
                  <div>
                    <CardTitle className="text-foreground">Team Notifications</CardTitle>
                    <CardDescription>Notifications related to team management</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="managerApprovals"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Manager Approvals</FormLabel>
                        <FormDescription>Get notified when approvals are needed</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!form.watch('emailNotifications')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Team Updates</FormLabel>
                        <FormDescription>
                          Receive updates about team member progress
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!form.watch('emailNotifications')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
