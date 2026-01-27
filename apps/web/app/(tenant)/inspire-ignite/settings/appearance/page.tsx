'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getUserSettings, updateAppearancePreferences } from '@/lib/actions/user-settings';
import { cn } from '@/lib/utils';
import {
  type AppearancePreferences,
  appearancePreferencesSchema,
  DEFAULT_APPEARANCE_PREFERENCES,
} from '@/types/user-settings';

const THEME_OPTIONS = [
  {
    value: 'light',
    label: 'Light',
    description: 'Light background with dark text',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Dark background with light text',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: "Follow your device's theme setting",
    icon: Monitor,
  },
] as const;

export default function AppearancePage(): React.JSX.Element {
  const { setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AppearancePreferences>({
    resolver: zodResolver(appearancePreferencesSchema),
    defaultValues: DEFAULT_APPEARANCE_PREFERENCES,
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

        form.reset(result.data.appearance);
      } catch (_error) {
        toast.error('Failed to load appearance settings');
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [form]);

  const onSubmit = useCallback(
    async (data: AppearancePreferences): Promise<void> => {
      setIsSaving(true);
      try {
        // Apply theme immediately
        setTheme(data.theme);

        const result = await updateAppearancePreferences(data);

        if ('error' in result) {
          toast.error(result.error);
          return;
        }

        toast.success('Appearance preferences updated');
      } catch (_error) {
        toast.error('Failed to update appearance preferences');
      } finally {
        setIsSaving(false);
      }
    },
    [setTheme],
  );

  // Handle theme change preview
  const handleThemeChange = useCallback(
    (value: string) => {
      form.setValue('theme', value as 'light' | 'dark' | 'system');
      // Preview the theme change immediately
      setTheme(value);
    },
    [form, setTheme],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading appearance settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Theme Selection */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Theme</CardTitle>
              <CardDescription>Choose how the interface looks to you</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Select theme</FormLabel>
                    <FormDescription className="sr-only">
                      Choose between light, dark, or system theme
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={handleThemeChange}
                        value={field.value}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {THEME_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          const isSelected = field.value === option.value;

                          return (
                            <FormItem key={option.value}>
                              <FormControl>
                                <RadioGroupItem
                                  value={option.value}
                                  id={`theme-${option.value}`}
                                  className="peer sr-only"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={`theme-${option.value}`}
                                className={cn(
                                  'flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all',
                                  'hover:bg-muted/50',
                                  isSelected
                                    ? 'border-[var(--color-lxd-primary)] bg-[var(--color-lxd-primary)]/5'
                                    : 'border-border',
                                )}
                              >
                                <div
                                  className={cn(
                                    'flex h-12 w-12 items-center justify-center rounded-full mb-3',
                                    isSelected
                                      ? 'bg-[var(--color-lxd-primary)]/10 text-[var(--color-lxd-primary)]'
                                      : 'bg-muted text-muted-foreground',
                                  )}
                                >
                                  <Icon className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                  {option.label}
                                </span>
                                <span className="text-xs text-muted-foreground text-center mt-1">
                                  {option.description}
                                </span>
                              </FormLabel>
                            </FormItem>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Preview</CardTitle>
              <CardDescription>See how your selected theme looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[var(--color-lxd-primary)] flex items-center justify-center text-white text-sm font-medium">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">John Doe</p>
                    <p className="text-xs text-muted-foreground">Learning Designer</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-muted rounded" />
                  <div className="h-2 w-3/4 bg-muted rounded" />
                  <div className="h-2 w-1/2 bg-muted rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 bg-[var(--color-lxd-primary)] text-white text-xs rounded">
                    Primary
                  </div>
                  <div className="px-3 py-1.5 bg-muted text-muted-foreground text-xs rounded">
                    Secondary
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
