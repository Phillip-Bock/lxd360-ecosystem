'use client';

import { Check, File, Film, Image, MoreHorizontal, Music, Trash2 } from 'lucide-react';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MediaAsset, MediaAssetType } from '@/lib/media/types';
import { formatFileSize } from '@/lib/media/types';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface MediaCardProps {
  media: MediaAsset;
  isSelected?: boolean;
  onSelect?: (media: MediaAsset) => void;
  onDelete?: (media: MediaAsset) => void;
  onEdit?: (media: MediaAsset) => void;
  selectable?: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

function getMediaIcon(type: MediaAssetType) {
  switch (type) {
    case 'image':
    case 'icon':
      return Image;
    case 'video':
      return Film;
    case 'audio':
      return Music;
    default:
      return File;
  }
}

function getMediaTypeLabel(type: MediaAssetType): string {
  switch (type) {
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Audio';
    case '3d_model':
      return '3D Model';
    case 'icon':
      return 'Icon';
    case 'ai_character':
      return 'AI Character';
    case 'document':
      return 'Document';
    default:
      return 'File';
  }
}

// =============================================================================
// Component
// =============================================================================

export function MediaCard({
  media,
  isSelected = false,
  onSelect,
  onDelete,
  onEdit,
  selectable = false,
}: MediaCardProps) {
  const Icon = getMediaIcon(media.asset_type);
  const hasPreview = media.asset_type === 'image' || media.asset_type === 'icon';

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(media);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && selectable && onSelect) {
      e.preventDefault();
      onSelect(media);
    }
  };

  const cardClassName = cn(
    'group relative rounded-lg overflow-hidden bg-zinc-900 border transition-all',
    isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-white/10',
    selectable && 'cursor-pointer hover:border-white/20',
  );

  const cardContent = (
    <>
      {/* Preview Area */}
      <div className="aspect-square relative bg-zinc-800">
        {hasPreview && media.thumbnail_url ? (
          <NextImage
            src={media.thumbnail_url}
            alt={media.alt_text || media.original_filename}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : hasPreview && media.public_url ? (
          <NextImage
            src={media.public_url}
            alt={media.alt_text || media.original_filename}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-12 w-12 text-zinc-600" />
          </div>
        )}

        {/* Selection Indicator */}
        {selectable && (
          <div
            className={cn(
              'absolute top-2 left-2 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all',
              isSelected
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-white/40 bg-black/40 group-hover:border-white/60',
            )}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </div>
        )}

        {/* Actions Menu */}
        {(onDelete || onEdit) && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 bg-black/60 hover:bg-black/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Media actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(media);
                    }}
                  >
                    Edit Details
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(media);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Type Badge */}
        <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white/80">
          {getMediaTypeLabel(media.asset_type)}
        </span>
      </div>

      {/* Info Area */}
      <div className="p-2">
        <p className="text-sm font-medium truncate" title={media.original_filename}>
          {media.original_filename}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">{formatFileSize(media.file_size)}</p>
      </div>
    </>
  );

  if (selectable) {
    return (
      <button
        type="button"
        className={cn(cardClassName, 'text-left w-full')}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-pressed={isSelected}
        aria-label={`${media.original_filename}, ${getMediaTypeLabel(media.asset_type)}, ${formatFileSize(media.file_size)}`}
      >
        {cardContent}
      </button>
    );
  }

  return <div className={cardClassName}>{cardContent}</div>;
}
