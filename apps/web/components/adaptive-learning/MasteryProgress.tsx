'use client';

import { cn } from '@/lib/utils';

type MasteryLevel = 'novice' | 'developing' | 'proficient' | 'mastered';

interface SkillMastery {
  skillId: string;
  skillName: string;
  masteryProbability: number;
  masteryLevel: MasteryLevel;
  totalAttempts: number;
  successRate: number;
  nextReviewDue?: string;
  isOverdue?: boolean;
}

interface MasteryProgressProps {
  skills: SkillMastery[];
  title?: string;
  showReviewStatus?: boolean;
  compact?: boolean;
  className?: string;
}

const MASTERY_CONFIG: Record<
  MasteryLevel,
  {
    label: string;
    color: string;
    bgColor: string;
    emoji: string;
  }
> = {
  novice: {
    label: 'Novice',
    color: 'text-muted-foreground',
    bgColor: 'bg-secondary',
    emoji: '🌱',
  },
  developing: {
    label: 'Developing',
    color: 'text-brand-warning',
    bgColor: 'bg-brand-warning',
    emoji: '📈',
  },
  proficient: {
    label: 'Proficient',
    color: 'text-brand-success',
    bgColor: 'bg-brand-success',
    emoji: '✨',
  },
  mastered: {
    label: 'Mastered',
    color: 'text-brand-success',
    bgColor: 'bg-brand-success',
    emoji: '🏆',
  },
};

function formatReviewStatus(nextReviewDue?: string): { text: string; urgent: boolean } {
  if (!nextReviewDue) return { text: 'No review scheduled', urgent: false };

  const dueDate = new Date(nextReviewDue);
  const now = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)} days overdue`, urgent: true };
  } else if (diffDays === 0) {
    return { text: 'Review today', urgent: true };
  } else if (diffDays === 1) {
    return { text: 'Review tomorrow', urgent: false };
  } else if (diffDays <= 7) {
    return { text: `Review in ${diffDays} days`, urgent: false };
  } else {
    return { text: dueDate.toLocaleDateString(), urgent: false };
  }
}

function SkillProgressBar({
  skill,
  showReviewStatus,
}: {
  skill: SkillMastery;
  showReviewStatus: boolean;
}): React.JSX.Element {
  const config = MASTERY_CONFIG[skill.masteryLevel];
  const percentage = skill.masteryProbability * 100;
  const reviewStatus = formatReviewStatus(skill.nextReviewDue);

  return (
    <div className="group">
      {/* Skill name and level */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">{config.emoji}</span>
          <span className="text-sm font-medium text-lxd-text-light-primary">{skill.skillName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
          <span className="text-xs text-lxd-text-light-muted">{percentage.toFixed(0)}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-lxd-dark-surface rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500', config.bgColor)}
          style={{ width: `${percentage}%` }}
        />
        {/* Threshold markers */}
        <div className="absolute inset-0 flex">
          <div className="w-[40%] border-r border-lxd-dark-page/30" title="Novice/Developing" />
          <div className="w-[30%] border-r border-lxd-dark-page/30" title="Developing/Proficient" />
          <div className="w-[25%] border-r border-lxd-dark-page/30" title="Proficient/Mastered" />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mt-1 text-xs text-lxd-text-light-muted">
        <span>
          {skill.totalAttempts} attempts • {(skill.successRate * 100).toFixed(0)}% success
        </span>
        {showReviewStatus && (
          <span className={cn(reviewStatus.urgent && 'text-brand-warning font-medium')}>
            {reviewStatus.text}
          </span>
        )}
      </div>
    </div>
  );
}

function CompactSkillBadge({ skill }: { skill: SkillMastery }): React.JSX.Element {
  const config = MASTERY_CONFIG[skill.masteryLevel];
  const percentage = skill.masteryProbability * 100;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg',
        'bg-lxd-dark-surface border border-lxd-dark-surface-alt',
        'hover:bg-lxd-dark-surface-alt transition-colors cursor-default',
      )}
      title={`${skill.skillName}: ${percentage.toFixed(0)}% (${config.label})`}
    >
      <span className="text-xs">{config.emoji}</span>
      <span className="text-xs font-medium text-lxd-text-light-primary truncate max-w-[100px]">
        {skill.skillName}
      </span>
      <div className="w-12 h-1.5 bg-lxd-dark-page rounded-full overflow-hidden">
        <div className={cn('h-full', config.bgColor)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export function MasteryProgress({
  skills,
  title = 'Skill Mastery',
  showReviewStatus = true,
  compact = false,
  className,
}: MasteryProgressProps): React.JSX.Element {
  // Sort by mastery level (lowest first for focus)
  const sortedSkills = [...skills].sort((a, b) => a.masteryProbability - b.masteryProbability);

  // Calculate summary stats
  const avgMastery =
    skills.length > 0
      ? skills.reduce((sum, s) => sum + s.masteryProbability, 0) / skills.length
      : 0;
  const overdueCount = skills.filter((s) => {
    if (!s.nextReviewDue) return false;
    return new Date(s.nextReviewDue) < new Date();
  }).length;

  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {sortedSkills.map((skill) => (
          <CompactSkillBadge key={skill.skillId} skill={skill} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-lxd-dark-surface p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lxd-text-light-primary">{title}</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-lxd-text-light-muted">
            Avg:{' '}
            <span className="font-medium text-lxd-text-light-secondary">
              {(avgMastery * 100).toFixed(0)}%
            </span>
          </span>
          {overdueCount > 0 && (
            <span className="flex items-center gap-1 text-brand-warning">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {overdueCount} due for review
            </span>
          )}
        </div>
      </div>

      {/* Skills list */}
      <div className="space-y-4">
        {sortedSkills.map((skill) => (
          <SkillProgressBar key={skill.skillId} skill={skill} showReviewStatus={showReviewStatus} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-lxd-dark-surface flex flex-wrap gap-3 text-xs text-lxd-text-light-muted">
        {Object.entries(MASTERY_CONFIG).map(([level, config]) => (
          <div key={level} className="flex items-center gap-1">
            <div className={cn('w-2 h-2 rounded-full', config.bgColor)} />
            <span>{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
