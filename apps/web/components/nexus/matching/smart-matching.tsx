'use client';

import {
  Brain,
  Calendar,
  Clock,
  Heart,
  MessageSquare,
  Sparkles,
  Star,
  Target,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock mentor data
const currentMentor = {
  id: 1,
  name: 'Dr. Sarah Chen',
  title: 'Director of Learning Design',
  company: 'TechCorp Inc.',
  avatar: null,
  compatibility: 94,
  matchFactors: {
    expertise: 98,
    personality: 91,
    availability: 95,
    goals: 92,
  },
  expertise: ['Learning Science', 'xAPI Analytics', 'Leadership Development', 'Accessibility'],
  industries: ['Technology', 'Healthcare', 'Finance'],
  mentoringStyle: 'Coach',
  bio: '15+ years in learning design with a focus on data-driven approaches. Passionate about helping others develop evidence-based learning strategies.',
  stats: {
    menteeCount: 12,
    avgRating: 4.9,
    sessionsCompleted: 156,
    yearsExperience: 15,
  },
};

// Mock compatibility breakdown
const compatibilityBreakdown = [
  {
    category: 'Expertise Alignment',
    score: 98,
    details: 'Strong overlap in xAPI, Learning Science, and Accessibility',
    icon: Brain,
  },
  {
    category: 'Personality Fit',
    score: 91,
    details: 'Both prefer structured approach with room for exploration',
    icon: Heart,
  },
  {
    category: 'Availability Match',
    score: 95,
    details: 'Overlapping availability on Tue/Thu afternoons EST',
    icon: Clock,
  },
  {
    category: 'Goal Alignment',
    score: 92,
    details: 'Mentor expertise matches your growth areas',
    icon: Target,
  },
];

// Mock upcoming sessions
const upcomingSessions = [
  {
    id: 1,
    title: 'Portfolio Review',
    date: 'Tomorrow',
    time: '2:00 PM EST',
    duration: '45 min',
    type: 'video',
  },
  {
    id: 2,
    title: 'xAPI Implementation Discussion',
    date: 'Thu, Jan 18',
    time: '3:00 PM EST',
    duration: '30 min',
    type: 'video',
  },
];

// Mock session history
const sessionHistory = [
  {
    id: 1,
    title: 'Initial Goal Setting',
    date: 'Jan 3, 2025',
    notes: 'Established 6-month goals, identified key growth areas',
    rating: 5,
  },
  {
    id: 2,
    title: 'Storyline Best Practices',
    date: 'Jan 8, 2025',
    notes: 'Deep dive into advanced triggers and variables',
    rating: 5,
  },
  {
    id: 3,
    title: 'Accessibility Audit Review',
    date: 'Jan 12, 2025',
    notes: 'Reviewed WCAG compliance, created remediation plan',
    rating: 5,
  },
];

// Mock alternative matches
const alternativeMatches = [
  {
    id: 2,
    name: 'Marcus Thompson',
    title: 'Senior LXD Consultant',
    compatibility: 87,
    expertise: ['Gamification', 'Video Production', 'Corporate Training'],
  },
  {
    id: 3,
    name: 'Dr. Emily Watson',
    title: 'Learning Scientist',
    compatibility: 84,
    expertise: ['Cognitive Science', 'Research Methods', 'Assessment Design'],
  },
];

export function SmartMatching(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('current');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Match</h1>
          <p className="text-muted-foreground">
            AI-powered mentor matching based on skills, personality, and goals
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            Schedule Session
          </Button>
          <Button className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Message
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="current" className="gap-2">
            <Target className="h-4 w-4" />
            Current Match
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Calendar className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="compatibility" className="gap-2">
            <Brain className="h-4 w-4" />
            Compatibility
          </TabsTrigger>
        </TabsList>

        {/* Current Match Tab */}
        <TabsContent value="current" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Mentor Profile */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar and basic info */}
                  <div className="flex flex-col items-center text-center md:items-start md:text-left">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={currentMentor.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {currentMentor.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Badge className="gap-1 mb-2">
                      <Target className="h-3 w-3" />
                      {currentMentor.compatibility}% Match
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold">{currentMentor.name}</h2>
                      <p className="text-muted-foreground">{currentMentor.title}</p>
                      <p className="text-sm text-muted-foreground">{currentMentor.company}</p>
                    </div>

                    <p className="text-sm text-muted-foreground">{currentMentor.bio}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {currentMentor.expertise.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-semibold">
                          {currentMentor.stats.yearsExperience}
                        </p>
                        <p className="text-xs text-muted-foreground">Years Exp.</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{currentMentor.stats.menteeCount}</p>
                        <p className="text-xs text-muted-foreground">Mentees</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold">
                          {currentMentor.stats.sessionsCompleted}
                        </p>
                        <p className="text-xs text-muted-foreground">Sessions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold flex items-center justify-center gap-1">
                          {currentMentor.stats.avgRating}
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        </p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-4">
              {/* Next Session */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Next Session</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingSessions[0] && (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{upcomingSessions[0].title}</p>
                          <p className="text-sm text-muted-foreground">
                            {upcomingSessions[0].date} at {upcomingSessions[0].time}
                          </p>
                        </div>
                        <Badge variant="secondary">{upcomingSessions[0].duration}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1 gap-2">
                          <Video className="h-4 w-4" />
                          Join Call
                        </Button>
                        <Button variant="outline">Reschedule</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Match Factors Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Why This Match</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(currentMentor.matchFactors).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize text-muted-foreground">{key}</span>
                        <span className="font-medium">{value}%</span>
                      </div>
                      <Progress value={value} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Mentoring Style */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Mentoring Style: {currentMentor.mentoringStyle}</p>
                      <p className="text-sm text-muted-foreground">
                        Guides through questions, helps you find your own answers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Alternative Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Other Compatible Mentors</CardTitle>
              <CardDescription>
                Request a rematch if you'd like to explore other options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {alternativeMatches.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-muted">
                        {mentor.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{mentor.name}</p>
                        <Badge variant="secondary">{mentor.compatibility}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{mentor.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mentor.expertise.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.date} • {session.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{session.duration}</Badge>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  Schedule New Session
                </Button>
              </CardContent>
            </Card>

            {/* Session History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Session History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {sessionHistory.map((session) => (
                      <div key={session.id} className="p-4 rounded-lg border space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <p className="text-sm text-muted-foreground">{session.date}</p>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: session.rating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{session.notes}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compatibility Tab */}
        <TabsContent value="compatibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compatibility Analysis</CardTitle>
              <CardDescription>
                AI-powered breakdown of why you and {currentMentor.name} are a great match
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Score */}
              <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg aria-hidden="true" className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(currentMentor.compatibility / 100) * 352} 352`}
                        className="text-primary"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-3xl font-bold">
                      {currentMentor.compatibility}%
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-medium">Excellent Match</p>
                  <p className="text-sm text-muted-foreground">Top 5% compatibility score</p>
                </div>
              </div>

              {/* Factor Breakdown */}
              <div className="grid gap-4 md:grid-cols-2">
                {compatibilityBreakdown.map((factor) => (
                  <div key={factor.category} className="p-4 rounded-lg border space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <factor.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{factor.category}</p>
                          <span className="font-semibold text-primary">{factor.score}%</span>
                        </div>
                        <Progress value={factor.score} className="h-1.5 mt-1" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{factor.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
