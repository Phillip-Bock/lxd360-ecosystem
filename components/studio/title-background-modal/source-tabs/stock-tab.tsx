'use client';

import { Search } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import type { MediaItem, SourceTabProps, StockTabProvider } from '../types';

/** Mock stock media for placeholder UI */
const MOCK_STOCK_ITEMS: Record<StockTabProvider, MediaItem[]> = {
  unsplash: [
    {
      id: 'unsplash-1',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
      name: 'Mountain Sunrise',
      type: 'image',
      attribution: 'Photo by Samuel Ferrara on Unsplash',
      provider: 'unsplash',
    },
    {
      id: 'unsplash-2',
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200',
      name: 'Foggy Forest',
      type: 'image',
      attribution: 'Photo by v2osk on Unsplash',
      provider: 'unsplash',
    },
    {
      id: 'unsplash-3',
      url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=200',
      name: 'Ocean Waves',
      type: 'image',
      attribution: 'Photo by Google DeepMind on Unsplash',
      provider: 'unsplash',
    },
    {
      id: 'unsplash-4',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200',
      name: 'Earth from Space',
      type: 'image',
      attribution: 'Photo by NASA on Unsplash',
      provider: 'unsplash',
    },
  ],
  pexels: [
    {
      id: 'pexels-1',
      url: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?w=800',
      thumbnailUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?w=200',
      name: 'Abstract Light',
      type: 'image',
      attribution: 'Photo by Johannes Plenio on Pexels',
      provider: 'pexels',
    },
    {
      id: 'pexels-2',
      url: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?w=800',
      thumbnailUrl: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?w=200',
      name: 'Night Sky',
      type: 'image',
      attribution: 'Photo by Irina Iriser on Pexels',
      provider: 'pexels',
    },
    {
      id: 'pexels-3',
      url: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?w=800',
      thumbnailUrl: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?w=200',
      name: 'Geometric Pattern',
      type: 'image',
      attribution: 'Photo by Anni Roenkae on Pexels',
      provider: 'pexels',
    },
  ],
  pixabay: [
    {
      id: 'pixabay-1',
      url: 'https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg',
      thumbnailUrl: 'https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_640.jpg',
      name: 'Galaxy',
      type: 'image',
      attribution: 'Image by Free-Photos on Pixabay',
      provider: 'pixabay',
    },
    {
      id: 'pixabay-2',
      url: 'https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_1280.jpg',
      thumbnailUrl:
        'https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_640.jpg',
      name: 'Mountain Lake',
      type: 'image',
      attribution: 'Image by jplenio on Pixabay',
      provider: 'pixabay',
    },
    {
      id: 'pixabay-3',
      url: 'https://cdn.pixabay.com/photo/2018/08/14/13/23/ocean-3605547_1280.jpg',
      thumbnailUrl: 'https://cdn.pixabay.com/photo/2018/08/14/13/23/ocean-3605547_640.jpg',
      name: 'Ocean Sunset',
      type: 'image',
      attribution: 'Image by 8385 on Pixabay',
      provider: 'pixabay',
    },
  ],
};

const PROVIDER_LABELS: Record<StockTabProvider, string> = {
  unsplash: 'Unsplash',
  pexels: 'Pexels',
  pixabay: 'Pixabay',
};

export function StockTab({ onSelect }: SourceTabProps) {
  const [provider, setProvider] = useState<StockTabProvider>('unsplash');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = MOCK_STOCK_ITEMS[provider];
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (item: MediaItem) => {
    setSelectedId(item.id);
    onSelect(item.url, {
      sourceType: 'stock',
      type: item.type,
      stockProvider: item.provider,
      stockAttribution: item.attribution,
      stockId: item.id,
    });
  };

  return (
    <div className="space-y-4">
      {/* Provider tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {(Object.keys(PROVIDER_LABELS) as StockTabProvider[]).map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => {
              setProvider(p);
              setSelectedId(null);
            }}
            className={`
              flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
              ${
                provider === p
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {PROVIDER_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={`Search ${PROVIDER_LABELS[provider]}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
        {filteredItems.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => handleSelect(item)}
            className={`
              relative aspect-video rounded-md overflow-hidden
              ring-2 transition-all duration-150
              ${selectedId === item.id ? 'ring-primary' : 'ring-transparent hover:ring-primary/50'}
            `}
          >
            <Image
              src={item.thumbnailUrl}
              alt={item.name}
              fill
              sizes="200px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-2">
              <p className="text-white text-xs truncate">{item.name}</p>
            </div>
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

      {/* Attribution notice */}
      {selectedId && (
        <p className="text-xs text-muted-foreground">
          {filteredItems.find((i) => i.id === selectedId)?.attribution}
        </p>
      )}

      {/* Placeholder notice */}
      <p className="text-xs text-muted-foreground text-center">
        This is placeholder data. Stock photo API integration coming soon.
      </p>
    </div>
  );
}
