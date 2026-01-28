'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardWrapperProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: boolean;
}

/**
 * Consistent wrapper for all dashboard pages
 * Ensures theme consistency across all dashboard views
 */
export function DashboardWrapper({
  children,
  className,
  maxWidth = '7xl',
  padding = true,
}: DashboardWrapperProps): React.JSX.Element {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className="min-h-screen bg-lxd-light-page dark:bg-lxd-dark-page">
      <div
        className={cn(
          'mx-auto',
          maxWidthClasses[maxWidth],
          padding && 'px-4 sm:px-6 lg:px-8 py-8',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Page header component for consistent styling
 */
export function DashboardHeader({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lxd-text-dark-heading dark:text-lxd-text-light-heading">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-lxd-text-dark-muted dark:text-lxd-text-light-muted">
              {description}
            </p>
          )}
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </div>
  );
}

/**
 * Card component for dashboard sections
 */
export function DashboardCard({
  children,
  className,
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'bg-lxd-light-card dark:bg-lxd-dark-card rounded-lxd border border-lxd-light-border dark:border-lxd-dark-border',
        'shadow-[0_4px_6px_-1px_rgba(186,35,251,0.2),0_2px_4px_-1px_rgba(186,35,251,0.1)]',
        'dark:shadow-[0_4px_6px_-1px_rgba(67,2,95,0.3),0_2px_4px_-1px_rgba(67,2,95,0.2)]',
        padding && 'p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Stats card for displaying metrics
 */
export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'purple',
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: 'indigo' | 'green' | 'red' | 'yellow' | 'blue' | 'purple';
}): React.JSX.Element {
  const iconColorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-lxd-success/10 dark:bg-lxd-success/20 text-lxd-success',
    red: 'bg-lxd-error/10 dark:bg-lxd-error/20 text-lxd-error',
    yellow: 'bg-lxd-warning/10 dark:bg-lxd-warning/20 text-lxd-warning',
    blue: 'bg-lxd-blue/10 dark:bg-lxd-blue/20 text-lxd-blue dark:text-lxd-blue-light',
    purple: 'bg-lxd-purple/10 dark:bg-lxd-purple/20 text-lxd-purple dark:text-lxd-purple-light',
  };

  const changeColorClasses = {
    positive: 'text-lxd-success',
    negative: 'text-lxd-error',
    neutral: 'text-lxd-text-dark-muted dark:text-lxd-text-light-muted',
  };

  return (
    <DashboardCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-lxd-text-dark-muted dark:text-lxd-text-light-muted">
            {title}
          </p>
          <p className="text-2xl font-bold text-lxd-text-dark-heading dark:text-lxd-text-light-heading mt-1">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-xl', iconColorClasses[iconColor])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {change && <p className={cn('text-sm mt-3', changeColorClasses[changeType])}>{change}</p>}
    </DashboardCard>
  );
}

/**
 * Section title for organizing dashboard content
 */
export function SectionTitle({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <h2 className="text-lg font-semibold text-lxd-text-dark-heading dark:text-lxd-text-light-heading">
        {title}
      </h2>
      {action}
    </div>
  );
}

/**
 * Empty state component
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}): React.JSX.Element {
  return (
    <div className="text-center py-12">
      {Icon && (
        <Icon className="w-12 h-12 text-lxd-text-dark-placeholder dark:text-lxd-text-light-placeholder mx-auto mb-4" />
      )}
      <h3 className="text-lg font-medium text-lxd-text-dark-heading dark:text-lxd-text-light-heading">
        {title}
      </h3>
      {description && (
        <p className="text-lxd-text-dark-muted dark:text-lxd-text-light-muted mt-1">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
