'use client';

/**
 * ImageBlock - Single image with caption and alt text
 */

import { Image as ImageIcon, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ImageConfig, ImageContent } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface ImageBlockProps {
  id: string;
  content: ImageContent;
  config: ImageConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: ImageContent) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
}

export function ImageBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
}: ImageBlockProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onContentChange?.({
          ...content,
          src: event.target?.result as string,
        });
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const borderRadiusClasses: Record<string, string> = {
    none: 'rounded-none',
    small: 'rounded-xs',
    medium: 'rounded-lg',
    large: 'rounded-2xl',
    full: 'rounded-full',
  };

  const sizingClasses: Record<string, string> = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    'full-width': 'w-full object-cover',
    original: 'object-none',
  };

  return (
    <BlockWrapper
      id={id}
      type="Image"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      <figure className="relative">
        {/* Image or placeholder */}
        {content.src && !imageError ? (
          <div className="relative">
            <Image
              src={content.src}
              alt={content.alt || 'Image'}
              width={content.width || 800}
              height={content.height || 450}
              className={cn(
                'max-w-full h-auto mx-auto',
                borderRadiusClasses[config.borderRadius || 'medium'],
                sizingClasses[config.sizing || 'contain'],
                config.enableZoom && 'cursor-zoom-in',
              )}
              onError={() => setImageError(true)}
              onClick={() => config.enableZoom && setShowLightbox(true)}
            />

            {/* Zoom button overlay */}
            {config.enableZoom && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLightbox(true);
                }}
                className={cn(
                  'absolute top-2 right-2 p-2 rounded-lg',
                  'bg-background/80 backdrop-blur-xs border border-border',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  'hover:bg-background hover:border-cyan-500',
                )}
                title="Zoom image"
              >
                <ZoomIn className="w-5 h-5 text-cyan-500" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => isEditing && fileInputRef.current?.click()}
            disabled={!isEditing}
            className={cn(
              'flex flex-col items-center justify-center py-12 w-full',
              'bg-card/50 border-2 border-dashed border-border rounded-lg',
              isEditing && 'cursor-pointer hover:border-cyan-500 hover:bg-card/80',
              !isEditing && 'cursor-default',
            )}
          >
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" aria-hidden="true" />
            <span className="text-muted-foreground text-sm">
              {isEditing ? 'Click to upload image' : 'No image selected'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </button>
        )}

        {/* Caption */}
        {(content.caption || isEditing) && (
          <figcaption
            className={cn(
              'mt-2 text-sm text-muted-foreground',
              config.captionPosition === 'overlay' && content.src
                ? 'absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xs p-2 rounded-b-lg'
                : 'text-center',
            )}
          >
            {isEditing ? (
              <input
                type="text"
                value={content.caption || ''}
                onChange={(e) => onContentChange?.({ ...content, caption: e.target.value })}
                placeholder="Add caption..."
                className="w-full bg-transparent text-center outline-hidden border-b border-transparent focus:border-cyan-500"
              />
            ) : (
              content.caption
            )}
          </figcaption>
        )}

        {/* Alt text editor (when editing) */}
        {isEditing && (
          <div className="mt-3 p-3 bg-card/50 rounded-lg border border-border">
            <label
              htmlFor={`alt-text-${id}`}
              className="block text-xs font-medium text-muted-foreground mb-1"
            >
              Alt Text (required for accessibility)
            </label>
            <input
              id={`alt-text-${id}`}
              type="text"
              value={content.alt}
              onChange={(e) => onContentChange?.({ ...content, alt: e.target.value })}
              placeholder="Describe the image..."
              className={cn(
                'w-full bg-background px-3 py-2 rounded border border-border outline-hidden',
                'focus:border-cyan-500 text-sm',
              )}
            />
          </div>
        )}
      </figure>

      {/* Lightbox */}
      {showLightbox && content.src && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setShowLightbox(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowLightbox(false);
            }
          }}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-cyan-500"
            onClick={() => setShowLightbox(false)}
            aria-label="Close lightbox"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="true"
            >
              <title>Close</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <Image
            src={content.src}
            alt={content.alt}
            width={1200}
            height={800}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </BlockWrapper>
  );
}
