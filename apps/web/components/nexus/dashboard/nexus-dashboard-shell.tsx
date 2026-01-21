'use client';

// TODO(LXD-297): Replace with Firebase Auth user type
type User = {
  email?: string;
  user_metadata?: { avatar_url?: string; full_name?: string };
};

import {
  Briefcase,
  Calendar,
  ChevronRight,
  FlaskConical,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NexusDashboardShellProps {
  children: React.ReactNode;
  user: User;
  membership?: {
    membership_type: string;
    is_mentor: boolean;
    mentor_status?: string;
  } | null;
}

const navigationItems = [
  { href: '/nexus/dashboard', label: 'Dashboard', icon: Home },
  { href: '/nexus/match', label: 'My Match', icon: Target },
  { href: '/nexus/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/nexus/sandbox', label: 'Sandbox', icon: FlaskConical },
  { href: '/nexus/schedule', label: 'Schedule', icon: Calendar },
  { href: '/nexus/messages', label: 'Messages', icon: MessageSquare, badge: 3 },
];

const secondaryItems = [
  { href: '/nexus/settings', label: 'Settings', icon: Settings },
  { href: '/nexus/help', label: 'Help & Support', icon: HelpCircle },
];

export function NexusDashboardShell({
  children,
  user,
  membership,
}: NexusDashboardShellProps): React.JSX.Element {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userInitials = user.email?.substring(0, 2).toUpperCase() || 'U';
  const membershipLabel = membership?.is_mentor
    ? 'Mentor'
    : membership?.membership_type || 'Member';

  const SidebarContent = (): React.JSX.Element => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link href="/nexus" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">LXD Nexus</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.user_metadata?.full_name || user.email}
            </p>
            <Badge variant="secondary" className="text-xs">
              {membershipLabel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant={isActive ? 'secondary' : 'default'} className="h-5 min-w-5 text-xs">
                  {item.badge}
                </Badge>
              )}
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="p-4 border-t space-y-1">
        {secondaryItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/auth/logout">
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:border-r lg:bg-background">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 lg:hidden border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/nexus" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">LXD Nexus</span>
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="container mx-auto p-4 lg:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
