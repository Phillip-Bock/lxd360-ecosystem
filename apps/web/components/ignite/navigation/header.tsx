'use client';

import { Bell, ChevronDown, HelpCircle, LogOut, Search, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface UserData {
  name: string;
  email: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
}

interface IgniteHeaderProps {
  user?: UserData;
}

// Default user for unauthenticated/loading state
const defaultUser: UserData = {
  name: 'Guest',
  email: 'guest@lxd360.com',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  streak: 0,
};

/**
 * INSPIRE Ignite header with search, notifications, and user menu
 */
export function IgniteHeader({ user = defaultUser }: IgniteHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Mock notifications - TODO: Replace with real data from Firestore
  const notifications = [
    {
      id: '1',
      title: 'New course available',
      message: 'Advanced Leadership Skills is now available',
      time: '2 min ago',
      unread: true,
    },
    {
      id: '2',
      title: 'Assignment due soon',
      message: 'Complete Safety Training by Dec 15',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: '3',
      title: 'Badge earned!',
      message: 'You earned the "Quick Learner" badge',
      time: '3 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-lxd-dark-surface/95 backdrop-blur-xs border-b border-lxd-dark-border">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="search"
              placeholder="Search courses, skills, learning paths..."
              className="w-full pl-10 pr-4 py-2 bg-lxd-dark-page border border-lxd-dark-border rounded-xl text-brand-primary placeholder-gray-500 focus:outline-hidden focus:border-lxd-purple/50 transition-colors"
              aria-label="Search courses"
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
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={notificationsOpen}
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 w-4 h-4 bg-brand-error rounded-full text-[10px] font-bold text-brand-primary flex items-center justify-center"
                  aria-hidden="true"
                >
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
                <div
                  className="absolute right-0 top-full mt-2 w-80 bg-lxd-dark-surface border border-lxd-dark-border rounded-xl shadow-xl z-50 overflow-hidden"
                  role="menu"
                  aria-label="Notifications"
                >
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
                        role="menuitem"
                        tabIndex={0}
                      >
                        <div className="flex items-start gap-3">
                          {notification.unread && (
                            <span
                              className="w-2 h-2 mt-1.5 rounded-full bg-lxd-purple shrink-0"
                              role="img"
                              aria-label="Unread"
                            />
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
                      href="/(tenant)/ignite/learn/notifications"
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
              aria-label="User menu"
              aria-expanded={userMenuOpen}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-brand-primary">{user.name}</p>
                <p className="text-xs text-muted-foreground">Level {user.level}</p>
              </div>
              <div
                className="w-9 h-9 rounded-full bg-linear-to-br from-lxd-purple to-lxd-blue flex items-center justify-center text-brand-primary font-semibold"
                aria-hidden="true"
              >
                {user.name.charAt(0)}
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-muted-foreground transition-transform',
                  userMenuOpen && 'rotate-180',
                )}
                aria-hidden="true"
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
                <div
                  className="absolute right-0 top-full mt-2 w-56 bg-lxd-dark-surface border border-lxd-dark-border rounded-xl shadow-xl z-50 overflow-hidden"
                  role="menu"
                  aria-label="User options"
                >
                  <div className="p-4 border-b border-lxd-dark-border">
                    <p className="text-sm font-medium text-brand-primary">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/(tenant)/ignite/learn/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-lxd-dark-card transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <User className="w-4 h-4" aria-hidden="true" />
                      My Profile
                    </Link>
                    <Link
                      href="/(tenant)/ignite/learn/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-lxd-dark-card transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4" aria-hidden="true" />
                      Settings
                    </Link>
                    <Link
                      href="/(tenant)/ignite/learn/help"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-lxd-dark-card transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <HelpCircle className="w-4 h-4" aria-hidden="true" />
                      Help & Support
                    </Link>
                  </div>
                  <div className="py-2 border-t border-lxd-dark-border">
                    <button
                      type="button"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:text-destructive/80 hover:bg-destructive/10 w-full transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
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
  );
}
