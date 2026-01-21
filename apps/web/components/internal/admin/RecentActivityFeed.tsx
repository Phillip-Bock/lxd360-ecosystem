'use client';

import {
  AlertTriangle,
  Award,
  BookOpen,
  ChevronDown,
  FileCheck,
  Filter,
  GraduationCap,
  MessageSquare,
  RefreshCw,
  Settings,
  UserPlus,
} from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/core/utils';

// ============================================================================
// TYPES
// ============================================================================

type ActivityType =
  | 'user_signup'
  | 'course_published'
  | 'enrollment'
  | 'error'
  | 'content_approved'
  | 'message'
  | 'certificate'
  | 'settings_change';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  actor?: {
    name: string;
    avatar?: string | null;
  };
  timestamp: Date;
  metadata?: Record<string, string | number>;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'user_signup',
    title: 'New user registered',
    description: 'john.doe@example.com signed up',
    actor: { name: 'John Doe', avatar: null },
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: '2',
    type: 'course_published',
    title: 'Course published',
    description: '"Introduction to React" is now live',
    actor: { name: 'Jane Smith', avatar: null },
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '3',
    type: 'enrollment',
    title: 'New enrollment',
    description: 'Bob Wilson enrolled in "Advanced TypeScript"',
    actor: { name: 'Bob Wilson', avatar: null },
    timestamp: new Date(Date.now() - 32 * 60 * 1000),
  },
  {
    id: '4',
    type: 'error',
    title: 'Error occurred',
    description: 'Database connection timeout in /api/courses',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    metadata: { count: 3 },
  },
  {
    id: '5',
    type: 'certificate',
    title: 'Certificate issued',
    description: 'Alice Johnson earned certificate for "UX Design Fundamentals"',
    actor: { name: 'Alice Johnson', avatar: null },
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: '6',
    type: 'content_approved',
    title: 'Content approved',
    description: '"Module 5: Advanced Patterns" approved for publication',
    actor: { name: 'Admin Team', avatar: null },
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
  },
  {
    id: '7',
    type: 'settings_change',
    title: 'Settings updated',
    description: 'Email notification settings changed',
    actor: { name: 'System Admin', avatar: null },
    timestamp: new Date(Date.now() - 120 * 60 * 1000),
  },
  {
    id: '8',
    type: 'user_signup',
    title: 'New user registered',
    description: 'charlie.brown@example.com signed up via Google',
    actor: { name: 'Charlie Brown', avatar: null },
    timestamp: new Date(Date.now() - 150 * 60 * 1000),
  },
  {
    id: '9',
    type: 'enrollment',
    title: 'Bulk enrollment',
    description: '15 users enrolled in enterprise training program',
    timestamp: new Date(Date.now() - 180 * 60 * 1000),
    metadata: { count: 15 },
  },
  {
    id: '10',
    type: 'error',
    title: 'Rate limit exceeded',
    description: 'API rate limit reached for /api/search',
    timestamp: new Date(Date.now() - 200 * 60 * 1000),
    metadata: { count: 47 },
  },
];

// ============================================================================
// HELPERS
// ============================================================================

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'user_signup':
      return { icon: UserPlus, color: 'text-brand-success', bg: 'bg-brand-success/10' };
    case 'course_published':
      return { icon: BookOpen, color: 'text-brand-blue', bg: 'bg-brand-primary/10' };
    case 'enrollment':
      return { icon: GraduationCap, color: 'text-brand-purple', bg: 'bg-brand-secondary/10' };
    case 'error':
      return { icon: AlertTriangle, color: 'text-brand-error', bg: 'bg-brand-error/10' };
    case 'content_approved':
      return { icon: FileCheck, color: 'text-teal-500', bg: 'bg-teal-500/10' };
    case 'message':
      return { icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-500/10' };
    case 'certificate':
      return { icon: Award, color: 'text-amber-500', bg: 'bg-brand-warning/10' };
    case 'settings_change':
      return { icon: Settings, color: 'text-muted-foreground', bg: 'bg-muted' };
  }
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function getActivityTypeName(type: ActivityType): string {
  switch (type) {
    case 'user_signup':
      return 'User Signups';
    case 'course_published':
      return 'Course Publications';
    case 'enrollment':
      return 'Enrollments';
    case 'error':
      return 'Errors';
    case 'content_approved':
      return 'Content Approvals';
    case 'message':
      return 'Messages';
    case 'certificate':
      return 'Certificates';
    case 'settings_change':
      return 'Settings Changes';
  }
}

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

interface ActivityItemComponentProps {
  activity: ActivityItem;
}

function ActivityItemComponent({ activity }: ActivityItemComponentProps) {
  const config = getActivityIcon(activity.type);
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-4 py-3">
      <div
        className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', config.bg)}
      >
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight">{activity.title}</p>
            {activity.description && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {activity.description}
              </p>
            )}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatTime(activity.timestamp)}
          </span>
        </div>

        {activity.actor && (
          <div className="mt-2 flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={activity.actor.avatar ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {activity.actor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{activity.actor.name}</span>
          </div>
        )}

        {activity.metadata?.count && (
          <Badge variant="secondary" className="mt-2 text-xs">
            {activity.metadata.count} occurrences
          </Badge>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// RECENT ACTIVITY FEED COMPONENT
// ============================================================================

export function RecentActivityFeed() {
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [visibleCount, setVisibleCount] = React.useState(5);
  const [filters, setFilters] = React.useState<Set<ActivityType>>(
    new Set([
      'user_signup',
      'course_published',
      'enrollment',
      'error',
      'content_approved',
      'certificate',
    ]),
  );

  const fetchActivities = React.useCallback(async () => {
    setIsLoading(true);
    // In production, fetch from /api/admin/activity
    await new Promise((resolve) => setTimeout(resolve, 500));
    setActivities(mockActivities);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchActivities();

    // Poll every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [fetchActivities]);

  const toggleFilter = (type: ActivityType) => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const filteredActivities = activities.filter((a) => filters.has(a.type));
  const visibleActivities = filteredActivities.slice(0, visibleCount);
  const hasMore = visibleCount < filteredActivities.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
          <div className="flex items-center gap-2">
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <Badge variant="secondary" className="ml-2">
                    {filters.size}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Event Types</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(
                  [
                    'user_signup',
                    'course_published',
                    'enrollment',
                    'error',
                    'content_approved',
                    'certificate',
                    'settings_change',
                  ] as ActivityType[]
                ).map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={filters.has(type)}
                    onCheckedChange={() => toggleFilter(type)}
                  >
                    {getActivityTypeName(type)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh Button */}
            <Button variant="ghost" size="sm" onClick={fetchActivities}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No activity to display</p>
            <p className="text-sm text-muted-foreground/60">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {visibleActivities.map((activity) => (
                <ActivityItemComponent key={activity.id} activity={activity} />
              ))}
            </div>

            {hasMore && (
              <Button
                variant="ghost"
                className="mt-4 w-full"
                onClick={() => setVisibleCount((prev) => prev + 5)}
              >
                Load More
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
