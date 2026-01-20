/**
 * =============================================================================
 * LXP360-SaaS | Interaction Ribbon - Tool Registry
 * =============================================================================
 *
 * @fileoverview Registry of all available authoring tools
 *
 * =============================================================================
 */

import {
  Accessibility,
  Award,
  BarChart3,
  Box,
  Brain,
  CheckSquare,
  Code,
  Columns,
  Download,
  Eye,
  FileAudio,
  FileText,
  Gamepad2,
  Globe,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Languages,
  Layers,
  Layout,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  MessageSquare,
  Minus,
  Palette,
  PenTool,
  Puzzle,
  Quote,
  Settings,
  Share2,
  Sparkles,
  SplitSquareHorizontal,
  Table,
  Timer,
  Type,
  Video,
  Volume2,
  Wand2,
} from 'lucide-react';
import type { RibbonCategory, RibbonTool, ToolConfig } from './types';

// ============================================================================
// Category Definitions
// ============================================================================

export const RIBBON_CATEGORIES: ToolConfig['categories'] = [
  { id: 'content', name: 'Content', icon: Type },
  { id: 'media', name: 'Media', icon: Image },
  { id: 'interactive', name: 'Interactive', icon: Puzzle },
  { id: 'ai', name: 'AI Assist', icon: Sparkles },
  { id: 'assessment', name: 'Assessment', icon: CheckSquare },
  { id: 'accessibility', name: 'Accessibility', icon: Accessibility },
  { id: 'settings', name: 'Settings', icon: Settings },
];

// ============================================================================
// Tool Definitions
// ============================================================================

