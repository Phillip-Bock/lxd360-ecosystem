'use client';

import { FolderPlus } from 'lucide-react';
import type { LibraryItem } from '@/types/library';
import { LibraryItemCard } from './library-item-card';

interface LibraryGridProps {
  items: LibraryItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpenFolder: (item: LibraryItem) => void;
  onPreview: (item: LibraryItem) => void;
  emptyMessage?: string;
  libraryLabel?: string;
}

export function LibraryGrid({
  items,
  selectedId,
  onSelect,
  onOpenFolder,
  onPreview,
  emptyMessage = 'No items found',
  libraryLabel = 'items',
}: LibraryGridProps) {
  const handleBackgroundClick = () => {
    onSelect(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onSelect(null);
    }
  };

  const handleDoubleClick = (item: LibraryItem) => {
    if (item.type === 'folder') {
      onOpenFolder(item);
    } else {
      onPreview(item);
    }
  };

  if (items.length === 0) {
    return (
      <section
        className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 bg-white"
        onClick={handleBackgroundClick}
        onKeyDown={handleKeyDown}
        aria-label={`Empty ${libraryLabel} library`}
      >
        <FolderPlus className="h-16 w-16 mb-4 opacity-50" aria-hidden="true" />
        <p className="text-lg">{emptyMessage}</p>
        <p className="text-sm mt-2">
          Upload files or create folders to get started with your {libraryLabel}
        </p>
      </section>
    );
  }

  return (
    <section
      className="flex-1 p-6 overflow-auto bg-white"
      onClick={handleBackgroundClick}
      onKeyDown={handleKeyDown}
      aria-label={`${libraryLabel} library grid`}
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
        {items.map((item) => (
          <LibraryItemCard
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onSelect={onSelect}
            onDoubleClick={handleDoubleClick}
            onPreview={item.type === 'file' ? () => onPreview(item) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
