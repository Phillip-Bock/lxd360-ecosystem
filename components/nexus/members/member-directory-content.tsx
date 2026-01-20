'use client';

/**
 * MemberDirectoryContent Component
 * ================================
 * Browse and search community members with filtering.
 */

import { motion } from 'framer-motion';
import {
  CheckCircle,
  ChevronDown,
  Filter,
  Grid,
  List,
  MapPin,
  MessageCircle,
  Search,
  Star,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  username: string;
  name: string;
  title: string;
  company?: string;
  location?: string;
  avatar?: string;
  isVerified: boolean;
  isMentor: boolean;
  skills: string[];
  followersCount: number;
  postsCount: number;
  rating?: number;
  bio?: string;
}

const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    username: 'emily-rodriguez',
    name: 'Dr. Emily Rodriguez',
    title: 'Chief Learning Officer',
    company: 'Deloitte',
    location: 'New York, NY',
    isVerified: true,
    isMentor: true,
    skills: ['Learning Strategy', 'Leadership Development', 'Change Management'],
    followersCount: 2345,
    postsCount: 156,
    rating: 4.9,
    bio: '20+ years in L&D, passionate about helping organizations build learning cultures.',
  },
  {
    id: '2',
    username: 'sarah-chen',
    name: 'Sarah Chen',
    title: 'Senior Learning Designer',
    company: 'Microsoft',
    location: 'Seattle, WA',
    isVerified: true,
    isMentor: false,
    skills: ['Instructional Design', 'Articulate Storyline', 'UX Research'],
    followersCount: 1567,
    postsCount: 89,
    bio: 'Creating engaging learning experiences that stick.',
  },
  {
    id: '3',
    username: 'marcus-johnson',
    name: 'Marcus Johnson',
    title: 'L&D Manager',
    company: 'Salesforce',
    location: 'San Francisco, CA',
    isVerified: true,
    isMentor: true,
    skills: ['Technical Training', 'Video Production', 'xAPI'],
    followersCount: 1890,
    postsCount: 234,
    rating: 4.8,
    bio: 'Building the future of corporate learning, one module at a time.',
  },
  {
    id: '4',
    username: 'lisa-wang',
    name: 'Lisa Wang',
    title: 'Learning Experience Designer',
    company: 'Apple',
    location: 'Cupertino, CA',
    isVerified: true,
    isMentor: true,
    skills: ['Visual Design', 'Accessibility', 'Figma'],
    followersCount: 3456,
    postsCount: 178,
    rating: 4.9,
    bio: 'Designing inclusive learning experiences for everyone.',
  },
  {
    id: '5',
    username: 'james-park',
    name: 'James Park',
    title: 'Instructional Designer',
    company: 'Google',
    location: 'Mountain View, CA',
    isVerified: false,
    isMentor: false,
    skills: ['eLearning Development', 'Camtasia', 'SCORM'],
    followersCount: 567,
    postsCount: 45,
    bio: 'Exploring the intersection of technology and learning.',
  },
  {
    id: '6',
    username: 'priya-sharma',
    name: 'Priya Sharma',
    title: 'Learning Consultant',
    company: 'Freelance',
    location: 'Austin, TX',
    isVerified: true,
    isMentor: true,
    skills: ['Needs Analysis', 'Performance Consulting', 'ROI Measurement'],
    followersCount: 890,
    postsCount: 67,
    rating: 4.7,
    bio: 'Helping organizations maximize their learning investments.',
  },
];

const filterOptions = {
  role: ['All', 'Mentors Only', 'Members Only'],
  skills: [
    'All Skills',
    'Instructional Design',
    'eLearning Development',
    'Learning Strategy',
    'Video Production',
    'Visual Design',
  ],
  location: ['All Locations', 'United States', 'Europe', 'Asia', 'Remote'],
};

interface MemberDirectoryContentProps {
  currentUserId: string;
}

