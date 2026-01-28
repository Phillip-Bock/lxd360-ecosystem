import { Eye, MapPin, Plus, Smartphone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface Hotspot {
  id: string;
  position: { x: number; y: number };
  title: string;
  content: string;
  type: 'info' | 'video' | 'quiz';
}

interface ARHotspotData {
  title?: string;
  description?: string;
  targetImageUrl?: string;
  hotspots?: Hotspot[];
  activationDistance?: number;
}

export const ARHotspotExplorerBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as unknown as ARHotspotData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [targetImageUrl, setTargetImageUrl] = useState(data.targetImageUrl || '');
  const [hotspots, setHotspots] = useState<Hotspot[]>(data.hotspots || []);

  const addHotspot = (): void => {
    const newHotspot: Hotspot = {
      id: `hotspot_${Date.now()}`,
      position: { x: 50, y: 50 },
      title: 'New Hotspot',
      content: '',
      type: 'info',
    };
    const updated = [...hotspots, newHotspot];
    setHotspots(updated);
    props.onUpdate({
      ...props.block,
      content: { ...data, hotspots: updated } as Record<string, unknown>,
    });
  };

  const removeHotspot = (id: string): void => {
    const updated = hotspots.filter((h) => h.id !== id);
    setHotspots(updated);
    props.onUpdate({
      ...props.block,
      content: { ...data, hotspots: updated } as Record<string, unknown>,
    });
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">AR Hotspot Explorer</h3>
          <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            AR
          </span>
        </div>

        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Smartphone className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Device Requirements:</p>
              <p className="text-xs">ARKit/ARCore support, camera access, image tracking enabled</p>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="ar-hotspot-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Title
          </label>
          <input
            id="ar-hotspot-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Explore the Solar System"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label
            htmlFor="ar-target-image"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Target Image/Object
          </label>
          <input
            id="ar-target-image"
            type="text"
            value={targetImageUrl}
            onChange={(e) => {
              setTargetImageUrl(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, targetImageUrl: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="URL to target image or marker"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-green-500"
          />
          <p className="mt-1 text-xs text-brand-muted">
            Image that learners will scan to activate hotspots
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="block text-sm font-medium text-brand-secondary">
              Hotspots ({hotspots.length})
            </span>
            <button
              type="button"
              onClick={addHotspot}
              className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Hotspot
            </button>
          </div>

          <div className="space-y-2">
            {hotspots.map((hotspot, idx) => (
              <div
                key={hotspot.id}
                className="p-3 bg-brand-page border border-brand-default rounded-lg"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <input
                    type="text"
                    value={hotspot.title}
                    onChange={(e) => {
                      const updated = [...hotspots];
                      updated[idx].title = e.target.value;
                      setHotspots(updated);
                      props.onUpdate({
                        ...props.block,
                        content: { ...data, hotspots: updated } as Record<string, unknown>,
                      });
                    }}
                    placeholder="Hotspot title"
                    className="flex-1 px-2 py-1 text-sm border border-brand-strong rounded focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeHotspot(hotspot.id)}
                    className="p-1 text-brand-muted hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={hotspot.content}
                  onChange={(e) => {
                    const updated = [...hotspots];
                    updated[idx].content = e.target.value;
                    setHotspots(updated);
                    props.onUpdate({
                      ...props.block,
                      content: { ...data, hotspots: updated } as Record<string, unknown>,
                    });
                  }}
                  placeholder="Hotspot content..."
                  className="w-full px-2 py-1 text-sm border border-brand-strong rounded focus:ring-2 focus:ring-green-500 resize-none"
                  rows={2}
                />
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="text-brand-secondary">
                    Position: X: {hotspot.position.x}%, Y: {hotspot.position.y}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {targetImageUrl && (
          <div className="border-t pt-4">
            <div className="aspect-video bg-brand-surface rounded-lg flex items-center justify-center relative overflow-hidden">
              <Eye className="w-12 h-12 text-brand-muted" />
              {hotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="absolute w-8 h-8 bg-brand-success rounded-full flex items-center justify-center text-brand-primary text-xs font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    left: `${hotspot.position.x}%`,
                    top: `${hotspot.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <MapPin className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseBlockEditor>
  );
};
