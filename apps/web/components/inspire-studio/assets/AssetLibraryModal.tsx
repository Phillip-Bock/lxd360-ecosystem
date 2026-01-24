'use client';

import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  Check,
  FileText,
  Filter,
  Grid3x3,
  Image as ImageIcon,
  List,
  Music,
  Search,
  SortAsc,
  SortDesc,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AssetCategory } from '@/lib/assets/mimeTypes';
import type { AssetMetadata } from '@/lib/assets/storage';
import { requireDb } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';
import { AIAutoTagger } from './AIAutoTagger';
import { AssetGrid } from './AssetGrid';
import { AssetMetadataPanel } from './AssetMetadataPanel';
import { AssetUploader } from './AssetUploader';

// =============================================================================
// Types
// =============================================================================

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'date' | 'size' | 'type';
type SortDirection = 'asc' | 'desc';
type ModalTab = 'library' | 'upload';

interface AssetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  userId: string;
  onSelect?: (assets: AssetMetadata[]) => void;
  selectionMode?: 'single' | 'multiple';
  filterByCategory?: AssetCategory[];
  title?: string;
}

// =============================================================================
// Category Filter Options
// =============================================================================

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All', icon: Grid3x3 },
  { value: 'image', label: 'Images', icon: ImageIcon },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'audio', label: 'Audio', icon: Music },
  { value: 'document', label: 'Documents', icon: FileText },
] as const;

// =============================================================================
// Asset Library Modal Component
// =============================================================================

