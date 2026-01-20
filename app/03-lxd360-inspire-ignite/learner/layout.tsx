'use client';

import { Bell, ChevronDown, HelpCircle, LogOut, Search, Settings, User } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { LMSSidebar } from '@/components/lms/navigation/LMSSidebar';
import { cn } from '@/lib/utils';

interface LearnerLayoutProps {
  children: React.ReactNode;
}

export default function LearnerLayout({ children }: LearnerLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Mock user data - replace with actual user data
  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    avatar: null,
    level: 12,
    xp: 2450,
    xpToNextLevel: 3000,
    streak: 7,
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: 'New course available',
      message: 'Advanced Leadership Skills is now available',
      time: '2 min ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Assignment due soon',
      message: 'Complete Safety Training by Dec 15',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Badge earned!',
      message: 'You earned the "Quick Learner" badge',
      time: '3 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-lxd-dark-page">
      {/* Sidebar */}
      <LMSSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentStreak={user.streak}
        level={user.level}
        xp={user.xp}
        xpToNextLevel={user.xpToNextLevel}
      />

      {/* Main content area */}
      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'ml-20' : 'ml-64')}>
        {/* Top header bar */}
        <header className="sticky top-0 z-30 h-16 bg-lxd-dark-surface/95 backdrop-blur-xs border-b border-lxd-dark-border">
          <div className="flex items-center justify-between h-full px-6">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Search courses, skills, learning paths..."
                  className="w-full pl-10 pr-4 py-2 bg-lxd-dark-page border border-lxd-dark-border rounded-xl text-brand-primary placeholder-gray-500 focus:outline-hidden focus:border-lxd-purple/50 transition-colors"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] rounded bg-lxd-dark-border/50 text-muted-foreground">
                  /
                </kbd>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4 ml-6">
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-lxd-dark-card transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-brand-error rounded-full text-[10px] font-bold text-brand-primary flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {notificationsOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setNotificationsOpen(false)}
                      aria-label="Close notifications menu"
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-lxd-dark-surface border border-lxd-dark-border rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-lxd-dark-border">
                        <h3 className="font-semibold text-brand-primary">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              'p-4 border-b border-lxd-dark-border hover:bg-lxd-dark-card cursor-pointer transition-colors',
                              notification.unread && 'bg-lxd-purple/5',
                            )}
                          >
                            <div className="flex items-start gap-3">
                              {notification.unread && (
                                <span className="w-2 h-2 mt-1.5 rounded-full bg-lxd-purple shrink-0" />
                              )}
                              <div className={cn(!notification.unread && 'ml-5')}>
                                <p className="text-sm font-medium text-brand-primary">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-lxd-dark-border">
                        <Link
                          href="/lxp360/learner/notifications"
                          className="text-sm text-lxd-purple hover:underline"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-lxd-dark-card transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-brand-primary">{user.name}</p>
                    <p className="text-xs text-muted-foreground">Level {user.level}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-lxd-purple to-lxd-blue flex items-center justify-center text-brand-primary font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform',
                      userMenuOpen && 'rotate-180',
                    )}
                  />
                </button>

                {/* User menu dropdown */}
                {userMenuOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setUserMenuOpen(false)}
                      aria-label="Close user menu"
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-lxd-dark-surface border border-lxd-dark-border rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-lxd-dark-border">
                        <p className="text-sm font-medium text-brand-primary">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/lxp360/learner/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-lxd-dark-card transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link
                          href="/lxp360/learner/settings"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-lxd-dark-card transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <Link
                          href="/lxp360/learner/help"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-lxd-dark-card transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <HelpCircle className="w-4 h-4" />
                          Help & Support
                        </Link>
                      </div>
                      <div className="py-2 border-t border-lxd-dark-border">
                        <button
                          type="button"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:text-destructive/80 hover:bg-destructive/10 w-full transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
