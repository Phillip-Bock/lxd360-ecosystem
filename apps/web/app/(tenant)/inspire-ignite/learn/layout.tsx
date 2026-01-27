'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { IgniteHeader } from '@/components/ignite/navigation/header';
import { LMSSidebar } from '@/components/lms/navigation/LMSSidebar';
import { cn } from '@/lib/utils';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

interface LearnLayoutProps {
  children: ReactNode;
}

/**
 * Layout for all /learn/* routes
 * Provides sidebar navigation and header
 * CV-004: Now uses real user data from Firebase Auth
 */
export default function LearnLayout({ children }: LearnLayoutProps) {
  const { user: firebaseUser, loading } = useSafeAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // CV-004: Auth guard - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [firebaseUser, loading, router]);

  // CV-004: Build user object from real Firebase Auth data
  // XP/Level/Streak should be loaded from Firestore learner profile in production
  const user = {
    name: firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'Learner',
    email: firebaseUser?.email || '',
    // TODO(LXD-301): Load these from Firestore learner profile
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    streak: 0,
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-lxd-dark-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!firebaseUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-lxd-dark-page">
      <LMSSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentStreak={user.streak}
        level={user.level}
        xp={user.xp}
        xpToNextLevel={user.xpToNextLevel}
      />

      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'ml-20' : 'ml-64')}>
        <IgniteHeader user={user} />
        <main className="min-h-[calc(100vh-4rem)] p-6">{children}</main>
      </div>
    </div>
  );
}
