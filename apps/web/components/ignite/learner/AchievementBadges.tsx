'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Crown,
  Flame,
  GraduationCap,
  Medal,
  Shield,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { BadgeRarity, LearnerBadge } from '@/types/lms/learner-dashboard';

export interface AchievementBadgesProps {
  /** List of earned badges */
  badges: LearnerBadge[];
  /** Maximum badges to display */
  maxItems?: number;
  /** Show "View All" link */
  showViewAll?: boolean;
  /** Additional class names */
  className?: string;
}

// Icon mapping for badge icons
const BADGE_ICONS: Record<string, LucideIcon> = {
  award: Award,
  'book-open': BookOpen,
  'check-circle': CheckCircle2,
  crown: Crown,
  flame: Flame,
  graduation: GraduationCap,
  medal: Medal,
  shield: Shield,
  star: Star,
  target: Target,
  trophy: Trophy,
  zap: Zap,
};

// Rarity color configs
const RARITY_STYLES: Record<
  BadgeRarity,
  { bg: string; border: string; glow: string; text: string }
> = {
  common: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    glow: '',
    text: 'text-slate-400',
  },
  rare: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    text: 'text-blue-400',
  },
  epic: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    text: 'text-purple-400',
  },
  legendary: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.4)]',
    text: 'text-amber-400',
  },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function BadgeCard({ badge }: { badge: LearnerBadge }) {
  const IconComponent = BADGE_ICONS[badge.icon] || Award;
  const styles = RARITY_STYLES[badge.rarity];

  return (
    <div
      className={cn(
        'relative flex flex-col items-center p-4 rounded-xl',
        'border transition-all duration-300',
        styles.bg,
        styles.border,
        styles.glow,
        'hover:scale-105 hover:z-10',
        'group cursor-default',
      )}
      role="listitem"
    >
      {/* Badge icon */}
      <div
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center mb-3',
          styles.bg,
          'border-2',
          styles.border,
        )}
      >
        <IconComponent className={cn('w-7 h-7', styles.text)} aria-hidden />
      </div>

      {/* Badge name */}
      <h4 className="text-sm font-semibold text-foreground text-center line-clamp-2">
        {badge.name}
      </h4>

      {/* Rarity label */}
      <Badge
        className={cn(
          'mt-2 text-xs capitalize',
          badge.rarity === 'legendary' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          badge.rarity === 'epic' && 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          badge.rarity === 'rare' && 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          badge.rarity === 'common' && 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        )}
        variant="outline"
      >
        {badge.rarity}
      </Badge>

      {/* Hover tooltip */}
      <div
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg',
          'bg-lxd-dark-bg border border-lxd-dark-border shadow-lg',
          'opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
          'w-48 z-20',
        )}
      >
        <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Earned</span>
          <span className="text-foreground">{formatDate(badge.earnedAt)}</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-muted-foreground">XP Reward</span>
          <span className="text-purple-400">+{badge.xpReward} XP</span>
        </div>
      </div>
    </div>
  );
}

/**
 * AchievementBadges - Grid display of earned achievement badges
 *
 * Features:
 * - Rarity-based styling (common, rare, epic, legendary)
 * - Hover tooltips with badge details
 * - Responsive grid layout
 * - Glow effects for rare badges
 */
export function AchievementBadges({
  badges,
  maxItems = 6,
  showViewAll = true,
  className,
}: AchievementBadgesProps) {
  // Sort by rarity (legendary first) and then by date (newest first)
  const sortedBadges = [...badges]
    .sort((a, b) => {
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
    })
    .slice(0, maxItems);

  const totalBadges = badges.length;
  const hiddenCount = Math.max(0, totalBadges - maxItems);

  return (
    <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Trophy className="w-5 h-5 text-amber-400" aria-hidden />
            Achievements
            {totalBadges > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {totalBadges} earned
              </Badge>
            )}
          </CardTitle>
          {showViewAll && totalBadges > maxItems && (
            <Link
              href="/ignite/learn/achievements"
              className="text-sm text-lxd-primary hover:text-lxd-primary/80 transition-colors"
            >
              View All
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {sortedBadges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-muted-foreground/50" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">No badges yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete courses and challenges to earn achievements
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            role="list"
            aria-label="Achievement badges"
          >
            {sortedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}

            {/* Show count of hidden badges */}
            {hiddenCount > 0 && (
              <Link
                href="/ignite/learn/achievements"
                className={cn(
                  'flex flex-col items-center justify-center p-4 rounded-xl',
                  'border border-dashed border-muted-foreground/30',
                  'hover:border-lxd-primary/50 hover:bg-lxd-primary/5',
                  'transition-colors',
                )}
              >
                <span className="text-2xl font-bold text-muted-foreground">+{hiddenCount}</span>
                <span className="text-xs text-muted-foreground">more badges</span>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * AchievementBadgesSkeleton - Loading placeholder
 */
export function AchievementBadgesSkeleton() {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-muted/30 animate-pulse" />
          <div className="h-5 w-32 bg-muted/30 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-4 rounded-xl bg-muted/10 border border-muted/20"
            >
              <div className="w-14 h-14 rounded-full bg-muted/20 animate-pulse mb-3" />
              <div className="h-4 w-20 bg-muted/20 rounded animate-pulse" />
              <div className="h-5 w-16 bg-muted/20 rounded-full animate-pulse mt-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
