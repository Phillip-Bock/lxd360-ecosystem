'use client';

import { Crown, Flame, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PopularBadgeProps {
  text?: string;
  icon?: 'sparkles' | 'star' | 'flame' | 'crown';
  variant?: 'default' | 'gradient' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap = {
  sparkles: Sparkles,
  star: Star,
  flame: Flame,
  crown: Crown,
};

export function PopularBadge({
  text = 'Most Popular',
  icon = 'sparkles',
  variant = 'gradient',
  size = 'md',
  className,
}: PopularBadgeProps) {
  const Icon = iconMap[icon];

  const variantClasses = {
    default: 'bg-(--lxd-blue-light) text-brand-primary',
    gradient: 'bg-linear-to-r from-(--lxd-blue-light) to-(--brand-secondary) text-brand-primary',
    glow: 'bg-linear-to-r from-(--lxd-blue-light) to-(--brand-secondary) text-brand-primary shadow-lg shadow-(--lxd-blue-light)/30',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs gap-1',
    md: 'px-4 py-1 text-sm gap-1.5',
    lg: 'px-5 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      <Icon className={iconSizes[size]} />
      {text}
    </span>
  );
}

export default PopularBadge;
