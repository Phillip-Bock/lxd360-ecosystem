'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MetricData {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}

interface Stats11Props {
  metrics?: MetricData[];
  title?: string;
  description?: string;
}

const defaultMetrics: MetricData[] = [
  { label: 'Course Completion', value: 78, max: 100, color: 'blue', suffix: '%' },
  { label: 'Student Engagement', value: 85, max: 100, color: 'green', suffix: '%' },
  { label: 'Assessment Pass Rate', value: 92, max: 100, color: 'purple', suffix: '%' },
  { label: 'Content Coverage', value: 65, max: 100, color: 'amber', suffix: '%' },
];

const colorMap: Record<string, { bar: string; bg: string; text: string }> = {
  blue: {
    bar: 'bg-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
  },
  green: {
    bar: 'bg-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
  },
  purple: {
    bar: 'bg-purple-500',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
  },
  amber: {
    bar: 'bg-amber-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
  },
  red: {
    bar: 'bg-red-500',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
  },
};

export function Stats11({
  metrics = defaultMetrics,
  title = 'Performance Metrics',
  description = 'Track your curriculum effectiveness',
}: Stats11Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('rounded-xl p-6', 'bg-gray-900/60 border border-gray-800', 'backdrop-blur-sm')}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>

      <div className="space-y-5">
        {metrics.map((metric, index) => {
          const colors = colorMap[metric.color] || colorMap.blue;
          const percentage = (metric.value / metric.max) * 100;

          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">{metric.label}</span>
                <span className={cn('text-sm font-semibold', colors.text)}>
                  {metric.value}
                  {metric.suffix}
                </span>
              </div>
              <div className={cn('h-2 rounded-full overflow-hidden', colors.bg)}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', colors.bar)}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default Stats11;
