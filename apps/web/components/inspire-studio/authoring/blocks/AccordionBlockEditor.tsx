import { ChevronDown, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { AccordionBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface AccordionBlockEditorProps {
  block: AccordionBlock;
  onChange: (content: AccordionBlock['content']) => void;
}

export const AccordionBlockEditor = ({
  block,
  onChange,
}: AccordionBlockEditorProps): React.JSX.Element => {
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);

  const addItem = (): void => {
    onChange({
      ...block.content,
      items: [
        ...block.content.items,
        { id: `item_${Date.now()}`, title: '', content: '', isOpen: false },
      ],
    });
  };

  const removeItem = (id: string): void => {
    onChange({
      ...block.content,
      items: block.content.items.filter((item) => item.id !== id),
    });
  };

  const updateItem = (id: string, field: 'title' | 'content', value: string): void => {
    onChange({
      ...block.content,
      items: block.content.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    });
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={block.content.allowMultiple}
          onChange={(e) => onChange({ ...block.content, allowMultiple: e.target.checked })}
          className="w-4 h-4 text-brand-blue rounded"
        />
        <span className="text-sm font-medium text-brand-secondary">
          Allow multiple sections open
        </span>
      </label>
      <div className="space-y-3">
        <span className="block text-sm font-medium text-brand-secondary">Accordion Items</span>
        {block.content.items.map((item, index) => (
          <div key={item.id} className="border border-brand-strong rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-secondary">Item {index + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(item.id, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="Section title"
            />
            <textarea
              value={item.content}
              onChange={(e) => updateItem(item.id, 'content', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="Section content"
            />
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
      {block.content.items.length > 0 && block.content.items[0].title && (
        <div className="mt-4 p-4 bg-brand-page rounded-lg">
          <p className="text-xs font-medium text-brand-secondary mb-2">Preview:</p>
          <div className="space-y-2">
            {block.content.items.map((item) => (
              <div
                key={item.id}
                className="bg-brand-surface border border-brand-default rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedPreview(expandedPreview === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-brand-page"
                >
                  <span className="font-medium text-brand-primary">{item.title || 'Untitled'}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-brand-muted transition-transform ${
                      expandedPreview === item.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedPreview === item.id && (
                  <div className="px-3 pb-3 text-sm text-brand-secondary">{item.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
