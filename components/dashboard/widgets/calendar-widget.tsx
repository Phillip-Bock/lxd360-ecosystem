'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import WidgetWrapper from './widget-wrapper';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'deadline' | 'publish' | 'meeting' | 'reminder';
}

// Mock events - replace with real data
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Course Launch: Safety Training',
    date: new Date(2025, 0, 15),
    type: 'publish',
  },
  {
    id: '2',
    title: 'Review Deadline',
    date: new Date(2025, 0, 20),
    type: 'deadline',
  },
  {
    id: '3',
    title: 'Team Sync',
    date: new Date(2025, 0, 22),
    type: 'meeting',
  },
];

const typeColors: Record<CalendarEvent['type'], string> = {
  deadline: 'bg-red-500',
  publish: 'bg-green-500',
  meeting: 'bg-blue-500',
  reminder: 'bg-amber-500',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const getEventsForDay = (day: number) =>
    mockEvents.filter(
      (e) =>
        e.date.getDate() === day && e.date.getMonth() === month && e.date.getFullYear() === year,
    );

  const upcomingEvents = mockEvents
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  return (
    <WidgetWrapper title="Calendar & Events" size={4}>
      <div className="flex gap-6">
        {/* Mini Calendar */}
        <div className="flex-1">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <span className="font-medium text-white">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-white py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 border border-white/20 rounded-lg p-1">
            {/* Empty cells for days before first of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const events = getEventsForDay(day);
              return (
                <div
                  key={day}
                  className={cn(
                    'h-8 flex flex-col items-center justify-center rounded text-sm cursor-pointer hover:bg-white/10 transition-colors relative text-white border border-white/10',
                    isToday(day) && 'bg-primary text-white hover:bg-primary/90 border-primary',
                  )}
                >
                  {day}
                  {events.length > 0 && (
                    <div className="absolute bottom-0.5 flex gap-0.5">
                      {events.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className={cn('w-1 h-1 rounded-full', typeColors[e.type])}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="w-64 border-l border-white/20 pl-6">
          <h4 className="text-sm font-medium text-white mb-3">Upcoming</h4>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-4">
              <Calendar className="w-8 h-8 text-white/50 mx-auto mb-2" />
              <p className="text-xs text-white">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-2">
                  <div
                    className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', typeColors[event.type])}
                  />
                  <div>
                    <p className="text-sm text-white">{event.title}</p>
                    <p className="text-xs text-white/70">
                      {event.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WidgetWrapper>
  );
}
