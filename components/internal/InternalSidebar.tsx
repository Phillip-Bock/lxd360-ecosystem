'use client';

import {
  BookMarked,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Code,
  Cog,
  DollarSign,
  FileText,
  Flag,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Scale,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type UserStatus = 'available' | 'brb' | 'away' | 'offline';

interface InternalUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: string;
  position?: string | null;
}

interface InternalSidebarProps {
  user: InternalUser;
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
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; bgColor: string }> = {
  available: {
    label: 'Available',
    color: 'bg-green-500',
    bgColor: 'bg-green-500/20',
  },
  brb: {
    label: 'BRB',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-500/20',
  },
  away: {
    label: 'Away',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-500/20',
  },
  offline: {
    label: 'Not On',
    color: 'bg-red-500',
    bgColor: 'bg-red-500/20',
  },
};

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

const navigationGroups: NavGroup[] = [
  {
    title: 'Executive',
    items: [
      {
        title: 'Command Center',
        href: '/command-center',
        icon: Gauge,
      },
      {
        title: 'CEO Dashboard',
        href: '/command-center/metrics',
        icon: TrendingUp,
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        title: 'Admin Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
      },
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'Tenants',
        href: '/admin/tenants',
        icon: Building2,
      },
      {
        title: 'Billing',
        href: '/admin/billing',
        icon: DollarSign,
      },
      {
        title: 'Support Tickets',
        href: '/admin/support-tickets',
        icon: Ticket,
      },
    ],
  },
  {
    title: 'Departments',
    items: [
      {
        title: 'Sales',
        href: '/sales',
        icon: Briefcase,
      },
      {
        title: 'Legal',
        href: '/legal',
        icon: Scale,
      },
      {
        title: 'Finance',
        href: '/finance',
        icon: DollarSign,
      },
      {
        title: 'Engineering',
        href: '/engineering',
        icon: Code,
      },
    ],
  },
  {
    title: 'Resources',
    items: [
      {
        title: 'Company Wiki',
        href: '/company-wiki',
        icon: BookMarked,
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
        title: 'Logs',
        href: '/admin/logs',
        icon: FileText,
      },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] || fullName;
}

function formatRoleDisplay(role: string): string {
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================================
// STATUS INDICATOR COMPONENT
// ============================================================================

interface StatusIndicatorProps {
  status: UserStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

function StatusIndicator({
  status,
  showLabel = true,
  size = 'md',
}: StatusIndicatorProps): React.JSX.Element {
  const config = STATUS_CONFIG[status];
  const dotSize = size === 'sm' ? 'h-2 w-2' : 'h-3 w-3';

  return (
    <div className="flex items-center gap-2">
      <span className={cn('rounded-full', config.color, dotSize)} />
      {showLabel && <span className="text-xs text-muted-foreground">{config.label}</span>}
    </div>
  );
}

// ============================================================================
// NAVIGATION ITEM COMPONENT
// ============================================================================

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

function NavLink({ item, isActive, isCollapsed, onClick }: NavLinkProps): React.JSX.Element {
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent',
        isCollapsed && 'justify-center px-2',
      )}
    >
      <Icon className={cn('shrink-0', isCollapsed ? 'h-5 w-5' : 'h-4 w-4')} />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.title}
          {item.badge && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

// ============================================================================
// NAVIGATION GROUP COMPONENT
// ============================================================================

interface NavGroupComponentProps {
  group: NavGroup;
  pathname: string;
  isCollapsed: boolean;
  defaultOpen?: boolean;
  onLinkClick?: () => void;
}

function NavGroupComponent({
  group,
  pathname,
  isCollapsed,
  defaultOpen = true,
  onLinkClick,
}: NavGroupComponentProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  // When collapsed, show only icons without group headers
  if (isCollapsed) {
    return (
      <div className="space-y-1 py-2">
        {group.items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            isCollapsed={isCollapsed}
            onClick={onLinkClick}
          />
        ))}
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center justify-between',
            'rounded-lg border border-border/50 bg-muted/30',
            'px-3 py-2 text-xs font-semibold uppercase tracking-wider',
            'text-muted-foreground hover:bg-muted hover:text-foreground',
            'transition-colors duration-200',
          )}
        >
          <span>{group.title}</span>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pt-1">
        {group.items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            isCollapsed={isCollapsed}
            onClick={onLinkClick}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// USER SECTION COMPONENT
// ============================================================================

interface UserSectionProps {
  user: InternalUser;
  status: UserStatus;
  onStatusChange: (status: UserStatus) => void;
  isCollapsed: boolean;
}

function UserSection({
  user,
  status,
  onStatusChange,
  isCollapsed,
}: UserSectionProps): React.JSX.Element {
  const [greeting, setGreeting] = React.useState('Hello');
  const firstName = getFirstName(user.name);
  const roleDisplay = formatRoleDisplay(user.role);

  // Update greeting after mount to prevent hydration mismatch
  React.useEffect(() => {
    setGreeting(getTimeBasedGreeting());
  }, []);

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-3 border-t p-3">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={user.avatar ?? undefined} alt={user.name} className="rounded-lg" />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-1">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.position ?? roleDisplay}</p>
            </div>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center justify-center">
              <span className={cn('h-3 w-3 rounded-full', STATUS_CONFIG[status].color)} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end">
            {(Object.keys(STATUS_CONFIG) as UserStatus[]).map((s) => (
              <DropdownMenuItem key={s} onClick={() => onStatusChange(s)}>
                <StatusIndicator status={s} size="sm" />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <form action="/api/auth/signout" method="POST">
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </form>
          </TooltipTrigger>
          <TooltipContent side="right">Sign out</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="border-t p-4 space-y-4">
      {/* Greeting */}
      <p className="text-sm text-muted-foreground">
        {greeting}, <span className="font-semibold text-foreground">{firstName}</span>
      </p>

      {/* User Info */}
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 rounded-lg shrink-0">
          <AvatarImage
            src={user.avatar ?? undefined}
            alt={user.name}
            className="rounded-lg object-cover"
          />
          <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-1">
          {/* Position */}
          <p className="text-xs text-muted-foreground truncate">{user.position ?? 'Team Member'}</p>

          {/* Status + Role */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity"
              >
                <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_CONFIG[status].color)} />
                <span className="text-muted-foreground">{roleDisplay}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(Object.keys(STATUS_CONFIG) as UserStatus[]).map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={cn(status === s && 'bg-muted')}
                >
                  <StatusIndicator status={s} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Logout Button */}
      <form action="/api/auth/signout" method="POST">
        <Button
          type="submit"
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </form>
    </div>
  );
}

