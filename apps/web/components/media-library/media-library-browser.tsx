'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { logger } from '@/lib/logger';

const log = logger.scope('MediaLibraryBrowser');

import type {
  MediaAsset,
  MediaAssetStatus,
  MediaAssetType,
  MediaCollection,
  MediaFiltersState,
  MediaFolder,
  MediaSort,
  MediaViewMode,
} from '@/types/media-library';
import { MediaBreadcrumbs } from './media-breadcrumbs';
import { MediaContextMenu } from './media-context-menu';
import { MediaDetails } from './media-details';
import { MediaEmptyState } from './media-empty-state';
import { MediaGrid } from './media-grid';
import { MediaList } from './media-list';
import { MediaPreviewModal } from './media-preview-modal';
import { MediaSidebar } from './media-sidebar';
import { MediaToolbar } from './media-toolbar';

// Generate mock data
const generateMockAssets = (): MediaAsset[] => {
  const types: MediaAssetType[] = ['image', 'video', 'audio', 'document', '3d'];
  const statuses: MediaAssetStatus[] = ['ready', 'processing', 'error'];
  const mockTags = ['brand', 'marketing', 'product', 'team', 'event', 'training', 'presentation'];

  const assets: MediaAsset[] = [];

  for (let i = 1; i <= 150; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status =
      Math.random() > 0.1 ? 'ready' : statuses[Math.floor(Math.random() * statuses.length)];
    const numTags = Math.floor(Math.random() * 4);
    const selectedTags = mockTags.sort(() => 0.5 - Math.random()).slice(0, numTags);

    let mimeType = 'image/jpeg';
    let width: number | undefined;
    let height: number | undefined;
    let duration: number | undefined;

    switch (type) {
      case 'image':
        mimeType = ['image/jpeg', 'image/png', 'image/webp'][Math.floor(Math.random() * 3)];
        width = [800, 1200, 1920, 2560, 3840][Math.floor(Math.random() * 5)];
        height = Math.floor(width * (Math.random() * 0.5 + 0.5));
        break;
      case 'video':
        mimeType = 'video/mp4';
        width = [1280, 1920, 3840][Math.floor(Math.random() * 3)];
        height = Math.floor(width * 0.5625);
        duration = Math.floor(Math.random() * 600) + 10;
        break;
      case 'audio':
        mimeType = 'audio/mpeg';
        duration = Math.floor(Math.random() * 300) + 30;
        break;
      case 'document':
        mimeType = ['application/pdf', 'application/msword'][Math.floor(Math.random() * 2)];
        break;
      case '3d':
        mimeType = 'model/gltf-binary';
        break;
    }

    assets.push({
      id: `asset-${i}`,
      filename: `${type}-asset-${i}.${mimeType.split('/')[1]}`,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Asset ${i}`,
      description: Math.random() > 0.5 ? `Description for asset ${i}` : undefined,
      altText: type === 'image' ? `Alt text for image ${i}` : undefined,
      type,
      mimeType,
      size: Math.floor(Math.random() * 50000000) + 100000,
      url: `https://picsum.photos/seed/${i}/800/600`,
      thumbnailUrl: `https://picsum.photos/seed/${i}/200/150`,
      blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
      width,
      height,
      duration,
      status,
      tags: selectedTags,
      folderId: Math.random() > 0.7 ? `folder-${Math.floor(Math.random() * 5) + 1}` : undefined,
      collectionIds: Math.random() > 0.8 ? [`collection-${Math.floor(Math.random() * 3) + 1}`] : [],
      uploadedBy: 'user-1',
      uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      usageCount: Math.floor(Math.random() * 20),
    });
  }

  return assets;
};

