// TODO(LXD-300): Implement with Vertex AI (Gemini) as primary provider

import type {
  AICompletionRequest,
  AICompletionResponse,
  AIEmbeddingRequest,
  AIEmbeddingResponse,
  AIImageRequest,
  AIImageResponse,
  AIModelConfig,
  AIProvider,
  AIStreamChunk,
} from './types';

// ============================================================================
// Migration Error Helper
// ============================================================================

function migrationError(operation: string): never {
  throw new Error(
    `${operation}: Not yet implemented - GCP migration in progress. Use Vertex AI directly.`,
  );
}

// ============================================================================
// Model Configuration
// ============================================================================

export const AI_MODELS: AIModelConfig[] = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    capabilities: ['text-generation', 'chat', 'vision', 'function-calling', 'streaming'],
    contextLength: 128000,
    costPer1kPromptTokens: 0.005,
    costPer1kCompletionTokens: 0.015,
    isDefault: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    capabilities: ['text-generation', 'chat', 'vision', 'function-calling', 'streaming'],
    contextLength: 128000,
    costPer1kPromptTokens: 0.00015,
    costPer1kCompletionTokens: 0.0006,
  },
  // Anthropic Models
  {
    id: 'claude-sonnet-4-5-20250929',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    capabilities: ['text-generation', 'chat', 'vision', 'function-calling', 'streaming'],
    contextLength: 200000,
    costPer1kPromptTokens: 0.003,
    costPer1kCompletionTokens: 0.015,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    capabilities: ['text-generation', 'chat', 'streaming'],
    contextLength: 200000,
    costPer1kPromptTokens: 0.001,
    costPer1kCompletionTokens: 0.005,
  },
  // Google Models (Primary - GCP Migration)
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    capabilities: ['text-generation', 'chat', 'vision', 'function-calling', 'streaming'],
    contextLength: 1000000,
    costPer1kPromptTokens: 0.00015,
    costPer1kCompletionTokens: 0.0006,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    capabilities: ['text-generation', 'chat', 'vision', 'function-calling', 'streaming'],
    contextLength: 2000000,
    costPer1kPromptTokens: 0.00125,
    costPer1kCompletionTokens: 0.005,
  },
];

// ============================================================================
// Stub Provider Detection
// ============================================================================

/**
 * Get the best available provider
 * TODO(LXD-300): Implement with actual provider detection
 */
function getAvailableProvider(): AIProvider | null {
  // During migration, return null - no providers configured yet
  return null;
}

/**
 * Get provider from model ID
 */
function getProviderFromModel(modelId: string): AIProvider | null {
  const model = AI_MODELS.find((m) => m.id === modelId);
  return model?.provider ?? null;
}

/**
 * Check if a provider is configured
 * TODO(LXD-300): Implement with actual provider configuration checks
 */
function isProviderConfigured(_provider: AIProvider): boolean {
  // During migration, no providers are configured
  return false;
}

// ============================================================================
// Unified AI Client
// ============================================================================

class UnifiedAIClient {
  /**
   * Get default model for a provider
   */
  getDefaultModel(provider?: AIProvider): AIModelConfig | null {
    const targetProvider = provider ?? getAvailableProvider();
    if (!targetProvider) return null;

    return (
      AI_MODELS.find((m) => m.provider === targetProvider && m.isDefault) ??
      AI_MODELS.find((m) => m.provider === targetProvider) ??
      null
    );
  }

  /**
   * Get all available models
   */
  getAvailableModels(): AIModelConfig[] {
    return AI_MODELS.filter((m) => isProviderConfigured(m.provider));
  }

  /**
   * Generate a completion
   * TODO(LXD-300): Implement with Vertex AI
   */
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const provider =
      request.provider ?? getProviderFromModel(request.model ?? '') ?? getAvailableProvider();

    if (!provider) {
      throw new Error('No AI provider configured. GCP migration in progress.');
    }

    switch (provider) {
      case 'openai':
        return this.completeWithOpenAI(request);
      case 'anthropic':
        return this.completeWithAnthropic(request);
      case 'google':
      case 'gemini':
        return this.completeWithGoogle(request);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Generate embeddings
   * TODO(LXD-300): Implement with Vertex AI
   */
  async embed(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    const provider = request.provider ?? getAvailableProvider();

    if (!provider) {
      throw new Error('No AI provider configured. GCP migration in progress.');
    }

    switch (provider) {
      case 'openai':
        return this.embedWithOpenAI(request);
      case 'google':
      case 'gemini':
        return this.embedWithGoogle(request);
      default:
        throw new Error(`Embeddings not supported for provider: ${provider}`);
    }
  }

  /**
   * Generate images
   * TODO(LXD-300): Implement with Imagen on Vertex AI
   */
  async generateImage(request: AIImageRequest): Promise<AIImageResponse> {
    const provider = request.provider ?? 'openai';

    switch (provider) {
      case 'openai':
        return this.imageWithOpenAI(request);
      case 'google':
      case 'gemini':
        return this.imageWithGoogle(request);
      default:
        throw new Error(`Image generation not supported for provider: ${provider}`);
    }
  }

  /**
   * Stream a completion
   * TODO(LXD-300): Implement with Vertex AI streaming
   */
  async *stream(request: AICompletionRequest): AsyncGenerator<AIStreamChunk, void, unknown> {
    const provider =
      request.provider ?? getProviderFromModel(request.model ?? '') ?? getAvailableProvider();

    if (!provider) {
      throw new Error('No AI provider configured. GCP migration in progress.');
    }

    // TODO(LXD-300): Implement proper streaming for each provider
    // For now, return the full response as a single chunk
    const response = await this.complete({ ...request, stream: false });
    yield {
      content: response.content,
      finishReason: response.finishReason,
      usage: response.usage,
    };
  }

  // ==========================================================================
  // Provider-Specific Stub Implementations
  // ==========================================================================

  private async completeWithOpenAI(_request: AICompletionRequest): Promise<AICompletionResponse> {
    migrationError('OpenAI completion');
  }

  private async completeWithAnthropic(
    _request: AICompletionRequest,
  ): Promise<AICompletionResponse> {
    migrationError('Anthropic completion');
  }

  private async completeWithGoogle(_request: AICompletionRequest): Promise<AICompletionResponse> {
    migrationError('Google/Vertex AI completion');
  }

  private async embedWithOpenAI(_request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    migrationError('OpenAI embedding');
  }

  private async embedWithGoogle(_request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    migrationError('Google/Vertex AI embedding');
  }

  private async imageWithOpenAI(_request: AIImageRequest): Promise<AIImageResponse> {
    migrationError('OpenAI image generation');
  }

  private async imageWithGoogle(_request: AIImageRequest): Promise<AIImageResponse> {
    migrationError('Google/Imagen image generation');
  }
}

// ============================================================================
// Export Singleton
// ============================================================================

export const ai = new UnifiedAIClient();
