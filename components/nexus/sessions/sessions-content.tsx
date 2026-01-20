'use client';

/**
 * Sessions Content
 * ================
 * Calendar view of mentoring sessions with ability to join/manage sessions.
 */

import { motion } from 'framer-motion';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  MoreVertical,
  Play,
  Plus,
  Users,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { SessionRoom } from './session-room';

// Mock session data
const MOCK_SESSIONS = [
  {
    id: '1',
    title: 'React Advanced Patterns',
    mentor: {
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      title: 'Staff Engineer',
    },
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    duration: 45,
    status: 'scheduled' as const,
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    agenda: [
      { title: 'Review progress from last session', duration: 5 },
      { title: 'Deep dive into custom hooks', duration: 20 },
      { title: 'Code review exercise', duration: 15 },
      { title: 'Set action items', duration: 5 },
    ],
  },
  {
    id: '2',
    title: 'System Design Review',
    mentor: {
      name: 'Marcus Johnson',
      avatar: 'https://i.pravatar.cc/150?u=marcus',
      title: 'Tech Lead',
    },
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: 60,
    status: 'scheduled' as const,
    meetingUrl: null,
    agenda: [],
  },
  {
    id: '3',
    title: 'Career Growth Planning',
    mentor: {
      name: 'Emily Zhang',
      avatar: 'https://i.pravatar.cc/150?u=emily',
      title: 'Senior PM',
    },
    scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: 30,
    status: 'completed' as const,
    meetingUrl: null,
    agenda: [],
    rating: 5,
    notes: 'Great session on PM career transition',
  },
];

interface SessionsContentProps {
  userId: string;
}

export function SessionsContent({ userId }: SessionsContentProps): React.JSX.Element {
  const [activeSession, setActiveSession] = useState<(typeof MOCK_SESSIONS)[0] | null>(null);
  const [isSessionRoomOpen, setIsSessionRoomOpen] = useState(false);
  const [selectedDate] = useState(new Date());

  const upcomingSessions = MOCK_SESSIONS.filter(
    (s) => s.status === 'scheduled' && s.scheduledAt > new Date(),
  );
  const pastSessions = MOCK_SESSIONS.filter(
    (s) => s.status === 'completed' || s.scheduledAt < new Date(),
  );

  const formatSessionTime = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) return 'Past';
    if (diffHours < 1) return `In ${diffMins} min`;
    if (diffHours < 24) return `In ${diffHours}h ${diffMins}m`;
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Silence unused variable warnings - these are props passed from parent that will be used in future implementation
  void userId;
  void selectedDate;

  if (isSessionRoomOpen && activeSession) {
    return (
      <SessionRoom
        session={activeSession}
        onClose={() => {
          setIsSessionRoomOpen(false);
          setActiveSession(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
            Sessions
          </h1>
          <p className="text-brand-muted dark:text-brand-muted">Manage your mentoring sessions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Session
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-brand-blue dark:text-brand-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
                  {upcomingSessions.length}
                </p>
                <p className="text-xs text-brand-muted">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600 dark:text-brand-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
                  {pastSessions.length}
                </p>
                <p className="text-xs text-brand-muted">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600 dark:text-brand-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">12</p>
                <p className="text-xs text-brand-muted">Hours This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600 dark:text-brand-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">3</p>
                <p className="text-xs text-brand-muted">Active Mentors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming
            {upcomingSessions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {upcomingSessions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-brand-muted mb-4" />
                <h3 className="text-lg font-medium text-brand-primary dark:text-brand-primary mb-2">
                  No upcoming sessions
                </h3>
                <p className="text-brand-muted mb-4">Schedule a session with one of your mentors</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcomingSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    index === 0 &&
                      'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10',
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Session Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.mentor.avatar} />
                          <AvatarFallback>{session.mentor.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-brand-primary dark:text-brand-primary">
                              {session.title}
                            </h3>
                            {index === 0 && (
                              <Badge className="bg-brand-success">Starting Soon</Badge>
                            )}
                          </div>
                          <p className="text-sm text-brand-muted">
                            with {session.mentor.name} • {session.mentor.title}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-brand-muted">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatSessionTime(session.scheduledAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{session.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              <span>Video Call</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Agenda Preview */}
                      {session.agenda.length > 0 && (
                        <div className="shrink-0 w-full lg:w-64 p-3 bg-brand-surface dark:bg-brand-surface rounded-lg">
                          <p className="text-xs font-medium text-brand-muted mb-2">Agenda</p>
                          <div className="space-y-1">
                            {session.agenda.slice(0, 2).map((item, i) => (
                              <div
                                key={i}
                                className="text-xs text-brand-secondary dark:text-brand-muted truncate"
                              >
                                • {item.title}
                              </div>
                            ))}
                            {session.agenda.length > 2 && (
                              <div className="text-xs text-brand-muted">
                                +{session.agenda.length - 2} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant={index === 0 ? 'default' : 'outline'}
                          onClick={() => {
                            setActiveSession(session);
                            setIsSessionRoomOpen(true);
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {index === 0 ? 'Join Now' : 'Join'}
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastSessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.mentor.avatar} />
                    <AvatarFallback>{session.mentor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium text-brand-primary dark:text-brand-primary">
                      {session.title}
                    </h3>
                    <p className="text-sm text-brand-muted">
                      with {session.mentor.name} • {session.scheduledAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.rating && (
                      <Badge variant="secondary">{'⭐'.repeat(session.rating)}</Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      View Notes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-brand-muted">Calendar view coming soon...</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
