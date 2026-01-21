'use client';

import { Activity, CheckCircle, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Metric {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}

const defaultMetrics: Metric[] = [
  {
    label: 'Average API Response Time',
    value: '127ms',
    icon: <Clock className="h-5 w-5" />,
    trend: '+3% from last week',
  },
  {
    label: 'Request Success Rate',
    value: '99.98%',
    icon: <CheckCircle className="h-5 w-5" />,
    trend: '+0.01% from last week',
  },
  {
    label: 'Active Users',
    value: '47,523',
    icon: <Users className="h-5 w-5" />,
    trend: '+12% from last week',
  },
  {
    label: 'Content Delivery Speed',
    value: '89ms',
    icon: <Activity className="h-5 w-5" />,
    trend: '-5% from last week',
  },
];

interface MetricsDashboardProps {
  metrics?: Metric[];
  defaultExpanded?: boolean;
}

export function MetricsDashboard({
  metrics = defaultMetrics,
  defaultExpanded = false,
}: MetricsDashboardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Performance Metrics</h2>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-[var(--brand-primary)] hover:underline"
        >
          {isExpanded ? 'Hide' : 'Show'} Metrics
        </button>
      </div>

      {isExpanded && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, idx) => (
            <Card key={idx} className="border-brand-default bg-surface-card text-brand-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-sm font-normal text-brand-muted">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]">
                    {metric.icon}
                  </div>
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metric.value}</div>
                <div className="mt-2 text-xs text-brand-muted">{metric.trend}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
