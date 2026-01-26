'use client';

import type { LucideIcon } from 'lucide-react';
import { BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface LearningSectionProps {
  /** Section title */
  title: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Number of items (shown in header) */
  itemCount?: number;
  /** Optional "View All" link */
  viewAllHref?: string;
  /** View All link text */
  viewAllText?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state icon */
  emptyIcon?: LucideIcon;
  /** Whether the section is empty */
  isEmpty?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Number of skeleton items to show when loading */
  skeletonCount?: number;
  /** Skeleton component to render */
  skeleton?: React.ReactNode;
  /** Children content */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Grid columns configuration */
  columns?: 1 | 2 | 3;
}

function EmptyState({ message, icon: Icon = BookOpen }: { message: string; icon?: LucideIcon }) {
  return (
    <Card className="bg-lxd-dark-surface/50 border-lxd-dark-border border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
      </CardContent>
    </Card>
  );
}

/**
 * LearningSection - Container component for dashboard sections
 *
 * Features:
 * - Section header with title and icon
 * - Optional item count badge
 * - "View All" link
 * - Empty state handling
 * - Loading skeleton support
 * - Responsive grid layout
 */
export function LearningSection({
  title,
  icon: Icon,
  itemCount,
  viewAllHref,
  viewAllText = 'View All',
  emptyMessage = 'No items to display',
  emptyIcon,
  isEmpty = false,
  isLoading = false,
  skeletonCount = 3,
  skeleton,
  children,
  className,
  columns = 2,
}: LearningSectionProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  };

  return (
    <section className={cn('space-y-4', className)}>
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 rounded-md bg-lxd-primary/10">
              <Icon className="w-4 h-4 text-lxd-primary" aria-hidden />
            </div>
          )}
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {typeof itemCount === 'number' && itemCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-lxd-primary/20 text-lxd-primary">
              {itemCount}
            </span>
          )}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className={cn(
              'flex items-center gap-1 text-sm text-muted-foreground',
              'hover:text-lxd-primary transition-colors',
              'focus:outline-none focus:text-lxd-primary',
            )}
          >
            {viewAllText}
            <ChevronRight className="w-4 h-4" aria-hidden />
          </Link>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={cn('grid gap-4', gridCols[columns])}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i}>{skeleton}</div>
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState message={emptyMessage} icon={emptyIcon} />
      ) : (
        <div className={cn('grid gap-4', gridCols[columns])}>{children}</div>
      )}
    </section>
  );
}
