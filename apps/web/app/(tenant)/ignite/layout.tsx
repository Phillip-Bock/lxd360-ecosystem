'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/ignite/dashboard/AppSidebar';
import { BreadcrumbsHeader } from '@/components/ignite/dashboard/BreadcrumbsHeader';
import { IgniteCoach } from '@/components/ignite/player/IgniteCoach';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { logger } from '@/lib/logger';
import { canAccess, getPersonaFromClaims, type Persona } from '@/lib/rbac/personas';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

const log = logger.scope('IgniteLayout');

// Routes that use their own layout (don't apply admin sidebar)
const EXEMPT_ROUTES = ['/ignite/learn', '/ignite/learner'];

// Routes restricted to specific personas (CV-001: Route-level RBAC)
const ROUTE_TO_NAV_ID: Record<string, string> = {
  '/ignite/dashboard': 'dashboard',
  '/ignite/courses': 'courses',
  '/ignite/learners': 'learners',
  '/ignite/analytics': 'analytics',
  '/ignite/gradebook': 'gradebook',
  '/ignite/lrs': 'lrs',
  '/ignite/settings': 'settings',
  '/ignite/billing': 'billing',
};

export default function IgniteLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSafeAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [_persona, setPersona] = useState<Persona | null>(null);
  const [rbacChecked, setRbacChecked] = useState(false);

  // Check if this route should use its own layout
  const isExemptRoute = EXEMPT_ROUTES.some((route) => pathname.startsWith(route));

  // Auth guard + RBAC enforcement (CV-001: Route-level security)
  useEffect(() => {
    async function checkAuthAndRBAC() {
      // Not loaded yet
      if (loading) return;

      // Not authenticated - redirect to login
      if (!user) {
        router.push('/login');
        return;
      }

      // Email not verified - redirect to verification page
      if (!user.emailVerified) {
        router.push('/verify-email');
        return;
      }

      // Skip RBAC for exempt routes (learner pages have their own layout)
      if (isExemptRoute) {
        setRbacChecked(true);
        return;
      }

      try {
        // Get persona from Firebase custom claims
        const tokenResult = await user.getIdTokenResult(true);
        const userPersona = getPersonaFromClaims(tokenResult.claims);
        setPersona(userPersona);

        // Find the nav route ID for the current path
        const matchingRoute = Object.keys(ROUTE_TO_NAV_ID).find(
          (route) => pathname === route || pathname.startsWith(`${route}/`),
        );

        if (matchingRoute) {
          const navId = ROUTE_TO_NAV_ID[matchingRoute];

          // CV-001: Block access if persona cannot access this route
          if (!canAccess(userPersona, navId)) {
            // Redirect learners to learn page, others to dashboard
            if (userPersona === 'learner') {
              router.replace('/ignite/learn');
            } else {
              router.replace('/ignite/dashboard');
            }
            return;
          }
        }

        setRbacChecked(true);
      } catch (error) {
        log.error('RBAC check failed', error);
        // On error, allow access but default to learner restrictions
        setPersona('learner');
        setRbacChecked(true);
      }
    }

    checkAuthAndRBAC();
  }, [user, loading, router, pathname, isExemptRoute]);

  // Loading state (includes RBAC check for non-exempt routes)
  if (loading || (!isExemptRoute && !rbacChecked)) {
    return (
      <div className="flex h-screen w-full bg-background">
        <div className="w-64 bg-sidebar border-r border-sidebar-border animate-pulse" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Protect route - don't render if no user
  if (!user) {
    return null;
  }

  // For learner routes, just pass through to their own layout
  if (isExemptRoute) {
    return (
      <>
        {children}
        {/* Cortex AI Coach - floating bottom-right */}
        <IgniteCoach courseTitle="INSPIRE Ignite" learnerName={user.displayName || 'Learner'} />
      </>
    );
  }

  // Admin layout with sidebar
  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-full bg-background text-foreground">
        <AppSidebar user={user} />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-sm px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 px-2 flex-1">
              <BreadcrumbsHeader />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </SidebarInset>

        {/* Cortex AI Coach - floating bottom-right */}
        <IgniteCoach courseTitle="INSPIRE Ignite" learnerName={user.displayName || 'Learner'} />
      </div>
    </SidebarProvider>
  );
}
