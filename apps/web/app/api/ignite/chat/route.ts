import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { type AuthenticatedRequest, withAuth } from '@/lib/api/with-auth';
import { synthesizeSpeech, type VoicePreset } from '@/lib/ignite/google-voice';
import { logger } from '@/lib/logger';

const log = logger.scope('NeuronautChat');

// ============================================================================
// NEURO-NAUT CHAT API - AI LEARNING COMPANION WITH DIRECTOR MODE
// Combines Gemini AI for text generation + Google Cloud TTS for voice
// Returns both "Script" (text) and "Stage Directions" (animation tags)
// ============================================================================

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '';

// ============================================================================
// DIRECTOR MODE SYSTEM PROMPT
// ============================================================================

const SYSTEM_PROMPT = `You are Neuro-naut, an expert AI learning companion for LXD360's INSPIRE Ignite platform.

PERSONALITY:
- Helpful, encouraging, and concise (maximum 2 sentences per response)
- Professional but warm - like a supportive mentor
- Never use emojis in your text responses

DIRECTOR MODE:
You control a 3D avatar. Start your response with ONE of these tags when appropriate:

[CELEBRATE] - Use when the learner is correct, finishes a task, or shares good news.
             Example: "[CELEBRATE] Excellent work! You've mastered that concept perfectly."

[EXPLAIN]   - Use when defining a concept, giving instructions, or teaching.
             Example: "[EXPLAIN] The key principle here is that learning happens in stages."

[NOD]       - Use for simple confirmations, agreement, or acknowledgment.
             Example: "[NOD] That's right, you're on the right track."

(No tag)    - Use for casual conversation or when no specific gesture fits.
             Example: "I'm here to help you learn. What would you like to explore?"

SAFETY RULES:
- NEVER use negative tags or expressions of disappointment
- If the learner is wrong, be encouraging and guide them to the correct answer
- Always maintain a positive, supportive tone
- Stay focused on the course content when possible

RESPONSE FORMAT:
- Start with a Director tag if appropriate (or omit for casual responses)
- Keep responses to 1-2 sentences maximum
- Be specific and actionable in your guidance`;

// ============================================================================
// TYPES
// ============================================================================

/** Animation directives that map to avatar animation states */
export type AnimationDirective = 'celebrate' | 'wave' | 'nod' | 'point' | 'idle';

/** Director tags that can appear in AI responses */
const DIRECTOR_TAGS = {
  '[CELEBRATE]': 'celebrate' as AnimationDirective,
  '[EXPLAIN]': 'point' as AnimationDirective,
  '[NOD]': 'nod' as AnimationDirective,
  '[WAVE]': 'wave' as AnimationDirective,
} as const;

interface ChatRequest {
  message: string;
  context?: {
    courseTitle?: string;
    courseDescription?: string;
    currentLesson?: string;
    learnerName?: string;
  };
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  /** Voice ID for TTS (default: 'en-US-Neural2-J') */
  voiceId?: string;
  /** Voice preset for TTS (default: 'male') - fallback if voiceId not provided */
  voice?: VoicePreset;
  /** Whether to include audio in response (default: true) */
  includeAudio?: boolean;
}

