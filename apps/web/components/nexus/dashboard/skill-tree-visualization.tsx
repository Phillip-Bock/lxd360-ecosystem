'use client';

/**
 * Skill Tree Visualization
 * ========================
 * RPG-style skill tree showing learning progress and skill development.
 */

import { motion } from 'framer-motion';
import { CheckCircle, Circle, Lock, Star } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SkillNode {
  id: string;
  label: string;
  status: 'locked' | 'in-progress' | 'completed';
  level: number;
  description: string;
  x: number;
  y: number;
  connections: string[];
}

// Mock skill tree data
const SKILL_TREE_DATA: SkillNode[] = [
  {
    id: 'root',
    label: 'Frontend Dev',
    status: 'completed',
    level: 5,
    description: 'Foundation of frontend development',
    x: 50,
    y: 10,
    connections: ['react', 'css'],
  },
  {
    id: 'react',
    label: 'React Core',
    status: 'completed',
    level: 4,
    description: 'React fundamentals and component patterns',
    x: 30,
    y: 35,
    connections: ['hooks', 'state'],
  },
  {
    id: 'css',
    label: 'Modern CSS',
    status: 'completed',
    level: 3,
    description: 'CSS Grid, Flexbox, and animations',
    x: 70,
    y: 35,
    connections: ['tailwind'],
  },
  {
    id: 'hooks',
    label: 'React Hooks',
    status: 'in-progress',
    level: 2,
    description: 'Custom hooks and advanced patterns',
    x: 20,
    y: 60,
    connections: ['advanced'],
  },
  {
    id: 'state',
    label: 'State Mgmt',
    status: 'in-progress',
    level: 2,
    description: 'Redux, Zustand, and Context API',
    x: 40,
    y: 60,
    connections: ['advanced'],
  },
  {
    id: 'tailwind',
    label: 'Tailwind',
    status: 'in-progress',
    level: 2,
    description: 'Utility-first CSS framework',
    x: 75,
    y: 60,
    connections: ['design'],
  },
  {
    id: 'advanced',
    label: 'Advanced React',
    status: 'locked',
    level: 0,
    description: 'Performance, SSR, and architecture',
    x: 30,
    y: 85,
    connections: [],
  },
  {
    id: 'design',
    label: 'Design Systems',
    status: 'locked',
    level: 0,
    description: 'Building scalable component libraries',
    x: 70,
    y: 85,
    connections: [],
  },
];

export function SkillTreeVisualization(): React.JSX.Element {
  const [, setSelectedNode] = useState<SkillNode | null>(null);

  const getNodeColor = (status: SkillNode['status']): string => {
    switch (status) {
      case 'completed':
        return 'bg-brand-success ring-green-300 shadow-green-500/50';
      case 'in-progress':
        return 'bg-brand-primary ring-blue-300 shadow-blue-500/50';
      case 'locked':
        return 'bg-gray-400 dark:bg-gray-600 ring-gray-200 dark:ring-gray-700';
    }
  };

  const getNodeIcon = (status: SkillNode['status']): React.JSX.Element => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-brand-primary" />;
      case 'in-progress':
        return <Circle className="w-4 h-4 text-brand-primary" />;
      case 'locked':
        return <Lock className="w-4 h-4 text-brand-primary" />;
    }
  };

  // Generate SVG paths for connections
  const generatePath = (from: SkillNode, to: SkillNode): string => {
    const startX = from.x;
    const startY = from.y + 5;
    const endX = to.x;
    const endY = to.y - 5;

    // Create a curved path
    const midY = (startY + endY) / 2;
    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  };

  return (
    <TooltipProvider>
      <div className="relative w-full h-80 bg-brand-page rounded-xl overflow-hidden">
        {/* Grid Pattern Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* SVG Layer for Connections */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {SKILL_TREE_DATA.map((node) =>
            node.connections.map((targetId) => {
              const target = SKILL_TREE_DATA.find((n) => n.id === targetId);
              if (!target) return null;

              const isActive = node.status !== 'locked' && target.status !== 'locked';
              return (
                <path
                  key={`${node.id}-${targetId}`}
                  d={generatePath(node, target)}
                  fill="none"
                  stroke={isActive ? '#6366f1' : '#334155'}
                  strokeWidth="0.5"
                  strokeDasharray={isActive ? 'none' : '2,2'}
                  className="transition-all duration-300"
                />
              );
            }),
          )}
        </svg>

        {/* Skill Nodes */}
        {SKILL_TREE_DATA.map((node) => (
          <Tooltip key={node.id}>
            <TooltipTrigger asChild>
              <motion.button
                className={cn(
                  'absolute w-16 p-2 rounded-lg text-center transition-all duration-300',
                  'ring-2 shadow-lg hover:scale-110 cursor-pointer',
                  getNodeColor(node.status),
                )}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex justify-center mb-1">{getNodeIcon(node.status)}</div>
                <span className="text-[10px] font-medium text-brand-primary leading-tight block truncate">
                  {node.label}
                </span>
                {node.level > 0 && (
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {Array.from({ length: Math.min(node.level, 5) }).map((_, i) => (
                      <Star key={i} className="w-2 h-2 text-brand-warning fill-yellow-400" />
                    ))}
                  </div>
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <div className="font-medium">{node.label}</div>
                <div className="text-xs text-brand-muted">{node.description}</div>
                <div className="text-xs">
                  Level: {node.level} / 5 •{' '}
                  <span
                    className={cn(
                      node.status === 'completed' && 'text-brand-success',
                      node.status === 'in-progress' && 'text-brand-blue',
                      node.status === 'locked' && 'text-brand-muted',
                    )}
                  >
                    {node.status === 'completed' && 'Mastered'}
                    {node.status === 'in-progress' && 'Learning'}
                    {node.status === 'locked' && 'Locked'}
                  </span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex gap-4 text-xs text-brand-primary/60">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-brand-success" />
            <span>Mastered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-brand-primary" />
            <span>Learning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-400 dark:bg-gray-600" />
            <span>Locked</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
