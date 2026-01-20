'use client';

/**
 * ActiveMentors Widget
 * ====================
 * Shows currently available mentors for the sidebar.
 */

import { ArrowRight, MessageCircle, Star, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Mentor {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
  available: boolean;
  rating?: number;
}

interface ActiveMentorsProps {
  mentors?: Mentor[];
}

const defaultMentors: Mentor[] = [
  {
    id: '1',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Learning Strategy',
    available: true,
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    specialty: 'Technical Training',
    available: true,
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Lisa Wang',
    specialty: 'Visual Design',
    available: false,
    rating: 4.9,
  },
  {
    id: '4',
    name: 'James Park',
    specialty: 'Video Production',
    available: true,
    rating: 4.7,
  },
];

export function ActiveMentors({ mentors = defaultMentors }: ActiveMentorsProps): React.JSX.Element {
  return (
    <div className="bg-(--surface-card) border border-(--border-subtle) rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-warning/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-brand-warning" />
        </div>
        <h3 className="font-semibold text-brand-primary">Available Mentors</h3>
      </div>
      <div className="space-y-3">
        {mentors.slice(0, 4).map((mentor) => (
          <div key={mentor.id} className="flex items-center gap-3 group">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-(--brand-secondary) to-(--brand-primary-hover) flex items-center justify-center overflow-hidden">
                {mentor.avatar ? (
                  <Image
                    src={mentor.avatar}
                    alt={mentor.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-brand-primary font-medium">{mentor.name.charAt(0)}</span>
                )}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-(--surface-card) ${
                  mentor.available ? 'bg-green-400' : 'bg-(--text-tertiary)'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-primary truncate group-hover:text-(--brand-secondary) transition-colors">
                {mentor.name}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-(--text-tertiary) truncate">{mentor.specialty}</p>
                {mentor.rating && (
                  <span className="flex items-center gap-0.5 text-xs text-brand-warning">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {mentor.rating}
                  </span>
                )}
              </div>
            </div>
            <Link
              href={`/nexus/messages/new?to=${mentor.id}`}
              className="p-2 text-(--text-tertiary) hover:text-(--brand-secondary) hover:bg-(--brand-secondary)/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Message"
            >
              <MessageCircle className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
      <Link
        href="/nexus/mentorship/find-mentor"
        className="flex items-center justify-center gap-1 mt-4 text-sm text-(--brand-secondary) hover:underline"
      >
        Browse all mentors
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
