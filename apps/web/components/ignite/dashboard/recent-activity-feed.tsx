'use client';

import { motion } from 'framer-motion';
import { Award, CheckCircle2, FileText, MessageSquare, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export type ActivityType = 'enrollment' | 'completion' | 'submission' | 'message' | 'certificate';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    courseName?: string;
    learnerName?: string;
  };
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'enrollment',
    title: 'New Enrollment',
    description: 'Sarah Chen joined "Leadership Fundamentals"',
    timestamp: '2 hours ago',
    metadata: {
      courseName: 'Leadership Fundamentals',
      learnerName: 'Sarah Chen',
    },
  },
  {
    id: 'act-2',
    type: 'completion',
    title: 'Course Completed',
    description: 'Mike Johnson finished "Safety Training 2026"',
    timestamp: '5 hours ago',
    metadata: {
      courseName: 'Safety Training 2026',
      learnerName: 'Mike Johnson',
    },
  },
  {
    id: 'act-3',
    type: 'submission',
    title: 'Assignment Submitted',
    description: 'Emily Davis submitted Module 3 Assessment',
    timestamp: '1 day ago',
    metadata: {
      learnerName: 'Emily Davis',
    },
  },
  {
    id: 'act-4',
    type: 'certificate',
    title: 'Certificate Issued',
    description: 'James Wilson earned "Data Privacy Expert"',
    timestamp: '1 day ago',
    metadata: {
      learnerName: 'James Wilson',
    },
  },
  {
    id: 'act-5',
    type: 'message',
    title: 'New Question',
    description: 'Anna Martinez asked about Module 2 content',
    timestamp: '2 days ago',
    metadata: {
      learnerName: 'Anna Martinez',
    },
  },
];

// ============================================================================
// HELPERS
// ============================================================================

function getActivityIcon(type: ActivityType) {
  const iconMap: Record<ActivityType, React.ReactNode> = {
    enrollment: <UserPlus className="h-4 w-4" />,
    completion: <CheckCircle2 className="h-4 w-4" />,
    submission: <FileText className="h-4 w-4" />,
    message: <MessageSquare className="h-4 w-4" />,
    certificate: <Award className="h-4 w-4" />,
  };
  return iconMap[type];
}

function getActivityColor(type: ActivityType) {
  const colorMap: Record<ActivityType, string> = {
    enrollment: 'bg-[var(--color-lxd-primary)]/20 text-[var(--color-lxd-primary)]',
    completion: 'bg-[var(--color-lxd-success)]/20 text-[var(--color-lxd-success)]',
    submission: 'bg-[var(--color-neural-purple)]/20 text-[var(--color-neural-purple)]',
    message: 'bg-[var(--color-lxd-secondary)]/20 text-[var(--color-lxd-secondary)]',
    certificate: 'bg-[var(--color-lxd-caution)]/20 text-[var(--color-lxd-caution)]',
  };
  return colorMap[type];
}

// ============================================================================
// COMPONENT
// ============================================================================

interface RecentActivityFeedProps {
  activities?: ActivityItem[];
  maxItems?: number;
}

export function RecentActivityFeed({
  activities = mockActivities,
  maxItems = 5,
}: RecentActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-border/50">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Latest updates from your courses</p>
      </div>

      <div className="p-4">
        <div className="space-y-1">
          {displayedActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg',
                'hover:bg-muted/30 transition-colors cursor-pointer',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
                  getActivityColor(activity.type),
                )}
              >
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{activity.timestamp}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {activities.length > maxItems && (
          <button
            type="button"
            className={cn(
              'w-full mt-3 py-2 text-sm font-medium',
              'text-[var(--color-lxd-primary)] hover:text-[var(--color-lxd-primary)]/80',
              'transition-colors',
            )}
          >
            View all activity
          </button>
        )}
      </div>
    </div>
  );
}

export default RecentActivityFeed;
