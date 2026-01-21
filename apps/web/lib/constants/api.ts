// API endpoint constants
// Centralized configuration for external API URLs

/**
 * Google AI API endpoints
 */
export const GOOGLE_AI = {
  /** Gemini API base URL */
  GEMINI_API_BASE: 'https://generativelanguage.googleapis.com/v1beta',
  /** Gemini models endpoint */
  GEMINI_MODELS: 'https://generativelanguage.googleapis.com/v1beta/models',
  /** Vertex AI base URL (us-central1) */
  VERTEX_AI_BASE: 'https://us-central1-aiplatform.googleapis.com/v1',
} as const;

/**
 * Get Gemini API URL with optional region override
 */
export function getGeminiApiUrl(region?: string): string {
  if (region) {
    return `https://${region}-aiplatform.googleapis.com/v1`;
  }
  return GOOGLE_AI.GEMINI_API_BASE;
}
