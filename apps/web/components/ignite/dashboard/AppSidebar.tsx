'use client';

import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { canAccess, getPersonaFromClaims, PERSONA_CONFIG, type Persona } from '@/lib/rbac/personas';
import { cn } from '@/lib/utils';

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  subs?: {
    label: string;
    href: string;
  }[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/ignite/dashboard',
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: BookOpen,
    href: '/ignite/courses',
    subs: [
      { label: 'All Courses', href: '/ignite/courses' },
      { label: 'Create New', href: '/ignite/courses/new' },
      { label: 'Templates', href: '/ignite/courses/templates' },
    ],
  },
  {
    id: 'learners',
    label: 'Learners',
    icon: Users,
    href: '/ignite/learners',
    subs: [
      { label: 'All Learners', href: '/ignite/learners' },
      { label: 'Groups', href: '/ignite/learners/groups' },
      { label: 'Enrollments', href: '/ignite/learners/enrollments' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/ignite/analytics',
    subs: [
      { label: 'Overview', href: '/ignite/analytics' },
      { label: 'Engagement', href: '/ignite/analytics/engagement' },
      { label: 'Completion', href: '/ignite/analytics/completion' },
    ],
  },
  {
    id: 'gradebook',
    label: 'Gradebook',
    icon: ClipboardList,
    href: '/ignite/gradebook',
  },
  {
    id: 'authoring',
    label: 'Authoring Tool',
    icon: Wand2,
    href: '/inspire/projects',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/ignite/settings',
    subs: [
      { label: 'Profile', href: '/ignite/settings/profile' },
      { label: 'Notifications', href: '/ignite/settings/notifications' },
      { label: 'Preferences', href: '/ignite/settings/preferences' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    href: '/ignite/billing',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface AppSidebarProps {
  user: User | null;
  claims?: Record<string, unknown>;
}

export function AppSidebar({ user, claims }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<string[]>(['courses']);

  // Determine persona - default to 'owner' in development for testing
  const persona: Persona =
    process.env.NODE_ENV === 'development' ? 'owner' : getPersonaFromClaims(claims || {});

  const config = PERSONA_CONFIG[persona];

  // Filter nav items based on persona access
  const navItems = ALL_NAV_ITEMS.filter((item) => canAccess(persona, item.id));

  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        await signOut(auth);
        router.push('/login');
      }
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const getInitials = (name?: string | null, email?: string | null): string => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const isActive = (href: string) => {
    if (href === '/ignite/dashboard') {
      return pathname === href || pathname === '/ignite';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Header / Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/ignite/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--color-lxd-primary)] text-white">
                  <GraduationCap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-sidebar-foreground">LXD360</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">IGNITE</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-xs tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const hasSubmenu = item.subs && item.subs.length > 0;
                const isOpen = openMenus.includes(item.id);

                if (hasSubmenu) {
                  return (
                    <Collapsible
                      key={item.id}
                      open={isOpen}
                      onOpenChange={() => toggleMenu(item.id)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.label}
                            className={cn(
                              'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                              active &&
                                'bg-[var(--color-lxd-primary)]/10 text-[var(--color-lxd-primary)] border-l-2 border-[var(--color-lxd-primary)]',
                            )}
                          >
                            <Icon className="size-4" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-lxd-primary)]/20 text-[var(--color-lxd-primary)] text-xs font-medium">
                                {item.badge}
                              </span>
                            )}
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="size-4 text-sidebar-foreground/50" />
                            </motion.div>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <CollapsibleContent forceMount asChild>
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <SidebarMenuSub>
                                  {item.subs?.map((sub) => (
                                    <SidebarMenuSubItem key={sub.href}>
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={pathname === sub.href}
                                      >
                                        <Link href={sub.href}>{sub.label}</Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </motion.div>
                            </CollapsibleContent>
                          )}
                        </AnimatePresence>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                        active &&
                          'bg-[var(--color-lxd-primary)]/10 text-[var(--color-lxd-primary)] border-l-2 border-[var(--color-lxd-primary)]',
                      )}
                    >
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-lxd-primary)]/20 text-[var(--color-lxd-primary)] text-xs font-medium">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer / User Profile */}
      <SidebarFooter className="border-t border-sidebar-border bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="text-sidebar-foreground hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.photoURL || undefined}
                      alt={user?.displayName || 'User'}
                    />
                    <AvatarFallback className="rounded-lg bg-[var(--color-lxd-primary)] text-white text-xs">
                      {getInitials(user?.displayName, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-sidebar-foreground">
                      {user?.displayName || user?.email || 'Loading...'}
                    </span>
                    <Badge
                      variant="outline"
                      className="w-fit text-xs mt-0.5"
                      style={{ borderColor: config.color, color: config.color }}
                    >
                      {config.label}
                    </Badge>
                  </div>
                  <ChevronUp className="ml-auto size-4 text-sidebar-foreground/50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push('/ignite/settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
