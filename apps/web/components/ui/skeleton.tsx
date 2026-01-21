/**
 * =============================================================================
 * LXP360-SaaS | Skeleton Components
 * =============================================================================
 *
 * @fileoverview Loading skeleton components for better UX
 *
 * @description
 * Provides skeleton loading states to reduce perceived loading time:
 * - Base Skeleton component with animation
 * - Variants: text, circular, rectangular
 * - Pre-built skeletons for common patterns
 *
 * Performance Impact:
 * - Reduces CLS by reserving space for content
 * - Improves perceived performance
 * - Provides visual feedback during loading
 *
 * =============================================================================
 */

import type * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Base Skeleton Component
// ============================================================================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variant type */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width */
  width?: number | string;
  /** Height */
  height?: number | string;
  /** Animation style */
  animation?: 'pulse' | 'wave' | 'none';
}

function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  style,
  ...props
}: SkeletonProps): React.ReactElement {
  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  return (
    <div
      data-slot="skeleton"
      className={cn('bg-muted', variantStyles[variant], animationStyles[animation], className)}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}

// ============================================================================
// Text Skeleton
// ============================================================================

export interface TextSkeletonProps {
  /** Number of lines */
  lines?: number;
  /** Width of last line (percentage or value) */
  lastLineWidth?: string | number;
  /** Line height */
  lineHeight?: string | number;
  /** Gap between lines */
  gap?: string | number;
  /** Additional className */
  className?: string;
}

function TextSkeleton({
  lines = 3,
  lastLineWidth = '60%',
  lineHeight = '1rem',
  gap = '0.5rem',
  className,
}: TextSkeletonProps): React.ReactElement {
  return (
    <div className={cn('space-y-2', className)} style={{ gap }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          style={{
            height: lineHeight,
            width: index === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Pre-built Skeleton Components
// ============================================================================

/**
 * Course Card Skeleton
 */
function CourseCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      {/* Thumbnail */}
      <Skeleton className="w-full h-40" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category badge */}
        <Skeleton className="h-5 w-20" />

        {/* Title */}
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />

        {/* Description */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" className="h-8 w-8" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * User Avatar Skeleton
 */
function UserAvatarSkeleton({
  size = 'md',
  showName = false,
  className,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Skeleton variant="circular" className={sizes[size]} />
      {showName && (
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      )}
    </div>
  );
}

/**
 * Table Row Skeleton
 */
function TableRowSkeleton({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <tr className={cn('border-b', className)}>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Table Skeleton
 */
function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('w-full overflow-hidden rounded-md border', className)}>
      <table className="w-full">
        {showHeader && (
          <thead className="bg-muted/50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="p-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRowSkeleton key={index} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Dashboard Stats Skeleton
 */
function DashboardStatsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton variant="circular" className="h-8 w-8" />
          </div>
          <Skeleton className="h-8 w-20 mt-4" />
          <Skeleton className="h-3 w-32 mt-2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Skeleton
 */
function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats */}
      <DashboardStatsSkeleton />

      {/* Charts/Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton variant="circular" className="h-10 w-10" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Course Grid Skeleton
 */
function CourseGridSkeleton({
  count = 6,
  columns = 3,
  className,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Form Skeleton
 */
function FormSkeleton({ fields = 4, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 mt-4" />
    </div>
  );
}

/**
 * Navigation Skeleton
 */
function NavSkeleton({ items = 5, className }: { items?: number; className?: string }) {
  return (
    <nav className={cn('space-y-1', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-2">
          <Skeleton variant="circular" className="h-5 w-5" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </nav>
  );
}

// ============================================================================
// Exports
// ============================================================================

export {
  Skeleton,
  TextSkeleton,
  CourseCardSkeleton,
  UserAvatarSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  DashboardStatsSkeleton,
  DashboardSkeleton,
  CourseGridSkeleton,
  FormSkeleton,
  NavSkeleton,
};
