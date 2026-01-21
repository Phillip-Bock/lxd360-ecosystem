'use client';

import { Filter, Folder, Search, Star, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaEmptyStateProps {
  hasFilters: boolean;
  folderId?: string;
  collectionId?: string;
  onClearFilters: () => void;
}

export function MediaEmptyState({
  hasFilters,
  folderId,
  collectionId,
  onClearFilters,
}: MediaEmptyStateProps) {
  // Determine which empty state to show
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          We couldn't find unknown assets matching your current filters. Try adjusting your search
          or filters.
        </p>
        <Button variant="outline" onClick={onClearFilters} className="gap-2">
          <Filter className="w-4 h-4" />
          Clear all filters
        </Button>
      </div>
    );
  }

  if (folderId) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
          <Folder className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">This folder is empty</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Upload files or move existing assets to this folder to get started.
        </p>
        <div className="flex items-center gap-3">
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Files
          </Button>
        </div>
      </div>
    );
  }

  if (collectionId) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-linear-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mb-6">
          <Star className="w-10 h-10 text-amber-500" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">This collection is empty</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Add assets to this collection by right-clicking on unknown asset and selecting "Add to
          collection".
        </p>
      </div>
    );
  }

  // Default - no assets at all
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 relative">
        <Upload className="w-12 h-12 text-primary" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-lg font-bold">+</span>
        </div>
      </div>
      <h3 className="text-2xl font-semibold text-foreground mb-2">Upload your first assets</h3>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Drag and drop files here, or click the button below to browse your computer. We support
        images, videos, audio files, documents, and 3D models.
      </p>
      <Button size="lg" className="gap-2">
        <Upload className="w-5 h-5" />
        Upload Files
      </Button>

      <div className="mt-8 text-sm text-muted-foreground">
        <p className="mb-2 font-medium">Supported formats:</p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-2 py-1 bg-muted rounded text-xs">JPG</span>
          <span className="px-2 py-1 bg-muted rounded text-xs">PNG</span>
          <span className="px-2 py-1 bg-muted rounded text-xs">GIF</span>
          <span className="px-2 py-1 bg-muted rounded text-xs">WebP</span>
          <span className="px-2 py-1 bg-muted rounded text-xs">SVG</span>
          <span className="px-2 py-1 bg-muted rounded text-xs">MP4</span>
          <span className="px-2 py-1 bg-muted rounded text-xs">WebM</span>
          <span className="px-2 py-1 bg-muted rounded text-xs">MP3</span>
          <span className="px-2 py-1 bg-muted rounded text-xs">WAV</span>
          <span className="px-2 py-1 bg-muted rounded text-xs">PDF</span>
          <span className="px-2 py-1 bg-muted rounded text-xs">GLTF</span>
        </div>
      </div>
    </div>
  );
}
