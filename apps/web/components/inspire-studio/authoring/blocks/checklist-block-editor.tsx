import { Plus, X } from 'lucide-react';
import type { ChecklistBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface ChecklistBlockEditorProps {
  block: ChecklistBlock;
  onChange: (content: ChecklistBlock['content']) => void;
}

export const ChecklistBlockEditor = ({
  block,
  onChange,
}: ChecklistBlockEditorProps): React.JSX.Element => {
  const addItem = (): void => {
    onChange({
      ...block.content,
      items: [...block.content.items, { id: `item_${Date.now()}`, text: '', checked: false }],
    });
  };

  const removeItem = (id: string): void => {
    onChange({
      ...block.content,
      items: block.content.items.filter((item) => item.id !== id),
    });
  };

  const updateItem = (id: string, text: string): void => {
    onChange({
      ...block.content,
      items: block.content.items.map((item) => (item.id === id ? { ...item, text } : item)),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          className="block text-sm font-medium text-brand-secondary mb-1"
          htmlFor="checklist-title"
        >
          Checklist Title
        </label>
        <input
          id="checklist-title"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Enter checklist title..."
        />
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={block.content.showProgress}
          onChange={(e) => onChange({ ...block.content, showProgress: e.target.checked })}
          className="w-4 h-4 text-brand-blue rounded"
        />
        <span className="text-sm font-medium text-brand-secondary">Show progress indicator</span>
      </label>
      <div className="space-y-2">
        <span className="block text-sm font-medium text-brand-secondary">Checklist Items</span>
        {block.content.items.map((item) => (
          <div key={item.id} className="flex gap-2">
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(item.id, e.target.value)}
              className="flex-1 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="Item text"
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>
      {block.content.title && block.content.items.length > 0 && (
        <div className="mt-4 p-4 bg-brand-page rounded-lg">
          <p className="text-xs font-medium text-brand-secondary mb-2">Preview:</p>
          <div className="bg-brand-surface border border-brand-default rounded-lg p-4">
            <h3 className="font-semibold text-brand-primary mb-3">{block.content.title}</h3>
            <div className="space-y-2">
              {block.content.items.map((item) => (
                <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-brand-blue rounded" readOnly />
                  <span className="text-brand-secondary">{item.text || 'Untitled item'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
