'use client';

import { AlertTriangle, Bell, CheckCircle, Clock, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/core/utils';

export interface Alert {
  id: number | string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  time: string;
}

const defaultAlerts: Alert[] = [
  {
    id: 1,
    type: 'warning',
    title: 'Certifications Expiring',
    message: '3 users have certifications expiring in 7 days',
    time: '2m ago',
  },
  {
    id: 2,
    type: 'info',
    title: 'New Course Published',
    message: 'HIPAA Advanced Training is now live',
    time: '15m ago',
  },
  {
    id: 3,
    type: 'success',
    title: 'Milestone Reached',
    message: 'Healthcare cohort reached 90% completion',
    time: '1h ago',
  },
  {
    id: 4,
    type: 'error',
    title: 'AI Service Degraded',
    message: 'Text generation latency increased by 40%',
    time: '2h ago',
  },
];

interface AlertsWidgetProps {
  alerts?: Alert[];
  maxItems?: number;
  className?: string;
}

export function AlertsWidget({
  alerts = defaultAlerts,
  maxItems = 4,
  className,
}: AlertsWidgetProps) {
  const icons = {
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
    error: XCircle,
  };

  const colors = {
    warning: 'text-brand-warning bg-amber-400/10 border-amber-400/30',
    info: 'text-brand-cyan bg-cyan-400/10 border-cyan-400/30',
    success: 'text-brand-success bg-green-400/10 border-green-400/30',
    error: 'text-brand-error bg-red-400/10 border-red-400/30',
  };

  return (
    <div
      className={cn(
        'bg-studio-bg/80 border border-brand-accent/20 rounded-xl overflow-hidden backdrop-blur-xs',
        className,
      )}
    >
      <div className="px-4 py-3 border-b border-brand-accent/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-cyan" />
          <h3 className="text-sm font-semibold text-brand-primary tracking-wide">ALERTS</h3>
        </div>
        <span className="text-xs text-brand-muted">{alerts.length} active</span>
      </div>

      <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
        {alerts.slice(0, maxItems).map((alert) => {
          const Icon = icons[alert.type];
          return (
            <div
              key={alert.id}
              className={cn(
                'p-3 rounded-lg border cursor-pointer hover:scale-[1.02] transition-transform',
                colors[alert.type],
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium text-brand-primary truncate">
                      {alert.title}
                    </h4>
                    <div className="flex items-center gap-1 text-brand-muted shrink-0">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{alert.time}</span>
                    </div>
                  </div>
                  <p className="text-xs text-brand-muted mt-1 line-clamp-2">{alert.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
