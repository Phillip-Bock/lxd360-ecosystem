import { Plus, Target, X } from 'lucide-react';
import Image from 'next/image';
import type { HotspotBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface HotspotBlockEditorProps {
  block: HotspotBlock;
  onChange: (content: HotspotBlock['content']) => void;
}

export const HotspotBlockEditor = ({
  block,
  onChange,
}: HotspotBlockEditorProps): React.JSX.Element => {
  const addHotspot = (): void => {
    onChange({
      ...block.content,
      hotspots: [
        ...block.content.hotspots,
        { id: `hotspot_${Date.now()}`, x: 50, y: 50, title: '', description: '' },
      ],
    });
  };

  const removeHotspot = (id: string): void => {
    onChange({
      ...block.content,
      hotspots: block.content.hotspots.filter((hotspot) => hotspot.id !== id),
    });
  };

  const updateHotspot = (
    id: string,
    field: keyof HotspotBlock['content']['hotspots'][0],
    value: string | number,
  ): void => {
    onChange({
      ...block.content,
      hotspots: block.content.hotspots.map((hotspot) =>
        hotspot.id === id ? { ...hotspot, [field]: value } : hotspot,
      ),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="hotspot-image-url"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Image URL
        </label>
        <input
          id="hotspot-image-url"
          type="url"
          value={block.content.imageUrl}
          onChange={(e) => onChange({ ...block.content, imageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div className="space-y-3">
        <span className="block text-sm font-medium text-brand-secondary">Hotspots</span>
        {block.content.hotspots.map((hotspot, index) => (
          <div key={hotspot.id} className="border border-brand-strong rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-secondary" aria-hidden="true" />
              <span className="text-sm font-medium text-brand-secondary">Hotspot {index + 1}</span>
              <button
                type="button"
                onClick={() => removeHotspot(hotspot.id)}
                className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                aria-label={`Remove hotspot ${index + 1}`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor={`hotspot-x-${hotspot.id}`}
                  className="block text-xs font-medium text-brand-secondary mb-1"
                >
                  X Position (%)
                </label>
                <input
                  id={`hotspot-x-${hotspot.id}`}
                  type="number"
                  value={hotspot.x}
                  onChange={(e) => updateHotspot(hotspot.id, 'x', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label
                  htmlFor={`hotspot-y-${hotspot.id}`}
                  className="block text-xs font-medium text-brand-secondary mb-1"
                >
                  Y Position (%)
                </label>
                <input
                  id={`hotspot-y-${hotspot.id}`}
                  type="number"
                  value={hotspot.y}
                  onChange={(e) => updateHotspot(hotspot.id, 'y', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor={`hotspot-title-${hotspot.id}`}
                className="block text-xs font-medium text-brand-secondary mb-1"
              >
                Title
              </label>
              <input
                id={`hotspot-title-${hotspot.id}`}
                type="text"
                value={hotspot.title}
                onChange={(e) => updateHotspot(hotspot.id, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                placeholder="Hotspot title"
              />
            </div>
            <div>
              <label
                htmlFor={`hotspot-description-${hotspot.id}`}
                className="block text-xs font-medium text-brand-secondary mb-1"
              >
                Description
              </label>
              <textarea
                id={`hotspot-description-${hotspot.id}`}
                value={hotspot.description}
                onChange={(e) => updateHotspot(hotspot.id, 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                placeholder="Hotspot description"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addHotspot}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Hotspot
        </button>
      </div>
      {block.content.imageUrl && (
        <div className="mt-4 p-4 bg-brand-page rounded-lg">
          <p className="text-xs font-medium text-brand-secondary mb-2">Preview:</p>
          <div
            className="relative bg-gray-200 rounded-lg overflow-hidden"
            style={{ aspectRatio: '16/9' }}
          >
            <Image
              src={block.content.imageUrl}
              alt="Hotspot preview image"
              fill
              className="object-cover"
            />
            {block.content.hotspots.map((hotspot, index) => (
              <div
                key={hotspot.id}
                className="absolute w-6 h-6 bg-brand-error border-2 border-white rounded-full transition-colors"
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                role="img"
                aria-label={`Hotspot ${index + 1}: ${hotspot.title || 'Untitled'} at position ${hotspot.x}%, ${hotspot.y}%`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
