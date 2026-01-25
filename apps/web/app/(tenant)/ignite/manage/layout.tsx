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
import { RouteGuard } from '@/components/rbac';
import { cn } from '@/lib/utils';

const manageNavItems = [
  {
    label: 'Dashboard',
    href: '/(tenant)/ignite/manage/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Users',
    href: '/(tenant)/ignite/manage/users',
    icon: Users,
  },
  {
    label: 'Organizations',
    href: '/(tenant)/ignite/manage/organizations',
    icon: Building,
  },
  {
    label: 'Compliance',
    href: '/(tenant)/ignite/manage/compliance',
    icon: Shield,
  },
  {
    label: 'Reports',
    href: '/(tenant)/ignite/manage/reports',
    icon: FileText,
  },
  {
    label: 'Analytics',
    href: '/(tenant)/ignite/manage/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/(tenant)/ignite/manage/settings',
    icon: Settings,
  },
];

/**
 * Manage Layout - Admin Console with RBAC protection
 *
 * Uses HARD BLOCK pattern (RouteGuard) to redirect unauthorized users.
 * Requires Manager+ access (level 50+)
 */
export default function ManageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RouteGuard minLevel={50} redirectTo="/ignite/learn">
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
    </RouteGuard>
  );
}
