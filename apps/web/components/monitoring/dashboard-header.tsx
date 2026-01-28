'use client';

import { motion } from 'framer-motion';
import { Activity, Globe, Server } from 'lucide-react';
import type { MonitoringDashboardData, ServiceHealth } from '@/lib/monitoring/types';
import { cn } from '@/lib/utils';
import { LiveIndicator } from './live-indicator';
import { PulseRing } from './pulse-ring';

interface DashboardHeaderProps {
  data?: MonitoringDashboardData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

const healthLabels: Record<ServiceHealth, string> = {
  healthy: 'All Systems Operational',
  warning: 'Performance Degradation',
  critical: 'System Issues Detected',
  unknown: 'Status Unknown',
};

export function DashboardHeader({
  data,
  onRefresh,
  isRefreshing,
  className,
}: DashboardHeaderProps) {
  const overallHealth = data?.overallHealth || 'unknown';
  const connectedServices = data?.services.filter((s) => s.connected).length || 0;
  const totalServices = data?.services.length || 0;

  return (
    <div className={cn('relative', className)}>
      {/* Background gradient */}
      <div
        className="absolute inset-0 rounded-2xl opacity-50"
        style={{
          background:
            overallHealth === 'healthy'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
              : overallHealth === 'warning'
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, transparent 50%)'
                : overallHealth === 'critical'
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, transparent 50%)'
                  : 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, transparent 50%)',
        }}
      />

      <div className="relative p-6 md:p-8">
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <motion.h1
              className="text-2xl md:text-3xl font-bold text-brand-primary mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              System Monitor
            </motion.h1>
            <motion.p
              className="text-brand-primary/60 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Real-time infrastructure and application monitoring
            </motion.p>
          </div>

          <LiveIndicator
            isLive={!isRefreshing}
            lastUpdated={data?.lastUpdated}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Status banner */}
        <motion.div
          className={cn(
            'flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-xl border backdrop-blur-xs',
            overallHealth === 'healthy' && 'bg-brand-success/5 border-emerald-500/20',
            overallHealth === 'warning' && 'bg-brand-warning/5 border-amber-500/20',
            overallHealth === 'critical' && 'bg-brand-error/5 border-brand-error/20',
            overallHealth === 'unknown' && 'bg-gray-500/5 border-gray-500/20',
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Main status */}
          <div className="flex items-center gap-4">
            <PulseRing health={overallHealth} size="lg" />
            <div>
              <h2
                className={cn(
                  'text-xl font-semibold',
                  overallHealth === 'healthy' && 'text-brand-success',
                  overallHealth === 'warning' && 'text-brand-warning',
                  overallHealth === 'critical' && 'text-brand-error',
                  overallHealth === 'unknown' && 'text-brand-muted',
                )}
              >
                {healthLabels[overallHealth]}
              </h2>
              <p className="text-sm text-brand-primary/50">
                {connectedServices}/{totalServices} services connected
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6">
            <QuickStat
              icon={Server}
              label="Services"
              value={`${connectedServices}/${totalServices}`}
              health={connectedServices === totalServices ? 'healthy' : 'warning'}
            />
            <QuickStat icon={Activity} label="Uptime" value="99.9%" health="healthy" />
            <QuickStat icon={Globe} label="Regions" value="3" health="healthy" />
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-30">
        <svg aria-hidden="true" viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor={
                  overallHealth === 'healthy'
                    ? 'var(--color-lxd-success)'
                    : overallHealth === 'warning'
                      ? 'var(--color-lxd-warning)'
                      : 'var(--color-lxd-error)'
                }
                stopOpacity="0.5"
              />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="url(#header-gradient)"
            strokeWidth="0.5"
          />
          <circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="url(#header-gradient)"
            strokeWidth="0.3"
          />
          <circle
            cx="100"
            cy="100"
            r="40"
            fill="none"
            stroke="url(#header-gradient)"
            strokeWidth="0.2"
          />
        </svg>
      </div>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  health,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  health: ServiceHealth;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'p-2 rounded-lg',
          health === 'healthy' && 'bg-brand-success/10 text-brand-success',
          health === 'warning' && 'bg-brand-warning/10 text-brand-warning',
          health === 'critical' && 'bg-brand-error/10 text-brand-error',
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-brand-primary/40">{label}</p>
        <p className="text-sm font-semibold text-brand-primary/90">{value}</p>
      </div>
    </div>
  );
}
