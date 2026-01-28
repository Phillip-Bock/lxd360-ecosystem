'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Edit3, Image as ImageIcon, Link, Maximize2, Trash2, Upload, X } from 'lucide-react';
import NextImage from 'next/image';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import type { ImageBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

/**
 * ImageBlock - Image with caption and zoom
 */
export function ImageBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<ImageBlockContent>): React.JSX.Element {
  const content = block.content as ImageBlockContent;
  const [showLightbox, setShowLightbox] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const objectFit = content.objectFit || 'cover';

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event): void => {
          const img = new window.Image();
          img.onload = () => {
            onUpdate({
              content: {
                ...content,
                src: event.target?.result as string,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
              },
            });
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    },
    [content, onUpdate],
  );

  // Handle URL input
  const handleUrlSubmit = useCallback(() => {
    if (urlInput) {
      onUpdate({
        content: {
          ...content,
          src: urlInput,
        },
      });
      setShowUrlInput(false);
      setUrlInput('');
    }
  }, [content, urlInput, onUpdate]);

  // Remove image
  const handleRemove = useCallback(() => {
    onUpdate({
      content: {
        ...content,
        src: '',
      },
    });
  }, [content, onUpdate]);

  // Preview mode - render image
  if (!isEditing) {
    if (!content.src) {
      return (
        <div className="aspect-video bg-studio-surface/30 rounded-lg flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-studio-text-muted" aria-hidden="true" />
        </div>
      );
    }

    return (
      <figure className="relative group">
        {/* Image */}
        {content.zoomOnClick ? (
          <button
            type="button"
            className="relative overflow-hidden rounded-lg cursor-zoom-in w-full text-left"
            onClick={() => setShowLightbox(true)}
          >
            <NextImage
              src={content.src}
              alt={content.alt || ''}
              width={1200}
              height={800}
              className={`
                w-full h-auto
                ${objectFit === 'contain' ? 'object-contain' : 'object-cover'}
              `}
              style={{ objectPosition: content.objectPosition }}
              loading={content.loading || 'lazy'}
              unoptimized
            />

            {/* Zoom icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <Maximize2 className="w-8 h-8 text-brand-primary" aria-hidden="true" />
            </div>
          </button>
        ) : (
          <div className="relative overflow-hidden rounded-lg">
            <NextImage
              src={content.src}
              alt={content.alt || ''}
              width={1200}
              height={800}
              className={`
                w-full h-auto
                ${objectFit === 'contain' ? 'object-contain' : 'object-cover'}
              `}
              style={{ objectPosition: content.objectPosition }}
              loading={content.loading || 'lazy'}
              unoptimized
            />
          </div>
        )}

        {/* Caption */}
        {content.caption && (
          <figcaption className="mt-2 text-sm text-studio-text-muted text-center">
            {content.caption}
          </figcaption>
        )}

        {/* Credit */}
        {content.credit && (
          <p className="mt-1 text-xs text-studio-text-muted/70 text-right">{content.credit}</p>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {showLightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
              onClick={() => setShowLightbox(false)}
            >
              <button
                type="button"
                className="absolute top-4 right-4 p-2 text-brand-primary/70 hover:text-brand-primary transition-colors"
                onClick={() => setShowLightbox(false)}
                aria-label="Close lightbox"
              >
                <X className="w-8 h-8" aria-hidden="true" />
              </button>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <NextImage
                  src={content.src}
                  alt={content.alt || ''}
                  width={1920}
                  height={1080}
                  className="max-w-full max-h-full object-contain"
                  unoptimized
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </figure>
    );
  }

  // Edit mode - with upload interface
  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Image preview or upload area */}
      {content.src ? (
        <div className="relative group">
          {/* Image preview */}
          <div className="relative overflow-hidden rounded-lg">
            <NextImage
              src={content.src}
              alt={content.alt || ''}
              width={1200}
              height={800}
              className="w-full h-auto"
              unoptimized
            />

            {/* Overlay controls */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-brand-surface/20 hover:bg-brand-surface/30 rounded-lg transition-colors"
                title="Replace image"
                aria-label="Replace image"
              >
                <Edit3 className="w-5 h-5 text-brand-primary" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setShowLightbox(true)}
                className="p-2 bg-brand-surface/20 hover:bg-brand-surface/30 rounded-lg transition-colors"
                title="Preview"
                aria-label="Preview image"
              >
                <Maximize2 className="w-5 h-5 text-brand-primary" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-brand-error/50 hover:bg-brand-error/70 rounded-lg transition-colors"
                title="Remove image"
                aria-label="Remove image"
              >
                <Trash2 className="w-5 h-5 text-brand-primary" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Image info */}
          {content.naturalWidth && content.naturalHeight && (
            <p className="mt-2 text-xs text-studio-text-muted">
              {content.naturalWidth} x {content.naturalHeight}px
            </p>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-studio-bg border-2 border-dashed border-studio-surface rounded-lg flex flex-col items-center justify-center gap-4 hover:border-studio-accent/50 transition-colors">
          <button
            type="button"
            className="flex flex-col items-center gap-4 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-full bg-studio-surface/50 flex items-center justify-center">
              <Upload className="w-8 h-8 text-studio-text-muted" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-studio-text font-medium">Drop an image here or click to upload</p>
              <p className="text-sm text-studio-text-muted mt-1">PNG, JPG, GIF, WebP up to 10MB</p>
            </div>
          </button>

          {/* URL option */}
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-studio-text-muted hover:text-studio-accent transition-colors"
          >
            <Link className="w-4 h-4" aria-hidden="true" />
            Add from URL
          </button>
        </div>
      )}

      {/* URL input modal */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-2"
          >
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary placeholder:text-studio-text-muted outline-hidden focus:border-studio-accent/50"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-studio-accent hover:bg-studio-accent-hover text-brand-primary rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUrlInput(false);
                setUrlInput('');
              }}
              className="px-4 py-2 text-studio-text-muted hover:text-brand-primary transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image settings */}
      {content.src && (
        <div className="space-y-4 p-4 bg-studio-bg rounded-lg border border-studio-surface/30">
          {/* Alt text */}
          <div>
            <label
              htmlFor={`image-block-alt-${block.id}`}
              className="block text-sm text-studio-text-muted mb-1"
            >
              Alt text (for accessibility)
            </label>
            <input
              id={`image-block-alt-${block.id}`}
              type="text"
              value={content.alt || ''}
              onChange={(e) => onUpdate({ content: { ...content, alt: e.target.value } })}
              className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary placeholder:text-studio-text-muted outline-hidden focus:border-studio-accent/50"
              placeholder="Describe the image..."
            />
          </div>

          {/* Caption */}
          <div>
            <label
              htmlFor={`image-block-caption-${block.id}`}
              className="block text-sm text-studio-text-muted mb-1"
            >
              Caption
            </label>
            <input
              id={`image-block-caption-${block.id}`}
              type="text"
              value={content.caption || ''}
              onChange={(e) => onUpdate({ content: { ...content, caption: e.target.value } })}
              className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary placeholder:text-studio-text-muted outline-hidden focus:border-studio-accent/50"
              placeholder="Image caption..."
            />
          </div>

          {/* Credit */}
          <div>
            <label
              htmlFor={`image-block-credit-${block.id}`}
              className="block text-sm text-studio-text-muted mb-1"
            >
              Credit/Attribution
            </label>
            <input
              id={`image-block-credit-${block.id}`}
              type="text"
              value={content.credit || ''}
              onChange={(e) => onUpdate({ content: { ...content, credit: e.target.value } })}
              className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary placeholder:text-studio-text-muted outline-hidden focus:border-studio-accent/50"
              placeholder="Photo by..."
            />
          </div>

          {/* Object fit */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-studio-text-muted">Fit:</span>
            <div className="flex gap-1">
              {(['cover', 'contain', 'fill', 'none'] as const).map((fit) => (
                <button
                  type="button"
                  key={fit}
                  onClick={() => onUpdate({ content: { ...content, objectFit: fit } })}
                  className={`
                    px-3 py-1.5 text-xs rounded-lg transition-colors
                    ${
                      objectFit === fit
                        ? 'bg-studio-accent text-brand-primary'
                        : 'bg-studio-surface/30 text-studio-text-muted hover:text-brand-primary'
                    }
                  `}
                >
                  {fit.charAt(0).toUpperCase() + fit.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom on click */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={content.zoomOnClick || false}
              onChange={(e) => onUpdate({ content: { ...content, zoomOnClick: e.target.checked } })}
              className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
            />
            <span className="text-sm text-studio-text-muted">Enable zoom on click</span>
          </label>
        </div>
      )}

      {/* Lightbox preview */}
      <AnimatePresence>
        {showLightbox && content.src && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowLightbox(false)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 p-2 text-brand-primary/70 hover:text-brand-primary transition-colors"
              onClick={() => setShowLightbox(false)}
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" aria-hidden="true" />
            </button>
            <NextImage
              src={content.src}
              alt={content.alt || ''}
              width={1920}
              height={1080}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              unoptimized
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ImageBlock;
