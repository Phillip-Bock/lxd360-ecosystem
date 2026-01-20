'use client';

/**
 * FindMentorContent Component
 * ===========================
 * Browse and filter available mentors.
 */

import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Filter,
  MapPin,
  MessageCircle,
  Search,
  Star,
  Users,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Mentor {
  id: string;
  name: string;
  title: string;
  company?: string;
  location?: string;
  avatar?: string;
  bio: string;
  expertise: string[];
  topics: string[];
  rating: number;
  reviewCount: number;
  sessionsCompleted: number;
  availability: string;
  responseTime: string;
  hourlyRate?: number;
  isFree?: boolean;
  isVerified: boolean;
  isAvailable: boolean;
}

const MOCK_MENTORS: Mentor[] = [
  {
    id: '1',
    name: 'Dr. Emily Rodriguez',
    title: 'Chief Learning Officer',
    company: 'Deloitte',
    location: 'New York, NY',
    bio: '20+ years in L&D. Passionate about building learning cultures that drive business results.',
    expertise: ['Learning Strategy', 'Leadership Development', 'Change Management'],
    topics: ['Career guidance', 'L&D Strategy', 'Leadership'],
    rating: 4.9,
    reviewCount: 142,
    sessionsCompleted: 234,
    availability: '4-8 hrs/month',
    responseTime: 'Within 24 hours',
    isFree: true,
    isVerified: true,
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    title: 'L&D Manager',
    company: 'Salesforce',
    location: 'San Francisco, CA',
    bio: 'Technical training specialist with expertise in modern learning technologies.',
    expertise: ['Technical Training', 'Video Production', 'xAPI'],
    topics: ['Technical skills', 'Video production', 'Tool mastery'],
    rating: 4.8,
    reviewCount: 89,
    sessionsCompleted: 156,
    availability: '8-12 hrs/month',
    responseTime: 'Within 12 hours',
    hourlyRate: 50,
    isVerified: true,
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Lisa Wang',
    title: 'Learning Experience Designer',
    company: 'Apple',
    location: 'Cupertino, CA',
    bio: 'Designing inclusive learning experiences for global audiences.',
    expertise: ['Visual Design', 'Accessibility', 'UX for Learning'],
    topics: ['Portfolio review', 'Visual design', 'Accessibility'],
    rating: 4.9,
    reviewCount: 67,
    sessionsCompleted: 98,
    availability: '2-4 hrs/month',
    responseTime: 'Within 48 hours',
    isFree: true,
    isVerified: true,
    isAvailable: false,
  },
  {
    id: '4',
    name: 'Priya Sharma',
    title: 'Learning Consultant',
    company: 'Freelance',
    location: 'Austin, TX',
    bio: 'Helping organizations maximize their learning investments through data-driven approaches.',
    expertise: ['Needs Analysis', 'Performance Consulting', 'ROI Measurement'],
    topics: ['Career transition', 'Freelancing', 'Consulting'],
    rating: 4.7,
    reviewCount: 45,
    sessionsCompleted: 78,
    availability: '8-12 hrs/month',
    responseTime: 'Within 24 hours',
    hourlyRate: 75,
    isVerified: true,
    isAvailable: true,
  },
];

const filterOptions = {
  expertise: [
    'All Expertise',
    'Instructional Design',
    'Learning Strategy',
    'Visual Design',
    'Technical Training',
    'Leadership Development',
  ],
  availability: [
    'Any Availability',
    'Available Now',
    '2-4 hrs/month',
    '4-8 hrs/month',
    '8+ hrs/month',
  ],
  pricing: ['Any Price', 'Free Mentors Only', 'Paid Mentors Only'],
};

