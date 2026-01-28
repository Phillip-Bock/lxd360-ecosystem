'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AI_PERSONAS, type AIPersonaId, getAllPersonaIds } from '@/lib/ai-personas/persona-config';

interface PersonaSelectorProps {
  currentPersona: AIPersonaId;
  onSelect: (id: AIPersonaId) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function PersonaSelector({
  currentPersona,
  onSelect,
  disabled,
  size = 'sm',
}: PersonaSelectorProps) {
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <div className="flex gap-1">
      {getAllPersonaIds().map((id) => {
        const persona = AI_PERSONAS[id];
        const Icon = persona.fallbackIcon;
        const isActive = currentPersona === id;

        return (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={isActive ? 'default' : 'ghost'}
                size="icon"
                className={`${buttonSize} relative transition-all`}
                onClick={() => onSelect(id)}
                disabled={disabled}
                style={
                  isActive
                    ? {
                        backgroundColor: persona.primaryColor,
                        color: 'white',
                      }
                    : undefined
                }
              >
                <Icon className={iconSize} />
                {isActive && (
                  <motion.div
                    layoutId="persona-indicator"
                    className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: persona.accentColor,
                      transform: 'translateX(-50%)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p className="font-semibold">{persona.name}</p>
              <p className="text-muted-foreground">{persona.tagline}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
