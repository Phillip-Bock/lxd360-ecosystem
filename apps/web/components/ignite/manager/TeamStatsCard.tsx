'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TeamStats } from './types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  delay?: number;
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  variant = 'default',
  delay = 0,
}: StatCardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;

  const variantStyles = {
    default: 'from-lxd-primary/5',
    success: 'from-emerald-500/5',
    warning: 'from-amber-500/5',
    danger: 'from-red-500/5',
  };

  const iconVariantStyles = {
    default: 'bg-lxd-primary/10 border-lxd-primary/20 text-lxd-primary',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    danger: 'bg-red-500/10 border-red-500/20 text-red-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6',
        'hover:border-border/80 transition-all duration-300',
        'group'
      )}
    >
      {/* Background gradient accent */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          variantStyles[variant]
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                isPositiveTrend ? 'text-emerald-500' : 'text-red-500'
              )}
            >
              <TrendIcon className="h-4 w-4" aria-hidden="true" />
              <span>
                {isPositiveTrend ? '+' : ''}
                {trend}
                {trendLabel || '%'}
              </span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg border',
            'group-hover:scale-105 transition-transform duration-300',
            iconVariantStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export interface TeamStatsCardProps {
  stats: TeamStats;
  className?: string;
}

/**
 * TeamStatsCard - KPI display for Manager Dashboard
 *
 * Displays key metrics for team oversight:
 * - Total learners with change indicator
 * - Average completion rate
 * - Average score
 * - Overdue assignments (warning/danger states)
 * - Compliance rate
 */
export function TeamStatsCard({ stats, className }: TeamStatsCardProps) {
  const getOverdueVariant = (count: number): 'default' | 'warning' | 'danger' => {
    if (count === 0) return 'default';
    if (count <= 5) return 'warning';
    return 'danger';
  };

  const getComplianceVariant = (rate: number): 'default' | 'success' | 'warning' | 'danger' => {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'warning';
    return 'danger';
  };

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-5', className)}>
      <StatCard
        title="Total Learners"
        value={stats.totalLearners}
        icon={<Users className="h-6 w-6" aria-hidden="true" />}
        trend={stats.learnersChange}
        trendLabel=" this month"
        delay={0}
      />
      <StatCard
        title="Avg. Completion"
        value={`${stats.avgCompletionRate}%`}
        icon={<GraduationCap className="h-6 w-6" aria-hidden="true" />}
        trend={stats.completionChange}
        delay={0.1}
      />
      <StatCard
        title="Avg. Score"
        value={`${stats.avgScore}%`}
        icon={<CheckCircle2 className="h-6 w-6" aria-hidden="true" />}
        trend={stats.scoreChange}
        delay={0.2}
      />
      <StatCard
        title="Overdue"
        value={stats.overdueAssignments}
        icon={<AlertTriangle className="h-6 w-6" aria-hidden="true" />}
        trend={stats.overdueChange}
        trendLabel=" vs last week"
        variant={getOverdueVariant(stats.overdueAssignments)}
        delay={0.3}
      />
      <StatCard
        title="Compliance Rate"
        value={`${stats.complianceRate}%`}
        icon={<ShieldCheck className="h-6 w-6" aria-hidden="true" />}
        trend={stats.complianceChange}
        variant={getComplianceVariant(stats.complianceRate)}
        delay={0.4}
      />
    </div>
  );
}

export default TeamStatsCard;
