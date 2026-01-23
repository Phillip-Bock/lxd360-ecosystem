'use client';

export const dynamic = 'force-dynamic';

import { AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock pipeline data - TODO: Replace with actual GCP monitoring
const pipelineData = {
  status: 'healthy',
  components: [
    {
      id: 'api',
      name: 'xAPI Endpoint',
      status: 'healthy',
      latency: 45,
      throughput: 1250,
      lastCheck: new Date().toISOString(),
    },
    {
      id: 'firestore',
      name: 'Firestore Write',
      status: 'healthy',
      latency: 23,
      throughput: 1250,
      lastCheck: new Date().toISOString(),
    },
    {
      id: 'pubsub',
      name: 'Pub/Sub Publish',
      status: 'healthy',
      latency: 12,
      throughput: 1250,
      lastCheck: new Date().toISOString(),
    },
    {
      id: 'function',
      name: 'Cloud Function',
      status: 'healthy',
      latency: 89,
      throughput: 1180,
      lastCheck: new Date().toISOString(),
    },
    {
      id: 'bigquery',
      name: 'BigQuery Sink',
      status: 'warning',
      latency: 156,
      throughput: 1150,
      lastCheck: new Date().toISOString(),
      message: 'Higher than normal latency',
    },
  ],
  recentErrors: [
    {
      id: '1',
      component: 'BigQuery Sink',
      message: 'Temporary rate limit exceeded',
      timestamp: '2024-01-15T10:15:00Z',
      resolved: true,
    },
    {
      id: '2',
      component: 'Cloud Function',
      message: 'Cold start timeout',
      timestamp: '2024-01-15T08:30:00Z',
      resolved: true,
    },
  ],
};

/**
 * Pipeline Status page - Monitor data pipeline health
 */
export default function PipelineStatusPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Pipeline Status</h1>
          <p className="text-muted-foreground mt-1">Monitor xAPI data pipeline health</p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                pipelineData.status === 'healthy' && 'bg-green-500/20',
                pipelineData.status === 'warning' && 'bg-yellow-500/20',
                pipelineData.status === 'error' && 'bg-red-500/20',
              )}
            >
              {pipelineData.status === 'healthy' ? (
                <CheckCircle className="w-8 h-8 text-green-500" aria-hidden="true" />
              ) : pipelineData.status === 'warning' ? (
                <AlertTriangle className="w-8 h-8 text-yellow-500" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-primary capitalize">
                Pipeline {pipelineData.status}
              </h2>
              <p className="text-muted-foreground">All components are operating normally</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Components */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">Pipeline Components</CardTitle>
          <CardDescription>Status of each pipeline stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelineData.components.map((component, index) => (
              <div key={component.id}>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-lxd-dark-bg/50">
                  <span
                    className={cn(
                      'w-3 h-3 rounded-full block',
                      component.status === 'healthy' && 'bg-green-500',
                      component.status === 'warning' && 'bg-yellow-500',
                      component.status === 'error' && 'bg-red-500',
                    )}
                    role="img"
                    aria-label={`Status: ${component.status}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-primary">{component.name}</p>
                    {component.message && (
                      <p className="text-xs text-yellow-400">{component.message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-brand-primary">{component.latency}ms</p>
                      <p className="text-xs text-muted-foreground">Latency</p>
                    </div>
                    <div className="text-center">
                      <p className="text-brand-primary">{component.throughput}/s</p>
                      <p className="text-xs text-muted-foreground">Throughput</p>
                    </div>
                  </div>
                </div>
                {/* Arrow connector */}
                {index < pipelineData.components.length - 1 && (
                  <div className="flex justify-center py-2">
                    <Zap className="w-4 h-4 text-lxd-purple/50" aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">Recent Errors</CardTitle>
          <CardDescription>Pipeline errors and resolutions</CardDescription>
        </CardHeader>
        <CardContent>
          {pipelineData.recentErrors.length > 0 ? (
            <div className="space-y-3">
              {pipelineData.recentErrors.map((error) => (
                <div
                  key={error.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-lxd-dark-bg/50"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={cn(
                        'w-4 h-4 mt-0.5',
                        error.resolved ? 'text-yellow-500' : 'text-red-500',
                      )}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm text-brand-primary">{error.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {error.component} • {new Date(error.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 text-xs rounded-full',
                      error.resolved
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400',
                    )}
                  >
                    {error.resolved ? 'Resolved' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No recent errors</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
