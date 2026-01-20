'use client';

/**
 * ExportProgress - Progress indicator for export operations
 *
 * Shows the current step, progress bar, and status during
 * package generation and export.
 */

import { AlertCircle, CheckCircle2, Download, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { PublishingStatus } from '@/types/studio/publishing';

// =============================================================================
// TYPES
// =============================================================================

interface ExportProgressProps {
  status: PublishingStatus | 'idle';
  progress: number;
  currentStep: string;
  fileName: string | null;
  error: string | null;
  warnings: string[];
  onDownload: () => void;
  onReset: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

const STATUS_STEPS = [
  { status: 'validating', label: 'Validating', icon: 'check' },
  { status: 'generating', label: 'Generating', icon: 'check' },
  { status: 'optimizing', label: 'Optimizing', icon: 'check' },
  { status: 'packaging', label: 'Packaging', icon: 'check' },
  { status: 'uploading', label: 'Finalizing', icon: 'check' },
  { status: 'completed', label: 'Complete', icon: 'check' },
] as const;

function getStatusIndex(status: PublishingStatus | 'idle'): number {
  const idx = STATUS_STEPS.findIndex((s) => s.status === status);
  return idx === -1 ? -1 : idx;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ExportProgress({
  status,
  progress,
  currentStep,
  fileName,
  error,
  warnings,
  onDownload,
  onReset,
}: ExportProgressProps) {
  const currentIndex = getStatusIndex(status);
  const isComplete = status === 'completed';
  const isFailed = status === 'failed';
  const isCancelled = status === 'cancelled';
  const isFinished = isComplete || isFailed || isCancelled;

  return (
    <div className="space-y-6">
      {/* Status Icon */}
      <div className="flex flex-col items-center justify-center py-6">
        {isComplete ? (
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </div>
        ) : isFailed ? (
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        ) : isCancelled ? (
          <div className="w-16 h-16 rounded-full bg-zinc-500/20 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-zinc-400" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}

        <h3 className="mt-4 text-lg font-medium text-zinc-200">
          {isComplete
            ? 'Export Complete'
            : isFailed
              ? 'Export Failed'
              : isCancelled
                ? 'Export Cancelled'
                : 'Exporting...'}
        </h3>

        {!isFinished && <p className="mt-1 text-sm text-zinc-400">{currentStep}</p>}

        {isComplete && fileName && <p className="mt-1 text-sm text-zinc-400">{fileName}</p>}

        {isFailed && error && (
          <p className="mt-2 text-sm text-red-400 text-center max-w-md">{error}</p>
        )}
      </div>

      {/* Progress Bar */}
      {!isFinished && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex justify-between px-2">
        {STATUS_STEPS.map((step, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          const isCurrent = isActive && !isFinished;

          return (
            <div key={step.status} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                  isPast || (isComplete && index <= currentIndex)
                    ? 'bg-green-500/20 text-green-400'
                    : isCurrent
                      ? 'bg-primary/20 text-primary'
                      : 'bg-white/5 text-zinc-500',
                )}
              >
                {isPast || (isComplete && index <= currentIndex) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn('text-xs', isPast || isActive ? 'text-zinc-300' : 'text-zinc-500')}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-500/10">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400">
                {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
              </p>
              <ul className="mt-1 text-xs text-zinc-400 list-disc list-inside">
                {warnings.slice(0, 3).map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
                {warnings.length > 3 && <li>...and {warnings.length - 3} more</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {isFinished && (
        <div className="flex justify-center gap-3 pt-4">
          {isComplete && (
            <Button onClick={onDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Package
            </Button>
          )}
          <Button variant="outline" onClick={onReset} className="border-white/10">
            {isComplete ? 'Export Another' : 'Try Again'}
          </Button>
        </div>
      )}
    </div>
  );
}
