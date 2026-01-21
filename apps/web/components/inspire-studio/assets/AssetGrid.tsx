'use client';

import {
  Check,
  Download,
  Edit,
  Eye,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type AssetCategory, formatFileSize } from '@/lib/assets/mimeTypes';
import type { AssetMetadata } from '@/lib/assets/storage';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'date' | 'size' | 'type';
type SortDirection = 'asc' | 'desc';

interface AssetGridProps {
  assets: AssetMetadata[];
  selectedIds?: Set<string>;
  onSelect?: (assetId: string, multi: boolean) => void;
  onPreview?: (asset: AssetMetadata) => void;
  onEdit?: (asset: AssetMetadata) => void;
  onDelete?: (asset: AssetMetadata) => void;
  onDownload?: (asset: AssetMetadata) => void;
  viewMode?: ViewMode;
  sortField?: SortField;
  sortDirection?: SortDirection;
  emptyMessage?: string;
  className?: string;
}

// =============================================================================
// Category Icons
// =============================================================================

const CategoryIcon: Record<AssetCategory, typeof FileImage> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  document: FileText,
};

// =============================================================================
// Asset Grid Component
// =============================================================================

export function AssetGrid({
  assets,
  selectedIds = new Set(),
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onDownload,
  viewMode = 'grid',
  sortField = 'date',
  sortDirection = 'desc',
  emptyMessage = 'No assets found',
  className,
}: AssetGridProps) {
  // Sort assets
  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.originalFileName.localeCompare(b.originalFileName);
          break;
        case 'date':
          comparison = (a.uploadedAt?.toMillis?.() ?? 0) - (b.uploadedAt?.toMillis?.() ?? 0);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [assets, sortField, sortDirection]);

  // Handle selection
  const handleSelect = useCallback(
    (asset: AssetMetadata, event: React.MouseEvent) => {
      if (onSelect) {
        onSelect(asset.id, event.metaKey || event.ctrlKey);
      }
    },
    [onSelect],
  );

  // Handle double-click for preview
  const handleDoubleClick = useCallback(
    (asset: AssetMetadata) => {
      onPreview?.(asset);
    },
    [onPreview],
  );

  if (assets.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
        <FileImage className="w-12 h-12 text-white/20 mb-3" />
        <p className="text-sm text-white/50">{emptyMessage}</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className={cn('flex flex-col divide-y divide-lxd-dark-border', className)}>
        {sortedAssets.map((asset) => (
          <AssetListItem
            key={asset.id}
            asset={asset}
            isSelected={selectedIds.has(asset.id)}
            onSelect={handleSelect}
            onDoubleClick={handleDoubleClick}
            onPreview={onPreview}
            onEdit={onEdit}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
        className,
      )}
    >
      {sortedAssets.map((asset) => (
        <AssetGridItem
          key={asset.id}
          asset={asset}
          isSelected={selectedIds.has(asset.id)}
          onSelect={handleSelect}
          onDoubleClick={handleDoubleClick}
          onPreview={onPreview}
          onEdit={onEdit}
          onDelete={onDelete}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Asset Grid Item
// =============================================================================

interface AssetItemProps {
  asset: AssetMetadata;
  isSelected: boolean;
  onSelect: (asset: AssetMetadata, event: React.MouseEvent) => void;
  onDoubleClick: (asset: AssetMetadata) => void;
  onPreview?: (asset: AssetMetadata) => void;
  onEdit?: (asset: AssetMetadata) => void;
  onDelete?: (asset: AssetMetadata) => void;
  onDownload?: (asset: AssetMetadata) => void;
}

function AssetGridItem({
  asset,
  isSelected,
  onSelect,
  onDoubleClick,
  onPreview,
  onEdit,
  onDelete,
  onDownload,
}: AssetItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = CategoryIcon[asset.category];

  return (
    <div
      className={cn(
        'group relative aspect-square rounded-lg overflow-hidden bg-lxd-dark-surface border-2 cursor-pointer transition-all',
        isSelected
          ? 'border-lxd-cyan ring-2 ring-lxd-cyan/30'
          : 'border-transparent hover:border-lxd-dark-border',
      )}
      onClick={(e) => onSelect(asset, e)}
      onDoubleClick={() => onDoubleClick(asset)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview */}
      {asset.category === 'image' ? (
        <img
          src={asset.thumbnailUrl ?? asset.url}
          alt={asset.altText || asset.originalFileName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-lxd-dark-bg">
          <Icon className="w-12 h-12 text-white/20" />
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-lxd-cyan flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/60 flex items-end p-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{asset.originalFileName}</p>
            <p className="text-[10px] text-white/60">{formatFileSize(asset.size)}</p>
          </div>
          <AssetActions
            asset={asset}
            onPreview={onPreview}
            onEdit={onEdit}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Asset List Item
// =============================================================================

function AssetListItem({
  asset,
  isSelected,
  onSelect,
  onDoubleClick,
  onPreview,
  onEdit,
  onDelete,
  onDownload,
}: AssetItemProps) {
  const Icon = CategoryIcon[asset.category];
  const uploadDate = asset.uploadedAt?.toDate?.()?.toLocaleDateString?.() ?? 'Unknown';

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer transition-colors',
        isSelected ? 'bg-lxd-cyan/10' : 'hover:bg-lxd-dark-surface',
      )}
      onClick={(e) => onSelect(asset, e)}
      onDoubleClick={() => onDoubleClick(asset)}
    >
      {/* Selection Checkbox */}
      <div
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center',
          isSelected ? 'border-lxd-cyan bg-lxd-cyan' : 'border-lxd-dark-border',
        )}
      >
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>

      {/* Thumbnail */}
      <div className="flex-shrink-0 w-10 h-10 rounded bg-lxd-dark-bg overflow-hidden">
        {asset.category === 'image' ? (
          <img
            src={asset.thumbnailUrl ?? asset.url}
            alt={asset.altText || asset.originalFileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-5 h-5 text-white/40" />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{asset.originalFileName}</p>
        <p className="text-xs text-white/50">
          {asset.category.charAt(0).toUpperCase() + asset.category.slice(1)}
        </p>
      </div>

      {/* Size */}
      <div className="flex-shrink-0 w-20 text-right">
        <p className="text-xs text-white/60">{formatFileSize(asset.size)}</p>
      </div>

      {/* Date */}
      <div className="flex-shrink-0 w-24 text-right">
        <p className="text-xs text-white/60">{uploadDate}</p>
      </div>

      {/* Actions */}
      <AssetActions
        asset={asset}
        onPreview={onPreview}
        onEdit={onEdit}
        onDelete={onDelete}
        onDownload={onDownload}
      />
    </div>
  );
}

// =============================================================================
// Asset Actions Menu
// =============================================================================

interface AssetActionsProps {
  asset: AssetMetadata;
  onPreview?: (asset: AssetMetadata) => void;
  onEdit?: (asset: AssetMetadata) => void;
  onDelete?: (asset: AssetMetadata) => void;
  onDownload?: (asset: AssetMetadata) => void;
}

function AssetActions({ asset, onPreview, onEdit, onDelete, onDownload }: AssetActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {onPreview && (
          <DropdownMenuItem onClick={() => onPreview(asset)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(asset)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Details
          </DropdownMenuItem>
        )}
        {onDownload && (
          <DropdownMenuItem onClick={() => onDownload(asset)}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(asset)}
            className="text-red-400 focus:text-red-400"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AssetGrid;
