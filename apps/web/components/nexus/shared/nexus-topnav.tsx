'use client';

/**
 * Nexus Top Navigation
 * ====================
 * Top navigation bar for the LXD Nexus platform.
 */

import { Bell, ChevronRight, Monitor, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NexusTopNav(): React.JSX.Element {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications] = useState([
    {
      id: '1',
      title: 'New message from Sarah Chen',
      body: 'Looking forward to our session tomorrow!',
      time: '5m ago',
      read: false,
    },
    {
      id: '2',
      title: 'Session reminder',
      body: 'Your mentoring session starts in 1 hour',
      time: '55m ago',
      read: false,
    },
    {
      id: '3',
      title: 'Goal milestone completed',
      body: 'You completed "Learn React Hooks" milestone',
      time: '2h ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="h-16 bg-brand-surface dark:bg-brand-page border-b border-brand-default dark:border-brand-subtle flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 backdrop-blur-xs bg-brand-surface/90 dark:bg-brand-page/90">
        {/* Left side - Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-brand-muted dark:text-brand-muted hidden sm:inline">
            Organization
          </span>
          <ChevronRight className="w-4 h-4 text-brand-muted hidden sm:inline" />
          <span className="font-medium text-brand-primary dark:text-brand-primary">LXD Nexus</span>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex items-center gap-2 text-brand-muted hover:text-brand-primary dark:text-brand-muted dark:hover:text-brand-primary"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search...</span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-brand-default dark:border-brand-default bg-brand-surface dark:bg-brand-surface px-1.5 text-[10px] font-medium text-brand-muted dark:text-brand-muted">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* System Status */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-1.5 text-brand-muted"
          >
            <Monitor className="w-4 h-4" />
            <span className="text-xs">All Systems Operational</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-brand-muted dark:text-brand-muted" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-error rounded-full text-[10px] font-bold text-brand-primary flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-brand-muted">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-2 w-full">
                      {!notification.read && (
                        <span className="w-2 h-2 bg-brand-primary rounded-full mt-1.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${notification.read ? 'text-brand-secondary dark:text-brand-muted' : 'text-brand-primary dark:text-brand-primary'}`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-brand-muted truncate">{notification.body}</p>
                        <p className="text-[10px] text-brand-muted mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-sm text-brand-blue dark:text-brand-cyan font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command Palette / Search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search mentors, sessions, learning paths..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => setSearchOpen(false)}>
              <Search className="mr-2 h-4 w-4" />
              Find a Mentor
            </CommandItem>
            <CommandItem onSelect={() => setSearchOpen(false)}>
              <Search className="mr-2 h-4 w-4" />
              Schedule a Session
            </CommandItem>
            <CommandItem onSelect={() => setSearchOpen(false)}>
              <Search className="mr-2 h-4 w-4" />
              Browse Learning Paths
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Recent">
            <CommandItem>
              <Search className="mr-2 h-4 w-4" />
              React Advanced Patterns
            </CommandItem>
            <CommandItem>
              <Search className="mr-2 h-4 w-4" />
              Sarah Chen - Mentor
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
