'use client';

import { useCallback, useEffect, useState } from 'react';
import { type AssetSource, getPersonaModelUrl } from './asset-loader';
import type { AIPersonaId } from './persona-config';

interface UsePersonaAssetOptions {
  personaId: AIPersonaId;
  tenantId?: string | null;
}

interface UsePersonaAssetResult {
  source: AssetSource | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePersonaAsset({
  personaId,
  tenantId,
}: UsePersonaAssetOptions): UsePersonaAssetResult {
  const [source, setSource] = useState<AssetSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAsset = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getPersonaModelUrl(personaId, tenantId);
      setSource(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load persona asset'));
      setSource({ type: 'fallback', url: null });
    } finally {
      setIsLoading(false);
    }
  }, [personaId, tenantId]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  return {
    source,
    isLoading,
    error,
    refetch: fetchAsset,
  };
}
