import { AlertTriangle, Box, Maximize2, RotateCw, Smartphone, Upload } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface ARObjectData {
  title?: string;
  description?: string;
  modelUrl?: string;
  modelFormat?: 'glb' | 'gltf' | 'usdz';
  scaleFactor?: number;
  interactionType?: 'rotate' | 'scale' | 'rotate_scale' | 'full';
  annotations?: Array<{ id: string; position: { x: number; y: number; z: number }; text: string }>;
  safetyWarning?: string;
}

export const ARObjectViewerBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as unknown as ARObjectData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [description, setDescription] = useState(data.description || '');
  const [modelUrl, setModelUrl] = useState(data.modelUrl || '');
  const [modelFormat, setModelFormat] = useState(data.modelFormat || 'glb');
  const [scaleFactor, setScaleFactor] = useState(data.scaleFactor || 1.0);
  const [interactionType, setInteractionType] = useState(data.interactionType || 'rotate_scale');
  const [safetyWarning, setSafetyWarning] = useState(
    data.safetyWarning ||
      'Please ensure you have adequate space around you before viewing AR content.',
  );

  const handleChange = (): void => {
    props.onUpdate({
      ...props.block,
      content: {
        ...data,
        title,
        description,
        modelUrl,
        modelFormat,
        scaleFactor,
        interactionType,
        safetyWarning,
      } as Record<string, unknown>,
    });
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Box className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">AR Object Viewer</h3>
          <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
            AR
          </span>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Smartphone className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Device Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>iOS 12+ with ARKit support</li>
                <li>Android 7.0+ with ARCore support</li>
                <li>Camera access required</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="ar-object-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Title
          </label>
          <input
            id="ar-object-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              handleChange();
            }}
            placeholder="e.g., Human Heart 3D Model"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="ar-object-description"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Description
          </label>
          <textarea
            id="ar-object-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              handleChange();
            }}
            placeholder="Describe what learners will see and explore..."
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div>
          <label
            htmlFor="ar-object-model-url"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            3D Model URL
          </label>
          <div className="flex gap-2">
            <input
              id="ar-object-model-url"
              type="text"
              value={modelUrl}
              onChange={(e) => {
                setModelUrl(e.target.value);
                handleChange();
              }}
              placeholder="https://example.com/model.glb"
              className="flex-1 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
            <button
              type="button"
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
          <p className="mt-1 text-xs text-brand-muted">
            Supported formats: GLB, GLTF, USDZ (for iOS). Recommended: GLB for cross-platform
            compatibility.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="ar-object-model-format"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Model Format
            </label>
            <select
              id="ar-object-model-format"
              value={modelFormat}
              onChange={(e) => {
                const value = e.target.value as 'glb' | 'gltf' | 'usdz';
                setModelFormat(value);
                handleChange();
              }}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="glb">GLB (Recommended)</option>
              <option value="gltf">GLTF</option>
              <option value="usdz">USDZ (iOS only)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ar-object-scale-factor"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Default Scale
            </label>
            <input
              id="ar-object-scale-factor"
              type="number"
              value={scaleFactor}
              onChange={(e) => {
                setScaleFactor(parseFloat(e.target.value));
                handleChange();
              }}
              step="0.1"
              min="0.1"
              max="10"
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-2">
            Interaction Type
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'rotate', label: 'Rotate Only', icon: RotateCw },
              { value: 'scale', label: 'Scale Only', icon: Maximize2 },
              { value: 'rotate_scale', label: 'Rotate & Scale', icon: Box },
              { value: 'full', label: 'Full Control', icon: Box },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  interactionType === option.value
                    ? 'border-brand-primary bg-blue-50'
                    : 'border-brand-default hover:border-brand-strong'
                }`}
              >
                <input
                  type="radio"
                  name="interactionType"
                  value={option.value}
                  checked={interactionType === option.value}
                  onChange={(e) => {
                    const value = e.target.value as 'rotate' | 'scale' | 'rotate_scale' | 'full';
                    setInteractionType(value);
                    handleChange();
                  }}
                  className="sr-only"
                />
                <option.icon className="w-4 h-4 text-brand-secondary" />
                <span className="text-sm font-medium text-brand-primary">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="ar-object-safety-warning"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Safety Warning
          </label>
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <textarea
              id="ar-object-safety-warning"
              value={safetyWarning}
              onChange={(e) => {
                setSafetyWarning(e.target.value);
                handleChange();
              }}
              className="flex-1 px-2 py-1 bg-brand-surface border border-amber-300 rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              rows={2}
            />
          </div>
        </div>

        {modelUrl && (
          <div className="border-t pt-4">
            <div className="p-4 bg-brand-page border border-brand-default rounded-lg">
              <p className="text-sm text-brand-secondary mb-2">Preview (Desktop)</p>
              <div className="aspect-video bg-linear-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Box className="w-12 h-12 text-brand-cyan mx-auto mb-2" />
                  <p className="text-sm text-brand-secondary">
                    AR preview available on mobile device
                  </p>
                  <p className="text-xs text-brand-muted mt-1">
                    Point camera at flat surface to place object
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseBlockEditor>
  );
};
