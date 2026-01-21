'use client';

import { FileText, Folder, Image, PenSquare, Play } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import WidgetWrapper from './widget-wrapper';

type ActivityType = 'edit' | 'create' | 'publish' | 'upload' | 'view';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  target: string;
  targetHref: string;
  time: string;
}

// Mock data - replace with real activity tracking
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'edit',
    title: 'Edited',
    target: 'Lesson 3: Safety Procedures',
    targetHref: '/inspire-studio/project/1/lesson/3',
    time: '5 min ago',
  },
  {
    id: '2',
    type: 'upload',
    title: 'Uploaded',
    target: 'training-video.mp4',
    targetHref: '/library/media',
    time: '1 hour ago',
  },
  {
    id: '3',
    type: 'create',
    title: 'Created',
    target: 'Q1 Assessment Quiz',
    targetHref: '/inspire-studio/project/2',
    time: '3 hours ago',
  },
  {
    id: '4',
    type: 'publish',
    title: 'Published',
    target: 'Onboarding Course 2025',
    targetHref: '/inspire-studio/project/3',
    time: 'Yesterday',
  },
];

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  edit: PenSquare,
  create: Folder,
  publish: Play,
  upload: Image,
  view: FileText,
};

const activityColors: Record<ActivityType, string> = {
  edit: 'bg-blue-100 text-blue-600',
  create: 'bg-green-100 text-green-600',
  publish: 'bg-purple-100 text-purple-600',
  upload: 'bg-amber-100 text-amber-600',
  view: 'bg-gray-100 text-gray-600',
};

export default function RecentActivityWidget() {
  return (
    <WidgetWrapper
      title="Recent Activity"
      size={2}
      headerAction={
        <button type="button" className="text-xs text-white hover:text-white/80 transition-colors">
          Clear
        </button>
      }
    >
      <div className="space-y-3">
        {mockActivities.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="w-10 h-10 text-white/50 mx-auto mb-2" />
            <p className="text-sm text-white">No recent activity</p>
          </div>
        ) : (
          mockActivities.map((activity) => {
            const Icon = activityIcons[activity.type];
            return (
              <Link
                key={activity.id}
                href={activity.targetHref}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    activityColors[activity.type],
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="text-white/70">{activity.title}</span>{' '}
                    <span className="font-medium text-white transition-colors">
                      {activity.target}
                    </span>
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">{activity.time}</p>
                </div>
              </Link>
            );
          })
        )}

        {/* Resume hint */}
        {mockActivities.length > 0 && (
          <Link
            href={mockActivities[0].targetHref}
            className="flex items-center justify-center gap-2 p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Resume where you left off</span>
          </Link>
        )}
      </div>
    </WidgetWrapper>
  );
}
