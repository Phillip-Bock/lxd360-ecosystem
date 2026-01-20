'use client';

import { Bookmark, Brain, Home, Library, Mic, PlusSquare, Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PodcastSwitcher } from './PodcastSwitcher';

const playlists = [
  'AI & Machine Learning',
  'Instructional Design',
  'Future of Learning',
  'Leadership in L&D',
  'eLearning Tools',
  'Learning Science',
  'Corporate Training',
  'EdTech Innovation',
  'Accessibility in Learning',
  'Performance Support',
];

interface PodcastSidebarProps {
  className?: string;
}

export function PodcastSidebar({ className }: PodcastSidebarProps) {
  return (
    <div
      className={`w-60 bg-[var(--brand-surface)] text-[var(--brand-text-primary)] flex flex-col h-screen border-r border-[var(--brand-border)] ${className}`}
    >
      {/* Header */}
      <div className="p-6">
        <Link href="/podcast" className="flex items-center gap-2 mb-4">
          <Mic className="h-6 w-6 text-[var(--brand-primary)]" />
          <h1 className="text-xl font-bold text-[var(--brand-primary)]">INSPIRE 4 Ever</h1>
        </Link>

        <div className="mb-6">
          <PodcastSwitcher />
        </div>

        {/* Main Navigation */}
        <nav>
          <ul className="space-y-1">
            <li>
              <Link
                href="/podcast"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[var(--brand-accent)]/20 transition-colors"
              >
                <Home size={20} />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[var(--brand-accent)]/20 transition-colors w-full text-left"
              >
                <Search size={20} />
                <span>Search</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[var(--brand-accent)]/20 transition-colors w-full text-left"
              >
                <Library size={20} />
                <span>Your Library</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[var(--brand-accent)]/20 transition-colors w-full text-left"
              >
                <Brain size={20} />
                <span>AI Insights</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[var(--brand-accent)]/20 transition-colors w-full text-left"
              >
                <TrendingUp size={20} />
                <span>Progress</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Quick Actions */}
        <div className="mt-6 space-y-1">
          <button
            type="button"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[var(--brand-accent)]/20 transition-colors w-full text-left"
          >
            <PlusSquare size={20} />
            <span>Create Playlist</span>
          </button>
          <button
            type="button"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[var(--brand-accent)]/20 transition-colors w-full text-left"
          >
            <Bookmark size={20} />
            <span>Bookmarks</span>
          </button>
        </div>
      </div>

      {/* Playlists Section */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-6 pb-6">
            <h2 className="text-xs uppercase font-semibold mb-3 text-[var(--brand-text-muted)]">
              Topic Playlists
            </h2>
            <ul className="space-y-1">
              {playlists.map((playlist, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="block px-3 py-2 rounded-lg hover:bg-[var(--brand-accent)]/20 transition-colors w-full text-left text-sm"
                  >
                    {playlist}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-[var(--brand-border)]">
        <p className="text-xs text-[var(--brand-text-muted)] text-center">A podcast by LXD360</p>
      </div>
    </div>
  );
}
