'use client';

import { Edit3, ExternalLink, Image as ImageIcon, Link, Trash2 } from 'lucide-react';
import NextImage from 'next/image';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import type { CardBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../BlockRenderer';

const CARD_VARIANTS: Array<{
  value: CardBlockContent['variant'];
  label: string;
  description: string;
}> = [
  { value: 'default', label: 'Default', description: 'Standard card with shadow' },
  { value: 'outlined', label: 'Outlined', description: 'Border only, no shadow' },
  { value: 'elevated', label: 'Elevated', description: 'Heavy shadow for emphasis' },
  { value: 'flat', label: 'Flat', description: 'No border or shadow' },
  { value: 'interactive', label: 'Interactive', description: 'Hover effects enabled' },
];

/**
 * CardBlock - Card-style container
 */
export function CardBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<CardBlockContent>): React.JSX.Element {
  const content = block.content as CardBlockContent;
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default values
  const variant = content.variant || 'default';
  const title = content.title || '';
  const description = content.description || '';
  const mediaUrl = content.mediaUrl;
  const mediaAlt = content.mediaAlt || '';
  const link = content.link;
  const linkTarget = content.linkTarget || '_self';

  // Build card classes
  const getCardClasses = (): string => {
    const base = 'rounded-xl overflow-hidden transition-all duration-200';

    switch (variant) {
      case 'outlined':
        return `${base} border-2 border-studio-surface/50 bg-transparent`;
      case 'elevated':
        return `${base} bg-studio-bg shadow-xl shadow-black/20`;
      case 'flat':
        return `${base} bg-studio-bg/50`;
      case 'interactive':
        return `${base} bg-studio-bg border border-studio-surface/30 shadow-lg shadow-black/10 hover:border-studio-accent/30 hover:shadow-studio-accent/10 cursor-pointer`;
      default:
        return `${base} bg-studio-bg border border-studio-surface/30 shadow-lg shadow-black/10`;
    }
  };

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onUpdate({
            content: {
              ...content,
              mediaUrl: event.target?.result as string,
            },
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [content, onUpdate],
  );

  // Handle URL submission
  const handleUrlSubmit = useCallback(() => {
    if (urlInput) {
      onUpdate({
        content: {
          ...content,
          mediaUrl: urlInput,
        },
      });
      setUrlInput('');
      setShowUrlInput(false);
    }
  }, [content, urlInput, onUpdate]);

  // Remove media
  const removeMedia = useCallback(() => {
    onUpdate({
      content: {
        ...content,
        mediaUrl: undefined,
      },
    });
  }, [content, onUpdate]);

  // Card wrapper for link
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!isEditing && link) {
      return (
        <a
          href={link}
          target={linkTarget}
          rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
          className={getCardClasses()}
        >
          {children}
        </a>
      );
    }
    return <div className={getCardClasses()}>{children}</div>;
  };

  // Preview mode
  if (!isEditing) {
    return (
      <CardWrapper>
        {/* Media */}
        {mediaUrl && (
          <div className="aspect-video overflow-hidden">
            <NextImage
              src={mediaUrl}
              alt={mediaAlt}
              width={800}
              height={450}
              unoptimized
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-2">
          {title && <h3 className="text-lg font-semibold text-brand-primary">{title}</h3>}
          {description && <p className="text-sm text-studio-text">{description}</p>}
          {content.children && content.children.length > 0 && (
            <div className="pt-2">
              {/* Nested blocks would be rendered here */}
              <div className="text-studio-text-muted text-sm">
                {content.children.length} nested block(s)
              </div>
            </div>
          )}
        </div>

        {/* Footer link indicator */}
        {link && linkTarget === '_blank' && (
          <div className="px-4 pb-3">
            <span className="inline-flex items-center gap-1 text-xs text-studio-accent">
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
              Opens in new tab
            </span>
          </div>
        )}
      </CardWrapper>
    );
  }

  // Edit mode
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

      {/* Card preview */}
      <div className={getCardClasses()}>
        {/* Media section */}
        <div className="relative aspect-video bg-studio-bg-dark group">
          {mediaUrl ? (
            <>
              <NextImage
                src={mediaUrl}
                alt={mediaAlt}
                width={800}
                height={450}
                unoptimized
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-studio-accent rounded-lg text-brand-primary"
                  title="Replace image"
                >
                  <Edit3 className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={removeMedia}
                  className="p-2 bg-brand-error rounded-lg text-brand-primary"
                  title="Remove image"
                >
                  <Trash2 className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                className="flex flex-col items-center gap-3 cursor-pointer hover:bg-studio-surface/20 transition-colors p-4 rounded-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 rounded-full bg-studio-surface/30 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-studio-text-muted" aria-hidden="true" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-studio-text">Add card image</p>
                  <p className="text-xs text-studio-text-muted">Click to upload</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-studio-text-muted hover:text-studio-accent"
              >
                <Link className="w-3 h-3" aria-hidden="true" />
                Add from URL
              </button>
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="group/title">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => onUpdate({ content: { ...content, title: e.target.value } })}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                placeholder="Card title"
                className="w-full text-lg font-semibold bg-transparent text-brand-primary outline-hidden border-b border-studio-accent"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="w-full text-left cursor-text"
              >
                {title ? (
                  <h3 className="text-lg font-semibold text-brand-primary group-hover/title:text-studio-accent transition-colors">
                    {title}
                  </h3>
                ) : (
                  <p className="text-lg font-semibold text-studio-text-muted group-hover/title:text-studio-accent transition-colors">
                    Add title...
                  </p>
                )}
              </button>
            )}
          </div>

          {/* Description */}
          <div className="group/desc">
            {isEditingDescription ? (
              <textarea
                value={description}
                onChange={(e) => onUpdate({ content: { ...content, description: e.target.value } })}
                onBlur={() => setIsEditingDescription(false)}
                placeholder="Card description"
                className="w-full text-sm bg-transparent text-studio-text outline-hidden border-b border-studio-accent resize-none"
                rows={2}
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingDescription(true)}
                className="w-full text-left cursor-text"
              >
                {description ? (
                  <p className="text-sm text-studio-text group-hover/desc:text-brand-primary transition-colors">
                    {description}
                  </p>
                ) : (
                  <p className="text-sm text-studio-text-muted group-hover/desc:text-studio-accent transition-colors">
                    Add description...
                  </p>
                )}
              </button>
            )}
          </div>

          {/* Nested content placeholder */}
          <div className="pt-2 border-t border-studio-surface/30">
            <div className="p-3 border-2 border-dashed border-studio-surface/50 rounded-lg text-center hover:border-studio-accent/50 transition-colors">
              <p className="text-xs text-studio-text-muted">Drop blocks here for card content</p>
            </div>
          </div>
        </div>
      </div>

      {/* URL input modal */}
      {showUrlInput && (
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
            onClick={handleUrlSubmit}
            className="px-3 py-2 bg-studio-accent text-brand-primary rounded-lg text-sm"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUrlInput(false);
              setUrlInput('');
            }}
            className="px-3 py-2 text-studio-text-muted hover:text-brand-primary"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-studio-bg rounded-lg border border-studio-surface/30">
        {/* Variant */}
        <fieldset className="space-y-2 md:col-span-2 border-0 p-0 m-0">
          <legend className="block text-sm text-studio-text-muted">Style</legend>
          <div className="flex flex-wrap gap-2">
            {CARD_VARIANTS.map((v) => (
              <button
                type="button"
                key={v.value}
                onClick={() => onUpdate({ content: { ...content, variant: v.value } })}
                className={`
                  px-3 py-1.5 text-sm rounded-lg transition-colors
                  ${
                    variant === v.value
                      ? 'bg-studio-accent text-brand-primary'
                      : 'bg-studio-bg-dark text-studio-text-muted hover:text-brand-primary border border-studio-surface/50'
                  }
                `}
                title={v.description}
              >
                {v.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Link */}
        <div className="space-y-2">
          <label htmlFor="card-link-url" className="block text-sm text-studio-text-muted">
            Link URL
          </label>
          <input
            id="card-link-url"
            type="url"
            value={link || ''}
            onChange={(e) =>
              onUpdate({ content: { ...content, link: e.target.value || undefined } })
            }
            placeholder="https://..."
            className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          />
        </div>

        {/* Link target */}
        <div className="space-y-2">
          <label htmlFor="card-link-target" className="block text-sm text-studio-text-muted">
            Link Target
          </label>
          <select
            id="card-link-target"
            value={linkTarget}
            onChange={(e) =>
              onUpdate({
                content: {
                  ...content,
                  linkTarget: e.target.value as CardBlockContent['linkTarget'],
                },
              })
            }
            className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
            disabled={!link}
          >
            <option value="_self">Same tab</option>
            <option value="_blank">New tab</option>
          </select>
        </div>

        {/* Media alt text */}
        {mediaUrl && (
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="card-media-alt" className="block text-sm text-studio-text-muted">
              Image Alt Text
            </label>
            <input
              id="card-media-alt"
              type="text"
              value={mediaAlt}
              onChange={(e) => onUpdate({ content: { ...content, mediaAlt: e.target.value } })}
              placeholder="Describe the image..."
              className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CardBlock;
