// ============================================================================
// Gemini Model Types
// ============================================================================

/**
 * Available Gemini model identifiers
 */
export type GeminiModelId =
  | 'gemini-3.0-flash'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.0-flash'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash';

/**
 * Available embedding model identifiers
 */
export type EmbeddingModelId = 'gemini-embedding-001' | 'text-embedding-004';

/**
 * Available image generation model identifiers
 */
export type ImagenModelId = 'imagen-3.0-generate-001' | 'imagen-3.0-fast-generate-001';

// ============================================================================
// Generation Configuration
// ============================================================================

/**
 * Configuration for text generation requests
 */
export interface VertexGenerationConfig {
  /** Sampling temperature (0.0 - 2.0) */
  temperature?: number;
  /** Top-p nucleus sampling */
  topP?: number;
  /** Top-k sampling */
  topK?: number;
  /** Maximum tokens to generate */
  maxOutputTokens?: number;
  /** Sequences that stop generation */
  stopSequences?: string[];
  /** Response format: 'text/plain' or 'application/json' */
  responseMimeType?: string;
  /** Candidate count (usually 1) */
  candidateCount?: number;
}

/**
 * Safety setting thresholds
 */
export type SafetyThreshold =
  | 'HARM_BLOCK_THRESHOLD_UNSPECIFIED'
  | 'BLOCK_LOW_AND_ABOVE'
  | 'BLOCK_MEDIUM_AND_ABOVE'
  | 'BLOCK_ONLY_HIGH'
  | 'BLOCK_NONE';

/**
 * Harm categories for safety settings
 */
export type HarmCategory =
  | 'HARM_CATEGORY_HARASSMENT'
  | 'HARM_CATEGORY_HATE_SPEECH'
  | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
  | 'HARM_CATEGORY_DANGEROUS_CONTENT';

/**
 * Safety setting for content moderation
 */
export interface VertexSafetySetting {
  category: HarmCategory;
  threshold: SafetyThreshold;
}

// ============================================================================
// Request/Response Types
// ============================================================================

/**
 * Content part for multimodal requests
 */
export interface VertexContentPart {
  /** Text content */
  text?: string;
  /** Inline binary data (images, etc.) */
  inlineData?: {
    mimeType: string;
    data: string; // base64 encoded
  };
  /** File reference from Cloud Storage */
  fileData?: {
    mimeType: string;
    fileUri: string;
  };
}

/**
 * Content message for conversation
 */
export interface VertexContent {
  role: 'user' | 'model';
  parts: VertexContentPart[];
}

/**
 * System instruction for model behavior
 */
export interface VertexSystemInstruction {
  parts: VertexContentPart[];
}

/**
 * Request body for generate content API
 */
export interface VertexGenerateContentRequest {
  contents: VertexContent[];
  generationConfig?: VertexGenerationConfig;
  systemInstruction?: VertexSystemInstruction;
  safetySettings?: VertexSafetySetting[];
}

/**
 * Token usage metadata
 */
export interface VertexUsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  cachedContentTokenCount?: number;
}

/**
 * Response candidate from generation
 */
