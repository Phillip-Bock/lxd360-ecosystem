'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Compass,
  Eye,
  Flame,
  Info,
  Layers,
  Puzzle,
  Rocket,
  Target,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { INSPIREStage } from '@/types/inspire-studio';

// INSPIRE Stage Configuration
const INSPIRE_STAGES = [
  {
    id: 'ignite' as INSPIREStage,
    name: 'Ignite',
    letter: 'I',
    description: 'Capture attention, spark curiosity',
    icon: Flame,
    color: '#f97316',
    tips: [
      'Start with a thought-provoking question',
      'Use surprising statistics or facts',
      'Share a relevant story or scenario',
      'Create cognitive dissonance',
    ],
  },
  {
    id: 'navigate' as INSPIREStage,
    name: 'Navigate',
    letter: 'N',
    description: 'Provide roadmap, set expectations',
    icon: Compass,
    color: 'var(--info)',
    tips: [
      'Clearly state learning objectives',
      'Show the course structure overview',
      'Explain what learners will be able to do',
      'Set time expectations',
    ],
  },
  {
    id: 'scaffold' as INSPIREStage,
    name: 'Scaffold',
    letter: 'S',
    description: 'Build foundation, connect prior knowledge',
    icon: Layers,
    color: '#a855f7',
    tips: [
      'Activate prior knowledge',
      'Present concepts in logical sequence',
      'Use analogies and metaphors',
      'Chunk information appropriately',
    ],
  },
  {
    id: 'practice' as INSPIREStage,
    name: 'Practice',
    letter: 'P',
    description: 'Active learning, hands-on application',
    icon: Target,
    color: 'var(--success)',
    tips: [
      'Provide immediate feedback',
      'Include varied practice activities',
      'Allow safe failure',
      'Increase complexity gradually',
    ],
  },
  {
    id: 'integrate' as INSPIREStage,
    name: 'Integrate',
    letter: 'I',
    description: 'Connect concepts, synthesize learning',
    icon: Puzzle,
    color: '#06b6d4',
    tips: [
      'Connect to real-world applications',
      'Show relationships between concepts',
      'Use case studies and scenarios',
      'Encourage cross-domain thinking',
    ],
  },
  {
    id: 'reflect' as INSPIREStage,
    name: 'Reflect',
    letter: 'R',
    description: 'Metacognition, self-assessment',
    icon: Eye,
    color: '#ec4899',
    tips: [
      'Prompt self-evaluation',
      'Ask reflection questions',
      'Review key takeaways',
      'Identify knowledge gaps',
    ],
  },
  {
    id: 'extend' as INSPIREStage,
    name: 'Extend',
    letter: 'E',
    description: 'Transfer, apply beyond course',
    icon: Rocket,
    color: 'var(--warning)',
    tips: [
      'Provide action planning tools',
      'Suggest further resources',
      'Set post-course challenges',
      'Create accountability structures',
    ],
  },
];

interface INSPIREStageSelectorProps {
  value?: INSPIREStage;
  onChange: (stage: INSPIREStage | undefined) => void;
  showTips?: boolean;
  compact?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
}

export function INSPIREStageSelector({
  value,
  onChange,
  showTips = true,
  compact = false,
  allowClear = true,
  disabled = false,
  className,
}: INSPIREStageSelectorProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredStage, setHoveredStage] = useState<INSPIREStage | null>(null);

  const selectedStage = INSPIRE_STAGES.find((s) => s.id === value);
  const displayStage = hoveredStage
    ? INSPIRE_STAGES.find((s) => s.id === hoveredStage)
    : selectedStage;

  const handleSelect = (stageId: INSPIREStage): void => {
    if (disabled) return;

    if (allowClear && value === stageId) {
      onChange(undefined);
    } else {
      onChange(stageId);
    }
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className={cn('relative', className)}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
            'bg-card border-border hover:border-(--primary)/50',
            disabled && 'opacity-50 cursor-not-allowed',
            isOpen && 'border-(--primary)',
          )}
        >
          {selectedStage ? (
            <>
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: `${selectedStage.color}20` }}
              >
                <selectedStage.icon
                  className="w-3.5 h-3.5"
                  style={{ color: selectedStage.color }}
                />
              </div>
              <span className="text-sm font-medium text-foreground">{selectedStage.name}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Select stage...</span>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              isOpen && 'rotate-180',
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
            >
              {INSPIRE_STAGES.map((stage) => (
                <button
                  type="button"
                  key={stage.id}
                  onClick={() => handleSelect(stage.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left',
                    value === stage.id && 'bg-muted/30',
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stage.color}20` }}
                  >
                    <stage.icon className="w-4 h-4" style={{ color: stage.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{stage.name}</div>
                    <div className="text-xs text-muted-foreground">{stage.description}</div>
                  </div>
                  {value === stage.id && <Check className="w-4 h-4 text-(--primary)" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stage Grid */}
      <div className="space-y-2">
        {INSPIRE_STAGES.map((stage) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => handleSelect(stage.id)}
            onMouseEnter={() => setHoveredStage(stage.id)}
            onMouseLeave={() => setHoveredStage(null)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
              'border-2',
              value === stage.id
                ? 'border-current'
                : 'border-border hover:border-(--primary)/30 bg-card',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
            style={{
              backgroundColor: value === stage.id ? `${stage.color}15` : undefined,
              borderColor: value === stage.id ? stage.color : undefined,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${stage.color}20` }}
            >
              <stage.icon className="w-5 h-5" style={{ color: stage.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                >
                  {stage.letter}
                </span>
                <span className="font-medium text-foreground">{stage.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
            </div>
            {value === stage.id && (
              <Check className="w-5 h-5 shrink-0" style={{ color: stage.color }} />
            )}
          </button>
        ))}
      </div>

      {/* Tips Panel */}
      {showTips && displayStage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl p-4 border"
          style={{
            backgroundColor: `${displayStage.color}10`,
            borderColor: `${displayStage.color}30`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4" style={{ color: displayStage.color }} />
            <span className="text-sm font-medium text-foreground">
              {displayStage.name} Stage Tips
            </span>
          </div>
          <ul className="space-y-1.5">
            {displayStage.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span style={{ color: displayStage.color }}>•</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

// Export stages for use elsewhere
export { INSPIRE_STAGES };
export type { INSPIREStageSelectorProps };
