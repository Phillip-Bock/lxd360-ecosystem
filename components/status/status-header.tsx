'use client';

import { Activity, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatusHeaderProps {
  overallStatus?: 'operational' | 'degraded' | 'outage';
  uptime90d?: number;
}

export function StatusHeader({
  overallStatus = 'operational',
  uptime90d = 99.97,
}: StatusHeaderProps) {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        setLastUpdated(new Date());
        setIsRefreshing(false);
      }, 500);
    }, 60000); // Auto-refresh every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    operational: {
      text: 'All Systems Operational',
      color: 'text-brand-success',
      dotColor: 'bg-brand-success',
    },
    degraded: {
      text: 'Some Systems Experiencing Issues',
      color: 'text-yellow-500',
      dotColor: 'bg-brand-warning',
    },
    outage: {
      text: 'Major System Outage',
      color: 'text-brand-error',
      dotColor: 'bg-brand-error',
    },
  };

  const config = statusConfig[overallStatus];

  return (
    <header className="mb-12">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-primary)]">
          <Activity className="h-6 w-6 text-brand-primary" />
        </div>
        <h1 className="text-3xl font-bold">LXD360 Status</h1>
      </div>

      <div className="rounded-2xl bg-surface-card p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-4 w-4 items-center justify-center">
            <div className={`h-3 w-3 animate-pulse rounded-full ${config.dotColor}`} />
          </div>
          <h2 className={`text-2xl font-semibold ${config.color}`}>{config.text}</h2>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-brand-muted">
            <span className="text-lg font-semibold text-brand-primary">{uptime90d}%</span>
            <span>uptime last 90 days</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-brand-muted">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
