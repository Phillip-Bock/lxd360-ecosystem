import { NextResponse } from 'next/server';
import { type AuthenticatedRequest, withAuth } from '@/lib/api/with-auth';
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
 * POST /api/tts - Main TTS endpoint (SECURED, Google Cloud TTS only)
 */
async function handlePost(req: AuthenticatedRequest): Promise<NextResponse> {
  const { uid } = req.user;

  try {
    const body = (await req.json()) as TTSRequestBody;
    const { text, voiceId, provider, settings } = body;

    if (!text || !voiceId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: text, voiceId' },
        { status: 400 },
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Text exceeds maximum length of 5000 characters' },
        { status: 400 },
      );
    }

    // Only Google Cloud TTS is supported
    if (provider && provider !== 'google') {
      return NextResponse.json(
        { success: false, error: 'Only Google Cloud TTS provider is supported' },
        { status: 400 },
      );
    }

    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Google Cloud TTS API key not configured' },
        { status: 500 },
      );
    }

    const result: TTSResponse = await synthesizeWithGoogle({
      text,
      voiceId,
      settings: settings as Record<string, number | string> | undefined,
      apiKey,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({ ...result, user: uid });
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
 * GET /api/tts - Get provider status (public endpoint for UI checks)
 */
export async function GET(): Promise<NextResponse> {
  const hasGoogle = !!process.env.GOOGLE_CLOUD_TTS_API_KEY;

  return NextResponse.json({
    providers: {
      google: { available: hasGoogle },
    },
  });
}

// POST requires authentication
export const POST = withAuth(handlePost);
