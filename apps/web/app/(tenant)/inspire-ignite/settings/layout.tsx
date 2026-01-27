'use client';

import { Accessibility, Bell, Palette, ShieldAlert, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { getPersonaFromClaims, type Persona } from '@/lib/rbac/personas';
import { cn } from '@/lib/utils';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

const log = logger.scope('SettingsLayout');

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/ignite/settings/profile',
    label: 'Profile',
    icon: User,
    description: 'Your personal information',
  },
  {
    href: '/ignite/settings/notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Email and alert preferences',
  },
  {
    href: '/ignite/settings/accessibility',
    label: 'Accessibility',
    icon: Accessibility,
    description: 'Display and motion settings',
  },
  {
    href: '/ignite/settings/appearance',
    label: 'Appearance',
    icon: Palette,
    description: 'Theme and visual settings',
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useSafeAuth();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);

  // CV-002: Owner-only guard - Settings is restricted to owners
  useEffect(() => {
    async function checkOwnerAccess(): Promise<void> {
      if (loading || !user) return;

      try {
        const tokenResult = await user.getIdTokenResult(true);
        const userPersona = getPersonaFromClaims(tokenResult.claims);
        setPersona(userPersona);

        // Only owners can access settings
        if (userPersona !== 'owner') {
          router.replace('/ignite/dashboard');
          return;
        }

        setAccessChecked(true);
      } catch (error) {
        log.error('Settings access check failed', error);
        router.replace('/ignite/dashboard');
      }
    }

    checkOwnerAccess();
  }, [user, loading, router]);

  // Show loading while checking access
  if (loading || !accessChecked) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // CV-002: Block rendering if not owner (defense in depth)
  if (persona !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">Only account owners can access settings.</p>
      </div>
    );
  }

  // Redirect to profile if on base settings path
  if (pathname === '/ignite/settings') {
    router.replace('/ignite/settings/profile');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-64 shrink-0" aria-label="Settings navigation">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      isActive
                        ? 'bg-[var(--color-lxd-primary)]/10 text-[var(--color-lxd-primary)]'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={cn('h-5 w-5', isActive && 'text-[var(--color-lxd-primary)]')}
                      aria-hidden="true"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground hidden md:block">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
