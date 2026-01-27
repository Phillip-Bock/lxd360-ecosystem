'use client';

import { Loader2 } from 'lucide-react';
import type { MediaAsset } from '@/lib/media/types';
import { MediaCard } from './media-card';

// =============================================================================
// Types
// =============================================================================

export interface MediaGridProps {
  media: MediaAsset[];
  selectedIds?: Set<string>;
  onSelect?: (media: MediaAsset) => void;
  onDelete?: (media: MediaAsset) => void;
  onEdit?: (media: MediaAsset) => void;
  selectable?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

// =============================================================================
// Component
// =============================================================================

export function MediaGrid({
  media,
  selectedIds = new Set(),
  onSelect,
  onDelete,
  onEdit,
  selectable = false,
  isLoading = false,
  emptyMessage = 'No media found',
}: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-zinc-400">Loading media...</span>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
          <svg
            className="h-8 w-8 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            role="img"
            aria-label="Empty media library"
          >
            <title>Empty media library</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-zinc-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {media.map((item) => (
        <MediaCard
          key={item.id}
          media={item}
          isSelected={selectedIds.has(item.id)}
          onSelect={onSelect}
          onDelete={onDelete}
          onEdit={onEdit}
          selectable={selectable}
        />
      ))}
    </div>
  );
}
