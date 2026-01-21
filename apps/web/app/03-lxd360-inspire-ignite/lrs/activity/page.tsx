'use client';

export const dynamic = 'force-dynamic';

import { Activity, Clock, Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock activity stream - TODO: Replace with real-time Pub/Sub subscription
const activityStream = [
  {
    id: '1',
    actor: 'john.smith@acme.com',
    verb: 'completed',
    object: 'Module 3 Quiz',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    actor: 'sarah.johnson@acme.com',
    verb: 'answered',
    object: 'Question 5',
    timestamp: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: '3',
    actor: 'mike.davis@globalind.com',
    verb: 'launched',
    object: 'Data Analytics Course',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: '4',
    actor: 'emily.brown@techstart.io',
    verb: 'progressed',
    object: 'Leadership Module',
    timestamp: new Date(Date.now() - 90000).toISOString(),
  },
  {
    id: '5',
    actor: 'david.wilson@acme.com',
    verb: 'failed',
    object: 'Compliance Assessment',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
];

/**
 * Activity Stream - Real-time xAPI statement feed
 */
export default function ActivityStreamPage() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Activity Stream</h1>
          <p className="text-muted-foreground mt-1">Real-time xAPI statement feed</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? (
            <>
              <Play className="w-4 h-4" aria-hidden="true" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" aria-hidden="true" />
              Pause
            </>
          )}
        </Button>
      </div>

      {/* Stream Status */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse',
              )}
              role="img"
              aria-label={isPaused ? 'Paused' : 'Live'}
            />
            <span className="text-sm text-brand-primary">
              {isPaused ? 'Stream paused' : 'Receiving live statements'}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">~12 statements/sec</span>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            Live Feed
          </CardTitle>
          <CardDescription>Statements as they arrive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activityStream.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-lxd-dark-bg/50 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <span
                  className={cn(
                    'px-2 py-1 text-xs rounded-full capitalize',
                    activity.verb === 'completed' && 'bg-green-500/20 text-green-400',
                    activity.verb === 'answered' && 'bg-blue-500/20 text-blue-400',
                    activity.verb === 'launched' && 'bg-purple-500/20 text-purple-400',
                    activity.verb === 'progressed' && 'bg-yellow-500/20 text-yellow-400',
                    activity.verb === 'failed' && 'bg-red-500/20 text-red-400',
                  )}
                >
                  {activity.verb}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-brand-primary">
                    <span className="font-medium">{activity.actor}</span>{' '}
                    <span className="text-muted-foreground">{activity.verb}</span>{' '}
                    <span className="font-medium">{activity.object}</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {formatTimeAgo(new Date(activity.timestamp))}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Note about real-time */}
      <p className="text-xs text-muted-foreground text-center">
        Real-time streaming will be connected to Pub/Sub in Phase 4
      </p>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
