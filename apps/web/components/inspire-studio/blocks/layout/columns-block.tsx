'use client';

import {
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  ChevronDown,
  GripVertical,
  LayoutGrid,
  Plus,
  Trash2,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import type { Block, ColumnsBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

// Predefined column layouts
const COLUMN_PRESETS = [
  { label: '2 Equal', columns: [50, 50], icon: '1:1' },
  { label: '3 Equal', columns: [33.33, 33.33, 33.34], icon: '1:1:1' },
  { label: '4 Equal', columns: [25, 25, 25, 25], icon: '1:1:1:1' },
  { label: '2/3 + 1/3', columns: [66.67, 33.33], icon: '2:1' },
  { label: '1/3 + 2/3', columns: [33.33, 66.67], icon: '1:2' },
  { label: '1/4 + 3/4', columns: [25, 75], icon: '1:3' },
  { label: '3/4 + 1/4', columns: [75, 25], icon: '3:1' },
  { label: '1/4 + 1/2 + 1/4', columns: [25, 50, 25], icon: '1:2:1' },
];

const GAP_OPTIONS = [
  { label: 'None', value: 0 },
  { label: 'Small', value: 8 },
  { label: 'Medium', value: 16 },
  { label: 'Large', value: 24 },
  { label: 'XL', value: 32 },
];

/**
 * ColumnsBlock - Multi-column layout
 */
export function ColumnsBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<ColumnsBlockContent>): React.JSX.Element {
  const content = block.content as ColumnsBlockContent;
  const [showPresets, setShowPresets] = useState(false);

  // Default values - wrapped in useMemo to maintain stable references
  const contentRecord = content as Record<string, unknown>;
  const contentColumns = contentRecord.columns;
  const columns = useMemo(() => (contentColumns as number[]) || [50, 50], [contentColumns]);
  const gap = content.gap ?? 16;
  const verticalAlign = content.verticalAlign || 'stretch';
  const columnContent =
    ((content as Record<string, unknown>).columnContent as Block[][]) || columns.map(() => []);

  // Update column widths
  const updateColumns = useCallback(
    (newColumns: number[]) => {
      onUpdate({
        content: {
          ...content,
          columns: newColumns,
          columnContent: newColumns.map((_, i) => columnContent[i] || []),
        },
      });
    },
    [content, columnContent, onUpdate],
  );

  // Apply preset
  const applyPreset = useCallback(
    (preset: (typeof COLUMN_PRESETS)[0]) => {
      onUpdate({
        content: {
          ...content,
          columns: [...preset.columns],
          columnContent: preset.columns.map((_, i) => columnContent[i] || []),
        },
      });
      setShowPresets(false);
    },
    [content, columnContent, onUpdate],
  );

  // Add column
  const addColumn = useCallback(() => {
    const newWidth = 100 / (columns.length + 1);
    const adjustedColumns = columns.map((w: number) => w * (columns.length / (columns.length + 1)));
    adjustedColumns.push(newWidth);
    updateColumns(adjustedColumns);
  }, [columns, updateColumns]);

  // Remove column
  const removeColumn = useCallback(
    (index: number) => {
      if (columns.length <= 1) return;

      const removedWidth = columns[index];
      const remainingColumns = columns.filter((_: number, i: number) => i !== index);
      const totalRemaining = remainingColumns.reduce((a: number, b: number) => a + b, 0);

      // Redistribute removed column width proportionally
      const newColumns = remainingColumns.map(
        (w: number) => w + (removedWidth * w) / totalRemaining,
      );

      onUpdate({
        content: {
          ...content,
          columns: newColumns,
          columnContent: columnContent.filter((_, i) => i !== index),
        },
      });
    },
    [columns, columnContent, content, onUpdate],
  );

  // Handle column resize via drag
  const handleColumnResize = useCallback(
    (index: number, deltaPercent: number) => {
      if (index >= columns.length - 1) return;

      const newColumns = [...columns];
      const minWidth = 10;

      const newWidth = Math.max(minWidth, newColumns[index] + deltaPercent);
      const nextWidth = Math.max(minWidth, newColumns[index + 1] - deltaPercent);

      newColumns[index] = newWidth;
      newColumns[index + 1] = nextWidth;

      updateColumns(newColumns);
    },
    [columns, updateColumns],
  );

  // Preview mode
  if (!isEditing) {
    return (
      <div
        className="flex"
        style={{
          gap: `${gap}px`,
          alignItems:
            verticalAlign === 'top'
              ? 'flex-start'
              : verticalAlign === 'center'
                ? 'center'
                : verticalAlign === 'bottom'
                  ? 'flex-end'
                  : 'stretch',
        }}
      >
        {columns.map((width: number, index: number) => (
          <div key={index} className="min-h-[50px]" style={{ width: `${width}%` }}>
            {columnContent[index]?.length > 0 ? (
              <div className="space-y-4">
                {/* Nested blocks would be rendered here */}
                <div className="p-4 bg-studio-bg/30 rounded-lg border border-studio-surface/30 text-studio-text-muted text-sm">
                  {columnContent[index].length} block(s)
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[50px] bg-studio-bg/20 rounded-lg" />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Preset selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-2 px-3 py-2 bg-studio-bg border border-studio-surface/50 rounded-lg text-studio-text hover:border-studio-accent/50 transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-sm">Layout</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showPresets && (
            <div className="absolute z-20 top-full left-0 mt-1 w-64 bg-studio-bg-dark border border-studio-surface/50 rounded-lg shadow-xl p-2">
              <div className="grid grid-cols-2 gap-1">
                {COLUMN_PRESETS.map((preset, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-studio-text hover:bg-studio-surface/30 rounded-lg transition-colors"
                  >
                    <span className="text-xs font-mono text-studio-text-muted">{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Gap selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-studio-text-muted">Gap:</span>
          <select
            value={gap}
            onChange={(e) =>
              onUpdate({ content: { ...content, gap: parseInt(e.target.value, 10) } })
            }
            className="px-2 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary text-sm outline-hidden"
          >
            {GAP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Vertical alignment */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-studio-text-muted mr-1">Align:</span>
          {[
            { value: 'top', icon: AlignVerticalJustifyStart, label: 'Top' },
            { value: 'center', icon: AlignVerticalJustifyCenter, label: 'Center' },
            { value: 'bottom', icon: AlignVerticalJustifyEnd, label: 'Bottom' },
          ].map(({ value, icon: Icon, label }) => (
            <button
              type="button"
              key={value}
              onClick={() => onUpdate({ content: { ...content, verticalAlign: value as unknown } })}
              className={`
                p-1.5 rounded transition-colors
                ${
                  verticalAlign === value
                    ? 'bg-studio-accent text-brand-primary'
                    : 'text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/30'
                }
              `}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Add column */}
        {columns.length < 6 && (
          <button
            type="button"
            onClick={addColumn}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-studio-accent hover:text-studio-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Column
          </button>
        )}
      </div>

      {/* Column layout preview with resize handles */}
      <div
        className="flex relative bg-studio-bg rounded-xl p-4 border border-studio-surface/30"
        style={{ gap: `${gap}px` }}
      >
        {columns.map((width: number, index: number) => (
          <React.Fragment key={index}>
            <div className="relative group" style={{ width: `${width}%` }}>
              {/* Column header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-studio-text-muted cursor-grab" />
                  <span className="text-xs text-studio-text-muted">{Math.round(width)}%</span>
                </div>
                {columns.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeColumn(index)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-studio-text-muted hover:text-brand-error transition-all"
                    title="Remove column"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Column content area */}
              <div className="min-h-[120px] bg-studio-bg-dark border-2 border-dashed border-studio-surface rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-colors hover:border-studio-accent/50">
                <Plus className="w-6 h-6 text-studio-text-muted" />
                <span className="text-xs text-studio-text-muted">Drop blocks here</span>
              </div>

              {/* Width input */}
              <div className="mt-2">
                <input
                  type="number"
                  min="10"
                  max="90"
                  step="5"
                  value={Math.round(width)}
                  onChange={(e) => {
                    const newWidth = parseFloat(e.target.value);
                    if (Number.isNaN(newWidth) || newWidth < 10 || newWidth > 90) return;

                    const delta = newWidth - width;
                    if (index < columns.length - 1) {
                      handleColumnResize(index, delta);
                    }
                  }}
                  className="w-full px-2 py-1 text-xs text-center bg-transparent border border-studio-surface/50 rounded text-studio-text-muted focus:outline-hidden focus:border-studio-accent/50"
                />
              </div>
            </div>

            {/* Resize handle */}
            {index < columns.length - 1 && (
              <button
                type="button"
                aria-label={`Resize column ${index + 1}`}
                className="w-1 bg-transparent hover:bg-studio-accent/50 cursor-col-resize shrink-0 relative group/handle border-0 p-0"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const containerWidth = (e.target as HTMLElement).parentElement?.offsetWidth || 1;

                  const handleMouseMove = (moveEvent: MouseEvent): void => {
                    const deltaX = moveEvent.clientX - startX;
                    const deltaPercent = (deltaX / containerWidth) * 100;
                    handleColumnResize(index, deltaPercent);
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <span className="absolute inset-y-0 -left-1 -right-1 group-hover/handle:bg-studio-accent/20" />
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile stack toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={content.stackOnMobile !== false}
          onChange={(e) => onUpdate({ content: { ...content, stackOnMobile: e.target.checked } })}
          className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
        />
        <span className="text-sm text-studio-text-muted">Stack columns on mobile</span>
      </label>
    </div>
  );
}

export default ColumnsBlock;
