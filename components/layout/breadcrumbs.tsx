'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Map route segments to display labels
const ROUTE_LABELS: Record<string, string> = {
  'inspire-studio': 'INSPIRE Studio',
  'course-outline': 'Course Outline',
  'lesson-builder': 'Lesson Builder',
  'ai-course-builder': 'AI Course Builder',
  'inspire-lxd': 'INSPIRE LXD',
  'micro-learning': 'Micro Learning',
  'xr-course': 'XR Course',
  'question-builder': 'Question Builder',
  'survey-builder': 'Survey Builder',
  templates: 'Templates',
  webinar: 'Webinar',
  ilt: 'ILT Course',
  library: 'Library',
  media: 'Media',
  projects: 'Projects',
  themes: 'Themes',
  code: 'Code',
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on dashboard
  if (pathname === '/') return null;

  // Split path and filter empty segments
  const segments = pathname.split('/').filter(Boolean);

  // Build breadcrumb items
  const items = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const label =
      ROUTE_LABELS[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm py-2 px-4 bg-(--inspire-header-bg) border-b border-(--inspire-card-border-subtle)">
      {/* Home link */}
      <Link
        href="/"
        className="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
      </Link>

      {/* Breadcrumb items */}
      {items.map((item) => (
        <div key={item.href} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-white/40" />
          {item.isLast ? (
            <span className="text-white font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="text-white/70 hover:text-white transition-colors">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