export interface VertexCandidate {
  content: {
    parts: VertexContentPart[];
    role: string;
  };
  finishReason:
    | 'FINISH_REASON_UNSPECIFIED'
    | 'STOP'
    | 'MAX_TOKENS'
    | 'SAFETY'
    | 'RECITATION'
    | 'OTHER';
  safetyRatings?: {
    category: HarmCategory;
    probability: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
  groundingMetadata?: VertexGroundingMetadata;
}

/**
 * Grounding metadata for search-grounded responses
 */
export interface VertexGroundingMetadata {
  searchEntryPoint?: {
    renderedContent: string;
  };
  groundingChunks?: {
    web?: {
      uri: string;
      title: string;
    };
  }[];
  webSearchQueries?: string[];
}

/**
 * Response from generate content API
 */
export interface VertexGenerateContentResponse {
  candidates: VertexCandidate[];
  usageMetadata?: VertexUsageMetadata;
  modelVersion?: string;
}

// ============================================================================
// Embedding Types
// ============================================================================

/**
 * Request for embedding generation
 */
export interface VertexEmbeddingRequest {
  /** Text(s) to embed */
  content: string | string[];
  /** Model to use */
  model?: EmbeddingModelId;
  /** Output dimension (if model supports) */
  outputDimensionality?: number;
  /** Task type for optimized embeddings */
  taskType?:
    | 'RETRIEVAL_QUERY'
    | 'RETRIEVAL_DOCUMENT'
    | 'SEMANTIC_SIMILARITY'
    | 'CLASSIFICATION'
    | 'CLUSTERING';
}

/**
 * Response from embedding API
 */
export interface VertexEmbeddingResponse {
  embeddings: {
    values: number[];
    statistics?: {
      truncated: boolean;
      tokenCount: number;
    };
  }[];
  model: string;
}

// ============================================================================
// Agent Builder Types
// ============================================================================

/**
 * Agent configuration for Vertex AI Agent Builder
 */
export interface VertexAgentConfig {
  /** Agent display name */
  displayName: string;
  /** Agent description */
  description?: string;
  /** Default language code */
  defaultLanguageCode: string;
  /** Supported language codes */
  supportedLanguageCodes?: string[];
  /** Time zone */
  timeZone: string;
  /** Model to power the agent */
  model: GeminiModelId;
  /** System instruction for agent behavior */
  systemInstruction?: string;
  /** Enable memory/sessions */
  enableMemory?: boolean;
}

/**
 * Agent session for stateful conversations
 */
export interface VertexAgentSession {
  /** Session ID */
  id: string;
  /** User ID associated with session */
  userId: string;
  /** Organization ID for multi-tenancy */
  organizationId: string;
  /** Session creation timestamp */
  createdAt: Date;
  /** Last activity timestamp */
  lastActivityAt: Date;
  /** Session metadata */
  metadata?: Record<string, string>;
}

/**
 * Agent tool definition
 */
export interface VertexAgentTool {
  /** Tool name */
  name: string;
  /** Tool description */
  description: string;
  /** Function declaration */
  functionDeclarations?: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<
        string,
        {
          type: 'string' | 'number' | 'boolean' | 'array' | 'object';
          description?: string;
          enum?: string[];
        }
      >;
      required?: string[];
    };
  }[];
}

/**
 * Agent memory entry for long-term context
 */
export interface VertexAgentMemory {
  /** Memory ID */
  id: string;
  /** Topic/category of memory */
  topic: string;
  /** Memory content */
  content: string;
  /** Importance score (0-1) */
  importance: number;
  /** Creation timestamp */
  createdAt: Date;
  /** Last access timestamp */
  lastAccessedAt: Date;
}

// ============================================================================
// BigQuery ML Types (for Learning Analytics)
// ============================================================================

/**
 * Supported BigQuery ML model types
 */
export type BigQueryMLModelType =
  | 'LOGISTIC_REG'
  | 'BOOSTED_TREE_CLASSIFIER'
  | 'BOOSTED_TREE_REGRESSOR'
  | 'DNN_CLASSIFIER'
  | 'DNN_REGRESSOR'
  | 'KMEANS'
  | 'ARIMA_PLUS';

/**
 * BigQuery ML model configuration
 */
export interface BigQueryMLModelConfig {
  /** Model name */
  name: string;
  /** Model type */
  modelType: BigQueryMLModelType;
  /** Dataset containing the model */
  dataset: string;
  /** Input label column(s) */
  inputLabelCols: string[];
  /** Training data table/query */
  trainingDataQuery: string;
  /** Hyperparameter options */
  options?: Record<string, string | number | boolean>;
}

/**
 * Learner churn prediction result
 */
export interface LearnerChurnPrediction {
  /** Learner/actor ID */
  learnerId: string;
  /** Churn probability (0-1) */
  churnProbability: number;
  /** Predicted churn status */
  predictedChurn: boolean;
  /** Risk level */
  riskLevel: 'low' | 'medium' | 'high';
  /** Contributing factors */
  factors: {
    name: string;
    importance: number;
  }[];
  /** Prediction timestamp */
  predictedAt: Date;
}

/**
 * Learner engagement score
 */
