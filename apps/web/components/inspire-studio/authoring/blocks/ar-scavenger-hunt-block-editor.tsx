import { Plus, Search, Timer, Trash2, Trophy } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface HuntItem {
  id: string;
  name: string;
  description: string;
  targetType: 'qr_code' | 'image' | 'object' | 'location';
  points: number;
}

interface ARScavengerHuntData {
  title?: string;
  description?: string;
  timeLimitMinutes?: number;
  huntItems?: HuntItem[];
}

export const ARScavengerHuntBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as unknown as ARScavengerHuntData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(data.timeLimitMinutes || 30);
  const [huntItems, setHuntItems] = useState<HuntItem[]>(data.huntItems || []);

  const addItem = (): void => {
    const newItem: HuntItem = {
      id: `item_${Date.now()}`,
      name: '',
      description: '',
      targetType: 'qr_code',
      points: 10,
    };
    const updated = [...huntItems, newItem];
    setHuntItems(updated);
    props.onUpdate({
      ...props.block,
      content: { ...data, huntItems: updated } as Record<string, unknown>,
    });
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">AR Scavenger Hunt</h3>
          <span className="ml-auto px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
            AR
          </span>
        </div>

        <div>
          <label
            htmlFor="hunt-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Hunt Title
          </label>
          <input
            id="hunt-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Campus Safety Equipment Hunt"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label
              htmlFor="time-limit"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Time Limit (minutes)
            </label>
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-brand-muted" />
              <input
                id="time-limit"
                type="number"
                value={timeLimitMinutes}
                onChange={(e) => {
                  setTimeLimitMinutes(parseInt(e.target.value, 10));
                  props.onUpdate({
                    ...props.block,
                    content: { ...data, timeLimitMinutes: parseInt(e.target.value, 10) } as Record<
                      string,
                      unknown
                    >,
                  });
                }}
                className="flex-1 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex-1">
            <label
              htmlFor="total-points"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Total Points
            </label>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-brand-muted" />
              <input
                id="total-points"
                type="text"
                value={huntItems.reduce((sum, item) => sum + item.points, 0)}
                disabled
                className="flex-1 px-3 py-2 border border-brand-strong rounded-lg bg-brand-page"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="block text-sm font-medium text-brand-secondary">
              Hunt Items ({huntItems.length})
            </span>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
          <div className="space-y-2">
            {huntItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-brand-page border border-brand-default rounded-lg"
              >
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...huntItems];
                      updated[idx].name = e.target.value;
                      setHuntItems(updated);
                      props.onUpdate({
                        ...props.block,
                        content: { ...data, huntItems: updated } as Record<string, unknown>,
                      });
                    }}
                    placeholder="Item name"
                    className="flex-1 px-2 py-1 text-sm border border-brand-strong rounded"
                  />
                  <input
                    type="number"
                    value={item.points}
                    onChange={(e) => {
                      const updated = [...huntItems];
                      updated[idx].points = parseInt(e.target.value, 10);
                      setHuntItems(updated);
                      props.onUpdate({
                        ...props.block,
                        content: { ...data, huntItems: updated } as Record<string, unknown>,
                      });
                    }}
                    placeholder="Points"
                    className="w-20 px-2 py-1 text-sm border border-brand-strong rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = huntItems.filter((_, i) => i !== idx);
                      setHuntItems(updated);
                      props.onUpdate({
                        ...props.block,
                        content: { ...data, huntItems: updated } as Record<string, unknown>,
                      });
                    }}
                    className="p-1 text-brand-muted hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <select
                  value={item.targetType}
                  onChange={(e) => {
                    const updated = [...huntItems];
                    updated[idx].targetType = e.target.value as
                      | 'qr_code'
                      | 'image'
                      | 'object'
                      | 'location';
                    setHuntItems(updated);
                    props.onUpdate({
                      ...props.block,
                      content: { ...data, huntItems: updated } as Record<string, unknown>,
                    });
                  }}
                  className="w-full text-xs px-2 py-1 border border-brand-strong rounded"
                >
                  <option value="qr_code">QR Code</option>
                  <option value="image">Image Target</option>
                  <option value="object">3D Object</option>
                  <option value="location">GPS Location</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
