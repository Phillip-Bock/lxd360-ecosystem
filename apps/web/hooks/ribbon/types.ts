/**
 * Ribbon Contextual Tab Types
 * Defines the structure for dynamically registered contextual tabs
 */

import type { LucideIcon } from 'lucide-react';

/** A single tool/action button within a ribbon group */
export interface RibbonTool {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'destructive';
}

/** A group of related tools within a contextual tab */
export interface RibbonGroup {
  id: string;
  label: string;
  tools: RibbonTool[];
}

/** A contextual tab that appears when a specific block type is selected */
export interface ContextualTab {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string; // Tailwind color class like "purple", "cyan", "green"
  groups: RibbonGroup[];
  /** Optional callback when the full editor should open */
  onOpenFullEditor?: () => void;
}

/** State for managing contextual tabs */
export interface ContextualTabState {
  tabs: ContextualTab[];
  activeTabId: string | null;
}

/** Return type for contextual tab hooks */
export interface UseContextualTabResult {
  tab: ContextualTab;
  isActive: boolean;
}
