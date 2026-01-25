/**
 * TTS Types - Text-to-Speech configuration and response types
 * Google Cloud TTS Only - Single provider architecture
 */

/** Supported TTS provider (Google Cloud only) */
export type TTSProvider = 'google';

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

/** Voice configuration */
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
  settings?: GoogleVoiceSettings;
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
  google: Voice[];
}

/** Default Google Cloud TTS Neural2 voices - High-fidelity professional voices */
export const DEFAULT_GOOGLE_VOICES: Voice[] = [
  // American English - Neural2 (Highest Quality)
  {
    id: 'en-US-Neural2-F',
    name: 'Aria',
    provider: 'google',
    gender: 'female',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
    style: 'professional',
    isDefault: true,
  },
  {
    id: 'en-US-Neural2-D',
    name: 'Marcus',
    provider: 'google',
    gender: 'male',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
    style: 'professional',
  },
  {
    id: 'en-US-Neural2-C',
    name: 'Sophie',
    provider: 'google',
    gender: 'female',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
    style: 'conversational',
  },
  {
    id: 'en-US-Neural2-J',
    name: 'James',
    provider: 'google',
    gender: 'male',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
    style: 'authoritative',
  },
  {
    id: 'en-US-Neural2-A',
    name: 'Emma',
    provider: 'google',
    gender: 'female',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
    style: 'friendly',
  },
  {
    id: 'en-US-Neural2-I',
    name: 'David',
    provider: 'google',
    gender: 'male',
    language: 'English',
    languageCode: 'en-US',
    accent: 'American',
    style: 'calm',
  },
  // British English - Neural2
  {
    id: 'en-GB-Neural2-A',
    name: 'Charlotte',
    provider: 'google',
    gender: 'female',
    language: 'English',
    languageCode: 'en-GB',
    accent: 'British',
    style: 'professional',
  },
  {
    id: 'en-GB-Neural2-B',
    name: 'Oliver',
    provider: 'google',
    gender: 'male',
    language: 'English',
    languageCode: 'en-GB',
    accent: 'British',
    style: 'calm',
  },
  // Australian English - Neural2
  {
    id: 'en-AU-Neural2-A',
    name: 'Olivia',
    provider: 'google',
    gender: 'female',
    language: 'English',
    languageCode: 'en-AU',
    accent: 'Australian',
    style: 'friendly',
  },
  {
    id: 'en-AU-Neural2-B',
    name: 'Liam',
    provider: 'google',
    gender: 'male',
    language: 'English',
    languageCode: 'en-AU',
    accent: 'Australian',
    style: 'conversational',
  },
];

/** Default voice settings */
export const DEFAULT_GOOGLE_SETTINGS: GoogleVoiceSettings = {
  speakingRate: 1.0,
  pitch: 0,
  volumeGainDb: 0,
  audioEncoding: 'MP3',
};
