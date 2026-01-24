'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { AIPersonaId } from '@/lib/ai-personas/persona-config';
import { usePersonaAsset } from '@/lib/ai-personas/use-persona-asset';
import type { CharacterState } from '@/lib/three/character-states';
import { CharacterFallback } from './CharacterFallback';

const Character3D = dynamic(() => import('./Character3D').then((m) => m.Character3D), {
  ssr: false,
  loading: () => null,
});

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

  // Loading state
  if (isLoading || !source) {
    return <CharacterFallback personaId={personaId} state="idle" className={className} />;
  }

  // 3D model available (tenant or platform)
  if (source.url) {
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

  // 2D fallback
  return <CharacterFallback personaId={personaId} state={state} className={className} />;
}
