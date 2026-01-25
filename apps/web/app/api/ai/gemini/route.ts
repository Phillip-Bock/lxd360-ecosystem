import { NextResponse } from 'next/server';
import { type AuthenticatedRequest, withAuth } from '@/lib/api/with-auth';
import { GOOGLE_AI } from '@/lib/constants/api';
import { logger } from '@/lib/logger';

const log = logger.scope('GeminiAPI');

/**
 * Server-side Gemini API route (SECURED)
 * Requires authentication via Bearer token or session cookie.
 *
 * POST /api/ai/gemini
 * Body: { prompt: string, type: 'text' | 'json' | 'tts' }
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function handlePost(req: AuthenticatedRequest): Promise<NextResponse> {
  const { uid } = req.user;

  try {
    const body = await req.json();
    const {
      prompt,
      message,
      systemPrompt,
      history,
      type = 'text',
    } = body as {
      prompt?: string;
      message?: string;
      systemPrompt?: string;
      history?: ChatMessage[];
      type?: 'text' | 'json' | 'tts';
    };

    // Support both formats: simple prompt or chat message
    const userInput = prompt || message;

    if (!userInput) {
      return NextResponse.json({ error: 'Prompt or message is required' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      log.error('GEMINI_API_KEY is not configured');
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    let url: string;
    let payload: Record<string, unknown>;

    // Build conversation contents for chat mode
    const buildChatContents = () => {
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      // Add system instruction as first user message if provided
      if (systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: `System: ${systemPrompt}` }],
        });
        contents.push({
          role: 'model',
          parts: [{ text: 'Understood. I will follow these instructions.' }],
        });
      }

      // Add conversation history
      if (history && history.length > 0) {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          });
        }
      }

      // Add current user message
      contents.push({
        role: 'user',
        parts: [{ text: userInput }],
      });

      return contents;
    };

    if (type === 'tts') {
      url = `${GOOGLE_AI.GEMINI_MODELS}/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
      payload = {
        contents: [{ parts: [{ text: userInput }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      };
    } else {
      url = `${GOOGLE_AI.GEMINI_MODELS}/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

      // Use chat format if we have systemPrompt or history, otherwise simple prompt
      if (systemPrompt || (history && history.length > 0)) {
        payload = { contents: buildChatContents() };
      } else {
        payload = { contents: [{ parts: [{ text: userInput }] }] };
      }

      if (type === 'json') {
        payload.generationConfig = { responseMimeType: 'application/json' };
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error('Gemini API error', { status: response.status, error: errorText });
      return NextResponse.json(
        { error: 'AI service error', details: response.statusText },
        { status: response.status },
      );
    }

    const data = await response.json();

    if (type === 'tts') {
      const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return NextResponse.json({ result: audioData, type: 'tts', user: uid });
    }

    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Return both 'result' (original format) and 'response' (chat format) for compatibility
    return NextResponse.json({ result: textResult, response: textResult, type, user: uid });
  } catch (error) {
    log.error('Gemini API route error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Export wrapped handler - requires authentication
export const POST = withAuth(handlePost);
