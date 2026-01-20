'use client';

/**
 * UpcomingEvents Widget
 * =====================
 * Shows upcoming community events in the sidebar.
 */

import { ArrowRight, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'workshop' | 'webinar' | 'meetup' | 'review';
  isFree?: boolean;
  attendees?: number;
}

interface UpcomingEventsProps {
  events?: Event[];
}

const defaultEvents: Event[] = [
  {
    id: '1',
    title: 'Portfolio Review Session',
    date: 'Tomorrow',
    time: '2:00 PM EST',
    type: 'review',
    isFree: true,
    attendees: 24,
  },
  {
    id: '2',
    title: 'AI in Learning Design Workshop',
    date: 'Dec 12',
    time: '11:00 AM EST',
    type: 'workshop',
    isFree: false,
    attendees: 89,
  },
  {
    id: '3',
    title: 'Monthly Community Meetup',
    date: 'Dec 15',
    time: '4:00 PM EST',
    type: 'meetup',
    isFree: true,
    attendees: 156,
  },
];

export function UpcomingEvents({ events = defaultEvents }: UpcomingEventsProps): React.JSX.Element {
  return (
    <div className="bg-(--surface-card) border border-(--border-subtle) rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-(--brand-primary-hover)/10 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-(--brand-primary-hover)" />
        </div>
        <h3 className="font-semibold text-brand-primary">Upcoming Events</h3>
      </div>
      <div className="space-y-3">
        {events.slice(0, 3).map((event) => (
          <Link
            key={event.id}
            href={`/nexus/events/${event.id}`}
            className="block p-3 bg-(--surface-page) rounded-lg hover:bg-(--surface-card-hover) transition-colors group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-medium text-brand-primary group-hover:text-(--brand-secondary) transition-colors line-clamp-1">
                {event.title}
              </h4>
              {event.isFree ? (
                <span className="shrink-0 px-2 py-0.5 bg-brand-success/10 text-brand-success text-xs rounded">
                  Free
                </span>
              ) : (
                <span className="shrink-0 px-2 py-0.5 bg-(--brand-secondary)/10 text-(--brand-secondary) text-xs rounded">
                  Pro
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-(--text-tertiary)">
                {event.date}, {event.time}
              </span>
              {event.attendees && (
                <span className="flex items-center gap-1 text-(--text-tertiary)">
                  <Users className="w-3 h-3" />
                  {event.attendees}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/nexus/events"
        className="flex items-center justify-center gap-1 mt-4 text-sm text-(--brand-secondary) hover:underline"
      >
        View all events
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
