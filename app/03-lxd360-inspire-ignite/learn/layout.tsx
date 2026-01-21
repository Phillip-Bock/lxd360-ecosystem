'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { IgniteHeader } from '@/components/ignite/navigation/header';
import { LMSSidebar } from '@/components/lms/navigation/LMSSidebar';
import { cn } from '@/lib/utils';

interface LearnLayoutProps {
  children: ReactNode;
}

/**
 * Layout for all /learn/* routes
 * Provides sidebar navigation and header
 */
export default function LearnLayout({ children }: LearnLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock user data - TODO: Replace with actual user from context
  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    level: 12,
    xp: 2450,
    xpToNextLevel: 3000,
    streak: 7,
  };

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
