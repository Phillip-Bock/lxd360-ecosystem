'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { MediaAsset, MediaSort, MediaSortField } from '@/types/media-library';
import { MediaListItem } from './media-list-item';

interface MediaListProps {
  assets: MediaAsset[];
  selectedIds: Set<string>;
  focusedId?: string;
  onSelect: (id: string, event?: React.MouseEvent) => void;
  onToggleSelection: (id: string) => void;
  onPreview: (asset: MediaAsset) => void;
  onContextMenu: (event: React.MouseEvent, asset: MediaAsset) => void;
  sort: MediaSort;
  onSortChange: (sort: MediaSort) => void;
}

const COLUMNS: { field: MediaSortField; label: string; className: string }[] = [
  { field: 'name', label: 'Name', className: 'flex-1 min-w-0' },
  { field: 'type', label: 'Type', className: 'w-24 hidden sm:block' },
  { field: 'size', label: 'Size', className: 'w-20 text-right hidden md:block' },
  { field: 'dimensions', label: 'Dimensions', className: 'w-28 text-right hidden lg:block' },
  { field: 'date', label: 'Uploaded', className: 'w-28 text-right hidden xl:block' },
];

export function MediaList({
  assets,
  selectedIds,
  focusedId,
  onSelect,
  onToggleSelection,
  onPreview,
  onContextMenu,
  sort,
  onSortChange,
}: MediaListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: assets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 10,
  });

  const handleSort = useCallback(
    (field: MediaSortField) => {
      if (sort.field === field) {
        onSortChange({
          field,
          direction: sort.direction === 'asc' ? 'desc' : 'asc',
        });
      } else {
        onSortChange({ field, direction: 'asc' });
      }
    },
    [sort, onSortChange],
  );

  const SortIcon = ({ field }: { field: MediaSortField }) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />;
    }
    return sort.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/50 shrink-0">
        {/* Checkbox placeholder */}
        <div className="w-5 shrink-0" />

        {/* Thumbnail placeholder */}
        <div className="w-12 shrink-0" />

        {COLUMNS.map(({ field, label, className }) => (
          <button
            type="button"
            key={field}
            onClick={() => handleSort(field)}
            className={cn(
              'flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors',
              className,
            )}
          >
            {label}
            <SortIcon field={field} />
          </button>
        ))}

        {/* Actions placeholder */}
        <div className="w-10 shrink-0" />
      </div>

      {/* List */}
      <div ref={parentRef} className="flex-1 overflow-auto" style={{ contain: 'strict' }}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const asset = assets[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <MediaListItem
                  asset={asset}
                  isSelected={selectedIds.has(asset.id)}
                  isFocused={focusedId === asset.id}
                  onSelect={(e) => onSelect(asset.id, e)}
                  onToggleSelection={() => onToggleSelection(asset.id)}
                  onPreview={() => onPreview(asset)}
                  onContextMenu={(e) => onContextMenu(e, asset)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
