'use client';

import { Folder, Search } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import type { MediaItem, SourceTabProps } from '../types';

/** Mock library items for placeholder UI */
const MOCK_LIBRARY_ITEMS: MediaItem[] = [
  {
    id: 'lib-1',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200',
    name: 'Abstract Gradient Blue',
    type: 'image',
    width: 1920,
    height: 1080,
  },
  {
    id: 'lib-2',
    url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=200',
    name: 'Purple Mesh',
    type: 'image',
    width: 1920,
    height: 1080,
  },
  {
    id: 'lib-3',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200',
    name: 'Colorful Gradient',
    type: 'image',
    width: 1920,
    height: 1080,
  },
  {
    id: 'lib-4',
    url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200',
    name: 'Purple Blue Gradient',
    type: 'image',
    width: 1920,
    height: 1080,
  },
  {
    id: 'lib-5',
    url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=200',
    name: 'Teal Gradient',
    type: 'image',
    width: 1920,
    height: 1080,
  },
  {
    id: 'lib-6',
    url: 'https://images.unsplash.com/photo-1557682260-96773eb01377?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682260-96773eb01377?w=200',
    name: 'Pink Orange Gradient',
    type: 'image',
    width: 1920,
    height: 1080,
  },
];

export function LibraryTab({ onSelect }: SourceTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredItems = MOCK_LIBRARY_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (item: MediaItem) => {
    setSelectedId(item.id);
    onSelect(item.url, {
      sourceType: 'library',
      fileName: item.name,
      type: item.type,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search your library..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
          {filteredItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`
                relative aspect-video rounded-md overflow-hidden
                ring-2 transition-all duration-150
                ${
                  selectedId === item.id ? 'ring-primary' : 'ring-transparent hover:ring-primary/50'
                }
              `}
            >
              <Image
                src={item.thumbnailUrl}
                alt={item.name}
                fill
                sizes="150px"
                className="object-cover"
              />
              {selectedId === item.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                    Selected
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Folder className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-sm font-medium">No media found</p>
          <p className="text-xs">
            {searchQuery ? 'Try a different search term' : 'Upload some media to get started'}
          </p>
        </div>
      )}

      {/* Placeholder notice */}
      <p className="text-xs text-muted-foreground text-center">
        This is placeholder data. Library integration coming soon.
      </p>
    </div>
  );
}
