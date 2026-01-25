import { NextResponse } from 'next/server';
import { type AuthenticatedRequest, withAuth } from '@/lib/api/with-auth';
import { logger } from '@/lib/logger';
import { fetchGoogleVoices, synthesizeWithGoogle } from '@/lib/tts/google-cloud';
import { DEFAULT_GOOGLE_VOICES } from '@/lib/tts/types';

const log = logger.scope('GoogleTTSAPI');

export const runtime = 'nodejs';

interface GoogleTTSRequestBody {
  text: string;
  voiceId: string;
  languageCode?: string;
  settings?: {
    speakingRate?: number;
    pitch?: number;
    volumeGainDb?: number;
    audioEncoding?: 'MP3' | 'WAV' | 'OGG_OPUS';
  };
}

/**
 * POST /api/tts/google - Synthesize with Google Cloud TTS (SECURED)
 */
async function handlePost(req: AuthenticatedRequest): Promise<NextResponse> {
  const { uid } = req.user;
  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Google Cloud TTS API key not configured' },
      { status: 500 },
    );
  }

  try {
    const body = (await req.json()) as GoogleTTSRequestBody;
    const { text, voiceId, languageCode, settings } = body;

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

    const result = await synthesizeWithGoogle({
      text,
      voiceId,
      languageCode,
      settings,
      apiKey,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({ ...result, user: uid });
  } catch (error) {
    log.error('Google TTS API error', error);
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
 * GET /api/tts/google - Get available voices (public endpoint for UI)
 */
export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      voices: DEFAULT_GOOGLE_VOICES,
      configured: false,
    });
  }

  try {
    const voices = await fetchGoogleVoices(apiKey);

    return NextResponse.json({
      voices: voices.length > 0 ? voices : DEFAULT_GOOGLE_VOICES,
      configured: true,
    });
  } catch (error) {
    log.error('Error fetching Google voices', error);
    return NextResponse.json({
      voices: DEFAULT_GOOGLE_VOICES,
      configured: true,
      error: 'Failed to fetch live data',
    });
  }
}

// POST requires authentication
export const POST = withAuth(handlePost);
