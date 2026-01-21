'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { RealtimeMetric, ServiceHealth } from '@/lib/monitoring/types';
import { cn } from '@/lib/utils';

interface SparklineChartProps {
  data: RealtimeMetric[] | number[];
  width?: number;
  height?: number;
  health?: ServiceHealth;
  showArea?: boolean;
  showDots?: boolean;
  animated?: boolean;
  className?: string;
}

const healthColors: Record<ServiceHealth, { stroke: string; fill: string }> = {
  healthy: { stroke: 'var(--color-lxd-success)', fill: 'url(#sparkline-gradient-healthy)' },
  warning: { stroke: 'var(--color-lxd-warning)', fill: 'url(#sparkline-gradient-warning)' },
  critical: { stroke: 'var(--color-lxd-error)', fill: 'url(#sparkline-gradient-critical)' },
  unknown: { stroke: 'rgb(107 114 128)', fill: 'url(#sparkline-gradient-unknown)' },
};

export function SparklineChart({
  data,
  width = 120,
  height = 40,
  health = 'healthy',
  showArea = true,
  showDots = false,
  animated = true,
  className,
}: SparklineChartProps) {
  const normalizedData = useMemo(() => {
    return data.map((d) => (typeof d === 'number' ? d : d.value));
  }, [data]);

  const { path, areaPath, points } = useMemo(() => {
    if (normalizedData.length === 0) return { path: '', areaPath: '', points: [] };

    const max = Math.max(...normalizedData);
    const min = Math.min(...normalizedData);
    const range = max - min || 1;

    const padding = 4;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const pointsArray = normalizedData.map((value, index) => {
      const x = padding + (index / (normalizedData.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y, value };
    });

    const pathD = pointsArray.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const areaD =
      pathD +
      ` L ${pointsArray[pointsArray.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

    return { path: pathD, areaPath: areaD, points: pointsArray };
  }, [normalizedData, width, height]);

  const colors = healthColors[health];

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id="sparkline-gradient-healthy" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-lxd-success)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-lxd-success)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkline-gradient-warning" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-lxd-warning)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-lxd-warning)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkline-gradient-critical" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-lxd-error)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-lxd-error)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkline-gradient-unknown" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(107 114 128)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="rgb(107 114 128)" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Area fill */}
      {showArea && areaPath && (
        <motion.path
          d={areaPath}
          fill={colors.fill}
          initial={animated ? { opacity: 0 } : {}}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Line */}
      {path && (
        <motion.path
          d={path}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={animated ? { pathLength: 0, opacity: 0 } : {}}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      )}

      {/* Dots */}
      {showDots &&
        points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={3}
            fill={colors.stroke}
            initial={animated ? { scale: 0, opacity: 0 } : {}}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          />
        ))}

      {/* Last point highlight */}
      {points.length > 0 && (
        <motion.circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={4}
          fill={colors.stroke}
          filter="url(#glow)"
          initial={animated ? { scale: 0 } : {}}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{
            scale: { duration: 2, repeat: Infinity },
            default: { duration: 0.5, delay: 0.8 },
          }}
        />
      )}
    </svg>
  );
}
