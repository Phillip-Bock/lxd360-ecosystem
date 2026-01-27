'use client';

/**
 * =============================================================================
 * LXD360 | Atom Player Page (LXD-346)
 * =============================================================================
 *
 * Player page for individual content atoms.
 * "Spotify meets Duolingo" design philosophy — minimal chrome, focus on content.
 *
 * @version 1.0.0
 * @updated 2026-01-27
 */

import { ArrowLeft, Menu } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AudioPlayer } from '@/components/player/audio-player';
import { ModalitySwitcher } from '@/components/player/modality-switcher';
import { PlayerBar } from '@/components/player/player-bar';
import type { TranscriptCue } from '@/components/player/transcript-panel';
import { TranscriptPanel } from '@/components/player/transcript-panel';
import { VideoPlayer } from '@/components/player/video-player';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePlayer } from '@/hooks/player/use-player';
import { cn } from '@/lib/utils';
import type { ContentAtom } from '@/types/content/atom';

/**
 * Mock content atom for development
 * TODO(LXD-XXX): Replace with Firestore fetch
 */
function getMockAtom(atomId: string): ContentAtom {
  return {
    id: atomId,
    tenant_id: 'demo-tenant',
    title: 'Introduction to Neural Network Fundamentals',
    description:
      'Learn the foundational concepts of neural networks including neurons, layers, and activation functions.',
    type: 'video',
    duration_seconds: 720,
    modalities: {
      video_url: 'https://storage.googleapis.com/lxd360-demo/sample-video.mp4',
      audio_url: 'https://storage.googleapis.com/lxd360-demo/sample-audio.mp3',
      transcript_text:
        'Welcome to this introduction to neural network fundamentals. In this lesson, we will explore the basic building blocks of neural networks...',
      thumbnail_url: '/images/demo/neural-network-thumb.jpg',
    },
    primary_modality: 'video',
    tags: ['neural-networks', 'deep-learning', 'ai', 'fundamentals'],
    keywords: ['neural network', 'neurons', 'layers', 'activation functions', 'deep learning'],
    learning_metadata: {
      cognitive_load: 2,
      engagement_level: 'active',
      skill_ids: ['skill-neural-basics', 'skill-math-prereqs'],
      prerequisite_atom_ids: [],
      expected_mastery_delta: 0.15,
      review_interval_days: 7,
    },
    xapi_activity_id: `https://lxd360.com/activities/${atomId}`,
    xapi_activity_type: 'http://adlnet.gov/expapi/activities/media',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'published',
    version: 1,
    created_by: 'system',
    updated_by: 'system',
  };
}

/**
 * Mock transcript cues
 */
function getMockTranscriptCues(): TranscriptCue[] {
  return [
    {
      id: 'cue-1',
      startTime: 0,
      endTime: 10,
      text: 'Welcome to this introduction to neural network fundamentals.',
      speaker: 'Dr. Sarah Chen',
    },
    {
      id: 'cue-2',
      startTime: 10,
      endTime: 25,
      text: 'In this lesson, we will explore the basic building blocks of neural networks.',
      speaker: 'Dr. Sarah Chen',
    },
    {
      id: 'cue-3',
      startTime: 25,
      endTime: 45,
      text: "First, let's understand what a neuron is. A neuron is the fundamental unit of a neural network.",
      speaker: 'Dr. Sarah Chen',
    },
    {
      id: 'cue-4',
      startTime: 45,
      endTime: 70,
      text: 'Each neuron receives inputs, applies weights, sums them up, and passes the result through an activation function.',
      speaker: 'Dr. Sarah Chen',
    },
    {
      id: 'cue-5',
      startTime: 70,
      endTime: 95,
      text: 'Think of it like a decision-making unit. It takes in information, processes it, and produces an output.',
      speaker: 'Dr. Sarah Chen',
    },
    {
      id: 'cue-6',
      startTime: 95,
      endTime: 120,
      text: "Now let's talk about layers. Neural networks are organized into layers: input, hidden, and output layers.",
      speaker: 'Dr. Sarah Chen',
    },
    {
      id: 'cue-7',
      startTime: 120,
      endTime: 150,
      text: 'The input layer receives raw data. Hidden layers perform transformations. The output layer produces the final result.',
      speaker: 'Dr. Sarah Chen',
    },
    {
      id: 'cue-8',
      startTime: 150,
      endTime: 180,
      text: 'Deep learning simply means we have many hidden layers, allowing the network to learn complex patterns.',
      speaker: 'Dr. Sarah Chen',
    },
  ];
}

/**
 * Atom Player Page Component
 */
