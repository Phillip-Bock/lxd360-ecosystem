'use client';

/**
 * =============================================================================
 * LXD360 Offline Queue Service - Sync Indicator Component
 * =============================================================================
 *
 * Visual indicator showing sync status (green/yellow/red) with pending count
 * badge and manual sync button. Critical for compliance environments where
 * users need visibility into data sync status.
 *
 * @module components/offline/sync-indicator
 * @version 1.0.0
 */

import { Cloud, CloudOff, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import type { ComponentProps, JSX } from 'react';
import { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useOfflineStatus } from '@/hooks/use-offline-status';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

type SyncState = 'online' | 'syncing' | 'pending' | 'offline' | 'error';

interface SyncIndicatorProps extends Omit<ComponentProps<'output'>, 'children'> {
  /** Show the pending count badge */
  showCount?: boolean;
  /** Show the manual sync button */
  showSyncButton?: boolean;
  /** Compact mode - icon only */
  compact?: boolean;
  /** Custom class for the indicator dot */
  dotClassName?: string;
}

// =============================================================================
// STATUS CONFIG
// =============================================================================

const STATUS_CONFIG: Record<
  SyncState,
  {
    color: string;
    bgColor: string;
    pulseColor: string;
    label: string;
    description: string;
  }
> = {
  online: {
    color: 'text-success',
    bgColor: 'bg-success',
    pulseColor: 'bg-success/50',
    label: 'Synced',
    description: 'All data is synced to the server',
  },
  syncing: {
    color: 'text-lxd-secondary',
    bgColor: 'bg-lxd-secondary',
    pulseColor: 'bg-lxd-secondary/50',
    label: 'Syncing',
    description: 'Syncing data to the server...',
  },
  pending: {
    color: 'text-caution',
    bgColor: 'bg-caution',
    pulseColor: 'bg-caution/50',
    label: 'Pending',
    description: 'Data waiting to sync',
  },
  offline: {
    color: 'text-muted-foreground',
    bgColor: 'bg-muted-foreground',
    pulseColor: 'bg-muted-foreground/50',
    label: 'Offline',
    description: 'No internet connection. Data will sync when back online.',
  },
  error: {
    color: 'text-error',
    bgColor: 'bg-error',
    pulseColor: 'bg-error/50',
    label: 'Error',
    description: 'Some data failed to sync',
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getSyncState(
  isOnline: boolean,
  isSyncing: boolean,
  pendingCount: number,
  hasError: boolean,
): SyncState {
  if (!isOnline) return 'offline';
  if (hasError) return 'error';
  if (isSyncing) return 'syncing';
  if (pendingCount > 0) return 'pending';
  return 'online';
}

function formatTimeSince(ms: number | null): string {
  if (ms === null) return 'Never';

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// =============================================================================
// STATUS DOT COMPONENT
// =============================================================================

function StatusDot({ state, className }: { state: SyncState; className?: string }): JSX.Element {
  const config = STATUS_CONFIG[state];
  const shouldPulse = state === 'syncing' || state === 'pending';

  return (
    <span className={cn('relative flex h-3 w-3', className)}>
      {shouldPulse && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
            config.pulseColor,
          )}
          aria-hidden="true"
        />
      )}
      <span
        className={cn('relative inline-flex h-3 w-3 rounded-full', config.bgColor)}
        aria-hidden="true"
      />
    </span>
  );
}

// =============================================================================
// STATUS ICON COMPONENT
// =============================================================================

function StatusIcon({ state, className }: { state: SyncState; className?: string }): JSX.Element {
  const config = STATUS_CONFIG[state];
  const iconClass = cn('h-4 w-4', config.color, className);

  switch (state) {
    case 'offline':
      return <WifiOff className={iconClass} aria-hidden="true" />;
    case 'syncing':
      return <Loader2 className={cn(iconClass, 'animate-spin')} aria-hidden="true" />;
    case 'error':
      return <CloudOff className={iconClass} aria-hidden="true" />;
    default:
      return <Cloud className={iconClass} aria-hidden="true" />;
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Sync Indicator Component
 *
 * Displays the current sync status with visual indicators:
 * - Green: All synced
 * - Blue (pulsing): Actively syncing
 * - Yellow (pulsing): Pending sync
 * - Gray: Offline
 * - Red: Error
 *
 * @example
 * ```tsx
 * // Full indicator with button
 * <SyncIndicator showCount showSyncButton />
 *
 * // Compact mode for toolbars
 * <SyncIndicator compact />
 *
 * // Icon only with tooltip
 * <SyncIndicator showCount={false} showSyncButton={false} />
 * ```
 */
export function SyncIndicator({
  showCount = true,
  showSyncButton = true,
  compact = false,
  dotClassName,
  className,
  ...props
}: SyncIndicatorProps): JSX.Element {
  const { isOnline, isSyncing, pendingCount, status, triggerSync } = useOfflineStatus();
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const hasError = status.consecutiveFailures > 0 && status.lastError !== null;
  const syncState = getSyncState(isOnline, isSyncing || isManualSyncing, pendingCount, hasError);
  const config = STATUS_CONFIG[syncState];

  const handleManualSync = useCallback(async () => {
    if (!isOnline || isSyncing || isManualSyncing) return;

    setIsManualSyncing(true);
    try {
      await triggerSync();
    } finally {
      setIsManualSyncing(false);
    }
  }, [isOnline, isSyncing, isManualSyncing, triggerSync]);

  // Tooltip content with detailed status
  const tooltipContent = (
    <div className="space-y-1 text-xs">
      <div className="font-medium">{config.label}</div>
      <div className="text-muted-foreground">{config.description}</div>
      {pendingCount > 0 && (
        <div className="text-muted-foreground">{pendingCount} items pending</div>
      )}
      {status.lastSyncAt && (
        <div className="text-muted-foreground">
          Last sync: {formatTimeSince(status.timeSinceLastSync)}
        </div>
      )}
      {status.lastError && (
        <div className="text-error truncate max-w-[200px]">{status.lastError}</div>
      )}
    </div>
  );

  // Compact mode - just icon with tooltip
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <output
              className={cn(
                'inline-flex items-center justify-center rounded-md p-2',
                'hover:bg-card transition-colors cursor-default',
                className,
              )}
              aria-label={`Sync status: ${config.label}`}
              {...props}
            >
              <StatusDot state={syncState} className={dotClassName} />
            </output>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <output
        className={cn('inline-flex items-center gap-2', className)}
        aria-label={`Sync status: ${config.label}`}
        {...props}
      >
        {/* Status indicator with icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-2 cursor-default">
              <StatusDot state={syncState} className={dotClassName} />
              <StatusIcon state={syncState} />
              <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>

        {/* Pending count badge */}
        {showCount && pendingCount > 0 && (
          <Badge variant="caution" className="tabular-nums">
            {pendingCount}
          </Badge>
        )}

        {/* Manual sync button */}
        {showSyncButton && isOnline && pendingCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleManualSync}
            disabled={isSyncing || isManualSyncing}
            className="h-8 px-2"
            aria-label="Sync now"
          >
            <RefreshCw
              className={cn('h-4 w-4', (isSyncing || isManualSyncing) && 'animate-spin')}
            />
            <span className="sr-only">Sync now</span>
          </Button>
        )}
      </output>
    </TooltipProvider>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { SyncIndicatorProps, SyncState };
