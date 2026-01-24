'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  ignite: 'Ignite',
  dashboard: 'Dashboard',
  courses: 'Courses',
  learners: 'Learners',
  analytics: 'Analytics',
  gradebook: 'Gradebook',
  settings: 'Settings',
  authoring: 'Authoring',
  billing: 'Billing',
  reports: 'Reports',
  messages: 'Messages',
};

export function BreadcrumbsHeader() {
  const pathname = usePathname();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Find ignite in the path
    const igniteIndex = segments.indexOf('ignite');
    if (igniteIndex === -1) return breadcrumbs;

    let currentPath = '';
    for (let i = 0; i <= igniteIndex; i++) {
      currentPath += `/${segments[i]}`;
    }

    // Add remaining segments after 'ignite'
    for (let i = igniteIndex + 1; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      const segment = segments[i];
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, href: currentPath });
    }

    // If no segments after ignite, show Dashboard
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({ label: 'Dashboard', href: '/ignite/dashboard' });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex items-center gap-2">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-border" />

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
        <Link
          href="/ignite/dashboard"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
        </Link>

        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-sm font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className={cn(
                  'text-sm text-muted-foreground hover:text-foreground transition-colors',
                )}
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

export default BreadcrumbsHeader;
