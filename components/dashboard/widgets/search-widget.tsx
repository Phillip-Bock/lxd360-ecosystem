'use client';

import { Folder, Globe, Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import WidgetWrapper from './widget-wrapper';

type SearchMode = 'library' | 'web';

export default function SearchWidget() {
  const [mode, setMode] = useState<SearchMode>('library');
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (mode === 'web') {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    } else {
      // TODO(LXD-311): Implement library search
      void query;
    }
  };

  return (
    <WidgetWrapper title="Quick Search" size={2}>
      <div className="space-y-3">
        {/* Mode Toggle */}
        <div className="flex bg-white/10 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMode('library')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium transition-colors',
              mode === 'library'
                ? 'bg-white/20 text-white shadow-xs'
                : 'text-white/70 hover:text-white',
            )}
          >
            <Folder className="w-4 h-4" />
            My Library
          </button>
          <button
            type="button"
            onClick={() => setMode('web')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium transition-colors',
              mode === 'web'
                ? 'bg-white/20 text-white shadow-xs'
                : 'text-white/70 hover:text-white',
            )}
          >
            <Globe className="w-4 h-4" />
            Web
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === 'library' ? 'Search your content...' : 'Search the web...'}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-white/30 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </form>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-white/70">Quick:</span>
          {mode === 'library' ? (
            <>
              <button type="button" className="text-xs text-white hover:underline">
                Videos
              </button>
              <button type="button" className="text-xs text-white hover:underline">
                Images
              </button>
              <button type="button" className="text-xs text-white hover:underline">
                Recent
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setQuery('instructional design best practices')}
                className="text-xs text-white hover:underline"
              >
                ID best practices
              </button>
              <button
                type="button"
                onClick={() => setQuery('free stock images')}
                className="text-xs text-white hover:underline"
              >
                Stock images
              </button>
            </>
          )}
        </div>
      </div>
    </WidgetWrapper>
  );
}
