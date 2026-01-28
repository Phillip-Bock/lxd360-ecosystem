'use client';

import { motion } from 'framer-motion';
import { Activity, Cpu, Database, HardDrive, type LucideIcon, Server, Wifi } from 'lucide-react';
import { cn } from '@/lib/core/utils';

interface SystemService {
  name: string;
  icon: LucideIcon;
  status: number;
  latency: number;
}

const defaultSystems: SystemService[] = [
  { name: 'API Gateway', icon: Server, status: 99.9, latency: 42 },
  { name: 'Database', icon: Database, status: 99.8, latency: 12 },
  { name: 'AI Services', icon: Cpu, status: 98.5, latency: 156 },
  { name: 'Storage', icon: HardDrive, status: 99.9, latency: 8 },
  { name: 'CDN', icon: Wifi, status: 99.99, latency: 23 },
];

interface SystemHealthWidgetProps {
  systems?: SystemService[];
  className?: string;
}

export function SystemHealthWidget({
  systems = defaultSystems,
  className,
}: SystemHealthWidgetProps) {
  const overallHealth = systems.reduce((acc, s) => acc + s.status, 0) / systems.length;
  const healthStatus =
    overallHealth >= 99.5 ? 'NOMINAL' : overallHealth >= 99 ? 'DEGRADED' : 'CRITICAL';
  const healthColor =
    overallHealth >= 99.5
      ? 'text-brand-success'
      : overallHealth >= 99
        ? 'text-brand-warning'
        : 'text-brand-error';

  return (
    <div
      className={cn(
        'h-full bg-studio-bg/80 border border-brand-accent/20 rounded-xl overflow-hidden backdrop-blur-xs',
        className,
      )}
    >
      <div className="px-4 py-3 border-b border-brand-accent/10 flex items-center gap-2">
        <Activity className="w-4 h-4 text-brand-cyan" />
        <h3 className="text-sm font-semibold text-brand-primary tracking-wide">SYSTEM HEALTH</h3>
      </div>

      <div className="p-4">
        {/* Overall Health Score */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <svg aria-hidden="true" className="w-24 h-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="rgba(6, 182, 212, 0.1)"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="url(#healthGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: overallHealth / 100 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{
                  strokeDasharray: 251,
                  strokeDashoffset: 0,
                }}
              />
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-lxd-success)" />
                  <stop offset="100%" stopColor="var(--lxd-cyan)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-brand-primary font-mono">
                  {overallHealth.toFixed(1)}%
                </span>
                <p className={cn('text-xs font-medium', healthColor)}>{healthStatus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Systems */}
        <div className="space-y-2">
          {systems.map((system) => {
            const statusColor =
              system.status >= 99.5
                ? 'bg-green-400'
                : system.status >= 99
                  ? 'bg-amber-400'
                  : 'bg-red-400';

            return (
              <div
                key={system.name}
                className="flex items-center justify-between p-2 bg-studio-bg rounded-lg hover:bg-studio-bg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <system.icon className="w-4 h-4 text-brand-cyan" />
                  <span className="text-sm text-brand-secondary">{system.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-brand-muted font-mono">{system.latency}ms</span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('w-2 h-2 rounded-full', statusColor)} />
                    <span className="text-xs text-brand-muted font-mono">{system.status}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
