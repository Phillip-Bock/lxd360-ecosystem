'use client';

import {
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Columns,
  FileText,
  GripVertical,
  Heading1,
  Heading2,
  HelpCircle,
  ImageIcon,
  Layers,
  Layout,
  Lightbulb,
  List,
  ListOrdered,
  MessageSquare,
  Mic,
  Minus,
  PanelLeft,
  PanelLeftClose,
  Play,
  Quote,
  SplitSquareVertical,
  Table,
  Target,
  Type,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContentBlock {
  id: string;
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface BlockCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  blocks: ContentBlock[];
  isExpanded?: boolean;
}

interface CourseCreationSidebarProps {
  onDragStart?: (blockType: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CourseCreationSidebar({
  onDragStart,
  isCollapsed = false,
  onToggleCollapse,
}: CourseCreationSidebarProps): React.JSX.Element {
  const [categories, setCategories] = useState<BlockCategory[]>([
    {
      id: 'text',
      label: 'Text & Typography',
      icon: Type,
      isExpanded: true,
      blocks: [
        { id: 'paragraph', type: 'text', label: 'Paragraph', icon: Type },
        { id: 'heading-1', type: 'heading-1', label: 'Heading 1', icon: Heading1 },
        { id: 'heading-2', type: 'heading-2', label: 'Heading 2', icon: Heading2 },
        { id: 'title-only', type: 'title-only', label: 'Title Only', icon: FileText },
        { id: 'subtitle-only', type: 'subtitle-only', label: 'Subtitle Only', icon: FileText },
        {
          id: 'title-paragraph',
          type: 'title-paragraph',
          label: 'Title + Paragraph',
          icon: FileText,
        },
      ],
    },
    {
      id: 'lists',
      label: 'Lists',
      icon: List,
      isExpanded: false,
      blocks: [
        { id: 'bulleted-list', type: 'bulleted-list', label: 'Bulleted List', icon: List },
        { id: 'numbered-list', type: 'numbered-list', label: 'Numbered List', icon: ListOrdered },
        { id: 'checkbox-list', type: 'checkbox-list', label: 'Checkbox List', icon: CheckSquare },
        { id: 'definition-list', type: 'definition-list', label: 'Definition List', icon: List },
      ],
    },
    {
      id: 'quotes',
      label: 'Quotes & Callouts',
      icon: Quote,
      isExpanded: false,
      blocks: [
        { id: 'quote-classic', type: 'quote-classic', label: 'Quote Classic', icon: Quote },
        { id: 'quote-centered', type: 'quote-centered', label: 'Quote Centered', icon: Quote },
        { id: 'quote-large', type: 'quote-large', label: 'Quote Large Marks', icon: Quote },
        { id: 'quote-card', type: 'quote-card', label: 'Quote Card', icon: Quote },
        { id: 'pull-quote', type: 'pull-quote', label: 'Pull Quote', icon: Quote },
        { id: 'testimonial', type: 'testimonial', label: 'Testimonial', icon: Users },
        { id: 'expert-insight', type: 'expert-insight', label: 'Expert Insight', icon: Lightbulb },
      ],
    },
    {
      id: 'callouts',
      label: 'Alerts & Notices',
      icon: MessageSquare,
      isExpanded: false,
      blocks: [
        { id: 'note-block', type: 'note-block', label: 'Note', icon: FileText },
        { id: 'alert-block', type: 'alert-block', label: 'Alert', icon: Bell },
        { id: 'caution-block', type: 'caution-block', label: 'Caution', icon: AlertTriangle },
        { id: 'danger-block', type: 'danger-block', label: 'Danger', icon: AlertTriangle },
        { id: 'success-block', type: 'success-block', label: 'Success', icon: CheckSquare },
        { id: 'warning-block', type: 'warning-block', label: 'Warning', icon: AlertTriangle },
        {
          id: 'custom-callout',
          type: 'custom-callout',
          label: 'Custom Callout',
          icon: MessageSquare,
        },
        { id: 'statement-block', type: 'statement-block', label: 'Statement', icon: FileText },
      ],
    },
    {
      id: 'media',
      label: 'Media',
      icon: ImageIcon,
      isExpanded: false,
      blocks: [
        { id: 'image', type: 'image', label: 'Image', icon: ImageIcon },
        { id: 'image-gallery', type: 'image-gallery', label: 'Image Gallery', icon: ImageIcon },
        { id: 'video', type: 'video', label: 'Video', icon: Video },
        { id: 'audio', type: 'audio', label: 'Audio', icon: Mic },
        { id: 'embed', type: 'embed', label: 'Embed', icon: Code },
        {
          id: 'interactive-image',
          type: 'interactive-image',
          label: 'Interactive Image',
          icon: Zap,
        },
        {
          id: 'paragraph-image',
          type: 'paragraph-image',
          label: 'Paragraph + Image',
          icon: ImageIcon,
        },
      ],
    },
    {
      id: 'layout',
      label: 'Layout',
      icon: Layout,
      isExpanded: false,
      blocks: [
        { id: 'columns', type: 'columns', label: 'Multi-Column', icon: Columns },
        { id: 'divider', type: 'divider', label: 'Divider', icon: Minus },
        { id: 'spacer', type: 'spacer', label: 'Spacer', icon: Minus },
        {
          id: 'comparison-table',
          type: 'comparison-table',
          label: 'Comparison Table',
          icon: Table,
        },
        { id: 'sortable-table', type: 'sortable-table', label: 'Sortable Table', icon: Table },
      ],
    },
    {
      id: 'interactive',
      label: 'Interactive',
      icon: Layers,
      isExpanded: false,
      blocks: [
        { id: 'accordion', type: 'accordion', label: 'Accordion', icon: Layers },
        { id: 'faq-accordion', type: 'faq-accordion', label: 'FAQ Accordion', icon: HelpCircle },
        { id: 'flip-cards', type: 'flip-cards', label: 'Flip Cards', icon: SplitSquareVertical },
        { id: 'hotspot', type: 'hotspot', label: 'Hotspot Image', icon: Target },
        { id: 'tabs', type: 'tabs', label: 'Tabs', icon: Layers },
        {
          id: 'labeled-graphic',
          type: 'labeled-graphic',
          label: 'Labeled Graphic',
          icon: ImageIcon,
        },
      ],
    },
    {
      id: 'process',
      label: 'Process & Timeline',
      icon: Clock,
      isExpanded: false,
      blocks: [
        {
          id: 'timeline-vertical',
          type: 'timeline-vertical',
          label: 'Timeline Vertical',
          icon: Clock,
        },
        {
          id: 'timeline-horizontal',
          type: 'timeline-horizontal',
          label: 'Timeline Horizontal',
          icon: Clock,
        },
        {
          id: 'process-horizontal',
          type: 'process-horizontal',
          label: 'Process Horizontal',
          icon: Play,
        },
        { id: 'step-by-step', type: 'step-by-step', label: 'Step by Step', icon: ListOrdered },
        { id: 'statistics', type: 'statistics', label: 'Statistics Display', icon: BarChart3 },
      ],
    },
    {
      id: 'knowledge',
      label: 'Knowledge Check',
      icon: Brain,
      isExpanded: false,
      blocks: [
        {
          id: 'multiple-choice',
          type: 'multiple-choice',
          label: 'Multiple Choice',
          icon: CheckSquare,
        },
        { id: 'true-false', type: 'true-false', label: 'True/False', icon: CheckSquare },
        {
          id: 'multiple-select',
          type: 'multiple-select',
          label: 'Multiple Select',
          icon: CheckSquare,
        },
        { id: 'matching', type: 'matching', label: 'Matching', icon: Layers },
        { id: 'drag-drop', type: 'drag-drop', label: 'Drag & Drop', icon: GripVertical },
        { id: 'fill-blank', type: 'fill-blank', label: 'Fill in the Blank', icon: Type },
      ],
    },
    {
      id: 'learning',
      label: 'Learning Structure',
      icon: BookOpen,
      isExpanded: false,
      blocks: [
        { id: 'objectives', type: 'objectives', label: 'Learning Objectives', icon: Target },
        { id: 'prerequisites', type: 'prerequisites', label: 'Prerequisites', icon: BookOpen },
        { id: 'key-takeaways', type: 'key-takeaways', label: 'Key Takeaways', icon: Award },
        { id: 'references', type: 'references', label: 'References', icon: FileText },
      ],
    },
  ]);

  const toggleCategory = (categoryId: string): void => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat,
      ),
    );
  };

  const handleDragStart = (e: React.DragEvent, blockType: string): void => {
    e.dataTransfer.setData('text/plain', blockType);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(blockType);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-studio-bg-dark border-r border-studio-surface flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-brand-muted hover:text-brand-primary hover:bg-studio-surface mb-4"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        {categories.slice(0, 8).map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            size="icon"
            className="text-brand-muted hover:text-brand-primary hover:bg-studio-surface mb-2"
            title={category.label}
          >
            <category.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-72 h-full bg-studio-bg-dark border-r border-studio-surface flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-studio-surface">
        <h2 className="text-sm font-semibold text-brand-primary uppercase tracking-wider">
          Content Blocks
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-brand-muted hover:text-brand-primary hover:bg-studio-surface"
        >
          <PanelLeftClose className="h-5 w-5" />
        </Button>
      </div>

      {/* Block Categories */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full sidebar-scroll">
          <div className="p-2 space-y-1">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg overflow-hidden">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-brand-secondary hover:bg-studio-surface rounded-lg transition-colors"
                >
                  <category.icon className="h-4 w-4 text-studio-accent" />
                  <span className="flex-1 text-sm font-medium">{category.label}</span>
                  {category.isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-brand-muted" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-brand-muted" />
                  )}
                </button>

                {/* Category Blocks */}
                {category.isExpanded && (
                  <ul className="pl-2 pr-1 pb-2 space-y-1 list-none m-0">
                    {category.blocks.map((block) => (
                      <li
                        key={block.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, block.type)}
                        className="flex items-center gap-2 px-3 py-2 text-brand-muted hover:text-brand-primary hover:bg-studio-surface/50 rounded-md cursor-grab active:cursor-grabbing transition-colors group"
                      >
                        <GripVertical className="h-3 w-3 text-brand-secondary group-hover:text-brand-muted" />
                        <block.icon className="h-4 w-4 text-block-special" />
                        <span className="text-sm">{block.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-studio-surface">
        <p className="text-xs text-brand-muted text-center">
          Drag blocks to the canvas to add content
        </p>
      </div>
    </div>
  );
}
