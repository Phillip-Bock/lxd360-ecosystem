/**
 * Google Cloud TTS Integration
 * Handles voice synthesis using Google Cloud Text-to-Speech API
 */

import {
  DEFAULT_GOOGLE_SETTINGS,
  type GoogleVoiceSettings,
  type TTSResponse,
  type Voice,
} from './types';

const GOOGLE_TTS_API_URL = 'https://texttospeech.googleapis.com/v1';

interface GoogleSynthesizeOptions {
  text: string;
  voiceId: string;
  languageCode?: string;
  settings?: Partial<GoogleVoiceSettings>;
  apiKey: string;
}

/**
 * Synthesize speech using Google Cloud TTS API
 */
export async function synthesizeWithGoogle({
  text,
  voiceId,
  languageCode = 'en-US',
  settings = {},
  apiKey,
}: GoogleSynthesizeOptions): Promise<TTSResponse> {
  const mergedSettings = { ...DEFAULT_GOOGLE_SETTINGS, ...settings };

  const audioEncodingMap = {
    MP3: 'MP3',
    WAV: 'LINEAR16',
    OGG_OPUS: 'OGG_OPUS',
  } as const;

  try {
    const response = await fetch(`${GOOGLE_TTS_API_URL}/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode,
          name: voiceId,
        },
        audioConfig: {
          audioEncoding: audioEncodingMap[mergedSettings.audioEncoding],
          speakingRate: mergedSettings.speakingRate,
          pitch: mergedSettings.pitch,
          volumeGainDb: mergedSettings.volumeGainDb,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        format: mergedSettings.audioEncoding.toLowerCase() as 'mp3' | 'wav' | 'ogg',
        provider: 'google',
        voiceId,
        error: `Google TTS API error: ${errorData.error?.message || response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      audioBase64: data.audioContent,
      format: mergedSettings.audioEncoding.toLowerCase() as 'mp3' | 'wav' | 'ogg',
      provider: 'google',
      voiceId,
    };
  } catch (error) {
    return {
      success: false,
      format: 'mp3',
      provider: 'google',
      voiceId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch available voices from Google Cloud TTS
 */
export async function fetchGoogleVoices(apiKey: string): Promise<Voice[]> {
  try {
    const response = await fetch(`${GOOGLE_TTS_API_URL}/voices?key=${apiKey}&languageCode=en`);

    if (!response.ok) {
      console.error('Failed to fetch Google voices');
      return [];
    }

    const data = await response.json();

    return data.voices.map(
      (voice: { name: string; languageCodes: string[]; ssmlGender: string }) => ({
        id: voice.name,
        name: formatGoogleVoiceName(voice.name),
        provider: 'google' as const,
        gender: mapGoogleGender(voice.ssmlGender),
        language: 'English',
        languageCode: voice.languageCodes[0] || 'en-US',
        accent: getAccentFromLanguageCode(voice.languageCodes[0]),
      }),
    );
  } catch (error) {
    console.error('Error fetching Google voices:', error);
    return [];
  }
}

/**
 * Format Google voice name for display
 */
function formatGoogleVoiceName(name: string): string {
  // e.g., "en-US-Wavenet-D" -> "Wavenet D"
  const parts = name.split('-');
  if (parts.length >= 4) {
    return `${parts[2]} ${parts[3]}`;
  }
  return name;
}

/**
 * Map Google SSML gender to our gender type
 */
function mapGoogleGender(ssmlGender: string): 'male' | 'female' | 'neutral' {
  switch (ssmlGender) {
    case 'MALE':
      return 'male';
    case 'FEMALE':
      return 'female';
    default:
      return 'neutral';
  }
}

/**
 * Get accent from language code
 */
function getAccentFromLanguageCode(code: string): string | undefined {
  const accents: Record<string, string> = {
    'en-US': 'American',
    'en-GB': 'British',
    'en-AU': 'Australian',
    'en-IN': 'Indian',
  };
  return accents[code];
}

/**
 * Synthesize SSML with Google Cloud TTS (for more control)
 */
export async function synthesizeSSMLWithGoogle({
  ssml,
  voiceId,
  languageCode = 'en-US',
  settings = {},
  apiKey,
}: {
  ssml: string;
  voiceId: string;
  languageCode?: string;
  settings?: Partial<GoogleVoiceSettings>;
  apiKey: string;
}): Promise<TTSResponse> {
  const mergedSettings = { ...DEFAULT_GOOGLE_SETTINGS, ...settings };

  try {
    const response = await fetch(`${GOOGLE_TTS_API_URL}/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { ssml },
        voice: {
          languageCode,
          name: voiceId,
        },
        audioConfig: {
          audioEncoding: mergedSettings.audioEncoding,
          speakingRate: mergedSettings.speakingRate,
          pitch: mergedSettings.pitch,
          volumeGainDb: mergedSettings.volumeGainDb,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        format: 'mp3',
        provider: 'google',
        voiceId,
        error: `Google TTS API error: ${errorData.error?.message || response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      audioBase64: data.audioContent,
      format: mergedSettings.audioEncoding.toLowerCase() as 'mp3' | 'wav' | 'ogg',
      provider: 'google',
      voiceId,
    };
  } catch (error) {
    return {
      success: false,
      format: 'mp3',
      provider: 'google',
      voiceId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
