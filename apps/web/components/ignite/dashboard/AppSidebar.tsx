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
  Database,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
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

/**
 * CV-006: Navigation items with phantom routes removed
 * Sub-routes that don't have implemented pages have been removed to prevent 404s.
 * When pages are implemented, add them back to the subs array.
 */
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
    // CV-006: Removed phantom routes - /courses/new and /courses/templates don't exist yet
    // Re-add when pages are implemented:
    // subs: [
    //   { label: 'All Courses', href: '/ignite/courses' },
    //   { label: 'Create New', href: '/ignite/courses/new' },
    //   { label: 'Templates', href: '/ignite/courses/templates' },
    // ],
  },
  {
    id: 'learners',
    label: 'Learners',
    icon: Users,
    href: '/ignite/learners',
    // CV-006: Removed phantom routes - /learners/groups and /learners/enrollments don't exist yet
    // Re-add when pages are implemented:
    // subs: [
    //   { label: 'All Learners', href: '/ignite/learners' },
    //   { label: 'Groups', href: '/ignite/learners/groups' },
    //   { label: 'Enrollments', href: '/ignite/learners/enrollments' },
    // ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/ignite/analytics',
    // CV-006: Removed phantom routes - /analytics/engagement and /analytics/completion don't exist yet
    // Re-add when pages are implemented:
    // subs: [
    //   { label: 'Overview', href: '/ignite/analytics' },
    //   { label: 'Engagement', href: '/ignite/analytics/engagement' },
    //   { label: 'Completion', href: '/ignite/analytics/completion' },
    // ],
  },
  {
    id: 'gradebook',
    label: 'Gradebook',
    icon: ClipboardList,
    href: '/ignite/gradebook',
  },
  {
    id: 'lrs',
    label: 'Learning Records',
    icon: Database,
    href: '/ignite/lrs',
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
    // CV-006: Removed phantom routes - settings sub-pages don't exist yet
    // Re-add when pages are implemented:
    // subs: [
    //   { label: 'Profile', href: '/ignite/settings/profile' },
    //   { label: 'Notifications', href: '/ignite/settings/notifications' },
    //   { label: 'Preferences', href: '/ignite/settings/preferences' },
    // ],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    href: '/ignite/billing',
  },
];

// ============================================================================
// SKELETON LOADER
// ============================================================================

function SidebarSkeleton() {
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-lg" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-xs tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[1, 2, 3, 4, 5].map((i) => (
                <SidebarMenuItem key={i}>
                  <div className="flex items-center gap-2 px-2 py-2">
                    <Skeleton className="size-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <Skeleton className="size-8 rounded-lg" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

interface AppSidebarProps {
  user: User | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<string[]>(['courses']);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [persona, setPersona] = useState<Persona>('learner');

  // Load claims from Firebase ID token
  useEffect(() => {
    async function loadClaims() {
      if (!user) {
        setClaimsLoading(false);
        return;
      }

      try {
        // Force refresh to get latest claims
        const tokenResult = await user.getIdTokenResult(true);
        const loadedPersona = getPersonaFromClaims(tokenResult.claims);
        setPersona(loadedPersona);
      } catch (error) {
        console.error('Failed to load claims:', error);
        // Default to learner on error
        setPersona('learner');
      } finally {
        setClaimsLoading(false);
      }
    }

    loadClaims();
  }, [user]);

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

  // Show skeleton while loading claims
  if (claimsLoading) {
    return <SidebarSkeleton />;
  }

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
                {/* CV-003: Only show Account Settings to owners */}
                {persona === 'owner' && (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => router.push('/ignite/settings')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
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
