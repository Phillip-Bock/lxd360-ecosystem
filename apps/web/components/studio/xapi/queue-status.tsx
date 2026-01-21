'use client';

/**
 * QueueStatus - xAPI Statement Queue Monitoring Component
 *
 * Displays the current status of the xAPI statement queue including:
 * - Queue length and pending/failed counts
 * - Online/offline status
 * - Flush progress indicator
 * - Manual flush button
 */

import { AlertCircle, CheckCircle2, Cloud, CloudOff, Loader2, RefreshCw, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useXAPISession } from '@/hooks/xapi/use-xapi';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface QueueStatusProps {
  /** Variant: minimal shows only icon, full shows details */
  variant?: 'minimal' | 'compact' | 'full';
  /** Show flush button */
  showFlushButton?: boolean;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function QueueStatus({
  variant = 'compact',
  showFlushButton = true,
  className,
}: QueueStatusProps) {
  const { queueStatus, flushQueue } = useXAPISession();
  const [isFlushing, setIsFlushing] = useState(false);

  const handleFlush = async () => {
    setIsFlushing(true);
    try {
      await flushQueue();
    } finally {
      setIsFlushing(false);
    }
  };

  const getStatusColor = () => {
    if (!queueStatus.isOnline) return 'text-amber-500';
    if (queueStatus.failed > 0) return 'text-red-500';
    if (queueStatus.pending > 0) return 'text-blue-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!queueStatus.isOnline) {
      return <CloudOff className="h-4 w-4" />;
    }
    if (queueStatus.isFlushing || isFlushing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (queueStatus.failed > 0) {
      return <AlertCircle className="h-4 w-4" />;
    }
    if (queueStatus.pending > 0) {
      return <Send className="h-4 w-4" />;
    }
    return <CheckCircle2 className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!queueStatus.isOnline) {
      return `Offline - ${queueStatus.length} queued`;
    }
    if (queueStatus.isFlushing || isFlushing) {
      return 'Sending statements...';
    }
    if (queueStatus.failed > 0) {
      return `${queueStatus.failed} failed, ${queueStatus.pending} pending`;
    }
    if (queueStatus.pending > 0) {
      return `${queueStatus.pending} pending`;
    }
    return 'All synced';
  };

  // Minimal variant - just an icon with tooltip
  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center', getStatusColor(), className)}>
              {getStatusIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getStatusText()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Compact variant - icon + count
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-2 px-2 py-1 rounded text-sm',
                'bg-white/5 border border-white/10',
                className,
              )}
            >
              <div className={getStatusColor()}>{getStatusIcon()}</div>
              {queueStatus.length > 0 && (
                <span className="text-xs text-zinc-400">{queueStatus.length}</span>
              )}
              {showFlushButton && queueStatus.pending > 0 && queueStatus.isOnline && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFlush}
                  disabled={isFlushing || queueStatus.isFlushing}
                  className="h-5 w-5 p-0"
                >
                  <RefreshCw className={cn('h-3 w-3', isFlushing && 'animate-spin')} />
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{getStatusText()}</p>
              {queueStatus.length > 0 && (
                <p className="text-xs text-zinc-400">
                  {queueStatus.pending} pending, {queueStatus.failed} failed
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full variant - detailed panel
  return (
    <div className={cn('p-4 rounded-lg bg-white/5 border border-white/10 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">xAPI Queue Status</h3>
        <div className={cn('flex items-center gap-1', getStatusColor())}>
          {queueStatus.isOnline ? <Cloud className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
          <span className="text-xs">{queueStatus.isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-zinc-200">{queueStatus.length}</div>
          <div className="text-xs text-zinc-500">Total</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-400">{queueStatus.pending}</div>
          <div className="text-xs text-zinc-500">Pending</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-400">{queueStatus.failed}</div>
          <div className="text-xs text-zinc-500">Failed</div>
        </div>
      </div>

      {/* Status indicator */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded text-sm',
          !queueStatus.isOnline && 'bg-amber-500/10 text-amber-400',
          queueStatus.isOnline && queueStatus.failed > 0 && 'bg-red-500/10 text-red-400',
          queueStatus.isOnline &&
            queueStatus.failed === 0 &&
            queueStatus.pending > 0 &&
            'bg-blue-500/10 text-blue-400',
          queueStatus.isOnline && queueStatus.length === 0 && 'bg-green-500/10 text-green-400',
        )}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>

      {/* Flush button */}
      {showFlushButton && queueStatus.pending > 0 && queueStatus.isOnline && (
        <Button
          onClick={handleFlush}
          disabled={isFlushing || queueStatus.isFlushing}
          className="w-full gap-2"
          variant="outline"
        >
          {isFlushing || queueStatus.isFlushing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Now
            </>
          )}
        </Button>
      )}

      {/* Retry failed button */}
      {queueStatus.failed > 0 && queueStatus.isOnline && (
        <Button
          onClick={handleFlush}
          disabled={isFlushing || queueStatus.isFlushing}
          variant="destructive"
          className="w-full gap-2"
        >
          <RefreshCw className={cn('h-4 w-4', isFlushing && 'animate-spin')} />
          Retry Failed ({queueStatus.failed})
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// STANDALONE QUEUE INDICATOR
// =============================================================================

/**
 * Simple indicator that can be placed in a header or toolbar.
 * Shows when there are pending or failed statements.
 */
export function QueueIndicator({ className }: { className?: string }) {
  const { queueStatus } = useXAPISession();

  // Don't show if queue is empty and online
  if (queueStatus.length === 0 && queueStatus.isOnline) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs',
              !queueStatus.isOnline && 'bg-amber-500/20 text-amber-400',
              queueStatus.isOnline && queueStatus.failed > 0 && 'bg-red-500/20 text-red-400',
              queueStatus.isOnline && queueStatus.pending > 0 && 'bg-blue-500/20 text-blue-400',
              className,
            )}
          >
            {!queueStatus.isOnline ? (
              <CloudOff className="h-3 w-3" />
            ) : queueStatus.isFlushing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : queueStatus.failed > 0 ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            <span>{queueStatus.length}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {!queueStatus.isOnline
              ? `Offline - ${queueStatus.length} statements queued`
              : queueStatus.failed > 0
                ? `${queueStatus.failed} failed statements`
                : `${queueStatus.pending} statements pending`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