export function FindMentorContent(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expertiseFilter, setExpertiseFilter] = useState('All Expertise');
  const [availabilityFilter, setAvailabilityFilter] = useState('Any Availability');
  const [pricingFilter, setPricingFilter] = useState('Any Price');

  const filteredMentors = MOCK_MENTORS.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase())) ||
      mentor.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesExpertise =
      expertiseFilter === 'All Expertise' ||
      mentor.expertise.some((e) => e.toLowerCase().includes(expertiseFilter.toLowerCase()));

    const matchesPricing =
      pricingFilter === 'Any Price' ||
      (pricingFilter === 'Free Mentors Only' && mentor.isFree) ||
      (pricingFilter === 'Paid Mentors Only' && !mentor.isFree);

    return matchesSearch && matchesExpertise && matchesPricing;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Find a Mentor</h1>
        <p className="text-gray-500">{filteredMentors.length} mentors available to help you grow</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, expertise, or topic..."
              className="w-full pl-10 pr-4 py-2.5 bg-studio-bg-dark border border-lxd-dark-surface-alt/50 rounded-lg text-brand-primary placeholder-gray-500 focus:border-lxd-purple-light outline-hidden"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors',
              showFilters
                ? 'bg-lxd-purple-light text-brand-primary'
                : 'bg-lxd-dark-surface-alt/30 text-studio-text hover:bg-lxd-dark-surface-alt/50',
            )}
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown
              className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')}
            />
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-lxd-dark-surface-alt/50"
          >
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="expertise-filter" className="block text-sm text-gray-500 mb-2">
                  Expertise
                </label>
                <select
                  id="expertise-filter"
                  value={expertiseFilter}
                  onChange={(e) => setExpertiseFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-studio-bg-dark border border-lxd-dark-surface-alt/50 rounded-lg text-brand-primary"
                >
                  {filterOptions.expertise.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="availability-filter" className="block text-sm text-gray-500 mb-2">
                  Availability
                </label>
                <select
                  id="availability-filter"
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-studio-bg-dark border border-lxd-dark-surface-alt/50 rounded-lg text-brand-primary"
                >
                  {filterOptions.availability.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pricing-filter" className="block text-sm text-gray-500 mb-2">
                  Pricing
                </label>
                <select
                  id="pricing-filter"
                  value={pricingFilter}
                  onChange={(e) => setPricingFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-studio-bg-dark border border-lxd-dark-surface-alt/50 rounded-lg text-brand-primary"
                >
                  {filterOptions.pricing.map((option) => (
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

      {/* Mentors List */}
      <div className="space-y-4">
        {filteredMentors.map((mentor, index) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <MentorCard mentor={mentor} />
          </motion.div>
        ))}

        {filteredMentors.length === 0 && (
          <div className="text-center py-12 bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500">No mentors found matching your criteria.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setExpertiseFilter('All Expertise');
                setPricingFilter('Any Price');
              }}
              className="mt-3 text-sm text-lxd-purple-light hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MentorCard({ mentor }: { mentor: Mentor }): React.JSX.Element {
  return (
    <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-5 hover:border-lxd-purple-light/50 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-lxd-purple-light to-studio-accent flex items-center justify-center overflow-hidden">
            {mentor.avatar ? (
              <Image
                src={mentor.avatar}
                alt={mentor.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-brand-primary font-bold text-2xl">{mentor.name.charAt(0)}</span>
            )}
          </div>
          <span
            className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-studio-bg ${
              mentor.isAvailable ? 'bg-green-400' : 'bg-gray-500'
            }`}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-brand-primary text-lg">{mentor.name}</h3>
            {mentor.isVerified && <CheckCircle className="w-4 h-4 text-studio-accent" />}
            {mentor.isFree ? (
              <span className="px-2 py-0.5 bg-brand-success/10 text-brand-success text-xs rounded-full">
                Free
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-brand-warning/10 text-brand-warning text-xs rounded-full">
                ${mentor.hourlyRate}/hr
              </span>
            )}
          </div>

          <p className="text-gray-500">
            {mentor.title}
            {mentor.company && ` at ${mentor.company}`}
          </p>

          <p className="text-sm text-studio-text mt-2 line-clamp-2">{mentor.bio}</p>

          {/* Expertise Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {mentor.expertise.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-lxd-purple-light/10 text-lxd-purple-light text-xs rounded"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1 text-brand-warning">
              <Star className="w-4 h-4 fill-amber-400" />
              {mentor.rating} ({mentor.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1">
              <Video className="w-4 h-4" />
              {mentor.sessionsCompleted} sessions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {mentor.availability}
            </span>
            {mentor.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {mentor.location}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-2 sm:w-36">
          <Link
            href={`/nexus/members/${mentor.id}`}
            className="flex-1 sm:flex-none px-4 py-2 bg-lxd-purple-light hover:bg-lxd-purple-light text-brand-primary text-sm font-medium rounded-lg text-center transition-colors"
          >
            View Profile
          </Link>
          <Link
            href={`/nexus/messages/new?to=${mentor.id}`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-lxd-dark-surface-alt/30 hover:bg-lxd-dark-surface-alt/50 text-brand-primary text-sm rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </Link>
          <Link
            href={`/nexus/mentorship/sessions/schedule?mentor=${mentor.id}`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 border border-lxd-dark-surface-alt/50 hover:border-lxd-purple-light/50 text-brand-primary text-sm rounded-lg transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Book
          </Link>
        </div>
      </div>
    </div>
  );
}
