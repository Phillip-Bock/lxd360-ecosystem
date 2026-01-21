import { Download, Eye, Maximize2, Save, StickyNote } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface NotebookConfig {
  title: string;
  placement: 'sidebar' | 'inline' | 'floating';
  defaultOpen: boolean;
  allowExport: boolean;
  exportFormat: 'txt' | 'pdf' | 'docx';
  placeholder: string;
  maxCharacters: number;
  autoSave: boolean;
}

type NotebookData = NotebookConfig;

export const LearnerNotebookBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as unknown as NotebookData) || {};
  const [config, setConfig] = useState<NotebookConfig>({
    title: data.title || 'My Learning Notes',
    placement: data.placement || 'sidebar',
    defaultOpen: data.defaultOpen ?? false,
    allowExport: data.allowExport ?? true,
    exportFormat: data.exportFormat || 'pdf',
    placeholder: data.placeholder || 'Take notes as you learn...',
    maxCharacters: data.maxCharacters || 10000,
    autoSave: data.autoSave ?? true,
  });

  const handleChange = (updates: Partial<NotebookConfig>): void => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    props.onUpdate({ ...props.block, content: updated as Record<string, unknown> });
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="notebook-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Notebook Title
          </label>
          <input
            id="notebook-title"
            type="text"
            value={config.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="My Learning Notes"
          />
        </div>

        {/* Placement */}
        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-2">
            Notebook Placement
          </legend>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleChange({ placement: 'sidebar' })}
              className={`p-4 border-2 rounded-lg transition-all text-center ${
                config.placement === 'sidebar'
                  ? 'border-yellow-600 bg-yellow-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-current rounded">
                <div className="h-full w-3 bg-current opacity-20"></div>
              </div>
              <div className="font-medium text-sm">Sidebar</div>
              <div className="text-xs text-brand-muted">Fixed side panel</div>
            </button>
            <button
              type="button"
              onClick={() => handleChange({ placement: 'inline' })}
              className={`p-4 border-2 rounded-lg transition-all text-center ${
                config.placement === 'inline'
                  ? 'border-yellow-600 bg-yellow-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-current rounded flex items-center justify-center">
                <div className="w-4 h-1 bg-current"></div>
              </div>
              <div className="font-medium text-sm">Inline</div>
              <div className="text-xs text-brand-muted">Within content</div>
            </button>
            <button
              type="button"
              onClick={() => handleChange({ placement: 'floating' })}
              className={`p-4 border-2 rounded-lg transition-all text-center ${
                config.placement === 'floating'
                  ? 'border-yellow-600 bg-yellow-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <Maximize2 className="w-8 h-8 mx-auto mb-2" />
              <div className="font-medium text-sm">Floating</div>
              <div className="text-xs text-brand-muted">Draggable panel</div>
            </button>
          </div>
        </fieldset>

        {/* Behavior Options */}
        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-3">
            Behavior Options
          </legend>
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.defaultOpen}
                onChange={(e) => handleChange({ defaultOpen: e.target.checked })}
                className="mt-1 text-yellow-600 focus:ring-yellow-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <Eye className="w-4 h-4 text-yellow-600" />
                  Open by Default
                </div>
                <div className="text-sm text-brand-muted">
                  Show notebook immediately when learner enters course
                </div>
              </div>
            </label>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.autoSave}
                onChange={(e) => handleChange({ autoSave: e.target.checked })}
                className="mt-1 text-yellow-600 focus:ring-yellow-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <Save className="w-4 h-4 text-yellow-600" />
                  Auto-Save Notes
                </div>
                <div className="text-sm text-brand-muted">
                  Automatically save notes as learner types
                </div>
              </div>
            </label>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.allowExport}
                onChange={(e) => handleChange({ allowExport: e.target.checked })}
                className="mt-1 text-yellow-600 focus:ring-yellow-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <Download className="w-4 h-4 text-yellow-600" />
                  Allow Export
                </div>
                <div className="text-sm text-brand-muted">
                  Let learners download their notes at course completion
                </div>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Export Format (conditional) */}
        {config.allowExport && (
          <fieldset>
            <legend className="block text-sm font-medium text-brand-secondary mb-2">
              Export Format
            </legend>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleChange({ exportFormat: 'txt' })}
                className={`p-3 border-2 rounded-lg transition-all ${
                  config.exportFormat === 'txt'
                    ? 'border-yellow-600 bg-yellow-50'
                    : 'border-brand-default hover:border-brand-strong'
                }`}
              >
                <div className="font-medium">TXT</div>
                <div className="text-xs text-brand-muted">Plain Text</div>
              </button>
              <button
                type="button"
                onClick={() => handleChange({ exportFormat: 'pdf' })}
                className={`p-3 border-2 rounded-lg transition-all ${
                  config.exportFormat === 'pdf'
                    ? 'border-yellow-600 bg-yellow-50'
                    : 'border-brand-default hover:border-brand-strong'
                }`}
              >
                <div className="font-medium">PDF</div>
                <div className="text-xs text-brand-muted">Portable Doc</div>
              </button>
              <button
                type="button"
                onClick={() => handleChange({ exportFormat: 'docx' })}
                className={`p-3 border-2 rounded-lg transition-all ${
                  config.exportFormat === 'docx'
                    ? 'border-yellow-600 bg-yellow-50'
                    : 'border-brand-default hover:border-brand-strong'
                }`}
              >
                <div className="font-medium">DOCX</div>
                <div className="text-xs text-brand-muted">MS Word</div>
              </button>
            </div>
          </fieldset>
        )}

        {/* Placeholder Text */}
        <div>
          <label
            htmlFor="notebook-placeholder"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Placeholder Text
          </label>
          <input
            id="notebook-placeholder"
            type="text"
            value={config.placeholder}
            onChange={(e) => handleChange({ placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Take notes as you learn..."
          />
        </div>

        {/* Max Characters */}
        <div>
          <label
            htmlFor="notebook-max-characters"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Maximum Characters: {config.maxCharacters.toLocaleString()}
          </label>
          <input
            id="notebook-max-characters"
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={config.maxCharacters}
            onChange={(e) => handleChange({ maxCharacters: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
          />
          <div className="flex justify-between text-xs text-brand-muted mt-1">
            <span>1K</span>
            <span>25K</span>
            <span>50K</span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <StickyNote className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-brand-secondary">
              <p className="font-medium text-yellow-900 mb-1">Privacy Notice</p>
              <p>
                Learner notes are private and only visible to the individual learner. Notes persist
                across sessions and can be accessed anytime during the course.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
