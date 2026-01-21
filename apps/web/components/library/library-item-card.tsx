'use client';

import { Check, Code, Eye, FileText, Film, Folder, Image, Music, Star } from 'lucide-react';
import type { LibraryItem } from '@/types/library';

interface LibraryItemCardProps {
  item: LibraryItem;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onDoubleClick: (item: LibraryItem) => void;
  onPreview?: (item: LibraryItem) => void;
}

function getFileIcon(fileType?: string) {
  if (!fileType) return FileText;

  if (fileType.startsWith('image/')) return Image;
  if (fileType.startsWith('video/')) return Film;
  if (fileType.startsWith('audio/')) return Music;
  if (
    fileType.includes('javascript') ||
    fileType.includes('json') ||
    fileType.includes('css') ||
    fileType.includes('html')
  ) {
    return Code;
  }

  return FileText;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function LibraryItemCard({
  item,
  isSelected,
  onSelect,
  onDoubleClick,
  onPreview,
}: LibraryItemCardProps) {
  const isFolder = item.type === 'folder';
  const Icon = isFolder ? Folder : getFileIcon(item.fileType);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle selection: if already selected, deselect (pass null)
    onSelect(isSelected ? null : item.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(item);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(item);
  };

  const cardClassName = isSelected
    ? 'group relative flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all duration-150 select-none bg-blue-100 ring-2 ring-blue-500'
    : 'group relative flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all duration-150 select-none hover:bg-gray-100';

  const checkboxClassName = isSelected
    ? 'absolute top-2 right-2 h-6 w-6 rounded-sm flex items-center justify-center transition-all duration-150 bg-blue-500'
    : 'absolute top-2 right-2 h-6 w-6 rounded-sm flex items-center justify-center transition-all duration-150 bg-transparent group-hover:bg-gray-200';

  const thumbnailClassName = isFolder
    ? 'h-20 w-20 rounded-lg flex items-center justify-center mb-3 bg-blue-100'
    : 'h-20 w-20 rounded-lg flex items-center justify-center mb-3 bg-gray-100';

  const iconClassName = isFolder ? 'h-10 w-10 text-blue-500' : 'h-10 w-10 text-gray-500';

  return (
    <button
      type="button"
      className={cardClassName}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      aria-label={`${item.name}${isSelected ? ', selected' : ''}`}
      aria-pressed={isSelected}
    >
      {/* Selection Checkbox */}
      <div className={checkboxClassName}>
        {isSelected && <Check className="h-4 w-4 text-white" />}
      </div>

      {/* Favorite Star */}
      {item.isFavorite && (
        <Star className="absolute top-2 left-2 h-5 w-5 text-yellow-400 fill-yellow-400" />
      )}

      {/* Preview Button (files only, on hover) */}
      {!isFolder && onPreview && (
        <button
          type="button"
          onClick={handlePreview}
          className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-all"
          title="Preview"
        >
          <Eye className="h-4 w-4 text-white" />
        </button>
      )}

      {/* Thumbnail / Icon */}
      <div className={thumbnailClassName}>
        <Icon className={iconClassName} />
      </div>

      {/* Name */}
      <span className="text-sm text-gray-800 text-center truncate w-full px-1" title={item.name}>
        {item.name}
      </span>

      {/* File size (files only) */}
      {!isFolder && item.fileSize && (
        <span className="text-xs text-gray-500 mt-1">{formatFileSize(item.fileSize)}</span>
      )}
    </button>
  );
}
