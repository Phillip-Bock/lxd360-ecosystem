import { getAccessToken, getProjectId, hasGoogleCredentials } from '@/lib/google/auth';

// Model IDs
export const MODELS = {
  // Text models
  GEMINI_2_FLASH: 'gemini-2.0-flash',
  GEMINI_2_FLASH_THINKING: 'gemini-2.0-flash-thinking-exp',
  GEMINI_1_5_PRO: 'gemini-1.5-pro',
  GEMINI_1_5_FLASH: 'gemini-1.5-flash',
  // Image generation
  IMAGEN_3: 'imagen-3.0-generate-001',
  IMAGEN_3_FAST: 'imagen-3.0-fast-generate-001',
  // Multimodal with image output
  GEMINI_IMAGE: 'gemini-2.5-flash-image-preview',
} as const;

export type ModelId = (typeof MODELS)[keyof typeof MODELS];

// Types
export interface GenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  responseMimeType?: string;
}

export interface SafetySetting {
  category: string;
  threshold: string;
}

export interface ContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64
  };
}

export interface Content {
  role: 'user' | 'model';
  parts: ContentPart[];
}

export interface GeminiRequestBody {
  contents: Content[];
  generationConfig: GenerationConfig;
  systemInstruction?: {
    parts: ContentPart[];
  };
  safetySettings?: SafetySetting[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: ContentPart[];
      role: string;
    };
    finishReason: string;
    safetyRatings?: unknown[];
  }[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// API Configuration
const VERTEX_AI_BASE = 'https://us-central1-aiplatform.googleapis.com/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Determines which API to use based on available credentials
 */
function getApiConfig(): { useVertexAI: boolean; baseUrl: string } {
  // Prefer Vertex AI if GOOGLE_CREDENTIALS is set
  if (hasGoogleCredentials()) {
    return {
      useVertexAI: true,
      baseUrl: VERTEX_AI_BASE,
    };
  }

  // Fall back to Gemini API with API key
  return {
    useVertexAI: false,
    baseUrl: GEMINI_API_BASE,
  };
}

/**
 * Generate text content using Gemini
 */
export async function generateText(
  prompt: string,
  options: {
    model?: ModelId;
    systemPrompt?: string;
    history?: Content[];
    config?: GenerationConfig;
    safetySettings?: SafetySetting[];
  } = {},
): Promise<{ text: string; usage?: GeminiResponse['usageMetadata'] }> {
  const {
    model = MODELS.GEMINI_2_FLASH,
    systemPrompt,
    history = [],
    config = {},
    safetySettings,
  } = options;

  const { useVertexAI, baseUrl } = getApiConfig();
  const contents: Content[] = [...history];

  // Add user prompt
  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  const requestBody: GeminiRequestBody = {
    contents,
    generationConfig: {
      temperature: config.temperature ?? 0.7,
      topP: config.topP ?? 0.95,
      maxOutputTokens: config.maxOutputTokens ?? 8192,
      ...config,
    },
  };

  if (systemPrompt) {
    requestBody.systemInstruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  if (safetySettings) {
    requestBody.safetySettings = safetySettings;
  }

  let url: string;
  let headers: Record<string, string>;

  if (useVertexAI) {
    const projectId = getProjectId();
    const accessToken = await getAccessToken();
    url = `${baseUrl}/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:generateContent`;
    headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  } else {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY or GOOGLE_CREDENTIALS must be set');
    }
    url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    headers = {
      'Content-Type': 'application/json',
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data: GeminiResponse = await response.json();
  const textContent =
    data.candidates[0]?.content?.parts
      ?.filter((p) => p.text)
      ?.map((p) => p.text)
      ?.join('') || '';

  return {
    text: textContent,
    usage: data.usageMetadata,
  };
}

/**
 * Generate content with images (multimodal)
 */
export async function generateWithImages(
  prompt: string,
  images: { data: string; mimeType: string }[],
  options: {
    model?: ModelId;
    config?: GenerationConfig;
  } = {},
): Promise<{ text: string; images: string[] }> {
  const { model = MODELS.GEMINI_IMAGE, config = {} } = options;

  const { useVertexAI, baseUrl } = getApiConfig();

  const parts: ContentPart[] = [
    { text: prompt },
    ...images.map((img) => ({
      inlineData: {
        mimeType: img.mimeType,
        data: img.data,
      },
    })),
  ];

  const requestBody = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: config.temperature ?? 0.7,
      ...config,
    },
  };

  let url: string;
  let headers: Record<string, string>;

  if (useVertexAI) {
    const projectId = getProjectId();
    const accessToken = await getAccessToken();
    url = `${baseUrl}/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:generateContent`;
    headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  } else {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY or GOOGLE_CREDENTIALS must be set');
    }
    url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    headers = {
      'Content-Type': 'application/json',
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data: GeminiResponse = await response.json();
  const responseParts = data.candidates[0]?.content?.parts || [];

  const textContent = responseParts
    .filter((p) => p.text)
    .map((p) => p.text)
    .join('');

  const generatedImages = responseParts.reduce<string[]>((acc, p) => {
    if (p.inlineData) {
      acc.push(p.inlineData.data);
    }
    return acc;
  }, []);

  return {
    text: textContent,
    images: generatedImages,
  };
}

/**
 * Stream text generation
 */
export async function* streamText(
  prompt: string,
  options: {
    model?: ModelId;
    systemPrompt?: string;
    config?: GenerationConfig;
  } = {},
): AsyncGenerator<string, void, unknown> {
  const { model = MODELS.GEMINI_2_FLASH, systemPrompt, config = {} } = options;

  const { useVertexAI, baseUrl } = getApiConfig();

  const requestBody: GeminiRequestBody = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: config.temperature ?? 0.7,
      ...config,
    },
  };

  if (systemPrompt) {
    requestBody.systemInstruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  let url: string;
  let headers: Record<string, string>;

  if (useVertexAI) {
    const projectId = getProjectId();
    const accessToken = await getAccessToken();
    url = `${baseUrl}/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:streamGenerateContent?alt=sse`;
    headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  } else {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY or GOOGLE_CREDENTIALS must be set');
    }
    url = `${baseUrl}/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
    headers = {
      'Content-Type': 'application/json',
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6);
        if (jsonStr === '[DONE]') return;

        try {
          const data = JSON.parse(jsonStr);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
}
