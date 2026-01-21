'use client';

/**
 * FeedContent Component
 * =====================
 * Main community feed with posts, sidebar widgets, and filtering.
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ActiveMentors } from '../widgets/active-mentors';
import { TrendingTopics } from '../widgets/trending-topics';
import { UpcomingEvents } from '../widgets/upcoming-events';
import { PostCard, type PostData } from './post-card';
import { PostComposer } from './post-composer';

// Mock posts data
const MOCK_POSTS: PostData[] = [
  {
    id: '1',
    author: {
      id: 'emily',
      name: 'Dr. Emily Rodriguez',
      title: 'Chief Learning Officer at Deloitte',
      isVerified: true,
      isMentor: true,
      username: 'emily-rodriguez',
    },
    timestamp: '2h ago',
    content: `Just published my thoughts on why cognitive load theory should be at the center of every learning experience design project.

The key insight? It's not about dumbing down content—it's about smart scaffolding that respects how our brains actually work.

What strategies do you use to manage cognitive load in your designs?`,
    tags: ['LearningDesign', 'CognitiveLoad', 'InstructionalDesign'],
    likes: 47,
    comments: 12,
    shares: 8,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '2',
    author: {
      id: 'sarah',
      name: 'Sarah Chen',
      title: 'Senior Learning Designer at Microsoft',
      isVerified: true,
      username: 'sarah-chen',
    },
    timestamp: '4h ago',
    content: `Excited to share my latest portfolio piece!

I designed an interactive compliance training module using scenario-based learning. Instead of clicking through slides, learners navigate real workplace situations and see consequences of their choices.

Results:
- 40% faster completion time
- 92% learner satisfaction
- 35% better knowledge retention

Check out the full case study on my profile. Would love your feedback!`,
    isPortfolio: true,
    portfolioTitle: 'Interactive Compliance Training',
    image: '/images/portfolio-preview.jpg',
    likes: 89,
    comments: 24,
    shares: 15,
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: '3',
    author: {
      id: 'james',
      name: 'James Park',
      title: 'Instructional Designer',
      username: 'james-park',
    },
    timestamp: '6h ago',
    content: `Question for the community:

I'm building a technical training course for software developers and struggling with how much hands-on practice to include vs. conceptual explanation.

The content is complex (API integration patterns) and learners have varying experience levels.

How do you balance theory and practice in technical training? Any frameworks or heuristics you use?`,
    isQuestion: true,
    tags: ['TechnicalTraining', 'APIDesign', 'Question'],
    likes: 23,
    comments: 31,
    shares: 5,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '4',
    author: {
      id: 'marcus',
      name: 'Marcus Johnson',
      title: 'L&D Manager at Salesforce',
      isVerified: true,
      isMentor: true,
      username: 'marcus-johnson',
    },
    timestamp: '8h ago',
    content: `Hot take: Most e-learning fails not because of bad instructional design, but because of bad project management.

We spend so much time perfecting the learning experience, but rush stakeholder alignment, skip proper needs analysis, and underestimate development time.

The best ID skills won't save a project with unrealistic timelines and unclear objectives.

Agree or disagree?`,
    tags: ['ProjectManagement', 'eLearning', 'HotTake'],
    likes: 156,
    comments: 67,
    shares: 34,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '5',
    author: {
      id: 'lisa',
      name: 'Lisa Wang',
      title: 'Learning Experience Designer at Apple',
      isVerified: true,
      username: 'lisa-wang',
    },
    timestamp: '12h ago',
    content: `Just wrapped up a fascinating research project on accessibility in interactive learning experiences.

Key finding: When we design for accessibility first, EVERYONE benefits. Not just learners with disabilities.

Some quick wins:
- Proper color contrast improves readability for all
- Keyboard navigation helps power users too
- Captions benefit non-native speakers

Will be presenting full findings at the L&D Summit next month!`,
    tags: ['Accessibility', 'InclusiveDesign', 'Research'],
    likes: 203,
    comments: 45,
    shares: 78,
    isLiked: true,
    isBookmarked: false,
  },
];

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'following', label: 'Following' },
  { id: 'questions', label: 'Questions' },
  { id: 'portfolios', label: 'Portfolios' },
  { id: 'resources', label: 'Resources' },
];

interface FeedContentProps {
  userId: string;
  userName?: string;
  userAvatar?: string;
}

export function FeedContent({ userId, userName, userAvatar }: FeedContentProps): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState('all');
  const [posts, setPosts] = useState(MOCK_POSTS);

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'questions') return post.isQuestion;
    if (activeFilter === 'portfolios') return post.isPortfolio;
    return true;
  });

  const handleNewPost = (newPost: {
    content: string;
    images?: File[];
    tags?: string[];
    type?: 'post' | 'question' | 'portfolio';
  }): void => {
    const post: PostData = {
      id: Date.now().toString(),
      author: {
        id: userId,
        name: userName || 'You',
        username: userId,
      },
      timestamp: 'Just now',
      content: newPost.content,
      tags: newPost.tags,
      likes: 0,
      comments: 0,
      shares: 0,
      isQuestion: newPost.type === 'question',
      isPortfolio: newPost.type === 'portfolio',
    };
    setPosts([post, ...posts]);
  };

  return (
    <div className="min-h-screen bg-studio-bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Feed - 8 columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Post Composer */}
            <PostComposer userName={userName} userAvatar={userAvatar} onSubmit={handleNewPost} />

            {/* Feed Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {filterOptions.map((filter) => (
                <button
                  type="button"
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    activeFilter === filter.id
                      ? 'bg-lxd-purple-light text-brand-primary'
                      : 'bg-lxd-dark-surface-alt/30 text-studio-text hover:bg-lxd-dark-surface-alt/50',
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard
                    post={post}
                    onLike={() => {}}
                    onComment={() => {}}
                    onShare={() => {}}
                    onBookmark={() => {}}
                  />
                </motion.div>
              ))}

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No posts found for this filter.</p>
                </div>
              )}
            </div>

            {/* Load More */}
            {filteredPosts.length > 0 && (
              <div className="text-center">
                <button
                  type="button"
                  className="px-6 py-2 bg-lxd-dark-surface-alt/30 hover:bg-lxd-dark-surface-alt/50 text-studio-text rounded-lg transition-colors"
                >
                  Load more posts
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            <TrendingTopics />
            <ActiveMentors />
            <UpcomingEvents />

            {/* Community Stats */}
            <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-4">
              <h3 className="font-semibold text-brand-primary mb-4">Community Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-lxd-purple-light">5,234</p>
                  <p className="text-xs text-gray-500">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-studio-accent">523</p>
                  <p className="text-xs text-gray-500">Mentors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-success">1,234</p>
                  <p className="text-xs text-gray-500">Posts Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-warning">89</p>
                  <p className="text-xs text-gray-500">Online Now</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-4">
              <h3 className="font-semibold text-brand-primary mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href="/nexus/resources"
                  className="block text-sm text-studio-text hover:text-lxd-purple-light transition-colors"
                >
                  Resource Library
                </Link>
                <Link
                  href="/nexus/portfolio"
                  className="block text-sm text-studio-text hover:text-lxd-purple-light transition-colors"
                >
                  My Portfolio
                </Link>
                <Link
                  href="/nexus/achievements"
                  className="block text-sm text-studio-text hover:text-lxd-purple-light transition-colors"
                >
                  Achievements & Badges
                </Link>
                <Link
                  href="/nexus/settings"
                  className="block text-sm text-studio-text hover:text-lxd-purple-light transition-colors"
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
