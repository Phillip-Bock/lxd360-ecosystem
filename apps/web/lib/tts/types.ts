/**
 * TTS Types - Text-to-Speech configuration and response types
 */

/** Supported TTS providers */
export type TTSProvider = 'elevenlabs' | 'google';

/** Voice gender options */
export type VoiceGender = 'male' | 'female' | 'neutral';

/** Voice style/mood */
export type VoiceStyle =
  | 'conversational'
  | 'professional'
  | 'friendly'
  | 'authoritative'
  | 'calm'
  | 'energetic';

/** Voice configuration for a specific provider */
export interface Voice {
  id: string;
  name: string;
  provider: TTSProvider;
  gender: VoiceGender;
  language: string;
  languageCode: string;
  accent?: string;
  style?: VoiceStyle;
  previewUrl?: string;
  isDefault?: boolean;
}

/** ElevenLabs-specific voice settings */
export interface ElevenLabsVoiceSettings {
  stability: number;
  similarityBoost: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

/** Google Cloud TTS voice settings */
export interface GoogleVoiceSettings {
  speakingRate: number;
  pitch: number;
  volumeGainDb: number;
  audioEncoding: 'MP3' | 'WAV' | 'OGG_OPUS';
}

/** Common TTS request options */
export interface TTSRequest {
  text: string;
  voiceId: string;
  provider: TTSProvider;
  settings?: ElevenLabsVoiceSettings | GoogleVoiceSettings;
}

/** TTS generation response */
export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  audioBase64?: string;
  duration?: number;
  format: 'mp3' | 'wav' | 'ogg';
  provider: TTSProvider;
  voiceId: string;
  error?: string;
}

/** Voice library for selection UI */
export interface VoiceLibrary {
  elevenlabs: Voice[];
  google: Voice[];
}

/** Default ElevenLabs voices (commonly available) */
export const DEFAULT_ELEVENLABS_VOICES: Voice[] = [
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    provider: 'elevenlabs',
    gender: 'female',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
    style: 'conversational',
    isDefault: true,
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    provider: 'elevenlabs',
    gender: 'male',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
    style: 'professional',
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    provider: 'elevenlabs',
    gender: 'male',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
    style: 'authoritative',
  },
  {
    id: 'jBpfuIE2acCO8z3wKNLl',
    name: 'Gigi',
    provider: 'elevenlabs',
    gender: 'female',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
    style: 'friendly',
  },
  {
    id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    provider: 'elevenlabs',
    gender: 'male',
    language: 'English',
    languageCode: 'en-GB',
    accent: 'British',
    style: 'calm',
  },
];

/** Default Google Cloud TTS voices */
export const DEFAULT_GOOGLE_VOICES: Voice[] = [
  {
    id: 'en-US-Wavenet-D',
    name: 'Wavenet D',
    provider: 'google',
    gender: 'male',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
    isDefault: true,
  },
  {
    id: 'en-US-Wavenet-F',
    name: 'Wavenet F',
    provider: 'google',
    gender: 'female',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
  },
  {
    id: 'en-GB-Wavenet-B',
    name: 'Wavenet B',
    provider: 'google',
    gender: 'male',
    language: 'English',
    languageCode: 'en-GB',
    accent: 'British',
  },
  {
    id: 'en-GB-Wavenet-C',
    name: 'Wavenet C',
    provider: 'google',
    gender: 'female',
    language: 'English',
    languageCode: 'en-GB',
    accent: 'British',
  },
  {
    id: 'en-US-Neural2-J',
    name: 'Neural2 J',
    provider: 'google',
    gender: 'male',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
    style: 'professional',
  },
];

/** Default voice settings by provider */
export const DEFAULT_ELEVENLABS_SETTINGS: ElevenLabsVoiceSettings = {
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0,
  useSpeakerBoost: true,
};

export const DEFAULT_GOOGLE_SETTINGS: GoogleVoiceSettings = {
  speakingRate: 1.0,
  pitch: 0,
  volumeGainDb: 0,
  audioEncoding: 'MP3',
};
