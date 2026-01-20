'use client';

import {
  Activity,
  AlertTriangle,
  BookOpen,
  Briefcase,
  ChevronDown,
  Cog,
  Database,
  FileCheck,
  FileText,
  Flag,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/core/utils';

// ============================================================================
// TYPES
// ============================================================================

interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: string;
}

interface AdminSidebarProps {
  user: AdminUser;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

const navigationGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
      },
      {
        title: 'Activity',
        href: '/admin/activity',
        icon: Activity,
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'Courses',
        href: '/admin/courses',
        icon: BookOpen,
      },
      {
        title: 'Content Approval',
        href: '/admin/content-approval',
        icon: FileCheck,
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        title: 'Errors',
        href: '/admin/errors',
        icon: AlertTriangle,
      },
      {
        title: 'Jobs',
        href: '/admin/jobs',
        icon: Briefcase,
      },
      {
        title: 'Logs',
        href: '/admin/logs',
        icon: FileText,
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Settings',
        href: '/admin/settings',
        icon: Cog,
      },
      {
        title: 'Feature Flags',
        href: '/admin/feature-flags',
        icon: Flag,
      },
      {
        title: 'Backups',
        href: '/admin/backups',
        icon: Database,
      },
    ],
  },
];

// ============================================================================
// NAVIGATION ITEM COMPONENT
// ============================================================================

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}

function NavLink({ item, isActive, onClick }: NavLinkProps): React.JSX.Element {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.title}</span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ============================================================================
// NAVIGATION GROUP COMPONENT
// ============================================================================

interface NavGroupComponentProps {
  group: NavGroup;
  pathname: string;
  defaultOpen?: boolean;
  onLinkClick?: () => void;
}

function NavGroupComponent({
  group,
  pathname,
  defaultOpen = true,
  onLinkClick,
}: NavGroupComponentProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <span>{group.title}</span>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1">
        {group.items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            onClick={onLinkClick}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// SIDEBAR CONTENT COMPONENT
// ============================================================================

interface SidebarContentProps {
  user: AdminUser;
  pathname: string;
  onLinkClick?: () => void;
}

function SidebarContent({ user, pathname, onLinkClick }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo / Branding */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span>LXP360 Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-4">
          {navigationGroups.map((group) => (
            <NavGroupComponent
              key={group.title}
              group={group}
              pathname={pathname}
              onLinkClick={onLinkClick}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.role}</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="ghost" size="icon" className="h-8 w-8">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADMIN SIDEBAR COMPONENT
// ============================================================================

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-background lg:block">
        <SidebarContent user={user} pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-4 top-3 z-50 lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent
            user={user}
            pathname={pathname}
            onLinkClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
