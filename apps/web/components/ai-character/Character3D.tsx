'use client';

/**
 * Character3D — 3D Avatar Component (TEMPORARILY STUBBED)
 *
 * TODO: Re-enable 3D rendering when @react-three/drei is compatible with three@0.182.0
 * The drei library uses deprecated PlaneBufferGeometry which was removed in Three.js 0.182.0
 *
 * For now, this returns a simple placeholder to unblock testing.
 */

import type { AIPersonaId } from '@/lib/ai-personas/persona-config';
import { AI_PERSONAS } from '@/lib/ai-personas/persona-config';
import type { CharacterState } from '@/lib/three/character-states';

interface Character3DProps {
  modelUrl: string;
  personaId: AIPersonaId;
  state: CharacterState;
  mouthOpenness?: number;
  className?: string;
}

/**
 * Character3D - Temporarily stubbed due to Three.js version incompatibility
 *
 * The @react-three/drei@9.0.0-beta.6 package uses PlaneBufferGeometry which
 * was removed in three@0.182.0. Until drei is updated, we show a placeholder.
 */
export function Character3D({ personaId, state, className }: Character3DProps) {
  const persona = AI_PERSONAS[personaId];

  // Placeholder avatar with persona colors
  return (
    <div
      className={`flex items-center justify-center ${className || ''}`}
      style={{
        background: `linear-gradient(135deg, ${persona.primaryColor}20, ${persona.accentColor}20)`,
        borderRadius: '50%',
        aspectRatio: '1',
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
        style={{
          background: `linear-gradient(135deg, ${persona.primaryColor}, ${persona.accentColor})`,
          color: 'white',
        }}
      >
        {persona.name.charAt(0)}
      </div>
      {/* State indicator */}
      {state === 'speaking' && (
        <div
          className="absolute bottom-2 right-2 w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: persona.accentColor }}
        />
      )}
    </div>
  );
}
