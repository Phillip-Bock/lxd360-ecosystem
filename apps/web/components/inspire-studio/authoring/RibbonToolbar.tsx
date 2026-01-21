'use client';

import type React from 'react';
import { EditorProvider } from '@/lib/inspire-studio/editor-context';
import { NewAuthoringRibbon } from './new-ribbon/new-authoring-ribbon';

interface RibbonToolbarProps {
  onAction: (action: string, value?: unknown) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  selectedBlockId?: string | null;
}

/**
 * Adapter component that bridges the old RibbonToolbar interface
 * with the new NewAuthoringRibbon component.
 *
 * This allows us to swap the ribbon implementation without changing
 * the LessonAuthor.tsx page.
 */
export const RibbonToolbar: React.FC<RibbonToolbarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
}) => {
  // Map isCollapsed to the new ribbon's minimized state
  // When the ribbon's internal minimize toggle is clicked, call onToggleCollapse if provided
  const handleMinimizeToggle = (): void => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  // Handle right sidebar opening/closing if needed
  // The new ribbon uses onRightSidebarOpen/Close but we don't have that functionality yet
  const handleRightSidebarOpen = (): void => {
    // For now, just log - can be enhanced later if needed
  };

  const handleRightSidebarClose = (): void => {
    // If closing sidebar, also trigger collapse toggle if provided
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  // Note: The new ribbon uses its own internal state management via EditorContext.
  // It doesn't directly support the onAction callback pattern. Actions are handled
  // internally by the ribbon components. If needed, we can enhance this later
  // by creating a bridge that also calls onAction when ribbon actions occur.

  return (
    <EditorProvider>
      <div
        style={{
          minHeight: isCollapsed ? '40px' : 'auto',
          overflow: 'hidden',
        }}
      >
        <NewAuthoringRibbon
          onRightSidebarOpen={handleRightSidebarOpen}
          onRightSidebarClose={handleRightSidebarClose}
          isMinimized={isCollapsed}
          onMinimizeToggle={handleMinimizeToggle}
        />
      </div>
    </EditorProvider>
  );
};
