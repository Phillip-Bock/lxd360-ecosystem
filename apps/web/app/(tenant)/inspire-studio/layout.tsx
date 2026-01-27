'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

export default function InspireLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSafeAuth();
  const router = useRouter();

  // Auth guard - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full bg-background items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading INSPIRE Studio...</p>
        </div>
      </div>
    );
  }

  // Protect route - don't render if no user
  if (!user) {
    return null;
  }

  return <div className="relative min-h-screen bg-background text-foreground">{children}</div>;
}
