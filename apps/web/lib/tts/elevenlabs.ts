/**
 * ElevenLabs TTS Integration
 * Handles voice synthesis using ElevenLabs API
 */

import {
  DEFAULT_ELEVENLABS_SETTINGS,
  type ElevenLabsVoiceSettings,
  type TTSResponse,
  type Voice,
} from './types';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

interface ElevenLabsSynthesizeOptions {
  text: string;
  voiceId: string;
  settings?: Partial<ElevenLabsVoiceSettings>;
  apiKey: string;
}

/**
 * Synthesize speech using ElevenLabs API
 */
export async function synthesizeWithElevenLabs({
  text,
  voiceId,
  settings = {},
  apiKey,
}: ElevenLabsSynthesizeOptions): Promise<TTSResponse> {
  const mergedSettings = { ...DEFAULT_ELEVENLABS_SETTINGS, ...settings };

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: mergedSettings.stability,
          similarity_boost: mergedSettings.similarityBoost,
          style: mergedSettings.style,
          use_speaker_boost: mergedSettings.useSpeakerBoost,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        format: 'mp3',
        provider: 'elevenlabs',
        voiceId,
        error: `ElevenLabs API error: ${response.status} - ${errorText}`,
      };
    }

    const audioBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString('base64');

    return {
      success: true,
      audioBase64: base64,
      format: 'mp3',
      provider: 'elevenlabs',
      voiceId,
    };
  } catch (error) {
    return {
      success: false,
      format: 'mp3',
      provider: 'elevenlabs',
      voiceId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch available voices from ElevenLabs
 */
export async function fetchElevenLabsVoices(apiKey: string): Promise<Voice[]> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch ElevenLabs voices');
      return [];
    }

    const data = await response.json();

    return data.voices.map(
      (voice: {
        voice_id: string;
        name: string;
        labels?: { gender?: string; accent?: string };
        preview_url?: string;
      }) => ({
        id: voice.voice_id,
        name: voice.name,
        provider: 'elevenlabs' as const,
        gender: (voice.labels?.gender as 'male' | 'female') || 'neutral',
        language: 'English',
        languageCode: 'en-US',
        accent: voice.labels?.accent,
        previewUrl: voice.preview_url,
      }),
    );
  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error);
    return [];
  }
}

/**
 * Get voice usage/quota information
 */
export async function getElevenLabsUsage(
  apiKey: string,
): Promise<{ characterCount: number; characterLimit: number } | null> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      characterCount: data.character_count,
      characterLimit: data.character_limit,
    };
  } catch {
    return null;
  }
}
