import { Box, Hand, Layers } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface XRInteractiveDiagramData {
  title?: string;
  modelUrl?: string;
  interactionMode?: string;
}

export const XRInteractiveDiagramBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as XRInteractiveDiagramData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [modelUrl, setModelUrl] = useState(data.modelUrl || '');
  const [interactionMode, setInteractionMode] = useState(data.interactionMode || 'hand_tracking');

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">XR Interactive Diagram</h3>
          <span className="ml-auto px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full font-medium">
            XR
          </span>
        </div>
        <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg text-sm text-violet-800">
          <p className="font-medium mb-1">Device Requirements:</p>
          <p className="text-xs">
            VR headset with hand tracking (Quest 2+) or controllers. Mobile AR for basic
            interaction.
          </p>
        </div>
        <div>
          <label
            htmlFor="diagram-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Diagram Title
          </label>
          <input
            id="diagram-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Engine Component Assembly"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label
            htmlFor="model-url"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            3D Model URL
          </label>
          <input
            id="model-url"
            type="text"
            value={modelUrl}
            onChange={(e) => {
              setModelUrl(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, modelUrl: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="URL to GLB/GLTF model"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-violet-500"
          />
          <p className="mt-1 text-xs text-brand-muted">
            Model should have separable components for disassembly interaction
          </p>
        </div>
        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-2">
            Interaction Mode
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'hand_tracking', label: 'Hand Tracking', icon: Hand },
              { value: 'controller', label: 'Controllers', icon: Box },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${interactionMode === option.value ? 'border-violet-500 bg-violet-50' : 'border-brand-default'}`}
              >
                <input
                  type="radio"
                  name="interactionMode"
                  value={option.value}
                  checked={interactionMode === option.value}
                  onChange={(e) => {
                    setInteractionMode(e.target.value);
                    props.onUpdate({
                      ...props.block,
                      content: { ...data, interactionMode: e.target.value } as Record<
                        string,
                        unknown
                      >,
                    });
                  }}
                  className="sr-only"
                />
                <option.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-2">Features</legend>
          <div className="space-y-2">
            {[
              'Component Inspection',
              'Disassembly Mode',
              'Animated Demonstrations',
              'X-Ray View',
            ].map((feature) => (
              <label key={feature} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-violet-600 rounded" />
                <span className="text-sm text-brand-secondary">{feature}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </BaseBlockEditor>
  );
};
