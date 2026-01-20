'use client';

import {
  Activity,
  AlertTriangle,
  Clock,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/core/utils';

// ============================================================================
// TYPES
// ============================================================================

type TimeRange = '1H' | '24H' | '7D';

interface MetricValue {
  current: number;
  previous: number;
  unit?: string;
}

interface MetricsData {
  activeUsers: MetricValue;
  requests: MetricValue;
  errors: MetricValue;
  responseTime: MetricValue;
  chartData: ChartDataPoint[];
}

interface ChartDataPoint {
  time: string;
  activeUsers: number;
  requests: number;
  errors: number;
  errorRate: number;
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

function generateMockData(range: TimeRange): MetricsData {
  const points = range === '1H' ? 12 : range === '24H' ? 24 : 7;
  const chartData: ChartDataPoint[] = [];

  for (let i = 0; i < points; i++) {
    const baseUsers = Math.floor(Math.random() * 100) + 50;
    const baseRequests = Math.floor(Math.random() * 5000) + 1000;
    const baseErrors = Math.floor(Math.random() * 20) + 1;

    chartData.push({
      time: range === '1H' ? `${i * 5}m` : range === '24H' ? `${i}:00` : `Day ${i + 1}`,
      activeUsers: baseUsers,
      requests: baseRequests,
      errors: baseErrors,
      errorRate: parseFloat(((baseErrors / baseRequests) * 100).toFixed(2)),
    });
  }

  return {
    activeUsers: {
      current: chartData[chartData.length - 1]?.activeUsers ?? 0,
      previous: chartData[0]?.activeUsers ?? 0,
    },
    requests: {
      current: chartData.reduce((sum, d) => sum + d.requests, 0),
      previous: chartData.reduce((sum, d) => sum + d.requests, 0) * 0.9,
    },
    errors: {
      current: chartData.reduce((sum, d) => sum + d.errors, 0),
      previous: chartData.reduce((sum, d) => sum + d.errors, 0) * 1.1,
    },
    responseTime: {
      current: Math.floor(Math.random() * 50) + 80,
      previous: Math.floor(Math.random() * 50) + 90,
      unit: 'ms',
    },
    chartData,
  };
}

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

interface MetricCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  previousValue: number;
  unit?: string;
  format?: 'number' | 'compact';
}

function MetricCard({
  title,
  icon: Icon,
  value,
  previousValue,
  unit,
  format = 'number',
}: MetricCardProps) {
  const change = previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;

  // For errors, negative change is good
  const isGood =
    title.toLowerCase().includes('error') || title.toLowerCase().includes('response')
      ? isNegative
      : isPositive;

  const formatValue = (val: number) => {
    if (format === 'compact') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toLocaleString();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {formatValue(value)}
            {unit && <span className="text-sm font-normal">{unit}</span>}
          </span>
          {change !== 0 && (
            <span
              className={cn(
                'flex items-center text-xs font-medium',
                isGood ? 'text-brand-success' : 'text-brand-error',
              )}
            >
              {isPositive ? (
                <TrendingUp className="mr-0.5 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-0.5 h-3 w-3" />
              )}
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// METRICS OVERVIEW COMPONENT
// ============================================================================

export function MetricsOverview() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>('24H');
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [metrics, setMetrics] = React.useState<MetricsData | null>(null);

  const fetchMetrics = React.useCallback(async () => {
    try {
      // In production, this would fetch from /api/admin/metrics
      // For now, use mock data
      const data = generateMockData(timeRange);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  // Initial fetch
  React.useEffect(() => {
    setIsLoading(true);
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh
  React.useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMetrics]);

  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Metrics Overview</h2>
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1H">1 Hour</SelectItem>
              <SelectItem value="24H">24 Hours</SelectItem>
              <SelectItem value="7D">7 Days</SelectItem>
            </SelectContent>
          </Select>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2">
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <Label htmlFor="auto-refresh" className="text-sm">
              Auto-refresh
            </Label>
          </div>

          {/* Manual Refresh */}
          <Button variant="outline" size="sm" onClick={fetchMetrics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Active Users"
          icon={Users}
          value={metrics.activeUsers.current}
          previousValue={metrics.activeUsers.previous}
        />
        <MetricCard
          title="Requests"
          icon={Activity}
          value={metrics.requests.current}
          previousValue={metrics.requests.previous}
          format="compact"
        />
        <MetricCard
          title="Errors"
          icon={AlertTriangle}
          value={metrics.errors.current}
          previousValue={metrics.errors.previous}
        />
        <MetricCard
          title="Avg Response Time"
          icon={Clock}
          value={metrics.responseTime.current}
          previousValue={metrics.responseTime.previous}
          unit={metrics.responseTime.unit}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Active Users Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Users Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    name="Active Users"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Requests vs Errors Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Requests vs Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="requests"
                    name="Requests"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="errors"
                    name="Errors"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Error Rate Percentage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  domain={[0, 'auto']}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  formatter={(value) =>
                    value !== undefined ? [`${value}%`, 'Error Rate'] : ['N/A', 'Error Rate']
                  }
                />
                <Area
                  type="monotone"
                  dataKey="errorRate"
                  name="Error Rate"
                  stroke="hsl(var(--destructive))"
                  fill="hsl(var(--destructive) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
