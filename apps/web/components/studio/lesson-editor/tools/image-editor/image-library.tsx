'use client';

import { ExternalLink, ImageIcon, Loader2, Plus, Search, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StockImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  width: number;
  height: number;
  photographer?: string;
  source: 'unsplash' | 'pexels' | 'pixabay';
  license: string;
}

interface ImageLibraryProps {
  onSelectImage: (image: StockImage) => void;
}

/**
 * ImageLibrary - Stock image browser for Unsplash, Pexels, and Pixabay
 */
export function ImageLibrary({ onSelectImage }: ImageLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<StockImage[]>([]);
  const [activeSource, setActiveSource] = useState<'all' | 'unsplash' | 'pexels' | 'pixabay'>(
    'all',
  );

  // Placeholder images - would be replaced with actual API calls
  const placeholderImages: StockImage[] = [
    {
      id: '1',
      url: '/placeholder-1.jpg',
      thumbnailUrl: '/placeholder-1.jpg',
      alt: 'Professional workspace',
      width: 1920,
      height: 1080,
      photographer: 'John Doe',
      source: 'unsplash',
      license: 'Unsplash License',
    },
    {
      id: '2',
      url: '/placeholder-2.jpg',
      thumbnailUrl: '/placeholder-2.jpg',
      alt: 'Learning environment',
      width: 1920,
      height: 1280,
      photographer: 'Jane Smith',
      source: 'pexels',
      license: 'Pexels License',
    },
    {
      id: '3',
      url: '/placeholder-3.jpg',
      thumbnailUrl: '/placeholder-3.jpg',
      alt: 'Technology concept',
      width: 1600,
      height: 900,
      source: 'pixabay',
      license: 'Pixabay License',
    },
    {
      id: '4',
      url: '/placeholder-4.jpg',
      thumbnailUrl: '/placeholder-4.jpg',
      alt: 'Abstract background',
      width: 1920,
      height: 1080,
      photographer: 'Alex Johnson',
      source: 'unsplash',
      license: 'Unsplash License',
    },
    {
      id: '5',
      url: '/placeholder-5.jpg',
      thumbnailUrl: '/placeholder-5.jpg',
      alt: 'Team collaboration',
      width: 1920,
      height: 1280,
      photographer: 'Sarah Wilson',
      source: 'pexels',
      license: 'Pexels License',
    },
    {
      id: '6',
      url: '/placeholder-6.jpg',
      thumbnailUrl: '/placeholder-6.jpg',
      alt: 'Education concept',
      width: 1600,
      height: 1067,
      source: 'pixabay',
      license: 'Pixabay License',
    },
  ];

  const handleSearch = async () => {
    setIsSearching(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Filter placeholder data based on search and source
    let filtered = placeholderImages;

    if (searchQuery) {
      filtered = filtered.filter(
        (img) =>
          img.alt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          img.photographer?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (activeSource !== 'all') {
      filtered = filtered.filter((img) => img.source === activeSource);
    }

    setResults(filtered);
    setIsSearching(false);
  };

  const getSourceLabel = (source: StockImage['source']) => {
    switch (source) {
      case 'unsplash':
        return 'Unsplash';
      case 'pexels':
        return 'Pexels';
      case 'pixabay':
        return 'Pixabay';
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
              placeholder="Search images..."
              className="pl-9 bg-(--studio-bg) border-white/10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        {/* Source Filters */}
        <div className="flex gap-2">
          {(['all', 'unsplash', 'pexels', 'pixabay'] as const).map((source) => (
            <Button
              key={source}
              variant={activeSource === source ? 'default' : 'outline'}
              size="sm"
              className={activeSource !== source ? 'border-white/10' : ''}
              onClick={() => setActiveSource(source)}
            >
              {source === 'all' ? 'All' : getSourceLabel(source)}
            </Button>
          ))}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {results.length === 0 && !isSearching && (
            <div className="col-span-3 text-center py-8 text-zinc-500">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Search for images</p>
              <p className="text-xs mt-1">Free stock photos from Unsplash, Pexels & Pixabay</p>
            </div>
          )}

          {results.map((image) => (
            <button
              type="button"
              key={image.id}
              className="relative aspect-video bg-zinc-800 rounded-xs overflow-hidden group cursor-pointer text-left"
              onClick={() => onSelectImage(image)}
              aria-label={`Select image: ${image.alt}. ${image.width}×${image.height} from ${getSourceLabel(image.source)}`}
            >
              {/* Placeholder gradient since we don't have real images */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-purple-500/30" />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground h-8 px-3">
                  <Plus className="h-4 w-4 mr-1" />
                  Select
                </span>
              </div>

              {/* Source badge */}
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 px-1 rounded-xs">
                {getSourceLabel(image.source)}
              </span>

              {/* Dimensions */}
              <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 px-1 rounded-xs">
                {image.width}×{image.height}
              </span>
            </button>
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
                  onClick={() => window.open('https://unsplash.com', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Unsplash
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Unsplash</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-zinc-500 h-7"
                  onClick={() => window.open('https://pexels.com', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Pexels
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Pexels</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-zinc-500 h-7"
                  onClick={() => window.open('https://pixabay.com', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Pixabay
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Pixabay</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * Image upload component
 */
export function ImageUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
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
      <Upload className="h-8 w-8 mx-auto mb-2 text-zinc-500" />
      <p className="text-sm text-zinc-400 mb-2">Drag and drop an image or</p>
      <label>
        <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        <Button variant="outline" size="sm" className="border-white/10" asChild>
          <span className="cursor-pointer">Browse Files</span>
        </Button>
      </label>
      <p className="text-xs text-zinc-600 mt-2">Supports JPG, PNG, GIF, WebP, SVG</p>
    </div>
  );
}
