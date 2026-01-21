import { CheckCircle, Download, Target, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import type { PersonalizedActionPlanBlock } from '@/lib/inspire-studio/types/contentBlocks';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

export const PersonalizedActionPlanBlockEditor = (
  props: BaseBlockEditorProps,
): React.JSX.Element => {
  const block = props.block as PersonalizedActionPlanBlock;
  const data = block?.content || {};
  const [config, setConfig] = useState<PersonalizedActionPlanBlock['content']>({
    title: data.title || 'Your Personalized Action Plan',
    analysisMethod: data.analysisMethod || 'automatic',
    passingThreshold: data.passingThreshold || 70,
    includeRemediation: data.includeRemediation ?? true,
    includeStrengths: data.includeStrengths ?? true,
    downloadFormat: data.downloadFormat || 'pdf',
  });

  const handleChange = (updatedConfig: PersonalizedActionPlanBlock['content']): void => {
    setConfig(updatedConfig);
    props.onUpdate({
      ...block,
      content: updatedConfig,
    } as PersonalizedActionPlanBlock);
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="action-plan-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Action Plan Title
          </label>
          <input
            id="action-plan-title"
            type="text"
            value={config.title}
            onChange={(e) => handleChange({ ...config, title: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Your Personalized Action Plan"
          />
        </div>

        {/* Analysis Method */}
        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-2">
            Analysis Method
          </legend>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 p-3 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
              <input
                type="radio"
                name="analysisMethod"
                checked={config.analysisMethod === 'automatic'}
                onChange={() => handleChange({ ...config, analysisMethod: 'automatic' })}
                className="text-orange-600 focus:ring-orange-500"
              />
              <div>
                <div className="font-medium text-brand-primary">Automatic Analysis</div>
                <div className="text-sm text-brand-muted">
                  Automatically analyze all quiz results in the course
                </div>
              </div>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
              <input
                type="radio"
                name="analysisMethod"
                checked={config.analysisMethod === 'manual'}
                onChange={() => handleChange({ ...config, analysisMethod: 'manual' })}
                className="text-orange-600 focus:ring-orange-500"
              />
              <div>
                <div className="font-medium text-brand-primary">Manual Selection</div>
                <div className="text-sm text-brand-muted">
                  Allow learners to select specific areas for remediation
                </div>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Passing Threshold */}
        <div>
          <label
            htmlFor="passing-threshold"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Passing Threshold: {config.passingThreshold}%
          </label>
          <input
            id="passing-threshold"
            type="range"
            min="0"
            max="100"
            value={config.passingThreshold}
            onChange={(e) =>
              handleChange({ ...config, passingThreshold: parseInt(e.target.value, 10) })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <div className="flex justify-between text-xs text-brand-muted mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="text-sm text-brand-secondary mt-2">
            Topics scored below this threshold will be flagged for remediation
          </p>
        </div>

        {/* Content Options */}
        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-3">
            Content Options
          </legend>
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.includeRemediation}
                onChange={(e) => handleChange({ ...config, includeRemediation: e.target.checked })}
                className="mt-1 text-orange-600 focus:ring-orange-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-brand-error" aria-hidden="true" />
                  Include Weak Areas & Remediation
                </div>
                <div className="text-sm text-brand-muted">
                  Show topics needing improvement with recommended actions
                </div>
              </div>
            </label>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.includeStrengths}
                onChange={(e) => handleChange({ ...config, includeStrengths: e.target.checked })}
                className="mt-1 text-orange-600 focus:ring-orange-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-success" aria-hidden="true" />
                  Include Strengths & Achievements
                </div>
                <div className="text-sm text-brand-muted">
                  Highlight topics where learner performed well
                </div>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Download Format */}
        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-2">
            Download Format
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={config.downloadFormat === 'pdf'}
              onClick={() => handleChange({ ...config, downloadFormat: 'pdf' })}
              className={`p-4 border-2 rounded-lg transition-all ${
                config.downloadFormat === 'pdf'
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <Download className="w-6 h-6 mx-auto mb-2 text-orange-600" aria-hidden="true" />
              <div className="font-medium">PDF</div>
              <div className="text-xs text-brand-muted">Portable Document</div>
            </button>
            <button
              type="button"
              aria-pressed={config.downloadFormat === 'docx'}
              onClick={() => handleChange({ ...config, downloadFormat: 'docx' })}
              className={`p-4 border-2 rounded-lg transition-all ${
                config.downloadFormat === 'docx'
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <Download className="w-6 h-6 mx-auto mb-2 text-orange-600" aria-hidden="true" />
              <div className="font-medium">DOCX</div>
              <div className="text-xs text-brand-muted">Editable Document</div>
            </button>
          </div>
        </fieldset>

        {/* Preview Info */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-brand-secondary">
              <p className="font-medium text-orange-900 mb-1">Placement Recommendation</p>
              <p>
                This block works best when placed at the end of your course, after all assessments.
                It will automatically analyze learner performance and generate a personalized action
                plan highlighting areas for improvement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
