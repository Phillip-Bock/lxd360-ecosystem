'use client';

import { AlertTriangle, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export type LearnerStatus = 'passing' | 'failing' | 'incomplete';

export interface GradebookEntry {
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  overallGrade: number;
  status: LearnerStatus;
}

export interface GradeSummaryProps {
  /** Learner entries to calculate statistics from */
  learners: GradebookEntry[];
  /** Additional CSS classes */
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

// ============================================================================
// STAT CARD SUBCOMPONENT
// ============================================================================

function StatCard({
  title,
  value,
  description,
  icon,
  variant = 'default',
}: StatCardProps): React.ReactElement {
  const variantStyles = {
    default: 'text-foreground',
    success: 'text-[var(--color-lxd-success)]',
    warning: 'text-[var(--color-lxd-caution)]',
    danger: 'text-[var(--color-lxd-error)]',
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('size-4', variantStyles[variant])}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', variantStyles[variant])}>{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GRADE DISTRIBUTION BAR
// ============================================================================

interface DistributionBarProps {
  passing: number;
  failing: number;
  incomplete: number;
  total: number;
}

function DistributionBar({
  passing,
  failing,
  incomplete,
  total,
}: DistributionBarProps): React.ReactElement {
  if (total === 0) {
    return <div role="img" className="h-3 w-full bg-muted/50 rounded-full" aria-label="No data" />;
  }

  const passingPct = (passing / total) * 100;
  const failingPct = (failing / total) * 100;
  const incompletePct = (incomplete / total) * 100;

  return (
    <div
      className="h-3 w-full bg-muted/30 rounded-full overflow-hidden flex"
      role="img"
      aria-label={`Grade distribution: ${passing} passing, ${failing} failing, ${incomplete} incomplete`}
    >
      {passingPct > 0 && (
        <div
          className="h-full bg-[var(--color-lxd-success)] transition-all"
          style={{ width: `${passingPct}%` }}
        />
      )}
      {failingPct > 0 && (
        <div
          className="h-full bg-[var(--color-lxd-error)] transition-all"
          style={{ width: `${failingPct}%` }}
        />
      )}
      {incompletePct > 0 && (
        <div
          className="h-full bg-muted-foreground/50 transition-all"
          style={{ width: `${incompletePct}%` }}
        />
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GradeSummary({ learners, className }: GradeSummaryProps): React.ReactElement {
  // Calculate statistics
  const totalLearners = learners.length;

  const passingLearners = learners.filter((l) => l.status === 'passing').length;
  const failingLearners = learners.filter((l) => l.status === 'failing').length;
  const incompleteLearners = learners.filter((l) => l.status === 'incomplete').length;

  // Calculate average score (only from learners with grades)
  const learnersWithGrades = learners.filter((l) => l.status !== 'incomplete');
  const classAverage =
    learnersWithGrades.length > 0
      ? Math.round(
          learnersWithGrades.reduce((sum, l) => sum + l.overallGrade, 0) /
            learnersWithGrades.length,
        )
      : 0;

  // Calculate pass rate
  const passRate =
    learnersWithGrades.length > 0
      ? Math.round((passingLearners / learnersWithGrades.length) * 100)
      : 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Learners"
          value={totalLearners}
          description={`${incompleteLearners} incomplete`}
          icon={<Users className="size-4" aria-hidden="true" />}
          variant="default"
        />
        <StatCard
          title="Class Average"
          value={`${classAverage}%`}
          description="Based on graded submissions"
          icon={<TrendingUp className="size-4" aria-hidden="true" />}
          variant={classAverage >= 70 ? 'success' : 'warning'}
        />
        <StatCard
          title="Pass Rate"
          value={`${passRate}%`}
          description={`${passingLearners} of ${learnersWithGrades.length} passing`}
          icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
          variant="success"
        />
        <StatCard
          title="At Risk"
          value={failingLearners}
          description="Learners below passing grade"
          icon={<AlertTriangle className="size-4" aria-hidden="true" />}
          variant={failingLearners > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Distribution Bar */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Grade Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DistributionBar
            passing={passingLearners}
            failing={failingLearners}
            incomplete={incompleteLearners}
            total={totalLearners}
          />
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full bg-[var(--color-lxd-success)]"
                aria-hidden="true"
              />
              <span>Passing ({passingLearners})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full bg-[var(--color-lxd-error)]"
                aria-hidden="true"
              />
              <span>Failing ({failingLearners})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-muted-foreground/50" aria-hidden="true" />
              <span>Incomplete ({incompleteLearners})</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GradeSummary;
