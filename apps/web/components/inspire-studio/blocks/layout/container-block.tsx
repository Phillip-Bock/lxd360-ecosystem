'use client';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Link,
  Palette,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import type { ContainerBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

const PADDING_OPTIONS = [
  { label: 'None', value: '0' },
  { label: 'Small', value: '16px' },
  { label: 'Medium', value: '24px' },
  { label: 'Large', value: '32px' },
  { label: 'XL', value: '48px' },
  { label: '2XL', value: '64px' },
];

const BORDER_RADIUS_OPTIONS = [
  { label: 'None', value: '0' },
  { label: 'Small', value: '8px' },
  { label: 'Medium', value: '12px' },
  { label: 'Large', value: '16px' },
  { label: 'XL', value: '24px' },
  { label: 'Full', value: '9999px' },
];

const MAX_WIDTH_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Small (640px)', value: '640px' },
  { label: 'Medium (768px)', value: '768px' },
  { label: 'Large (1024px)', value: '1024px' },
  { label: 'XL (1280px)', value: '1280px' },
];

const PRESET_BACKGROUNDS = [
  { label: 'Transparent', value: 'transparent' },
  { label: 'Dark', value: 'var(--color-studio-bg)' },
  { label: 'Darker', value: 'var(--color-studio-bg-dark)' },
  { label: 'Light Dark', value: 'var(--color-studio-surface)' },
  { label: 'Primary', value: 'var(--color-studio-accent)' },
  { label: 'Accent', value: '#BA23FB' },
  { label: 'Success', value: 'var(--success)' },
  { label: 'Warning', value: 'var(--warning)' },
  { label: 'Danger', value: 'var(--error)' },
  {
    label: 'Gradient 1',
    value: 'linear-gradient(135deg, #BA23FB 0%, var(--color-studio-accent) 100%)',
  },
  {
    label: 'Gradient 2',
    value: 'linear-gradient(135deg, var(--color-studio-bg) 0%, var(--color-studio-surface) 100%)',
  },
  { label: 'Gradient 3', value: 'linear-gradient(135deg, var(--success) 0%, #06b6d4 100%)' },
];

/**
 * ContainerBlock - Styled container with nested content
 */
