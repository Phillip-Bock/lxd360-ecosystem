'use client';

import {
  Bookmark,
  Download,
  HelpCircle,
  Library,
  MousePointer2,
  Pause,
  Play,
  Save,
  Scissors,
  Video,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutoChapterSuggestions, type ChapterMarker, ChapterMarkers } from './chapter-markers';
import { type VideoHotspot, VideoHotspotOverlay } from './hotspot-overlay';
import { QuizOverlay, type VideoQuiz } from './quiz-overlay';
import { VideoTrimPresets, VideoTrimTool } from './trim-tool';
import { VideoLibrary, VideoUpload } from './video-library';

interface VideoEditorProps {
  open: boolean;
  onClose: () => void;
  videoUrl?: string;
  onSave?: (settings: VideoSettings) => void;
}

interface VideoSettings {
  trim: { start: number; end: number };
  chapters: ChapterMarker[];
  hotspots: VideoHotspot[];
  quizzes: VideoQuiz[];
  volume: number;
}

/**
 * VideoEditor - Full video editing panel with trim, chapters, hotspots, and quiz tools
 */
export function VideoEditor({
  open,
  onClose,
  videoUrl: initialVideoUrl,
  onSave,
}: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || '');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Trim state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Chapter state
  const [chapters, setChapters] = useState<ChapterMarker[]>([]);

  // Hotspot state
  const [hotspots, setHotspots] = useState<VideoHotspot[]>([]);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  // Quiz state
  const [quizzes, setQuizzes] = useState<VideoQuiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  const handleFileUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    // Reset all settings
    setTrimStart(0);
    setChapters([]);
    setHotspots([]);
    setQuizzes([]);
  }, []);

  const handleSelectFromLibrary = useCallback((video: { url: string; duration: number }) => {
    setVideoUrl(video.url);
    setDuration(video.duration);
    setTrimEnd(video.duration);
  }, []);

  const handleSave = useCallback(() => {
    onSave?.({
      trim: { start: trimStart, end: trimEnd },
      chapters,
      hotspots,
      quizzes,
      volume,
    });
    onClose();
  }, [trimStart, trimEnd, chapters, hotspots, quizzes, volume, onSave, onClose]);

  const handleReset = useCallback(() => {
    setTrimStart(0);
    setTrimEnd(duration);
    setChapters([]);
    setHotspots([]);
    setQuizzes([]);
    setVolume(1);
  }, [duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-[#1a1a2e] border-white/10 max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Video Editor
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[1fr,320px] gap-4 overflow-hidden">
          {/* Video Preview */}
          <div className="space-y-4">
            {videoUrl ? (
              <>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {/* Placeholder since we don't have real video */}
                  <div className="absolute inset-0 bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                    <Video className="h-16 w-16 text-zinc-700" />
                  </div>

                  {/* Hotspot overlays (visible at current time) */}
                  {hotspots
                    .filter((h) => currentTime >= h.startTime && currentTime <= h.endTime)
                    .map((hotspot) => (
                      <button
                        type="button"
                        key={hotspot.id}
                        className={`absolute cursor-pointer transition-transform hover:scale-105 ${
                          hotspot.shape === 'circle' ? 'rounded-full' : 'rounded-xs'
                        }`}
                        style={{
                          left: `${hotspot.x}%`,
                          top: `${hotspot.y}%`,
                          width: `${hotspot.width}%`,
                          height: `${hotspot.height}%`,
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: `${hotspot.color}33`,
                          border: `2px solid ${hotspot.color}`,
                        }}
                        onClick={() => setSelectedHotspotId(hotspot.id)}
                        aria-label={`Select hotspot: ${hotspot.label || 'Untitled'}`}
                      />
                    ))}
                </div>

                {/* Video Controls */}
                <div className="flex items-center gap-3 bg-[#0d0d14] rounded-lg p-3">
                  <Button variant="ghost" size="icon" onClick={handlePlayPause}>
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <span className="text-xs text-zinc-400 w-20">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  {/* Progress bar */}
                  <button
                    type="button"
                    className="flex-1 h-1 bg-zinc-700 rounded-full cursor-pointer relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = x / rect.width;
                      handleSeek(percentage * duration);
                    }}
                    onKeyDown={(e) => {
                      const seekStep = 5; // seconds
                      if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        handleSeek(Math.min(currentTime + seekStep, duration));
                      } else if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        handleSeek(Math.max(currentTime - seekStep, 0));
                      } else if (e.key === 'Home') {
                        e.preventDefault();
                        handleSeek(0);
                      } else if (e.key === 'End') {
                        e.preventDefault();
                        handleSeek(duration);
                      }
                    }}
                    aria-label={`Video progress: ${formatTime(currentTime)} of ${formatTime(duration)}. Use arrow keys to seek.`}
                  >
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </button>

                  <Button variant="ghost" size="icon" onClick={handleMuteToggle}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
              </>
            ) : (
              <VideoUpload onUpload={handleFileUpload} />
            )}
          </div>

          {/* Tools Panel */}
          <div className="border-l border-white/10 pl-4 overflow-y-auto max-h-[60vh]">
            <Tabs defaultValue="trim" className="w-full">
              <TabsList className="w-full bg-[#0d0d14] border border-white/10">
                <TabsTrigger value="trim" className="flex-1">
                  <Scissors className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="chapters" className="flex-1">
                  <Bookmark className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="hotspots" className="flex-1">
                  <MousePointer2 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex-1">
                  <HelpCircle className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="library" className="flex-1">
                  <Library className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trim" className="mt-4">
                <VideoTrimTool
                  duration={duration}
                  startTime={trimStart}
                  endTime={trimEnd}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  onStartChange={setTrimStart}
                  onEndChange={setTrimEnd}
                  onSeek={handleSeek}
                  onPlayPause={handlePlayPause}
                  onApplyTrim={() => {
                    // Apply trim logic
                  }}
                  onReset={() => {
                    setTrimStart(0);
                    setTrimEnd(duration);
                  }}
                />
                <div className="mt-3">
                  <p className="text-xs text-zinc-500 mb-2">Quick Presets</p>
                  <VideoTrimPresets
                    duration={duration}
                    onApplyPreset={(start, end) => {
                      setTrimStart(start);
                      setTrimEnd(end);
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="chapters" className="mt-4">
                <ChapterMarkers
                  markers={chapters}
                  duration={duration}
                  currentTime={currentTime}
                  onMarkersChange={setChapters}
                  onSeekToMarker={handleSeek}
                />
                <div className="mt-3">
                  <AutoChapterSuggestions duration={duration} onApply={setChapters} />
                </div>
              </TabsContent>

              <TabsContent value="hotspots" className="mt-4">
                <VideoHotspotOverlay
                  hotspots={hotspots}
                  selectedId={selectedHotspotId}
                  currentTime={currentTime}
                  duration={duration}
                  onHotspotsChange={setHotspots}
                  onSelect={setSelectedHotspotId}
                />
              </TabsContent>

              <TabsContent value="quiz" className="mt-4">
                <QuizOverlay
                  quizzes={quizzes}
                  selectedId={selectedQuizId}
                  currentTime={currentTime}
                  onQuizzesChange={setQuizzes}
                  onSelect={setSelectedQuizId}
                />
              </TabsContent>

              <TabsContent value="library" className="mt-4">
                <VideoLibrary onSelectVideo={handleSelectFromLibrary} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-white/10">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-white/10" onClick={handleReset}>
              Reset All
            </Button>
            {videoUrl && (
              <Button variant="outline" size="sm" className="border-white/10">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!videoUrl}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { ChapterMarker } from './chapter-markers';
export { AutoChapterSuggestions, ChapterMarkers } from './chapter-markers';
export type { VideoHotspot } from './hotspot-overlay';
export { VideoHotspotOverlay } from './hotspot-overlay';
export type { VideoQuiz } from './quiz-overlay';
export { QuizOverlay } from './quiz-overlay';
export { VideoTrimPresets, VideoTrimTool } from './trim-tool';
export { VideoLibrary, VideoUpload } from './video-library';
