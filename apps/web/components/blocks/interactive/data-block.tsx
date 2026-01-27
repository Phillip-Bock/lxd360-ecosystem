'use client';

/**
 * DataBlock - Simple data visualization (bar/pie/line chart)
 */

import { Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { DataConfig, DataContent, DataPoint } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface DataBlockProps {
  id: string;
  content: DataContent;
  config: DataConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: DataContent) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
  onXAPIEvent?: (verb: string, data?: Record<string, unknown>) => void;
}

// Default color palette for chart segments
const DEFAULT_COLORS = [
  'var(--color-lxd-primary)',
  'var(--color-lxd-secondary)',
  'var(--color-lxd-success)',
  'var(--color-lxd-caution)',
  'var(--color-lxd-warning)',
  'var(--color-lxd-error)',
  'var(--color-neural-cyan)',
  'var(--color-neural-purple)',
];

function getColor(index: number, customColor?: string): string {
  return customColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

interface BarChartProps {
  data: DataPoint[];
  showValues?: boolean;
  height: number;
  animated?: boolean;
}

function BarChart({ data, showValues, height, animated }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Bar chart"
      >
        <title>Bar chart visualization</title>
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * (height - 30);
          const x = index * barWidth + barWidth * 0.1;
          const y = height - barHeight - 20;
          const width = barWidth * 0.8;

          return (
            <g key={point.label}>
              <rect
                x={x}
                y={y}
                width={width}
                height={barHeight}
                fill={getColor(index, point.color)}
                rx={2}
                className={cn(animated && 'transition-all duration-500')}
              />
              {showValues && (
                <text
                  x={x + width / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="text-[8px] fill-muted-foreground"
                >
                  {point.value}
                </text>
              )}
              <text
                x={x + width / 2}
                y={height - 6}
                textAnchor="middle"
                className="text-[7px] fill-muted-foreground"
              >
                {point.label.length > 8 ? `${point.label.slice(0, 8)}...` : point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface PieChartProps {
  data: DataPoint[];
  showValues?: boolean;
  size: number;
  animated?: boolean;
}

function PieChart({ data, showValues, size, animated }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const center = size / 2;
  const radius = size * 0.35;

  // Calculate pie slices
  const slices = useMemo(() => {
    let currentAngle = -90; // Start from top
    return data.map((point, index) => {
      const percentage = point.value / total;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      // Calculate arc path
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;

      // Label position (middle of arc)
      const midAngle = (startAngle + endAngle) / 2;
      const midRad = (midAngle * Math.PI) / 180;
      const labelRadius = radius * 1.3;
      const labelX = center + labelRadius * Math.cos(midRad);
      const labelY = center + labelRadius * Math.sin(midRad);

      return {
        point,
        index,
        path:
          angle >= 360
            ? `M ${center},${center - radius} A ${radius},${radius} 0 1,1 ${center - 0.001},${center - radius} Z`
            : `M ${center},${center} L ${x1},${y1} A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`,
        labelX,
        labelY,
        percentage,
      };
    });
  }, [data, total, center, radius]);

  return (
    <div className="w-full flex justify-center" style={{ height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full"
        style={{ width: size }}
        role="img"
        aria-label="Pie chart"
      >
        <title>Pie chart visualization</title>
        {slices.map(({ point, index, path, labelX, labelY, percentage }) => (
          <g key={point.label}>
            <path
              d={path}
              fill={getColor(index, point.color)}
              className={cn(animated && 'transition-all duration-500')}
            />
            {showValues && percentage > 0.05 && (
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[8px] fill-foreground font-medium"
              >
                {Math.round(percentage * 100)}%
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

interface LineChartProps {
  data: DataPoint[];
  showValues?: boolean;
  height: number;
  animated?: boolean;
}

function LineChart({ data, showValues, height, animated }: LineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 20, bottom: 25, left: 5, right: 5 };
  const chartHeight = height - padding.top - padding.bottom;
  const stepX = data.length > 1 ? (100 - padding.left - padding.right) / (data.length - 1) : 50;

  // Calculate points for the line
  const points = data.map((point, index) => {
    const x = padding.left + index * stepX;
    const y = padding.top + chartHeight - (point.value / maxValue) * chartHeight;
    return { x, y, point };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  // Area path for gradient fill
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || 0},${height - padding.bottom} L ${padding.left},${height - padding.bottom} Z`;

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Line chart"
      >
        <title>Line chart visualization</title>
        <defs>
          <linearGradient id={`lineGradient-${data.length}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-lxd-primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-lxd-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={areaPath}
          fill={`url(#lineGradient-${data.length})`}
          className={cn(animated && 'transition-all duration-500')}
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-lxd-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(animated && 'transition-all duration-500')}
        />

        {/* Data points and labels */}
        {points.map(({ x, y, point }) => (
          <g key={point.label}>
            <circle
              cx={x}
              cy={y}
              r={3}
              fill="var(--color-lxd-primary)"
              className={cn(animated && 'transition-all duration-500')}
            />
            {showValues && (
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                className="text-[7px] fill-muted-foreground"
              >
                {point.value}
              </text>
            )}
            <text
              x={x}
              y={height - 6}
              textAnchor="middle"
              className="text-[6px] fill-muted-foreground"
            >
              {point.label.length > 6 ? `${point.label.slice(0, 6)}..` : point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

interface LegendProps {
  data: DataPoint[];
}

function Legend({ data }: LegendProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {data.map((point, index) => (
        <div key={point.label} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: getColor(index, point.color) }}
          />
          <span className="text-sm text-muted-foreground">{point.label}</span>
        </div>
      ))}
    </div>
  );
}

export function DataBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
}: DataBlockProps) {
  const chartHeight = config.height || 200;
  const showLegend = config.showLegend !== false;
  const showValues = config.showValues !== false;
  const animated = config.animated !== false;

  const updateDataPoint = (index: number, updates: Partial<DataPoint>) => {
    const newData = [...content.data];
    newData[index] = { ...newData[index], ...updates };
    onContentChange?.({ ...content, data: newData });
  };

  const addDataPoint = () => {
    onContentChange?.({
      ...content,
      data: [...content.data, { label: 'New', value: 0 }],
    });
  };

  const removeDataPoint = (index: number) => {
    if (content.data.length <= 1) return;
    const newData = content.data.filter((_, i) => i !== index);
    onContentChange?.({ ...content, data: newData });
  };

  const renderChart = () => {
    switch (config.chartType) {
      case 'pie':
        return (
          <PieChart
            data={content.data}
            showValues={showValues}
            size={chartHeight}
            animated={animated}
          />
        );
      case 'line':
        return (
          <LineChart
            data={content.data}
            showValues={showValues}
            height={chartHeight}
            animated={animated}
          />
        );
      default:
        return (
          <BarChart
            data={content.data}
            showValues={showValues}
            height={chartHeight}
            animated={animated}
          />
        );
    }
  };

  return (
    <BlockWrapper
      id={id}
      type="Data"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      <div className="space-y-4">
        {/* Title */}
        {isEditing ? (
          <input
            type="text"
            value={content.title || ''}
            onChange={(e) => onContentChange?.({ ...content, title: e.target.value })}
            className="w-full bg-transparent text-lg font-semibold outline-hidden border-b border-transparent focus:border-cyan-500 text-center"
            placeholder="Chart title (optional)"
          />
        ) : (
          content.title && <h3 className="text-lg font-semibold text-center">{content.title}</h3>
        )}

        {/* Chart */}
        {!isEditing && renderChart()}

        {/* Legend */}
        {!isEditing && showLegend && config.chartType !== 'bar' && <Legend data={content.data} />}

        {/* Data editor (editing mode) */}
        {isEditing && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Data Points:</div>
            {content.data.map((point, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded shrink-0"
                  style={{ backgroundColor: getColor(index, point.color) }}
                />
                <input
                  type="text"
                  value={point.label}
                  onChange={(e) => updateDataPoint(index, { label: e.target.value })}
                  className="flex-1 bg-background px-3 py-2 rounded border border-border outline-hidden focus:border-cyan-500 text-sm"
                  placeholder="Label"
                />
                <input
                  type="number"
                  value={point.value}
                  onChange={(e) => updateDataPoint(index, { value: Number(e.target.value) })}
                  className="w-24 bg-background px-3 py-2 rounded border border-border outline-hidden focus:border-cyan-500 text-sm"
                  placeholder="Value"
                />
                {content.data.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDataPoint(index)}
                    className="p-1 text-red-500 hover:text-red-400"
                    aria-label="Remove data point"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addDataPoint}
              className="w-full py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-cyan-500 hover:text-cyan-500 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Data Point
            </button>
          </div>
        )}
      </div>
    </BlockWrapper>
  );
}
