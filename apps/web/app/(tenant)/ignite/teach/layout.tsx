'use client';

export const dynamic = 'force-dynamic';

import { BarChart3, BookOpen, GraduationCap, LayoutDashboard, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IgniteHeader } from '@/components/ignite/navigation/header';
import { cn } from '@/lib/utils';

// TODO: Add RBAC check - require instructor or admin role
// import { useRBAC } from '@/lib/hooks/useRBAC';

const teachNavItems = [
  {
    label: 'Dashboard',
    href: '/(tenant)/ignite/teach/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Gradebook',
    href: '/(tenant)/ignite/teach/gradebook',
    icon: GraduationCap,
  },
  {
    label: 'Courses',
    href: '/(tenant)/ignite/teach/courses',
    icon: BookOpen,
  },
  {
    label: 'Learners',
    href: '/(tenant)/ignite/teach/learners',
    icon: Users,
  },
  {
    label: 'Analytics',
    href: '/(tenant)/ignite/teach/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/(tenant)/ignite/teach/settings',
    icon: Settings,
  },
];

/**
 * Teach layout - Instructor dashboard with RBAC protection
 */
export default function TeachLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // TODO: Implement RBAC check
  // const { hasRole } = useRBAC();
  // if (!hasRole(['instructor', 'admin'])) {
  //   redirect('/(tenant)/ignite/learn');
  // }

  return (
    <div className="min-h-screen bg-lxd-dark-bg">
      <IgniteHeader />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-3.5rem)] bg-lxd-dark-surface border-r border-lxd-dark-border">
          <nav className="p-4 space-y-1">
            {teachNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-lxd-purple/20 text-lxd-purple'
                      : 'text-muted-foreground hover:text-brand-primary hover:bg-lxd-dark-border/50',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
