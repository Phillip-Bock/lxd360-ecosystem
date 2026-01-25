'use client';

export const dynamic = 'force-dynamic';

import { Award, BookOpen, Calendar, Clock, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Mock progress data - TODO(LXD-301): Replace with Firestore queries
const progressData = {
  overall: {
    coursesCompleted: 8,
    coursesInProgress: 3,
    totalCourses: 15,
    hoursLearned: 42,
    streakDays: 12,
    masteryScore: 78,
  },
  skills: [
    { name: 'Leadership', mastery: 85, trend: 'up' },
    { name: 'Communication', mastery: 72, trend: 'up' },
    { name: 'Data Analytics', mastery: 65, trend: 'stable' },
    { name: 'Project Management', mastery: 58, trend: 'up' },
    { name: 'Compliance', mastery: 90, trend: 'stable' },
  ],
  recentActivity: [
    {
      id: '1',
      type: 'completed',
      title: 'Workplace Safety Fundamentals',
      date: '2024-01-15',
      score: 95,
    },
    {
      id: '2',
      type: 'progress',
      title: 'Advanced Leadership Skills',
      date: '2024-01-14',
      progress: 75,
    },
    {
      id: '3',
      type: 'started',
      title: 'Data Analytics Essentials',
      date: '2024-01-13',
    },
    {
      id: '4',
      type: 'badge',
      title: 'Quick Learner Badge',
      date: '2024-01-12',
    },
  ],
  weeklyGoal: {
    target: 5,
    completed: 3,
    unit: 'hours',
  },
};

/**
 * Progress Overview page - Track learning journey and skill mastery
 */
export default function ProgressPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">My Progress</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning journey and skill development
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={BookOpen}
          label="Courses Completed"
          value={progressData.overall.coursesCompleted}
          subtext={`of ${progressData.overall.totalCourses}`}
        />
        <StatCard
          icon={Target}
          label="In Progress"
          value={progressData.overall.coursesInProgress}
          subtext="active courses"
        />
        <StatCard
          icon={Clock}
          label="Hours Learned"
          value={progressData.overall.hoursLearned}
          subtext="total time"
        />
        <StatCard
          icon={Calendar}
          label="Learning Streak"
          value={progressData.overall.streakDays}
          subtext="days"
        />
        <StatCard
          icon={TrendingUp}
          label="Mastery Score"
          value={`${progressData.overall.masteryScore}%`}
          subtext="average"
        />
        <StatCard
          icon={Award}
          label="Weekly Goal"
          value={`${progressData.weeklyGoal.completed}/${progressData.weeklyGoal.target}`}
          subtext={progressData.weeklyGoal.unit}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Mastery */}
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary">Skills Mastery</CardTitle>
            <CardDescription>Your proficiency levels across different skill areas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressData.skills.map((skill) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-primary">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{skill.mastery}%</span>
                    {skill.trend === 'up' && (
                      <TrendingUp className="w-4 h-4 text-green-500" aria-label="Trending up" />
                    )}
                  </div>
                </div>
                <Progress value={skill.mastery} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary">Recent Activity</CardTitle>
            <CardDescription>Your latest learning milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">Weekly Learning Goal</CardTitle>
          <CardDescription>
            {progressData.weeklyGoal.completed} of {progressData.weeklyGoal.target}{' '}
            {progressData.weeklyGoal.unit} completed this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress
            value={(progressData.weeklyGoal.completed / progressData.weeklyGoal.target) * 100}
            className="h-4"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {progressData.weeklyGoal.target - progressData.weeklyGoal.completed}{' '}
            {progressData.weeklyGoal.unit} remaining to reach your goal
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext: string;
}

function StatCard({ icon: Icon, label, value, subtext }: StatCardProps) {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-lxd-purple" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold text-brand-primary">{value}</p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  activity: {
    id: string;
    type: string;
    title: string;
    date: string;
    score?: number;
    progress?: number;
  };
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'completed':
        return <BookOpen className="w-4 h-4 text-green-500" aria-hidden="true" />;
      case 'progress':
        return <TrendingUp className="w-4 h-4 text-blue-500" aria-hidden="true" />;
      case 'started':
        return <Target className="w-4 h-4 text-yellow-500" aria-hidden="true" />;
      case 'badge':
        return <Award className="w-4 h-4 text-purple-500" aria-hidden="true" />;
      default:
        return <BookOpen className="w-4 h-4 text-muted-foreground" aria-hidden="true" />;
    }
  };

  const getActivityLabel = () => {
    switch (activity.type) {
      case 'completed':
        return `Completed with ${activity.score}%`;
      case 'progress':
        return `${activity.progress}% complete`;
      case 'started':
        return 'Started course';
      case 'badge':
        return 'Earned badge';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-lxd-dark-bg/50">
      <div className="mt-0.5">{getActivityIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-brand-primary truncate">{activity.title}</p>
        <p className="text-xs text-muted-foreground">{getActivityLabel()}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {new Date(activity.date).toLocaleDateString()}
      </span>
    </div>
  );
}
