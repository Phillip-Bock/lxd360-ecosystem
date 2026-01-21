import {
  Eye,
  Image as ImageIcon,
  Info,
  LayoutTemplate,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type {
  InfographicHotspot,
  InteractiveInfographicBlock,
} from '@/lib/inspire/types/contentBlocks';

interface InteractiveInfographicBlockEditorProps {
  block: InteractiveInfographicBlock;
  onChange: (content: InteractiveInfographicBlock['content']) => void;
}

export const InteractiveInfographicBlockEditor = ({
  block,
  onChange,
}: InteractiveInfographicBlockEditorProps): React.JSX.Element => {
  const [hotspots, setHotspots] = useState<InfographicHotspot[]>(block.content.hotspots || []);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const updateContent = (updatedHotspots: InfographicHotspot[]): void => {
    setHotspots(updatedHotspots);
    onChange({
      ...block.content,
      hotspots: updatedHotspots,
    });
  };

  const selectedHotspot = hotspots.find((h) => h.id === selectedHotspotId);

  const addHotspot = (): void => {
    const newId = `hotspot-${Date.now()}`;
    const newHotspot: InfographicHotspot = {
      id: newId,
      x: 50,
      y: 50,
      label: 'New Hotspot',
      content: '',
      icon: '📍',
    };
    updateContent([...hotspots, newHotspot]);
    setSelectedHotspotId(newId);
  };

  const deleteHotspot = (id: string): void => {
    updateContent(hotspots.filter((h) => h.id !== id));
    if (selectedHotspotId === id) setSelectedHotspotId(null);
  };

  const updateHotspot = (id: string, updates: Partial<InfographicHotspot>): void => {
    updateContent(hotspots.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="infographic-title"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <LayoutTemplate aria-hidden="true" className="w-4 h-4 inline mr-1" />
          Infographic Title
        </label>
        <input
          id="infographic-title"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="e.g., The History of Computing, Climate Change Timeline"
        />
      </div>

      {/* Background Image */}
      <div>
        <label
          htmlFor="infographic-image-url"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <ImageIcon aria-hidden="true" className="w-4 h-4 inline mr-1" />
          Background Image URL
        </label>
        <input
          id="infographic-image-url"
          type="url"
          value={block.content.imageUrl || ''}
          onChange={(e) => onChange({ ...block.content, imageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="https://example.com/infographic.jpg"
        />
        <p className="text-xs text-brand-muted mt-1">
          Upload your infographic image. Hotspots will be placed on top of it.
        </p>
      </div>

      {/* Layout Type */}
      <fieldset aria-label="Layout type selection">
        <legend className="block text-sm font-medium text-brand-secondary mb-2">Layout Type</legend>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'vertical', label: 'Vertical Scroll', emoji: '⬇️' },
            { value: 'horizontal', label: 'Horizontal Scroll', emoji: '➡️' },
            { value: 'parallax', label: 'Parallax Effect', emoji: '✨' },
          ].map((layout) => (
            <button
              type="button"
              key={layout.value}
              onClick={() => onChange({ ...block.content, layoutType: layout.value })}
              aria-pressed={(block.content.layoutType || 'vertical') === layout.value}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                (block.content.layoutType || 'vertical') === layout.value
                  ? 'bg-brand-primary text-brand-primary border-brand-primary'
                  : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-blue-300'
              }`}
            >
              <span aria-hidden="true" className="text-lg block">
                {layout.emoji}
              </span>
              <span className="text-xs block">{layout.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Animation Style */}
      <div>
        <label
          htmlFor="infographic-animation-style"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Sparkles aria-hidden="true" className="w-4 h-4 inline mr-1" />
          Animation Style
        </label>
        <select
          id="infographic-animation-style"
          value={block.content.animationStyle || 'fade'}
          onChange={(e) => onChange({ ...block.content, animationStyle: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          <option value="fade">Fade In</option>
          <option value="slide">Slide In</option>
          <option value="zoom">Zoom In</option>
          <option value="bounce">Bounce</option>
          <option value="none">No Animation</option>
        </select>
      </div>

      {/* Hotspot Builder */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-brand-secondary">
            <MapPin aria-hidden="true" className="w-4 h-4 inline mr-1" />
            Interactive Hotspots
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-blue hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <Eye aria-hidden="true" className="w-3 h-3" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={addHotspot}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-primary bg-brand-primary hover:bg-brand-primary-hover rounded-lg"
            >
              <Plus aria-hidden="true" className="w-3 h-3" />
              Add Hotspot
            </button>
          </div>
        </div>

        {showPreview && block.content.imageUrl ? (
          // Preview Mode with Interactive Hotspots
          <div className="bg-linear-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
            <p className="text-sm text-teal-800 mb-3">
              <strong>Preview:</strong> {hotspots.length} hotspots configured
            </p>
            <div className="relative bg-brand-surface rounded-lg overflow-hidden border border-brand-default">
              <div className="relative w-full aspect-auto">
                <Image
                  src={
                    block.content.imageUrl ||
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInfographic Image%3C/text%3E%3C/svg%3E'
                  }
                  alt={block.content.title || 'Infographic'}
                  width={800}
                  height={600}
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInfographic Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              {hotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                >
                  <button
                    type="button"
                    className="w-8 h-8 bg-brand-primary text-brand-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <span className="text-sm">{hotspot.icon || '📍'}</span>
                  </button>
                  <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-brand-surface rounded-lg shadow-xl p-3 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <p className="font-medium text-sm text-brand-primary mb-1">{hotspot.label}</p>
                    <p className="text-xs text-brand-secondary">
                      {hotspot.content || 'No content'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="grid grid-cols-3 gap-4 min-h-[300px]">
            {/* Hotspot List */}
            <div className="border border-brand-default rounded-lg p-3 space-y-2 overflow-y-auto max-h-[300px]">
              <p className="text-xs font-medium text-brand-secondary mb-2">
                Hotspots ({hotspots.length})
              </p>
              {hotspots.length === 0 ? (
                <p className="text-xs text-brand-muted text-center py-4">
                  No hotspots yet. Click "Add Hotspot" to start.
                </p>
              ) : (
                hotspots.map((hotspot) => (
                  <button
                    type="button"
                    key={hotspot.id}
                    onClick={() => setSelectedHotspotId(hotspot.id)}
                    className={`w-full text-left p-2 rounded-lg border-2 transition-all ${
                      selectedHotspotId === hotspot.id
                        ? 'border-brand-primary bg-blue-50'
                        : 'border-brand-default hover:border-brand-strong'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{hotspot.icon || '📍'}</span>
                      <span className="text-sm font-medium">{hotspot.label}</span>
                    </div>
                    <p className="text-xs text-brand-muted">
                      Position: {hotspot.x}%, {hotspot.y}%
                    </p>
                  </button>
                ))
              )}
            </div>

            {/* Hotspot Editor */}
            {selectedHotspot ? (
              <div className="col-span-2 border border-brand-default rounded-lg p-4 space-y-4 overflow-y-auto max-h-[300px]">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-brand-primary">Edit Hotspot</h4>
                  <button
                    type="button"
                    onClick={() => deleteHotspot(selectedHotspot.id)}
                    aria-label="Delete hotspot"
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 aria-hidden="true" className="w-4 h-4" />
                  </button>
                </div>

                {/* Label */}
                <div>
                  <label
                    htmlFor="hotspot-label"
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Label
                  </label>
                  <input
                    id="hotspot-label"
                    type="text"
                    value={selectedHotspot.label}
                    onChange={(e) => updateHotspot(selectedHotspot.id, { label: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    placeholder="Hotspot title"
                  />
                </div>

                {/* Content */}
                <div>
                  <label
                    htmlFor="hotspot-content"
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Content (tooltip text)
                  </label>
                  <textarea
                    id="hotspot-content"
                    value={selectedHotspot.content}
                    onChange={(e) => updateHotspot(selectedHotspot.id, { content: e.target.value })}
                    rows={3}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    placeholder="Information shown when hovering over this hotspot"
                  />
                </div>

                {/* Icon */}
                <fieldset aria-label="Icon selection">
                  <legend className="block text-xs font-medium text-brand-secondary mb-1">
                    Icon (emoji)
                  </legend>
                  <div className="grid grid-cols-8 gap-2">
                    {['📍', '💡', 'ℹ️', '⭐', '❗', '✅', '❌', '🔍', '📊', '🎯', '🔔', '📝'].map(
                      (emoji) => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => updateHotspot(selectedHotspot.id, { icon: emoji })}
                          aria-pressed={selectedHotspot.icon === emoji}
                          aria-label={`Select icon ${emoji}`}
                          className={`p-2 text-xl border rounded-lg transition-all ${
                            selectedHotspot.icon === emoji
                              ? 'border-brand-primary bg-blue-50 scale-110'
                              : 'border-brand-default hover:border-brand-strong'
                          }`}
                        >
                          {emoji}
                        </button>
                      ),
                    )}
                  </div>
                </fieldset>

                {/* Position */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="hotspot-x-position"
                      className="block text-xs font-medium text-brand-secondary mb-1"
                    >
                      X Position (%)
                    </label>
                    <input
                      id="hotspot-x-position"
                      type="number"
                      value={selectedHotspot.x}
                      onChange={(e) =>
                        updateHotspot(selectedHotspot.id, { x: parseInt(e.target.value, 10) || 0 })
                      }
                      min="0"
                      max="100"
                      className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="hotspot-y-position"
                      className="block text-xs font-medium text-brand-secondary mb-1"
                    >
                      Y Position (%)
                    </label>
                    <input
                      id="hotspot-y-position"
                      type="number"
                      value={selectedHotspot.y}
                      onChange={(e) =>
                        updateHotspot(selectedHotspot.id, { y: parseInt(e.target.value, 10) || 0 })
                      }
                      min="0"
                      max="100"
                      className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-span-2 border border-brand-default rounded-lg p-4 flex items-center justify-center text-brand-muted">
                <div className="text-center">
                  <Info aria-hidden="true" className="w-8 h-8 mx-auto mb-2 text-brand-muted" />
                  <p className="text-sm">Select a hotspot to edit</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Infographic tip:</strong> Use hotspots to add interactive elements to your
          infographic. Position them by setting X and Y percentages (0-100%). Upload a high-quality
          image for best results.
        </p>
      </div>
    </div>
  );
};
