'use client';

/**
 * Dashboard Content
 * =================
 * Main dashboard content with gamification, skill tree, and activity widgets.
 */

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Flame,
  Gem,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { SkillTreeVisualization } from './skill-tree-visualization';

interface DashboardContentProps {
  userId: string;
  userName: string;
}

// Mock data - will be replaced with real data fetching
const MOCK_DATA = {
  gamification: {
    karma: 1250,
    streak: 12,
    level: 5,
    xp: 3420,
    nextLevelXp: 5000,
    badges: [
      { name: 'Early Adopter', icon: '🌟', color: 'amber' },
      { name: 'Code Warrior', icon: '⚔️', color: 'purple' },
      { name: 'Mentor Star', icon: '🎯', color: 'blue' },
    ],
  },
  upcomingSessions: [
    {
      id: '1',
      title: 'React Advanced Patterns',
      mentor: { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=sarah' },
      date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      duration: 45,
    },
    {
      id: '2',
      title: 'System Design Review',
      mentor: { name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?u=alex' },
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 60,
    },
  ],
  activeGoals: [
    { id: '1', title: 'Master React Hooks', progress: 75, dueDate: '2024-01-15' },
    { id: '2', title: 'Complete System Design Course', progress: 30, dueDate: '2024-02-01' },
    { id: '3', title: 'Build Portfolio Project', progress: 10, dueDate: '2024-02-15' },
  ],
  learningProgress: {
    pathsCompleted: 2,
    pathsInProgress: 3,
    totalHours: 48,
    currentPath: {
      title: 'React Mastery',
      progress: 65,
      nextModule: 'Custom Hooks Deep Dive',
    },
  },
  recentActivity: [
    { type: 'session', text: 'Completed session with Sarah Chen', time: '2 hours ago' },
    { type: 'goal', text: 'Updated goal: Master React Hooks', time: '5 hours ago' },
    { type: 'badge', text: 'Earned "Code Warrior" badge', time: '1 day ago' },
    { type: 'learning', text: 'Completed module: State Management', time: '2 days ago' },
  ],
  suggestedMentors: [
    {
      id: '1',
      name: 'Marcus Johnson',
      avatar: 'https://i.pravatar.cc/150?u=marcus',
      title: 'Staff Engineer at Google',
      skills: ['System Design', 'Go', 'Kubernetes'],
      matchScore: 95,
    },
    {
      id: '2',
      name: 'Emily Zhang',
      avatar: 'https://i.pravatar.cc/150?u=emily',
      title: 'Tech Lead at Netflix',
      skills: ['React', 'Node.js', 'Leadership'],
      matchScore: 88,
    },
  ],
};

export function DashboardContent({ userId, userName }: DashboardContentProps): React.JSX.Element {
  void userId; // Will be used when integrating real data
  const { gamification, upcomingSessions, activeGoals, learningProgress, suggestedMentors } =
    MOCK_DATA;

  const formatSessionTime = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 1) return `In ${diffMins} minutes`;
    if (diffHours < 24) return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
            Welcome back, {userName.split(' ')[0]}!
          </h1>
          <p className="text-brand-muted dark:text-brand-muted">
            Track your progress and continue growing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/nexus/mentors">
              <Users className="w-4 h-4 mr-2" />
              Find Mentor
            </Link>
          </Button>
          <Button asChild>
            <Link href="/nexus/sessions">
              <Video className="w-4 h-4 mr-2" />
              Quick Session
            </Link>
          </Button>
        </div>
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-linear-to-br from-amber-500 to-orange-500 text-brand-primary border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-brand-primary/80 text-sm font-medium mb-1">
                <Gem className="w-4 h-4" />
                Karma Points
              </div>
              <div className="text-2xl font-bold">{gamification.karma.toLocaleString()}</div>
              <div className="text-xs text-brand-primary/60 mt-1">+150 this week</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-linear-to-br from-blue-500 to-cyan-500 text-brand-primary border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-brand-primary/80 text-sm font-medium mb-1">
                <Flame className="w-4 h-4" />
                Day Streak
              </div>
              <div className="text-2xl font-bold">{gamification.streak} Days</div>
              <div className="text-xs text-brand-primary/60 mt-1">Personal best: 15</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-linear-to-br from-lxd-purple-light to-studio-accent text-brand-primary border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-brand-primary/80 text-sm font-medium mb-1">
                <Star className="w-4 h-4" />
                Level
              </div>
              <div className="text-2xl font-bold">Level {gamification.level}</div>
              <div className="mt-2">
                <Progress
                  value={(gamification.xp / gamification.nextLevelXp) * 100}
                  className="h-1.5 bg-brand-surface/20"
                />
                <div className="text-xs text-brand-primary/60 mt-1">
                  {gamification.xp} / {gamification.nextLevelXp} XP
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-brand-surface dark:bg-brand-surface border border-brand-default dark:border-brand-default shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-brand-secondary dark:text-brand-muted text-sm font-medium mb-1">
                <Trophy className="w-4 h-4" />
                Badges
              </div>
              <div className="flex gap-2 mt-2">
                {gamification.badges.map((badge, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-brand-surface dark:bg-brand-surface-hover flex items-center justify-center text-lg"
                    title={badge.name}
                  >
                    {badge.icon}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Skill Tree & Goals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Tree */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Skill Tree</CardTitle>
                  <CardDescription>Track and level up your skills</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/nexus/learning">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SkillTreeVisualization />
            </CardContent>
          </Card>

          {/* Active Goals */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-blue" />
                    Active Goals
                  </CardTitle>
                  <CardDescription>Track your mentoring objectives</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 bg-brand-page dark:bg-brand-surface/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-brand-primary dark:text-brand-primary">
                          {goal.title}
                        </h4>
                        <p className="text-xs text-brand-muted">Due: {goal.dueDate}</p>
                      </div>
                      <Badge variant={goal.progress >= 75 ? 'default' : 'secondary'}>
                        {goal.progress}%
                      </Badge>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sessions & Activity */}
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-success" />
                  Up Next
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/nexus/sessions">
                    All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingSessions.map((session, i) => (
                <div
                  key={session.id}
                  className={cn(
                    'p-3 rounded-lg border transition-colors cursor-pointer hover:bg-brand-page dark:hover:bg-brand-surface/50',
                    i === 0
                      ? 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/20'
                      : 'border-brand-default dark:border-brand-default',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.mentor.avatar} />
                      <AvatarFallback>{session.mentor.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-brand-primary dark:text-brand-primary text-sm truncate">
                        {session.title}
                      </h4>
                      <p className="text-xs text-brand-muted">with {session.mentor.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-brand-muted" />
                        <span className="text-xs text-brand-muted">
                          {formatSessionTime(session.date)} • {session.duration}min
                        </span>
                      </div>
                    </div>
                    {i === 0 && (
                      <Button size="sm" className="shrink-0">
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Current Learning Path */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-purple" />
                Current Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-brand-primary dark:text-brand-primary">
                    {learningProgress.currentPath.title}
                  </h4>
                  <p className="text-sm text-brand-muted mt-1">
                    Next: {learningProgress.currentPath.nextModule}
                  </p>
                </div>
                <Progress value={learningProgress.currentPath.progress} className="h-2" />
                <div className="flex justify-between text-xs text-brand-muted">
                  <span>{learningProgress.currentPath.progress}% complete</span>
                  <span>{learningProgress.totalHours} hours learned</span>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/nexus/learning">
                    Continue Learning
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Mentors */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-blue" />
                  Recommended
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedMentors.map((mentor) => (
                <Link
                  key={mentor.id}
                  href={`/nexus/mentors/${mentor.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg border border-brand-default dark:border-brand-default hover:bg-brand-page dark:hover:bg-brand-surface/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={mentor.avatar} />
                    <AvatarFallback>{mentor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-brand-primary dark:text-brand-primary text-sm truncate">
                        {mentor.name}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {mentor.matchScore}% Match
                      </Badge>
                    </div>
                    <p className="text-xs text-brand-muted truncate">{mentor.title}</p>
                    <div className="flex gap-1 mt-1">
                      {mentor.skills.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-[10px] px-1.5 py-0">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
