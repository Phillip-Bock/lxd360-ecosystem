'use client';

import { motion } from 'framer-motion';
import { BookOpen, HardDrive, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  totalCourses: number;
  activeStudents: number;
  storageUsed: string;
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
        'relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm p-6',
        'hover:border-gray-700 transition-all duration-300',
        'group',
      )}
    >
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                trendUp ? 'text-blue-400' : 'text-gray-500',
              )}
            >
              {trendUp && <TrendingUp className="h-4 w-4" />}
              <span>{trend}</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            'bg-blue-600/10 border border-blue-500/20',
            'group-hover:bg-blue-600/20 group-hover:border-blue-500/30 transition-colors duration-300',
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export function StatsCards({ totalCourses, activeStudents, storageUsed }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Courses"
        value={totalCourses}
        icon={<BookOpen className="h-6 w-6 text-blue-400" />}
        trend="+2 this month"
        trendUp={true}
        delay={0}
      />
      <StatCard
        title="Active Students"
        value={activeStudents}
        icon={<Users className="h-6 w-6 text-blue-400" />}
        trend="+12% growth"
        trendUp={true}
        delay={0.1}
      />
      <StatCard
        title="Storage Used"
        value={storageUsed}
        icon={<HardDrive className="h-6 w-6 text-blue-400" />}
        trend="of 5GB"
        trendUp={false}
        delay={0.2}
      />
    </div>
  );
}
