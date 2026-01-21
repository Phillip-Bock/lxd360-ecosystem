'use client';

import { Clock, ExternalLink, Loader2, Play, Plus, Search, Video } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StockVideo {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  duration: number;
  width: number;
  height: number;
  author?: string;
  source: 'pexels' | 'pixabay' | 'coverr';
  license: string;
}

interface VideoLibraryProps {
  onSelectVideo: (video: StockVideo) => void;
}

/**
 * VideoLibrary - Stock video browser for Pexels, Pixabay, Coverr
 */
export function VideoLibrary({ onSelectVideo }: VideoLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<StockVideo[]>([]);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  // Placeholder videos - would be replaced with actual API calls
  const placeholderVideos: StockVideo[] = [
    {
      id: '1',
      url: '/placeholder-video-1.mp4',
      thumbnailUrl: '/placeholder-thumb-1.jpg',
      title: 'Business Meeting',
      duration: 15,
      width: 1920,
      height: 1080,
      author: 'Video Creator',
      source: 'pexels',
      license: 'Pexels License',
    },
    {
      id: '2',
      url: '/placeholder-video-2.mp4',
      thumbnailUrl: '/placeholder-thumb-2.jpg',
      title: 'Technology Abstract',
      duration: 20,
      width: 1920,
      height: 1080,
      source: 'pixabay',
      license: 'Pixabay License',
    },
    {
      id: '3',
      url: '/placeholder-video-3.mp4',
      thumbnailUrl: '/placeholder-thumb-3.jpg',
      title: 'Nature Landscape',
      duration: 30,
      width: 3840,
      height: 2160,
      author: 'Nature Films',
      source: 'coverr',
      license: 'Coverr License',
    },
    {
      id: '4',
      url: '/placeholder-video-4.mp4',
      thumbnailUrl: '/placeholder-thumb-4.jpg',
      title: 'Office Environment',
      duration: 12,
      width: 1920,
      height: 1080,
      source: 'pexels',
      license: 'Pexels License',
    },
    {
      id: '5',
      url: '/placeholder-video-5.mp4',
      thumbnailUrl: '/placeholder-thumb-5.jpg',
      title: 'Learning Animation',
      duration: 25,
      width: 1920,
      height: 1080,
      source: 'pixabay',
      license: 'Pixabay License',
    },
    {
      id: '6',
      url: '/placeholder-video-6.mp4',
      thumbnailUrl: '/placeholder-thumb-6.jpg',
      title: 'Team Collaboration',
      duration: 18,
      width: 1920,
      height: 1080,
      author: 'Collaboration Films',
      source: 'coverr',
      license: 'Coverr License',
    },
  ];

  const handleSearch = async () => {
    setIsSearching(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Filter placeholder data
    const filtered = placeholderVideos.filter(
      (video) =>
        searchQuery === '' || video.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    setResults(filtered);
    setIsSearching(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSourceLabel = (source: StockVideo['source']) => {
    switch (source) {
      case 'pexels':
        return 'Pexels';
      case 'pixabay':
        return 'Pixabay';
      case 'coverr':
        return 'Coverr';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search videos..."
              className="pl-9 bg-[#0d0d14] border-white/10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {results.length === 0 && !isSearching && (
            <div className="col-span-2 text-center py-8 text-zinc-500">
              <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Search for videos</p>
              <p className="text-xs mt-1">Free stock videos from Pexels, Pixabay & Coverr</p>
            </div>
          )}

          {results.map((video) => (
            <div
              key={video.id}
              role="presentation"
              className="relative aspect-video bg-zinc-800 rounded-xs overflow-hidden group cursor-pointer"
              onMouseEnter={() => setPreviewingId(video.id)}
              onMouseLeave={() => setPreviewingId(null)}
            >
              {/* Placeholder gradient */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-purple-500/20" />

              {/* Duration badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-xs">
                <Clock className="h-3 w-3" />
                {formatDuration(video.duration)}
              </div>

              {/* Play indicator on hover */}
              {previewingId === video.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="h-10 w-10 text-white" />
                </div>
              )}

              {/* Info bar */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/80 to-transparent">
                <p className="text-xs text-white truncate">{video.title}</p>
                <p className="text-[10px] text-zinc-400">
                  {getSourceLabel(video.source)} • {video.width}×{video.height}
                </p>
              </div>

              {/* Select button on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="sm" variant="secondary" onClick={() => onSelectVideo(video)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Source Attribution */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <p className="text-xs text-zinc-600">Free to use. Attribution appreciated.</p>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-zinc-500 h-7"
                  onClick={() => window.open('https://pexels.com/videos', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Pexels
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Pexels Videos</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-zinc-500 h-7"
                  onClick={() => window.open('https://pixabay.com/videos', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Pixabay
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Pixabay Videos</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-zinc-500 h-7"
                  onClick={() => window.open('https://coverr.co', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Coverr
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Coverr</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * Video upload component
 */
export function VideoUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('video/')) {
      onUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div
      role="presentation"
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragOver ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <Video className="h-8 w-8 mx-auto mb-2 text-zinc-500" />
      <p className="text-sm text-zinc-400 mb-2">Drag and drop a video or</p>
      <label>
        <input type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
        <Button variant="outline" size="sm" className="border-white/10" asChild>
          <span className="cursor-pointer">Browse Files</span>
        </Button>
      </label>
      <p className="text-xs text-zinc-600 mt-2">Supports MP4, WebM, MOV (max 500MB)</p>
    </div>
  );
}
