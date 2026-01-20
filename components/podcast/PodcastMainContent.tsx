'use client';

import {
  ChevronRight,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Play,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const episodes = [
  {
    title: 'The Future of AI in Learning Design',
    host: 'Dr. Sarah Chen',
    series: 'EdTech Innovators',
    duration: '45:32',
    topics: ['AI', 'L&D', 'Innovation'],
    hasTranscript: true,
    aiSummary: 'Exploring how artificial intelligence is revolutionizing personalized learning...',
  },
  {
    title: 'Building Scalable Learning Platforms',
    host: 'Mike Johnson',
    series: 'Tech Architecture',
    duration: '52:15',
    topics: ['Cloud', 'Architecture', 'EdTech'],
    hasTranscript: true,
    aiSummary: 'Deep dive into microservices and cloud infrastructure for education systems...',
  },
  {
    title: 'Gamification in Corporate Training',
    host: 'Emily Rodriguez',
    series: 'Learning Design',
    duration: '38:47',
    topics: ['UX', 'Gamification', 'Engagement'],
    hasTranscript: true,
    aiSummary: 'How game mechanics increase learner engagement and knowledge retention...',
  },
  {
    title: 'Digital Credentials & Badging',
    host: 'Alex Kumar',
    series: 'Emerging Tech',
    duration: '41:20',
    topics: ['Credentials', 'Badges', 'Security'],
    hasTranscript: true,
    aiSummary: 'Digital credential verification and portable learning records...',
  },
  {
    title: 'The VR Training Revolution',
    host: 'Jordan Lee',
    series: 'Future Visions',
    duration: '49:05',
    topics: ['VR', 'Simulation', 'Immersive'],
    hasTranscript: true,
    aiSummary: 'Virtual reality and immersive learning transform skill development...',
  },
];

export function PodcastMainContent() {
  return (
    <div className="flex-1 bg-linear-to-b from-[var(--brand-primary)]/20 to-[var(--brand-background)] text-[var(--brand-text-primary)] p-8 overflow-y-auto">
      {/* Series Header */}
      <div className="flex items-center space-x-6 mb-8 bg-[var(--brand-surface)]/50 backdrop-blur-xs p-6 rounded-xl border border-[var(--brand-border)]">
        <Image
          src="/images/podcast/podcast-cover.png"
          width={200}
          height={200}
          alt="INSPIRE 4 Ever Podcast cover"
          className="w-44 h-44 shadow-2xl rounded-lg"
          priority
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
            PODCAST SERIES
          </p>
          <h1 className="text-5xl font-bold mt-2 mb-4">INSPIRE 4 Ever</h1>
          <p className="text-sm text-[var(--brand-text-secondary)]">
            Curated by LXD360 • 25 episodes, 18 hr 30 min
          </p>
          <div className="flex gap-2 mt-3">
            <Badge
              variant="secondary"
              className="bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] border-[var(--brand-primary)]/30"
            >
              <Sparkles size={12} className="mr-1" />
              AI-Enhanced
            </Badge>
            <Badge
              variant="secondary"
              className="bg-[var(--brand-accent)]/20 text-[var(--brand-accent)]"
            >
              <FileText size={12} className="mr-1" />
              Full Transcripts
            </Badge>
          </div>
        </div>
      </div>

      {/* Play Controls */}
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          className="bg-[var(--brand-primary)] text-brand-primary font-semibold py-3 px-8 rounded-lg hover:bg-[var(--brand-primary)]/90 transition-all flex items-center gap-2"
        >
          <Play fill="currentColor" size={20} />
          Play Series
        </button>
        <button
          type="button"
          className="bg-[var(--brand-surface)] border border-[var(--brand-border)] text-[var(--brand-text-primary)] font-semibold py-3 px-6 rounded-lg hover:bg-[var(--brand-accent)]/20 transition-all"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Episodes Table */}
      <div className="bg-[var(--brand-surface)]/30 backdrop-blur-xs rounded-xl border border-[var(--brand-border)] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--brand-border)] bg-[var(--brand-accent)]/10">
              <th className="py-4 px-4 font-semibold text-[var(--brand-text-muted)]">#</th>
              <th className="py-4 px-4 font-semibold text-[var(--brand-text-muted)]">EPISODE</th>
              <th className="py-4 px-4 font-semibold text-[var(--brand-text-muted)]">TOPICS</th>
              <th className="py-4 px-4 font-semibold text-[var(--brand-text-muted)]">FEATURES</th>
              <th className="py-4 px-4 font-semibold text-[var(--brand-text-muted)]">DURATION</th>
            </tr>
          </thead>
          <tbody>
            {episodes.map((episode, index) => (
              <tr
                key={index}
                className="hover:bg-[var(--brand-accent)]/10 transition-colors border-b border-[var(--brand-border)]/50 last:border-0 group cursor-pointer"
              >
                <td className="py-3 px-4 text-[var(--brand-text-muted)]">{index + 1}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/images/podcast/episode-thumb.png"
                      width={40}
                      height={40}
                      alt={`${episode.title} cover`}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium text-[var(--brand-text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                        {episode.title}
                      </p>
                      <p className="text-sm text-[var(--brand-text-muted)]">
                        {episode.host} • {episode.series}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {episode.topics.map((topic, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs border-[var(--brand-border)]"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {episode.hasTranscript && (
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-[var(--brand-accent)]/20 transition-colors"
                        title="View Transcript"
                      >
                        <FileText size={16} className="text-[var(--brand-primary)]" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-[var(--brand-accent)]/20 transition-colors"
                      title="AI Summary"
                    >
                      <Sparkles size={16} className="text-[var(--brand-primary)]" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-[var(--brand-accent)]/20 transition-colors"
                      title="Discussion"
                    >
                      <MessageSquare size={16} className="text-[var(--brand-text-muted)]" />
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 text-[var(--brand-text-muted)]">{episode.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Features Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--brand-surface)]/50 backdrop-blur-xs p-6 rounded-xl border border-[var(--brand-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--brand-primary)]" />
              AI Learning Insights
            </h3>
            <ChevronRight size={18} className="text-[var(--brand-text-muted)]" />
          </div>
          <p className="text-sm text-[var(--brand-text-secondary)] mb-3">
            Based on your listening patterns, we recommend focusing on AI integration and immersive
            learning topics.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--brand-text-muted)]">Learning Progress</span>
              <span className="text-[var(--brand-text-primary)] font-medium">67%</span>
            </div>
            <div className="w-full bg-[var(--brand-border)] rounded-full h-2">
              <div className="bg-[var(--brand-primary)] rounded-full h-2 w-2/3"></div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--brand-surface)]/50 backdrop-blur-xs p-6 rounded-xl border border-[var(--brand-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText size={18} className="text-[var(--brand-primary)]" />
              Smart Transcript Search
            </h3>
            <ChevronRight size={18} className="text-[var(--brand-text-muted)]" />
          </div>
          <p className="text-sm text-[var(--brand-text-secondary)] mb-3">
            Search across all episode transcripts to find specific topics, quotes, or concepts
            instantly.
          </p>
          <input
            type="text"
            placeholder="Search transcripts..."
            className="w-full bg-[var(--brand-background)] border border-[var(--brand-border)] rounded-lg px-3 py-2 text-sm placeholder:text-[var(--brand-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-primary)]"
          />
        </div>
      </div>
    </div>
  );
}
