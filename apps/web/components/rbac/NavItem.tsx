/**
 * NavItem — Navigation Item with Lock Indicator
 *
 * Navigation item that shows lock icon for gated features.
 * Always visible in nav, but indicates locked state for upsell opportunity.
 *
 * Features:
 * - Shows lock icon for features user doesn't have access to
 * - Maintains visual hierarchy with active state
 * - Supports both icon-only and icon+label modes
 *
 * @see CLAUDE.md Section 9 for persona definitions
 */

'use client';

import type { LucideIcon } from 'lucide-react';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRBAC } from '@/lib/hooks/useRBAC';
import { cn } from '@/lib/utils';

interface NavItemProps {
  /** Route path */
  href: string;
  /** Display label */
  label: string;
  /** Icon component */
  icon?: LucideIcon;
  /** Minimum level required (0 = no restriction) */
  minLevel?: number;
  /** Additional class names */
  className?: string;
  /** Whether to show the label (for compact sidebars) */
  showLabel?: boolean;
  /** Badge content (e.g., notification count) */
  badge?: string | number;
}

/**
 * Navigation item that shows lock icon for gated features
 *
 * Always visible but indicates locked state for upsell.
 * This encourages users to discover features and potentially upgrade.
 *
 * @example
 * ```tsx
 * <NavItem
 *   href="/ignite/analytics"
 *   label="Analytics"
 *   icon={BarChart3}
 *   minLevel={50}
 * />
 * ```
 */
export function NavItem({
  href,
  label,
  icon: Icon,
  minLevel = 0,
  className,
  showLabel = true,
  badge,
}: NavItemProps): React.ReactNode {
  const { hasLevel } = useRBAC();
  const pathname = usePathname();
  const isActive = pathname?.startsWith(href) ?? false;
  const isLocked = minLevel > 0 && !hasLevel(minLevel);

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-[var(--color-lxd-primary)]/10 text-[var(--color-lxd-primary)]'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        isLocked && 'opacity-75',
        className,
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
      {showLabel && <span className="flex-1 truncate">{label}</span>}
      {badge && (
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-lxd-primary)] px-1.5 text-xs text-white">
          {badge}
        </span>
      )}
      {isLocked && (
        <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" aria-label="Locked feature" />
      )}
    </Link>
  );
}

/**
 * NavItemGroup — Wrapper for grouped navigation items
 */
interface NavItemGroupProps {
  /** Group label */
  label: string;
  /** Child NavItems */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function NavItemGroup({ label, children, className }: NavItemGroupProps): React.ReactNode {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
