// ============================================================================
// Provider Types
// ============================================================================

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'gemini';

export type AICapability =
  | 'text-generation'
  | 'chat'
  | 'embeddings'
  | 'image-generation'
  | 'vision'
  | 'function-calling'
  | 'streaming'
  | 'speech-to-text'
  | 'text-to-speech';

// ============================================================================
// Message Types
// ============================================================================

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | AIContentPart[];
  name?: string;
}

export interface AIContentPart {
  type: 'text' | 'image' | 'audio';
  text?: string;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
}

// ============================================================================
// Request Types
// ============================================================================

export interface AICompletionRequest {
  messages: AIMessage[];
  model?: string;
  provider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  stream?: boolean;
  responseFormat?: 'text' | 'json';
  functions?: AIFunction[];
  functionCall?: 'auto' | 'none' | { name: string };
}

export interface AIEmbeddingRequest {
  input: string | string[];
  model?: string;
  provider?: AIProvider;
  dimensions?: number;
}

export interface AIImageRequest {
  prompt: string;
  model?: string;
  provider?: AIProvider;
  size?: string;
  quality?: 'standard' | 'hd';
  n?: number;
}

// ============================================================================
// Response Types
// ============================================================================

export interface AICompletionResponse {
  content: string;
  provider: AIProvider;
  model: string;
  finishReason: 'stop' | 'length' | 'function_call' | 'content_filter' | 'error';
  usage?: AIUsage;
  functionCall?: {
    name: string;
    arguments: string;
  };
}

export interface AIEmbeddingResponse {
  embeddings: number[][];
  provider: AIProvider;
  model: string;
  usage?: AIUsage;
}

export interface AIImageResponse {
  images: {
    url?: string;
    base64?: string;
    revisedPrompt?: string;
  }[];
  provider: AIProvider;
  model: string;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
}

// ============================================================================
// Function Calling Types
// ============================================================================

export interface AIFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, AIFunctionParameter>;
    required?: string[];
  };
}

export interface AIFunctionParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  items?: AIFunctionParameter;
}

// ============================================================================
// Streaming Types
// ============================================================================

export interface AIStreamChunk {
  content: string;
  finishReason?: string;
  usage?: AIUsage;
}

// ============================================================================
// Cost Tracking Types
// ============================================================================

export interface AICostEntry {
  timestamp: Date;
  provider: AIProvider;
  model: string;
  operation: 'completion' | 'embedding' | 'image';
  promptTokens: number;
  completionTokens: number;
  cost: number;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface AICostSummary {
  totalCost: number;
  totalTokens: number;
  byProvider: Record<
    AIProvider,
    {
      cost: number;
      tokens: number;
      requests: number;
    }
  >;
  byModel: Record<
    string,
    {
      cost: number;
      tokens: number;
      requests: number;
    }
  >;
  period: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

export interface AIRateLimitConfig {
  provider: AIProvider;
  requestsPerMinute: number;
  tokensPerMinute: number;
  tokensPerDay?: number;
}

export interface AIRateLimitState {
  requestsRemaining: number;
  tokensRemaining: number;
  resetAt: Date;
}

// ============================================================================
// Model Configuration
// ============================================================================

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  capabilities: AICapability[];
  contextLength: number;
  costPer1kPromptTokens: number;
  costPer1kCompletionTokens: number;
  isDefault?: boolean;
}

// ============================================================================
// Prompt Template Types
// ============================================================================

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string;
  variables: string[];
  defaultProvider?: AIProvider;
  defaultModel?: string;
  systemPrompt?: string;
}

export interface PromptVariables {
  [key: string]: string | number | boolean;
}
