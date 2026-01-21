import { ArrowUpDown, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface RankOrderItem {
  id: number;
  title: string;
  description: string;
  mediaUrl: string;
}

interface RankOrderComplexContent {
  title?: string;
  items?: RankOrderItem[];
  [key: string]: unknown;
}

export const RankOrderComplexBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content || {}) as RankOrderComplexContent;
  const [title, setTitle] = useState(data.title || '');
  const [items, setItems] = useState<RankOrderItem[]>(data.items || []);

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <ArrowUpDown className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Rank Order (Complex)</h3>
          <span className="ml-auto px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
            Assessment
          </span>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
          <p className="font-medium mb-1">Rank multimedia items by priority</p>
          <p>Handles 5+ items with rich media content (images, videos, scenarios)</p>
        </div>
        <div>
          <label
            htmlFor="rank-order-exercise-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Exercise Title
          </label>
          <input
            id="rank-order-exercise-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({ ...props.block, content: { ...data, title: e.target.value } });
            }}
            placeholder="e.g., Prioritize Customer Service Issues"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="block text-sm font-medium text-brand-secondary">
              Items to Rank ({items.length})
            </span>
            <button
              type="button"
              onClick={() => {
                const newItem = { id: Date.now(), title: '', description: '', mediaUrl: '' };
                setItems([...items, newItem]);
                props.onUpdate({
                  ...props.block,
                  content: { ...data, items: [...items, newItem] },
                });
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded"
            >
              <Plus className="w-3 h-3" />
              Add Item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-brand-page border border-brand-default rounded-lg"
              >
                <div className="flex gap-2">
                  <span className="text-sm font-bold text-brand-muted">#{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="Item title"
                    className="flex-1 px-2 py-1 text-sm border border-brand-strong rounded"
                  />
                  <button type="button" className="p-1 text-brand-muted hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
