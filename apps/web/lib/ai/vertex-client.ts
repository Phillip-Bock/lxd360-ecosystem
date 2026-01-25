import { getAccessToken, getProjectId, hasGoogleCredentials } from '@/lib/google/auth';
import { logger } from '@/lib/logger';

const log = logger.scope('VertexAI');

import type {
  DocumentProcessingRequest,
  DocumentProcessingResponse,
  EmbeddingModelId,
  GeminiModelId,
  LearnerChurnPrediction,
  LearnerEngagementScore,
  VertexAgentMemory,
  VertexAgentSession,
  VertexClientConfig,
  VertexEmbeddingRequest,
  VertexGenerateContentRequest,
  VertexGenerateContentResponse,
} from '@/types/ai/vertex';

// ============================================================================
// Constants
// ============================================================================

const VERTEX_AI_BASE = 'https://us-central1-aiplatform.googleapis.com/v1';
const DEFAULT_LOCATION = 'us-central1';

/**
 * Default models for different tasks
 */
export const VERTEX_MODELS = {
  TEXT: 'gemini-2.5-flash' as GeminiModelId,
  EMBEDDING: 'gemini-embedding-001' as EmbeddingModelId,
  AGENT: 'gemini-2.5-pro' as GeminiModelId,
} as const;

// ============================================================================
// Vertex AI Client Class
// ============================================================================

/**
 * Vertex AI client for LXP360 learning platform.
 *
 * Provides access to:
 * - Gemini text generation
 * - Embedding generation
 * - Agent Builder sessions
 * - Document AI processing
 * - BigQuery ML predictions
 *
 * @example
 * ```typescript
 * const client = new VertexAIClient({
 *   projectId: 'lxd-saas-dev',
 *   location: 'us-central1',
 * });
 *
 * const response = await client.generateText('Explain photosynthesis');
 * ```
 */
export class VertexAIClient {
  private readonly config: VertexClientConfig;

  constructor(config?: Partial<VertexClientConfig>) {
    this.config = {
      projectId: config?.projectId ?? getProjectId(),
      location: config?.location ?? DEFAULT_LOCATION,
      defaultModel: config?.defaultModel ?? VERTEX_MODELS.TEXT,
      enableLogging: config?.enableLogging ?? false,
      ...config,
    };
  }

  // ==========================================================================
  // Text Generation
  // ==========================================================================