export interface LearnerEngagementScore {
  /** Learner/actor ID */
  learnerId: string;
  /** Overall engagement score (0-100) */
  score: number;
  /** Engagement level */
  level: 'disengaged' | 'passive' | 'active' | 'highly_engaged';
  /** Score components */
  components: {
    /** Activity frequency score */
    activityFrequency: number;
    /** Content completion score */
    contentCompletion: number;
    /** Assessment performance score */
    assessmentPerformance: number;
    /** Session duration score */
    sessionDuration: number;
  };
  /** Score calculation timestamp */
  calculatedAt: Date;
}

// ============================================================================
// Document AI Types
// ============================================================================

/**
 * Document AI processor types
 */
export type DocumentProcessorType =
  | 'ENTERPRISE_OCR'
  | 'FORM_PARSER'
  | 'DOCUMENT_SPLITTER'
  | 'LAYOUT_PARSER'
  | 'CUSTOM_EXTRACTOR';

/**
 * Document processing request
 */
export interface DocumentProcessingRequest {
  /** Processor type to use */
  processorType: DocumentProcessorType;
  /** Document content (base64 encoded) */
  rawDocument?: {
    content: string;
    mimeType: string;
  };
  /** Cloud Storage URI */
  gcsDocument?: {
    gcsUri: string;
    mimeType: string;
  };
  /** Enable OCR add-ons */
  ocrConfig?: {
    /** Enable math formula extraction */
    enableMathOcr?: boolean;
    /** Enable checkbox detection */
    enableCheckboxDetection?: boolean;
    /** Enable font style detection */
    enableFontStyleDetection?: boolean;
  };
}

/**
 * Extracted text block from document
 */
export interface DocumentTextBlock {
  /** Extracted text */
  text: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Bounding box coordinates */
  boundingBox?: {
    normalizedVertices: {
      x: number;
      y: number;
    }[];
  };
  /** Page number (1-indexed) */
  pageNumber: number;
  /** Block type */
  blockType?: 'paragraph' | 'heading' | 'list_item' | 'table_cell';
}

/**
 * Extracted form field
 */
export interface DocumentFormField {
  /** Field name/label */
  fieldName: string;
  /** Field value */
  fieldValue: string;
  /** Confidence score */
  confidence: number;
  /** Value type */
  valueType?: 'text' | 'checkbox' | 'date' | 'number';
  /** Checkbox status (if applicable) */
  checkboxStatus?: 'checked' | 'unchecked';
}

/**
 * Document processing response
 */
export interface DocumentProcessingResponse {
  /** Full extracted text */
  text: string;
  /** Structured text blocks */
  textBlocks: DocumentTextBlock[];
  /** Extracted form fields */
  formFields?: DocumentFormField[];
  /** Extracted tables */
  tables?: {
    rowCount: number;
    columnCount: number;
    cells: {
      rowIndex: number;
      columnIndex: number;
      content: string;
    }[];
  }[];
  /** Page count */
  pageCount: number;
  /** Processing metadata */
  metadata: {
    processorVersion: string;
    processedAt: Date;
  };
}

// ============================================================================
// Client Configuration Types
// ============================================================================

/**
 * Vertex AI client configuration
 */
export interface VertexClientConfig {
  /** GCP project ID */
  projectId: string;
  /** GCP region */
  location: string;
  /** API endpoint override (optional) */
  apiEndpoint?: string;
  /** Default model for text generation */
  defaultModel?: GeminiModelId;
  /** Default generation config */
  defaultGenerationConfig?: VertexGenerationConfig;
  /** Enable request logging */
  enableLogging?: boolean;
  /** Custom fetch implementation (for testing) */
  customFetch?: typeof fetch;
}

/**
 * Vertex AI service status
 */
export interface VertexServiceStatus {
  /** Service name */
  service: 'gemini' | 'embeddings' | 'agent' | 'document-ai' | 'bigquery-ml';
  /** Is service available */
  available: boolean;
  /** Current latency (ms) */
  latencyMs?: number;
  /** Error message if unavailable */
  error?: string;
  /** Last check timestamp */
  checkedAt: Date;
}
