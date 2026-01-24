import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// ============================================================================
// GOOGLE CLOUD TEXT-TO-SPEECH SERVICE
// ============================================================================

/**
 * Initialize Google Cloud TTS Client with service account credentials.
 * Uses environment variables for secure credential management.
 */
function getClient(): TextToSpeechClient {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const projectId = process.env.GOOGLE_PROJECT_ID;

  if (!clientEmail || !privateKey || !projectId) {
    throw new Error(
      'Missing Google Cloud credentials. Ensure GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_PROJECT_ID are set.',
    );
  }

  return new TextToSpeechClient({
    credentials: {
      client_email: clientEmail,
      // Fix Next.js env variable newline escaping
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    projectId,
  });
}

// Singleton client instance (lazy initialization)
let client: TextToSpeechClient | null = null;

function getTTSClient(): TextToSpeechClient {
  if (!client) {
    client = getClient();
  }
  return client;
}

// ============================================================================
// VOICE CONFIGURATION
// ============================================================================

/** Available voice presets for the Ignite Coach */
export const VOICE_PRESETS = {
  /** Male Neural voice - professional and clear */
  male: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-J',
  },
  /** Female Neural voice - warm and encouraging */
  female: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-F',
  },
  /** Studio quality male voice - premium option */
  studioMale: {
    languageCode: 'en-US',
    name: 'en-US-Studio-M',
  },
  /** Studio quality female voice - premium option */
  studioFemale: {
    languageCode: 'en-US',
    name: 'en-US-Studio-O',
  },
} as const;

export type VoicePreset = keyof typeof VOICE_PRESETS;

/** Voice IDs available for selection in the UI */
export const VOICE_IDS = {
  'en-US-Neural2-J': { name: 'Cortex', description: 'Professional male voice', gender: 'male' },
  'en-US-Neural2-F': { name: 'Nova', description: 'Warm female voice', gender: 'female' },
  'en-US-Studio-M': { name: 'Echo', description: 'Studio quality male', gender: 'male' },
  'en-US-Studio-O': { name: 'Shimmer', description: 'Studio quality female', gender: 'female' },
} as const;

export type VoiceId = keyof typeof VOICE_IDS;

// ============================================================================
// SPEECH SYNTHESIS
// ============================================================================

export interface SynthesizeSpeechOptions {
  /** Voice preset to use (default: 'male') */
  voice?: VoicePreset;
  /** Direct voice ID override (takes precedence over voice preset) */
  voiceId?: string;
  /** Speaking rate (0.25 to 4.0, default: 1.0) */
  speakingRate?: number;
  /** Pitch adjustment (-20.0 to 20.0 semitones, default: 0.0) */
  pitch?: number;
}

/**
 * Synthesize speech from text using Google Cloud TTS.
 *
 * @param text - The text to synthesize
 * @param options - Voice and audio configuration
 * @returns Base64-encoded MP3 audio data
 *
 * @example
 * ```ts
 * const audioBase64 = await synthesizeSpeech("Hello, I'm your Ignite Coach!");
 * // Returns: "//uQxAAAAAANIAAAAAExBTUUzLjEwMFVV..."
 * ```
 */
export async function synthesizeSpeech(
  text: string,
  options: SynthesizeSpeechOptions = {},
): Promise<string> {
  const { voice = 'male', voiceId, speakingRate = 1.0, pitch = 0.0 } = options;

  // Use voiceId directly if provided, otherwise fall back to preset
  const voiceName = voiceId || VOICE_PRESETS[voice].name;
  const languageCode = voiceName.startsWith('en-US') ? 'en-US' : 'en-US';
  const ttsClient = getTTSClient();

  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate,
      pitch,
      // Optimize for natural speech
      effectsProfileId: ['headphone-class-device'],
    },
  });

  if (!response.audioContent) {
    throw new Error('No audio content returned from Google TTS');
  }

  // Convert to Base64 string
  if (typeof response.audioContent === 'string') {
    return response.audioContent;
  }

  // Handle Uint8Array response
  return Buffer.from(response.audioContent).toString('base64');
}

/**
 * Synthesize speech with SSML markup for advanced control.
 *
 * @param ssml - SSML-formatted text
 * @param options - Voice and audio configuration
 * @returns Base64-encoded MP3 audio data
 */
export async function synthesizeSpeechSSML(
  ssml: string,
  options: SynthesizeSpeechOptions = {},
): Promise<string> {
  const { voice = 'male', speakingRate = 1.0, pitch = 0.0 } = options;

  const voiceConfig = VOICE_PRESETS[voice];
  const ttsClient = getTTSClient();

  const [response] = await ttsClient.synthesizeSpeech({
    input: { ssml },
    voice: {
      languageCode: voiceConfig.languageCode,
      name: voiceConfig.name,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate,
      pitch,
      effectsProfileId: ['headphone-class-device'],
    },
  });

  if (!response.audioContent) {
    throw new Error('No audio content returned from Google TTS');
  }

  if (typeof response.audioContent === 'string') {
    return response.audioContent;
  }

  return Buffer.from(response.audioContent).toString('base64');
}
