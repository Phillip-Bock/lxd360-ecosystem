import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ExternalLink,
  ImageIcon,
  Link as LinkIcon,
  Maximize2,
  Sparkles,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type {
  ImageAlignment,
  ImageBlock,
  ImageSize,
} from '@/lib/inspire-studio/types/contentBlocks';

interface ImageBlockEditorProps {
  block: ImageBlock;
  onChange: (content: ImageBlock['content']) => void;
}

export const ImageBlockEditor = ({ block, onChange }: ImageBlockEditorProps): React.JSX.Element => {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    setDimensions({
      width: e.currentTarget.naturalWidth,
      height: e.currentTarget.naturalHeight,
    });
  };

  const generateAltText = (): void => {
    const url = block.content.url;
    if (!url || typeof url !== 'string') return;
    const filename = url.split('/').pop()?.split('.')[0];
    const suggested = filename
      ?.replace(/[-_]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim();
    if (suggested) {
      onChange({ ...block.content, alt: suggested });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Method Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setUploadMethod('url')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadMethod === 'url'
              ? 'bg-brand-primary text-brand-primary'
              : 'bg-brand-surface text-brand-secondary hover:bg-gray-200'
          }`}
        >
          <LinkIcon className="w-4 h-4 inline mr-2" />
          Image URL
        </button>
        <button
          type="button"
          onClick={() => setUploadMethod('upload')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadMethod === 'upload'
              ? 'bg-brand-primary text-brand-primary'
              : 'bg-brand-surface text-brand-secondary hover:bg-gray-200'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload File
        </button>
      </div>

      {/* URL Input */}
      {uploadMethod === 'url' && (
        <div>
          <label
            htmlFor="image-url-input"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            <LinkIcon className="w-4 h-4 inline mr-1" />
            Image URL
          </label>
          <input
            id="image-url-input"
            type="url"
            value={typeof block.content.url === 'string' ? block.content.url : ''}
            onChange={(e) => onChange({ ...block.content, url: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
          {block.content.url && dimensions && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Loaded: {dimensions.width} × {dimensions.height}px
            </p>
          )}
        </div>
      )}

      {/* File Upload */}
      {uploadMethod === 'upload' && (
        <div className="border-2 border-dashed border-brand-strong rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-brand-page">
          <Upload className="w-12 h-12 mx-auto text-brand-muted mb-3" />
          <p className="text-sm text-brand-secondary mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-brand-muted">PNG, JPG, GIF, WebP up to 10MB</p>
          <input type="file" accept="image/*" className="hidden" aria-label="Upload image" />
        </div>
      )}

      {/* Image Preview */}
      {block.content.url && typeof block.content.url === 'string' && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-brand-blue" />
              <span className="text-sm font-medium text-blue-900">Preview</span>
            </div>
            {dimensions && (
              <span className="text-xs text-blue-700">
                {dimensions.width} × {dimensions.height}px
              </span>
            )}
          </div>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-brand-surface">
            <Image
              src={block.content.url}
              alt={block.content.alt || 'Preview'}
              fill
              className="object-contain rounded-lg"
              onLoad={handleImageLoad}
              onError={(e) => {
                e.currentTarget.src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      )}

      {/* Alt Text */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="image-alt-text-input"
            className="text-sm font-medium text-brand-secondary"
          >
            Alt Text (for accessibility)
          </label>
          {block.content.url && typeof block.content.url === 'string' && !block.content.alt && (
            <button
              type="button"
              onClick={generateAltText}
              className="flex items-center gap-1 text-xs text-brand-blue hover:text-blue-700"
            >
              <Sparkles className="w-3 h-3" />
              Auto-generate
            </button>
          )}
        </div>
        <input
          id="image-alt-text-input"
          type="text"
          value={block.content.alt}
          onChange={(e) => onChange({ ...block.content, alt: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Describe the image for screen readers..."
        />
        <p className="text-xs text-brand-muted mt-1">
          Good alt text: "A golden retriever puppy playing with a red ball in a park"
        </p>
      </div>

      {/* Caption */}
      <div>
        <label
          htmlFor="image-caption-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Caption (optional)
        </label>
        <input
          id="image-caption-input"
          type="text"
          value={block.content.caption || ''}
          onChange={(e) => onChange({ ...block.content, caption: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Add a caption below the image..."
        />
      </div>

      {/* Image Sizing */}
      <div className="border-t border-brand-default pt-4">
        <span className="block text-sm font-medium text-brand-secondary mb-3">
          <Maximize2 className="w-4 h-4 inline mr-1" />
          Image Size
        </span>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'small', label: 'Small', width: '25%' },
            { value: 'medium', label: 'Medium', width: '50%' },
            { value: 'large', label: 'Large', width: '75%' },
            { value: 'full', label: 'Full', width: '100%' },
          ].map((size) => (
            <button
              type="button"
              key={size.value}
              onClick={() => onChange({ ...block.content, size: size.value as ImageSize })}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                (block.content.size || 'full') === size.value
                  ? 'bg-brand-primary text-brand-primary border-brand-primary'
                  : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-blue-300'
              }`}
            >
              <div>{size.label}</div>
              <div className="text-xs opacity-75">{size.width}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div>
        <span className="block text-sm font-medium text-brand-secondary mb-3">Alignment</span>
        <div className="flex gap-2">
          {[
            { value: 'left', icon: AlignLeft, label: 'Left' },
            { value: 'center', icon: AlignCenter, label: 'Center' },
            { value: 'right', icon: AlignRight, label: 'Right' },
          ].map((align) => (
            <button
              type="button"
              key={align.value}
              onClick={() =>
                onChange({ ...block.content, alignment: align.value as ImageAlignment })
              }
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                (block.content.alignment || 'center') === align.value
                  ? 'bg-brand-primary text-brand-primary border-brand-primary'
                  : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-blue-300'
              }`}
            >
              <align.icon className="w-4 h-4" />
              {align.label}
            </button>
          ))}
        </div>
      </div>

      {/* Link URL */}
      <div>
        <label
          htmlFor="image-link-url-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <ExternalLink className="w-4 h-4 inline mr-1" />
          Link URL (optional)
        </label>
        <input
          id="image-link-url-input"
          type="url"
          value={block.content.link || ''}
          onChange={(e) => onChange({ ...block.content, link: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="https://example.com"
        />
        <p className="text-xs text-brand-muted mt-1">
          Make the image clickable - opens link in new tab
        </p>
      </div>

      {/* Advanced Styling */}
      <div className="border-t border-brand-default pt-4">
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.rounded || false}
              onChange={(e) => onChange({ ...block.content, rounded: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded focus:ring-brand-primary"
            />
            <span className="text-sm text-brand-secondary">Rounded corners</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.shadow || false}
              onChange={(e) => onChange({ ...block.content, shadow: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded focus:ring-brand-primary"
            />
            <span className="text-sm text-brand-secondary">Drop shadow</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.border || false}
              onChange={(e) => onChange({ ...block.content, border: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded focus:ring-brand-primary"
            />
            <span className="text-sm text-brand-secondary">Border</span>
          </label>
        </div>
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Accessibility tip:</strong> Always add descriptive alt text. It helps users with
          screen readers understand the image content.
        </p>
      </div>
    </div>
  );
};
