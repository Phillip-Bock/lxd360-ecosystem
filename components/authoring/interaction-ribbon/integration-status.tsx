/**
 * =============================================================================
 * LXP360-SaaS | Interaction Ribbon - Integration Status Indicator
 * =============================================================================
 *
 * @fileoverview Component for displaying integration connection status
 *
 * =============================================================================
 */

'use client';

import {
  AlertCircle,
  CheckCircle,
  Cloud,
  Database,
  Loader2,
  type LucideIcon,
  Mail,
  RefreshCw,
  Settings,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import type { IntegrationId, IntegrationStatus } from '@/lib/integrations/types';
import { cn } from '@/lib/utils';
import type { IntegrationStatusIndicator } from './types';

// ============================================================================
// Icon Mapping
// ============================================================================

const INTEGRATION_ICONS: Record<IntegrationId, LucideIcon> = {
  openai: Sparkles,
  anthropic: Sparkles,
  'google-cloud': Cloud,
  firebase: Database,
  stripe: Settings,
  brevo: Mail,
};

const STATUS_COLORS: Record<IntegrationStatus, string> = {
  connected: 'text-brand-success',
  disconnected: 'text-brand-muted',
  error: 'text-brand-error',
  degraded: 'text-yellow-500',
  initializing: 'text-brand-blue',
  not_configured: 'text-brand-secondary',
};

const STATUS_BG_COLORS: Record<IntegrationStatus, string> = {
  connected: 'bg-brand-success',
  disconnected: 'bg-gray-400',
  error: 'bg-brand-error',
  degraded: 'bg-brand-warning',
  initializing: 'bg-brand-primary',
  not_configured: 'bg-gray-300',
};

// ============================================================================
// Integration Status Badge
// ============================================================================

interface StatusBadgeProps {
  integration: IntegrationStatusIndicator;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function IntegrationStatusBadge({
  integration,
  showLabel = false,
  size = 'md',
  onClick,
}: StatusBadgeProps) {
  const Icon = INTEGRATION_ICONS[integration.id] || Settings;
  const statusColor = STATUS_COLORS[integration.status];

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors',
        'hover:bg-muted/50',
        onClick && 'cursor-pointer',
      )}
      title={`${integration.name}: ${integration.status}${integration.message ? ` - ${integration.message}` : ''}`}
    >
      <Icon className={cn(sizeClasses[size], statusColor)} />
      {showLabel && <span className="text-xs text-muted-foreground">{integration.name}</span>}
      <span className={cn('h-2 w-2 rounded-full', STATUS_BG_COLORS[integration.status])} />
    </button>
  );
}

// ============================================================================
// Integration Status Panel
// ============================================================================

interface StatusPanelProps {
  integrations: IntegrationStatusIndicator[];
  onRefresh?: () => Promise<void>;
  onTest?: (id: IntegrationId) => Promise<void>;
  isLoading?: boolean;
}

export function IntegrationStatusPanel({
  integrations,
  onRefresh,
  onTest,
  isLoading = false,
}: StatusPanelProps) {
  const connectedCount = integrations.filter((i) => i.status === 'connected').length;
  const errorCount = integrations.filter((i) => i.status === 'error').length;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">Integration Status</h3>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-md p-1 hover:bg-muted"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </button>
        )}
      </div>

      <div className="mb-3 flex gap-4 text-sm">
        <span className="text-green-600">
          <CheckCircle className="mr-1 inline h-4 w-4" />
          {connectedCount} connected
        </span>
        {errorCount > 0 && (
          <span className="text-red-600">
            <XCircle className="mr-1 inline h-4 w-4" />
            {errorCount} error{errorCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {integrations.map((integration) => (
          <IntegrationStatusRow key={integration.id} integration={integration} onTest={onTest} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Integration Status Row
// ============================================================================

interface StatusRowProps {
  integration: IntegrationStatusIndicator;
  onTest?: (id: IntegrationId) => Promise<void>;
}

function IntegrationStatusRow({ integration, onTest }: StatusRowProps) {
  const [testing, setTesting] = useState(false);
  const Icon = INTEGRATION_ICONS[integration.id] || Settings;

  const handleTest = async () => {
    if (!onTest) return;
    setTesting(true);
    try {
      await onTest(integration.id);
    } finally {
      setTesting(false);
    }
  };

  const StatusIcon = () => {
    switch (integration.status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-brand-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-brand-error" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'initializing':
        return <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />;
      default:
        return <AlertCircle className="h-4 w-4 text-brand-muted" />;
    }
  };

  return (
    <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{integration.name}</span>
      </div>

      <div className="flex items-center gap-2">
        {integration.message && (
          <span className="max-w-32 truncate text-xs text-muted-foreground">
            {integration.message}
          </span>
        )}
        <StatusIcon />
        {onTest && (
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="rounded p-1 text-muted-foreground hover:bg-muted"
          >
            {testing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Quick Status Bar
// ============================================================================

interface QuickStatusBarProps {
  integrations: IntegrationStatusIndicator[];
  className?: string;
}

export function IntegrationQuickStatus({ integrations, className }: QuickStatusBarProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {integrations.slice(0, 5).map((integration) => (
        <IntegrationStatusBadge key={integration.id} integration={integration} size="sm" />
      ))}
      {integrations.length > 5 && (
        <span className="text-xs text-muted-foreground">+{integrations.length - 5}</span>
      )}
    </div>
  );
}
