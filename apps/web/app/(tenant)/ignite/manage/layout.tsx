'use client';

export const dynamic = 'force-dynamic';

import {
  AlertCircle,
  BarChart3,
  Building,
  FileText,
  LayoutDashboard,
  Loader2,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IgniteHeader } from '@/components/ignite/navigation/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/firebase/useAuth';
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
 * Manage layout - Admin dashboard with RBAC protection
 * Only accessible to org_admin and super_admin roles
 */
export default function ManageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, loading: authLoading } = useAuth();

  // Check role - only org_admin or super_admin can access
  const userRole = profile?.role;
  const authorizedRoles = ['org_admin', 'super_admin'];
  const isAuthorized = userRole ? authorizedRoles.includes(userRole) : false;

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-lxd-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-lxd-purple" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized state if user doesn't have proper role
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-lxd-dark-bg flex items-center justify-center p-6">
        <Card className="max-w-md bg-lxd-dark-surface border-amber-500/30">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-center text-brand-primary">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You need administrator permissions to access the Admin Console.
            </p>
            <Button asChild>
              <Link href="/(tenant)/ignite/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