export function ContainerBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<ContainerBlockContent>): React.JSX.Element {
  const content = block.content as ContainerBlockContent;
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default values
  const backgroundColor = content.backgroundColor || 'transparent';
  const backgroundImage = content.backgroundImage;
  const backgroundSize = content.backgroundSize || 'cover';
  const backgroundPosition = content.backgroundPosition || 'center';
  const padding = content.padding || '24px';
  const borderRadius = content.borderRadius || '12px';
  const borderWidth = content.borderWidth || 0;
  const borderColor = content.borderColor || 'var(--color-studio-surface)';
  const maxWidth = content.maxWidth || 'none';
  const textAlign = content.textAlign || 'left';

  // Build style object
  const containerStyle: React.CSSProperties = {
    backgroundColor: !backgroundImage ? backgroundColor : undefined,
    backgroundImage: backgroundImage
      ? `url(${backgroundImage})`
      : backgroundColor.includes('gradient')
        ? backgroundColor
        : undefined,
    backgroundSize,
    backgroundPosition,
    padding,
    borderRadius,
    border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : undefined,
    maxWidth: maxWidth !== 'none' ? maxWidth : undefined,
    margin: maxWidth !== 'none' ? '0 auto' : undefined,
    textAlign: textAlign as 'left' | 'center' | 'right' | undefined,
  };

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event): void => {
          onUpdate({
            content: {
              ...content,
              backgroundImage: event.target?.result as string,
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
          backgroundImage: urlInput,
        },
      });
      setUrlInput('');
      setShowUrlInput(false);
    }
  }, [content, urlInput, onUpdate]);

  // Remove background image
  const removeBackgroundImage = useCallback(() => {
    onUpdate({
      content: {
        ...content,
        backgroundImage: undefined,
      },
    });
  }, [content, onUpdate]);

  // Preview mode
  if (!isEditing) {
    return (
      <div style={containerStyle} className="min-h-[50px]">
        {content.children && content.children.length > 0 ? (
          <div className="space-y-4">
            {/* Nested blocks would be rendered here */}
            <div className="text-studio-text-muted text-sm">
              {content.children.length} nested block(s)
            </div>
          </div>
        ) : (
          <div className="min-h-[50px]" />
        )}
      </div>
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

      {/* Container preview */}
      <div
        style={containerStyle}
        className="relative min-h-[120px] border-2 border-dashed border-studio-surface hover:border-studio-accent/50 transition-colors group"
      >
        {backgroundImage && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={removeBackgroundImage}
              className="p-2 bg-brand-error/80 rounded-lg text-brand-primary"
              title="Remove background"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-[120px] gap-2">
          <Plus className="w-6 h-6 text-studio-text-muted" />
          <span className="text-sm text-studio-text-muted">Drop blocks here</span>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-studio-bg rounded-lg border border-studio-surface/30">
        {/* Background */}
        <div className="space-y-2">
          <span className="block text-sm text-studio-text-muted">Background</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-studio-text hover:border-studio-accent/50 transition-colors"
            >
              <div
                className="w-6 h-6 rounded border border-studio-surface"
                style={{ background: backgroundColor }}
              />
              <span className="text-sm flex-1 text-left truncate">
                {PRESET_BACKGROUNDS.find((p) => p.value === backgroundColor)?.label || 'Custom'}
              </span>
              <Palette className="w-4 h-4 text-studio-text-muted" />
            </button>

            {showBackgroundPicker && (
              <div className="absolute z-20 top-full left-0 mt-1 w-full bg-studio-bg-dark border border-studio-surface/50 rounded-lg shadow-xl p-2">
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {PRESET_BACKGROUNDS.map((preset) => (
                    <button
                      type="button"
                      key={preset.value}
                      onClick={() => {
                        onUpdate({ content: { ...content, backgroundColor: preset.value } });
                        setShowBackgroundPicker(false);
                      }}
                      className="w-full aspect-square rounded border border-studio-surface hover:border-studio-accent transition-colors"
                      style={{ background: preset.value }}
                      title={preset.label}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor.startsWith('#') ? backgroundColor : '#0d1829'}
                    onChange={(e) =>
                      onUpdate({ content: { ...content, backgroundColor: e.target.value } })
                    }
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) =>
                      onUpdate({ content: { ...content, backgroundColor: e.target.value } })
                    }
                    placeholder="#000000 or gradient"
                    className="flex-1 px-2 py-1 text-sm bg-studio-bg border border-studio-surface/50 rounded text-brand-primary"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Background Image */}
        <div className="space-y-2">
          <span className="block text-sm text-studio-text-muted">Background Image</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-studio-text hover:border-studio-accent/50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">Upload</span>
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center gap-2 px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-studio-text hover:border-studio-accent/50 transition-colors"
            >
              <Link className="w-4 h-4" />
              <span className="text-sm">URL</span>
            </button>
          </div>

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
            </div>
          )}

          {backgroundImage && (
            <div className="flex items-center gap-2">
              <select
                value={backgroundSize}
                onChange={(e) =>
                  onUpdate({
                    content: {
                      ...content,
                      backgroundSize: e.target.value as 'cover' | 'contain' | 'auto',
                    },
                  })
                }
                className="flex-1 px-2 py-1.5 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
              </select>
              <select
                value={backgroundPosition}
                onChange={(e) =>
                  onUpdate({ content: { ...content, backgroundPosition: e.target.value } })
                }
                className="flex-1 px-2 py-1.5 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          )}
        </div>

        {/* Padding */}
        <div className="space-y-2">
          <label
            htmlFor="container-padding-select"
            className="block text-sm text-studio-text-muted"
          >
            Padding
          </label>
          <select
            id="container-padding-select"
            value={padding}
            onChange={(e) => onUpdate({ content: { ...content, padding: e.target.value } })}
            className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          >
            {PADDING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Border Radius */}
        <div className="space-y-2">
          <label
            htmlFor="container-border-radius-select"
            className="block text-sm text-studio-text-muted"
          >
            Border Radius
          </label>
          <select
            id="container-border-radius-select"
            value={borderRadius}
            onChange={(e) => onUpdate({ content: { ...content, borderRadius: e.target.value } })}
            className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          >
            {BORDER_RADIUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Border */}
        <div className="space-y-2">
          <label
            htmlFor="container-border-width-input"
            className="block text-sm text-studio-text-muted"
          >
            Border
          </label>
          <div className="flex items-center gap-2">
            <input
              id="container-border-width-input"
              type="number"
              min="0"
              max="10"
              value={borderWidth}
              onChange={(e) =>
                onUpdate({ content: { ...content, borderWidth: parseInt(e.target.value, 10) } })
              }
              className="w-16 px-2 py-1.5 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
            />
            <span className="text-sm text-studio-text-muted">px</span>
            <input
              type="color"
              value={borderColor}
              onChange={(e) => onUpdate({ content: { ...content, borderColor: e.target.value } })}
              className="w-8 h-8 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Max Width */}
        <div className="space-y-2">
          <label
            htmlFor="container-max-width-select"
            className="block text-sm text-studio-text-muted"
          >
            Max Width
          </label>
          <select
            id="container-max-width-select"
            value={maxWidth}
            onChange={(e) => onUpdate({ content: { ...content, maxWidth: e.target.value } })}
            className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          >
            {MAX_WIDTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Text Alignment */}
        <div className="space-y-2 md:col-span-2">
          <span className="block text-sm text-studio-text-muted">Text Alignment</span>
          <div className="flex gap-1">
            {[
              { value: 'left', icon: AlignLeft },
              { value: 'center', icon: AlignCenter },
              { value: 'right', icon: AlignRight },
            ].map(({ value, icon: Icon }) => (
              <button
                type="button"
                key={value}
                onClick={() =>
                  onUpdate({
                    content: { ...content, textAlign: value as 'left' | 'center' | 'right' },
                  })
                }
                className={`
                  p-2 rounded-lg transition-colors
                  ${
                    textAlign === value
                      ? 'bg-studio-accent text-brand-primary'
                      : 'bg-studio-bg-dark text-studio-text-muted hover:text-brand-primary'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContainerBlock;
