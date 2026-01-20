'use client';

import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  isLive?: boolean;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function LiveIndicator({
  isLive = true,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  className,
}: LiveIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Live badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-surface/5 border border-brand-subtle">
        <span className="relative flex items-center justify-center w-2 h-2">
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75',
              isLive ? 'bg-emerald-400 animate-ping' : 'bg-gray-400',
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              isLive ? 'bg-brand-success' : 'bg-gray-500',
            )}
          />
        </span>
        <span
          className={cn(
            'text-xs font-medium uppercase tracking-wider',
            isLive ? 'text-brand-success' : 'text-brand-muted',
          )}
        >
          {isLive ? 'Live' : 'Paused'}
        </span>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <span className="text-xs text-brand-primary/40">
          Updated {new Date(lastUpdated).toLocaleTimeString()}
        </span>
      )}

      {/* Refresh button */}
      {onRefresh && (
        <motion.button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            'p-2 rounded-lg bg-brand-surface/5 border border-brand-subtle text-brand-primary/60',
            'hover:bg-brand-surface/10 hover:text-brand-primary/80 transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
        </motion.button>
      )}
    </div>
  );
}

export function LiveBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand-success/10 border border-emerald-500/20',
        className,
      )}
    >
      <motion.span
        className="w-1.5 h-1.5 rounded-full bg-brand-success"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className="text-[10px] font-semibold text-brand-success uppercase tracking-wider">
        Live
      </span>
    </div>
  );
}
