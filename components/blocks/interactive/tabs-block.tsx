'use client';

/**
 * TabsBlock - Tabbed content panels using shadcn Tabs
 */

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { TabsConfig, TabsContent as TabsContentType } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface TabsBlockProps {
  id: string;
  content: TabsContentType;
  config: TabsConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: TabsContentType) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
  onXAPIEvent?: (verb: string, data?: Record<string, unknown>) => void;
}

export function TabsBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
  onXAPIEvent,
}: TabsBlockProps) {
  const [activeTab, setActiveTab] = useState(content.defaultTabId || content.tabs[0]?.id);
  const [viewedTabs, setViewedTabs] = useState<Set<string>>(
    new Set([content.defaultTabId || content.tabs[0]?.id].filter(Boolean)),
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (config.trackInteractions) {
      const tab = content.tabs.find((t) => t.id === tabId);
      const isFirstView = !viewedTabs.has(tabId);
      setViewedTabs((prev) => new Set([...prev, tabId]));

      onXAPIEvent?.('interacted', {
        tabId,
        tabLabel: tab?.label || tabId,
        action: 'selected',
        isFirstView,
        totalTabs: content.tabs.length,
        viewedTabs: viewedTabs.size + (isFirstView ? 1 : 0),
        progress: (viewedTabs.size + (isFirstView ? 1 : 0)) / content.tabs.length,
      });
    }
  };

  const updateTab = (index: number, updates: Partial<TabsContentType['tabs'][0]>) => {
    const newTabs = [...content.tabs];
    newTabs[index] = { ...newTabs[index], ...updates };
    onContentChange?.({ ...content, tabs: newTabs });
  };

  const addTab = () => {
    const newId = `tab-${Date.now()}`;
    onContentChange?.({
      ...content,
      tabs: [...content.tabs, { id: newId, label: 'New Tab', content: 'Add content here...' }],
    });
    setActiveTab(newId);
  };

  const removeTab = (index: number) => {
    const newTabs = content.tabs.filter((_, i) => i !== index);
    if (content.tabs[index].id === activeTab && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
    onContentChange?.({ ...content, tabs: newTabs });
  };

  // Custom styling based on variant while leveraging shadcn structure
  const getTabsListClassName = () => {
    const baseClasses = 'h-auto';
    switch (config.variant) {
      case 'pills':
        return cn(baseClasses, 'gap-2 p-1 bg-card rounded-lg');
      case 'underlined':
        return cn(baseClasses, 'bg-transparent rounded-none border-b border-border');
      case 'boxed':
        return cn(baseClasses, 'border border-border rounded-t-lg rounded-b-none bg-transparent');
      default:
        return cn(baseClasses, 'bg-transparent border-b border-border rounded-none');
    }
  };

  const getTabsTriggerClassName = (_isActive: boolean) => {
    const baseClasses = 'px-4 py-2 text-sm font-medium';
    switch (config.variant) {
      case 'pills':
        return cn(
          baseClasses,
          'rounded-md data-[state=active]:bg-cyan-500 data-[state=active]:text-white',
          'data-[state=inactive]:bg-transparent',
        );
      case 'underlined':
        return cn(
          baseClasses,
          'rounded-none border-b-2 border-transparent',
          'data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent',
          'data-[state=inactive]:bg-transparent',
        );
      case 'boxed':
        return cn(
          baseClasses,
          'rounded-none border-r border-border last:border-r-0',
          'data-[state=active]:bg-card data-[state=active]:shadow-none',
          'data-[state=inactive]:bg-transparent',
        );
      default:
        return cn(
          baseClasses,
          'rounded-none border-b-2 border-transparent',
          'data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent',
          'data-[state=inactive]:bg-transparent',
        );
    }
  };

  const getTabsContentClassName = () => {
    switch (config.variant) {
      case 'boxed':
        return 'border border-t-0 border-border rounded-b-lg p-4 mt-0';
      case 'underlined':
        return 'pt-4 border-t border-border mt-0';
      default:
        return 'pt-4 mt-0';
    }
  };

  return (
    <BlockWrapper
      id={id}
      type="Tabs"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        orientation={config.orientation}
        className={cn(config.orientation === 'vertical' && 'flex gap-4')}
      >
        <TabsList
          className={cn(
            getTabsListClassName(),
            config.orientation === 'vertical' ? 'flex-col h-auto' : 'flex-row',
            config.alignment === 'center' && 'justify-center',
            config.alignment === 'end' && 'justify-end',
            config.alignment === 'stretch' && '[&>button]:flex-1',
            'w-fit',
          )}
        >
          {content.tabs.map((tab, index) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                getTabsTriggerClassName(activeTab === tab.id),
                isEditing && 'pointer-events-none',
              )}
              onClick={(e) => {
                if (isEditing) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <span className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={tab.label}
                    onChange={(e) => updateTab(index, { label: e.target.value })}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabChange(tab.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="bg-transparent outline-hidden border-b border-transparent focus:border-cyan-500 min-w-15 pointer-events-auto"
                  />
                ) : (
                  tab.label
                )}
                {isEditing && content.tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(index);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="p-0.5 text-red-500 hover:text-red-400 pointer-events-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </span>
            </TabsTrigger>
          ))}

          {isEditing && (
            <button
              type="button"
              onClick={addTab}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-cyan-500"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </TabsList>

        {content.tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className={cn('flex-1', getTabsContentClassName())}
          >
            {isEditing ? (
              <textarea
                value={tab.content}
                onChange={(e) => {
                  const idx = content.tabs.findIndex((t) => t.id === tab.id);
                  if (idx >= 0) updateTab(idx, { content: e.target.value });
                }}
                rows={4}
                className={cn(
                  'w-full bg-background px-3 py-2 rounded border border-border',
                  'outline-hidden focus:border-cyan-500 resize-y text-sm',
                )}
              />
            ) : (
              <p className="text-foreground">{tab.content}</p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </BlockWrapper>
  );
}
