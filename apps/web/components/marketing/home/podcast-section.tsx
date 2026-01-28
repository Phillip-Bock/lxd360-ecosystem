'use client';

import { ArrowRight, Clock, Headphones, Mic, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SectionBadge } from '@/components/marketing/shared/section-badge';
import { Button } from '@/components/ui/button';

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  guest: string;
  guestTitle: string;
}

const FEATURED_EPISODES: Episode[] = [
  {
    id: '1',
    title: 'The Future of Adaptive Learning',
    description:
      'Exploring how AI is transforming personalized learning experiences in corporate training.',
    duration: '42:15',
    date: 'Dec 10, 2025',
    guest: 'Dr. Sarah Chen',
    guestTitle: 'Chief Learning Officer, TechCorp',
  },
  {
    id: '2',
    title: 'Neurodiversity in Instructional Design',
    description: 'Designing inclusive learning experiences for all cognitive styles and abilities.',
    duration: '38:45',
    date: 'Dec 3, 2025',
    guest: 'Marcus Williams',
    guestTitle: 'Accessibility Specialist',
  },
  {
    id: '3',
    title: 'From SME to Learning Designer',
    description: 'Career transitions and building your L&D skillset in the modern workplace.',
    duration: '45:30',
    date: 'Nov 26, 2025',
    guest: 'Emily Rodriguez',
    guestTitle: 'Senior ID, Fortune 500',
  },
];

interface PodcastSectionProps {
  badge?: string;
  heading?: string;
  subheading?: string;
}

export function PodcastSection({
  badge = 'Podcast',
  heading = 'INSPIRE 4 Ever',
  subheading = 'Conversations about learning experience design, instructional technology, and the future of L&D with industry leaders and innovators.',
}: PodcastSectionProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate playback
  useEffect(() => {
    if (playingId) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCurrentTime(0);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playingId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-24 bg-lxd-light-surface dark:bg-lxd-dark-surface">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <SectionBadge>{badge}</SectionBadge>
          <h2 className="text-4xl md:text-5xl font-bold text-lxd-light-text-primary dark:text-lxd-dark-text-primary mb-4">
            {heading}
          </h2>
          <p className="text-xl text-lxd-light-text-secondary dark:text-lxd-dark-text-secondary max-w-2xl mx-auto">
            {subheading}
          </p>
        </div>

        {/* Podcast Cover + Featured Episode */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left - Podcast Cover & Now Playing */}
          <div className="lg:col-span-1">
            <div className="bg-lxd-light-page dark:bg-lxd-dark-page rounded-2xl p-6 border border-lxd-light-border dark:border-lxd-dark-border">
              <div className="relative aspect-square mb-4 rounded-xl overflow-hidden">
                <Image
                  src="/images/podcast/podcast-cover.png"
                  alt="INSPIRE 4 Ever Podcast"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <Mic className="h-5 w-5" />
                    <span className="text-sm font-medium">25 Episodes</span>
                  </div>
                </div>
              </div>

              {/* Mini Player */}
              {playingId && (
                <div className="bg-lxd-light-accent/10 dark:bg-lxd-dark-accent/10 rounded-lg p-4">
                  <p className="text-xs text-lxd-light-text-muted dark:text-lxd-dark-text-muted mb-1">
                    Now Playing
                  </p>
                  <p className="text-sm font-medium text-lxd-light-text-primary dark:text-lxd-dark-text-primary mb-2 line-clamp-1">
                    {FEATURED_EPISODES.find((e) => e.id === playingId)?.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-lxd-light-text-muted dark:text-lxd-dark-text-muted">
                      {formatTime(currentTime)}
                    </span>
                    <div className="flex-1 h-1 bg-lxd-light-border dark:bg-lxd-dark-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-lxd-light-accent dark:bg-lxd-dark-accent transition-all"
                        style={{ width: `${Math.min((currentTime / 2400) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Link href="/podcast" className="block mt-4">
                <Button className="w-full" size="lg">
                  <Headphones className="mr-2 h-4 w-4" />
                  Listen Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Right - Episode List */}
          <div className="lg:col-span-2 space-y-4">
            {FEATURED_EPISODES.map((episode) => (
              <div
                key={episode.id}
                className={`bg-lxd-light-page dark:bg-lxd-dark-page rounded-xl p-6 border transition-all ${
                  playingId === episode.id
                    ? 'border-lxd-light-accent dark:border-lxd-dark-accent ring-2 ring-lxd-light-accent/20 dark:ring-lxd-dark-accent/20'
                    : 'border-lxd-light-border dark:border-lxd-dark-border hover:border-lxd-light-accent/50 dark:hover:border-lxd-dark-accent/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Play Button */}
                  <button
                    type="button"
                    onClick={() => setPlayingId(playingId === episode.id ? null : episode.id)}
                    className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      playingId === episode.id
                        ? 'bg-lxd-light-accent dark:bg-lxd-dark-accent text-brand-primary'
                        : 'bg-lxd-light-accent/10 dark:bg-lxd-dark-accent/10 text-lxd-light-accent dark:text-lxd-dark-accent hover:bg-lxd-light-accent/20 dark:hover:bg-lxd-dark-accent/20'
                    }`}
                  >
                    {playingId === episode.id ? (
                      <Pause className="h-5 w-5" fill="currentColor" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                    )}
                  </button>

                  {/* Episode Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-lxd-light-text-muted dark:text-lxd-dark-text-muted mb-1">
                      <span>{episode.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {episode.duration}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-lxd-light-text-primary dark:text-lxd-dark-text-primary mb-1">
                      {episode.title}
                    </h3>
                    <p className="text-sm text-lxd-light-text-secondary dark:text-lxd-dark-text-secondary mb-2 line-clamp-2">
                      {episode.description}
                    </p>
                    <p className="text-sm">
                      <span className="text-lxd-light-text-muted dark:text-lxd-dark-text-muted">
                        with{' '}
                      </span>
                      <span className="font-medium text-lxd-light-text-primary dark:text-lxd-dark-text-primary">
                        {episode.guest}
                      </span>
                      <span className="text-lxd-light-text-muted dark:text-lxd-dark-text-muted">
                        , {episode.guestTitle}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/podcast">
            <Button variant="outline" size="lg">
              View All Episodes <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
