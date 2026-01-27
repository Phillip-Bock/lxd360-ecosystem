'use client';

import { cn } from '@lxd360/ui';
import { Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMediaUpload } from '@/lib/hooks/use-media-upload';
import type { MediaAsset, MediaFilters, MediaSortOptions } from '@/lib/media/types';
import {
  batchSoftDeleteMedia,
  listMedia,
  softDeleteMedia,
  updateMedia,
} from '@/lib/services/media';
import { MediaDetailsPanel, type MediaUpdateInput } from './media-details-panel';
import { MediaFiltersBar } from './media-filters-bar';
import { MediaGrid } from './media-grid';
import { MediaUploader } from './media-uploader';

// =============================================================================
// Types
// =============================================================================

export interface MediaLibraryBrowserProps {
  tenantId: string;
  onSelect?: (media: MediaAsset[]) => void;
  selectable?: boolean;
  multiSelect?: boolean;
  initialFilters?: MediaFilters;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function MediaLibraryBrowser({
  tenantId,
  onSelect,
  selectable = false,
  multiSelect = false,
  initialFilters,
  className,
}: MediaLibraryBrowserProps) {
  // State
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');

  // Filters and search
  const [filters, setFilters] = useState<MediaFilters>(initialFilters ?? {});
  const [sortOptions, setSortOptions] = useState<MediaSortOptions>({
    field: 'created_at',
    direction: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload hook
  const { upload, uploadMultiple, progress } = useMediaUpload({
    onSuccess: (asset) => {
      setMedia((prev) => [asset, ...prev]);
    },
  });

  // Load media function
  const loadMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await listMedia(tenantId, { filters, sort: sortOptions });
      if (error) {
        console.error('Failed to load media:', error);
      } else {
        setMedia(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, filters, sortOptions]);

  // Load media on mount and when filters change
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Filter media by search query (client-side)
  const filteredMedia = searchQuery
    ? media.filter(
        (item) =>
          item.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : media;

  // Handlers
  const handleSelect = useCallback(
    (item: MediaAsset) => {
      if (!selectable) {
        setSelectedMedia(item);
        return;
      }

      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (next.has(item.id)) {
          next.delete(item.id);
        } else {
          if (!multiSelect) {
            next.clear();
          }
          next.add(item.id);
        }

        return next;
      });
    },
    [selectable, multiSelect],
  );

  const handleConfirmSelection = useCallback(() => {
    if (onSelect) {
      const selected = media.filter((item) => selectedIds.has(item.id));
      onSelect(selected);
    }
  }, [onSelect, media, selectedIds]);

  const handleDelete = useCallback((item: MediaAsset) => {
    setDeleteTarget(item);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const { error } = await softDeleteMedia(tenantId, deleteTarget.id);
      if (error) {
        console.error('Failed to delete media:', error);
      } else {
        setMedia((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteTarget.id);
          return next;
        });
        if (selectedMedia?.id === deleteTarget.id) {
          setSelectedMedia(null);
        }
      }
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    setIsDeleting(true);
    try {
      const { successful } = await batchSoftDeleteMedia(tenantId, Array.from(selectedIds));
      setMedia((prev) => prev.filter((item) => !successful.includes(item.id)));
      setSelectedIds(new Set());
      if (selectedMedia && successful.includes(selectedMedia.id)) {
        setSelectedMedia(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (mediaId: string, updates: MediaUpdateInput) => {
    const { error } = await updateMedia(tenantId, mediaId, {
      altText: updates.altText,
      description: updates.description,
      tags: updates.tags,
    });

    if (error) {
      console.error('Failed to update media:', error);
    } else {
      setMedia((prev) =>
        prev.map((item) =>
          item.id === mediaId
            ? {
                ...item,
                alt_text: updates.altText ?? item.alt_text,
                description: updates.description ?? item.description,
                tags: updates.tags ?? item.tags,
              }
            : item,
        ),
      );
      if (selectedMedia?.id === mediaId) {
        setSelectedMedia((prev) =>
          prev
            ? {
                ...prev,
                alt_text: updates.altText ?? prev.alt_text,
                description: updates.description ?? prev.description,
                tags: updates.tags ?? prev.tags,
              }
            : null,
        );
      }
    }
  };

  const handleUpload = async (files: File[]) => {
    if (files.length === 1) {
      await upload(files[0]);
    } else {
      await uploadMultiple(files);
    }
    setActiveTab('library');
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSortOptions({ field: 'created_at', direction: 'desc' });
  };

  return (
    <div className={cn('flex h-full', className)}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Media Library</h2>
          <div className="flex items-center gap-2">
            {selectable && selectedIds.size > 0 && (
              <>
                <span className="text-sm text-zinc-400">{selectedIds.size} selected</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <Button type="button" onClick={handleConfirmSelection}>
                  Use Selected
                </Button>
              </>
            )}
            {!selectable && selectedIds.size > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete {selectedIds.size}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'library' | 'upload')}>
          <div className="border-b border-white/10">
            <TabsList className="px-4">
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">
                <Plus className="h-4 w-4 mr-1" />
                Upload
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="library" className="flex-1 p-4 space-y-4 overflow-auto">
            <MediaFiltersBar
              filters={filters}
              sortOptions={sortOptions}
              searchQuery={searchQuery}
              onFiltersChange={setFilters}
              onSortChange={setSortOptions}
              onSearchChange={setSearchQuery}
              onClearFilters={handleClearFilters}
            />

            <MediaGrid
              media={filteredMedia}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onDelete={handleDelete}
              onEdit={(item) => setSelectedMedia(item)}
              selectable={selectable || multiSelect}
              isLoading={isLoading}
              emptyMessage={
                searchQuery
                  ? 'No media matches your search'
                  : 'No media yet. Upload some files to get started.'
              }
            />
          </TabsContent>

          <TabsContent value="upload" className="flex-1 p-4 overflow-auto">
            <MediaUploader onUpload={handleUpload} uploading={progress} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Details Panel */}
      {selectedMedia && !selectable && (
        <div className="w-80 flex-shrink-0">
          <MediaDetailsPanel
            media={selectedMedia}
            onClose={() => setSelectedMedia(null)}
            onUpdate={handleUpdate}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.original_filename}&quot;? This
              media will be moved to the archive and can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
