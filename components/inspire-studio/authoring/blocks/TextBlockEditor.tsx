import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Eye, Palette, Type } from 'lucide-react';
import { useState } from 'react';
import type { TextBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface TextBlockEditorProps {
  block: TextBlock;
  onChange: (content: TextBlock['content']) => void;
}

export const TextBlockEditor = ({ block, onChange }: TextBlockEditorProps): React.JSX.Element => {
  const [showPreview, setShowPreview] = useState(false);

  const wordCount = block.content.text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Text Content */}
      <div>
        <label
          htmlFor="text-block-content"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Type aria-hidden="true" className="w-4 h-4 inline mr-1" />
          Text Content
        </label>
        <textarea
          id="text-block-content"
          value={block.content.text}
          onChange={(e) => onChange({ ...block.content, text: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent min-h-[120px] font-sans"
          placeholder="Enter your text content..."
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-brand-muted">
            {block.content.text.length} characters · {wordCount} words
          </p>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-xs text-brand-blue hover:text-blue-700"
          >
            <Eye aria-hidden="true" className="w-3 h-3" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
        </div>
      </div>

      {/* Font Size */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-sm font-medium text-brand-secondary mb-2">Font Size</legend>
        <div className="grid grid-cols-5 gap-2">
          {[
            { value: 'xs', label: 'XS', size: '12px' },
            { value: 'sm', label: 'SM', size: '14px' },
            { value: 'base', label: 'Base', size: '16px' },
            { value: 'lg', label: 'LG', size: '18px' },
            { value: 'xl', label: 'XL', size: '20px' },
          ].map((size) => (
            <button
              type="button"
              key={size.value}
              onClick={() =>
                onChange({
                  ...block.content,
                  fontSize: size.value as 'xs' | 'sm' | 'base' | 'lg' | 'xl',
                })
              }
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                (block.content.fontSize || 'base') === size.value
                  ? 'bg-brand-primary text-brand-primary border-brand-primary'
                  : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-blue-300'
              }`}
            >
              <div>{size.label}</div>
              <div className="text-xs opacity-75">{size.size}</div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Text Alignment */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-sm font-medium text-brand-secondary mb-2">
          Text Alignment
        </legend>
        <div className="flex gap-2">
          {[
            { value: 'left', icon: AlignLeft, label: 'Left' },
            { value: 'center', icon: AlignCenter, label: 'Center' },
            { value: 'right', icon: AlignRight, label: 'Right' },
            { value: 'justify', icon: AlignJustify, label: 'Justify' },
          ].map((align) => (
            <button
              type="button"
              key={align.value}
              onClick={() =>
                onChange({
                  ...block.content,
                  alignment: align.value as 'left' | 'center' | 'right' | 'justify',
                })
              }
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                (block.content.alignment || 'left') === align.value
                  ? 'bg-brand-primary text-brand-primary border-brand-primary'
                  : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-blue-300'
              }`}
            >
              <align.icon aria-hidden="true" className="w-4 h-4" />
              {align.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Text Style */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-sm font-medium text-brand-secondary mb-2">Text Style</legend>
        <div className="flex gap-2">
          {[
            { value: 'normal', label: 'Normal', weight: '400' },
            { value: 'medium', label: 'Medium', weight: '500' },
            { value: 'semibold', label: 'Semibold', weight: '600' },
            { value: 'bold', label: 'Bold', weight: '700' },
          ].map((weight) => (
            <button
              type="button"
              key={weight.value}
              onClick={() =>
                onChange({
                  ...block.content,
                  fontWeight: weight.value as 'normal' | 'medium' | 'semibold' | 'bold',
                })
              }
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                (block.content.fontWeight || 'normal') === weight.value
                  ? 'bg-brand-primary text-brand-primary border-brand-primary'
                  : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-blue-300'
              }`}
            >
              {weight.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Text Color */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-sm font-medium text-brand-secondary mb-2">
          <Palette aria-hidden="true" className="w-4 h-4 inline mr-1" />
          Text Color
        </legend>
        <div className="grid grid-cols-8 gap-2">
          {[
            { value: 'gray-900', label: 'Black', hex: '#111827' },
            { value: 'gray-700', label: 'Dark Gray', hex: '#374151' },
            { value: 'gray-500', label: 'Gray', hex: '#6B7280' },
            { value: 'blue-600', label: 'Blue', hex: '#2563EB' },
            { value: 'green-600', label: 'Green', hex: '#16A34A' },
            { value: 'yellow-600', label: 'Yellow', hex: '#CA8A04' },
            { value: 'red-600', label: 'Red', hex: '#DC2626' },
            { value: 'purple-600', label: 'Purple', hex: '#9333EA' },
          ].map((color) => (
            <button
              type="button"
              key={color.value}
              onClick={() => onChange({ ...block.content, textColor: color.value })}
              title={color.label}
              aria-label={`Select ${color.label} color`}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                (block.content.textColor || 'gray-900') === color.value
                  ? 'border-brand-primary scale-110'
                  : 'border-brand-default hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </fieldset>

      {/* Line Height */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-sm font-medium text-brand-secondary mb-2">Line Height</legend>
        <div className="flex gap-2">
          {[
            { value: 'tight', label: 'Tight', height: '1.25' },
            { value: 'normal', label: 'Normal', height: '1.5' },
            { value: 'relaxed', label: 'Relaxed', height: '1.75' },
            { value: 'loose', label: 'Loose', height: '2' },
          ].map((lineHeight) => (
            <button
              type="button"
              key={lineHeight.value}
              onClick={() =>
                onChange({
                  ...block.content,
                  lineHeight: lineHeight.value as 'tight' | 'normal' | 'relaxed' | 'loose',
                })
              }
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                (block.content.lineHeight || 'normal') === lineHeight.value
                  ? 'bg-brand-primary text-brand-primary border-brand-primary'
                  : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-blue-300'
              }`}
            >
              <div>{lineHeight.label}</div>
              <div className="text-xs opacity-75">{lineHeight.height}</div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Live Preview */}
      {showPreview && block.content.text && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye aria-hidden="true" className="w-5 h-5 text-brand-blue" />
            <span className="text-sm font-medium text-blue-900">Live Preview</span>
          </div>
          <div className="bg-brand-surface rounded-lg p-4 border border-brand-default">
            <p
              className={`text-${block.content.fontSize || 'base'} text-${block.content.alignment || 'left'} font-${block.content.fontWeight || 'normal'} text-${block.content.textColor || 'gray-900'} leading-${block.content.lineHeight || 'normal'}`}
              style={{
                fontSize: {
                  xs: '0.75rem',
                  sm: '0.875rem',
                  base: '1rem',
                  lg: '1.125rem',
                  xl: '1.25rem',
                }[(block.content.fontSize || 'base') as string],
                textAlign: (block.content.alignment || 'left') as
                  | 'left'
                  | 'center'
                  | 'right'
                  | 'justify',
                fontWeight: {
                  normal: 400,
                  medium: 500,
                  semibold: 600,
                  bold: 700,
                }[(block.content.fontWeight || 'normal') as string],
                lineHeight: {
                  tight: 1.25,
                  normal: 1.5,
                  relaxed: 1.75,
                  loose: 2,
                }[(block.content.lineHeight || 'normal') as string],
              }}
            >
              {block.content.text}
            </p>
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Formatting tip:</strong> Choose clear, readable fonts and colors. Maintain good
          contrast for accessibility.
        </p>
      </div>
    </div>
  );
};
