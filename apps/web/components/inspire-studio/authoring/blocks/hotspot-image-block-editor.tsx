import { Target } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface HotspotImageData {
  title?: string;
  imageUrl?: string;
}

export const HotspotImageBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as HotspotImageData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Hotspot (Find in Image)</h3>
          <span className="ml-auto px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full font-medium">
            Assessment
          </span>
        </div>
        <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-xs">
          <p className="font-medium mb-1">Click-to-identify knowledge check</p>
          <p>Use cases: Safety hazard identification, anatomical labeling, equipment recognition</p>
        </div>
        <div>
          <label
            htmlFor="hotspot-image-question"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Question
          </label>
          <input
            id="hotspot-image-question"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Identify all safety hazards"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label
            htmlFor="hotspot-image-url"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Image URL
          </label>
          <input
            id="hotspot-image-url"
            type="text"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, imageUrl: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        {imageUrl && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-brand-secondary mb-2">
              Preview & Hotspot Placement
            </p>
            <div className="aspect-video bg-brand-surface rounded-lg flex items-center justify-center relative">
              <Target className="w-12 h-12 text-brand-muted" />
              <p className="absolute bottom-4 text-xs text-brand-muted">
                Click to place hotspots on image
              </p>
            </div>
          </div>
        )}
      </div>
    </BaseBlockEditor>
  );
};
