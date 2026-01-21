'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCoursePresence,
  useRealtimeHealth,
  useRealtimeMetrics,
  useRealtimeSubscription,
} from '@/lib/hooks';

interface CourseActivity extends Record<string, unknown> {
  id: string;
  user_id: string;
  course_id: string;
  action: string;
  timestamp: string;
}

interface RealtimeDashboardProps {
  courseId: string;
  userId: string;
}

/**
 * Example dashboard showing real-time course activity and presence
 */
export function RealtimeDashboard({ courseId, userId }: RealtimeDashboardProps): React.JSX.Element {
  const [activities, setActivities] = useState<CourseActivity[]>([]);

  // Track who's currently viewing the course
  const {
    users: onlineUsers,
    isConnected: presenceConnected,
    onlineCount,
  } = useCoursePresence(courseId, userId, {
    metadata: {
      currentPage: 'course-dashboard',
      role: 'learner',
    },
  });

  // Subscribe to course activity updates
  const { isConnected: activityConnected } = useRealtimeSubscription<CourseActivity>(
    'course_activities',
    `course_id=eq.${courseId}`,
    {
      onInsert: (activity) => {
        setActivities((prev) => [activity, ...prev].slice(0, 10));
      },
    },
  );

  // Monitor real-time system health
  const health = useRealtimeHealth(5000); // Poll every 5 seconds
  const metrics = useRealtimeMetrics(5000);

  return (
    <div className="space-y-4">
      {/* System Health Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Real-time Status
            <Badge variant={health.healthy ? 'default' : 'destructive'}>
              {health.healthy ? 'Healthy' : 'Unhealthy'}
            </Badge>
          </CardTitle>
          <CardDescription>Connection and performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Active Channels</p>
              <p className="text-2xl font-bold">{health.activeChannels}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Failed Channels</p>
              <p className="text-2xl font-bold text-destructive">{health.failedChannels}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Message Rate</p>
              <p className="text-2xl font-bold">
                {metrics.messageRate?.toFixed(2) || '0'} <span className="text-sm">msg/s</span>
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Latency</p>
              <p className="text-2xl font-bold">
                {metrics.averageLatency?.toFixed(0) || '0'} <span className="text-sm">ms</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Online Users Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Currently Online
            <Badge variant={presenceConnected ? 'default' : 'secondary'}>
              {presenceConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {onlineCount} {onlineCount === 1 ? 'person' : 'people'} viewing this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!presenceConnected ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : onlineUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No one else is online</p>
          ) : (
            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <div key={user.user_id} className="flex items-center gap-2 p-2 rounded-lg border">
                  <div className="h-2 w-2 bg-brand-success rounded-full" />
                  <span className="text-sm">{user.metadata?.displayName || user.user_id}</span>
                  {user.metadata?.role && (
                    <Badge variant="outline" className="ml-auto">
                      {user.metadata.role}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Recent Activity
            <Badge variant={activityConnected ? 'default' : 'secondary'}>
              {activityConnected ? 'Live' : 'Offline'}
            </Badge>
          </CardTitle>
          <CardDescription>Real-time course activity updates</CardDescription>
        </CardHeader>
        <CardContent>
          {!activityConnected ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div key={activity.id} className="p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">New</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example: Simple presence indicator
 */
export function PresenceIndicator({
  courseId,
  userId,
}: {
  courseId: string;
  userId: string;
}): React.JSX.Element {
  const { onlineCount, isConnected } = useCoursePresence(courseId, userId);

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" />
        <span>Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="h-2 w-2 bg-brand-success rounded-full" />
      <span>
        {onlineCount} {onlineCount === 1 ? 'person' : 'people'} online
      </span>
    </div>
  );
}

/**
 * Example: Health monitor component for admin dashboard
 */
export function RealtimeHealthMonitor(): React.JSX.Element {
  const health = useRealtimeHealth(3000);
  const metrics = useRealtimeMetrics(3000);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time System Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <Badge variant={health.healthy ? 'default' : 'destructive'}>
            {health.healthy ? '✓ Operational' : '✗ Issues Detected'}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active Channels</span>
            <span className="font-medium">{health.activeChannels}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Failed Channels</span>
            <span className="font-medium text-destructive">{health.failedChannels}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reconnect Attempts</span>
            <span className="font-medium">{health.reconnectAttempts}</span>
          </div>
        </div>

        {metrics.averageLatency !== undefined && (
          <div className="pt-4 border-t">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Latency</span>
                <span className="font-medium">{metrics.averageLatency.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Message Rate</span>
                <span className="font-medium">{metrics.messageRate?.toFixed(2) || '0'} msg/s</span>
              </div>
              {metrics.uptime !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-medium">
                    {Math.floor(metrics.uptime / 60)}m {metrics.uptime % 60}s
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {health.lastError && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-destructive mb-2">Last Error</p>
            <div className="text-xs space-y-1">
              <p className="text-muted-foreground">{health.lastError.message}</p>
              <p className="text-muted-foreground">Channel: {health.lastError.channel}</p>
              <p className="text-muted-foreground">
                {new Date(health.lastError.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
