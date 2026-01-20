'use client';

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Play,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Mock data
const skillProgress = [
  { name: 'Learning Science', level: 72, target: 100, color: 'bg-primary' },
  { name: 'xAPI Analytics', level: 45, target: 100, color: 'bg-brand-primary' },
  { name: 'Accessibility', level: 88, target: 100, color: 'bg-brand-success' },
  { name: 'Storyline 360', level: 60, target: 100, color: 'bg-brand-secondary' },
];

const nextSteps = [
  {
    id: 1,
    title: 'Complete Portfolio Case Study',
    description: 'Document your recent project',
    type: 'task',
    dueIn: '2 days',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Prepare for Mentor Session',
    description: 'Review xAPI fundamentals',
    type: 'prep',
    dueIn: 'Tomorrow',
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Watch Accessibility Webinar',
    description: 'WCAG 2.2 updates overview',
    type: 'learning',
    dueIn: 'This week',
    priority: 'low',
  },
];

const recentActivity = [
  { type: 'session', text: 'Completed 1:1 session with Dr. Sarah Chen', time: '2 hours ago' },
  { type: 'badge', text: "Earned 'xAPI Explorer' badge", time: 'Yesterday' },
  { type: 'portfolio', text: 'Updated Sales Training case study', time: '2 days ago' },
];

interface NexusDashboardHomeProps {
  userName?: string;
}

export function NexusDashboardHome({
  userName = 'Designer',
}: NexusDashboardHomeProps): React.JSX.Element {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}, {userName}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your learning journey
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/nexus/match">
              <MessageSquare className="h-4 w-4" />
              Message Mentor
            </Link>
          </Button>
          <Button className="gap-2" asChild>
            <Link href="/nexus/schedule">
              <Calendar className="h-4 w-4" />
              Book Session
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">94%</p>
                <p className="text-sm text-muted-foreground">Match Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-brand-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">12</p>
                <p className="text-sm text-muted-foreground">Sessions Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-secondary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-brand-purple" />
              </div>
              <div>
                <p className="text-2xl font-semibold">8</p>
                <p className="text-sm text-muted-foreground">Skills Growing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-warning/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">5</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Skill Progress */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Skill Progress</CardTitle>
                  <CardDescription>Track your growth in key competencies</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/nexus/skills">
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {skillProgress.map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next Steps</CardTitle>
              <CardDescription>Recommended actions to accelerate your growth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {nextSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      step.type === 'task'
                        ? 'bg-primary/10'
                        : step.type === 'prep'
                          ? 'bg-brand-warning/10'
                          : 'bg-brand-primary/10'
                    }`}
                  >
                    {step.type === 'task' ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : step.type === 'prep' ? (
                      <Calendar className="h-5 w-5 text-amber-600" />
                    ) : (
                      <Play className="h-5 w-5 text-brand-blue" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          step.priority === 'high'
                            ? 'border-destructive/50 text-destructive'
                            : step.priority === 'medium'
                              ? 'border-amber-500/50 text-amber-600'
                              : 'border-muted'
                        }`}
                      >
                        {step.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {step.dueIn}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Mentor Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Mentor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">SC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">Dr. Sarah Chen</p>
                  <p className="text-sm text-muted-foreground">Director of Learning Design</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">4.9</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Session</span>
                  <span className="font-medium">Tomorrow, 2:00 PM</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Topic</span>
                  <span className="font-medium">Portfolio Review</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2" asChild>
                  <Link href="/nexus/schedule">
                    <Video className="h-4 w-4" />
                    Join Call
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1 gap-2" asChild>
                  <Link href="/nexus/match">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      activity.type === 'session'
                        ? 'bg-primary/10'
                        : activity.type === 'badge'
                          ? 'bg-brand-warning/10'
                          : 'bg-brand-secondary/10'
                    }`}
                  >
                    {activity.type === 'session' ? (
                      <Video className="h-4 w-4 text-primary" />
                    ) : activity.type === 'badge' ? (
                      <Star className="h-4 w-4 text-amber-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-brand-purple" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-linear-to-br from-primary/10 to-purple-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI Learning Coach</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get personalized recommendations and instant feedback on your work
                  </p>
                  <Button size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat with Coach
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
