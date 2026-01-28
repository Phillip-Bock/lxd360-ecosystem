'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Edit3, GripVertical, Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { safeInnerHtml } from '@/lib/sanitize';
import type { TabPanel, TabsBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

const TAB_STYLES = [
  { value: 'underline', label: 'Underline' },
  { value: 'pills', label: 'Pills' },
  { value: 'boxed', label: 'Boxed' },
  { value: 'vertical', label: 'Vertical' },
];

/**
 * TabsBlock - Tabbed content panels
 */
export function TabsBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<TabsBlockContent>): React.JSX.Element {
  const content = block.content as TabsBlockContent;
  const [activeTab, setActiveTab] = useState(content.defaultTab || content.tabs?.[0]?.id || '');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);

  // Default values - wrapped in useMemo to maintain stable references
  const tabs = useMemo(() => content.tabs || [], [content.tabs]);
  const style = content.style || 'underline';
  const alignment = content.alignment || 'left';

  // Add new tab
  const addTab = useCallback(() => {
    const newTab: TabPanel = {
      id: `tab-${Date.now()}`,
      label: `Tab ${tabs.length + 1}`,
      content: '',
    };
    onUpdate({
      content: {
        ...content,
        tabs: [...tabs, newTab],
      },
    });
    setActiveTab(newTab.id);
    setEditingTabId(newTab.id);
  }, [content, tabs, onUpdate]);

  // Update tab
  const updateTab = useCallback(
    (tabId: string, updates: Partial<TabPanel>) => {
      onUpdate({
        content: {
          ...content,
          tabs: tabs.map((t: TabPanel) => (t.id === tabId ? { ...t, ...updates } : t)),
        },
      });
    },
    [content, tabs, onUpdate],
  );

  // Delete tab
  const deleteTab = useCallback(
    (tabId: string) => {
      const newTabs = tabs.filter((t: TabPanel) => t.id !== tabId);
      onUpdate({
        content: {
          ...content,
          tabs: newTabs,
        },
      });
      if (activeTab === tabId && newTabs.length > 0) {
        setActiveTab(newTabs[0].id);
      }
    },
    [content, tabs, activeTab, onUpdate],
  );

  // Get active tab content
  const activeTabData = tabs.find((t: TabPanel) => t.id === activeTab);

  // Tab list classes based on style and alignment
  const getTabListClasses = (): string => {
    const base = 'flex';
    const alignClasses: Record<string, string> = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      stretch: 'justify-stretch',
    };

    if (style === 'vertical') {
      return `${base} flex-col gap-1 w-48 shrink-0`;
    }

    return `${base} gap-1 ${alignClasses[alignment] || 'justify-start'} ${style === 'boxed' ? 'p-1 bg-studio-bg rounded-lg' : ''}`;
  };

  // Individual tab classes
  const getTabClasses = (isActive: boolean) => {
    const base = 'px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap';

    switch (style) {
      case 'pills':
        return `${base} rounded-lg ${
          isActive
            ? 'bg-studio-accent text-brand-primary'
            : 'text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/30'
        }`;
      case 'boxed':
        return `${base} rounded-md ${
          isActive
            ? 'bg-studio-surface text-brand-primary shadow'
            : 'text-studio-text-muted hover:text-brand-primary'
        }`;
      case 'vertical':
        return `${base} rounded-lg text-left ${
          isActive
            ? 'bg-studio-accent/10 text-studio-accent border-l-2 border-studio-accent'
            : 'text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/20 border-l-2 border-transparent'
        }`;
      default: // underline
        return `${base} border-b-2 -mb-px ${
          isActive
            ? 'border-studio-accent text-brand-primary'
            : 'border-transparent text-studio-text-muted hover:text-brand-primary hover:border-studio-surface'
        }`;
    }
  };

  // Preview mode
  if (!isEditing) {
    if (tabs.length === 0) {
      return (
        <div className="p-4 text-center text-studio-text-muted border border-dashed border-studio-surface/50 rounded-lg">
          No tabs added
        </div>
      );
    }

    return (
      <div className={style === 'vertical' ? 'flex gap-4' : ''}>
        {/* Tab navigation */}
        <div className={`${style === 'underline' ? 'border-b border-studio-surface/50' : ''}`}>
          <div className={getTabListClasses()}>
            {tabs.map((tab: TabPanel) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={getTabClasses(activeTab === tab.id)}
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className={`flex-1 ${style === 'vertical' ? '' : 'mt-4'}`}>
          <AnimatePresence mode="wait">
            {activeTabData && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTabData.content ? (
                  <div
                    className="prose prose-invert prose-sm max-w-none text-studio-text"
                    {...safeInnerHtml(activeTabData.content, 'rich')}
                  />
                ) : (
                  <p className="text-studio-text-muted text-sm">No content in this tab</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      {/* Settings bar */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Style */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-studio-text-muted">Style:</span>
          <select
            value={typeof style === 'string' ? style : 'underline'}
            onChange={(e) =>
              onUpdate({ content: { ...content, style: e.target.value } as TabsBlockContent })
            }
            className="px-2 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          >
            {TAB_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Alignment (not for vertical) */}
        {style !== 'vertical' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-studio-text-muted">Align:</span>
            <select
              value={alignment}
              onChange={(e) =>
                onUpdate({
                  content: {
                    ...content,
                    alignment: e.target.value as 'start' | 'center' | 'end' | 'stretch',
                  },
                })
              }
              className="px-2 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
            >
              <option value="start">Start</option>
              <option value="center">Center</option>
              <option value="end">End</option>
              <option value="stretch">Stretch</option>
            </select>
          </div>
        )}

        {/* Add tab */}
        <button
          type="button"
          onClick={addTab}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-studio-accent hover:text-studio-accent-hover transition-colors ml-auto"
        >
          <Plus className="w-4 h-4" />
          Add Tab
        </button>
      </div>

      {/* Tab editor */}
      <div className={style === 'vertical' ? 'flex gap-4' : ''}>
        {/* Tab list with edit controls */}
        <div className={`${style === 'underline' ? 'border-b border-studio-surface/50' : ''}`}>
          {tabs.length === 0 ? (
            <button
              type="button"
              className="w-full p-8 text-center border-2 border-dashed border-studio-surface/50 rounded-lg cursor-pointer hover:border-studio-accent/50 transition-colors"
              onClick={addTab}
            >
              <Plus className="w-8 h-8 text-studio-text-muted mx-auto mb-2" />
              <p className="text-studio-text-muted">Add your first tab</p>
            </button>
          ) : (
            <div className={getTabListClasses()}>
              {tabs.map((tab: TabPanel) => (
                <div
                  key={tab.id}
                  className={`group relative flex items-center ${style === 'vertical' ? 'w-full' : ''}`}
                >
                  {/* Tab button - click to select, double-click to edit label */}
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    onDoubleClick={() => setEditingTabId(tab.id)}
                    className={`${getTabClasses(activeTab === tab.id)} flex-1 flex items-center gap-2`}
                  >
                    {/* Drag handle */}
                    <GripVertical className="w-3 h-3 text-studio-text-muted opacity-0 group-hover:opacity-100 cursor-grab" />

                    {/* Tab label input */}
                    {editingTabId === tab.id ? (
                      <input
                        type="text"
                        value={tab.label}
                        onChange={(e) => updateTab(tab.id, { label: e.target.value })}
                        onBlur={() => setEditingTabId(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingTabId(null)}
                        className="bg-transparent outline-hidden w-20"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span>{tab.label}</span>
                    )}
                  </button>

                  {/* Delete button - placed outside the tab button for valid HTML */}
                  {tabs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteTab(tab.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-studio-text-muted hover:text-brand-error transition-all"
                      title="Delete tab"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content editor */}
        {activeTabData && (
          <div className={`flex-1 ${style === 'vertical' ? '' : 'mt-4'}`}>
            <div className="bg-studio-bg rounded-lg border border-studio-surface/30 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-studio-surface/30 bg-studio-bg-dark">
                <span className="text-sm text-studio-text-muted">
                  Content for: <span className="text-brand-primary">{activeTabData.label}</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setEditingTabId(editingTabId === activeTabData.id ? null : activeTabData.id)
                  }
                  className={`p-1 rounded transition-colors ${editingTabId === activeTabData.id ? 'text-studio-accent' : 'text-studio-text-muted hover:text-brand-primary'}`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                {editingTabId === activeTabData.id ? (
                  <textarea
                    value={activeTabData.content || ''}
                    onChange={(e) => updateTab(activeTabData.id, { content: e.target.value })}
                    className="w-full min-h-[150px] px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm resize-y outline-hidden focus:border-studio-accent/50"
                    placeholder="Enter tab content (HTML supported)..."
                  />
                ) : (
                  <div
                    className="prose prose-invert prose-sm max-w-none text-studio-text min-h-[80px]"
                    {...safeInnerHtml(
                      activeTabData.content ||
                        '<em class="text-studio-text-muted">Use the edit button above to add content...</em>',
                      'rich',
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TabsBlock;
