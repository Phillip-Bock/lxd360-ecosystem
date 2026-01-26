'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface GradeCellProps {
  /** The score achieved (null if not submitted) */
  score: number | null;
  /** Maximum possible score */
  maxScore: number;
  /** Whether the assignment was submitted */
  submitted: boolean;
  /** Assignment name for tooltip */
  assignmentName?: string;
  /** Date submitted */
  submittedAt?: Date;
  /** Date graded */
  gradedAt?: Date;
  /** Show percentage instead of raw score */
  showPercentage?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getGradeColor(score: number | null, maxScore: number): string {
  if (score === null) return 'text-muted-foreground';

  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) return 'text-[var(--color-lxd-success)]';
  if (percentage >= 70) return 'text-[var(--color-lxd-caution)]';
  return 'text-[var(--color-lxd-error)]';
}

function getGradeBackground(score: number | null, maxScore: number): string {
  if (score === null) return 'bg-muted/50';

  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) return 'bg-[var(--color-lxd-success)]/10';
  if (percentage >= 70) return 'bg-[var(--color-lxd-caution)]/10';
  return 'bg-[var(--color-lxd-error)]/10';
}

function formatDate(date: Date | undefined): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GradeCell({
  score,
  maxScore,
  submitted,
  assignmentName,
  submittedAt,
  gradedAt,
  showPercentage = false,
  className,
}: GradeCellProps): React.ReactElement {
  // Not submitted state
  if (!submitted) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              role="img"
              className={cn(
                'inline-flex items-center justify-center px-2 py-1 rounded text-sm',
                'text-muted-foreground bg-muted/30',
                className,
              )}
              aria-label="Not submitted"
            >
              —
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Not submitted</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Calculate display value
  const displayValue = showPercentage
    ? score !== null
      ? `${Math.round((score / maxScore) * 100)}%`
      : '—'
    : score !== null
      ? `${score}/${maxScore}`
      : '—';

  const colorClass = getGradeColor(score, maxScore);
  const bgClass = getGradeBackground(score, maxScore);

  // Build tooltip content
  const tooltipLines: string[] = [];
  if (assignmentName) tooltipLines.push(assignmentName);
  if (score !== null) {
    tooltipLines.push(`Score: ${score}/${maxScore} (${Math.round((score / maxScore) * 100)}%)`);
  }
  if (submittedAt) tooltipLines.push(`Submitted: ${formatDate(submittedAt)}`);
  if (gradedAt) tooltipLines.push(`Graded: ${formatDate(gradedAt)}`);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="img"
            className={cn(
              'inline-flex items-center justify-center px-2 py-1 rounded text-sm font-medium tabular-nums',
              colorClass,
              bgClass,
              'transition-colors cursor-default',
              className,
            )}
            aria-label={score !== null ? `${score} out of ${maxScore}` : 'Not graded'}
          >
            {displayValue}
          </span>
        </TooltipTrigger>
        {tooltipLines.length > 0 && (
          <TooltipContent>
            <div className="space-y-0.5">
              {tooltipLines.map((line, index) => (
                <p key={index} className="text-xs">
                  {line}
                </p>
              ))}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export default GradeCell;
