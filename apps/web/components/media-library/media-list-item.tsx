'use client';

import { format } from 'date-fns';
import {
  AlertCircle,
  Box,
  Check,
  Download,
  Eye,
  File,
  FileText,
  Film,
  Image as ImageIcon,
  Loader2,
  type LucideIcon,
  MoreHorizontal,
  Music,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { memo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  formatDimensions,
  formatDuration,
  formatFileSize,
  type MediaAsset,
  type MediaAssetType,
} from '@/types/media-library';

interface MediaListItemProps {
  asset: MediaAsset;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: (event?: React.MouseEvent) => void;
  onToggleSelection: () => void;
  onPreview: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
}

const TYPE_ICONS: Record<MediaAssetType, LucideIcon> = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
  '3d': Box,
  other: File,
};

const TYPE_COLORS: Record<MediaAssetType, string> = {
  image: 'text-brand-blue',
  video: 'text-brand-purple',
  audio: 'text-brand-success',
  document: 'text-orange-500',
  '3d': 'text-pink-500',
  other: 'text-brand-muted',
};

function MediaListItemComponent({
  asset,
  isSelected,
  isFocused,
  onSelect,
  onToggleSelection,
  onPreview,
  onContextMenu,
}: MediaListItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const TypeIcon = TYPE_ICONS[asset.type];
  const typeColor = TYPE_COLORS[asset.type];

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onPreview();
    },
    [onPreview],
  );

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      onToggleSelection();
    },
    [onToggleSelection],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect();
      }
    },
    [onSelect],
  );

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={onContextMenu}
      tabIndex={0}
      className={cn(
        'group flex items-center gap-3 px-4 py-2 border-b border-border cursor-pointer transition-colors',
        isSelected ? 'bg-primary/10' : isFocused ? 'bg-muted/50' : 'hover:bg-muted/50',
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleCheckboxClick}
        onKeyDown={handleCheckboxClick}
        aria-label={isSelected ? `Deselect ${asset.filename}` : `Select ${asset.filename}`}
        aria-pressed={isSelected}
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0',
          isSelected
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-muted-foreground/30 hover:border-muted-foreground/50',
        )}
      >
        {isSelected && <Check className="w-3 h-3" />}
      </button>

      {/* Thumbnail */}
      <div className="w-12 h-12 relative rounded overflow-hidden bg-muted shrink-0">
        {asset.thumbnailUrl && !imageError ? (
          <>
            <Image
              src={asset.thumbnailUrl}
              alt={asset.altText || asset.title}
              fill
              className={cn(
                'object-cover transition-opacity duration-200',
                imageLoaded ? 'opacity-100' : 'opacity-0',
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sizes="48px"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <TypeIcon className={cn('w-5 h-5', typeColor)} />
          </div>
        )}

        {/* Status overlay */}
        {asset.status === 'processing' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
          </div>
        )}

        {asset.status === 'error' && (
          <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
        )}
      </div>

      {/* Filename & Type */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <TypeIcon className={cn('w-4 h-4 shrink-0', typeColor)} />
          <span className="text-sm font-medium text-foreground truncate">{asset.filename}</span>
        </div>
        {asset.title !== asset.filename && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{asset.title}</p>
        )}
      </div>

      {/* Type */}
      <div className="w-24 text-sm text-muted-foreground capitalize hidden sm:block">
        {asset.type}
      </div>

      {/* Size */}
      <div className="w-20 text-sm text-muted-foreground text-right hidden md:block">
        {formatFileSize(asset.size)}
      </div>

      {/* Dimensions/Duration */}
      <div className="w-28 text-sm text-muted-foreground text-right hidden lg:block">
        {asset.duration
          ? formatDuration(asset.duration)
          : asset.width && asset.height
            ? formatDimensions(asset.width, asset.height)
            : '-'}
      </div>

      {/* Date */}
      <div className="w-28 text-sm text-muted-foreground text-right hidden xl:block">
        {format(new Date(asset.uploadedAt), 'MMM d, yyyy')}
      </div>

      {/* Actions */}
      <div className="w-10 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPreview()}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(asset.url, '_blank')}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                // TODO(LXD-404): Handle media asset delete
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export const MediaListItem = memo(MediaListItemComponent);
