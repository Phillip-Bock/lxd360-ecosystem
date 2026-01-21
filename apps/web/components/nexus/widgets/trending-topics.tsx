'use client';

/**
 * TrendingTopics Widget
 * =====================
 * Shows trending hashtags and topics in the community.
 */

import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Topic {
  tag: string;
  posts: number;
  trending?: boolean;
}

interface TrendingTopicsProps {
  topics?: Topic[];
}

const defaultTopics: Topic[] = [
  { tag: 'AIinLearning', posts: 127, trending: true },
  { tag: 'PortfolioFeedback', posts: 89, trending: true },
  { tag: 'CognitiveLoad', posts: 64 },
  { tag: 'xAPI', posts: 52 },
  { tag: 'MicroLearning', posts: 41 },
  { tag: 'ArticulateStoryline', posts: 38 },
  { tag: 'InstructionalDesign', posts: 156 },
];

export function TrendingTopics({ topics = defaultTopics }: TrendingTopicsProps): React.JSX.Element {
  return (
    <div className="bg-(--surface-card) border border-(--border-subtle) rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-(--brand-secondary)/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-(--brand-secondary)" />
        </div>
        <h3 className="font-semibold text-brand-primary">Trending Topics</h3>
      </div>
      <div className="space-y-2">
        {topics.slice(0, 7).map((topic, index) => (
          <Link
            key={topic.tag}
            href={`/nexus/feed?tag=${topic.tag}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-(--surface-card-hover) transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-(--text-tertiary) w-4">{index + 1}</span>
              <span className="text-(--brand-primary-hover) group-hover:text-(--brand-secondary) transition-colors">
                #{topic.tag}
              </span>
              {topic.trending && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </div>
            <span className="text-xs text-(--text-tertiary)">{topic.posts} posts</span>
          </Link>
        ))}
      </div>
      <Link
        href="/nexus/feed/trending"
        className="flex items-center justify-center gap-1 mt-4 text-sm text-(--brand-secondary) hover:underline"
      >
        View all trending
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
