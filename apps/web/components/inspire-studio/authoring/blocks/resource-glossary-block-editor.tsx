import { BookMarked, Filter, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GlossaryConfig {
  title: string;
  autoScan: boolean;
  scanKeywords: string[];
  allowManualEntry: boolean;
  showAlphabetically: boolean;
  enableSearch: boolean;
  enableFilter: boolean;
  manualTerms: GlossaryTerm[];
  [key: string]: unknown;
}

export const ResourceGlossaryBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const blockContent = (props.block?.content as unknown as Partial<GlossaryConfig>) || {};

  const [config, setConfig] = useState<GlossaryConfig>({
    title: blockContent.title || 'Course Glossary',
    autoScan: blockContent.autoScan ?? true,
    scanKeywords: blockContent.scanKeywords || [],
    allowManualEntry: blockContent.allowManualEntry ?? true,
    showAlphabetically: blockContent.showAlphabetically ?? true,
    enableSearch: blockContent.enableSearch ?? true,
    enableFilter: blockContent.enableFilter ?? true,
    manualTerms: blockContent.manualTerms || [],
  });

  const [newTerm, setNewTerm] = useState({ term: '', definition: '' });

  useEffect(() => {
    const blockContent = (props.block?.content as unknown as Partial<GlossaryConfig>) || {};
    setConfig({
      title: blockContent.title || 'Course Glossary',
      autoScan: blockContent.autoScan ?? true,
      scanKeywords: blockContent.scanKeywords || [],
      allowManualEntry: blockContent.allowManualEntry ?? true,
      showAlphabetically: blockContent.showAlphabetically ?? true,
      enableSearch: blockContent.enableSearch ?? true,
      enableFilter: blockContent.enableFilter ?? true,
      manualTerms: blockContent.manualTerms || [],
    });
  }, [props.block]);

  const handleAddTerm = (): void => {
    if (newTerm.term && newTerm.definition) {
      const updatedConfig = {
        ...config,
        manualTerms: [...config.manualTerms, newTerm],
      };
      setConfig(updatedConfig);
      setNewTerm({ term: '', definition: '' });
      props.onUpdate({
        ...props.block,
        content: updatedConfig as Record<string, unknown>,
      });
    }
  };

  const handleRemoveTerm = (index: number): void => {
    const updatedConfig = {
      ...config,
      manualTerms: config.manualTerms.filter((_, i) => i !== index),
    };
    setConfig(updatedConfig);
    props.onUpdate({
      ...props.block,
      content: updatedConfig as Record<string, unknown>,
    });
  };

  const handleConfigChange = (updatedConfig: GlossaryConfig): void => {
    setConfig(updatedConfig);
    props.onUpdate({
      ...props.block,
      content: updatedConfig as Record<string, unknown>,
    });
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-brand-primary">Resource/Glossary</h3>
            <p className="text-sm text-brand-muted">
              Automatically scans course content to create a searchable glossary of defined terms
            </p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="glossary-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Glossary Title
          </label>
          <input
            id="glossary-title"
            type="text"
            value={config.title}
            onChange={(e) => handleConfigChange({ ...config, title: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Course Glossary"
          />
        </div>

        {/* Auto-Scan Options */}
        <div>
          <span className="block text-sm font-medium text-brand-secondary mb-3">
            Content Scanning
          </span>
          <label className="flex items-start space-x-3 p-3 border border-brand-default rounded-lg">
            <input
              type="checkbox"
              checked={config.autoScan}
              onChange={(e) => handleConfigChange({ ...config, autoScan: e.target.checked })}
              className="mt-1 text-teal-600 focus:ring-teal-500 rounded"
            />
            <div>
              <div className="font-medium text-brand-primary flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-teal-600" />
                Automatically Scan Course Content
              </div>
              <div className="text-sm text-brand-muted">
                Scan all course blocks to automatically identify and extract defined terms
              </div>
            </div>
          </label>
        </div>

        {/* Display Options */}
        <div>
          <span className="block text-sm font-medium text-brand-secondary mb-3">
            Display Options
          </span>
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.showAlphabetically}
                onChange={(e) =>
                  handleConfigChange({ ...config, showAlphabetically: e.target.checked })
                }
                className="mt-1 text-teal-600 focus:ring-teal-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary">Sort Alphabetically</div>
                <div className="text-sm text-brand-muted">Display terms in A-Z order</div>
              </div>
            </label>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.enableSearch}
                onChange={(e) => handleConfigChange({ ...config, enableSearch: e.target.checked })}
                className="mt-1 text-teal-600 focus:ring-teal-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <Search className="w-4 h-4 text-teal-600" />
                  Enable Search
                </div>
                <div className="text-sm text-brand-muted">
                  Allow learners to search for specific terms
                </div>
              </div>
            </label>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.enableFilter}
                onChange={(e) => handleConfigChange({ ...config, enableFilter: e.target.checked })}
                className="mt-1 text-teal-600 focus:ring-teal-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <Filter className="w-4 h-4 text-teal-600" />
                  Enable Filtering
                </div>
                <div className="text-sm text-brand-muted">
                  Allow filtering by letter or category
                </div>
              </div>
            </label>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.allowManualEntry}
                onChange={(e) =>
                  handleConfigChange({ ...config, allowManualEntry: e.target.checked })
                }
                className="mt-1 text-teal-600 focus:ring-teal-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary">Allow Manual Term Entry</div>
                <div className="text-sm text-brand-muted">
                  Add terms that may not be auto-detected
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Manual Terms */}
        {config.allowManualEntry && (
          <div>
            <span className="block text-sm font-medium text-brand-secondary mb-3">
              Manual Terms
            </span>

            {/* Add New Term */}
            <div className="border border-brand-default rounded-lg p-4 mb-3">
              <div className="space-y-3">
                <label htmlFor="new-term-input" className="sr-only">
                  Term
                </label>
                <input
                  id="new-term-input"
                  type="text"
                  value={newTerm.term}
                  onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Term"
                />
                <label htmlFor="new-term-definition" className="sr-only">
                  Definition
                </label>
                <textarea
                  id="new-term-definition"
                  value={newTerm.definition}
                  onChange={(e) => setNewTerm({ ...newTerm, definition: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Definition"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={handleAddTerm}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-brand-primary rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Term
                </button>
              </div>
            </div>

            {/* Existing Terms */}
            {config.manualTerms.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {config.manualTerms.map((term, index) => (
                  <div
                    key={index}
                    className="border border-brand-default rounded-lg p-3 bg-brand-page"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-brand-primary">{term.term}</div>
                        <div className="text-sm text-brand-secondary mt-1">{term.definition}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTerm(index)}
                        className="text-red-600 hover:text-red-700 p-1"
                        aria-label={`Remove term: ${term.term}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <BookMarked className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-sm text-brand-secondary">
              <p className="font-medium text-teal-900 mb-1">How Auto-Scanning Works</p>
              <p>
                The system scans all text blocks in your course looking for bold or italicized terms
                followed by definitions. You can also manually add important terms to ensure
                comprehensive coverage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