export function AssetLibraryModal({
  isOpen,
  onClose,
  tenantId,
  userId,
  onSelect,
  selectionMode = 'single',
  filterByCategory,
  title = 'Asset Library',
}: AssetLibraryModalProps) {
  // State
  const [activeTab, setActiveTab] = useState<ModalTab>('library');
  const [assets, setAssets] = useState<AssetMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailAsset, setDetailAsset] = useState<AssetMetadata | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Load assets from Firestore
  useEffect(() => {
    if (!isOpen || !tenantId) return;

    setIsLoading(true);
    const assetsRef = collection(requireDb(), 'tenants', tenantId, 'assets');
    const q = query(assetsRef, orderBy('uploadedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedAssets: AssetMetadata[] = [];
        snapshot.forEach((doc) => {
          loadedAssets.push({ id: doc.id, ...doc.data() } as AssetMetadata);
        });
        setAssets(loadedAssets);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading assets:', error);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [isOpen, tenantId]);

  // Filter assets
  const filteredAssets = useMemo(() => {
    let result = assets;

    // Category filter (from props or user selection)
    if (filterByCategory && filterByCategory.length > 0) {
      result = result.filter((a) => filterByCategory.includes(a.category));
    } else if (categoryFilter !== 'all') {
      result = result.filter((a) => a.category === categoryFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.originalFileName.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query)) ||
          a.altText?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [assets, filterByCategory, categoryFilter, searchQuery]);

  // Handle selection
  const handleSelect = useCallback(
    (assetId: string, multi: boolean) => {
      if (selectionMode === 'single') {
        setSelectedIds(new Set([assetId]));
      } else if (multi) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(assetId)) {
            next.delete(assetId);
          } else {
            next.add(assetId);
          }
          return next;
        });
      } else {
        setSelectedIds(new Set([assetId]));
      }
    },
    [selectionMode],
  );

  // Handle preview
  const handlePreview = useCallback((asset: AssetMetadata) => {
    setDetailAsset(asset);
  }, []);

  // Handle edit
  const handleEdit = useCallback((asset: AssetMetadata) => {
    setDetailAsset(asset);
    setShowAIPanel(false);
  }, []);

  // Handle confirm selection
  const handleConfirmSelection = useCallback(() => {
    const selectedAssets = assets.filter((a) => selectedIds.has(a.id));
    onSelect?.(selectedAssets);
    onClose();
  }, [assets, selectedIds, onSelect, onClose]);

  // Handle upload complete
  const handleUploadComplete = useCallback((newAssets: AssetMetadata[]) => {
    // Assets will be added via Firestore listener
    // Switch to library view if multiple uploaded
    if (newAssets.length > 1) {
      setActiveTab('library');
    }
  }, []);

  // Handle asset metadata save
  const handleAssetSave = useCallback((updatedAsset: AssetMetadata) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setDetailAsset(updatedAsset);
  }, []);

  // Handle AI tags request
  const handleRequestAITags = useCallback((asset: AssetMetadata) => {
    setDetailAsset(asset);
    setShowAIPanel(true);
  }, []);

  // Toggle sort direction
  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // Clear selection on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedIds(new Set());
      setDetailAsset(null);
      setShowAIPanel(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 bg-lxd-dark-bg border-lxd-dark-border flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-lxd-dark-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-white">{title}</DialogTitle>
            <Button type="button" variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between mt-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ModalTab)}>
              <TabsList className="bg-lxd-dark-surface">
                <TabsTrigger value="library">Library</TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === 'library' && (
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search assets..."
                    className="w-64 h-9 pl-8 bg-lxd-dark-surface border-lxd-dark-border"
                  />
                </div>

                {/* Category Filter */}
                {!filterByCategory && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-1" />
                        {CATEGORY_OPTIONS.find((c) => c.value === categoryFilter)?.label ?? 'All'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {CATEGORY_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => setCategoryFilter(option.value)}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {option.label}
                            {categoryFilter === option.value && (
                              <Check className="w-4 h-4 ml-auto" />
                            )}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      {sortDirection === 'asc' ? (
                        <SortAsc className="w-4 h-4 mr-1" />
                      ) : (
                        <SortDesc className="w-4 h-4 mr-1" />
                      )}
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortField('name')}>
                      Name {sortField === 'name' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortField('date')}>
                      Date {sortField === 'date' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortField('size')}>
                      Size {sortField === 'size' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortField('type')}>
                      Type {sortField === 'type' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleSortDirection}>
                      {sortDirection === 'asc' ? 'Descending' : 'Ascending'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode Toggle */}
                <div className="flex border border-lxd-dark-border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn('rounded-r-none', viewMode === 'grid' && 'bg-lxd-dark-surface')}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn('rounded-l-none', viewMode === 'list' && 'bg-lxd-dark-surface')}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'library' ? (
            <>
              {/* Asset Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lxd-cyan" />
                  </div>
                ) : (
                  <AssetGrid
                    assets={filteredAssets}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onPreview={handlePreview}
                    onEdit={handleEdit}
                    viewMode={viewMode}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    emptyMessage="No assets found. Upload some files to get started."
                  />
                )}
              </div>

              {/* Detail Panel */}
              {detailAsset && (
                <div className="w-80 border-l border-lxd-dark-border flex flex-col">
                  {showAIPanel ? (
                    <div className="flex-1 overflow-y-auto p-4">
                      <AIAutoTagger
                        asset={detailAsset}
                        onApplyTags={(tags) => {
                          handleAssetSave({ ...detailAsset, tags: [...detailAsset.tags, ...tags] });
                        }}
                        onApplyAltText={(altText) => {
                          handleAssetSave({ ...detailAsset, altText });
                        }}
                      />
                    </div>
                  ) : (
                    <AssetMetadataPanel
                      asset={detailAsset}
                      tenantId={tenantId}
                      onClose={() => setDetailAsset(null)}
                      onSave={handleAssetSave}
                      onRequestAITags={handleRequestAITags}
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 p-6">
              <AssetUploader
                tenantId={tenantId}
                userId={userId}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'library' && onSelect && (
          <div className="flex items-center justify-between p-4 border-t border-lxd-dark-border flex-shrink-0">
            <p className="text-sm text-white/60">
              {selectedIds.size} asset{selectedIds.size !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-lxd-cyan hover:bg-lxd-cyan/80"
                onClick={handleConfirmSelection}
                disabled={selectedIds.size === 0}
              >
                <Check className="w-4 h-4 mr-1" />
                {selectionMode === 'single' ? 'Select Asset' : `Select (${selectedIds.size})`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AssetLibraryModal;
