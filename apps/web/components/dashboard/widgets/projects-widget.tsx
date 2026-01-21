'use client';

import { Folder, Plus } from 'lucide-react';
import Link from 'next/link';
import WidgetWrapper from './widget-wrapper';

// Mock data - replace with real data from API
const mockProjects = [
  {
    id: '1',
    name: 'Onboarding Course 2025',
    type: 'Course',
    updatedAt: '2 hours ago',
    progress: 75,
  },
  {
    id: '2',
    name: 'Safety Training',
    type: 'Course',
    updatedAt: 'Yesterday',
    progress: 100,
  },
  {
    id: '3',
    name: 'Q1 Sales Webinar',
    type: 'Webinar',
    updatedAt: '3 days ago',
    progress: 50,
  },
  {
    id: '4',
    name: 'Leadership Assessment',
    type: 'Assessment',
    updatedAt: '1 week ago',
    progress: 30,
  },
];

export default function ProjectsWidget() {
  return (
    <WidgetWrapper
      title="Recent Projects"
      size={2}
      headerAction={
        <Link
          href="/library/projects"
          className="text-xs text-white hover:text-white/80 transition-colors"
        >
          View All
        </Link>
      }
    >
      <div className="space-y-3">
        {mockProjects.map((project) => (
          <Link
            key={project.id}
            href={`/inspire-studio/project/${project.id}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{project.name}</p>
              <p className="text-xs text-white">
                {project.type} &middot; {project.updatedAt}
              </p>
            </div>
            <div className="w-16 shrink-0">
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--inspire-progress-track)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${project.progress}%`,
                    backgroundColor: 'var(--inspire-progress-fill)',
                  }}
                />
              </div>
              <p
                className="text-xs text-right mt-1"
                style={{ color: 'var(--inspire-text-on-card-secondary)' }}
              >
                {project.progress}%
              </p>
            </div>
          </Link>
        ))}

        {/* New Project Button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-white/30 hover:bg-white/10 text-white transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">New Project</span>
        </button>
      </div>
    </WidgetWrapper>
  );
}
