'use client';

import { motion } from 'framer-motion';
import {
  FlipHorizontal,
  Infinity as InfinityIcon,
  Lightbulb,
  Move,
  Radio,
  RotateCw,
  Scale,
  Shuffle,
  Sparkles,
  Type,
  Vibrate,
  Waves,
  Wind,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useEditor } from '@/lib/inspire-studio/editor-context';
import { cn } from '@/lib/utils';

const animations = [
  { id: 'fade', label: 'Fade In', icon: Sparkles },
  { id: 'slide', label: 'Slide', icon: Wind },
  { id: 'bounce', label: 'Bounce', icon: Zap },
  { id: 'rotate', label: 'Rotate', icon: RotateCw },
  { id: 'scale', label: 'Scale', icon: Scale },
  { id: 'shuffle', label: 'Shuffle', icon: Shuffle },
  { id: 'pulse', label: 'Pulse', icon: Radio },
  { id: 'flip', label: 'Flip', icon: FlipHorizontal },
  { id: 'shake', label: 'Shake', icon: Vibrate },
  { id: 'typewriter', label: 'Typewriter', icon: Type },
  { id: 'glow', label: 'Glow', icon: Lightbulb },
  { id: 'wave', label: 'Wave', icon: Waves },
  { id: 'elastic', label: 'Elastic', icon: Move },
  { id: 'spiral', label: 'Spiral', icon: InfinityIcon },
];

export function AnimationsSection(): React.JSX.Element {
  const { state, dispatch: _dispatch } = useEditor();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  void _dispatch;

  const handleDragStart = (e: React.DragEvent, animationId: string): void => {
    e.dataTransfer.setData('animation', animationId);
    if (state.selectedShape) {
      e.dataTransfer.setData('targetType', 'shape');
      e.dataTransfer.setData('targetId', state.selectedShape.id);
    }
    setDraggedId(animationId);
    setActiveId(animationId);
  };

  const handleDragEnd = (): void => {
    setDraggedId(null);
  };

  return (
    <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto pr-1">
      {animations.map((animation) => {
        const Icon = animation.icon;
        const isActive = activeId === animation.id;
        return (
          <motion.div key={animation.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <div
              draggable
              tabIndex={0}
              onDragStart={(e) => {
                handleDragStart(e, animation.id);
              }}
              onDragEnd={handleDragEnd}
              role="option"
              aria-selected={isActive}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded cursor-grab',
                'border transition-all duration-200',
                draggedId === animation.id && 'opacity-50',
                isActive
                  ? 'bg-lxd-primary border-lxd-primary shadow-md shadow-lxd-primary/20'
                  : 'bg-lxd-primary-dark border-lxd-primary-dark/50 hover:border-lxd-primary/50',
              )}
            >
              <Icon className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-[11px] font-medium text-brand-primary whitespace-nowrap">
                {animation.label}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
