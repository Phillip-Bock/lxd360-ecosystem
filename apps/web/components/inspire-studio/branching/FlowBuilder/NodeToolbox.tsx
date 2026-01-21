'use client';

import { Flag, GitBranch, type LucideIcon, MessageSquare, Zap } from 'lucide-react';
import type { ScenarioNodeType } from '@/components/inspire-studio/branching/types';
import { cn } from '@/lib/utils';

// =============================================================================
// Node Toolbox Item
// =============================================================================

interface ToolboxItemProps {
  type: ScenarioNodeType;
  label: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
}

function ToolboxItem({ type, label, description, icon: Icon, colorClass }: ToolboxItemProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-grab',
        'bg-lxd-dark-surface border border-lxd-dark-border',
        'hover:border-lxd-cyan/50 hover:bg-lxd-dark-surface/80',
        'transition-all duration-200',
        'active:cursor-grabbing',
      )}
    >
      <div className={cn('p-2 rounded-md', colorClass)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{label}</p>
        <p className="text-xs text-white/50 truncate">{description}</p>
      </div>
    </div>
  );
}

// =============================================================================
// Node Toolbox
// =============================================================================

const toolboxItems: ToolboxItemProps[] = [
  {
    type: 'dialogue',
    label: 'Dialogue',
    description: 'Character speech with choices',
    icon: MessageSquare,
    colorClass: 'bg-blue-500/20 text-blue-400',
  },
  {
    type: 'action',
    label: 'Action',
    description: 'Silent variable mutations',
    icon: Zap,
    colorClass: 'bg-orange-500/20 text-orange-400',
  },
  {
    type: 'logic_gate',
    label: 'Logic Gate',
    description: 'If/else condition branch',
    icon: GitBranch,
    colorClass: 'bg-purple-500/20 text-purple-400',
  },
  {
    type: 'end_state',
    label: 'End State',
    description: 'Scenario outcome terminal',
    icon: Flag,
    colorClass: 'bg-red-500/20 text-red-400',
  },
];

interface NodeToolboxProps {
  className?: string;
}

export function NodeToolbox({ className }: NodeToolboxProps) {
  return (
    <div
      className={cn(
        'w-64 p-4 rounded-xl',
        'bg-lxd-dark-bg/95 backdrop-blur-sm',
        'border border-lxd-dark-border',
        'shadow-xl',
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-white mb-3">Node Toolbox</h3>
      <p className="text-xs text-white/50 mb-4">Drag nodes to the canvas</p>
      <div className="space-y-2">
        {toolboxItems.map((item) => (
          <ToolboxItem key={item.type} {...item} />
        ))}
      </div>
    </div>
  );
}

export default NodeToolbox;