export const RIBBON_TOOLS: RibbonTool[] = [
  // Content Tools
  {
    id: 'heading-1',
    name: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    category: 'content',
    shortcut: 'Mod+Alt+1',
  },
  {
    id: 'heading-2',
    name: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    category: 'content',
    shortcut: 'Mod+Alt+2',
  },
  {
    id: 'heading-3',
    name: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    category: 'content',
    shortcut: 'Mod+Alt+3',
  },
  {
    id: 'paragraph',
    name: 'Paragraph',
    description: 'Normal text paragraph',
    icon: Type,
    category: 'content',
    shortcut: 'Mod+Alt+0',
  },
  {
    id: 'bullet-list',
    name: 'Bullet List',
    description: 'Unordered list',
    icon: List,
    category: 'content',
    shortcut: 'Mod+Shift+8',
  },
  {
    id: 'numbered-list',
    name: 'Numbered List',
    description: 'Ordered list',
    icon: ListOrdered,
    category: 'content',
    shortcut: 'Mod+Shift+7',
  },
  {
    id: 'checklist',
    name: 'Checklist',
    description: 'Task list with checkboxes',
    icon: ListChecks,
    category: 'content',
  },
  {
    id: 'quote',
    name: 'Blockquote',
    description: 'Quoted text block',
    icon: Quote,
    category: 'content',
    shortcut: 'Mod+Shift+B',
  },
  {
    id: 'code-block',
    name: 'Code Block',
    description: 'Syntax-highlighted code',
    icon: Code,
    category: 'content',
  },
  {
    id: 'table',
    name: 'Table',
    description: 'Data table',
    icon: Table,
    category: 'content',
  },
  {
    id: 'divider',
    name: 'Divider',
    description: 'Horizontal divider line',
    icon: Minus,
    category: 'content',
  },
  {
    id: 'link',
    name: 'Link',
    description: 'Hyperlink to URL or page',
    icon: Link2,
    category: 'content',
    shortcut: 'Mod+K',
  },

  // Media Tools
  {
    id: 'image',
    name: 'Image',
    description: 'Upload or embed image',
    icon: Image,
    category: 'media',
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Embed video player',
    icon: Video,
    category: 'media',
  },
  {
    id: 'audio',
    name: 'Audio',
    description: 'Embed audio player',
    icon: FileAudio,
    category: 'media',
  },
  {
    id: 'file',
    name: 'File Download',
    description: 'Downloadable file attachment',
    icon: Download,
    category: 'media',
  },
  {
    id: 'embed',
    name: 'Embed',
    description: 'Embed external content',
    icon: Globe,
    category: 'media',
  },
  {
    id: '3d-model',
    name: '3D Model',
    description: 'Interactive 3D model viewer',
    icon: Box,
    category: 'media',
    premium: true,
  },
  {
    id: '360-image',
    name: '360° Image',
    description: 'Panoramic image viewer',
    icon: Globe,
    category: 'media',
    premium: true,
  },

  // Interactive Tools
  {
    id: 'accordion',
    name: 'Accordion',
    description: 'Expandable content sections',
    icon: Layers,
    category: 'interactive',
  },
  {
    id: 'tabs',
    name: 'Tabs',
    description: 'Tabbed content container',
    icon: SplitSquareHorizontal,
    category: 'interactive',
  },
  {
    id: 'hotspot',
    name: 'Hotspots',
    description: 'Interactive image hotspots',
    icon: PenTool,
    category: 'interactive',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Chronological content display',
    icon: Timer,
    category: 'interactive',
  },
  {
    id: 'flashcard',
    name: 'Flashcard',
    description: 'Flip card for memorization',
    icon: SplitSquareHorizontal,
    category: 'interactive',
  },
  {
    id: 'drag-drop',
    name: 'Drag & Drop',
    description: 'Drag and drop interaction',
    icon: Puzzle,
    category: 'interactive',
  },
  {
    id: 'game',
    name: 'Learning Game',
    description: 'Gamified learning activity',
    icon: Gamepad2,
    category: 'interactive',
    premium: true,
  },

  // AI Tools
  {
    id: 'ai-generate',
    name: 'AI Generate',
    description: 'Generate content with AI',
    icon: Wand2,
    category: 'ai',
    requiresIntegration: 'openai',
  },
  {
    id: 'ai-improve',
    name: 'AI Improve',
    description: 'Improve existing content',
    icon: Sparkles,
    category: 'ai',
    requiresIntegration: 'openai',
  },
  {
    id: 'ai-quiz',
    name: 'AI Quiz Generator',
    description: 'Generate quiz from content',
    icon: Brain,
    category: 'ai',
    requiresIntegration: 'openai',
  },
  {
    id: 'ai-image',
    name: 'AI Image',
    description: 'Generate images with AI',
    icon: Image,
    category: 'ai',
    requiresIntegration: 'openai',
    premium: true,
  },
  {
    id: 'ai-translate',
    name: 'AI Translate',
    description: 'Translate content',
    icon: Languages,
    category: 'ai',
    requiresIntegration: 'openai',
  },
  {
    id: 'ai-tts',
    name: 'Text to Speech',
    description: 'Convert text to audio',
    icon: Volume2,
    category: 'ai',
    requiresIntegration: 'google-cloud',
  },

  // Assessment Tools
  {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    description: 'Single answer question',
    icon: CheckSquare,
    category: 'assessment',
  },
  {
    id: 'multi-select',
    name: 'Multi-Select',
    description: 'Multiple answer question',
    icon: ListChecks,
    category: 'assessment',
  },
  {
    id: 'true-false',
    name: 'True/False',
    description: 'Binary choice question',
    icon: CheckSquare,
    category: 'assessment',
  },
  {
    id: 'fill-blank',
    name: 'Fill in Blank',
    description: 'Text input question',
    icon: Type,
    category: 'assessment',
  },
  {
    id: 'matching',
    name: 'Matching',
    description: 'Match pairs activity',
    icon: Link2,
    category: 'assessment',
  },
  {
    id: 'essay',
    name: 'Essay',
    description: 'Long-form text response',
    icon: FileText,
    category: 'assessment',
  },
  {
    id: 'survey',
    name: 'Survey',
    description: 'Feedback survey block',
    icon: BarChart3,
    category: 'assessment',
  },

  // Accessibility Tools
  {
    id: 'alt-text',
    name: 'Alt Text',
    description: 'Add/edit image descriptions',
    icon: Eye,
    category: 'accessibility',
  },
  {
    id: 'transcript',
    name: 'Transcript',
    description: 'Add media transcript',
    icon: FileText,
    category: 'accessibility',
  },
  {
    id: 'captions',
    name: 'Captions',
    description: 'Add video captions',
    icon: MessageSquare,
    category: 'accessibility',
  },
  {
    id: 'reading-level',
    name: 'Reading Level',
    description: 'Check content readability',
    icon: BarChart3,
    category: 'accessibility',
  },
  {
    id: 'contrast-check',
    name: 'Contrast Check',
    description: 'Verify color contrast',
    icon: Palette,
    category: 'accessibility',
  },
  {
    id: 'screen-reader',
    name: 'Screen Reader Preview',
    description: 'Preview for screen readers',
    icon: Eye,
    category: 'accessibility',
  },

  // Settings Tools
  {
    id: 'layout',
    name: 'Page Layout',
    description: 'Configure page layout',
    icon: Layout,
    category: 'settings',
  },
  {
    id: 'columns',
    name: 'Columns',
    description: 'Multi-column layout',
    icon: Columns,
    category: 'settings',
  },
  {
    id: 'theme',
    name: 'Theme',
    description: 'Lesson theme settings',
    icon: Palette,
    category: 'settings',
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Lesson navigation settings',
    icon: Share2,
    category: 'settings',
  },
  {
    id: 'completion',
    name: 'Completion Rules',
    description: 'Set completion criteria',
    icon: Award,
    category: 'settings',
  },
];

// ============================================================================
// Tool Registry Functions
// ============================================================================

/**
 * Get all tools
 */
export function getAllTools(): RibbonTool[] {
  return RIBBON_TOOLS;
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: RibbonCategory): RibbonTool[] {
  return RIBBON_TOOLS.filter((tool) => tool.category === category);
}

/**
 * Get tool by ID
 */
export function getToolById(id: string): RibbonTool | undefined {
  return RIBBON_TOOLS.find((tool) => tool.id === id);
}

/**
 * Get tools requiring a specific integration
 */
export function getToolsByIntegration(integrationId: string): RibbonTool[] {
  return RIBBON_TOOLS.filter((tool) => tool.requiresIntegration === integrationId);
}

/**
 * Get tool configuration
 */
export function getToolConfig(): ToolConfig {
  return {
    tools: RIBBON_TOOLS,
    categories: RIBBON_CATEGORIES,
  };
}
