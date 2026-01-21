'use client';

import {
  ExternalLink,
  Loader2,
  Mic,
  Music,
  Pause,
  Play,
  Plus,
  Search,
  Volume2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type AudioCategory = 'all' | 'music' | 'sfx' | 'voice';

interface AudioAsset {
  id: string;
  title: string;
  category: AudioCategory;
  duration: number;
  previewUrl?: string;
  downloadUrl?: string;
  source: 'freesound' | 'pixabay' | 'local';
  license: string;
  attribution?: string;
}

interface AudioLibraryProps {
  onSelectAudio: (asset: AudioAsset) => void;
}

/**
 * AudioLibrary - Stock audio browser for Freesound and Pixabay
 */
export function AudioLibrary({ onSelectAudio }: AudioLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<AudioCategory>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<AudioAsset[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Placeholder data - would be replaced with actual API calls
  const placeholderAssets: AudioAsset[] = [
    {
      id: '1',
      title: 'Upbeat Corporate',
      category: 'music',
      duration: 120,
      source: 'pixabay',
      license: 'Pixabay License',
    },
    {
      id: '2',
      title: 'Click Sound',
      category: 'sfx',
      duration: 0.5,
      source: 'freesound',
      license: 'CC0',
    },
    {
      id: '3',
      title: 'Success Chime',
      category: 'sfx',
      duration: 1.2,
      source: 'freesound',
      license: 'CC BY',
      attribution: 'soundmaker',
    },
    {
      id: '4',
      title: 'Ambient Background',
      category: 'music',
      duration: 180,
      source: 'pixabay',
      license: 'Pixabay License',
    },
    {
      id: '5',
      title: 'Notification Bell',
      category: 'sfx',
      duration: 0.8,
      source: 'freesound',
      license: 'CC0',
    },
  ];

  const handleSearch = async () => {
    setIsSearching(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Filter placeholder data based on search and category
    const filtered = placeholderAssets.filter((asset) => {
      const matchesSearch =
        searchQuery === '' || asset.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === 'all' || asset.category === category;
      return matchesSearch && matchesCategory;
    });

    setResults(filtered);
    setIsSearching(false);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (cat: AudioCategory) => {
    switch (cat) {
      case 'music':
        return Music;
      case 'sfx':
        return Volume2;
      case 'voice':
        return Mic;
      default:
        return Music;
    }
  };

  const handlePlayPreview = (assetId: string) => {
    if (playingId === assetId) {
      setPlayingId(null);
    } else {
      setPlayingId(assetId);
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
              placeholder="Search audio..."
              className="pl-9 bg-[#0d0d14] border-white/10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2">
          {(['all', 'music', 'sfx', 'voice'] as const).map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              size="sm"
              className={category !== cat ? 'border-white/10' : ''}
              onClick={() => setCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>

        {/* Results Grid */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.length === 0 && !isSearching && (
            <div className="text-center py-8 text-zinc-500">
              <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Search for audio or browse by category</p>
              <p className="text-xs mt-1">Stock audio from Freesound and Pixabay</p>
            </div>
          )}

          {results.map((asset) => {
            const CategoryIcon = getCategoryIcon(asset.category);
            const isPlaying = playingId === asset.id;

            return (
              <div
                key={asset.id}
                className="flex items-center gap-3 p-3 bg-[#0d0d14] rounded-md hover:bg-white/5 transition-colors"
              >
                {/* Category Icon */}
                <div className="h-10 w-10 rounded-xs bg-primary/20 flex items-center justify-center shrink-0">
                  <CategoryIcon className="h-5 w-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{asset.title}</p>
                  <p className="text-xs text-zinc-500">
                    {formatDuration(asset.duration)} • {asset.source} • {asset.license}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handlePlayPreview(asset.id)}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isPlaying ? 'Stop preview' : 'Preview'}</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onSelectAudio(asset)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add to lesson</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>

        {/* Source Attribution */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <p className="text-xs text-zinc-600">Audio from Freesound and Pixabay</p>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-zinc-500 h-7"
                  onClick={() => window.open('https://freesound.org', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Freesound
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Freesound</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-zinc-500 h-7"
                  onClick={() => window.open('https://pixabay.com/music', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Pixabay
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Pixabay Music</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * Audio upload component
 */
export function AudioUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('audio/')) {
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
      <Mic className="h-8 w-8 mx-auto mb-2 text-zinc-500" />
      <p className="text-sm text-zinc-400 mb-2">Drag and drop an audio file or</p>
      <label>
        <input type="file" accept="audio/*" className="hidden" onChange={handleFileSelect} />
        <Button variant="outline" size="sm" className="border-white/10" asChild>
          <span className="cursor-pointer">Browse Files</span>
        </Button>
      </label>
      <p className="text-xs text-zinc-600 mt-2">Supports MP3, WAV, OGG, M4A</p>
    </div>
  );
}
