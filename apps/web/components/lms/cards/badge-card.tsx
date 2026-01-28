'use client';

import { Check, Lock } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { cn } from '@/lib/utils';
import type { Badge, EarnedBadge } from '@/types/lms';

interface BadgeCardProps {
  badge: Badge;
  earned?: EarnedBadge | null;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export function BadgeCard({
  badge,
  earned,
  showDetails = true,
  size = 'md',
  onClick,
  className,
}: BadgeCardProps): React.JSX.Element {
  const isEarned = !!earned;
  const isLocked = badge.isHidden && !isEarned;

  const rarityColors = {
    common: {
      border: 'border-muted/50',
      bg: 'bg-muted/10',
      text: 'text-muted-foreground',
      glow: '',
    },
    uncommon: {
      border: 'border-emerald-500/50',
      bg: 'bg-brand-success/10',
      text: 'text-brand-success',
      glow: 'shadow-emerald-500/20',
    },
    rare: {
      border: 'border-brand-primary/50',
      bg: 'bg-brand-primary/10',
      text: 'text-brand-cyan',
      glow: 'shadow-blue-500/20',
    },
    epic: {
      border: 'border-brand-secondary/50',
      bg: 'bg-brand-secondary/10',
      text: 'text-brand-purple',
      glow: 'shadow-purple-500/20',
    },
    legendary: {
      border: 'border-amber-500/50',
      bg: 'bg-brand-warning/10',
      text: 'text-brand-warning',
      glow: 'shadow-amber-500/30',
    },
  };

  const colors = rarityColors[badge.rarity];

  const sizeClasses = {
    sm: {
      container: 'p-3',
      icon: 'w-10 h-10',
      title: 'text-xs',
      description: 'text-[10px]',
    },
    md: {
      container: 'p-4',
      icon: 'w-14 h-14',
      title: 'text-sm',
      description: 'text-xs',
    },
    lg: {
      container: 'p-5',
      icon: 'w-20 h-20',
      title: 'text-base',
      description: 'text-sm',
    },
  };

  const sizes = sizeClasses[size];

  const CardContent = (): React.JSX.Element => (
    <>
      {/* Badge Icon */}
      <div
        className={cn(
          'relative mx-auto mb-3 rounded-full flex items-center justify-center',
          sizes.icon,
          colors.bg,
          colors.border,
          'border-2',
          isEarned && badge.rarity !== 'common' && `shadow-lg ${colors.glow}`,
          !isEarned && 'opacity-50 grayscale',
        )}
      >
        {isLocked ? (
          <Lock className="w-1/2 h-1/2 text-muted-foreground" />
        ) : badge.image ? (
          <Image
            src={badge.image}
            alt={badge.name}
            width={parseInt(sizes.icon.split(' ')[0].replace('w-', ''), 10) * 4}
            height={parseInt(sizes.icon.split(' ')[0].replace('w-', ''), 10) * 4}
            className="object-contain"
          />
        ) : (
          <span className={cn('text-2xl', colors.text)}>{badge.icon || '🏆'}</span>
        )}

        {/* Earned checkmark */}
        {isEarned && (
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-brand-success">
            <Check className="w-3 h-3 text-brand-primary" />
          </div>
        )}

        {/* Stack count */}
        {isEarned && earned && earned.stackCount > 1 && (
          <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[var(--studio-accent)] text-brand-primary text-[10px] font-bold">
            x{earned.stackCount}
          </div>
        )}
      </div>

      {/* Badge Info */}
      {showDetails && (
        <div className="text-center">
          <h4
            className={cn(
              'font-medium text-brand-primary',
              sizes.title,
              !isEarned && 'text-muted-foreground',
            )}
          >
            {isLocked ? '???' : badge.name}
          </h4>

          {!isLocked && (
            <>
              <p className={cn('mt-1 text-muted-foreground line-clamp-2', sizes.description)}>
                {badge.shortDescription}
              </p>

              {/* Rarity badge */}
              <span
                className={cn(
                  'inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase',
                  colors.bg,
                  colors.text,
                  colors.border,
                  'border',
                )}
              >
                {badge.rarity}
              </span>

              {/* Earned date */}
              {isEarned && earned && (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Earned {new Date(earned.earnedAt).toLocaleDateString()}
                </p>
              )}

              {/* XP reward */}
              {!isEarned && badge.xpReward > 0 && (
                <p className="mt-2 text-[10px] text-[var(--studio-accent)]">+{badge.xpReward} XP</p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'group flex flex-col items-center rounded-2xl',
          'bg-[var(--studio-bg)] border border-[var(--lxd-dark-surface-alt)]/50',
          'hover:border-[var(--studio-accent)]/50 hover:bg-studio-bg',
          'transition-all duration-200',
          sizes.container,
          className,
        )}
      >
        <CardContent />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl',
        'bg-[var(--studio-bg)] border border-[var(--lxd-dark-surface-alt)]/50',
        sizes.container,
        className,
      )}
    >
      <CardContent />
    </div>
  );
}

export default BadgeCard;
