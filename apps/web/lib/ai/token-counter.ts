import type { AIMessage } from './types';

// ============================================================================
// Token Estimation
// ============================================================================

/**
 * Approximate token count for text
 * This is a rough estimate - for exact counts, use provider-specific tokenizers
 *
 * Rules of thumb:
 * - English: ~4 characters per token
 * - Code: ~3 characters per token
 * - Non-latin scripts: ~1-2 characters per token
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;

  // Simple estimation: ~4 characters per token for English
  // This is intentionally conservative (over-estimates slightly)
  return Math.ceil(text.length / 3.5);
}

/**
 * Estimate tokens for a message
 */
export function estimateMessageTokens(message: AIMessage): number {
  let tokens = 4; // Base tokens for message structure

  if (typeof message.content === 'string') {
    tokens += estimateTokens(message.content);
  } else {
    for (const part of message.content) {
      if (part.text) {
        tokens += estimateTokens(part.text);
      }
      if (part.imageUrl || part.imageBase64) {
        // Images typically use ~85 tokens for low detail, ~170 for high detail
        tokens += 170;
      }
    }
  }

  if (message.name) {
    tokens += estimateTokens(message.name) + 1;
  }

  return tokens;
}

/**
 * Estimate total tokens for a conversation
 */
export function estimateConversationTokens(messages: AIMessage[]): number {
  let tokens = 3; // Base tokens for conversation structure

  for (const message of messages) {
    tokens += estimateMessageTokens(message);
  }

  return tokens;
}

// ============================================================================
// Context Window Management
// ============================================================================

/**
 * Truncate messages to fit within a token limit
 * Keeps system message and most recent messages
 */
export function truncateToTokenLimit(
  messages: AIMessage[],
  maxTokens: number,
  reserveTokens: number = 0,
): AIMessage[] {
  const effectiveLimit = maxTokens - reserveTokens;
  const systemMessages = messages.filter((m) => m.role === 'system');
  const otherMessages = messages.filter((m) => m.role !== 'system');

  // Calculate system message tokens
  let systemTokens = 0;
  for (const msg of systemMessages) {
    systemTokens += estimateMessageTokens(msg);
  }

  // Start from the most recent messages and work backwards
  const result: AIMessage[] = [];
  let currentTokens = systemTokens + 3; // Base tokens

  // Add messages from most recent to oldest
  for (let i = otherMessages.length - 1; i >= 0; i--) {
    const msg = otherMessages[i];
    const msgTokens = estimateMessageTokens(msg);

    if (currentTokens + msgTokens <= effectiveLimit) {
      result.unshift(msg);
      currentTokens += msgTokens;
    } else {
      break;
    }
  }

  // Add system messages at the beginning
  return [...systemMessages, ...result];
}

/**
 * Split text into chunks that fit within token limits
 */
export function splitIntoChunks(
  text: string,
  maxTokensPerChunk: number = 2000,
  overlap: number = 100,
): string[] {
  const chunks: string[] = [];
  const estimatedCharsPerChunk = maxTokensPerChunk * 3.5;
  const overlapChars = overlap * 3.5;

  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + estimatedCharsPerChunk, text.length);

    // Try to break at a natural boundary (sentence or paragraph)
    if (end < text.length) {
      const searchStart = Math.max(end - 200, start);
      const searchText = text.slice(searchStart, end);

      // Look for paragraph break
      const paragraphBreak = searchText.lastIndexOf('\n\n');
      if (paragraphBreak > 0) {
        end = searchStart + paragraphBreak + 2;
      } else {
        // Look for sentence break
        const sentenceBreak = searchText.search(/[.!?]\s/g);
        if (sentenceBreak > 0) {
          end = searchStart + sentenceBreak + 2;
        }
      }
    }

    chunks.push(text.slice(start, end).trim());

    // Move start position, accounting for overlap
    start = end - overlapChars;
    if (start < end - 50) {
      // Ensure we're making progress
      start = end;
    }
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

// ============================================================================
// Cost Calculation
// ============================================================================

interface ModelPricing {
  promptPer1kTokens: number;
  completionPer1kTokens: number;
}

const MODEL_PRICING: Record<string, ModelPricing> = {
  // OpenAI
  'gpt-4o': { promptPer1kTokens: 0.005, completionPer1kTokens: 0.015 },
  'gpt-4o-mini': { promptPer1kTokens: 0.00015, completionPer1kTokens: 0.0006 },
  'gpt-4-turbo': { promptPer1kTokens: 0.01, completionPer1kTokens: 0.03 },
  'gpt-3.5-turbo': { promptPer1kTokens: 0.0005, completionPer1kTokens: 0.0015 },

  // Anthropic
  'claude-opus-4-5-20251101': { promptPer1kTokens: 0.015, completionPer1kTokens: 0.075 },
  'claude-sonnet-4-5-20250929': { promptPer1kTokens: 0.003, completionPer1kTokens: 0.015 },
  'claude-3-5-haiku-20241022': { promptPer1kTokens: 0.001, completionPer1kTokens: 0.005 },

  // Google
  'gemini-2.0-flash': { promptPer1kTokens: 0.00015, completionPer1kTokens: 0.0006 },
  'gemini-1.5-pro': { promptPer1kTokens: 0.00125, completionPer1kTokens: 0.005 },
  'gemini-1.5-flash': { promptPer1kTokens: 0.000075, completionPer1kTokens: 0.0003 },
};

/**
 * Estimate cost for a request
 */
export function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    // Default to a middle-ground pricing
    return (promptTokens / 1000) * 0.001 + (completionTokens / 1000) * 0.003;
  }

  return (
    (promptTokens / 1000) * pricing.promptPer1kTokens +
    (completionTokens / 1000) * pricing.completionPer1kTokens
  );
}

/**
 * Get pricing for a model
 */
export function getModelPricing(model: string): ModelPricing | null {
  return MODEL_PRICING[model] || null;
}
