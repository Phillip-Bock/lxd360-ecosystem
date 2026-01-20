'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { RealtimeMetric, ServiceHealth } from '@/lib/monitoring/types';
import { cn } from '@/lib/utils';

interface RealtimeGraphProps {
  data: RealtimeMetric[];
  label: string;
  unit?: string;
  health?: ServiceHealth;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  maxPoints?: number;
  className?: string;
}

const healthColors: Record<ServiceHealth, { stroke: string; fill: string; glow: string }> = {
  healthy: {
    stroke: 'var(--color-lxd-success)',
    fill: 'rgba(34, 197, 94, 0.1)',
    glow: 'rgba(34, 197, 94, 0.5)',
  },
  warning: {
    stroke: 'var(--color-lxd-warning)',
    fill: 'rgba(245, 158, 11, 0.1)',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
  critical: {
    stroke: 'var(--color-lxd-error)',
    fill: 'rgba(239, 68, 68, 0.1)',
    glow: 'rgba(239, 68, 68, 0.5)',
  },
  unknown: {
    stroke: 'var(--text-brand-muted)',
    fill: 'rgba(107, 114, 128, 0.1)',
    glow: 'rgba(107, 114, 128, 0.5)',
  },
};

export function RealtimeGraph({
  data,
  label,
  unit = '',
  health = 'healthy',
  height = 120,
  showGrid = true,
  showLabels = true,
  maxPoints = 60,
  className,
}: RealtimeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height });
  const [currentValue, setCurrentValue] = useState(0);

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [height]);

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height: h } = dimensions;
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    canvas.width = width * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, h);

    const colors = healthColors[health];
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = h - padding.top - padding.bottom;

    // Get data subset
    const displayData = data.slice(-maxPoints);
    if (displayData.length === 0) return;

    const values = displayData.map((d) => d.value);
    const max = Math.max(...values) * 1.1 || 100;
    const min = Math.min(...values) * 0.9 || 0;
    const range = max - min || 1;

    // Update current value
    setCurrentValue(values[values.length - 1] || 0);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight * i) / 4;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let i = 0; i <= 6; i++) {
        const x = padding.left + (chartWidth * i) / 6;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, h - padding.bottom);
        ctx.stroke();
      }
    }

    // Draw Y-axis labels
    if (showLabels) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      for (let i = 0; i <= 4; i++) {
        const value = max - (range * i) / 4;
        const y = padding.top + (chartHeight * i) / 4;
        ctx.fillText(value.toFixed(0), padding.left - 8, y);
      }
    }

    // Calculate points
    const points = displayData.map((d, i) => ({
      x: padding.left + (chartWidth * i) / (maxPoints - 1),
      y: padding.top + chartHeight - ((d.value - min) / range) * chartHeight,
    }));

    // Draw area fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, h - padding.bottom);
    for (const p of points) {
      ctx.lineTo(p.x, p.y);
    }
    ctx.lineTo(points[points.length - 1].x, h - padding.bottom);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, colors.fill);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (const p of points) {
      ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw current value dot
    const lastPoint = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = colors.stroke;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw pulsing ring around current value
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, 8, 0, Math.PI * 2);
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [data, dimensions, health, maxPoints, showGrid, showLabels]);

  const colors = healthColors[health];

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Label and current value */}
      <div className="absolute top-0 left-0 z-10 flex items-center gap-3">
        <span className="text-xs font-medium text-brand-primary/60 uppercase tracking-wider">
          {label}
        </span>
        <motion.span
          className={cn(
            'text-sm font-mono font-bold',
            health === 'healthy' && 'text-brand-success',
            health === 'warning' && 'text-brand-warning',
            health === 'critical' && 'text-brand-error',
            health === 'unknown' && 'text-brand-muted',
          )}
          key={Math.round(currentValue)}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {currentValue.toFixed(1)}
          {unit}
        </motion.span>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full" style={{ height: `${height}px` }} />

      {/* Glow effect at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.stroke}, transparent)`,
          boxShadow: `0 0 20px ${colors.glow}`,
        }}
      />
    </div>
  );
}