const generateMockFolders = (): MediaFolder[] => [
  {
    id: 'folder-1',
    name: 'Brand Assets',
    path: '/Brand Assets',
    assetCount: 24,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-2',
    name: 'Marketing',
    path: '/Marketing',
    assetCount: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-3',
    name: 'Product Images',
    path: '/Product Images',
    assetCount: 67,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-4',
    name: 'Team Photos',
    path: '/Team Photos',
    assetCount: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-5',
    name: 'Training Videos',
    path: '/Training Videos',
    assetCount: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-6',
    name: 'Documents',
    parentId: 'folder-2',
    path: '/Marketing/Documents',
    assetCount: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const generateMockCollections = (): MediaCollection[] => [
  {
    id: 'collection-1',
    name: 'Featured',
    description: 'Featured assets for homepage',
    color: '#3B82F6',
    assetCount: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'collection-2',
    name: 'Social Media',
    description: 'Assets for social media posts',
    color: '#10B981',
    assetCount: 34,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'collection-3',
    name: 'Presentations',
    description: 'Assets for presentations',
    color: '#8B5CF6',
    assetCount: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const defaultFilters: MediaFiltersState = {
  types: [],
  status: [],
  tags: [],
};

export function MediaLibraryBrowser(): React.JSX.Element {
  // State
  const [assets] = useState<MediaAsset[]>(() => generateMockAssets());
  const [folders] = useState<MediaFolder[]>(() => generateMockFolders());
  const [collections] = useState<MediaCollection[]>(() => generateMockCollections());

  const [viewMode, setViewMode] = useLocalStorage<MediaViewMode>('media-library-view', 'grid');
  const [sort, setSort] = useLocalStorage<MediaSort>('media-library-sort', {
    field: 'date',
    direction: 'desc',
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>(
    'media-library-sidebar',
    false,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [filters, setFilters] = useState<MediaFiltersState>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [currentCollectionId, setCurrentCollectionId] = useState<string | undefined>();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | undefined>();
  const [focusedId, setFocusedId] = useState<string | undefined>();

  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [isLoading] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    asset: MediaAsset;
  } | null>(null);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.filename.toLowerCase().includes(query) ||
          asset.title.toLowerCase().includes(query) ||
          asset.description?.toLowerCase().includes(query) ||
          asset.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Folder filter
    if (currentFolderId) {
      result = result.filter((asset) => asset.folderId === currentFolderId);
    }

    // Collection filter
    if (currentCollectionId) {
      result = result.filter((asset) => asset.collectionIds.includes(currentCollectionId));
    }

    // Type filter
    if (filters.types.length > 0) {
      result = result.filter((asset) => filters.types.includes(asset.type));
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter((asset) => filters.status.includes(asset.status));
    }

    // Tags filter
    if (filters.tags.length > 0) {
      result = result.filter((asset) => filters.tags.some((tag) => asset.tags.includes(tag)));
    }

    // Date range filter
    if (filters.dateRange) {
      const dateRange = filters.dateRange;
      result = result.filter((asset) => {
        const date = new Date(asset.uploadedAt);
        return date >= dateRange.from && date <= dateRange.to;
      });
    }

    // Size range filter
    if (filters.sizeRange) {
      const sizeRange = filters.sizeRange;
      result = result.filter((asset) => asset.size >= sizeRange.min && asset.size <= sizeRange.max);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case 'name':
          comparison = a.filename.localeCompare(b.filename);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'dimensions': {
          const aDim = (a.width || 0) * (a.height || 0);
          const bDim = (b.width || 0) * (b.height || 0);
          comparison = aDim - bDim;
          break;
        }
      }
      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [assets, searchQuery, currentFolderId, currentCollectionId, filters, sort]);

  // Get selected asset for details panel
  const selectedAsset = useMemo(() => {
    if (selectedIds.size === 1) {
      const id = Array.from(selectedIds)[0];
      return assets.find((a) => a.id === id);
    }
    return undefined;
  }, [selectedIds, assets]);

  // Selection handlers
  const handleSelect = useCallback(
    (id: string, event?: React.MouseEvent) => {
      const shiftKey = event?.shiftKey;
      const ctrlKey = event?.ctrlKey || event?.metaKey;

      setSelectedIds((prev) => {
        const newSet = new Set(prev);

        if (shiftKey && lastSelectedId) {
          // Range selection
          const allIds = filteredAssets.map((a) => a.id);
          const lastIndex = allIds.indexOf(lastSelectedId);
          const currentIndex = allIds.indexOf(id);
          const [start, end] = [
            Math.min(lastIndex, currentIndex),
            Math.max(lastIndex, currentIndex),
          ];

          for (let i = start; i <= end; i++) {
            newSet.add(allIds[i]);
          }
        } else if (ctrlKey) {
          // Toggle selection
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
        } else {
          // Single selection
          newSet.clear();
          newSet.add(id);
        }

        return newSet;
      });

      setLastSelectedId(id);
      setFocusedId(id);
      setDetailsOpen(true);
    },
    [lastSelectedId, filteredAssets],
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredAssets.map((a) => a.id)));
  }, [filteredAssets]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
    setDetailsOpen(false);
  }, []);

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Preview handlers
  const handlePreview = useCallback((asset: MediaAsset) => {
    setPreviewAsset(asset);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewAsset(null);
  }, []);

  const handlePrevAsset = useCallback(() => {
    if (!previewAsset) return;
    const index = filteredAssets.findIndex((a) => a.id === previewAsset.id);
    if (index > 0) {
      setPreviewAsset(filteredAssets[index - 1]);
    }
  }, [previewAsset, filteredAssets]);

  const handleNextAsset = useCallback(() => {
    if (!previewAsset) return;
    const index = filteredAssets.findIndex((a) => a.id === previewAsset.id);
    if (index < filteredAssets.length - 1) {
      setPreviewAsset(filteredAssets[index + 1]);
    }
  }, [previewAsset, filteredAssets]);

  // Folder/Collection handlers
  const handleFolderSelect = useCallback((folderId: string | undefined) => {
    setCurrentFolderId(folderId);
    setCurrentCollectionId(undefined);
    setSelectedIds(new Set());
  }, []);

  const handleCollectionSelect = useCallback((collectionId: string | undefined) => {
    setCurrentCollectionId(collectionId);
    setCurrentFolderId(undefined);
    setSelectedIds(new Set());
  }, []);

  // Action handlers
  const handleDelete = useCallback((ids: string[]) => {
    // Placeholder implementation - delete functionality to be implemented
    log.warn('Delete requested - not yet implemented', { count: ids.length });
    setSelectedIds(new Set());
  }, []);

  const handleMove = useCallback((ids: string[], targetFolderId: string) => {
    // Placeholder implementation - move functionality to be implemented
    log.warn('Move requested - not yet implemented', { count: ids.length, targetFolderId });
  }, []);

  const handleAddToCollection = useCallback((ids: string[], collectionId: string) => {
    // Placeholder implementation - add to collection functionality to be implemented
    log.warn('Add to collection requested - not yet implemented', {
      count: ids.length,
      collectionId,
    });
  }, []);

  const handleDownload = useCallback((asset: MediaAsset) => {
    // TODO(LXD-404): Implement proper download with Content-Disposition
    window.open(asset.url, '_blank');
  }, []);

  const handleCopyUrl = useCallback((asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
  }, []);

  // Context menu handlers
  const handleContextMenu = useCallback((event: React.MouseEvent, asset: MediaAsset) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, asset });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Don't handle shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      if (modKey && event.key === 'a') {
        event.preventDefault();
        handleSelectAll();
      } else if (modKey && event.key === 'd') {
        event.preventDefault();
        handleDeselectAll();
      } else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIds.size > 0) {
        event.preventDefault();
        handleDelete(Array.from(selectedIds));
      } else if (event.key === 'Enter' && focusedId) {
        event.preventDefault();
        const asset = assets.find((a) => a.id === focusedId);
        if (asset) handlePreview(asset);
      } else if (event.key === 'Escape') {
        if (previewAsset) {
          handleClosePreview();
        } else if (contextMenu) {
          handleCloseContextMenu();
        } else {
          handleDeselectAll();
        }
      } else if (event.key === ' ' && focusedId) {
        event.preventDefault();
        handleToggleSelection(focusedId);
      } else if (event.key === 'ArrowLeft' && previewAsset) {
        event.preventDefault();
        handlePrevAsset();
      } else if (event.key === 'ArrowRight' && previewAsset) {
        event.preventDefault();
        handleNextAsset();
      } else if (
        (event.key === 'ArrowUp' ||
          event.key === 'ArrowDown' ||
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowRight') &&
        !previewAsset
      ) {
        event.preventDefault();
        const currentIndex = focusedId ? filteredAssets.findIndex((a) => a.id === focusedId) : -1;
        let nextIndex: number;

        if (viewMode === 'grid') {
          // Assume 4 columns for grid navigation (this is approximate)
          const cols = 4;
          switch (event.key) {
            case 'ArrowUp':
              nextIndex = Math.max(0, currentIndex - cols);
              break;
            case 'ArrowDown':
              nextIndex = Math.min(filteredAssets.length - 1, currentIndex + cols);
              break;
            case 'ArrowLeft':
              nextIndex = Math.max(0, currentIndex - 1);
              break;
            case 'ArrowRight':
              nextIndex = Math.min(filteredAssets.length - 1, currentIndex + 1);
              break;
            default:
              nextIndex = currentIndex;
          }
        } else {
          // List view - only up/down
          if (event.key === 'ArrowUp') {
            nextIndex = Math.max(0, currentIndex - 1);
          } else if (event.key === 'ArrowDown') {
            nextIndex = Math.min(filteredAssets.length - 1, currentIndex + 1);
          } else {
            nextIndex = currentIndex;
          }
        }

        if (nextIndex >= 0 && nextIndex < filteredAssets.length) {
          const nextAsset = filteredAssets[nextIndex];
          setFocusedId(nextAsset.id);
          if (!event.shiftKey) {
            setSelectedIds(new Set([nextAsset.id]));
            setLastSelectedId(nextAsset.id);
          } else {
            // Extend selection with shift
            setSelectedIds((prev) => {
              const newSet = new Set(prev);
              newSet.add(nextAsset.id);
              return newSet;
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return (): void => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleSelectAll,
    handleDeselectAll,
    handleDelete,
    handlePreview,
    handleClosePreview,
    handleToggleSelection,
    handlePrevAsset,
    handleNextAsset,
    handleCloseContextMenu,
    selectedIds,
    focusedId,
    previewAsset,
    contextMenu,
    filteredAssets,
    assets,
    viewMode,
  ]);

  // Get current folder path for breadcrumbs
  const currentFolderPath = useMemo(() => {
    if (!currentFolderId) return [];
    const folder = folders.find((f) => f.id === currentFolderId);
    if (!folder) return [];

    const path: MediaFolder[] = [folder];
    let parentId = folder.parentId;
    while (parentId) {
      const parent = folders.find((f) => f.id === parentId);
      if (parent) {
        path.unshift(parent);
        parentId = parent.parentId;
      } else {
        break;
      }
    }
    return path;
  }, [currentFolderId, folders]);

  // Calculate storage usage (mock)
  const storageUsage = useMemo(() => {
    const total = assets.reduce((sum, a) => sum + a.size, 0);
    const limit = 10 * 1024 * 1024 * 1024; // 10GB
    return { used: total, limit, percentage: (total / limit) * 100 };
  }, [assets]);

  // Available tags from all assets
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    for (const asset of assets) {
      for (const tag of asset.tags) {
        tags.add(tag);
      }
    }
    return Array.from(tags).sort();
  }, [assets]);

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar */}
      <MediaSidebar
        folders={folders}
        collections={collections}
        currentFolderId={currentFolderId}
        currentCollectionId={currentCollectionId}
        onFolderSelect={handleFolderSelect}
        onCollectionSelect={handleCollectionSelect}
        filters={filters}
        onFiltersChange={setFilters}
        storageUsage={storageUsage}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <MediaToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sort={sort}
          onSortChange={setSort}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCount={selectedIds.size}
          onDelete={() => handleDelete(Array.from(selectedIds))}
          onMove={(folderId) => handleMove(Array.from(selectedIds), folderId)}
          onAddToCollection={(collectionId) =>
            handleAddToCollection(Array.from(selectedIds), collectionId)
          }
          folders={folders}
          collections={collections}
          totalAssets={filteredAssets.length}
          filters={filters}
          onFiltersChange={setFilters}
          availableTags={availableTags}
        />

        {/* Breadcrumbs */}
        <MediaBreadcrumbs
          path={currentFolderPath}
          collectionName={
            currentCollectionId
              ? collections.find((c) => c.id === currentCollectionId)?.name
              : undefined
          }
          onNavigate={handleFolderSelect}
        />

        {/* Asset Grid/List */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <MediaEmptyState
              hasFilters={
                !!searchQuery ||
                filters.types.length > 0 ||
                filters.status.length > 0 ||
                filters.tags.length > 0
              }
              folderId={currentFolderId}
              collectionId={currentCollectionId}
              onClearFilters={() => {
                setSearchQuery('');
                setFilters(defaultFilters);
              }}
            />
          ) : viewMode === 'grid' ? (
            <MediaGrid
              assets={filteredAssets}
              selectedIds={selectedIds}
              focusedId={focusedId}
              onSelect={handleSelect}
              onToggleSelection={handleToggleSelection}
              onPreview={handlePreview}
              onContextMenu={handleContextMenu}
            />
          ) : (
            <MediaList
              assets={filteredAssets}
              selectedIds={selectedIds}
              focusedId={focusedId}
              onSelect={handleSelect}
              onToggleSelection={handleToggleSelection}
              onPreview={handlePreview}
              onContextMenu={handleContextMenu}
              sort={sort}
              onSortChange={setSort}
            />
          )}
        </div>
      </div>

      {/* Right Sidebar - Details Panel */}
      {detailsOpen && selectedAsset && (
        <MediaDetails
          asset={selectedAsset}
          selectedCount={selectedIds.size}
          onClose={() => setDetailsOpen(false)}
          onDownload={handleDownload}
          onDelete={(id) => handleDelete([id])}
          onPreview={handlePreview}
        />
      )}

      {/* Preview Modal */}
      {previewAsset && (
        <MediaPreviewModal
          asset={previewAsset}
          onClose={handleClosePreview}
          onPrev={handlePrevAsset}
          onNext={handleNextAsset}
          hasPrev={filteredAssets.findIndex((a) => a.id === previewAsset.id) > 0}
          hasNext={
            filteredAssets.findIndex((a) => a.id === previewAsset.id) < filteredAssets.length - 1
          }
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <MediaContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          asset={contextMenu.asset}
          onClose={handleCloseContextMenu}
          onPreview={handlePreview}
          onDownload={handleDownload}
          onCopyUrl={handleCopyUrl}
          onMove={(folderId) => {
            handleMove([contextMenu.asset.id], folderId);
            handleCloseContextMenu();
          }}
          onAddToCollection={(collectionId) => {
            handleAddToCollection([contextMenu.asset.id], collectionId);
            handleCloseContextMenu();
          }}
          onDelete={(id) => {
            handleDelete([id]);
            handleCloseContextMenu();
          }}
          folders={folders}
          collections={collections}
        />
      )}
    </div>
  );
}
