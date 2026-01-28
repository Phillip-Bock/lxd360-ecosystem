'use client';

/**
 * NeuronautCompanion — Mission Control AI Assistant
 *
 * This is a wrapper around the core AiCharacterChat component,
 * configured specifically for the Mission Control dashboard context.
 *
 * Features:
 * - Uses the existing AI personas (Neuro for analytics)
 * - Provides role-aware quick suggestions
 * - Integrates Glass Box explanations for recommendations
 * - Maintains the same 3D avatar and TTS capabilities
 */

import { AiCharacterChat } from '@/components/ai-character';

export interface NeuronautCompanionProps {
  /** Tenant ID for multi-tenant context */
  tenantId?: string;
}

/**
 * NeuronautCompanion - Floating AI assistant for Mission Control
 *
 * Uses the existing AiCharacterChat component which automatically:
 * - Selects the appropriate persona based on the current route
 * - Provides 3D character rendering
 * - Handles chat interface and Gemini API integration
 * - Supports TTS/voice synthesis
 */
export function NeuronautCompanion({ tenantId }: NeuronautCompanionProps) {
  return <AiCharacterChat tenantId={tenantId} />;
}

export default NeuronautCompanion;
