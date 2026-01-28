'use client';

import { cn } from '@/lib/utils';
import type { CanvasConfig } from '@/schemas/inspire';
import { GRID_CONFIGS } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface CanvasGridProps {
  canvasConfig: CanvasConfig;
  className?: string;
}

/**
 * CanvasGrid - Renders the visual grid overlay on the canvas
 */
export function CanvasGrid({ canvasConfig, className }: CanvasGridProps) {
  if (!canvasConfig.gridVisible) return null;

  const gridConfig = GRID_CONFIGS[canvasConfig.gridType];
  const cellWidth = canvasConfig.width / gridConfig.columns;
  const cellHeight = canvasConfig.height / gridConfig.rows;

  return (
    <svg
      className={cn('absolute inset-0 pointer-events-none', className)}
      width={canvasConfig.width}
      height={canvasConfig.height}
      viewBox={`0 0 ${canvasConfig.width} ${canvasConfig.height}`}
    >
      <title>Canvas Grid</title>
      <defs>
        <pattern
          id="grid-pattern"
          width={cellWidth}
          height={cellHeight}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${cellWidth} 0 L 0 0 0 ${cellHeight}`}
            fill="none"
            stroke={gridConfig.color}
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />

      {/* Major grid lines (every 4 cells for 12-col, every 2 for 10x10) */}
      {canvasConfig.gridType === '12-column' &&
        [3, 6, 9].map((col) => (
          <line
            key={`major-col-${col}`}
            x1={col * cellWidth}
            y1={0}
            x2={col * cellWidth}
            y2={canvasConfig.height}
            stroke="rgba(139, 92, 246, 0.2)"
            strokeWidth="1"
          />
        ))}

      {/* Safe zone indicators */}
      {canvasConfig.safeZonesVisible && (
        <rect
          x={canvasConfig.width * (canvasConfig.safeZoneMargin / 100)}
          y={canvasConfig.height * (canvasConfig.safeZoneMargin / 100)}
          width={canvasConfig.width * (1 - (canvasConfig.safeZoneMargin * 2) / 100)}
          height={canvasConfig.height * (1 - (canvasConfig.safeZoneMargin * 2) / 100)}
          fill="none"
          stroke="rgba(0, 212, 255, 0.15)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      )}
    </svg>
  );
}