export function MemberDirectoryContent(_props: MemberDirectoryContentProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [roleFilter, setRoleFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const [showFilters, setShowFilters] = useState(false);

  const filteredMembers = MOCK_MEMBERS.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      roleFilter === 'All' ||
      (roleFilter === 'Mentors Only' && member.isMentor) ||
      (roleFilter === 'Members Only' && !member.isMentor);

    const matchesSkill =
      skillFilter === 'All Skills' ||
      member.skills.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase()));

    return matchesSearch && matchesRole && matchesSkill;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Member Directory</h1>
          <p className="text-gray-500">{filteredMembers.length} members found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid'
                ? 'bg-lxd-purple-light text-brand-primary'
                : 'bg-lxd-dark-surface-alt/30 text-gray-500 hover:text-brand-primary',
            )}
          >
            <Grid className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list'
                ? 'bg-lxd-purple-light text-brand-primary'
                : 'bg-lxd-dark-surface-alt/30 text-gray-500 hover:text-brand-primary',
            )}
          >
            <List className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              aria-hidden="true"
            />
            <input
              type="text"
              id="member-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, title, or skill..."
              aria-label="Search members by name, title, or skill"
              className="w-full pl-10 pr-4 py-2.5 bg-studio-bg-dark border border-lxd-dark-surface-alt/50 rounded-lg text-brand-primary placeholder-gray-500 focus:border-lxd-purple-light outline-hidden"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors',
              showFilters
                ? 'bg-lxd-purple-light text-brand-primary'
                : 'bg-lxd-dark-surface-alt/30 text-studio-text hover:bg-lxd-dark-surface-alt/50',
            )}
          >
            <Filter className="w-5 h-5" aria-hidden="true" />
            Filters
            <ChevronDown
              className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            id="filter-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-lxd-dark-surface-alt/50"
          >
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="role-filter" className="block text-sm text-gray-500 mb-2">
                  Role
                </label>
                <select
                  id="role-filter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-studio-bg-dark border border-lxd-dark-surface-alt/50 rounded-lg text-brand-primary"
                >
                  {filterOptions.role.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="skill-filter" className="block text-sm text-gray-500 mb-2">
                  Skill
                </label>
                <select
                  id="skill-filter"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-studio-bg-dark border border-lxd-dark-surface-alt/50 rounded-lg text-brand-primary"
                >
                  {filterOptions.skills.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="location-filter" className="block text-sm text-gray-500 mb-2">
                  Location
                </label>
                <select
                  id="location-filter"
                  className="w-full px-3 py-2 bg-studio-bg-dark border border-lxd-dark-surface-alt/50 rounded-lg text-brand-primary"
                >
                  {filterOptions.location.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Members Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MemberCard member={member} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MemberListItem member={member} />
            </motion.div>
          ))}
        </div>
      )}

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No members found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: Member }) {
  return (
    <article className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-5 hover:border-lxd-purple-light/50 transition-colors group">
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <Link
          href={`/nexus/members/${member.username}`}
          aria-label={`View ${member.name}'s profile`}
          className="relative mb-3"
        >
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-lxd-purple-light to-studio-accent flex items-center justify-center overflow-hidden">
            {member.avatar ? (
              <Image
                src={member.avatar}
                alt=""
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-brand-primary font-bold text-2xl" aria-hidden="true">
                {member.name.charAt(0)}
              </span>
            )}
          </div>
          {member.isMentor && (
            <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center border-2 border-studio-bg">
              <Star className="w-4 h-4 text-brand-primary fill-white" aria-hidden="true" />
              <span className="sr-only">Mentor</span>
            </span>
          )}
        </Link>

        {/* Info */}
        <Link href={`/nexus/members/${member.username}`}>
          <h3 className="font-semibold text-brand-primary group-hover:text-lxd-purple-light transition-colors flex items-center gap-1">
            {member.name}
            {member.isVerified && (
              <>
                <CheckCircle className="w-4 h-4 text-studio-accent" aria-hidden="true" />
                <span className="sr-only">(Verified)</span>
              </>
            )}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1">{member.title}</p>
        {member.company && <p className="text-sm text-gray-500">at {member.company}</p>}
        {member.location && (
          <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3" aria-hidden="true" />
            {member.location}
          </p>
        )}

        {/* Rating for mentors */}
        {member.isMentor && member.rating && (
          <div className="flex items-center gap-1 mt-2 text-brand-warning">
            <Star className="w-4 h-4 fill-amber-400" aria-hidden="true" />
            <span className="text-sm font-medium">{member.rating}</span>
            <span className="sr-only">out of 5 rating</span>
          </div>
        )}

        {/* Skills */}
        <div className="flex flex-wrap justify-center gap-1 mt-3">
          {member.skills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-lxd-purple-light/10 text-lxd-purple-light text-xs rounded"
            >
              {skill}
            </span>
          ))}
          {member.skills.length > 2 && (
            <span className="px-2 py-0.5 bg-lxd-dark-surface-alt/30 text-gray-500 text-xs rounded">
              +{member.skills.length - 2}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <span>{member.followersCount.toLocaleString()} followers</span>
          <span>{member.postsCount} posts</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 w-full">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-lxd-purple-light hover:bg-lxd-purple-light text-brand-primary text-sm rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            Follow
          </button>
          <Link
            href={`/nexus/messages/new?to=${member.id}`}
            aria-label={`Send message to ${member.name}`}
            className="p-2 bg-lxd-dark-surface-alt/30 hover:bg-lxd-dark-surface-alt/50 text-studio-text rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function MemberListItem({ member }: { member: Member }) {
  return (
    <article className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-4 hover:border-lxd-purple-light/50 transition-colors">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Link
          href={`/nexus/members/${member.username}`}
          aria-label={`View ${member.name}'s profile`}
          className="relative shrink-0"
        >
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-lxd-purple-light to-studio-accent flex items-center justify-center overflow-hidden">
            {member.avatar ? (
              <Image
                src={member.avatar}
                alt=""
                width={56}
                height={56}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-brand-primary font-bold text-xl" aria-hidden="true">
                {member.name.charAt(0)}
              </span>
            )}
          </div>
          {member.isMentor && (
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-studio-bg">
              <Star className="w-3 h-3 text-brand-primary fill-white" aria-hidden="true" />
              <span className="sr-only">Mentor</span>
            </span>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/nexus/members/${member.username}`}>
            <h3 className="font-semibold text-brand-primary hover:text-lxd-purple-light transition-colors flex items-center gap-1">
              {member.name}
              {member.isVerified && (
                <>
                  <CheckCircle className="w-4 h-4 text-studio-accent" aria-hidden="true" />
                  <span className="sr-only">(Verified)</span>
                </>
              )}
              {member.isMentor && (
                <span className="ml-1 px-2 py-0.5 bg-brand-warning/10 text-brand-warning text-xs rounded-full">
                  Mentor
                </span>
              )}
            </h3>
          </Link>
          <p className="text-sm text-gray-500">
            {member.title}
            {member.company && ` at ${member.company}`}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {member.location && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {member.location}
              </span>
            )}
            {member.isMentor && member.rating && (
              <span className="flex items-center gap-1 text-xs text-brand-warning">
                <Star className="w-3 h-3 fill-amber-400" aria-hidden="true" />
                {member.rating}
                <span className="sr-only">out of 5 rating</span>
              </span>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="hidden md:flex flex-wrap gap-1 max-w-xs">
          {member.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-lxd-purple-light/10 text-lxd-purple-light text-xs rounded"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Follow ${member.name}`}
            className="flex items-center gap-1 px-3 py-2 bg-lxd-purple-light hover:bg-lxd-purple-light text-brand-primary text-sm rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Follow</span>
          </button>
          <Link
            href={`/nexus/messages/new?to=${member.id}`}
            aria-label={`Send message to ${member.name}`}
            className="p-2 bg-lxd-dark-surface-alt/30 hover:bg-lxd-dark-surface-alt/50 text-studio-text rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
