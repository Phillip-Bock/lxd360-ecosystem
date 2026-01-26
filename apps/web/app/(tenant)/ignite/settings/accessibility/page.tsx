'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { getUserSettings, updateAccessibilityPreferences } from '@/lib/actions/user-settings';
import {
  type AccessibilityPreferences,
  accessibilityPreferencesSchema,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  FONT_SIZE_OPTIONS,
} from '@/types/user-settings';

export default function AccessibilityPage(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AccessibilityPreferences>({
    resolver: zodResolver(accessibilityPreferencesSchema),
    defaultValues: DEFAULT_ACCESSIBILITY_PREFERENCES,
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

        form.reset(result.data.accessibility);
      } catch (_error) {
        toast.error('Failed to load accessibility settings');
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [form]);

  const onSubmit = useCallback(async (data: AccessibilityPreferences): Promise<void> => {
    setIsSaving(true);
    try {
      const result = await updateAccessibilityPreferences(data);

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      toast.success('Accessibility preferences updated');
    } catch (_error) {
      toast.error('Failed to update accessibility preferences');
    } finally {
      setIsSaving(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading accessibility settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Visual Settings */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Visual Settings</CardTitle>
              <CardDescription>
                Customize how content is displayed to suit your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="highContrast"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">High Contrast Mode</FormLabel>
                      <FormDescription>Increase contrast for better visibility</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Separator />

              {/* Font Size */}
              <FormField
                control={form.control}
                name="fontSize"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Font Size</FormLabel>
                    <FormDescription>Choose a comfortable text size for reading</FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        {FONT_SIZE_OPTIONS.map((option) => (
                          <FormItem
                            key={option.value}
                            className="flex items-center space-x-3 space-y-0 rounded-lg bg-muted/50 p-3"
                          >
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Motion Settings */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Motion Settings</CardTitle>
              <CardDescription>Control animations and motion effects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="reduceMotion"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Reduce Motion</FormLabel>
                      <FormDescription>
                        Minimize animations and transitions throughout the interface
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Screen Reader & Captions */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Assistive Technology</CardTitle>
              <CardDescription>Settings for screen readers and captions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="screenReaderOptimized"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Screen Reader Optimized</FormLabel>
                      <FormDescription>
                        Enhance compatibility with screen reader software
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alwaysShowCaptions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Always Show Captions</FormLabel>
                      <FormDescription>
                        Display captions on all video and audio content when available
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
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
