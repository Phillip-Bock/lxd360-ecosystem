'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { AiCharacterChat } from '@/components/ai-character';
import { AppSidebar } from '@/components/ignite/dashboard/AppSidebar';
import { BreadcrumbsHeader } from '@/components/ignite/dashboard/BreadcrumbsHeader';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

// Routes that use their own layout (don't apply admin sidebar)
const EXEMPT_ROUTES = ['/ignite/learn', '/ignite/learner'];

export default function IgniteLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSafeAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if this route should use its own layout
  const isExemptRoute = EXEMPT_ROUTES.some((route) => pathname.startsWith(route));

  // Auth guard - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Loading state
  if (loading) {
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
        {/* AI Character Chat - floating bottom-right */}
        <AiCharacterChat tenantId={user.uid} />
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

        {/* AI Character Chat - floating bottom-right */}
        <AiCharacterChat tenantId={user.uid} />
      </div>
    </SidebarProvider>
  );
}
