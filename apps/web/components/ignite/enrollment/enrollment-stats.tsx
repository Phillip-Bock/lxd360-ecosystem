'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Mail, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnrollmentStatsProps {
  totalEnrolled: number;
  activeLearners: number;
  completionRate: number;
  pendingInvites: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
}

function StatCard({ title, value, icon, trend, trendUp = true, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6',
        'hover:border-border/80 transition-all duration-300',
        'group',
      )}
    >
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-lxd-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                trendUp ? 'text-[var(--color-lxd-primary)]' : 'text-muted-foreground',
              )}
            >
              {trendUp && <TrendingUp className="h-4 w-4" aria-hidden="true" />}
              <span>{trend}</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            'bg-[var(--color-lxd-primary)]/10 border border-[var(--color-lxd-primary)]/20',
            'group-hover:bg-[var(--color-lxd-primary)]/20 group-hover:border-[var(--color-lxd-primary)]/30 transition-colors duration-300',
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export function EnrollmentStats({
  totalEnrolled,
  activeLearners,
  completionRate,
  pendingInvites,
}: EnrollmentStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Enrolled"
        value={totalEnrolled.toLocaleString()}
        icon={<Users className="h-6 w-6 text-[var(--color-lxd-primary)]" aria-hidden="true" />}
        trend="+24 this week"
        trendUp={true}
        delay={0}
      />
      <StatCard
        title="Active Learners"
        value={activeLearners.toLocaleString()}
        icon={
          <CheckCircle className="h-6 w-6 text-[var(--color-lxd-primary)]" aria-hidden="true" />
        }
        trend="+8% growth"
        trendUp={true}
        delay={0.1}
      />
      <StatCard
        title="Completion Rate"
        value={`${completionRate}%`}
        icon={<TrendingUp className="h-6 w-6 text-[var(--color-lxd-primary)]" aria-hidden="true" />}
        trend="+3% vs last month"
        trendUp={true}
        delay={0.2}
      />
      <StatCard
        title="Pending Invites"
        value={pendingInvites}
        icon={<Mail className="h-6 w-6 text-[var(--color-lxd-primary)]" aria-hidden="true" />}
        trend="5 expiring soon"
        trendUp={false}
        delay={0.3}
      />
    </div>
  );
}

export default EnrollmentStats;
