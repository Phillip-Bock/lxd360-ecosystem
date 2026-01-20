'use client';

import { ChevronRight, Home, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaFolder } from '@/types/media-library';

interface MediaBreadcrumbsProps {
  path: MediaFolder[];
  collectionName?: string;
  onNavigate: (folderId: string | undefined) => void;
}

export function MediaBreadcrumbs({ path, collectionName, onNavigate }: MediaBreadcrumbsProps) {
  // Don't render if at root with no collection
  if (path.length === 0 && !collectionName) {
    return null;
  }

  return (
    <nav className="flex items-center gap-1 px-4 py-2 text-sm border-b border-border bg-muted/30">
      <button
        type="button"
        onClick={() => onNavigate(undefined)}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md transition-colors',
          path.length === 0 && !collectionName
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        )}
      >
        <Home className="w-4 h-4" />
        <span>All Files</span>
      </button>

      {collectionName && (
        <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="flex items-center gap-1 px-2 py-1 text-foreground font-medium">
            <Star className="w-4 h-4" />
            {collectionName}
          </span>
        </>
      )}

      {path.map((folder, index) => {
        const isLast = index === path.length - 1;

        return (
          <div key={folder.id} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <button
              type="button"
              onClick={() => onNavigate(folder.id)}
              className={cn(
                'px-2 py-1 rounded-md transition-colors',
                isLast
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {folder.name}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
