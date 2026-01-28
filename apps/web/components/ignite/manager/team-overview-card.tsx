'use client';

import { motion } from 'framer-motion';
import { Activity, TrendingDown, TrendingUp, UserCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TeamOverviewCardProps {
  /** Total number of team members */
  totalMembers: number;
  /** Number of active learners (engaged in last 7 days) */
  activeLearners: number;
  /** Change in active learners compared to last period */
  activeChange?: number;
  /** Number of members currently online */
  onlineNow?: number;
  /** Optional className for styling */
  className?: string;
}

/**
 * TeamOverviewCard - Displays team overview metrics
 *
 * Shows:
 * - Total team members
 * - Active learners with trend
 * - Members currently online
 */
export function TeamOverviewCard({
  totalMembers,
  activeLearners,
  activeChange = 0,
  onlineNow = 0,
  className,
}: TeamOverviewCardProps) {
  const isPositiveTrend = activeChange >= 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
  const activePercentage = totalMembers > 0 ? Math.round((activeLearners / totalMembers) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn('bg-card/60 backdrop-blur-sm', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
            Team Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Total Members */}
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-lxd-primary)]/10 mx-auto mb-2">
                <Users className="w-5 h-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
              <p className="text-xs text-muted-foreground">Total Members</p>
            </div>

            {/* Active Learners */}
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-lxd-success)]/10 mx-auto mb-2">
                <UserCheck className="w-5 h-5 text-[var(--color-lxd-success)]" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-foreground">{activeLearners}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendIcon
                  className={cn(
                    'w-3 h-3',
                    isPositiveTrend
                      ? 'text-[var(--color-lxd-success)]'
                      : 'text-[var(--color-lxd-error)]',
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'text-xs font-medium',
                    isPositiveTrend
                      ? 'text-[var(--color-lxd-success)]'
                      : 'text-[var(--color-lxd-error)]',
                  )}
                >
                  {isPositiveTrend ? '+' : ''}
                  {activeChange}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{activePercentage}% active</p>
            </div>

            {/* Online Now */}
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-neural-cyan)]/10 mx-auto mb-2">
                <Activity className="w-5 h-5 text-[var(--color-neural-cyan)]" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-foreground">{onlineNow}</p>
              <p className="text-xs text-muted-foreground">Online Now</p>
              {onlineNow > 0 && (
                <span className="inline-flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-lxd-success)] animate-pulse" />
                  <span className="text-xs text-[var(--color-lxd-success)]">Live</span>
                </span>
              )}
            </div>
          </div>

          {/* Activity Bar */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Team Engagement</span>
              <span className="font-medium text-foreground">{activePercentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${activePercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  activePercentage >= 75
                    ? 'bg-[var(--color-lxd-success)]'
                    : activePercentage >= 50
                      ? 'bg-[var(--color-lxd-caution)]'
                      : 'bg-[var(--color-lxd-error)]',
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TeamOverviewCard;
