import { type NextRequest, NextResponse } from 'next/server';
import { synthesizeWithElevenLabs } from '@/lib/tts/elevenlabs';
import { synthesizeWithGoogle } from '@/lib/tts/google-cloud';
import type { TTSProvider, TTSResponse } from '@/lib/tts/types';

export const runtime = 'nodejs';

interface TTSRequestBody {
  text: string;
  voiceId: string;
  provider: TTSProvider;
  settings?: Record<string, unknown>;
}

/**
 * POST /api/tts - Main TTS endpoint
 * Routes to appropriate provider based on request
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as TTSRequestBody;
    const { text, voiceId, provider, settings } = body;

    if (!text || !voiceId || !provider) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: text, voiceId, provider' },
        { status: 400 },
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Text exceeds maximum length of 5000 characters' },
        { status: 400 },
      );
    }

    let result: TTSResponse;

    switch (provider) {
      case 'elevenlabs': {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
          return NextResponse.json(
            { success: false, error: 'ElevenLabs API key not configured' },
            { status: 500 },
          );
        }
        result = await synthesizeWithElevenLabs({
          text,
          voiceId,
          settings: settings as Record<string, number | boolean> | undefined,
          apiKey,
        });
        break;
      }

      case 'google': {
        const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
        if (!apiKey) {
          return NextResponse.json(
            { success: false, error: 'Google Cloud TTS API key not configured' },
            { status: 500 },
          );
        }
        result = await synthesizeWithGoogle({
          text,
          voiceId,
          settings: settings as Record<string, number | string> | undefined,
          apiKey,
        });
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown provider: ${provider}` },
          { status: 400 },
        );
    }

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/tts - Get available voices
 */
export async function GET(): Promise<NextResponse> {
  const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;
  const hasGoogle = !!process.env.GOOGLE_CLOUD_TTS_API_KEY;

  return NextResponse.json({
    providers: {
      elevenlabs: { available: hasElevenLabs },
      google: { available: hasGoogle },
    },
  });
}
