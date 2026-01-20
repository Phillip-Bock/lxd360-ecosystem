'use client';

import {
  AlertCircle,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  Database,
  FileText,
  FolderOpen,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// =============================================================================
// Size Configuration
// =============================================================================

const sizeConfig = {
  sm: {
    container: 'py-8 px-4',
    iconWrapper: 'w-12 h-12',
    iconSize: 'w-6 h-6',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12 px-6',
    iconWrapper: 'w-16 h-16',
    iconSize: 'w-8 h-8',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16 px-8',
    iconWrapper: 'w-20 h-20',
    iconSize: 'w-10 h-10',
    title: 'text-xl',
    description: 'text-base',
  },
};

// =============================================================================
// Generic Empty State Component
// =============================================================================

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        config.container,
        className,
      )}
    >
      {/* Icon */}
      {icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted mb-4',
            config.iconWrapper,
          )}
        >
          {React.isValidElement(icon)
            ? React.cloneElement(
                icon as React.ReactElement<{
                  className?: string;
                  'aria-hidden'?: string | boolean;
                }>,
                {
                  className: cn(config.iconSize, 'text-muted-foreground'),
                  'aria-hidden': true,
                },
              )
            : icon}
        </div>
      )}

      {/* Title */}
      <h3 className={cn('font-semibold text-foreground', config.title)}>{title}</h3>

      {/* Description */}
      {description && (
        <p className={cn('mt-1.5 text-muted-foreground max-w-md', config.description)}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {action && (
            <Button onClick={action.onClick} variant="primary" className="gap-2">
              {action.icon}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Pre-built Empty State Variants
// =============================================================================

export interface VariantProps {
  onAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// No Courses Empty
export function NoCoursesEmpty({ onAction, onSecondaryAction, className, size }: VariantProps) {
  return (
    <EmptyState
      icon={<BookOpen />}
      title="No courses yet"
      description="Get started by creating your first course or exploring the course library."
      action={
        onAction
          ? {
              label: 'Create Course',
              onClick: onAction,
              icon: <Plus className="w-4 h-4" aria-hidden="true" />,
            }
          : undefined
      }
      secondaryAction={
        onSecondaryAction
          ? {
              label: 'Browse Library',
              onClick: onSecondaryAction,
            }
          : undefined
      }
      className={className}
      size={size}
    />
  );
}

// No Search Results Empty
export function NoSearchResultsEmpty({
  query,
  onAction,
  className,
  size,
}: VariantProps & { query?: string }) {
  return (
    <EmptyState
      icon={<Search />}
      title="No results found"
      description={
        query
          ? `We couldn't find unknown results for "${query}". Try adjusting your search terms.`
          : 'No results match your search criteria. Try different keywords or filters.'
      }
      action={
        onAction
          ? {
              label: 'Clear Search',
              onClick: onAction,
            }
          : undefined
      }
      className={className}
      size={size}
    />
  );
}

// No Notifications Empty
export function NoNotificationsEmpty({
  className,
  size,
}: Omit<VariantProps, 'onAction' | 'onSecondaryAction'>) {
  return (
    <EmptyState
      icon={<Bell />}
      title="All caught up!"
      description="You don't have unknown notifications at the moment. We'll notify you when something important happens."
      className={className}
      size={size}
    />
  );
}

// No Users Empty
export function NoUsersEmpty({ onAction, className, size }: VariantProps) {
  return (
    <EmptyState
      icon={<Users />}
      title="No users found"
      description="There are no users matching your criteria. Invite team members to get started."
      action={
        onAction
          ? {
              label: 'Invite Users',
              onClick: onAction,
              icon: <Plus className="w-4 h-4" aria-hidden="true" />,
            }
          : undefined
      }
      className={className}
      size={size}
    />
  );
}

// No Data Empty
export function NoDataEmpty({ onAction, className, size }: VariantProps) {
  return (
    <EmptyState
      icon={<Database />}
      title="No data available"
      description="There's no data to display yet. Start by adding some content."
      action={
        onAction
          ? {
              label: 'Add Data',
              onClick: onAction,
              icon: <Plus className="w-4 h-4" aria-hidden="true" />,
            }
          : undefined
      }
      className={className}
      size={size}
    />
  );
}

// Error Empty (for failed data fetches)
export function ErrorEmpty({
  onAction,
  message,
  className,
  size,
}: VariantProps & { message?: string }) {
  return (
    <EmptyState
      icon={<AlertCircle />}
      title="Something went wrong"
      description={
        message ||
        "We couldn't load this content. Please try again or contact support if the problem persists."
      }
      action={
        onAction
          ? {
              label: 'Try Again',
              onClick: onAction,
              icon: <RefreshCw className="w-4 h-4" aria-hidden="true" />,
            }
          : undefined
      }
      className={className}
      size={size}
    />
  );
}

// No Files Empty
export function NoFilesEmpty({ onAction, className, size }: VariantProps) {
  return (
    <EmptyState
      icon={<FolderOpen />}
      title="No files uploaded"
      description="Upload files to get started. You can drag and drop or click to browse."
      action={
        onAction
          ? {
              label: 'Upload Files',
              onClick: onAction,
              icon: <Plus className="w-4 h-4" aria-hidden="true" />,
            }
          : undefined
      }
      className={className}
      size={size}
    />
  );
}

// No Documents Empty
export function NoDocumentsEmpty({ onAction, className, size }: VariantProps) {
  return (
    <EmptyState
      icon={<FileText />}
      title="No documents yet"
      description="Create or upload your first document to get started."
      action={
        onAction
          ? {
              label: 'Create Document',
              onClick: onAction,
              icon: <Plus className="w-4 h-4" aria-hidden="true" />,
            }
          : undefined
      }
      className={className}
      size={size}
    />
  );
}

// No Messages Empty
export function NoMessagesEmpty({ onAction, className, size }: VariantProps) {
  return (
    <EmptyState
      icon={<MessageSquare />}
      title="No messages"
      description="Start a conversation with your team or learners."
      action={
        onAction
          ? {
              label: 'New Message',
              onClick: onAction,
              icon: <Plus className="w-4 h-4" aria-hidden="true" />,
            }
          : undefined
      }
      className={className}
      size={size}
    />
  );
}

// No Events Empty
export function NoEventsEmpty({ onAction, className, size }: VariantProps) {
  return (
    <EmptyState
      icon={<Calendar />}
      title="No upcoming events"
      description="Schedule events and learning sessions to appear here."
      action={
        onAction
          ? {
              label: 'Schedule Event',
              onClick: onAction,
              icon: <Plus className="w-4 h-4" aria-hidden="true" />,
            }
          : undefined
      }
      className={className}
      size={size}
    />
  );
}

// No Analytics Empty
export function NoAnalyticsEmpty({
  className,
  size,
}: Omit<VariantProps, 'onAction' | 'onSecondaryAction'>) {
  return (
    <EmptyState
      icon={<BarChart3 />}
      title="No analytics data"
      description="Analytics will appear here once learners start engaging with content."
      className={className}
      size={size}
    />
  );
}

// Configuration Required Empty
export function ConfigurationRequiredEmpty({ onAction, className, size }: VariantProps) {
  return (
    <EmptyState
      icon={<Settings />}
      title="Configuration required"
      description="This feature needs to be configured before it can be used."
      action={
        onAction
          ? {
              label: 'Configure',
              onClick: onAction,
              icon: <Settings className="w-4 h-4" aria-hidden="true" />,
            }
          : undefined
      }
      className={className}
      size={size}
    />
  );
}

// =============================================================================
// Exports
// =============================================================================

const EmptyStates = {
  EmptyState,
  NoCoursesEmpty,
  NoSearchResultsEmpty,
  NoNotificationsEmpty,
  NoUsersEmpty,
  NoDataEmpty,
  ErrorEmpty,
  NoFilesEmpty,
  NoDocumentsEmpty,
  NoMessagesEmpty,
  NoEventsEmpty,
  NoAnalyticsEmpty,
  ConfigurationRequiredEmpty,
};

export default EmptyStates;
