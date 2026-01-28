'use client';

import {
  BarChart2,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  type LucideIcon,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FeatureFlags, hasFeature } from '@/lib/core/feature-flags';
import { cn } from '@/lib/core/utils';
import { StreakCounter } from '../progress/streak-counter';
import { XPBar } from '../progress/xp-bar';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  feature?: keyof FeatureFlags;
  children?: { name: string; href: string }[];
}

interface LMSSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  currentStreak?: number;
  level?: number;
  xp?: number;
  xpToNextLevel?: number;
  className?: string;
}

const mainNavItems: NavItem[] = [
  { name: 'Home', href: '/lms', icon: Home },
  { name: 'My Learning', href: '/lms/my-learning', icon: BookOpen, badge: 3 },
  { name: 'Catalog', href: '/lms/catalog', icon: Compass },
  { name: 'Learning Paths', href: '/lms/learning-paths', icon: Target },
  { name: 'Skills', href: '/lms/skills', icon: Sparkles },
];

const engagementNavItems: NavItem[] = [
  { name: 'Achievements', href: '/lms/achievements', icon: Trophy },
  { name: 'Leaderboard', href: '/lms/leaderboard', icon: BarChart2, feature: 'gamification' },
  { name: 'Calendar', href: '/lms/calendar', icon: Calendar },
];

const socialNavItems: NavItem[] = [
  { name: 'Community', href: '/lms/community', icon: Users, feature: 'socialLearning' },
  {
    name: 'Discussions',
    href: '/lms/community/discussions',
    icon: MessageSquare,
    feature: 'socialLearning',
  },
  { name: 'Q&A', href: '/lms/community/questions', icon: HelpCircle, feature: 'socialLearning' },
];

const complianceNavItems: NavItem[] = [
  { name: 'Compliance', href: '/lms/compliance', icon: Shield, badge: 1 },
  { name: 'Transcript', href: '/lms/transcript', icon: FileText },
];

export function LMSSidebar({
  isCollapsed = false,
  onToggle,
  currentStreak = 0,
  level = 1,
  xp = 0,
  xpToNextLevel = 500,
  className,
}: LMSSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/lms') return pathname === '/lms';
    return pathname.startsWith(href);
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    // Check feature flag if specified
    if (item.feature && !hasFeature(item.feature)) {
      return null;
    }

    const Icon = item.icon;
    const isItemActive = isActive(item.href);

    return (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-xl',
          'transition-all duration-200',
          isItemActive
            ? 'bg-(--lxd-blue-light)/20 text-(--lxd-blue-light) border border-(--lxd-blue-light)/30'
            : 'text-muted-foreground hover:text-brand-primary hover:bg-(--lxd-blue-dark-700)/30',
        )}
      >
        <Icon
          className={cn(
            'shrink-0 transition-colors',
            isCollapsed ? 'w-6 h-6' : 'w-5 h-5',
            isItemActive
              ? 'text-(--lxd-blue-light)'
              : 'text-muted-foreground group-hover:text-brand-primary',
          )}
        />
        {!isCollapsed && (
          <>
            <span className="flex-1 font-medium">{item.name}</span>
            {item.badge && (
              <span
                className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  isItemActive
                    ? 'bg-(--lxd-blue-light)/30 text-(--lxd-blue-light)'
                    : 'bg-brand-error/20 text-brand-error',
                )}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => {
    const visibleItems = items.filter((item) => !item.feature || hasFeature(item.feature));
    if (visibleItems.length === 0) return null;

    return (
      <div className="mb-6">
        {!isCollapsed && (
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        )}
        <nav className="space-y-1">
          {visibleItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col',
        'bg-(--lxd-blue-dark-700) border-r border-(--lxd-blue-dark-700)/50',
        'transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64',
        className,
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-(--lxd-blue-dark-700)/50',
          isCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <Link href="/lms" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-(--lxd-blue-light) to-(--brand-secondary) flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-brand-primary" />
          </div>
          {!isCollapsed && <span className="text-lg font-bold text-brand-primary">LXP360</span>}
        </Link>
        {onToggle && !isCollapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-primary hover:bg-(--lxd-blue-dark-700)/30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search (when expanded) */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-(--lxd-blue-dark-700)/50">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-(--lxd-blue-dark-700) border border-(--lxd-blue-dark-700)/50">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              className="flex-1 bg-transparent text-sm text-brand-primary placeholder-muted-foreground outline-hidden"
            />
            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-(--lxd-blue-dark-700)/50 text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <NavSection title="Learning" items={mainNavItems} />
        <NavSection title="Engagement" items={engagementNavItems} />
        {hasFeature('socialLearning') && <NavSection title="Social" items={socialNavItems} />}
        <NavSection title="Records" items={complianceNavItems} />
      </div>

      {/* Bottom section */}
      <div className={cn('border-t border-(--lxd-blue-dark-700)/50 p-4', isCollapsed && 'px-3')}>
        {/* Streak */}
        {!isCollapsed ? (
          <div className="space-y-3">
            <StreakCounter
              currentStreak={currentStreak}
              size="sm"
              className="w-full justify-center"
            />
            <XPBar
              currentXP={xp}
              xpToNextLevel={xpToNextLevel}
              level={level}
              size="sm"
              showDetails={false}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <StreakCounter currentStreak={currentStreak} variant="compact" size="sm" />
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-(--lxd-blue-light) to-(--brand-secondary) flex items-center justify-center text-brand-primary font-bold text-sm">
              {level}
            </div>
          </div>
        )}

        {/* Settings link */}
        <div className="mt-4 pt-4 border-t border-(--lxd-blue-dark-700)/50">
          <Link
            href="/lms/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl',
              'text-muted-foreground hover:text-brand-primary hover:bg-(--lxd-blue-dark-700)/30',
              'transition-all duration-200',
              isCollapsed && 'justify-center',
            )}
          >
            <Settings className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium">Settings</span>}
          </Link>
        </div>
      </div>

      {/* Collapsed toggle */}
      {onToggle && isCollapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute -right-3 top-20 p-1.5 rounded-full bg-(--lxd-blue-dark-700) border border-(--lxd-blue-dark-700)/50 text-muted-foreground hover:text-brand-primary"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </aside>
  );
}

export default LMSSidebar;
