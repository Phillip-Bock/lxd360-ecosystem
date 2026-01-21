'use client';

import { Music, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AudioPlayer(): React.JSX.Element {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('Audio Title');
  const [artist, setArtist] = useState('Artist or Speaker Name');
  const [audioUrl, setAudioUrl] = useState('');
  const [duration] = useState('3:45');
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = formatTime((progress / 100) * 225); // Assuming 3:45 = 225 seconds

  return (
    <Card className="p-6 bg-linear-to-br from-lxd-dark-page to-lxd-dark-surface border-2 border-lxd-blue">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-lxd-text-light-heading">Audio Player</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="border-lxd-dark-surface text-lxd-text-light-secondary hover:bg-lxd-dark-surface"
        >
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </div>

      {isEditing && (
        <div className="space-y-3 mb-6 p-4 bg-lxd-dark-page/50 rounded-lg border border-lxd-dark-surface">
          <div>
            <Label className="text-lxd-text-light-secondary">Audio URL</Label>
            <Input
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="Enter audio file URL"
              className="bg-lxd-dark-page border-lxd-dark-surface text-lxd-text-light-heading"
            />
          </div>
          <div>
            <Label className="text-lxd-text-light-secondary">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Audio title"
              className="bg-lxd-dark-page border-lxd-dark-surface text-lxd-text-light-heading"
            />
          </div>
          <div>
            <Label className="text-lxd-text-light-secondary">Artist/Speaker</Label>
            <Input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist or speaker name"
              className="bg-lxd-dark-page border-lxd-dark-surface text-lxd-text-light-heading"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-6">
        {/* Album art placeholder */}
        <div className="w-28 h-28 bg-linear-to-br from-lxd-blue to-lxd-purple-dark rounded-lg flex items-center justify-center shrink-0 shadow-lg">
          <Music className="w-12 h-12 text-lxd-text-light-heading" />
        </div>

        {/* Player controls */}
        <div className="flex-1">
          <h4 className="text-xl font-bold text-lxd-text-light-heading mb-1">{title}</h4>
          <p className="text-lxd-success text-sm mb-4">{artist}</p>

          {/* Progress bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-lxd-dark-surface rounded-lg appearance-none cursor-pointer accent-lxd-blue"
            />
            <div className="flex justify-between text-xs text-lxd-text-light-muted mt-1">
              <span>{currentTime}</span>
              <span>{duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="text-lxd-text-light-muted hover:text-lxd-blue transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 bg-lxd-blue hover:bg-lxd-blue/80 rounded-full flex items-center justify-center text-lxd-text-light-heading transition-colors shadow-lg shadow-lxd-blue/30"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
              <button
                type="button"
                className="text-lxd-text-light-muted hover:text-lxd-blue transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="text-lxd-text-light-muted hover:text-lxd-blue transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 h-1 bg-lxd-dark-surface rounded-lg appearance-none cursor-pointer accent-lxd-blue"
              />
            </div>
          </div>
        </div>
      </div>

      {audioUrl && (
        <audio ref={audioRef} src={audioUrl}>
          <track kind="captions" srcLang="en" label="English captions" />
        </audio>
      )}
    </Card>
  );
}
