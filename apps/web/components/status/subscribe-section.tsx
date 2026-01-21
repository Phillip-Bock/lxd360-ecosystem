'use client';

import { Bell, Loader2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type SubscriptionPreference = 'all' | 'outages' | 'maintenance';

interface SubscribeSectionProps {
  onSubscribe?: (data: {
    email: string;
    preference: SubscriptionPreference;
    webhookUrl?: string;
  }) => Promise<void>;
}

export function SubscribeSection({ onSubscribe }: SubscribeSectionProps) {
  const [email, setEmail] = useState('');
  const [preference, setPreference] = useState<SubscriptionPreference>('all');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (onSubscribe) {
        await onSubscribe({ email, preference, webhookUrl: webhookUrl || undefined });
      } else {
        // Default API call
        const response = await fetch('/api/status/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, preference, webhookUrl: webhookUrl || undefined }),
        });

        if (!response.ok) {
          throw new Error('Failed to subscribe');
        }
      }

      setMessage({ type: 'success', text: 'Successfully subscribed to status updates!' });
      setEmail('');
      setWebhookUrl('');
    } catch {
      // Silently ignore - subscription failed, show generic error message to user
      setMessage({ type: 'error', text: 'Failed to subscribe. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-semibold">Subscribe to Updates</h2>
      <Card className="border-brand-default bg-surface-card text-brand-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-[var(--brand-primary)]" />
            Get notified about status changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubscribe} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-brand-default bg-surface-page text-brand-primary placeholder:text-brand-muted"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-3">
              <Label>Notification Preferences</Label>
              <RadioGroup
                value={preference}
                onValueChange={(value) => setPreference(value as SubscriptionPreference)}
                disabled={isSubmitting}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal">
                    All updates (incidents, maintenance, and resolutions)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outages" id="outages" />
                  <Label htmlFor="outages" className="font-normal">
                    Outages only (critical incidents)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maintenance" id="maintenance" />
                  <Label htmlFor="maintenance" className="font-normal">
                    Maintenance notifications only
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook">Webhook URL (Optional - for developers)</Label>
              <Input
                id="webhook"
                type="url"
                placeholder="https://your-app.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="border-brand-default bg-surface-page text-brand-primary placeholder:text-brand-muted"
                disabled={isSubmitting}
              />
              <p className="text-xs text-brand-muted">
                Receive POST notifications for status changes
              </p>
            </div>

            {message && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  message.type === 'success'
                    ? 'bg-brand-success/10 text-brand-success'
                    : 'bg-brand-error/10 text-brand-error'
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Subscribe to Updates
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
