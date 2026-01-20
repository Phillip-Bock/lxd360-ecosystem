'use client';

import {
  AlertCircle,
  AlignLeft,
  ArrowUpDown,
  Award,
  BarChart3,
  Box,
  CheckSquare,
  ChevronRight,
  CircleHelp,
  Clock,
  Code,
  Columns3,
  Cpu,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FlipVertical,
  GitBranch,
  Glasses,
  GripVertical,
  Heading,
  Headphones,
  Image,
  Layers,
  Lightbulb,
  Link2,
  List,
  Lock,
  type LucideIcon,
  MessageSquare,
  Minus,
  MousePointerClick,
  Move,
  PanelTopClose,
  Quote,
  Search,
  Split,
  Square,
  Table,
  Target,
  TextCursor,
  ToggleLeft,
  Trophy,
  Users,
  Video,
  Vote,
  Workflow,
} from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface BlockDefinition {
  id: string;
  name: string;
  icon: LucideIcon;
}

interface BlockGroup {
  id: string;
  label: string;
  GroupIcon: LucideIcon;
  blocks: BlockDefinition[];
}

const blockGroups: BlockGroup[] = [
  {
    id: 'text',
    label: 'Text & Typography',
    GroupIcon: AlignLeft,
    blocks: [
      { id: 'paragraph', name: 'Paragraph', icon: AlignLeft },
      { id: 'heading', name: 'Heading', icon: Heading },
      { id: 'quote', name: 'Quote', icon: Quote },
      { id: 'list', name: 'List', icon: List },
      { id: 'code', name: 'Code Block', icon: Code },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    GroupIcon: Image,
    blocks: [
      { id: 'image', name: 'Image', icon: Image },
      { id: 'video', name: 'Video', icon: Video },
      { id: 'audio', name: 'Audio', icon: Headphones },
      { id: 'embed', name: 'Embed', icon: ExternalLink },
      { id: 'file', name: 'File Download', icon: Download },
    ],
  },
  {
    id: 'data',
    label: 'Data & Visualization',
    GroupIcon: BarChart3,
    blocks: [
      { id: 'table', name: 'Table', icon: Table },
      { id: 'chart', name: 'Chart', icon: BarChart3 },
      { id: 'diagram', name: 'Diagram', icon: GitBranch },
      { id: 'timeline', name: 'Timeline', icon: Clock },
      { id: 'process-flow', name: 'Process Flow', icon: Workflow },
    ],
  },
  {
    id: 'interactive',
    label: 'Interactive',
    GroupIcon: Target,
    blocks: [
      { id: 'accordion', name: 'Accordion', icon: PanelTopClose },
      { id: 'tabs', name: 'Tabs', icon: Layers },
      { id: 'flip-card', name: 'Flip Card', icon: FlipVertical },
      { id: 'hotspot', name: 'Hotspot Image', icon: MousePointerClick },
      { id: 'drag-drop', name: 'Drag & Drop', icon: Move },
      { id: 'click-reveal', name: 'Click to Reveal', icon: Eye },
    ],
  },
  {
    id: 'assessment',
    label: 'Assessment',
    GroupIcon: CircleHelp,
    blocks: [
      { id: 'multiple-choice', name: 'Multiple Choice', icon: CircleHelp },
      { id: 'multiple-select', name: 'Multiple Select', icon: CheckSquare },
      { id: 'true-false', name: 'True/False', icon: ToggleLeft },
      { id: 'fill-blank', name: 'Fill in the Blank', icon: TextCursor },
      { id: 'matching', name: 'Matching', icon: Link2 },
      { id: 'ordering', name: 'Ordering/Sequence', icon: ArrowUpDown },
      { id: 'short-answer', name: 'Short Answer', icon: MessageSquare },
    ],
  },
  {
    id: 'knowledge',
    label: 'Knowledge Check',
    GroupIcon: Lightbulb,
    blocks: [
      { id: 'quick-poll', name: 'Quick Poll', icon: Vote },
      { id: 'reflection', name: 'Reflection Prompt', icon: Lightbulb },
      { id: 'scenario-branch', name: 'Scenario Branch', icon: Split },
      { id: 'knowledge-gate', name: 'Knowledge Gate', icon: Lock },
    ],
  },
  {
    id: 'gamification',
    label: 'Gamification',
    GroupIcon: Trophy,
    blocks: [
      { id: 'points-award', name: 'Points Award', icon: Trophy },
      { id: 'badge-trigger', name: 'Badge Trigger', icon: Award },
      { id: 'leaderboard', name: 'Leaderboard Widget', icon: Users },
      { id: 'progress-milestone', name: 'Progress Milestone', icon: Target },
    ],
  },
  {
    id: 'layout',
    label: 'Layout',
    GroupIcon: Columns3,
    blocks: [
      { id: 'columns', name: 'Columns (2, 3, 4)', icon: Columns3 },
      { id: 'divider', name: 'Divider', icon: Minus },
      { id: 'spacer', name: 'Spacer', icon: Square },
      { id: 'card-container', name: 'Card Container', icon: CreditCard },
      { id: 'callout', name: 'Callout Box', icon: AlertCircle },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    GroupIcon: Box,
    blocks: [
      { id: '3d-model', name: '3D Model Viewer', icon: Box },
      { id: 'vr-ar-scene', name: 'VR/AR Scene', icon: Glasses },
      { id: 'simulation', name: 'Simulation', icon: Cpu },
      { id: 'branching-scenario', name: 'Branching Scenario', icon: Split },
      { id: 'custom-html', name: 'Custom HTML/CSS', icon: FileCode },
    ],
  },
];

/**
 * BlocksSidebar - Collapsible sidebar with 42+ draggable content blocks
 * organized into 9 categories
 */
export function BlocksSidebar() {
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['text']);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    );
  };

  // Filter blocks based on search
  const filteredGroups = blockGroups
    .map((group) => ({
      ...group,
      blocks: group.blocks.filter((block) =>
        block.name.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((group) => group.blocks.length > 0);

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    e.dataTransfer.setData('blockType', blockId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-72 border-r border-(--navy-200) bg-(--inspire-canvas-bg) flex flex-col h-full shrink-0 shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-(--navy-200) bg-(--navy-100)/30">
        <h2 className="text-sm font-semibold text-(--navy-800) mb-3">Content Blocks</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--navy-400)" />
          <Input
            placeholder="Search blocks..."
            className="pl-9 bg-(--navy-100)/50 border-(--navy-300) focus:border-(--navy-500) text-(--navy-800) placeholder:text-(--navy-400)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Block Groups */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredGroups.map((group) => (
          <Collapsible
            key={group.id}
            open={expandedGroups.includes(group.id) || search.length > 0}
            onOpenChange={() => toggleGroup(group.id)}
          >
            <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-(--navy-100) rounded-md text-left">
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-(--navy-400) transition-transform',
                  (expandedGroups.includes(group.id) || search.length > 0) && 'rotate-90',
                )}
              />
              <group.GroupIcon className="h-4 w-4 text-(--navy-500)" />
              <span className="text-sm font-medium text-(--navy-700)">{group.label}</span>
              <span className="ml-auto text-xs text-(--navy-400)">{group.blocks.length}</span>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <ul className="ml-4 space-y-0.5 pb-2 list-none m-0 p-0">
                {group.blocks.map((block) => (
                  <li
                    key={block.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, block.id)}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-(--navy-100) cursor-grab active:cursor-grabbing group transition-colors"
                  >
                    <GripVertical className="h-3 w-3 text-(--navy-300) group-hover:text-(--navy-400)" />
                    <block.icon className="h-4 w-4 text-(--navy-500) group-hover:text-(--navy-600)" />
                    <span className="text-sm text-(--navy-600) group-hover:text-(--navy-800)">
                      {block.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        ))}

        {filteredGroups.length === 0 && search.length > 0 && (
          <div className="text-center py-8 text-(--navy-400) text-sm">
            No blocks found for &quot;{search}&quot;
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-(--navy-200) text-xs text-(--navy-400) text-center bg-(--navy-100)/20">
        Drag blocks to the canvas to add content
      </div>
    </aside>
  );
}
