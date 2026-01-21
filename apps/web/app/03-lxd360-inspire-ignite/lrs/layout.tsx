'use client';

export const dynamic = 'force-dynamic';

import {
  Activity,
  BarChart3,
  Database,
  FileSearch,
  LayoutDashboard,
  Settings,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IgniteHeader } from '@/components/ignite/navigation/header';
import { cn } from '@/lib/utils';

// TODO: Add RBAC check - require admin role
// import { useRBAC } from '@/lib/hooks/useRBAC';

const lrsNavItems = [
  {
    label: 'Dashboard',
    href: '/03-lxd360-inspire-ignite/lrs/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Statement Browser',
    href: '/03-lxd360-inspire-ignite/lrs/statements',
    icon: FileSearch,
  },
  {
    label: 'Analytics',
    href: '/03-lxd360-inspire-ignite/lrs/analytics',
    icon: BarChart3,
  },
  {
    label: 'Activity Stream',
    href: '/03-lxd360-inspire-ignite/lrs/activity',
    icon: Activity,
  },
  {
    label: 'Pipeline',
    href: '/03-lxd360-inspire-ignite/lrs/pipeline',
    icon: Zap,
  },
  {
    label: 'Settings',
    href: '/03-lxd360-inspire-ignite/lrs/settings',
    icon: Settings,
  },
];

/**
 * LRS layout - Learning Record Store dashboard
 */
export default function LRSLayout({ children }: { children: React.ReactNode }) {
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
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
              <span className="text-sm font-medium text-brand-primary">INSPIRE LRS</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Learning Record Store</p>
          </div>
          <nav className="p-4 space-y-1">
            {lrsNavItems.map((item) => {
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
