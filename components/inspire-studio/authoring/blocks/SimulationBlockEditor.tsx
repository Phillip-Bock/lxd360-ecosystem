import { Clock, Code, Eye, Link2, Play, Settings, Target, Zap } from 'lucide-react';
import { useState } from 'react';
import type {
  SimulationBlock,
  SimulationDifficulty,
} from '@/lib/inspire-studio/types/contentBlocks';

interface SimulationBlockEditorProps {
  block: SimulationBlock;
  onChange: (content: SimulationBlock['content']) => void;
}

export const SimulationBlockEditor = ({
  block,
  onChange,
}: SimulationBlockEditorProps): React.JSX.Element => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      {/* Simulation Title */}
      <div>
        <label
          htmlFor="simulation-title"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Play className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Simulation Title
        </label>
        <input
          id="simulation-title"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="e.g., Physics Lab Experiment, Business Strategy Simulator"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="simulation-description"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Description
        </label>
        <textarea
          id="simulation-description"
          value={block.content.description}
          onChange={(e) => onChange({ ...block.content, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Describe what learners will do in this simulation..."
        />
      </div>

      {/* Simulation Type */}
      <div>
        <label
          htmlFor="simulation-type"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Simulation Type
        </label>
        <select
          id="simulation-type"
          value={block.content.simulationType || 'custom'}
          onChange={(e) => onChange({ ...block.content, simulationType: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          <option value="custom">Custom Simulation</option>
          <option value="physics">⚛️ Physics Lab</option>
          <option value="chemistry">🧪 Chemistry Experiment</option>
          <option value="biology">🧬 Biology/Anatomy</option>
          <option value="engineering">⚙️ Engineering Design</option>
          <option value="business">💼 Business Strategy</option>
          <option value="finance">📊 Financial Analysis</option>
          <option value="medical">🏥 Medical Procedure</option>
          <option value="manufacturing">🏭 Manufacturing Process</option>
          <option value="coding">💻 Coding Environment</option>
          <option value="electronics">🔌 Electronics Circuit</option>
        </select>
      </div>

      {/* Simulation Source */}
      <div>
        <label
          htmlFor="simulation-url"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Link2 className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Simulation URL or Embed Code
        </label>
        <textarea
          id="simulation-url"
          value={block.content.url || ''}
          onChange={(e) => onChange({ ...block.content, url: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent font-mono text-sm"
          placeholder="https://simulation-platform.com/embed/... or <iframe>...</iframe>"
        />
        <p className="text-xs text-brand-muted mt-1">
          Paste a URL or iframe embed code for your simulation
        </p>
      </div>

      {/* Difficulty Level */}
      <fieldset>
        <legend className="block text-sm font-medium text-brand-secondary mb-2">
          <Zap className="w-4 h-4 inline mr-1" aria-hidden="true" />
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
              onClick={() =>
                onChange({ ...block.content, difficulty: level.value as SimulationDifficulty })
              }
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                (block.content.difficulty || 'beginner') === level.value
                  ? 'bg-brand-primary text-brand-primary border-brand-primary'
                  : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-blue-300'
              }`}
            >
              <div>{level.emoji}</div>
              <div className="text-xs">{level.label}</div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Learning Objectives */}
      <div>
        <label
          htmlFor="simulation-objectives"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Target className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Learning Objectives
        </label>
        <textarea
          id="simulation-objectives"
          value={block.content.objectives || ''}
          onChange={(e) => onChange({ ...block.content, objectives: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="What will learners be able to do after completing this simulation?"
        />
      </div>

      {/* Time Limit */}
      <div>
        <label
          htmlFor="simulation-time-limit"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Clock className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Time Limit (optional)
        </label>
        <div className="flex gap-2 items-center">
          <input
            id="simulation-time-limit"
            type="number"
            value={block.content.timeLimit || 0}
            onChange={(e) =>
              onChange({ ...block.content, timeLimit: parseInt(e.target.value, 10) || 0 })
            }
            min="0"
            className="w-32 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="0"
          />
          <span className="text-sm text-brand-secondary">minutes (0 = unlimited)</span>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="border-t border-brand-default pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-brand-secondary hover:text-brand-blue mb-3"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          Advanced Settings
          <span className="text-xs text-brand-muted">({showAdvanced ? 'hide' : 'show'})</span>
        </button>

        {showAdvanced && (
          <div className="space-y-4 pl-6">
            {/* Initial Configuration */}
            <div>
              <label
                htmlFor="simulation-config"
                className="block text-sm font-medium text-brand-secondary mb-2"
              >
                <Code className="w-4 h-4 inline mr-1" aria-hidden="true" />
                Initial Configuration (JSON)
              </label>
              <textarea
                id="simulation-config"
                value={block.content.config || ''}
                onChange={(e) => onChange({ ...block.content, config: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent font-mono text-xs"
                placeholder={`{\n  "initialTemperature": 25,\n  "gravity": 9.81,\n  "budget": 10000\n}`}
              />
              <p className="text-xs text-brand-muted mt-1">
                Set initial parameters for the simulation (JSON format)
              </p>
            </div>

            {/* Scoring Options */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={block.content.enableScoring || false}
                  onChange={(e) => onChange({ ...block.content, enableScoring: e.target.checked })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-primary"
                />
                <span className="text-sm text-brand-secondary">Enable scoring/assessment</span>
              </label>
            </div>

            {block.content.enableScoring && (
              <div className="pl-6 space-y-3">
                <div>
                  <label
                    htmlFor="simulation-passing-score"
                    className="block text-sm text-brand-secondary mb-1"
                  >
                    Passing Score (%)
                  </label>
                  <input
                    id="simulation-passing-score"
                    type="number"
                    value={block.content.passingScore || 70}
                    onChange={(e) =>
                      onChange({
                        ...block.content,
                        passingScore: parseInt(e.target.value, 10) || 70,
                      })
                    }
                    min="0"
                    max="100"
                    className="w-24 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="simulation-max-attempts"
                    className="block text-sm text-brand-secondary mb-1"
                  >
                    Max Attempts
                  </label>
                  <input
                    id="simulation-max-attempts"
                    type="number"
                    value={block.content.maxAttempts || 3}
                    onChange={(e) =>
                      onChange({ ...block.content, maxAttempts: parseInt(e.target.value, 10) || 3 })
                    }
                    min="1"
                    className="w-24 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={block.content.allowReset || true}
                  onChange={(e) => onChange({ ...block.content, allowReset: e.target.checked })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-primary"
                />
                <span className="text-sm text-brand-secondary">
                  Allow learners to reset simulation
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={block.content.showInstructions || true}
                  onChange={(e) =>
                    onChange({ ...block.content, showInstructions: e.target.checked })
                  }
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-primary"
                />
                <span className="text-sm text-brand-secondary">Show instructions panel</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={block.content.fullscreen || false}
                  onChange={(e) => onChange({ ...block.content, fullscreen: e.target.checked })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-primary"
                />
                <span className="text-sm text-brand-secondary">Allow fullscreen mode</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {block.content.url && (
        <div className="bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-purple-600" aria-hidden="true" />
            <span className="text-sm font-medium text-purple-900">Simulation Preview</span>
          </div>
          <div className="bg-brand-surface rounded-lg p-4 border border-brand-default">
            <p className="text-sm text-brand-secondary">
              <strong>Type:</strong> {block.content.simulationType || 'Custom'} |
              <strong> Difficulty:</strong> {block.content.difficulty || 'Beginner'}
              {block.content.timeLimit && block.content.timeLimit > 0 && (
                <>
                  {' '}
                  | <strong>Time Limit:</strong> {block.content.timeLimit} min
                </>
              )}
            </p>
            {block.content.url.includes('http') ? (
              <p className="text-xs text-brand-blue mt-2">
                📍 {block.content.url.substring(0, 60)}...
              </p>
            ) : (
              <p className="text-xs text-green-600 mt-2">✓ Embed code configured</p>
            )}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Simulation tip:</strong> Interactive simulations help learners practice skills in
          a safe environment. Popular platforms: PhET, Labster, Articulate, H5P, Unity WebGL
          exports.
        </p>
      </div>
    </div>
  );
};