// ============================================================================
// SIDEBAR CONTENT COMPONENT
// ============================================================================

interface SidebarContentProps {
  user: InternalUser;
  pathname: string;
  isCollapsed: boolean;
  onCollapse: () => void;
  status: UserStatus;
  onStatusChange: (status: UserStatus) => void;
  onLinkClick?: () => void;
}

function SidebarContent({
  user,
  pathname,
  isCollapsed,
  onCollapse,
  status,
  onStatusChange,
  onLinkClick,
}: SidebarContentProps): React.JSX.Element {
  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Header with Logo and Hamburger */}
        <div
          className={cn(
            'flex items-center border-b h-16',
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4',
          )}
        >
          {!isCollapsed && (
            <Link href="/command-center" className="flex items-center gap-3">
              <div className="relative h-8 w-8 shrink-0">
                <Image
                  src="/lxd360-logo.png"
                  alt="LXD360"
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
              <span className="font-semibold text-foreground">Command Center</span>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className={cn('h-9 w-9 shrink-0', isCollapsed && 'mx-auto')}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
          </Button>
        </div>

        {/* Collapsed Logo */}
        {isCollapsed && (
          <div className="flex justify-center py-4 border-b">
            <Link href="/command-center">
              <div className="relative h-8 w-8">
                <Image
                  src="/lxd360-logo.png"
                  alt="LXD360"
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className={cn('space-y-3', isCollapsed && 'space-y-1')}>
            {navigationGroups.map((group) => (
              <NavGroupComponent
                key={group.title}
                group={group}
                pathname={pathname}
                isCollapsed={isCollapsed}
                onLinkClick={onLinkClick}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <UserSection
          user={user}
          status={status}
          onStatusChange={onStatusChange}
          isCollapsed={isCollapsed}
        />
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// INTERNAL SIDEBAR COMPONENT
// ============================================================================

export function InternalSidebar({ user }: InternalSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [status, setStatus] = React.useState<UserStatus>('available');

  // Auto-detect idle status (simplified - in production, use visibility API)
  React.useEffect(() => {
    let idleTimeout: NodeJS.Timeout;
    let awayTimeout: NodeJS.Timeout;

    const resetTimers = (): void => {
      clearTimeout(idleTimeout);
      clearTimeout(awayTimeout);

      // Only auto-update if currently in auto-detectable states
      if (status === 'away' || status === 'brb') {
        setStatus('available');
      }

      // Set to BRB after 5 minutes of inactivity
      idleTimeout = setTimeout(
        () => {
          if (status === 'available') {
            setStatus('brb');
          }
        },
        5 * 60 * 1000,
      );

      // Set to Away after 15 minutes of inactivity
      awayTimeout = setTimeout(
        () => {
          if (status === 'available' || status === 'brb') {
            setStatus('away');
          }
        },
        15 * 60 * 1000,
      );
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      document.addEventListener(event, resetTimers, { passive: true });
    });

    resetTimers();

    return (): void => {
      clearTimeout(idleTimeout);
      clearTimeout(awayTimeout);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimers);
      });
    };
  }, [status]);

  const handleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleStatusChange = React.useCallback((newStatus: UserStatus) => {
    setStatus(newStatus);
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r bg-background transition-all duration-300 lg:block',
          isCollapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent
          user={user}
          pathname={pathname}
          isCollapsed={isCollapsed}
          onCollapse={handleCollapse}
          status={status}
          onStatusChange={handleStatusChange}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40 lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent
            user={user}
            pathname={pathname}
            isCollapsed={false}
            onCollapse={() => setMobileOpen(false)}
            status={status}
            onStatusChange={handleStatusChange}
            onLinkClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
