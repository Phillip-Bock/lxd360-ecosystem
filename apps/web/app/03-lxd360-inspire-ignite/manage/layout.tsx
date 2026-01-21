'use client';

export const dynamic = 'force-dynamic';

import {
  BarChart3,
  Building,
  FileText,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IgniteHeader } from '@/components/ignite/navigation/header';
import { cn } from '@/lib/utils';

// TODO: Add RBAC check - require admin role
// import { useRBAC } from '@/lib/hooks/useRBAC';

const manageNavItems = [
  {
    label: 'Dashboard',
    href: '/03-lxd360-inspire-ignite/manage/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Users',
    href: '/03-lxd360-inspire-ignite/manage/users',
    icon: Users,
  },
  {
    label: 'Organizations',
    href: '/03-lxd360-inspire-ignite/manage/organizations',
    icon: Building,
  },
  {
    label: 'Compliance',
    href: '/03-lxd360-inspire-ignite/manage/compliance',
    icon: Shield,
  },
  {
    label: 'Reports',
    href: '/03-lxd360-inspire-ignite/manage/reports',
    icon: FileText,
  },
  {
    label: 'Analytics',
    href: '/03-lxd360-inspire-ignite/manage/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/03-lxd360-inspire-ignite/manage/settings',
    icon: Settings,
  },
];

/**
 * Manage layout - Admin dashboard with RBAC protection
 */
export default function ManageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // TODO: Implement RBAC check
  // const { hasRole } = useRBAC();
  // if (!hasRole(['admin'])) {
  //   redirect('/03-lxd360-inspire-ignite/learn');
  // }

  return (
    <div className="min-h-screen bg-lxd-dark-bg">
      <IgniteHeader />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-3.5rem)] bg-lxd-dark-surface border-r border-lxd-dark-border">
          <div className="p-4 border-b border-lxd-dark-border">
            <span className="text-xs font-medium text-lxd-purple uppercase tracking-wider">
              Admin Console
            </span>
          </div>
          <nav className="p-4 space-y-1">
            {manageNavItems.map((item) => {
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
