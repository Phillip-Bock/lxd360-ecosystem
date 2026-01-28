'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { Position } from './types';

interface ConnectionProps {
  id: string;
  start: Position;
  end: Position;
  isSelected: boolean;
  label?: string;
  color?: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function getBezierPath(start: Position, end: Position): string {
  const dx = end.x - start.x;

  // Calculate control points for smooth curve
  const controlPointOffset = Math.min(Math.abs(dx) * 0.5, 100);

  // Control points go straight down/up first, then curve towards target
  const cp1x = start.x;
  const cp1y = start.y + controlPointOffset;
  const cp2x = end.x;
  const cp2y = end.y - controlPointOffset;

  return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
}

function getMidpoint(start: Position, end: Position): Position {
  // Calculate point along bezier at t=0.5 (simplified)
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2 + 20, // Offset for label visibility
  };
}

export const Connection = memo(function Connection({
  id,
  start,
  end,
  isSelected,
  label,
  color = '#6b7280',
  onSelect,
  onDelete,
}: ConnectionProps): React.JSX.Element {
  const path = getBezierPath(start, end);
  const midpoint = getMidpoint(start, end);

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onSelect(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      onDelete(id);
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: SVG <g> element cannot be replaced with <button>
    <g
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      className="cursor-pointer focus:outline-hidden"
      aria-label={`Connection${label ? `: ${label}` : ''}`}
      style={{ cursor: 'pointer' }}
    >
      {/* Invisible wider path for easier selection */}
      <path d={path} fill="none" stroke="transparent" strokeWidth={20} className="cursor-pointer" />

      {/* Visible path */}
      <path
        d={path}
        fill="none"
        stroke={isSelected ? '#3b82f6' : color}
        strokeWidth={isSelected ? 3 : 2}
        strokeLinecap="round"
        className={cn('transition-all', isSelected && 'filter drop-shadow-md')}
      />

      {/* Arrow marker at end */}
      <circle cx={end.x} cy={end.y} r={4} fill={isSelected ? '#3b82f6' : color} />

      {/* Label (if provided) */}
      {label && (
        <g transform={`translate(${midpoint.x}, ${midpoint.y})`}>
          <rect
            x={-30}
            y={-10}
            width={60}
            height={20}
            rx={4}
            fill="white"
            stroke={isSelected ? '#3b82f6' : '#e5e7eb'}
            strokeWidth={1}
          />
          <text
            x={0}
            y={5}
            textAnchor="middle"
            fontSize={10}
            fill={isSelected ? '#3b82f6' : '#4b5563'}
            className="select-none pointer-events-none"
          >
            {label.length > 10 ? `${label.slice(0, 10)}...` : label}
          </text>
        </g>
      )}

      {/* Delete button when selected */}
      {isSelected && (
        // biome-ignore lint/a11y/useSemanticElements: SVG <g> element cannot be replaced with <button>
        <g
          transform={`translate(${midpoint.x + 40}, ${midpoint.y})`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              onDelete(id);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Delete connection"
          style={{ cursor: 'pointer' }}
        >
          <circle r={10} fill="#ef4444" className="hover:fill-red-600 transition-colors" />
          <line
            x1={-4}
            y1={-4}
            x2={4}
            y2={4}
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={4}
            y1={-4}
            x2={-4}
            y2={4}
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
});

// Temporary connection line while dragging
interface TempConnectionProps {
  start: Position;
  end: Position;
}

export function TempConnection({ start, end }: TempConnectionProps): React.JSX.Element {
  const path = getBezierPath(start, end);

  return (
    <path
      d={path}
      fill="none"
      stroke="#3b82f6"
      strokeWidth={2}
      strokeDasharray="5,5"
      strokeLinecap="round"
      className="pointer-events-none animate-pulse"
    />
  );
}
