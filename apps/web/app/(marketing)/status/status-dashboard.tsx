'use client';

import { Activity, AlertCircle, CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'checking';

interface ServiceHealth {
  name: string;
  description: string;
  status: ServiceStatus;
  latency?: number;
  lastChecked: Date;
  endpoint?: string;
}

interface OverallStatus {
  status: ServiceStatus;
  message: string;
}

// ============================================================================
// Service Configuration
// ============================================================================

const SERVICES_CONFIG = [
  {
    name: 'Web Application',
    description: 'Main INSPIRE Platform web interface',
    endpoint: '/api/health',
  },
  {
    name: 'Authentication',
    description: 'Firebase Authentication services',
    endpoint: '/api/auth/session',
  },
  {
    name: 'Database',
    description: 'Firestore database connectivity',
    endpoint: '/api/health/firestore',
  },
  {
    name: 'API Gateway',
    description: 'Cloud Run API endpoints',
    endpoint: '/api/health',
  },
];

// ============================================================================
// Status Dashboard Component
// ============================================================================

export function StatusDashboard() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [overallStatus, setOverallStatus] = useState<OverallStatus>({
    status: 'checking',
    message: 'Checking system status...',
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkServiceHealth = useCallback(
    async (config: (typeof SERVICES_CONFIG)[0]): Promise<ServiceHealth> => {
      const startTime = performance.now();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(config.endpoint, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });

        clearTimeout(timeoutId);
        const latency = Math.round(performance.now() - startTime);

        if (response.ok) {
          return {
            name: config.name,
            description: config.description,
            status: latency > 2000 ? 'degraded' : 'operational',
            latency,
            lastChecked: new Date(),
            endpoint: config.endpoint,
          };
        } else {
          return {
            name: config.name,
            description: config.description,
            status: 'degraded',
            latency,
            lastChecked: new Date(),
            endpoint: config.endpoint,
          };
        }
      } catch (error) {
        return {
          name: config.name,
          description: config.description,
          status: error instanceof Error && error.name === 'AbortError' ? 'degraded' : 'outage',
          lastChecked: new Date(),
          endpoint: config.endpoint,
        };
      }
    },
    [],
  );

  const checkAllServices = useCallback(async () => {
    setIsRefreshing(true);

    const results = await Promise.all(SERVICES_CONFIG.map((config) => checkServiceHealth(config)));

    setServices(results);
    setLastUpdated(new Date());

    // Calculate overall status
    const hasOutage = results.some((s) => s.status === 'outage');
    const hasDegraded = results.some((s) => s.status === 'degraded');

    if (hasOutage) {
      setOverallStatus({
        status: 'outage',
        message: 'Some services are experiencing issues',
      });
    } else if (hasDegraded) {
      setOverallStatus({
        status: 'degraded',
        message: 'Some services are experiencing degraded performance',
      });
    } else {
      setOverallStatus({
        status: 'operational',
        message: 'All systems operational',
      });
    }

    setIsRefreshing(false);
  }, [checkServiceHealth]);

  useEffect(() => {
    checkAllServices();

    // Auto-refresh every 60 seconds
    const interval = setInterval(checkAllServices, 60000);
    return () => clearInterval(interval);
  }, [checkAllServices]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Status</h1>
          <p className="text-muted-foreground mt-1">INSPIRE Platform Services</p>
        </div>
        <button
          type="button"
          onClick={checkAllServices}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Overall Status Banner */}
      <div
        className={cn(
          'rounded-xl p-6 mb-8 border',
          overallStatus.status === 'operational' && 'bg-green-500/10 border-green-500/30',
          overallStatus.status === 'degraded' && 'bg-yellow-500/10 border-yellow-500/30',
          overallStatus.status === 'outage' && 'bg-red-500/10 border-red-500/30',
          overallStatus.status === 'checking' && 'bg-muted border-border',
        )}
      >
        <div className="flex items-center gap-4">
          <StatusIcon status={overallStatus.status} size="lg" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">{overallStatus.message}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Services</h3>
        {services.length === 0 ? (
          <div className="space-y-4">
            {SERVICES_CONFIG.map((config) => (
              <ServiceCard
                key={config.name}
                service={{
                  name: config.name,
                  description: config.description,
                  status: 'checking',
                  lastChecked: new Date(),
                }}
              />
            ))}
          </div>
        ) : (
          services.map((service) => <ServiceCard key={service.name} service={service} />)
        )}
      </div>

      {/* Legend */}
      <div className="mt-12 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-3">Status Legend</h4>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <StatusIcon status="operational" size="sm" />
            <span className="text-muted-foreground">Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status="degraded" size="sm" />
            <span className="text-muted-foreground">Degraded Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status="outage" size="sm" />
            <span className="text-muted-foreground">Service Outage</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Status updates every 60 seconds. For urgent issues, contact{' '}
          <a href="mailto:support@lxd360.com" className="text-primary hover:underline">
            support@lxd360.com
          </a>
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function ServiceCard({ service }: { service: ServiceHealth }) {
  return (
    <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
      <div className="flex items-center gap-4">
        <StatusIcon status={service.status} size="md" />
        <div>
          <h4 className="font-medium text-foreground">{service.name}</h4>
          <p className="text-sm text-muted-foreground">{service.description}</p>
        </div>
      </div>
      <div className="text-right">
        <StatusBadge status={service.status} />
        {service.latency !== undefined && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3" />
            {service.latency}ms
          </p>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status, size }: { status: ServiceStatus; size: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  switch (status) {
    case 'operational':
      return <CheckCircle2 className={cn(sizeClasses[size], 'text-green-500')} />;
    case 'degraded':
      return <AlertCircle className={cn(sizeClasses[size], 'text-yellow-500')} />;
    case 'outage':
      return <XCircle className={cn(sizeClasses[size], 'text-red-500')} />;
    case 'checking':
      return <Activity className={cn(sizeClasses[size], 'text-muted-foreground animate-pulse')} />;
  }
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        status === 'operational' && 'bg-green-500/10 text-green-500',
        status === 'degraded' && 'bg-yellow-500/10 text-yellow-500',
        status === 'outage' && 'bg-red-500/10 text-red-500',
        status === 'checking' && 'bg-muted text-muted-foreground',
      )}
    >
      {status === 'operational' && 'Operational'}
      {status === 'degraded' && 'Degraded'}
      {status === 'outage' && 'Outage'}
      {status === 'checking' && 'Checking...'}
    </span>
  );
}
