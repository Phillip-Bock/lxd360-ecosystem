import { GOOGLE_AI } from '@/lib/constants/api';

/**
 * Server-side Gemini API route
 * Keeps the API key secure on the server
 *
 * POST /api/ai/gemini
 * Body: { prompt: string, type: 'text' | 'json' | 'tts' }
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { prompt, type = 'text' } = body as { prompt: string; type?: 'text' | 'json' | 'tts' };

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return Response.json({ error: 'AI service not configured' }, { status: 500 });
    }

    let url: string;
    let payload: Record<string, unknown>;

    if (type === 'tts') {
      url = `${GOOGLE_AI.GEMINI_MODELS}/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
      payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      };
    } else {
      url = `${GOOGLE_AI.GEMINI_MODELS}/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
      payload = { contents: [{ parts: [{ text: prompt }] }] };
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
      console.error('Gemini API error:', response.status, errorText);
      return Response.json(
        { error: 'AI service error', details: response.statusText },
        { status: response.status },
      );
    }

    const data = await response.json();

    if (type === 'tts') {
      const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return Response.json({ result: audioData, type: 'tts' });
    }

    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return Response.json({ result: textResult, type });
  } catch (error) {
    console.error('Gemini API route error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
