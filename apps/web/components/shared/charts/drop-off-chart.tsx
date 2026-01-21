'use client';

import { AlertTriangle, TrendingDown } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { DropOffPoint, ModuleCompletion } from '@/lib/analytics/types';
import { cn } from '@/lib/core/utils';

export interface DropOffChartProps {
  title?: string;
  description?: string;
  data: DropOffPoint[];
  showAlerts?: boolean;
  alertThreshold?: number;
  loading?: boolean;
  className?: string;
}

const chartConfig = {
  dropOff: {
    label: 'Drop-off Rate',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function DropOffChart({
  title = 'Drop-off Analysis',
  description,
  data,
  showAlerts = true,
  alertThreshold = 20,
  loading = false,
  className,
}: DropOffChartProps) {
  const chartData = data
    .sort((a, b) => a.order - b.order)
    .map((point) => ({
      name: point.moduleName,
      dropOff: point.dropOffRate,
      count: point.dropOffCount,
      isHighDropOff: point.dropOffRate >= alertThreshold,
    }));

  const highDropOffModules = chartData.filter((d) => d.isHighDropOff);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-lxd-purple" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-[300px] w-full bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-lxd-purple" />
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showAlerts && highDropOffModules.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {highDropOffModules.length} high drop-off
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => (
                    <div className="space-y-1">
                      <p className="font-medium">{String(value)}% drop-off rate</p>
                      <p className="text-muted-foreground text-xs">
                        {(item?.payload as { count?: number })?.count ?? 0} learners left
                      </p>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="dropOff" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isHighDropOff ? 'hsl(var(--destructive))' : 'hsl(var(--chart-3))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        {/* High drop-off alerts */}
        {showAlerts && highDropOffModules.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Modules needing attention:</p>
            <div className="flex flex-wrap gap-2">
              {highDropOffModules.map((module) => (
                <Badge
                  key={module.name}
                  variant="outline"
                  className="text-destructive border-destructive"
                >
                  {module.name}: {module.dropOff.toFixed(1)}%
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Module completion funnel chart
 */
export interface CompletionFunnelProps {
  title?: string;
  description?: string;
  modules: ModuleCompletion[];
  loading?: boolean;
  className?: string;
}

export function CompletionFunnel({
  title = 'Module Completion Funnel',
  description,
  modules,
  loading = false,
  className,
}: CompletionFunnelProps) {
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-10 bg-muted rounded" style={{ width: `${100 - i * 15}%` }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedModules.map((module, index) => (
            <FunnelStep
              key={module.moduleId}
              name={module.moduleName}
              value={module.completionRate}
              attempts={module.totalAttempts}
              isFirst={index === 0}
              previousValue={index > 0 ? sortedModules[index - 1].completionRate : 100}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-lxd-purple" />
            <span>Completion rate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-destructive" />
            <span>High drop-off (&gt;20%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FunnelStepProps {
  name: string;
  value: number;
  attempts: number;
  isFirst: boolean;
  previousValue: number;
}

function FunnelStep({ name, value, attempts, isFirst, previousValue }: FunnelStepProps) {
  const dropOff = previousValue - value;
  const isHighDropOff = dropOff > 20;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium truncate">{name}</span>
        <span className="text-sm text-muted-foreground">{value.toFixed(1)}%</span>
      </div>
      <div className="relative h-8 bg-muted rounded overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded',
            isHighDropOff ? 'bg-destructive' : 'bg-lxd-purple',
          )}
          style={{ width: `${value}%` }}
        />
        <div className="absolute inset-0 flex items-center px-3">
          <span className="text-xs text-brand-primary mix-blend-difference">
            {attempts.toLocaleString()} attempts
          </span>
        </div>
      </div>
      {!isFirst && dropOff > 0 && (
        <div
          className={cn(
            'text-xs mt-1',
            isHighDropOff ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          -{dropOff.toFixed(1)}% from previous
        </div>
      )}
    </div>
  );
}

/**
 * Compact drop-off indicators
 */
export interface DropOffIndicatorsProps {
  points: DropOffPoint[];
  limit?: number;
  className?: string;
}

export function DropOffIndicators({ points, limit = 5, className }: DropOffIndicatorsProps) {
  const sortedPoints = [...points].sort((a, b) => b.dropOffRate - a.dropOffRate).slice(0, limit);

  return (
    <div className={cn('space-y-2', className)}>
      {sortedPoints.map((point) => (
        <div key={point.moduleId} className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{point.moduleName}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  point.dropOffRate >= 20 ? 'bg-destructive' : 'bg-orange-400',
                )}
                style={{ width: `${Math.min(point.dropOffRate, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium w-12 text-right">
              {point.dropOffRate.toFixed(0)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
