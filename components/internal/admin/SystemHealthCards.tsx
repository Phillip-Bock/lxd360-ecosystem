'use client';

import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Database,
  Globe,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/core/utils';

// ============================================================================
// TYPES
// ============================================================================

type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latency?: number; // in ms
  lastChecked: Date;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface HealthCheckResponse {
  services: {
    name: string;
    status: ServiceStatus;
    latency?: number;
    lastChecked: string;
  }[];
  overallStatus: ServiceStatus;
}

// ============================================================================
// SERVICE CONFIGURATION
// ============================================================================

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  firebase: Database,
  firestore: Database,
  stripe: CreditCard,
  cloudrun: Globe,
};

const serviceDescriptions: Record<string, string> = {
  firebase: 'Authentication & Auth',
  firestore: 'Database & Storage',
  stripe: 'Payment Processing',
  cloudrun: 'Hosting & Compute',
};

// ============================================================================
// STATUS HELPERS
// ============================================================================

function getStatusConfig(status: ServiceStatus) {
  switch (status) {
    case 'healthy':
      return {
        icon: CheckCircle,
        label: 'Healthy',
        color: 'text-brand-success',
        bgColor: 'bg-brand-success/10',
        borderColor: 'border-brand-success/20',
      };
    case 'degraded':
      return {
        icon: AlertCircle,
        label: 'Degraded',
        color: 'text-yellow-500',
        bgColor: 'bg-brand-warning/10',
        borderColor: 'border-brand-warning/20',
      };
    case 'down':
      return {
        icon: XCircle,
        label: 'Down',
        color: 'text-brand-error',
        bgColor: 'bg-brand-error/10',
        borderColor: 'border-brand-error/20',
      };
    default:
      return {
        icon: AlertCircle,
        label: 'Unknown',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        borderColor: 'border-muted',
      };
  }
}

function formatLatency(latency?: number): string {
  if (latency === undefined) return 'N/A';
  if (latency < 100) return `${latency}ms`;
  if (latency < 1000) return `${latency}ms`;
  return `${(latency / 1000).toFixed(1)}s`;
}

function formatLastChecked(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 120) return '1 min ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  return date.toLocaleTimeString();
}

function getOverallStatus(services: ServiceHealth[]): ServiceStatus {
  const hasDown = services.some((s) => s.status === 'down');
  const hasDegraded = services.some((s) => s.status === 'degraded');

  if (hasDown) return 'down';
  if (hasDegraded) return 'degraded';
  return 'healthy';
}

// ============================================================================
// SERVICE CARD COMPONENT
// ============================================================================

interface ServiceCardProps {
  service: ServiceHealth;
}

function ServiceCard({ service }: ServiceCardProps) {
  const statusConfig = getStatusConfig(service.status);
  const StatusIcon = statusConfig.icon;
  const ServiceIcon = service.icon;

  return (
    <Card className={cn('transition-colors', statusConfig.borderColor, 'border-l-4')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ServiceIcon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium capitalize">{service.name}</CardTitle>
          </div>
          <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn('text-xs font-normal', statusConfig.bgColor, statusConfig.color)}
          >
            {statusConfig.label}
          </Badge>
          {service.latency !== undefined && (
            <span className="text-xs text-muted-foreground">{formatLatency(service.latency)}</span>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{service.description}</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          {formatLastChecked(service.lastChecked)}
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// OVERALL STATUS BADGE COMPONENT
// ============================================================================

interface OverallStatusBadgeProps {
  status: ServiceStatus;
  onRefresh: () => void;
  isRefreshing: boolean;
}

function OverallStatusBadge({ status, onRefresh, isRefreshing }: OverallStatusBadgeProps) {
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-center gap-4">
      <Badge
        variant="outline"
        className={cn('px-3 py-1 text-sm', statusConfig.bgColor, statusConfig.color)}
      >
        <StatusIcon className="mr-1.5 h-4 w-4" />
        All Systems {statusConfig.label}
      </Badge>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Refresh health status</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// ============================================================================
// SYSTEM HEALTH CARDS COMPONENT
// ============================================================================

export function SystemHealthCards() {
  const [services, setServices] = React.useState<ServiceHealth[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchHealth = React.useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/health');
      if (!response.ok) throw new Error('Failed to fetch health status');

      const data: HealthCheckResponse = await response.json();

      const healthServices: ServiceHealth[] = data.services.map((s) => ({
        name: s.name,
        status: s.status,
        latency: s.latency,
        lastChecked: new Date(s.lastChecked),
        icon: serviceIcons[s.name.toLowerCase()] || Globe,
        description: serviceDescriptions[s.name.toLowerCase()] || s.name,
      }));

      setServices(healthServices);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Set default services with unknown status
      setServices(
        Object.keys(serviceIcons).map((name) => ({
          name,
          status: 'unknown' as ServiceStatus,
          lastChecked: new Date(),
          icon: serviceIcons[name],
          description: serviceDescriptions[name],
        })),
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch and polling
  React.useEffect(() => {
    fetchHealth();

    // Poll every 60 seconds
    const interval = setInterval(() => fetchHealth(), 60000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const handleRefresh = () => fetchHealth(true);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-20 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-6 w-16 rounded bg-muted" />
              <div className="mt-2 h-3 w-24 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const overallStatus = getOverallStatus(services);

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className="flex items-center justify-between">
        <OverallStatusBadge
          status={overallStatus}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        {error && <span className="text-xs text-destructive">Error fetching status</span>}
      </div>

      {/* Service Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {services.map((service) => (
          <ServiceCard key={service.name} service={service} />
        ))}
      </div>
    </div>
  );
}
