import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Gamepad2,
  Hand,
  Headphones,
  Info,
  Link2,
  Settings,
  Sparkles,
  Target,
  XCircle,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import type { VRSimulationBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface VRSimulationBlockEditorProps {
  block: VRSimulationBlock;
  onChange: (content: VRSimulationBlock['content']) => void;
}

export const VRSimulationBlockEditor = ({
  block,
  onChange,
}: VRSimulationBlockEditorProps): React.JSX.Element => {
  const [showPreview, setShowPreview] = useState(false);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);

  const validateUrl = (url: string): void => {
    if (!url) {
      setUrlValid(null);
      return;
    }
    try {
      new URL(url);
      setUrlValid(true);
    } catch {
      // Silently ignore - invalid URL format
      setUrlValid(false);
    }
  };

  const handleUrlChange = (url: string): void => {
    onChange({ ...block.content, environmentUrl: url });
    validateUrl(url);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="vr-sim-title-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Zap className="w-4 h-4 inline mr-1" aria-hidden="true" />
          VR Simulation Title
        </label>
        <input
          id="vr-sim-title-input"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="e.g., Emergency Response Training, Medical Procedure Simulation"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="vr-sim-description-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Description
        </label>
        <textarea
          id="vr-sim-description-input"
          value={block.content.description || ''}
          onChange={(e) => onChange({ ...block.content, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Describe what learners will experience in this VR simulation..."
        />
      </div>

      {/* Environment URL */}
      <div>
        <label
          htmlFor="vr-sim-environment-url-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Link2 className="w-4 h-4 inline mr-1" aria-hidden="true" />
          VR Environment URL
        </label>
        <div className="relative">
          <input
            id="vr-sim-environment-url-input"
            type="url"
            value={block.content.environmentUrl || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
              urlValid === false
                ? 'border-red-300'
                : urlValid === true
                  ? 'border-green-300'
                  : 'border-brand-strong'
            }`}
            placeholder="https://example.com/vr-scene.glb"
          />
          {urlValid !== null && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {urlValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-brand-muted mt-1">
          WebXR-compatible 3D scene URL (.glb, .gltf, or WebXR experience URL)
        </p>
        {urlValid === false && <p className="text-xs text-red-600 mt-1">⚠️ Invalid URL format</p>}
      </div>

      {/* Simulation Type */}
      <div>
        <label
          htmlFor="vr-sim-type-select"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Simulation Type
        </label>
        <select
          id="vr-sim-type-select"
          value={block.content.simulationType || 'safety_training'}
          onChange={(e) => onChange({ ...block.content, simulationType: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="safety_training">Safety Training</option>
          <option value="medical_procedure">Medical Procedure</option>
          <option value="equipment_operation">Equipment Operation</option>
          <option value="hazard_response">Hazard Response</option>
          <option value="technical_skills">Technical Skills</option>
          <option value="soft_skills">Soft Skills (communication, empathy)</option>
          <option value="spatial_navigation">Spatial Navigation</option>
          <option value="assembly_disassembly">Assembly/Disassembly</option>
        </select>
      </div>

      {/* Difficulty Level */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-sm font-medium text-brand-secondary mb-2">
          Difficulty Level
        </legend>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'beginner', label: 'Beginner', emoji: '🟢' },
            { value: 'intermediate', label: 'Intermediate', emoji: '🟡' },
            { value: 'advanced', label: 'Advanced', emoji: '🟠' },
            { value: 'expert', label: 'Expert', emoji: '🔴' },
          ].map((level) => (
            <button
              type="button"
              key={level.value}
              onClick={() => onChange({ ...block.content, difficultyLevel: level.value })}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                (block.content.difficultyLevel || 'intermediate') === level.value
                  ? 'bg-brand-error text-brand-primary border-red-600'
                  : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-red-300'
              }`}
            >
              <div className="text-lg">{level.emoji}</div>
              <div className="text-xs">{level.label}</div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* VR Configuration Section */}
      <div className="border-t border-brand-default pt-4 space-y-4">
        <h4 className="text-sm font-medium text-brand-primary flex items-center gap-2">
          <Settings className="w-4 h-4" />
          VR Configuration
        </h4>

        {/* Headset Compatibility */}
        <fieldset className="border-0 p-0 m-0">
          <legend className="block text-sm font-medium text-brand-secondary mb-2">
            <Headphones className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Headset Compatibility
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'quest', label: 'Meta Quest', icon: '🥽' },
              { value: 'vive', label: 'HTC Vive', icon: '🎮' },
              { value: 'psvr', label: 'PlayStation VR', icon: '🎯' },
              { value: 'webxr', label: 'WebXR (unknown)', icon: '🌐' },
            ].map((headset) => (
              <label
                key={headset.value}
                className="flex items-center gap-2 p-2 border border-brand-default rounded-lg hover:border-red-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(block.content.compatibleHeadsets || []).includes(headset.value)}
                  onChange={(e) => {
                    const current = block.content.compatibleHeadsets || [];
                    const updated = e.target.checked
                      ? [...current, headset.value]
                      : current.filter((h) => h !== headset.value);
                    onChange({ ...block.content, compatibleHeadsets: updated });
                  }}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-lg">{headset.icon}</span>
                <span className="text-sm text-brand-secondary">{headset.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Movement Type */}
        <div>
          <label
            htmlFor="vr-sim-movement-type-select"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            <Gamepad2 className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Movement Type
          </label>
          <select
            id="vr-sim-movement-type-select"
            value={block.content.movementType || 'teleport'}
            onChange={(e) => onChange({ ...block.content, movementType: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="teleport">Teleport (most comfortable)</option>
            <option value="smooth">Smooth Locomotion</option>
            <option value="roomscale">Room-Scale Only (physical movement)</option>
            <option value="mixed">Mixed (teleport + smooth)</option>
            <option value="stationary">Stationary (no movement)</option>
          </select>
        </div>

        {/* Interaction Method */}
        <fieldset className="border-0 p-0 m-0">
          <legend className="block text-sm font-medium text-brand-secondary mb-2">
            <Hand className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Interaction Method
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'controllers', label: 'Controllers', emoji: '🎮' },
              { value: 'hand_tracking', label: 'Hand Tracking', emoji: '✋' },
              { value: 'gaze', label: 'Gaze', emoji: '👁️' },
            ].map((method) => (
              <button
                type="button"
                key={method.value}
                onClick={() => onChange({ ...block.content, interactionMethod: method.value })}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  (block.content.interactionMethod || 'controllers') === method.value
                    ? 'bg-brand-error text-brand-primary border-red-600'
                    : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-red-300'
                }`}
              >
                <div className="text-lg">{method.emoji}</div>
                <div className="text-xs">{method.label}</div>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Graphics Quality */}
        <div>
          <label
            htmlFor="vr-sim-graphics-quality-select"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            <Sparkles className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Graphics Quality
          </label>
          <select
            id="vr-sim-graphics-quality-select"
            value={block.content.graphicsQuality || 'balanced'}
            onChange={(e) => onChange({ ...block.content, graphicsQuality: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="low">Low (better performance)</option>
            <option value="balanced">Balanced (recommended)</option>
            <option value="high">High (better visuals)</option>
            <option value="ultra">Ultra (high-end only)</option>
          </select>
        </div>

        {/* Frame Rate Target */}
        <div>
          <label
            htmlFor="vr-sim-frame-rate-select"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Frame Rate Target
          </label>
          <select
            id="vr-sim-frame-rate-select"
            value={block.content.frameRateTarget || 72}
            onChange={(e) =>
              onChange({ ...block.content, frameRateTarget: parseInt(e.target.value, 10) })
            }
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value={60}>60 FPS (minimum)</option>
            <option value={72}>72 FPS (standard)</option>
            <option value={90}>90 FPS (high performance)</option>
            <option value={120}>120 FPS (premium)</option>
          </select>
        </div>
      </div>

      {/* Simulation Settings */}
      <div className="border-t border-brand-default pt-4 space-y-4">
        <h4 className="text-sm font-medium text-brand-primary flex items-center gap-2">
          <Target className="w-4 h-4" />
          Simulation Settings
        </h4>

        {/* Duration */}
        <div>
          <label
            htmlFor="vr-sim-duration-input"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Expected Duration
          </label>
          <div className="flex gap-2 items-center">
            <input
              id="vr-sim-duration-input"
              type="number"
              value={block.content.durationMinutes || 10}
              onChange={(e) =>
                onChange({ ...block.content, durationMinutes: parseInt(e.target.value, 10) || 0 })
              }
              min="1"
              className="w-32 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <span className="text-sm text-brand-secondary">minutes</span>
          </div>
        </div>

        {/* Number of Scenarios/Tasks */}
        <div>
          <label
            htmlFor="vr-sim-task-count-input"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Number of Tasks/Scenarios
          </label>
          <input
            id="vr-sim-task-count-input"
            type="number"
            value={block.content.taskCount || 1}
            onChange={(e) =>
              onChange({ ...block.content, taskCount: parseInt(e.target.value, 10) || 1 })
            }
            min="1"
            className="w-32 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Assessment Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.enablePerformanceTracking !== false}
              onChange={(e) =>
                onChange({ ...block.content, enablePerformanceTracking: e.target.checked })
              }
              className="w-4 h-4 text-red-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Track performance metrics (completion time, accuracy, errors)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.enableRecording || false}
              onChange={(e) => onChange({ ...block.content, enableRecording: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Enable session recording for instructor review
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.allowRetry !== false}
              onChange={(e) => onChange({ ...block.content, allowRetry: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Allow learners to retry failed scenarios
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.showHints || false}
              onChange={(e) => onChange({ ...block.content, showHints: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Show hints and guidance during simulation
            </span>
          </label>
        </div>
      </div>

      {/* Safety & Comfort */}
      <div className="border-t border-brand-default pt-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <label
                htmlFor="vr-sim-safety-input"
                className="block text-sm font-medium text-amber-900 mb-2"
              >
                Safety Instructions
              </label>
              <textarea
                id="vr-sim-safety-input"
                value={
                  block.content.safetyInstructions ||
                  'Ensure adequate play space. Remove obstacles. Take breaks every 30 minutes. Stop immediately if you feel discomfort.'
                }
                onChange={(e) => onChange({ ...block.content, safetyInstructions: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-brand-surface border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Important safety information for learners..."
              />
            </div>
          </div>
        </div>

        {/* Comfort Settings */}
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.enableComfortMode !== false}
              onChange={(e) => onChange({ ...block.content, enableComfortMode: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Enable comfort mode (vignette, reduced motion)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.showBoundaryWarnings !== false}
              onChange={(e) =>
                onChange({ ...block.content, showBoundaryWarnings: e.target.checked })
              }
              className="w-4 h-4 text-red-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Show boundary warnings when approaching play area edge
            </span>
          </label>
        </div>
      </div>

      {/* Preview */}
      {block.content.environmentUrl && urlValid && (
        <div className="border-t border-brand-default pt-4">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 mb-3"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>

          {showPreview && (
            <div className="bg-linear-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-red-600" aria-hidden="true" />
                <span className="text-sm font-medium text-red-900">VR Simulation Preview</span>
              </div>
              <div className="bg-brand-surface rounded-lg p-6 border border-brand-default">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-linear-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Headphones className="w-8 h-8 text-brand-primary" />
                  </div>
                  <h4 className="font-medium text-brand-primary">{block.content.title}</h4>
                  <p className="text-sm text-brand-secondary">
                    {block.content.description || 'VR simulation experience'}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                    <div className="bg-brand-page rounded p-2">
                      <div className="text-brand-muted">Type</div>
                      <div className="font-medium text-brand-primary capitalize">
                        {(block.content.simulationType || 'training').replace('_', ' ')}
                      </div>
                    </div>
                    <div className="bg-brand-page rounded p-2">
                      <div className="text-brand-muted">Difficulty</div>
                      <div className="font-medium text-brand-primary capitalize">
                        {block.content.difficultyLevel || 'intermediate'}
                      </div>
                    </div>
                    <div className="bg-brand-page rounded p-2">
                      <div className="text-brand-muted">Movement</div>
                      <div className="font-medium text-brand-primary capitalize">
                        {block.content.movementType || 'teleport'}
                      </div>
                    </div>
                    <div className="bg-brand-page rounded p-2">
                      <div className="text-brand-muted">Duration</div>
                      <div className="font-medium text-brand-primary">
                        {block.content.durationMinutes || 10} min
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2 text-xs text-red-700">
                <Info className="w-4 h-4 shrink-0" />
                <p>
                  In the actual experience, learners will use a VR headset to interact with the 3D
                  environment. Ensure the environment URL is properly configured and
                  WebXR-compatible.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <p className="text-xs text-red-800">
          <strong>VR Simulation tip:</strong> Test your VR experience on the target headsets before
          deployment. Prioritize comfort settings to reduce motion sickness. Consider starting with
          teleport movement for new VR users.
        </p>
      </div>
    </div>
  );
};
