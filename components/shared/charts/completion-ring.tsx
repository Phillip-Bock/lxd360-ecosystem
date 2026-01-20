'use client';

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { cn } from '@/lib/core/utils';

export interface CompletionRingProps {
  title: string;
  description?: string;
  value: number; // 0-100
  label?: string;
  color?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { innerRadius: 60, outerRadius: 80, height: 180 },
  md: { innerRadius: 80, outerRadius: 110, height: 250 },
  lg: { innerRadius: 100, outerRadius: 140, height: 320 },
};

export function CompletionRing({
  title,
  description,
  value,
  label = 'Complete',
  color = 'hsl(var(--chart-1))',
  showPercentage = true,
  size = 'md',
  loading = false,
  className,
}: CompletionRingProps) {
  const chartConfig = {
    completed: {
      label: 'Completed',
      color,
    },
    remaining: {
      label: 'Remaining',
      color: 'hsl(var(--muted))',
    },
  } satisfies ChartConfig;

  const { innerRadius, outerRadius, height } = sizeConfig[size];
  const remaining = 100 - value;
  const data = [{ completed: value, remaining }];

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="animate-pulse flex items-center justify-center" style={{ height }}>
            <div
              className="rounded-full bg-muted"
              style={{ width: outerRadius * 2, height: outerRadius * 2 }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full"
          style={{ maxHeight: height }}
        >
          <RadialBarChart
            data={data}
            endAngle={180}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            cx="50%"
            cy="50%"
          >
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        {showPercentage && (
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 16}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {value.toFixed(0)}%
                          </tspan>
                        )}
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground text-sm"
                        >
                          {label}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="remaining"
              fill="var(--color-remaining)"
              stackId="stack"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="completed"
              fill="var(--color-completed)"
              stackId="stack"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Multiple completion rings in a grid
 */
export interface CompletionRingGridProps {
  items: Array<{
    title: string;
    value: number;
    label?: string;
    color?: string;
  }>;
  columns?: 2 | 3 | 4;
  loading?: boolean;
  className?: string;
}

export function CompletionRingGrid({
  items,
  columns = 3,
  loading = false,
  className,
}: CompletionRingGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {items.map((item, index) => (
        <MiniCompletionRing key={index} {...item} loading={loading} />
      ))}
    </div>
  );
}

/**
 * Smaller inline completion ring
 */
interface MiniCompletionRingProps {
  title: string;
  value: number;
  label?: string;
  color?: string;
  loading?: boolean;
}

function MiniCompletionRing({
  title,
  value,
  label,
  color = 'hsl(var(--chart-1))',
  loading = false,
}: MiniCompletionRingProps) {
  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-20 w-20 rounded-full bg-muted" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  const circumference = 2 * Math.PI * 35;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="relative h-20 w-20">
          <svg aria-hidden="true" className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{value.toFixed(0)}%</span>
          </div>
        </div>
        <span className="text-sm font-medium text-center">{title}</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </Card>
  );
}
