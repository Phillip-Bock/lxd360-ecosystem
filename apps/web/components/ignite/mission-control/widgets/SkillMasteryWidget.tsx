'use client';

import { Target } from 'lucide-react';
import type { SkillMasteryData } from '../types';
import { SkillBar } from './SkillBar';
import { WidgetCard } from './WidgetCard';

export interface SkillMasteryWidgetProps {
  /** Skill mastery data from BKT */
  skills: SkillMasteryData[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when skill is clicked */
  onSkillClick?: (skillId: string) => void;
  /** Additional class names */
  className?: string;
}

/**
 * SkillMasteryWidget - Displays BKT-powered skill mastery tracking
 *
 * Powered by Phase 7 BKT (Bayesian Knowledge Tracing)
 *
 * Features:
 * - Real-time mastery levels from BKT
 * - Trend indicators
 * - Click to view skill details
 */
export function SkillMasteryWidget({
  skills,
  isLoading = false,
  onSkillClick,
  className,
}: SkillMasteryWidgetProps) {
  return (
    <WidgetCard
      title="Skill Mastery"
      subtitle="BKT-powered tracking"
      icon={<Target className="h-4 w-4 text-cyan-400" />}
      accentColor="cyan"
      size="medium"
      isLoading={isLoading}
      className={className}
    >
      <div className="space-y-1">
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No skill data available yet. Complete some learning activities to see your progress.
          </p>
        ) : (
          skills.map((skill) => (
            <button
              key={skill.skillId}
              type="button"
              onClick={() => onSkillClick?.(skill.skillId)}
              className="w-full text-left hover:bg-muted/20 rounded-lg p-1 -mx-1 transition-colors"
            >
              <SkillBar skill={skill.skillName} level={skill.mastery} trend={skill.trend} />
            </button>
          ))
        )}
      </div>
    </WidgetCard>
  );
}
