import { Plus, X } from 'lucide-react';
import type { ListBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface ListBlockEditorProps {
  block: ListBlock;
  onChange: (content: ListBlock['content']) => void;
}

export const ListBlockEditor = ({ block, onChange }: ListBlockEditorProps): React.JSX.Element => {
  const addItem = (): void => {
    onChange({ ...block.content, items: [...block.content.items, ''] });
  };

  const removeItem = (index: number): void => {
    onChange({ ...block.content, items: block.content.items.filter((_, i) => i !== index) });
  };

  const updateItem = (index: number, value: string): void => {
    const newItems = [...block.content.items];
    newItems[index] = value;
    onChange({ ...block.content, items: newItems });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={block.content.ordered}
            onChange={(e) => onChange({ ...block.content, ordered: e.target.checked })}
            className="w-4 h-4 text-brand-blue rounded"
          />
          <span className="text-sm font-medium text-brand-secondary">Numbered List</span>
        </label>
        {block.content.ordered && (
          <select
            value={block.content.style || 'number'}
            onChange={(e) =>
              onChange({ ...block.content, style: e.target.value as 'number' | 'roman' | 'letter' })
            }
            className="px-3 py-1 border border-brand-strong rounded-lg text-sm focus:ring-2 focus:ring-brand-primary"
          >
            <option value="number">1, 2, 3</option>
            <option value="roman">I, II, III</option>
            <option value="letter">A, B, C</option>
          </select>
        )}
      </div>
      <div className="space-y-2">
        <span className="block text-sm font-medium text-brand-secondary">List Items</span>
        {block.content.items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder={`Item ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
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
      {block.content.items.length > 0 && block.content.items[0] && (
        <div className="mt-4 p-4 bg-brand-page rounded-lg">
          <p className="text-xs font-medium text-brand-secondary mb-2">Preview:</p>
          {block.content.ordered ? (
            <ol
              className={`list-inside space-y-1 ${
                block.content.style === 'roman'
                  ? 'list-roman'
                  : block.content.style === 'letter'
                    ? 'list-alpha'
                    : 'list-decimal'
              }`}
            >
              {block.content.items.map((item, i) => item && <li key={i}>{item}</li>)}
            </ol>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {block.content.items.map((item, i) => item && <li key={i}>{item}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
