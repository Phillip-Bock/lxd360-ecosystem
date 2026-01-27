'use client';

import { Download, Library, Music, Save, Scissors, Volume2, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AudioLibrary, AudioUpload } from './audio-library';
import { TrimControls, TrimPresets } from './trim-controls';
import { VolumeControls, VolumePresets } from './volume-controls';
import { WaveformEditor } from './waveform-editor';

interface AudioEditorProps {
  open: boolean;
  onClose: () => void;
  audioUrl?: string;
  onSave?: (editedAudioUrl: string, settings: AudioSettings) => void;
}

interface AudioSettings {
  trim: { start: number; end: number };
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

/**
 * AudioEditor - Full audio editing panel with waveform, trim, and volume controls
 */
export function AudioEditor({
  open,
  onClose,
  audioUrl: initialAudioUrl,
  onSave,
}: AudioEditorProps) {
  const [audioUrl, setAudioUrl] = useState(initialAudioUrl || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Edit settings
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);

  const handleReady = useCallback((audioDuration: number) => {
    setDuration(audioDuration);
    setTrimEnd(audioDuration);
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    // Reset settings
    setTrimStart(0);
    setTrimEnd(0);
    setVolume(1);
    setFadeIn(0);
    setFadeOut(0);
  }, []);

  const handleSelectFromLibrary = useCallback(
    (asset: { id: string; title: string; downloadUrl?: string }) => {
      if (asset.downloadUrl) {
        setAudioUrl(asset.downloadUrl);
      }
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (!audioUrl) return;

    onSave?.(audioUrl, {
      trim: { start: trimStart, end: trimEnd },
      volume,
      fadeIn,
      fadeOut,
    });
    onClose();
  }, [audioUrl, trimStart, trimEnd, volume, fadeIn, fadeOut, onSave, onClose]);

  const handleReset = useCallback(() => {
    setTrimStart(0);
    setTrimEnd(duration);
    setVolume(1);
    setFadeIn(0);
    setFadeOut(0);
  }, [duration]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-(--studio-surface) border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Audio Editor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Waveform Display */}
          {audioUrl ? (
            <div className="bg-(--studio-bg) rounded-lg p-4">
              <WaveformEditor
                audioUrl={audioUrl}
                onReady={handleReady}
                onTimeUpdate={setCurrentTime}
                isPlaying={isPlaying}
                onPlayStateChange={setIsPlaying}
                trimRegion={{ start: trimStart, end: trimEnd }}
                onRegionChange={({ start, end }) => {
                  setTrimStart(start);
                  setTrimEnd(end);
                }}
              />

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <span className="text-xs text-zinc-500">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          ) : (
            <AudioUpload onUpload={handleFileUpload} />
          )}

          {/* Edit Tabs */}
          {audioUrl && (
            <Tabs defaultValue="trim" className="w-full">
              <TabsList className="bg-(--studio-bg) border border-white/10">
                <TabsTrigger value="trim" className="gap-2">
                  <Scissors className="h-4 w-4" />
                  Trim
                </TabsTrigger>
                <TabsTrigger value="volume" className="gap-2">
                  <Volume2 className="h-4 w-4" />
                  Volume
                </TabsTrigger>
                <TabsTrigger value="library" className="gap-2">
                  <Library className="h-4 w-4" />
                  Library
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trim" className="mt-4">
                <TrimControls
                  duration={duration}
                  startTime={trimStart}
                  endTime={trimEnd}
                  onStartChange={setTrimStart}
                  onEndChange={setTrimEnd}
                  onApplyTrim={() => {
                    // In a real implementation, this would apply the trim
                  }}
                  onReset={() => {
                    setTrimStart(0);
                    setTrimEnd(duration);
                  }}
                />
                <div className="mt-3">
                  <p className="text-xs text-zinc-500 mb-2">Quick Presets</p>
                  <TrimPresets
                    duration={duration}
                    onApplyPreset={(start, end) => {
                      setTrimStart(start);
                      setTrimEnd(end);
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="volume" className="mt-4">
                <VolumeControls
                  volume={volume}
                  fadeIn={fadeIn}
                  fadeOut={fadeOut}
                  duration={duration}
                  onVolumeChange={setVolume}
                  onFadeInChange={setFadeIn}
                  onFadeOutChange={setFadeOut}
                  onReset={() => {
                    setVolume(1);
                    setFadeIn(0);
                    setFadeOut(0);
                  }}
                />
                <div className="mt-3">
                  <p className="text-xs text-zinc-500 mb-2">Quick Presets</p>
                  <VolumePresets
                    onApply={(vol, fi, fo) => {
                      setVolume(vol);
                      setFadeIn(fi);
                      setFadeOut(fo);
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="library" className="mt-4">
                <AudioLibrary onSelectAudio={handleSelectFromLibrary} />
              </TabsContent>
            </Tabs>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-white/10">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-white/10" onClick={handleReset}>
                Reset All
              </Button>
              {audioUrl && (
                <Button variant="outline" size="sm" className="border-white/10">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!audioUrl}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export { AudioLibrary, AudioUpload } from './audio-library';
export { TrimControls, TrimPresets } from './trim-controls';
export { VolumeControls, VolumePresets } from './volume-controls';
export { WaveformEditor } from './waveform-editor';
