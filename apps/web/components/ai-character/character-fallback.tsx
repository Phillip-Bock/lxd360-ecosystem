'use client';

import { motion, type TargetAndTransition, type Transition } from 'framer-motion';
import { AI_PERSONAS, type AIPersonaId } from '@/lib/ai-personas/persona-config';
import type { CharacterState } from '@/lib/three/character-states';

interface CharacterFallbackProps {
  personaId: AIPersonaId;
  state: CharacterState;
  className?: string;
}

export function CharacterFallback({ personaId, state, className }: CharacterFallbackProps) {
  const persona = AI_PERSONAS[personaId];
  const Icon = persona.fallbackIcon;

  const stateAnimations: Record<CharacterState, TargetAndTransition> = {
    idle: {
      scale: [1, 1.02, 1],
      y: [0, -4, 0],
    },
    thinking: {
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
    },
    speaking: {
      scale: [1, 1.05, 0.98, 1.05, 1],
    },
    listening: {
      scale: [1, 1.03, 1],
    },
    celebrating: {
      rotate: [-15, 15, -15],
      y: [0, -10, 0],
    },
    error: {
      x: [-5, 5, -5, 5, 0],
    },
  };

  const stateTransitions: Record<CharacterState, Transition> = {
    idle: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' },
    thinking: { duration: 1.5, repeat: Number.POSITIVE_INFINITY },
    speaking: { duration: 0.4, repeat: Number.POSITIVE_INFINITY },
    listening: { duration: 1, repeat: Number.POSITIVE_INFINITY },
    celebrating: { duration: 0.5, repeat: 3 },
    error: { duration: 0.4 },
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Glow background */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        animate={{
          opacity: state === 'thinking' ? [0.2, 0.4, 0.2] : 0.25,
          scale: state === 'thinking' ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        style={{ backgroundColor: persona.primaryColor }}
      />

      {/* Character icon */}
      <motion.div
        animate={stateAnimations[state]}
        transition={stateTransitions[state]}
        className="relative z-10"
      >
        <Icon className="w-20 h-20" style={{ color: persona.primaryColor }} strokeWidth={1.5} />
      </motion.div>

      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: persona.accentColor }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />

      {/* Persona name badge */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ backgroundColor: persona.primaryColor, color: 'white' }}
      >
        {persona.name}
      </div>
    </div>
  );
}
