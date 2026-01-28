'use client';

export const dynamic = 'force-dynamic';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getUserSettings, updateProfile } from '@/lib/actions/user-settings';
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import {
  DEPARTMENT_OPTIONS,
  type ProfileFormData,
  profileSchema,
  TIMEZONE_OPTIONS,
} from '@/types/user-settings';

export default function ProfilePage(): React.JSX.Element {
  const { user } = useSafeAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      firstName: '',
      lastName: '',
      phone: '',
      jobTitle: '',
      department: '',
      bio: '',
      location: '',
      timezone: '',
    },
  });

  // Load user settings
  useEffect(() => {
    async function loadSettings(): Promise<void> {
      try {
        const result = await getUserSettings();

        if ('error' in result) {
          toast.error(result.error);
          return;
        }

        const { profile } = result.data;
        setAvatarUrl(profile.avatarUrl);

        form.reset({
          displayName: profile.displayName,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone || '',
          jobTitle: profile.jobTitle || '',
          department: profile.department || '',
          bio: profile.bio || '',
          location: profile.location || '',
          timezone: profile.timezone || '',
        });
      } catch (_error) {
        toast.error('Failed to load profile settings');
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [form]);

  const onSubmit = useCallback(async (data: ProfileFormData): Promise<void> => {
    setIsSaving(true);
    try {
      const result = await updateProfile(data);

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      toast.success('Profile updated successfully');
    } catch (_error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleAvatarUploadComplete = useCallback((url: string) => {
    setAvatarUrl(url);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  const bioLength = form.watch('bio')?.length || 0;

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Profile Photo</CardTitle>
          <CardDescription>
            Upload a profile photo that will be visible to other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentAvatarUrl={avatarUrl}
            displayName={form.watch('displayName') || user?.displayName || ''}
            userId={user?.uid || ''}
            onUploadComplete={handleAvatarUploadComplete}
          />
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Personal Information</CardTitle>
          <CardDescription>Update your personal details and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Display Name */}
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="How you want to be known" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name that will be displayed across the platform
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email (read-only) */}
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={user?.email || ''} disabled className="bg-muted" />
                <FormDescription>Your email address cannot be changed here</FormDescription>
              </FormItem>

              <Separator />

              {/* Phone and Job Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Learning Designer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Department */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select department..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value || 'none'}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{bioLength}/500 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Location and Timezone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select timezone..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMEZONE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value || 'none'}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
