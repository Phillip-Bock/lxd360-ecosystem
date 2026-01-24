import { AI_PERSONAS, type AIPersonaId } from './persona-config';

export interface AssetSource {
  type: 'tenant' | 'platform' | 'fallback';
  url: string | null;
}

/**
 * Cloud Storage bucket for tenant assets
 * Format: gs://lxd360-tenant-assets/{tenantId}/models/{persona}.glb
 */
const TENANT_ASSETS_BUCKET = 'lxd360-tenant-assets';
const GCS_PUBLIC_URL = `https://storage.googleapis.com/${TENANT_ASSETS_BUCKET}`;

/**
 * Check if a URL returns a valid response
 */
async function urlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get the model URL for a persona with hybrid fallback
 * Priority: Tenant Custom → Platform Default → null (use 2D fallback)
 */
export async function getPersonaModelUrl(
  personaId: AIPersonaId,
  tenantId?: string | null,
): Promise<AssetSource> {
  const persona = AI_PERSONAS[personaId];

  // 1. Check tenant custom model (if tenant ID provided)
  if (tenantId) {
    const tenantModelUrl = `${GCS_PUBLIC_URL}/${tenantId}/models/${personaId}.glb`;
    if (await urlExists(tenantModelUrl)) {
      return { type: 'tenant', url: tenantModelUrl };
    }
  }

  // 2. Check platform default model (local /public)
  if (await urlExists(persona.defaultModelPath)) {
    return { type: 'platform', url: persona.defaultModelPath };
  }

  // 3. No 3D model available, use 2D fallback
  return { type: 'fallback', url: null };
}

/**
 * Get model URLs for all personas (batch check)
 */
export async function getAllPersonaModelUrls(
  tenantId?: string | null,
): Promise<Record<AIPersonaId, AssetSource>> {
  const results = await Promise.all(
    (Object.keys(AI_PERSONAS) as AIPersonaId[]).map(async (id) => {
      const source = await getPersonaModelUrl(id, tenantId);
      return [id, source] as const;
    }),
  );

  return Object.fromEntries(results) as Record<AIPersonaId, AssetSource>;
}

/**
 * Check if tenant has custom characters uploaded (for upsell logic)
 */
export async function tenantHasCustomCharacters(tenantId: string): Promise<boolean> {
  const sources = await getAllPersonaModelUrls(tenantId);
  return Object.values(sources).some((s) => s.type === 'tenant');
}

/**
 * Get the signed upload URL for tenant to upload custom character
 * (This would typically be a server action or API route)
 */
export function getTenantUploadPath(tenantId: string, personaId: AIPersonaId): string {
  return `${tenantId}/models/${personaId}.glb`;
}
