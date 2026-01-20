import { MapIcon } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface InteractiveMapData {
  title?: string;
  mapType?: string;
  displayMode?: string;
}

export const InteractiveMapBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as InteractiveMapData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [mapType, setMapType] = useState(data.mapType || 'world');
  const [displayMode, setDisplayMode] = useState(data.displayMode || 'clickable');

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
            <MapIcon className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Interactive Map/Heatmap</h3>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <p className="font-medium mb-1">Clickable regional maps</p>
          <p>Display information overlays, data visualizations, and interactive regions</p>
        </div>
        <div>
          <label
            htmlFor="interactive-map-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Map Title
          </label>
          <input
            id="interactive-map-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Global Climate Zones"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="interactive-map-type"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Map Type
            </label>
            <select
              id="interactive-map-type"
              value={mapType}
              onChange={(e) => {
                setMapType(e.target.value);
                props.onUpdate({
                  ...props.block,
                  content: { ...data, mapType: e.target.value } as Record<string, unknown>,
                });
              }}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="world">World Map</option>
              <option value="country">Country Map</option>
              <option value="building">Building/Floor Plan</option>
              <option value="custom">Custom Image</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="interactive-map-display-mode"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Display Mode
            </label>
            <select
              id="interactive-map-display-mode"
              value={displayMode}
              onChange={(e) => {
                setDisplayMode(e.target.value);
                props.onUpdate({
                  ...props.block,
                  content: { ...data, displayMode: e.target.value } as Record<string, unknown>,
                });
              }}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="clickable">Clickable Regions</option>
              <option value="heatmap">Data Heatmap</option>
              <option value="markers">Markers/Pins</option>
            </select>
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
