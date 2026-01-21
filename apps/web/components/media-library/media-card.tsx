'use client';

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
  Music,
} from 'lucide-react';
import Image from 'next/image';
import { memo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  formatDimensions,
  formatDuration,
  formatFileSize,
  type MediaAsset,
  type MediaAssetType,
} from '@/types/media-library';

interface MediaCardProps {
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
  image: 'bg-brand-primary',
  video: 'bg-brand-secondary',
  audio: 'bg-brand-success',
  document: 'bg-brand-warning',
  '3d': 'bg-pink-500',
  other: 'bg-gray-500',
};

function MediaCardComponent({
  asset,
  isSelected,
  isFocused,
  onSelect,
  onToggleSelection,
  onPreview,
  onContextMenu,
}: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
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
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleSelection();
    },
    [onToggleSelection],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        onPreview();
      } else if (e.key === ' ') {
        e.preventDefault();
        onToggleSelection();
      }
    },
    [onPreview, onToggleSelection],
  );

  return (
    <TooltipProvider>
      <button
        type="button"
        onClick={onSelect}
        onDoubleClick={handleDoubleClick}
        onContextMenu={onContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        className={cn(
          'group relative bg-card rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-200 text-left w-full',
          isSelected
            ? 'border-primary ring-2 ring-primary/20'
            : isFocused
              ? 'border-primary/50'
              : 'border-transparent hover:border-muted-foreground/20',
          'focus:outline-hidden focus:ring-2 focus:ring-primary/50',
        )}
      >
        {/* Thumbnail */}
        <div className="aspect-square relative bg-muted overflow-hidden">
          {/* Blurhash placeholder would go here - using gradient fallback */}
          <div className="absolute inset-0 bg-linear-to-br from-muted to-muted-foreground/10" />

          {/* Actual thumbnail */}
          {asset.thumbnailUrl && !imageError ? (
            <Image
              src={asset.thumbnailUrl}
              alt={asset.altText || asset.title}
              fill
              className={cn(
                'object-cover transition-opacity duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0',
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <TypeIcon className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}

          {/* Loading indicator */}
          {!imageLoaded && !imageError && asset.thumbnailUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Status overlay */}
          {asset.status === 'processing' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
          )}

          {asset.status === 'error' && (
            <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          )}

          {/* Selection checkbox */}
          <div
            className={cn(
              'absolute top-2 left-2 transition-opacity duration-200',
              isHovered || isSelected ? 'opacity-100' : 'opacity-0',
            )}
          >
            <button
              type="button"
              onClick={handleCheckboxClick}
              aria-label={isSelected ? `Deselect ${asset.title}` : `Select ${asset.title}`}
              aria-pressed={isSelected}
              className={cn(
                'w-6 h-6 rounded-md flex items-center justify-center transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-black/50 text-brand-primary hover:bg-black/70',
              )}
            >
              {isSelected && <Check className="w-4 h-4" />}
            </button>
          </div>

          {/* Type badge */}
          <div className="absolute top-2 right-2">
            <div className={cn('p-1.5 rounded-md', typeColor)}>
              <TypeIcon className="w-3 h-3 text-brand-primary" />
            </div>
          </div>

          {/* Duration badge (video/audio) */}
          {asset.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-brand-primary text-xs px-1.5 py-0.5 rounded">
              {formatDuration(asset.duration)}
            </div>
          )}

          {/* Dimensions badge (images) */}
          {asset.type === 'image' && asset.width && asset.height && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-brand-primary text-xs px-1.5 py-0.5 rounded">
              {formatDimensions(asset.width, asset.height)}
            </div>
          )}

          {/* Hover actions */}
          <div
            className={cn(
              'absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-3 transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0',
            )}
          >
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-brand-surface/90 hover:bg-brand-surface"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview();
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-brand-surface/90 hover:bg-brand-surface"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(asset.url, '_blank');
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm font-medium text-foreground truncate" title={asset.title}>
            {asset.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatFileSize(asset.size)}</p>
        </div>
      </button>
    </TooltipProvider>
  );
}

export const MediaCard = memo(MediaCardComponent);
