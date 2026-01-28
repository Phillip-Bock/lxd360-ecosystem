'use client';

import { motion } from 'framer-motion';
import { Activity, Cloud, Database, Key, Server, Shield, Triangle, Zap } from 'lucide-react';
import type { RealtimeMetric, ServiceStatus } from '@/lib/monitoring/types';
import { formatRelativeTime } from '@/lib/monitoring/utils';
import { cn } from '@/lib/utils';
import { GlowCard } from './glow-card';
import { PulseRing } from './pulse-ring';
import { SparklineChart } from './sparkline-chart';

interface ServiceStatusCardProps {
  service: ServiceStatus;
  metrics?: RealtimeMetric[];
  onClick?: () => void;
  expanded?: boolean;
}

const iconMap: Record<string, typeof Key> = {
  key: Key,
  triangle: Triangle,
  zap: Zap,
  shield: Shield,
  cloud: Cloud,
  database: Database,
  server: Server,
  activity: Activity,
};

export function ServiceStatusCard({
  service,
  metrics,
  onClick,
  expanded = false,
}: ServiceStatusCardProps) {
  const Icon = iconMap[service.icon] || Activity;

  return (
    <GlowCard
      health={service.health}
      hoverable
      onClick={onClick}
      className={cn('transition-all duration-300', expanded && 'col-span-2')}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2.5 rounded-lg bg-brand-surface/5 border border-brand-subtle',
                service.health === 'healthy' && 'text-brand-success',
                service.health === 'warning' && 'text-brand-warning',
                service.health === 'critical' && 'text-brand-error',
                service.health === 'unknown' && 'text-brand-muted',
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-primary">{service.name}</h3>
              <p className="text-xs text-brand-primary/50">
                {service.connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
          <PulseRing health={service.health} size="sm" />
        </div>

        {/* Metrics sparkline */}
        {metrics && metrics.length > 0 && (
          <div className="mb-4">
            <SparklineChart data={metrics} health={service.health} width={200} height={50} />
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-subtle">
          <div>
            <p className="text-[10px] text-brand-primary/40 uppercase tracking-wider mb-1">
              Uptime
            </p>
            <p className="text-sm font-mono text-brand-primary/90">{service.uptime.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-[10px] text-brand-primary/40 uppercase tracking-wider mb-1">
              Latency
            </p>
            <p className="text-sm font-mono text-brand-primary/90">
              {service.latency > 0 ? `${service.latency}ms` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-brand-primary/40 uppercase tracking-wider mb-1">
              Checked
            </p>
            <p className="text-sm font-mono text-brand-primary/90">
              {formatRelativeTime(service.lastChecked)}
            </p>
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

export function ServiceStatusGrid({
  services,
  className,
}: {
  services: ServiceStatus[];
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {services.map((service, index) => (
        <motion.div
          key={service.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <ServiceStatusCard service={service} />
        </motion.div>
      ))}
    </div>
  );
}
