/**
 * =============================================================================
 * LXP360-SaaS | Interaction Ribbon - Types
 * =============================================================================
 *
 * @fileoverview Type definitions for the authoring interaction ribbon
 *
 * =============================================================================
 */

import type { LucideIcon } from 'lucide-react';
import type { IntegrationId, IntegrationStatus } from '@/lib/integrations/types';

// ============================================================================
// Tool Types
// ============================================================================

export interface RibbonTool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: RibbonCategory;
  shortcut?: string;
  requiresIntegration?: IntegrationId;
  disabled?: boolean;
  premium?: boolean;
  onClick?: () => void;
}

export type RibbonCategory =
  | 'content'
  | 'media'
  | 'interactive'
  | 'ai'
  | 'assessment'
  | 'accessibility'
  | 'settings';

// ============================================================================
// Integration Status Types
// ============================================================================

export interface IntegrationStatusIndicator {
  id: IntegrationId;
  name: string;
  status: IntegrationStatus;
  icon: LucideIcon;
  lastChecked?: Date;
  message?: string;
}

export interface IntegrationStatusMap {
  [key: string]: IntegrationStatusIndicator;
}

// ============================================================================
// Ribbon State Types
// ============================================================================

export interface RibbonState {
  activeCategory: RibbonCategory;
  expandedTool: string | null;
  integrationStatuses: IntegrationStatusMap;
  isLoading: boolean;
  error: string | null;
}

export interface RibbonContextValue extends RibbonState {
  setActiveCategory: (category: RibbonCategory) => void;
  setExpandedTool: (toolId: string | null) => void;
  refreshIntegrationStatus: (integrationId?: IntegrationId) => Promise<void>;
  refreshAllStatuses: () => Promise<void>;
}

// ============================================================================
// Tool Configuration
// ============================================================================

export interface ToolConfig {
  tools: RibbonTool[];
  categories: {
    id: RibbonCategory;
    name: string;
    icon: LucideIcon;
  }[];
}

// ============================================================================
// Connection Test Types
// ============================================================================

export interface ConnectionTestResult {
  integrationId: IntegrationId;
  success: boolean;
  latencyMs: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface ConnectionTestOptions {
  timeout?: number;
  showNotification?: boolean;
}