interface ChatResponse {
  /** The text response (with Director tag stripped) */
  text: string;
  /** Base64-encoded MP3 audio */
  audio?: string;
  /** Animation directive for the avatar */
  animation: AnimationDirective;
  /** Raw response before tag stripping (for debugging) */
  raw?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse Director tags from AI response and extract animation directive.
 * Returns the clean text (tag removed) and the animation to play.
 */
function parseDirectorResponse(rawResponse: string): {
  text: string;
  animation: AnimationDirective;
} {
  const trimmed = rawResponse.trim();

  // Check for each Director tag at the start of the response
  for (const [tag, animation] of Object.entries(DIRECTOR_TAGS)) {
    if (trimmed.startsWith(tag)) {
      // Remove the tag and clean up the text
      const text = trimmed.slice(tag.length).trim();
      return { text, animation };
    }
  }

  // No tag found - return idle animation
  return { text: trimmed, animation: 'idle' };
}

/**
 * Build context-aware prompt for Gemini
 */
function buildPrompt(request: ChatRequest): string {
  const { message, context, history } = request;

  let prompt = `${SYSTEM_PROMPT}\n\n`;

  // Add course context if available
  if (context) {
    prompt += '--- COURSE CONTEXT ---\n';
    if (context.courseTitle) {
      prompt += `Course: ${context.courseTitle}\n`;
    }
    if (context.courseDescription) {
      prompt += `Description: ${context.courseDescription}\n`;
    }
    if (context.currentLesson) {
      prompt += `Current Lesson: ${context.currentLesson}\n`;
    }
    if (context.learnerName) {
      prompt += `Learner Name: ${context.learnerName}\n`;
    }
    prompt += '---\n\n';
  }

  // Add conversation history
  if (history && history.length > 0) {
    prompt += '--- CONVERSATION HISTORY ---\n';
    for (const msg of history.slice(-6)) {
      const role = msg.role === 'user' ? 'Learner' : 'Neuro-naut';
      prompt += `${role}: ${msg.content}\n`;
    }
    prompt += '---\n\n';
  }

  // Add current message
  prompt += `Learner: ${message}\n\nNeuro-naut:`;

  return prompt;
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

/**
 * POST /api/ignite/chat
 *
 * Chat with Neuro-naut AI and receive:
 * - text: The response text (Director tag stripped)
 * - audio: Base64-encoded MP3 audio
 * - animation: Animation directive for the avatar
 */
async function handlePost(req: AuthenticatedRequest): Promise<NextResponse> {
  // Authentication verified by withAuth wrapper
  try {
    // ========== VERBOSE LOGGING FOR DEBUGGING ==========
    log.debug('[NeuronautChat] === API REQUEST START ===');
    log.debug('[NeuronautChat] Environment check', {
      googleProjectIdExists: !!process.env.GOOGLE_PROJECT_ID,
      googleCloudProjectExists: !!process.env.GOOGLE_CLOUD_PROJECT,
      geminiApiKeyExists: !!GEMINI_API_KEY,
    });
    const privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || '';
    log.debug('[NeuronautChat] Private key check', {
      length: privateKey.length,
      hasEscapedNewline: privateKey.includes('\\n'),
      hasLiteralNewline: privateKey.includes('\n'),
    });
    // ===================================================

    const body = (await req.json()) as ChatRequest;
    const { message, voiceId, voice = 'male', includeAudio = true } = body;

    log.debug('[NeuronautChat] Received message', { preview: message?.substring(0, 50) });

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      log.error('[NeuronautChat] GOOGLE_GENERATIVE_AI_API_KEY is not configured');
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    // 1. Generate text response with Gemini
    log.debug('[NeuronautChat] Calling Gemini...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = buildPrompt(body);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text().trim();
    log.debug('[NeuronautChat] Gemini response received', { length: rawText.length });

    if (!rawText) {
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }

    // 2. Parse Director tags to extract animation and clean text
    const { text, animation } = parseDirectorResponse(rawText);

    // 3. Generate audio with Google Cloud TTS (if requested)
    // Note: We use the CLEAN text (without tags) for speech synthesis
    let audio: string | undefined;

    if (includeAudio) {
      try {
        log.debug('[NeuronautChat] Calling TTS', { voiceId, voice });
        audio = await synthesizeSpeech(text, { voice, voiceId });
        log.debug('[NeuronautChat] TTS response received', { audioLength: audio?.length || 0 });
      } catch (ttsError) {
        // Log but don't fail the request - audio is optional
        log.error(
          '[NeuronautChat] TTS error (continuing without audio)',
          ttsError instanceof Error ? ttsError : new Error(String(ttsError)),
        );
      }
    }

    // 4. Build response
    const chatResponse: ChatResponse = {
      text,
      animation,
    };

    if (audio) {
      chatResponse.audio = audio;
    }

    // Include raw response in development for debugging
    if (process.env.NODE_ENV === 'development') {
      chatResponse.raw = rawText;
    }

    log.debug('[NeuronautChat] === API REQUEST SUCCESS ===');
    return NextResponse.json(chatResponse);
  } catch (error) {
    // ========== VERBOSE ERROR LOGGING ==========
    log.error(
      '[NeuronautChat] === API REQUEST FAILED ===',
      error instanceof Error ? error : new Error(String(error)),
      {
        stack: error instanceof Error ? error.stack : undefined,
      },
    );
    // ===========================================
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}

// Export wrapped handler - requires authentication
export const POST = withAuth(handlePost);
