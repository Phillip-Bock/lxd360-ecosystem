'use client';

import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  Clock,
  Code,
  History,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  Type,
  User,
} from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface ThemeHistoryEntry {
  id: string;
  themeId: string;
  version: number;
  configSnapshot: Record<string, unknown>;
  changedBy: string;
  changedByName?: string;
  changedAt: string;
  changeType: 'colors' | 'fonts' | 'logos' | 'css' | 'full';
  changeSummary?: string;
}

interface ThemeHistoryProps {
  entries: ThemeHistoryEntry[];
  currentVersion: number;
  onRollback: (entry: ThemeHistoryEntry) => Promise<void>;
  onPreview?: (entry: ThemeHistoryEntry) => void;
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const CHANGE_TYPE_CONFIG = {
  colors: {
    icon: Palette,
    label: 'Colors',
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
  },
  fonts: {
    icon: Type,
    label: 'Typography',
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
  },
  logos: {
    icon: ImageIcon,
    label: 'Logos',
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
  },
  css: {
    icon: Code,
    label: 'Custom CSS',
    color: 'text-green-400',
    bg: 'bg-green-500/20',
  },
  full: {
    icon: History,
    label: 'Full Theme',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
  },
};

// ============================================================================
// Sub-Components
// ============================================================================

function HistoryEntryCard({
  entry,
  isLatest,
  isCurrent,
  onRollback,
  onPreview,
  isRollingBack,
}: {
  entry: ThemeHistoryEntry;
  isLatest: boolean;
  isCurrent: boolean;
  onRollback: () => void;
  onPreview?: () => void;
  isRollingBack: boolean;
}): React.JSX.Element {
  const config = CHANGE_TYPE_CONFIG[entry.changeType];
  const Icon = config.icon;

  const timeAgo = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(entry.changedAt), { addSuffix: true });
    } catch {
      return entry.changedAt;
    }
  }, [entry.changedAt]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('relative pl-6 pb-6', !isLatest && 'border-l-2 border-white/10')}
    >
      {/* Timeline dot */}
      <div
        className={cn(
          'absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full border-2',
          isCurrent ? 'bg-green-500 border-green-400' : 'bg-white/10 border-white/20',
        )}
      />

      <div
        className={cn(
          'p-4 rounded-xl border transition-colors',
          isCurrent
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-white/5 border-white/10 hover:bg-white/10',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', config.bg)}>
              <Icon className={cn('h-5 w-5', config.color)} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Version {entry.version}</span>
                {isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400">
                    Current
                  </span>
                )}
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-medium',
                    config.bg,
                    config.color,
                  )}
                >
                  {config.label}
                </span>
              </div>

              {entry.changeSummary && (
                <p className="text-sm text-muted-foreground mt-1">{entry.changeSummary}</p>
              )}

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </span>
                {entry.changedByName && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {entry.changedByName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isCurrent && (
            <div className="flex items-center gap-2">
              {onPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPreview}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Preview
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onRollback}
                disabled={isRollingBack}
                className="text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
              >
                <RotateCcw className={cn('h-4 w-4 mr-2', isRollingBack && 'animate-spin')} />
                Rollback
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ThemeHistory({
  entries,
  currentVersion,
  onRollback,
  onPreview,
  isLoading = false,
  className,
}: ThemeHistoryProps): React.JSX.Element {
  const [rollingBackId, setRollingBackId] = React.useState<string | null>(null);
  const [confirmRollback, setConfirmRollback] = React.useState<ThemeHistoryEntry | null>(null);

  const handleRollback = React.useCallback(
    async (entry: ThemeHistoryEntry) => {
      setRollingBackId(entry.id);
      try {
        await onRollback(entry);
      } finally {
        setRollingBackId(null);
        setConfirmRollback(null);
      }
    },
    [onRollback],
  );

  const sortedEntries = React.useMemo(
    () => [...entries].sort((a, b) => b.version - a.version),
    [entries],
  );

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground">No History Yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Theme changes will appear here</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
            <History className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Version History</h3>
            <p className="text-sm text-muted-foreground">
              {entries.length} version{entries.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        <AnimatePresence>
          {sortedEntries.map((entry, index) => (
            <HistoryEntryCard
              key={entry.id}
              entry={entry}
              isLatest={index === 0}
              isCurrent={entry.version === currentVersion}
              onRollback={() => setConfirmRollback(entry)}
              onPreview={onPreview ? () => onPreview(entry) : undefined}
              isRollingBack={rollingBackId === entry.id}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Rollback confirmation modal */}
      <AnimatePresence>
        {confirmRollback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs"
            onClick={() => setConfirmRollback(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-lxd-dark-surface border border-white/10 rounded-xl p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">Confirm Rollback</h4>
                  <p className="text-sm text-muted-foreground">
                    This action will replace your current theme
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to rollback to{' '}
                <strong>Version {confirmRollback.version}</strong>? Your current theme settings will
                be replaced, but they will be saved in the history so you can restore them later if
                needed.
              </p>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setConfirmRollback(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRollback(confirmRollback)}
                  disabled={rollingBackId !== null}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {rollingBackId ? (
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Rollback
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
