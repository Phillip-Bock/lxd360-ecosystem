'use client';

import { AlertTriangle, Lightbulb, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/core/utils';

export interface AIInsight {
  id: string | number;
  type: 'recommendation' | 'prediction' | 'opportunity' | 'anomaly';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

const defaultInsights: AIInsight[] = [
  {
    id: 1,
    type: 'recommendation',
    title: 'Optimize Module 3',
    description: 'High drop-off detected. Consider splitting into 2 shorter modules.',
    impact: 'high',
  },
  {
    id: 2,
    type: 'prediction',
    title: 'Completion Risk',
    description: '12 learners predicted to miss deadline without intervention.',
    impact: 'medium',
  },
  {
    id: 3,
    type: 'opportunity',
    title: 'Content Gap',
    description: 'Learners searching for "advanced HIPAA" - consider creating course.',
    impact: 'high',
  },
  {
    id: 4,
    type: 'anomaly',
    title: 'Unusual Pattern',
    description: 'Quiz retake rate 40% higher than baseline in Sales cohort.',
    impact: 'medium',
  },
];

interface AIInsightsWidgetProps {
  insights?: AIInsight[];
  maxItems?: number;
  className?: string;
}

export function AIInsightsWidget({
  insights = defaultInsights,
  maxItems = 4,
  className,
}: AIInsightsWidgetProps) {
  const icons = {
    recommendation: Lightbulb,
    prediction: TrendingUp,
    opportunity: Sparkles,
    anomaly: AlertTriangle,
  };

  const colors = {
    recommendation: 'text-brand-cyan bg-cyan-400/10',
    prediction: 'text-brand-cyan bg-blue-400/10',
    opportunity: 'text-brand-success bg-green-400/10',
    anomaly: 'text-brand-warning bg-amber-400/10',
  };

  const impactColors = {
    high: 'text-brand-error',
    medium: 'text-brand-warning',
    low: 'text-brand-muted',
  };

  return (
    <div className={cn('space-y-3', className)}>
      {insights.slice(0, maxItems).map((insight) => {
        const Icon = icons[insight.type];
        return (
          <div
            key={insight.id}
            className="p-3 bg-studio-bg rounded-lg hover:bg-studio-bg transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className={cn('p-2 rounded-lg shrink-0', colors[insight.type])}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-brand-primary truncate group-hover:text-brand-cyan transition-colors">
                    {insight.title}
                  </h4>
                  <span
                    className={cn('text-xs font-medium uppercase', impactColors[insight.impact])}
                  >
                    {insight.impact}
                  </span>
                </div>
                <p className="text-xs text-brand-muted mt-1 line-clamp-2">{insight.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