  /**
   * Generate text content using Gemini models.
   *
   * @param prompt - The text prompt
   * @param options - Generation options
   * @returns Generated text and usage metadata
   *
   * TODO(LXD-245): Implement full generation with @google/genai SDK
   */
  async generateText(
    prompt: string,
    options?: {
      model?: GeminiModelId;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<{ text: string; tokenUsage?: { input: number; output: number } }> {
    if (!hasGoogleCredentials()) {
      log.warn('Google credentials not configured');
      return {
        text: '',
        tokenUsage: { input: 0, output: 0 },
      };
    }

    const model = options?.model ?? this.config.defaultModel ?? VERTEX_MODELS.TEXT;
    const projectId = this.config.projectId;
    const location = this.config.location;

    const request: VertexGenerateContentRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 8192,
      },
    };

    if (options?.systemPrompt) {
      request.systemInstruction = {
        parts: [{ text: options.systemPrompt }],
      };
    }

    const url = `${VERTEX_AI_BASE}/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
    const accessToken = await getAccessToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vertex AI generation failed: ${errorText}`);
    }

    const data: VertexGenerateContentResponse = await response.json();
    const textContent =
      data.candidates[0]?.content?.parts
        ?.filter((p) => p.text)
        ?.map((p) => p.text)
        ?.join('') ?? '';

    return {
      text: textContent,
      tokenUsage: data.usageMetadata
        ? {
            input: data.usageMetadata.promptTokenCount,
            output: data.usageMetadata.candidatesTokenCount,
          }
        : undefined,
    };
  }

  // ==========================================================================
  // Embeddings
  // ==========================================================================

  /**
   * Generate embeddings for text content.
   *
   * @param input - Text or array of texts to embed
   * @param options - Embedding options
   * @returns Array of embedding vectors (768 dimensions for gemini-embedding-001)
   */
  async generateEmbeddings(
    input: string | string[],
    options?: {
      model?: EmbeddingModelId;
      taskType?: VertexEmbeddingRequest['taskType'];
    },
  ): Promise<number[][]> {
    if (!hasGoogleCredentials()) {
      log.warn('Google credentials not configured for embeddings');
      const texts = Array.isArray(input) ? input : [input];
      return texts.map(() => []);
    }

    const texts = Array.isArray(input) ? input : [input];
    if (texts.length === 0) return [];

    const model = options?.model ?? VERTEX_MODELS.EMBEDDING;
    const projectId = this.config.projectId;
    const location = this.config.location;

    // Vertex AI embedding endpoint
    const url = `${VERTEX_AI_BASE}/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

    try {
      const accessToken = await getAccessToken();

      // Build instances for batch embedding
      const instances = texts.map((text) => ({
        content: text,
        task_type: options?.taskType ?? 'SEMANTIC_SIMILARITY',
      }));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instances }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        log.error('Embedding generation failed', { status: response.status, error: errorText });
        // Return empty arrays on error
        return texts.map(() => []);
      }

      const data = await response.json();

      // Extract embeddings from response
      // Response format: { predictions: [{ embeddings: { values: number[] } }] }
      const embeddings: number[][] =
        data.predictions?.map(
          (pred: { embeddings?: { values?: number[] } }) => pred.embeddings?.values ?? [],
        ) ?? texts.map(() => []);

      log.debug('Embeddings generated', {
        count: embeddings.length,
        dimensions: embeddings[0]?.length ?? 0,
      });

      return embeddings;
    } catch (error) {
      log.error('Embedding generation error', { error });
      return texts.map(() => []);
    }
  }

  // ==========================================================================
  // Agent Builder
  // ==========================================================================

  /**
   * Create or retrieve an agent session for a learner.
   *
   * @param learnerId - The learner's user ID
   * @param organizationId - The organization ID
   * @returns Agent session
   *
   * TODO(LXD-245): Implement with Agent Engine API
   */
  async getOrCreateAgentSession(
    learnerId: string,
    organizationId: string,
  ): Promise<VertexAgentSession> {
    void learnerId;
    void organizationId;

    // TODO(LXD-245): Implement Agent Engine session management
    log.warn('getOrCreateAgentSession is not yet implemented');

    return {
      id: 'stub-session-id',
      userId: learnerId,
      organizationId,
      createdAt: new Date(),
      lastActivityAt: new Date(),
    };
  }

  /**
   * Send a message to the AI learning assistant.
   *
   * @param sessionId - The agent session ID
   * @param message - The user message
   * @returns Assistant response
   *
   * TODO(LXD-245): Implement with Agent Engine + memory
   */
  async sendAgentMessage(
    sessionId: string,
    message: string,
  ): Promise<{ response: string; suggestedActions?: string[] }> {
    void sessionId;
    void message;

    // TODO(LXD-245): Implement agent conversation with memory
    log.warn('sendAgentMessage is not yet implemented');

    return {
      response: 'AI Learning Assistant is not yet configured.',
      suggestedActions: [],
    };
  }

  /**
   * Retrieve long-term memory for a learner.
   *
   * @param sessionId - The agent session ID
   * @param topic - Optional topic filter
   * @returns Memory entries
   *
   * TODO(LXD-245): Implement Agent Engine Memory Bank
   */
  async getAgentMemory(sessionId: string, topic?: string): Promise<VertexAgentMemory[]> {
    void sessionId;
    void topic;

    // TODO(LXD-245): Implement memory retrieval
    log.warn('getAgentMemory is not yet implemented');

    return [];
  }

  // ==========================================================================
  // Document AI
  // ==========================================================================

  /**
   * Process a document using Document AI.
   *
   * @param request - Document processing request
   * @returns Extracted document content
   *
   * TODO(LXD-245): Implement with Document AI Enterprise OCR
   */
  async processDocument(request: DocumentProcessingRequest): Promise<DocumentProcessingResponse> {
    void request;

    // TODO(LXD-245): Implement Document AI processing
    log.warn('processDocument is not yet implemented');

    return {
      text: '',
      textBlocks: [],
      pageCount: 0,
      metadata: {
        processorVersion: 'stub',
        processedAt: new Date(),
      },
    };
  }

  // ==========================================================================
  // BigQuery ML (Learning Analytics)
  // ==========================================================================

  /**
   * Predict learner churn risk.
   *
   * @param learnerId - The learner ID
   * @param organizationId - The organization ID
   * @returns Churn prediction with risk factors
   *
   * TODO(LXD-245): Implement with BigQuery ML LOGISTIC_REG model
   */
  async predictLearnerChurn(
    learnerId: string,
    organizationId: string,
  ): Promise<LearnerChurnPrediction> {
    void learnerId;
    void organizationId;

    // TODO(LXD-245): Implement BigQuery ML prediction
    log.warn('predictLearnerChurn is not yet implemented');

    return {
      learnerId,
      churnProbability: 0,
      predictedChurn: false,
      riskLevel: 'low',
      factors: [],
      predictedAt: new Date(),
    };
  }

  /**
   * Calculate learner engagement score.
   *
   * @param learnerId - The learner ID
   * @param organizationId - The organization ID
   * @returns Engagement score with component breakdown
   *
   * TODO(LXD-245): Implement with BigQuery ML scoring model
   */
  async calculateEngagementScore(
    learnerId: string,
    organizationId: string,
  ): Promise<LearnerEngagementScore> {
    void learnerId;
    void organizationId;

    // TODO(LXD-245): Implement engagement scoring
    log.warn('calculateEngagementScore is not yet implemented');

    return {
      learnerId,
      score: 0,
      level: 'passive',
      components: {
        activityFrequency: 0,
        contentCompletion: 0,
        assessmentPerformance: 0,
        sessionDuration: 0,
      },
      calculatedAt: new Date(),
    };
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Check if Vertex AI is properly configured.
   *
   * @returns Configuration status
   */
  isConfigured(): boolean {
    return hasGoogleCredentials() && Boolean(this.config.projectId);
  }

  /**
   * Get the current client configuration.
   *
   * @returns Client configuration (redacted)
   */
  getConfig(): Omit<VertexClientConfig, 'customFetch'> {
    return {
      projectId: this.config.projectId,
      location: this.config.location,
      defaultModel: this.config.defaultModel,
      enableLogging: this.config.enableLogging,
    };
  }
}

// ============================================================================
// Default Export
// ============================================================================

/**
 * Singleton instance of the Vertex AI client.
 *
 * @example
 * ```typescript
 * import { vertexAI } from '@/lib/ai/vertex-client';
 *
 * const result = await vertexAI.generateText('Hello');
 * ```
 */
export const vertexAI = new VertexAIClient();
