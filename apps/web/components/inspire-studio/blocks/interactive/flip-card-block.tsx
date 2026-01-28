'use client';

import { motion } from 'framer-motion';
import { Link, RefreshCw, RotateCw, Trash2, Upload } from 'lucide-react';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { safeInnerHtml } from '@/lib/sanitize';
import type { FlipCardBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

const FLIP_DIRECTIONS = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

const FLIP_TRIGGERS = [
  { value: 'click', label: 'Click' },
  { value: 'hover', label: 'Hover' },
];

const PRESET_COLORS = [
  { front: 'var(--color-studio-accent)', back: 'var(--color-studio-accent-hover)' },
  { front: '#BA23FB', back: 'var(--accent-purple-dark)' },
  { front: '#22c55e', back: 'var(--success-dark)' },
  { front: '#f59e0b', back: 'var(--warning-dark)' },
  { front: '#ef4444', back: 'var(--error-dark)' },
  { front: 'var(--color-studio-bg)', back: 'var(--color-studio-surface)' },
];

/**
 * FlipCardBlock - Interactive flip card
 */
export function FlipCardBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<FlipCardBlockContent>): React.JSX.Element {
  const content = block.content as FlipCardBlockContent;
  const [isFlipped, setIsFlipped] = useState(false);
  const [editingSide, setEditingSide] = useState<'front' | 'back'>('front');
  const [showImagePicker, setShowImagePicker] = useState<'front' | 'back' | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadSide = useRef<'front' | 'back'>('front');

  // Default values
  const direction = ((content as Record<string, unknown>).direction as string) || 'horizontal';
  const trigger = ((content as Record<string, unknown>).trigger as string) || 'click';
  const frontContent = ((content as Record<string, unknown>).frontContent as string) || '';
  const backContent = ((content as Record<string, unknown>).backContent as string) || '';
  const frontImage = (content as Record<string, unknown>).frontImage as string | undefined;
  const backImage = (content as Record<string, unknown>).backImage as string | undefined;
  const frontColor =
    ((content as Record<string, unknown>).frontColor as string) || 'var(--color-studio-bg)';
  const backColor =
    ((content as Record<string, unknown>).backColor as string) || 'var(--color-studio-surface)';
  const height =
    typeof (content as Record<string, unknown>).height === 'number'
      ? ((content as Record<string, unknown>).height as number)
      : 300;

  // Handle flip
  const handleFlip = useCallback(() => {
    if (!isEditing) {
      setIsFlipped(!isFlipped);
    }
  }, [isEditing, isFlipped]);

  // Handle hover flip
  const handleHover = useCallback(
    (entering: boolean) => {
      if (!isEditing && trigger === 'hover') {
        setIsFlipped(entering);
      }
    },
    [isEditing, trigger],
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event): void => {
          const imageKey = currentUploadSide.current === 'front' ? 'frontImage' : 'backImage';
          onUpdate({
            content: {
              ...content,
              [imageKey]: event.target?.result as string,
            },
          });
          setShowImagePicker(null);
        };
        reader.readAsDataURL(file);
      }
    },
    [content, onUpdate],
  );

  // Handle URL submission
  const handleUrlSubmit = useCallback(
    (side: 'front' | 'back') => {
      if (urlInput) {
        const imageKey = side === 'front' ? 'frontImage' : 'backImage';
        onUpdate({
          content: {
            ...content,
            [imageKey]: urlInput,
          },
        });
        setUrlInput('');
        setShowImagePicker(null);
      }
    },
    [content, urlInput, onUpdate],
  );

  // Remove image
  const removeImage = useCallback(
    (side: 'front' | 'back') => {
      const imageKey = side === 'front' ? 'frontImage' : 'backImage';
      onUpdate({
        content: {
          ...content,
          [imageKey]: undefined,
        },
      });
    },
    [content, onUpdate],
  );

  // Open file picker for specific side
  const openFilePicker = useCallback((side: 'front' | 'back') => {
    currentUploadSide.current = side;
    fileInputRef.current?.click();
  }, []);

  // Get rotation style
  const getRotation = () => {
    if (direction === 'vertical') {
      return isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)';
    }
    return isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
  };

  // Render card side
  const renderSide = (side: 'front' | 'back', style: React.CSSProperties) => {
    const contentValue = side === 'front' ? frontContent : backContent;
    const imageValue = side === 'front' ? frontImage : backImage;
    const colorValue = side === 'front' ? frontColor : backColor;
    const isCurrentEdit = editingSide === side;

    return (
      <div
        className="absolute inset-0 rounded-xl overflow-hidden backface-hidden"
        style={{
          ...style,
          backgroundColor: colorValue,
          backgroundImage: imageValue ? `url(${imageValue})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for text readability when image exists */}
        {imageValue && <div className="absolute inset-0 bg-black/40" />}

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
          {isEditing && isCurrentEdit ? (
            <textarea
              value={contentValue}
              onChange={(e) =>
                onUpdate({
                  content: {
                    ...content,
                    [side === 'front' ? 'frontContent' : 'backContent']: e.target.value,
                  },
                })
              }
              className="w-full h-full bg-transparent text-brand-primary text-center resize-none outline-hidden"
              placeholder={`Enter ${side} content...`}
            />
          ) : (
            <div
              className="prose prose-invert max-w-none text-brand-primary"
              {...safeInnerHtml(
                contentValue || `<p class="text-lg">${side === 'front' ? 'Front' : 'Back'}</p>`,
                'rich',
              )}
            />
          )}
        </div>

        {/* Side label when editing */}
        {isEditing && (
          <div
            className={`
            absolute top-2 left-2 px-2 py-1 text-xs rounded
            ${isCurrentEdit ? 'bg-studio-accent text-brand-primary' : 'bg-black/50 text-brand-primary/70'}
          `}
          >
            {side.charAt(0).toUpperCase() + side.slice(1)}
          </div>
        )}

        {/* Edit overlay */}
        {isEditing && !isCurrentEdit && (
          <button
            type="button"
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer border-none"
            onClick={() => setEditingSide(side)}
          >
            <span className="text-brand-primary font-medium">Click to edit {side}</span>
          </button>
        )}
      </div>
    );
  };

  // Preview mode
  if (!isEditing) {
    return (
      <button
        type="button"
        className="relative perspective-1000 w-full border-none bg-transparent p-0 text-left"
        style={{ height: `${height}px` }}
        onClick={trigger === 'click' ? handleFlip : undefined}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      >
        <motion.div
          className="relative w-full h-full preserve-3d cursor-pointer"
          animate={{ transform: getRotation() }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          {renderSide('front', {
            backfaceVisibility: 'hidden',
          })}

          {/* Back */}
          {renderSide('back', {
            backfaceVisibility: 'hidden',
            transform: direction === 'vertical' ? 'rotateX(180deg)' : 'rotateY(180deg)',
          })}
        </motion.div>

        {/* Flip hint */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-brand-primary/50 bg-black/30 px-2 py-1 rounded">
          <RotateCw className="w-3 h-3" aria-hidden="true" />
          {trigger === 'click' ? 'Click to flip' : 'Hover to flip'}
        </div>
      </button>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Settings bar */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Direction */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-studio-text-muted">Flip:</span>
          <select
            value={typeof direction === 'string' ? direction : 'horizontal'}
            onChange={(e) =>
              onUpdate({
                content: { ...content, direction: e.target.value } as FlipCardBlockContent,
              })
            }
            className="px-2 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          >
            {FLIP_DIRECTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Trigger */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-studio-text-muted">Trigger:</span>
          <select
            value={typeof trigger === 'string' ? trigger : 'click'}
            onChange={(e) =>
              onUpdate({ content: { ...content, trigger: e.target.value } as FlipCardBlockContent })
            }
            className="px-2 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          >
            {FLIP_TRIGGERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Height */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-studio-text-muted">Height:</span>
          <input
            type="number"
            value={typeof height === 'number' ? height : 300}
            onChange={(e) =>
              onUpdate({
                content: {
                  ...content,
                  height: parseInt(e.target.value, 10),
                } as FlipCardBlockContent,
              })
            }
            min={100}
            max={600}
            step={50}
            className="w-20 px-2 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          />
          <span className="text-sm text-studio-text-muted">px</span>
        </div>

        {/* Preview flip */}
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-studio-accent hover:text-studio-accent-hover ml-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Preview Flip
        </button>
      </div>

      {/* Side selector tabs */}
      <div className="flex gap-1">
        {(['front', 'back'] as const).map((side) => (
          <button
            type="button"
            key={side}
            onClick={() => setEditingSide(side)}
            className={`
              flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${
                editingSide === side
                  ? 'bg-studio-accent text-brand-primary'
                  : 'bg-studio-bg text-studio-text-muted hover:text-brand-primary'
              }
            `}
          >
            {side.charAt(0).toUpperCase() + side.slice(1)} Side
          </button>
        ))}
      </div>

      {/* Card preview */}
      <div className="relative perspective-1000" style={{ height: `${height}px` }}>
        <motion.div
          className="relative w-full h-full preserve-3d"
          animate={{ transform: getRotation() }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {renderSide('front', {
            backfaceVisibility: 'hidden',
          })}
          {renderSide('back', {
            backfaceVisibility: 'hidden',
            transform: direction === 'vertical' ? 'rotateX(180deg)' : 'rotateY(180deg)',
          })}
        </motion.div>
      </div>

      {/* Side settings */}
      <div className="p-4 bg-studio-bg rounded-lg border border-studio-surface/30 space-y-4">
        <h4 className="text-sm font-medium text-brand-primary">
          {editingSide.charAt(0).toUpperCase() + editingSide.slice(1)} Side Settings
        </h4>

        {/* Background image */}
        <div className="space-y-2">
          <span className="block text-sm text-studio-text-muted">Background Image</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openFilePicker(editingSide)}
              className="flex items-center gap-2 px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-studio-text hover:border-studio-accent/50"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              type="button"
              onClick={() =>
                setShowImagePicker(showImagePicker === editingSide ? null : editingSide)
              }
              className="flex items-center gap-2 px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-studio-text hover:border-studio-accent/50"
            >
              <Link className="w-4 h-4" />
              URL
            </button>
            {typeof (editingSide === 'front' ? frontImage : backImage) === 'string' && (
              <button
                type="button"
                onClick={() => removeImage(editingSide)}
                className="flex items-center gap-2 px-3 py-2 text-brand-error hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>

          {showImagePicker === editingSide && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
              />
              <button
                type="button"
                onClick={() => handleUrlSubmit(editingSide)}
                className="px-3 py-2 bg-studio-accent text-brand-primary rounded-lg text-sm"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Background color */}
        <div className="space-y-2">
          <label htmlFor="flipcard-bg-color" className="block text-sm text-studio-text-muted">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="flipcard-bg-color"
              type="color"
              value={
                typeof (editingSide === 'front' ? frontColor : backColor) === 'string'
                  ? editingSide === 'front'
                    ? frontColor
                    : backColor
                  : '#000000'
              }
              onChange={(e) =>
                onUpdate({
                  content: {
                    ...content,
                    [editingSide === 'front' ? 'frontColor' : 'backColor']: e.target.value,
                  } as FlipCardBlockContent,
                })
              }
              className="w-10 h-10 rounded cursor-pointer"
            />
            <div className="flex gap-1">
              {PRESET_COLORS.map((preset, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() =>
                    onUpdate({
                      content: {
                        ...content,
                        [editingSide === 'front' ? 'frontColor' : 'backColor']:
                          editingSide === 'front' ? preset.front : preset.back,
                      },
                    })
                  }
                  className="w-8 h-8 rounded border border-studio-surface hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: editingSide === 'front' ? preset.front : preset.back,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label htmlFor="flipcard-content" className="block text-sm text-studio-text-muted">
            Content (HTML)
          </label>
          <textarea
            id="flipcard-content"
            value={
              typeof (editingSide === 'front' ? frontContent : backContent) === 'string'
                ? editingSide === 'front'
                  ? frontContent
                  : backContent
                : ''
            }
            onChange={(e) =>
              onUpdate({
                content: {
                  ...content,
                  [editingSide === 'front' ? 'frontContent' : 'backContent']: e.target.value,
                } as FlipCardBlockContent,
              })
            }
            className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm resize-y min-h-[100px]"
            placeholder="Enter content..."
          />
        </div>
      </div>

      {/* CSS for 3D transforms */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}

export default FlipCardBlock;
