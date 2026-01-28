'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Editor Ribbon Component
 * =============================================================================
 *
 * The main ribbon container that combines the Quick Access Toolbar,
 * Tab Navigation, and Tab Content. This is the most powerful course
 * authoring ribbon in the industry - combining the best of Articulate
 * Rise, Storyline, and AI assistance.
 *
 * Features:
 * - 8 main tabs (Home, Insert, Design, Interactions, Assessment, AI Studio, Review, View)
 * - Contextual tabs that appear based on selection
 * - Quick Access Toolbar for common actions
 * - INSPIRE framework integration
 * - Cognitive load measurement
 * - AI-powered content generation
 * - Keyboard shortcuts support
 * - Collapsible ribbon mode
 */

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Components
import { QuickAccessToolbar } from './quick-access-toolbar';
import { type RibbonTabItem, RibbonTabs } from './ribbon-tabs';
import {
  AIStudioTab,
  AssessmentTab,
  DesignTab,
  HomeTab,
  InsertTab,
  InteractionsTab,
  ReviewTab,
  ViewTab,
} from './tabs';

export interface EditorRibbonProps {
  // Document state
  documentTitle?: string;
  lastSaved?: Date | null;
  isSaving?: boolean;

  // Selection state
  selection?: unknown;
  selectedType?: string | null;
  activeFormats?: string[];

  // Editor state
  canUndo?: boolean;
  canRedo?: boolean;
  cognitiveLoad?: number;
  zoomLevel?: number;

  // Event handlers
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
  onFormatting?: (format: string, value?: unknown) => void;
  onInsert?: (type: string, options?: unknown) => void;
  onAIAction?: (action: string, options?: unknown) => void;
  onDesignAction?: (action: string, value?: unknown) => void;
  onViewAction?: (action: string, value?: unknown) => void;

  // Customization
  className?: string;
  defaultTab?: string;
  showQuickAccessToolbar?: boolean;
}

// Main tabs configuration
const MAIN_TABS: RibbonTabItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'insert', label: 'Insert' },
  { id: 'design', label: 'Design' },
  { id: 'interactions', label: 'Interactions' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'ai-studio', label: 'AI Studio' },
  { id: 'review', label: 'Review' },
  { id: 'view', label: 'View' },
];

// Contextual tabs that appear based on selection
const CONTEXTUAL_TABS: Record<string, RibbonTabItem> = {
  image: { id: 'image-tools', label: 'Image Tools', isContextual: true, contextColor: '#22c55e' },
  video: { id: 'video-tools', label: 'Video Tools', isContextual: true, contextColor: '#3b82f6' },
  audio: { id: 'audio-tools', label: 'Audio Tools', isContextual: true, contextColor: '#a855f7' },
  table: { id: 'table-tools', label: 'Table Tools', isContextual: true, contextColor: '#f59e0b' },
  shape: { id: 'shape-tools', label: 'Shape Tools', isContextual: true, contextColor: '#ec4899' },
  quiz: { id: 'quiz-tools', label: 'Quiz Tools', isContextual: true, contextColor: '#06b6d4' },
};

export function EditorRibbon({
  documentTitle = 'Untitled Lesson',
  lastSaved,
  isSaving = false,
  selection,
  selectedType,
  activeFormats = [],
  canUndo = false,
  canRedo = false,
  cognitiveLoad = 65,
  zoomLevel = 100,
  onSave,
  onUndo,
  onRedo,
  onPreview,
  onPublish,
  onFormatting,
  onInsert,
  onAIAction,
  onDesignAction,
  onViewAction,
  className,
  defaultTab = 'home',
  showQuickAccessToolbar = true,
}: EditorRibbonProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Build tabs list including contextual tabs
  const tabs = [...MAIN_TABS];
  if (selectedType && CONTEXTUAL_TABS[selectedType]) {
    tabs.push(CONTEXTUAL_TABS[selectedType]);
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ to open command palette
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        onAIAction?.('openCommandPalette');
      }

      // Ctrl+S to save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }

      // Ctrl+Z to undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
      }

      // Ctrl+Y or Ctrl+Shift+Z to redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        onRedo?.();
      }

      // Ctrl+Shift+P to preview
      if (e.ctrlKey && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        onPreview?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onUndo, onRedo, onPreview, onAIAction]);

  // Toggle collapsed state
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Render the active tab content
  const renderTabContent = () => {
    if (isCollapsed) return null;

    switch (activeTab) {
      case 'home':
        return (
          <HomeTab
            selection={selection}
            activeFormats={activeFormats}
            cognitiveLoad={cognitiveLoad}
            onFormatting={onFormatting}
            onInsert={onInsert}
            onAIAction={onAIAction}
          />
        );
      case 'insert':
        return <InsertTab onInsert={onInsert} />;
      case 'design':
        return <DesignTab onDesignAction={onDesignAction} />;
      case 'interactions':
        return <InteractionsTab onInsert={onInsert} onAction={onDesignAction} />;
      case 'assessment':
        return <AssessmentTab onInsert={onInsert} onAction={onDesignAction} />;
      case 'ai-studio':
        return <AIStudioTab selection={selection} onAIAction={onAIAction} />;
      case 'review':
        return <ReviewTab onAction={onDesignAction} />;
      case 'view':
        return <ViewTab zoomLevel={zoomLevel} onAction={onViewAction} />;
      default:
        return (
          <HomeTab
            selection={selection}
            activeFormats={activeFormats}
            cognitiveLoad={cognitiveLoad}
            onFormatting={onFormatting}
            onInsert={onInsert}
            onAIAction={onAIAction}
          />
        );
    }
  };

  return (
    <div className={cn('bg-studio-bg-dark border-b border-studio-surface', className)}>
      {/* Quick Access Toolbar */}
      {showQuickAccessToolbar && (
        <QuickAccessToolbar
          documentTitle={documentTitle}
          canUndo={canUndo}
          canRedo={canRedo}
          isSaving={isSaving}
          lastSaved={lastSaved}
          onSave={onSave}
          onUndo={onUndo}
          onRedo={onRedo}
          onPreview={onPreview}
          onPublish={onPublish}
        />
      )}

      {/* Tab Navigation */}
      <RibbonTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Tab Content */}
      <div
        className={cn(
          'transition-all duration-200 overflow-hidden',
          isCollapsed ? 'h-0' : 'h-[88px]',
        )}
      >
        {renderTabContent()}
      </div>
    </div>
  );
}
