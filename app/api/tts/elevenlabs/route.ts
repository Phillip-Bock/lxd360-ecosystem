import { type NextRequest, NextResponse } from 'next/server';
import {
  fetchElevenLabsVoices,
  getElevenLabsUsage,
  synthesizeWithElevenLabs,
} from '@/lib/tts/elevenlabs';
import { DEFAULT_ELEVENLABS_VOICES } from '@/lib/tts/types';

export const runtime = 'nodejs';

interface ElevenLabsRequestBody {
  text: string;
  voiceId: string;
  settings?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

/**
 * POST /api/tts/elevenlabs - Synthesize with ElevenLabs
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'ElevenLabs API key not configured' },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as ElevenLabsRequestBody;
    const { text, voiceId, settings } = body;

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

    const result = await synthesizeWithElevenLabs({
      text,
      voiceId,
      settings,
      apiKey,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('ElevenLabs API error:', error);
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
 * GET /api/tts/elevenlabs - Get voices and usage
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const { searchParams } = new URL(request.url);
  const includeUsage = searchParams.get('usage') === 'true';

  if (!apiKey) {
    // Return default voices if no API key
    return NextResponse.json({
      voices: DEFAULT_ELEVENLABS_VOICES,
      usage: null,
      configured: false,
    });
  }

  try {
    const [voices, usage] = await Promise.all([
      fetchElevenLabsVoices(apiKey),
      includeUsage ? getElevenLabsUsage(apiKey) : null,
    ]);

    return NextResponse.json({
      voices: voices.length > 0 ? voices : DEFAULT_ELEVENLABS_VOICES,
      usage,
      configured: true,
    });
  } catch (error) {
    console.error('Error fetching ElevenLabs data:', error);
    return NextResponse.json({
      voices: DEFAULT_ELEVENLABS_VOICES,
      usage: null,
      configured: true,
      error: 'Failed to fetch live data',
    });
  }
}
