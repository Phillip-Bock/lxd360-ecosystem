'use client';

import { Calendar, ChevronLeft, ChevronRight, Clock, Eye, Plus, Users, Video } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// Mock schedule data
const mockEvents = [
  {
    id: 1,
    type: 'mentoring',
    title: '1:1 with Dr. Sarah Chen',
    date: '2025-01-14',
    time: '14:00',
    duration: 45,
    description: 'Portfolio review session',
  },
  {
    id: 2,
    type: 'shadowing',
    title: 'Shadow: Stakeholder Meeting',
    date: '2025-01-15',
    time: '10:00',
    duration: 60,
    description: 'Observe how Sarah handles client discovery',
    mentor: 'Dr. Sarah Chen',
  },
  {
    id: 3,
    type: 'mentoring',
    title: '1:1 with Dr. Sarah Chen',
    date: '2025-01-18',
    time: '15:00',
    duration: 30,
    description: 'xAPI implementation review',
  },
  {
    id: 4,
    type: 'community',
    title: 'Community AMA: Accessibility',
    date: '2025-01-20',
    time: '13:00',
    duration: 60,
    description: 'Open Q&A with accessibility experts',
  },
];

// Mock available shadowing sessions
const shadowingOpportunities = [
  {
    id: 1,
    mentor: 'Dr. Sarah Chen',
    title: 'Client Discovery Call',
    date: 'Jan 22, 2025',
    time: '10:00 AM EST',
    duration: '60 min',
    description: 'Watch how I conduct initial needs analysis with a new client',
    spots: 2,
  },
  {
    id: 2,
    mentor: 'Dr. Sarah Chen',
    title: 'Design Review Meeting',
    date: 'Jan 25, 2025',
    time: '2:00 PM EST',
    duration: '45 min',
    description: 'Observe stakeholder presentation and feedback handling',
    spots: 1,
  },
  {
    id: 3,
    mentor: 'Marcus Thompson',
    title: 'Video Production Session',
    date: 'Jan 23, 2025',
    time: '11:00 AM EST',
    duration: '90 min',
    description: 'Live editing session for a training video',
    spots: 3,
  },
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ScheduleManager(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 13)); // Jan 13, 2025
  const [showBookSession, setShowBookSession] = useState(false);

  // Generate calendar days
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockEvents.filter((e) => e.date === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">
            Manage sessions, shadowing opportunities, and community events
          </p>
        </div>
        <Dialog open={showBookSession} onOpenChange={setShowBookSession}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Book Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book a Session</DialogTitle>
              <DialogDescription>Schedule time with your mentor</DialogDescription>
            </DialogHeader>
            <BookSessionForm onClose={() => setShowBookSession(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="shadowing" className="gap-2">
            <Eye className="h-4 w-4" />
            Shadowing
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            {/* Calendar Grid */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentDate(
                          new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
                        )
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentDate(
                          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    const events = getEventsForDay(day);
                    const isToday = day === 13; // Mock today as Jan 13

                    return (
                      <div
                        key={i}
                        className={`min-h-[80px] p-1 rounded-lg border ${
                          day
                            ? 'bg-background hover:bg-muted/50 cursor-pointer'
                            : 'bg-transparent border-transparent'
                        } ${isToday ? 'border-primary' : 'border-border'}`}
                      >
                        {day && (
                          <>
                            <span
                              className={`text-sm ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}
                            >
                              {day}
                            </span>
                            <div className="space-y-0.5 mt-1">
                              {events.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs px-1 py-0.5 rounded truncate ${
                                    event.type === 'mentoring'
                                      ? 'bg-primary/10 text-primary'
                                      : event.type === 'shadowing'
                                        ? 'bg-brand-warning/10 text-amber-600'
                                        : 'bg-brand-primary/10 text-brand-blue'
                                  }`}
                                >
                                  {event.title.split(':')[0]}
                                </div>
                              ))}
                              {events.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{events.length - 2} more
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Upcoming</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockEvents.slice(0, 4).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                          event.type === 'mentoring'
                            ? 'bg-primary/10'
                            : event.type === 'shadowing'
                              ? 'bg-brand-warning/10'
                              : 'bg-brand-primary/10'
                        }`}
                      >
                        {event.type === 'mentoring' ? (
                          <Video className="h-5 w-5 text-primary" />
                        ) : event.type === 'shadowing' ? (
                          <Eye className="h-5 w-5 text-amber-600" />
                        ) : (
                          <Users className="h-5 w-5 text-brand-blue" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          - {event.time}
                        </p>
                        <Badge
                          variant="outline"
                          className={`mt-1 text-xs ${
                            event.type === 'mentoring'
                              ? 'border-primary/30'
                              : event.type === 'shadowing'
                                ? 'border-amber-500/30'
                                : 'border-brand-primary/30'
                          }`}
                        >
                          {event.duration} min
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Legend */}
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded bg-primary" />
                      <span>1:1 Mentoring</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded bg-brand-warning" />
                      <span>Shadowing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded bg-brand-primary" />
                      <span>Community Event</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Shadowing Tab */}
        <TabsContent value="shadowing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shadowing Opportunities</CardTitle>
              <CardDescription>
                Watch your mentor (or other experts) work in real-time. Limited spots available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shadowingOpportunities.map((opp) => (
                  <Card
                    key={opp.id}
                    className="border-2 hover:border-amber-500/50 transition-colors"
                  >
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Shadow Session
                        </Badge>
                        <Badge variant="outline">{opp.spots} spots left</Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold">{opp.title}</h3>
                        <p className="text-sm text-muted-foreground">{opp.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {opp.mentor
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{opp.mentor}</p>
                          <p className="text-xs text-muted-foreground">Host</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {opp.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {opp.duration}
                        </span>
                      </div>

                      <Button className="w-full">Reserve Spot</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What is Shadowing */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-brand-warning/10 flex items-center justify-center shrink-0">
                  <Eye className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">What is Shadowing?</h3>
                  <p className="text-sm text-muted-foreground">
                    Shadowing sessions let you observe your mentor (or other experts) in real work
                    situations. Watch how they handle client calls, design reviews, stakeholder
                    presentations, and more. You'll be a silent observer with the opportunity to ask
                    questions at the end.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookSessionForm({ onClose }: { onClose: () => void }) {
  const [sessionType, setSessionType] = useState('regular');

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-3">
        <Label>Session Type</Label>
        <RadioGroup value={sessionType} onValueChange={setSessionType} className="grid gap-3">
          <label
            htmlFor="session-type-regular"
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              sessionType === 'regular' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value="regular" id="session-type-regular" />
            <div>
              <span className="font-medium">Regular 1:1</span>
              <p className="text-sm text-muted-foreground">30-45 minute video call</p>
            </div>
          </label>
          <label
            htmlFor="session-type-review"
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              sessionType === 'review' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value="review" id="session-type-review" />
            <div>
              <span className="font-medium">Project Review</span>
              <p className="text-sm text-muted-foreground">60 minute deep-dive on your work</p>
            </div>
          </label>
          <label
            htmlFor="session-type-quick"
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              sessionType === 'quick' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value="quick" id="session-type-quick" />
            <div>
              <span className="font-medium">Quick Check-in</span>
              <p className="text-sm text-muted-foreground">15 minute focused discussion</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>What would you like to discuss?</Label>
        <Textarea placeholder="Brief description of your agenda..." rows={3} />
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button className="flex-1 gap-2" onClick={onClose}>
          <Calendar className="h-4 w-4" />
          Pick a Time
        </Button>
      </div>
    </div>
  );
}
