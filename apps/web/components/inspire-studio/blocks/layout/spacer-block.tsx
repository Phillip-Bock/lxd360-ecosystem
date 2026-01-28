'use client';

import { ChevronDown, ChevronUp, Minus, MoveVertical } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpacerBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

const HEIGHT_PRESETS = [
  { label: 'XS', value: 8, display: '8px' },
  { label: 'S', value: 16, display: '16px' },
  { label: 'M', value: 32, display: '32px' },
  { label: 'L', value: 48, display: '48px' },
  { label: 'XL', value: 64, display: '64px' },
  { label: '2XL', value: 96, display: '96px' },
  { label: '3XL', value: 128, display: '128px' },
];

/**
 * SpacerBlock - Vertical spacing component
 */
export function SpacerBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<SpacerBlockContent>): React.JSX.Element {
  const content = block.content as SpacerBlockContent;
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(0);
  const spacerRef = useRef<HTMLDivElement>(null);

  const height = typeof content.height === 'number' ? content.height : 32;

  // Handle drag to resize
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStartY(e.clientY);
      setDragStartHeight(height);
    },
    [height],
  );

  // Global drag handling
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent): void => {
      const deltaY = e.clientY - dragStartY;
      const newHeight = Math.max(8, Math.min(200, dragStartHeight + deltaY));
      onUpdate({ content: { ...content, height: newHeight } });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartY, dragStartHeight, content, onUpdate]);

  // Increment/decrement height
  const adjustHeight = useCallback(
    (delta: number) => {
      const newHeight = Math.max(8, Math.min(200, height + delta));
      onUpdate({ content: { ...content, height: newHeight } });
    },
    [height, content, onUpdate],
  );

  // Preview mode - just render empty space
  if (!isEditing) {
    return <div style={{ height: `${height}px` }} aria-hidden="true" />;
  }

  // Edit mode with visual controls
  return (
    <div ref={spacerRef} className="relative group" style={{ height: `${height}px` }}>
      {/* Spacer visualization */}
      <div className="absolute inset-0 border-2 border-dashed border-studio-surface/50 rounded-lg bg-studio-surface/10 transition-colors group-hover:border-studio-accent/50 group-hover:bg-studio-accent/5">
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-full">
            <MoveVertical className="w-4 h-4 text-studio-text-muted" />
            <span className="text-sm text-studio-text-muted">{height}px</span>
          </div>
        </div>

        {/* Top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-studio-accent/30" />

        {/* Bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-studio-accent/30" />
      </div>

      {/* Resize handle */}
      <button
        type="button"
        aria-label={`Resize spacer height, currently ${content.height}px`}
        className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-12 h-4 bg-studio-bg border border-studio-surface/50 rounded-full cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:border-studio-accent hover:bg-studio-accent/10"
        onMouseDown={handleDragStart}
      >
        <Minus className="w-4 h-4 text-studio-text-muted" />
      </button>

      {/* Quick controls (visible on hover) */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => adjustHeight(-8)}
          className="p-1 bg-studio-bg border border-studio-surface/50 rounded hover:border-studio-accent hover:bg-studio-accent/10 transition-colors"
          title="Decrease height"
        >
          <ChevronUp className="w-4 h-4 text-studio-text-muted" />
        </button>
        <button
          type="button"
          onClick={() => adjustHeight(8)}
          className="p-1 bg-studio-bg border border-studio-surface/50 rounded hover:border-studio-accent hover:bg-studio-accent/10 transition-colors"
          title="Increase height"
        >
          <ChevronDown className="w-4 h-4 text-studio-text-muted" />
        </button>
      </div>

      {/* Preset buttons (visible on hover) */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {HEIGHT_PRESETS.slice(0, 5).map((preset) => (
          <button
            type="button"
            key={preset.value}
            onClick={() => onUpdate({ content: { ...content, height: preset.value } })}
            className={`
              px-2 py-1 text-xs rounded transition-colors
              ${
                height === preset.value
                  ? 'bg-studio-accent text-brand-primary'
                  : 'bg-studio-bg border border-studio-surface/50 text-studio-text-muted hover:text-brand-primary hover:border-studio-accent'
              }
            `}
            title={preset.display}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SpacerBlock;
