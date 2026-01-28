'use client';

import { type ComponentType, Suspense, useEffect, useState } from 'react';
import type { AIPersonaId } from '@/lib/ai-personas/persona-config';
import { usePersonaAsset } from '@/lib/ai-personas/use-persona-asset';
import type { CharacterState } from '@/lib/three/character-states';
import { CharacterFallback } from './character-fallback';

interface Character3DProps {
  modelUrl: string;
  personaId: AIPersonaId;
  state: CharacterState;
  mouthOpenness?: number;
  className?: string;
}

interface CharacterDisplayProps {
  personaId: AIPersonaId;
  state: CharacterState;
  mouthOpenness?: number;
  tenantId?: string | null;
  className?: string;
}

export function CharacterDisplay({
  personaId,
  state,
  mouthOpenness = 0,
  tenantId,
  className,
}: CharacterDisplayProps) {
  const { source, isLoading } = usePersonaAsset({ personaId, tenantId });
  // Lazy-loaded Character3D component (client-only)
  const [Character3D, setCharacter3D] = useState<ComponentType<Character3DProps> | null>(null);

  // Load Character3D only on the client after mount
  useEffect(() => {
    let cancelled = false;
    import('./Character3D')
      .then((mod) => {
        if (!cancelled) {
          setCharacter3D(() => mod.Character3D);
        }
      })
      .catch(() => {
        // Failed to load 3D component, will use fallback
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Loading state or 3D component not loaded yet
  if (isLoading || !source) {
    return <CharacterFallback personaId={personaId} state="idle" className={className} />;
  }

  // 3D model available and component loaded
  if (source.url && Character3D) {
    return (
      <Suspense
        fallback={<CharacterFallback personaId={personaId} state={state} className={className} />}
      >
        <Character3D
          modelUrl={source.url}
          personaId={personaId}
          state={state}
          mouthOpenness={mouthOpenness}
          className={className}
        />
      </Suspense>
    );
  }

  // 2D fallback (either no 3D model or component not loaded yet)
  return <CharacterFallback personaId={personaId} state={state} className={className} />;
}