export default function AtomPlayerPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const atomId = params.atomId as string;

  // Load content atom
  const [atom, setAtom] = useState<ContentAtom | null>(null);
  const [transcriptCues, setTranscriptCues] = useState<TranscriptCue[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);

  // Player hook
  const player = usePlayer();

  // Load atom on mount
  useEffect(() => {
    // TODO(LXD-XXX): Fetch from Firestore
    const loadedAtom = getMockAtom(atomId);
    setAtom(loadedAtom);
    setTranscriptCues(getMockTranscriptCues());

    // Load into player
    player.load(loadedAtom);
  }, [atomId, player]);

  // Determine modality availability
  const hasVideo = Boolean(atom?.modalities?.video_url);
  const hasAudio = Boolean(atom?.modalities?.audio_url);
  const hasTranscript = Boolean(atom?.modalities?.transcript_text || transcriptCues.length > 0);

  // Current modality as video/audio
  const currentModality = useMemo((): 'video' | 'audio' => {
    if (player.mode === 'audio') return 'audio';
    return 'video';
  }, [player.mode]);

  // Handle modality change
  const handleModalityChange = useCallback(
    (modality: 'video' | 'audio') => {
      player.switchMode(modality === 'audio' ? 'audio' : 'video');
    },
    [player],
  );

  // Handle speed change (cast to PlaybackRate)
  const handleSpeedChange = useCallback(
    (speed: number) => {
      // Valid speeds: 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2
      const validSpeed = speed as 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
      player.setPlaybackRate(validSpeed);
    },
    [player],
  );

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Toggle transcript panel
  const toggleTranscript = useCallback(() => {
    setShowTranscript((prev) => !prev);
  }, []);

  // Video/audio source
  const videoSrc = atom?.modalities?.video_url ?? '';
  const audioSrc = atom?.modalities?.audio_url ?? '';
  const posterSrc = atom?.modalities?.thumbnail_url;

  if (!atom) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-slate-900/95 px-4 backdrop-blur-sm">
        {/* Left: Back button and title */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-9 w-9 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Button>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-medium text-white">{atom.title}</h1>
            <p className="text-xs text-white/60">Content Atom</p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Modality switcher */}
          {hasVideo && hasAudio && (
            <ModalitySwitcher
              mode={currentModality}
              onModeChange={handleModalityChange}
              hasVideo={hasVideo}
              hasAudio={hasAudio}
              size="sm"
            />
          )}

          {/* Transcript toggle */}
          {hasTranscript && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleTranscript}
              className={cn(
                'text-white/70 hover:bg-white/10 hover:text-white',
                showTranscript && 'bg-cyan-500/20 text-cyan-400',
              )}
              aria-label={showTranscript ? 'Hide transcript' : 'Show transcript'}
              aria-pressed={showTranscript}
            >
              Transcript
            </Button>
          )}

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="More options"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-white/10 bg-slate-900/95 backdrop-blur-sm"
            >
              <DropdownMenuItem className="text-white/70 focus:bg-white/10 focus:text-white">
                Download for offline
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/70 focus:bg-white/10 focus:text-white">
                Add to playlist
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-white/70 focus:bg-white/10 focus:text-white">
                Report an issue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 gap-4 p-4 pb-24">
        {/* Content view */}
        <div className={cn('flex-1', showTranscript && 'lg:flex-[2]')}>
          {currentModality === 'video' && hasVideo ? (
            <VideoPlayer
              src={videoSrc}
              poster={posterSrc}
              currentTime={player.currentTime}
              playbackSpeed={player.playbackRate}
              isPlaying={player.isPlaying}
              onTimeUpdate={player.onTimeUpdate}
              onEnded={player.onEnded}
              onCanPlay={() => player.onLoaded(atom.duration_seconds)}
              onBuffering={player.onBuffering}
              onBuffered={player.onBuffered}
              onLoadedMetadata={player.onLoaded}
              onProgress={player.onProgress}
              onError={player.onError}
              title={atom.title}
              className="w-full"
            />
          ) : (
            <AudioPlayer
              src={audioSrc}
              coverArt={posterSrc}
              title={atom.title}
              artist="LXD360"
              currentTime={player.currentTime}
              playbackSpeed={player.playbackRate}
              isPlaying={player.isPlaying}
              onTimeUpdate={player.onTimeUpdate}
              onEnded={player.onEnded}
              onCanPlay={() => player.onLoaded(atom.duration_seconds)}
              onBuffering={player.onBuffering}
              onBuffered={player.onBuffered}
              onLoadedMetadata={player.onLoaded}
              onProgress={player.onProgress}
              onError={player.onError}
              showWaveform
              className="w-full"
            />
          )}

          {/* Lesson description */}
          <div className="mt-6 rounded-xl border border-white/10 bg-slate-800/50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-white">About this content</h2>
            <p className="text-sm leading-relaxed text-white/70">{atom.description}</p>

            {/* Tags */}
            {atom.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {atom.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transcript panel */}
        {showTranscript && hasTranscript && (
          <div className="hidden flex-1 lg:block">
            <TranscriptPanel
              cues={transcriptCues}
              currentTime={player.currentTime}
              onSeek={player.seek}
              autoScroll
              showSpeakers
              showTimestamps
              searchable
              height="calc(100vh - 200px)"
              className="sticky top-20"
            />
          </div>
        )}
      </main>

      {/* Persistent player bar */}
      <PlayerBar
        title={atom.title}
        subtitle={`${Math.round(atom.duration_seconds / 60)} min`}
        thumbnail={posterSrc}
        currentTime={player.currentTime}
        duration={player.duration}
        buffered={player.bufferedPercent}
        isPlaying={player.isPlaying}
        volume={player.volume}
        isMuted={player.isMuted}
        playbackSpeed={player.playbackRate}
        modality={currentModality}
        hasVideo={hasVideo}
        hasAudio={hasAudio}
        onPlayPause={player.togglePlayPause}
        onSeek={player.seek}
        onSkipForward={() => player.skipForward(10)}
        onSkipBackward={() => player.skipBackward(10)}
        onVolumeChange={player.setVolume}
        onMuteToggle={player.toggleMute}
        onSpeedChange={handleSpeedChange}
        onModalityChange={handleModalityChange}
      />
    </div>
  );
}
