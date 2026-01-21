'use client';

/**
 * Nexus Sidebar Navigation
 * =========================
 * Main sidebar navigation for the LXD Nexus platform.
 */

// TODO(LXD-297): Replace with Firebase Auth user type
type User = {
  email?: string;
  user_metadata?: { avatar_url?: string; full_name?: string };
};

import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronDown,
  Gem,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  MessagesSquare,
  Settings,
  UserCircle,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/nexus/dashboard', icon: LayoutDashboard },
  { label: 'Find Mentors', href: '/nexus/mentors', icon: Users },
  { label: 'Messages', href: '/nexus/messages', icon: MessageSquare, badge: 3 },
  { label: 'Sessions', href: '/nexus/sessions', icon: Calendar },
  { label: 'Learning', href: '/nexus/learning', icon: BookOpen },
  { label: 'Community', href: '/nexus/community', icon: MessagesSquare },
  { label: 'Talent Graph', href: '/nexus/admin', icon: BarChart3, adminOnly: true },
];

interface NexusSidebarProps {
  user: User;
}

export function NexusSidebar({ user }: NexusSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mock gamification data - will be replaced with real data
  const gamificationData = {
    karma: 1250,
    streak: 12,
    level: 5,
  };

  const initials =
    user.user_metadata?.full_name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() ||
    user.email?.[0].toUpperCase() ||
    'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-brand-subtle">
        <Link href="/nexus/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <span className="text-brand-primary font-bold text-xl">N</span>
          </div>
          <span className="font-bold text-brand-primary text-lg tracking-tight">LXD Nexus</span>
        </Link>
      </div>

      {/* Gamification Stats */}
      <div className="px-4 py-4 border-b border-brand-subtle">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-linear-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-2 border border-amber-500/30">
            <div className="flex items-center gap-1.5 text-brand-warning text-xs font-medium">
              <Gem className="w-3 h-3" />
              <span>Karma</span>
            </div>
            <div className="text-brand-primary font-bold text-lg">
              {gamificationData.karma.toLocaleString()}
            </div>
          </div>
          <div className="bg-linear-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-2 border border-brand-primary/30">
            <div className="flex items-center gap-1.5 text-brand-cyan text-xs font-medium">
              <Zap className="w-3 h-3" />
              <span>Streak</span>
            </div>
            <div className="text-brand-primary font-bold text-lg">
              {gamificationData.streak} days
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          // Skip admin-only items for non-admins (will be replaced with proper RBAC check)
          if (item.adminOnly) {
            // TODO(LXD-351): Check if user has admin role via Firebase custom claims
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-primary text-brand-primary shadow-lg shadow-blue-900/50'
                  : 'text-brand-secondary hover:bg-brand-surface hover:text-brand-primary',
              )}
            >
              <Icon className={cn('w-5 h-5', item.adminOnly && 'text-brand-warning')} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'min-w-[20px] h-5 px-1.5 text-xs justify-center',
                    isActive
                      ? 'bg-brand-surface/20 text-brand-primary'
                      : 'bg-brand-primary/20 text-brand-cyan',
                  )}
                >
                  {item.badge}
                </Badge>
              )}
              {item.adminOnly && (
                <span className="text-[10px] bg-brand-warning/20 text-brand-warning px-1.5 py-0.5 rounded uppercase font-bold">
                  Admin
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-brand-subtle">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center gap-3 p-2 rounded-lg bg-brand-surface/50 border border-brand-default/50 hover:bg-brand-surface transition-colors"
            >
              <Avatar className="h-8 w-8 ring-2 ring-brand-primary">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-brand-surface-hover text-brand-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-medium text-brand-primary truncate">
                  {user.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-brand-muted truncate">Level {gamificationData.level}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-brand-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/nexus/profile" className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/nexus/profile/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/auth/logout" className="flex items-center gap-2 text-brand-error">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-brand-page text-brand-secondary flex-col fixed h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-brand-page border-brand-subtle">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
