// ============================================================================
// Integration Identifiers
// ============================================================================

/**
 * Supported integration service identifiers
 * Current stack: GCP (Firebase, Firestore, Cloud Run, Vertex AI)
 */
export type IntegrationId =
  | 'openai'
  | 'anthropic'
  | 'google-cloud'
  | 'firebase'
  | 'stripe'
  | 'brevo';

// ============================================================================
// Integration Status
// ============================================================================

/**
 * Status of an integration connection
 */
export type IntegrationStatus =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'degraded'
  | 'initializing'
  | 'not_configured';

// ============================================================================
// Integration Configuration
// ============================================================================

/**
 * Configuration for an integration
 */
export interface IntegrationConfig {
  id: IntegrationId;
  name: string;
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  options?: Record<string, unknown>;
}

/**
 * Health check result for an integration
 */
export interface IntegrationHealth {
  id: IntegrationId;
  status: IntegrationStatus;
  latencyMs?: number;
  message?: string;
  lastChecked: Date;
}

/**
 * Integration service interface
 */
export interface IntegrationService {
  id: IntegrationId;
  name: string;
  checkHealth(): Promise<IntegrationHealth>;
  isConfigured(): boolean;
}
