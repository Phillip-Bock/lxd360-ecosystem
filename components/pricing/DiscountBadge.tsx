'use client';

import { Percent, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiscountBadgeProps {
  percent?: number;
  text?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DiscountBadge({
  percent,
  text,
  variant = 'success',
  size = 'md',
  className,
}: DiscountBadgeProps) {
  const variantClasses = {
    default:
      'bg-[var(--lxd-dark-surface-alt)]/50 text-studio-text border-[var(--lxd-dark-surface-alt)]',
    success: 'bg-brand-success/10 text-brand-success border-emerald-500/30',
    warning: 'bg-brand-warning/10 text-brand-warning border-amber-500/30',
    info: 'bg-(--lxd-blue-light)/10 text-(--lxd-blue-light) border-(--lxd-blue-light)/30',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const displayText = text || (percent ? `${percent}% off` : '');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {percent && <Percent className="w-3 h-3" />}
      {!percent && text && <Tag className="w-3 h-3" />}
      {displayText}
    </span>
  );
}

export default DiscountBadge;
