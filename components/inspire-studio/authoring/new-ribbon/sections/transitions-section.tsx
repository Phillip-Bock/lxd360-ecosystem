'use client';

import { motion } from 'framer-motion';
import {
  Eye,
  MoveDown,
  MoveLeft,
  MoveRight,
  MoveUp,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useEditor } from '@/lib/inspire-studio/editor-context';
import { cn } from '@/lib/utils';

const transitions = [
  { id: 'slide-right', name: 'Slide Right', icon: MoveRight },
  { id: 'slide-left', name: 'Slide Left', icon: MoveLeft },
  { id: 'slide-up', name: 'Slide Up', icon: MoveUp },
  { id: 'slide-down', name: 'Slide Down', icon: MoveDown },
  { id: 'fade-in', name: 'Fade In', icon: Eye },
  { id: 'zoom-in', name: 'Zoom In', icon: ZoomIn },
  { id: 'zoom-out', name: 'Zoom Out', icon: ZoomOut },
  { id: 'rotate', name: 'Rotate', icon: RotateCw },
];

export function TransitionsSection(): React.JSX.Element {
  const { selectedTransition, setSelectedTransition, state } = useEditor();

  const handleDragStart = (e: React.DragEvent, transitionId: string): void => {
    e.dataTransfer.setData('transition', transitionId);
    e.dataTransfer.effectAllowed = 'copy';

    // Add shape info if shape is selected
    if (state.selectedShape) {
      e.dataTransfer.setData('targetType', 'shape');
      e.dataTransfer.setData('targetId', state.selectedShape.id);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 max-w-[500px]">
      {transitions.map((transition) => {
        const Icon = transition.icon;
        const isActive = selectedTransition === transition.id;

        return (
          <motion.div key={transition.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              type="button"
              draggable
              onDragStart={(e) => {
                handleDragStart(e, transition.id);
              }}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded cursor-move text-brand-primary text-[10px] font-medium transition-all',
                'hover:shadow-md active:shadow-sm',
                isActive
                  ? 'bg-lxd-primary shadow-md ring-2 ring-lxd-primary/30'
                  : 'bg-lxd-primary-dark hover:bg-lxd-primary-dark',
              )}
              onClick={() => setSelectedTransition(transition.id)}
            >
              <Icon className="w-3 h-3" />
              <span className="whitespace-nowrap">{transition.name}</span>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
