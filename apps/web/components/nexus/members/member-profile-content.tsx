'use client';

/**
 * MemberProfileContent Component
 * ==============================
 * Displays a member's full profile with tabs for posts, portfolio, and reviews.
 */

import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Edit,
  FileText,
  Link2,
  Linkedin,
  MapPin,
  MessageCircle,
  Star,
  Twitter,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PostCard, type PostData } from '../feed/post-card';

interface MemberProfile {
  id: string;
  username: string;
  name: string;
  title: string;
  company?: string;
  location?: string;
  avatar?: string;
  coverImage?: string;
  bio: string;
  isVerified: boolean;
  isMentor: boolean;
  skills: string[];
  links: {
    website?: string;
    linkedin?: string;
    twitter?: string;
  };
  stats: {
    followers: number;
    following: number;
    posts: number;
    karma: number;
  };
  rating?: number;
  reviewCount?: number;
  joinedDate: string;
  badges: { id: string; name: string; icon: string }[];
}

// Mock profile data
const getMemberProfile = (username: string): MemberProfile => ({
  id: username,
  username,
  name: 'Dr. Emily Rodriguez',
  title: 'Chief Learning Officer',
  company: 'Deloitte',
  location: 'New York, NY',
  bio: '20+ years in L&D, passionate about helping organizations build learning cultures that drive real business results. Former educator turned corporate learning strategist. I believe in the power of well-designed learning experiences to transform careers and organizations.',
  isVerified: true,
  isMentor: true,
  skills: [
    'Learning Strategy',
    'Leadership Development',
    'Change Management',
    'Instructional Design',
    'Performance Consulting',
    'L&D Analytics',
  ],
  links: {
    website: 'https://emilyrodriguez.com',
    linkedin: 'https://linkedin.com/in/emilyrodriguez',
    twitter: '@emilyrodriguez',
  },
  stats: {
    followers: 2345,
    following: 156,
    posts: 234,
    karma: 8750,
  },
  rating: 4.9,
  reviewCount: 142,
  joinedDate: 'January 2023',
  badges: [
    { id: '1', name: 'Top Mentor', icon: '🏆' },
    { id: '2', name: 'Community Leader', icon: '⭐' },
    { id: '3', name: 'Knowledge Sharer', icon: '📚' },
  ],
});

// Mock posts
const getMemberPosts = (): PostData[] => [
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
    tags: ['LearningDesign', 'CognitiveLoad'],
    likes: 47,
    comments: 12,
    shares: 8,
  },
  {
    id: '2',
    author: {
      id: 'emily',
      name: 'Dr. Emily Rodriguez',
      title: 'Chief Learning Officer at Deloitte',
      isVerified: true,
      isMentor: true,
      username: 'emily-rodriguez',
    },
    timestamp: '1d ago',
    content: `Excited to announce I'll be keynoting at the L&D Summit next month!

Topic: "Building Learning Cultures That Scale"

Will be sharing insights from 20+ years of helping organizations transform their approach to learning. Hope to see some of you there!`,
    likes: 156,
    comments: 34,
    shares: 45,
  },
];

const tabs = [
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'portfolio', label: 'Portfolio', icon: BookOpen },
  { id: 'reviews', label: 'Reviews', icon: Star },
];

interface MemberProfileContentProps {
  username: string;
  currentUserId: string;
  isOwnProfile?: boolean;
}

export function MemberProfileContent({ username, isOwnProfile }: MemberProfileContentProps) {
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  const profile = getMemberProfile(username);
  const posts = getMemberPosts();

  return (
    <div className="space-y-6">
      {/* Cover & Profile Header */}
      <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 sm:h-48 bg-linear-to-r from-lxd-purple-light/30 via-studio-accent/30 to-lxd-purple-light/30" />

        {/* Profile Info */}
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-linear-to-br from-lxd-purple-light to-studio-accent flex items-center justify-center border-4 border-studio-bg overflow-hidden">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-brand-primary font-bold text-4xl">
                    {profile.name.charAt(0)}
                  </span>
                )}
              </div>
              {profile.isMentor && (
                <span className="absolute bottom-1 right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center border-3 border-studio-bg">
                  <Star className="w-5 h-5 text-brand-primary fill-white" />
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
                  {profile.name}
                  {profile.isVerified && <CheckCircle className="w-5 h-5 text-studio-accent" />}
                </h1>
                <p className="text-gray-500">
                  {profile.title}
                  {profile.company && ` at ${profile.company}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <Link
                    href="/nexus/settings/profile"
                    className="flex items-center gap-2 px-4 py-2 bg-lxd-dark-surface-alt/30 hover:bg-lxd-dark-surface-alt/50 text-brand-primary rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                        isFollowing
                          ? 'bg-lxd-dark-surface-alt/30 text-brand-primary hover:bg-brand-error/20 hover:text-brand-error'
                          : 'bg-lxd-purple-light hover:bg-lxd-purple-light text-brand-primary',
                      )}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </button>
                    <Link
                      href={`/nexus/messages/new?to=${profile.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-lxd-dark-surface-alt/30 hover:bg-lxd-dark-surface-alt/50 text-brand-primary rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 text-studio-text max-w-3xl">{profile.bio}</p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {profile.joinedDate}
            </span>
            {profile.links.website && (
              <a
                href={profile.links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-studio-accent hover:underline"
              >
                <Link2 className="w-4 h-4" />
                Website
              </a>
            )}
            {profile.links.linkedin && (
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-studio-accent hover:underline"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            )}
            {profile.links.twitter && (
              <a
                href={`https://twitter.com/${profile.links.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-studio-accent hover:underline"
              >
                <Twitter className="w-4 h-4" />
                {profile.links.twitter}
              </a>
            )}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-lxd-purple-light/10 text-lxd-purple-light text-sm rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-lxd-dark-surface-alt/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-primary">
                {profile.stats.followers.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-primary">
                {profile.stats.following.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Following</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-primary">{profile.stats.posts}</p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-warning">
                {profile.stats.karma.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Karma</p>
            </div>
          </div>

          {/* Mentor Rating */}
          {profile.isMentor && profile.rating && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-lxd-dark-surface-alt/50">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-brand-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-5 h-5',
                        i < Math.floor(profile.rating ?? 0) && 'fill-amber-400',
                      )}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-brand-primary">{profile.rating}</span>
              </div>
              <span className="text-sm text-gray-500">{profile.reviewCount} mentor reviews</span>
              <Link
                href="/nexus/mentorship/sessions/schedule"
                className="ml-auto px-4 py-2 bg-brand-warning hover:bg-amber-600 text-brand-primary rounded-lg transition-colors"
              >
                Request Mentorship
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-4">
          <h3 className="font-semibold text-brand-primary mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-warning" />
            Achievements
          </h3>
          <div className="flex flex-wrap gap-3">
            {profile.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 px-3 py-2 bg-lxd-dark-surface-alt/30 rounded-lg"
              >
                <span className="text-xl">{badge.icon}</span>
                <span className="text-sm text-brand-primary">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl">
        <div className="flex border-b border-lxd-dark-surface-alt/50">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-lxd-purple-light border-b-2 border-lxd-purple-light'
                  : 'text-gray-500 hover:text-brand-primary',
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-500">Portfolio projects coming soon...</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-500">Mentor reviews coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
