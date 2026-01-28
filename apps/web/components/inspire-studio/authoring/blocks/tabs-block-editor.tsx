import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { TabsBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface TabsBlockEditorProps {
  block: TabsBlock;
  onChange: (content: TabsBlock['content']) => void;
}

export const TabsBlockEditor = ({ block, onChange }: TabsBlockEditorProps): React.JSX.Element => {
  const [activePreviewTab, setActivePreviewTab] = useState<string>(block.content.tabs[0]?.id || '');

  const addTab = (): void => {
    const newTab = { id: `tab_${Date.now()}`, title: '', content: '' };
    onChange({
      ...block.content,
      tabs: [...block.content.tabs, newTab],
      activeTab: block.content.activeTab || newTab.id,
    });
  };

  const removeTab = (id: string): void => {
    const newTabs = block.content.tabs.filter((tab) => tab.id !== id);
    onChange({
      ...block.content,
      tabs: newTabs,
      activeTab: newTabs[0]?.id || '',
    });
  };

  const updateTab = (id: string, field: 'title' | 'content', value: string): void => {
    onChange({
      ...block.content,
      tabs: block.content.tabs.map((tab) => (tab.id === id ? { ...tab, [field]: value } : tab)),
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        <span className="block text-sm font-medium text-brand-secondary">Tab Items</span>
        {block.content.tabs.map((tab, index) => (
          <div key={tab.id} className="border border-brand-strong rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-secondary">Tab {index + 1}</span>
              {block.content.tabs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTab(tab.id)}
                  className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={tab.title}
              onChange={(e) => updateTab(tab.id, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="Tab title"
            />
            <textarea
              value={tab.content}
              onChange={(e) => updateTab(tab.id, 'content', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="Tab content"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addTab}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Tab
        </button>
      </div>
      {block.content.tabs.length > 0 && block.content.tabs[0].title && (
        <div className="mt-4 p-4 bg-brand-page rounded-lg">
          <p className="text-xs font-medium text-brand-secondary mb-2">Preview:</p>
          <div className="bg-brand-surface rounded-lg border border-brand-default overflow-hidden">
            <div className="flex border-b border-brand-default">
              {block.content.tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activePreviewTab === tab.id
                      ? 'text-brand-blue border-b-2 border-brand-primary'
                      : 'text-brand-secondary hover:text-brand-primary'
                  }`}
                >
                  {tab.title || 'Untitled'}
                </button>
              ))}
            </div>
            <div className="p-4 text-sm text-brand-secondary">
              {block.content.tabs.find((tab) => tab.id === activePreviewTab)?.content ||
                'No content'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
