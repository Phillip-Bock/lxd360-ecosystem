'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useMemo, useRef } from 'react';
import type { MediaAsset } from '@/types/media-library';
import { MediaCard } from './media-card';

interface MediaGridProps {
  assets: MediaAsset[];
  selectedIds: Set<string>;
  focusedId?: string;
  onSelect: (id: string, event?: React.MouseEvent) => void;
  onToggleSelection: (id: string) => void;
  onPreview: (asset: MediaAsset) => void;
  onContextMenu: (event: React.MouseEvent, asset: MediaAsset) => void;
}

export function MediaGrid({
  assets,
  selectedIds,
  focusedId,
  onSelect,
  onToggleSelection,
  onPreview,
  onContextMenu,
}: MediaGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions
  const columnCount = useMemo(() => {
    if (typeof window === 'undefined') return 4;
    const width = parentRef.current?.clientWidth || window.innerWidth - 320 - 320; // account for sidebars
    const minCardWidth = 200;
    const gap = 16;
    const padding = 32;
    const availableWidth = width - padding;
    return Math.max(2, Math.floor((availableWidth + gap) / (minCardWidth + gap)));
  }, []);

  // Group assets into rows
  const rows = useMemo(() => {
    const result: MediaAsset[][] = [];
    for (let i = 0; i < assets.length; i += columnCount) {
      result.push(assets.slice(i, i + columnCount));
    }
    return result;
  }, [assets, columnCount]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280, // Approximate row height
    overscan: 3,
  });

  const handleSelect = useCallback(
    (id: string, event?: React.MouseEvent) => {
      onSelect(id, event);
    },
    [onSelect],
  );

  const handleToggleSelection = useCallback(
    (id: string) => {
      onToggleSelection(id);
    },
    [onToggleSelection],
  );

  const handlePreview = useCallback(
    (asset: MediaAsset) => {
      onPreview(asset);
    },
    [onPreview],
  );

  const handleContextMenu = useCallback(
    (event: React.MouseEvent, asset: MediaAsset) => {
      onContextMenu(event, asset);
    },
    [onContextMenu],
  );

  return (
    <div ref={parentRef} className="h-full overflow-auto" style={{ contain: 'strict' }}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        <div className="p-4">
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
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
                <div
                  className="grid gap-4 px-4"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  }}
                >
                  {row.map((asset) => (
                    <MediaCard
                      key={asset.id}
                      asset={asset}
                      isSelected={selectedIds.has(asset.id)}
                      isFocused={focusedId === asset.id}
                      onSelect={(e) => handleSelect(asset.id, e)}
                      onToggleSelection={() => handleToggleSelection(asset.id)}
                      onPreview={() => handlePreview(asset)}
                      onContextMenu={(e) => handleContextMenu(e, asset)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
