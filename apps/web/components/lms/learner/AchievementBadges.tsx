'use client';

import { Award, ChevronRight, Lock, Star, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Badge {
  /** Unique badge ID */
  id: string;
  /** Badge name */
  name: string;
  /** Badge description */
  description: string;
  /** Badge icon type */
  iconType: 'trophy' | 'star' | 'award' | 'zap';
  /** Badge tier/rarity */
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  /** Whether the badge is earned */
  earned: boolean;
  /** Date earned (if earned) */
  earnedAt?: Date;
  /** XP reward for earning */
  xpReward: number;
  /** Progress toward earning (0-100, for unearned badges) */
  progress?: number;
}

export interface AchievementBadgesProps {
  /** List of badges */
  badges: Badge[];
  /** Maximum badges to display */
  maxItems?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

const badgeIcons = {
  trophy: Trophy,
  star: Star,
  award: Award,
  zap: Zap,
};

const tierStyles = {
  bronze: {
    bg: 'bg-amber-700/20',
    border: 'border-amber-700/50',
    text: 'text-amber-600',
    glow: 'shadow-amber-700/20',
  },
  silver: {
    bg: 'bg-slate-400/20',
    border: 'border-slate-400/50',
    text: 'text-slate-300',
    glow: 'shadow-slate-400/20',
  },
  gold: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-500',
    glow: 'shadow-yellow-500/30',
  },
  platinum: {
    bg: 'bg-cyan-400/20',
    border: 'border-cyan-400/50',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-400/30',
  },
};

function formatEarnedDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function BadgeItem({ badge }: { badge: Badge }) {
  const Icon = badgeIcons[badge.iconType];
  const tierStyle = tierStyles[badge.tier];

  return (
    <div
      className={cn(
        'flex flex-col items-center p-3 rounded-xl border transition-all',
        badge.earned
          ? cn(tierStyle.bg, tierStyle.border, 'hover:shadow-lg', tierStyle.glow)
          : 'bg-muted/10 border-muted/20 opacity-60',
      )}
    >
      {/* Badge icon */}
      <div
        className={cn(
          'relative flex items-center justify-center w-12 h-12 rounded-full mb-2',
          badge.earned ? cn(tierStyle.bg, tierStyle.text) : 'bg-muted/20 text-muted-foreground',
        )}
      >
        {badge.earned ? (
          <Icon className="w-6 h-6" aria-hidden />
        ) : (
          <Lock className="w-5 h-5" aria-hidden />
        )}
        {badge.earned && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white">
            <Star className="w-3 h-3 fill-current" aria-hidden />
          </div>
        )}
      </div>

      {/* Badge name */}
      <h4
        className={cn(
          'text-sm font-semibold text-center line-clamp-1',
          badge.earned ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {badge.name}
      </h4>

      {/* Status/XP */}
      {badge.earned ? (
        <div className="flex flex-col items-center mt-1">
          <span className="text-xs text-purple-400">+{badge.xpReward} XP</span>
          {badge.earnedAt && (
            <span className="text-xs text-muted-foreground mt-0.5">
              {formatEarnedDate(badge.earnedAt)}
            </span>
          )}
        </div>
      ) : (
        <div className="mt-1">
          {badge.progress !== undefined && badge.progress > 0 ? (
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className="h-full bg-lxd-primary rounded-full transition-all"
                  style={{ width: `${badge.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{badge.progress}%</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Locked</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * AchievementBadges - Grid of earned and available badges
 *
 * Features:
 * - Visual tier styling (bronze, silver, gold, platinum)
 * - Earned vs locked state
 * - Progress indicator for in-progress badges
 * - XP rewards display
 */
export function AchievementBadges({
  badges,
  maxItems = 6,
  isLoading = false,
  className,
}: AchievementBadgesProps) {
  if (isLoading) {
    return <AchievementBadgesSkeleton className={className} maxItems={maxItems} />;
  }

  // Sort: earned first (by date desc), then unearned by progress
  const sortedBadges = [...badges]
    .sort((a, b) => {
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      if (a.earned && b.earned && a.earnedAt && b.earnedAt) {
        return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
      }
      return (b.progress ?? 0) - (a.progress ?? 0);
    })
    .slice(0, maxItems);

  const earnedCount = badges.filter((b) => b.earned).length;

  if (sortedBadges.length === 0) {
    return (
      <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-lxd-primary" aria-hidden />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-3">
              <Award className="h-6 w-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground">No badges available yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete courses to unlock achievements
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-lxd-primary" aria-hidden />
            Achievements
            <span className="text-sm font-normal text-muted-foreground">
              ({earnedCount}/{badges.length})
            </span>
          </CardTitle>
          <Link
            href="/ignite/learn/achievements"
            className="text-sm text-muted-foreground hover:text-lxd-primary transition-colors flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {sortedBadges.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * AchievementBadgesSkeleton - Loading placeholder
 */
export function AchievementBadgesSkeleton({
  className,
  maxItems = 6,
}: {
  className?: string;
  maxItems?: number;
}) {
  return (
    <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-muted/30 animate-pulse" />
          <div className="h-5 w-32 bg-muted/30 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: maxItems }).map((_, i) => (
            <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-muted/10">
              <div className="w-12 h-12 rounded-full bg-muted/30 animate-pulse mb-2" />
              <div className="h-4 w-16 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-12 bg-muted/30 rounded animate-pulse mt-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
