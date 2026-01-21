'use client';

import {
  AlertCircle,
  Download,
  Mic,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Settings2,
  User,
  Volume2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DEFAULT_ELEVENLABS_SETTINGS,
  DEFAULT_ELEVENLABS_VOICES,
  DEFAULT_GOOGLE_SETTINGS,
  DEFAULT_GOOGLE_VOICES,
  type ElevenLabsVoiceSettings,
  type GoogleVoiceSettings,
  type TTSProvider,
  type TTSResponse,
  type Voice,
} from '@/lib/tts';

interface TTSPanelProps {
  selectedText?: string;
  onAudioGenerated?: (audioUrl: string, voiceName: string) => void;
  onInsertAudioBlock?: (audioData: { url: string; duration?: number; voice: string }) => void;
}

/**
 * TTSPanel - Text-to-Speech generation panel with voice selection
 * and audio preview
 */
export function TTSPanel({
  selectedText = '',
  onAudioGenerated,
  onInsertAudioBlock,
}: TTSPanelProps) {
  const [text, setText] = useState(selectedText);
  const [provider, setProvider] = useState<TTSProvider>('elevenlabs');
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [voices] = useState<{ elevenlabs: Voice[]; google: Voice[] }>({
    elevenlabs: DEFAULT_ELEVENLABS_VOICES,
    google: DEFAULT_GOOGLE_VOICES,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Voice settings
  const [elevenLabsSettings, setElevenLabsSettings] = useState<ElevenLabsVoiceSettings>(
    DEFAULT_ELEVENLABS_SETTINGS,
  );
  const [googleSettings, setGoogleSettings] =
    useState<GoogleVoiceSettings>(DEFAULT_GOOGLE_SETTINGS);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (selectedText) {
      setText(selectedText);
    }
  }, [selectedText]);

  useEffect(() => {
    // Set default voice when provider changes
    const providerVoices = voices[provider];
    const defaultVoice = providerVoices.find((v) => v.isDefault) || providerVoices[0];
    if (defaultVoice) {
      setSelectedVoice(defaultVoice);
    }
  }, [provider, voices]);

  useEffect(() => {
    // Cleanup audio URL on unmount
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) return;

    setIsGenerating(true);
    setError(null);

    try {
      const settings = provider === 'elevenlabs' ? elevenLabsSettings : googleSettings;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voiceId: selectedVoice.id,
          provider,
          settings,
        }),
      });

      const result: TTSResponse = await response.json();

      if (!result.success || !result.audioBase64) {
        throw new Error(result.error || 'Failed to generate audio');
      }

      // Convert base64 to blob URL
      const byteCharacters = atob(result.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `audio/${result.format}` });
      const url = URL.createObjectURL(blob);

      // Cleanup previous URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(url);
      onAudioGenerated?.(url, selectedVoice.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioUrl || !selectedVoice) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `tts-${selectedVoice.name.toLowerCase().replace(/\s+/g, '-')}.mp3`;
    link.click();
  };

  const handleInsertBlock = () => {
    if (!audioUrl || !selectedVoice) return;

    onInsertAudioBlock?.({
      url: audioUrl,
      duration: audioRef.current?.duration,
      voice: selectedVoice.name,
    });
  };

  const currentVoices = voices[provider];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Text Input Area */}
        <div>
          <Label className="text-xs text-zinc-500 mb-1 block">Text to Synthesize</Label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text or select content from the editor..."
            className="w-full h-24 bg-[#0d0d14] border border-white/10 rounded-md p-3 text-sm text-white resize-none focus:outline-hidden focus:ring-1 focus:ring-primary"
            maxLength={5000}
          />
          <div className="text-xs text-zinc-600 text-right mt-1">{text.length}/5000 characters</div>
        </div>

        {/* Provider & Voice Selection */}
        <div className="flex gap-4">
          {/* Provider Toggle */}
          <div>
            <Label className="text-xs text-zinc-500 mb-1 block">Provider</Label>
            <div className="flex bg-[#0d0d14] rounded-md p-1">
              <button
                type="button"
                onClick={() => setProvider('elevenlabs')}
                className={`px-3 py-1.5 text-xs rounded-xs transition-colors ${
                  provider === 'elevenlabs'
                    ? 'bg-primary text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ElevenLabs
              </button>
              <button
                type="button"
                onClick={() => setProvider('google')}
                className={`px-3 py-1.5 text-xs rounded-xs transition-colors ${
                  provider === 'google' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Google
              </button>
            </div>
          </div>

          {/* Voice Selector */}
          <div className="flex-1">
            <Label className="text-xs text-zinc-500 mb-1 block">Voice</Label>
            <div className="flex gap-2">
              <select
                value={selectedVoice?.id || ''}
                onChange={(e) => {
                  const voice = currentVoices.find((v) => v.id === e.target.value);
                  if (voice) setSelectedVoice(voice);
                }}
                className="flex-1 bg-[#0d0d14] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                {currentVoices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} ({voice.gender}, {voice.accent || voice.languageCode})
                  </option>
                ))}
              </select>

              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="border-white/10">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a2e] border-white/10">
                  <DialogHeader>
                    <DialogTitle>Voice Settings</DialogTitle>
                  </DialogHeader>
                  <VoiceSettingsPanel
                    provider={provider}
                    elevenLabsSettings={elevenLabsSettings}
                    googleSettings={googleSettings}
                    onElevenLabsChange={setElevenLabsSettings}
                    onGoogleChange={setGoogleSettings}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Selected Voice Info */}
        {selectedVoice && (
          <div className="flex items-center gap-3 p-3 bg-[#0d0d14] rounded-md">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{selectedVoice.name}</p>
              <p className="text-xs text-zinc-500">
                {selectedVoice.gender} • {selectedVoice.accent || selectedVoice.languageCode}
                {selectedVoice.style && ` • ${selectedVoice.style}`}
              </p>
            </div>
            {selectedVoice.previewUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const audio = new Audio(selectedVoice.previewUrl);
                      audio.play();
                    }}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview voice</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!text.trim() || !selectedVoice || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Generate Audio
            </>
          )}
        </Button>

        {/* Audio Player */}
        {audioUrl && (
          <div className="p-4 bg-[#0d0d14] rounded-md space-y-3">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <track kind="captions" srcLang="en" label="English captions" />
            </audio>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="border-white/10"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <div className="flex-1 h-1 bg-zinc-800 rounded-full">
                <div className="h-full w-0 bg-primary rounded-full" />
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download audio</TooltipContent>
              </Tooltip>
            </div>

            {onInsertAudioBlock && (
              <Button
                variant="outline"
                className="w-full border-white/10"
                onClick={handleInsertBlock}
              >
                <Plus className="h-4 w-4 mr-2" />
                Insert as Audio Block
              </Button>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * Voice Settings Panel - Fine-tune voice parameters
 */
function VoiceSettingsPanel({
  provider,
  elevenLabsSettings,
  googleSettings,
  onElevenLabsChange,
  onGoogleChange,
}: {
  provider: TTSProvider;
  elevenLabsSettings: ElevenLabsVoiceSettings;
  googleSettings: GoogleVoiceSettings;
  onElevenLabsChange: (settings: ElevenLabsVoiceSettings) => void;
  onGoogleChange: (settings: GoogleVoiceSettings) => void;
}) {
  if (provider === 'elevenlabs') {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <Label>Stability</Label>
            <span className="text-zinc-500">{elevenLabsSettings.stability}</span>
          </div>
          <Slider
            value={[elevenLabsSettings.stability]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([value]) =>
              onElevenLabsChange({ ...elevenLabsSettings, stability: value })
            }
          />
          <p className="text-xs text-zinc-600 mt-1">
            Higher stability = more consistent, lower = more expressive
          </p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <Label>Similarity Boost</Label>
            <span className="text-zinc-500">{elevenLabsSettings.similarityBoost}</span>
          </div>
          <Slider
            value={[elevenLabsSettings.similarityBoost]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([value]) =>
              onElevenLabsChange({ ...elevenLabsSettings, similarityBoost: value })
            }
          />
          <p className="text-xs text-zinc-600 mt-1">
            Higher = closer to original voice, lower = more varied
          </p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <Label>Style</Label>
            <span className="text-zinc-500">{elevenLabsSettings.style}</span>
          </div>
          <Slider
            value={[elevenLabsSettings.style || 0]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([value]) => onElevenLabsChange({ ...elevenLabsSettings, style: value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="speaker-boost"
            checked={elevenLabsSettings.useSpeakerBoost}
            onChange={(e) =>
              onElevenLabsChange({
                ...elevenLabsSettings,
                useSpeakerBoost: e.target.checked,
              })
            }
            className="rounded-xs border-white/10"
          />
          <Label htmlFor="speaker-boost" className="text-sm cursor-pointer">
            Use Speaker Boost
          </Label>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <Label>Speaking Rate</Label>
          <span className="text-zinc-500">{googleSettings.speakingRate}x</span>
        </div>
        <Slider
          value={[googleSettings.speakingRate]}
          min={0.25}
          max={4}
          step={0.25}
          onValueChange={([value]) => onGoogleChange({ ...googleSettings, speakingRate: value })}
        />
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <Label>Pitch</Label>
          <span className="text-zinc-500">{googleSettings.pitch}</span>
        </div>
        <Slider
          value={[googleSettings.pitch]}
          min={-20}
          max={20}
          step={1}
          onValueChange={([value]) => onGoogleChange({ ...googleSettings, pitch: value })}
        />
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <Label>Volume Gain (dB)</Label>
          <span className="text-zinc-500">{googleSettings.volumeGainDb}</span>
        </div>
        <Slider
          value={[googleSettings.volumeGainDb]}
          min={-6}
          max={6}
          step={1}
          onValueChange={([value]) => onGoogleChange({ ...googleSettings, volumeGainDb: value })}
        />
      </div>

      <div>
        <Label className="text-sm mb-2 block">Audio Format</Label>
        <select
          value={googleSettings.audioEncoding}
          onChange={(e) =>
            onGoogleChange({
              ...googleSettings,
              audioEncoding: e.target.value as 'MP3' | 'WAV' | 'OGG_OPUS',
            })
          }
          className="w-full bg-[#0d0d14] border border-white/10 rounded-md px-3 py-2 text-sm text-white"
        >
          <option value="MP3">MP3</option>
          <option value="WAV">WAV</option>
          <option value="OGG_OPUS">OGG Opus</option>
        </select>
      </div>
    </div>
  );
}
