'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// INSTRUCTOR STATS DATA STRUCTURE
// ============================================================================

export interface InstructorStat {
  id: string;
  name: string;
  stat: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  description?: string;
}

// Mock data - Replace with Firestore query in production
const instructorStats: InstructorStat[] = [
  {
    id: 'active-learners',
    name: 'Active Learners',
    stat: '1,247',
    change: '+12.1%',
    changeType: 'positive',
    description: 'Currently enrolled across all courses',
  },
  {
    id: 'completion-rate',
    name: 'Completion Rate',
    stat: '78.5%',
    change: '+5.2%',
    changeType: 'positive',
    description: 'Average course completion',
  },
  {
    id: 'avg-score',
    name: 'Avg. Assessment Score',
    stat: '84.2%',
    change: '-2.1%',
    changeType: 'negative',
    description: 'Across all assessments',
  },
  {
    id: 'engagement',
    name: 'Weekly Engagement',
    stat: '4.2hrs',
    change: '+18.3%',
    changeType: 'positive',
    description: 'Average time per learner',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function Stats04({ stats = instructorStats }: { stats?: InstructorStat[] }) {
  return (
    <div className="w-full">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card
            key={item.id}
            className={cn(
              'p-6 py-4 transition-all duration-200',
              'bg-card/80 backdrop-blur-sm',
              'border-border/50 hover:border-primary/30',
              'hover:shadow-[0_0_20px_rgba(0,114,245,0.1)]',
            )}
          >
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-muted-foreground">{item.name}</dt>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-medium inline-flex items-center px-1.5 ps-2.5 py-0.5 text-xs border-0',
                    item.changeType === 'positive'
                      ? 'bg-[var(--color-lxd-success)]/15 text-[var(--color-lxd-success)]'
                      : item.changeType === 'negative'
                        ? 'bg-[var(--color-lxd-error)]/15 text-[var(--color-lxd-error)]'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {item.changeType === 'positive' ? (
                    <TrendingUp className="mr-0.5 -ml-1 h-4 w-4 shrink-0" />
                  ) : item.changeType === 'negative' ? (
                    <TrendingDown className="mr-0.5 -ml-1 h-4 w-4 shrink-0" />
                  ) : null}
                  <span className="sr-only">
                    {item.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                  </span>
                  {item.change}
                </Badge>
              </div>
              <dd className="text-3xl font-semibold text-foreground mt-2">{item.stat}</dd>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </dl>
    </div>
  );
}

export default Stats04;
