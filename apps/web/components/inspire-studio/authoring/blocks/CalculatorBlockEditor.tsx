import { Plus, X } from 'lucide-react';
import type { CalculatorBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface CalculatorBlockEditorProps {
  block: CalculatorBlock;
  onChange: (content: CalculatorBlock['content']) => void;
}

export const CalculatorBlockEditor = ({
  block,
  onChange,
}: CalculatorBlockEditorProps): React.JSX.Element => {
  const addVariable = (): void => {
    onChange({
      ...block.content,
      variables: [
        ...(block.content.variables || []),
        { id: `var_${Date.now()}`, name: '', label: '', defaultValue: 0 },
      ],
    });
  };

  const removeVariable = (id: string): void => {
    onChange({
      ...block.content,
      variables: block.content.variables?.filter((v) => v.id !== id),
    });
  };

  const updateVariable = (id: string, field: string, value: unknown): void => {
    onChange({
      ...block.content,
      variables: block.content.variables?.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="calculator-title"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Calculator Title
        </label>
        <input
          id="calculator-title"
          type="text"
          value={block.content.title || ''}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Simple Calculator"
        />
      </div>
      <div>
        <label
          htmlFor="calculator-description"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Description
        </label>
        <textarea
          id="calculator-description"
          value={block.content.description || ''}
          onChange={(e) => onChange({ ...block.content, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Calculator description..."
        />
      </div>
      <div>
        <label
          htmlFor="calculator-formula"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Formula
        </label>
        <input
          id="calculator-formula"
          type="text"
          value={block.content.formula || ''}
          onChange={(e) => onChange({ ...block.content, formula: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="e.g., x + y * z"
        />
      </div>
      <div className="space-y-2">
        <span className="block text-sm font-medium text-brand-secondary">Variables</span>
        {block.content.variables?.map((variable) => (
          <div key={variable.id} className="border border-brand-strong rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-brand-secondary">Variable</span>
              <button
                type="button"
                onClick={() => removeVariable(variable.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={variable.name}
                onChange={(e) => updateVariable(variable.id, 'name', e.target.value)}
                className="px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                placeholder="Name (x)"
              />
              <input
                type="text"
                value={variable.label}
                onChange={(e) => updateVariable(variable.id, 'label', e.target.value)}
                className="px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                placeholder="Label"
              />
              <input
                type="number"
                value={variable.defaultValue}
                onChange={(e) =>
                  updateVariable(variable.id, 'defaultValue', parseFloat(e.target.value) || 0)
                }
                className="px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                placeholder="Default"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addVariable}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Variable
        </button>
      </div>
    </div>
  );
};
