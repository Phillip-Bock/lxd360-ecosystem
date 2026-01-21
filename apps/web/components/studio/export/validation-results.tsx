'use client';

/**
 * ValidationResults - Display pre-export validation results
 *
 * Shows errors, warnings, and info messages from lesson validation
 * with suggestions for fixing issues.
 */

import { AlertCircle, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  ValidationIssue,
  ValidationResult,
  ValidationSeverity,
} from '@/types/studio/publishing';

// =============================================================================
// TYPES
// =============================================================================

interface ValidationResultsProps {
  result: ValidationResult;
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

const severityConfig: Record<
  ValidationSeverity,
  { icon: React.ReactNode; color: string; bgColor: string; label: string }
> = {
  error: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    label: 'Error',
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    label: 'Warning',
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    label: 'Info',
  },
};

function IssueItem({ issue }: { issue: ValidationIssue }) {
  const config = severityConfig[issue.severity];

  return (
    <div className={cn('p-3 rounded-lg', config.bgColor)}>
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', config.color)}>{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
            {issue.code && <span className="text-xs text-zinc-500 font-mono">[{issue.code}]</span>}
          </div>
          <p className="mt-1 text-sm text-zinc-300">{issue.message}</p>
          {issue.path && (
            <p className="mt-1 text-xs text-zinc-500 font-mono">Location: {issue.path}</p>
          )}
          {issue.suggestion && (
            <p className="mt-2 text-xs text-zinc-400">
              <span className="font-medium">Suggestion:</span> {issue.suggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ValidationResults({ result, className }: ValidationResultsProps) {
  const hasIssues = result.issues.length > 0;
  const errors = result.issues.filter((i) => i.severity === 'error');
  const warnings = result.issues.filter((i) => i.severity === 'warning');
  const infos = result.issues.filter((i) => i.severity === 'info');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary */}
      <div
        className={cn(
          'flex items-center gap-3 p-4 rounded-lg',
          result.isValid ? 'bg-green-500/10' : 'bg-red-500/10',
        )}
      >
        {result.isValid ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-400">Validation Passed</p>
              <p className="text-xs text-zinc-400">
                {hasIssues
                  ? `${warnings.length} warning${warnings.length !== 1 ? 's' : ''}, ${infos.length} info message${infos.length !== 1 ? 's' : ''}`
                  : 'No issues found. Ready to export.'}
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-400">Validation Failed</p>
              <p className="text-xs text-zinc-400">
                {errors.length} error{errors.length !== 1 ? 's' : ''} must be fixed before export
              </p>
            </div>
          </>
        )}
      </div>

      {/* Issue List */}
      {hasIssues && (
        <div className="space-y-2">
          {/* Errors first */}
          {errors.map((issue, index) => (
            <IssueItem key={`error-${index}`} issue={issue} />
          ))}

          {/* Then warnings */}
          {warnings.map((issue, index) => (
            <IssueItem key={`warning-${index}`} issue={issue} />
          ))}

          {/* Then info */}
          {infos.map((issue, index) => (
            <IssueItem key={`info-${index}`} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
