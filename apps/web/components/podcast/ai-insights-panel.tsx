'use client';

import { BookOpen, Clock, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AIInsightsPanelProps {
  className?: string;
}

export function AIInsightsPanel({ className }: AIInsightsPanelProps) {
  const learningStats = [
    {
      icon: Clock,
      label: 'Total Listening Time',
      value: '24.5 hours',
      change: '+3.2h this week',
    },
    {
      icon: BookOpen,
      label: 'Topics Explored',
      value: '12 topics',
      change: '+2 this week',
    },
    {
      icon: Target,
      label: 'Goals Completed',
      value: '8 of 10',
      change: '80% complete',
    },
    {
      icon: TrendingUp,
      label: 'Learning Streak',
      value: '15 days',
      change: 'Best: 22 days',
    },
  ];

  const skillProgress = [
    { skill: 'AI & Machine Learning', progress: 85, level: 'Advanced' },
    { skill: 'Instructional Design', progress: 72, level: 'Intermediate' },
    { skill: 'Learning Science', progress: 68, level: 'Intermediate' },
    { skill: 'EdTech Tools', progress: 45, level: 'Beginner' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Learning Stats Card */}
      <Card className="bg-[var(--brand-surface)]/50 backdrop-blur-xs border-[var(--brand-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--brand-text-primary)]">
            <Sparkles className="text-[var(--brand-primary)]" size={20} />
            AI Learning Insights
          </CardTitle>
          <CardDescription className="text-[var(--brand-text-secondary)]">
            Personalized recommendations based on your listening journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-[var(--brand-accent)]/10"
              >
                <div className="p-2 rounded-lg bg-[var(--brand-primary)]/20">
                  <stat.icon size={20} className="text-[var(--brand-primary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--brand-text-muted)]">{stat.label}</p>
                  <p className="text-xl font-semibold text-[var(--brand-text-primary)]">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[var(--brand-text-muted)] mt-1">{stat.change}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Progress Card */}
      <Card className="bg-[var(--brand-surface)]/50 backdrop-blur-xs border-[var(--brand-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--brand-text-primary)]">Skill Progress Tracker</CardTitle>
          <CardDescription className="text-[var(--brand-text-secondary)]">
            Track your expertise across L&D domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillProgress.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--brand-text-primary)]">
                    {item.skill}
                  </span>
                  <span className="text-xs text-[var(--brand-text-muted)]">{item.level}</span>
                </div>
                <Progress value={item.progress} className="h-2" />
                <p className="text-xs text-[var(--brand-text-muted)] mt-1">
                  {item.progress}% mastered
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Next Steps Card */}
      <Card className="bg-[var(--brand-surface)]/50 backdrop-blur-xs border-[var(--brand-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--brand-text-primary)]">Recommended Next Steps</CardTitle>
          <CardDescription className="text-[var(--brand-text-secondary)]">
            AI-curated episodes to accelerate your learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 p-3 rounded-lg bg-[var(--brand-accent)]/10 hover:bg-[var(--brand-accent)]/20 transition-colors cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] mt-1.5"></div>
              <div>
                <p className="font-medium text-sm text-[var(--brand-text-primary)]">
                  Deep Learning for L&D
                </p>
                <p className="text-xs text-[var(--brand-text-muted)]">
                  Next in your AI learning path
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-[var(--brand-accent)]/10 hover:bg-[var(--brand-accent)]/20 transition-colors cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] mt-1.5"></div>
              <div>
                <p className="font-medium text-sm text-[var(--brand-text-primary)]">
                  xAPI & Learning Analytics
                </p>
                <p className="text-xs text-[var(--brand-text-muted)]">
                  Complements your tech knowledge
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-[var(--brand-accent)]/10 hover:bg-[var(--brand-accent)]/20 transition-colors cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] mt-1.5"></div>
              <div>
                <p className="font-medium text-sm text-[var(--brand-text-primary)]">
                  Accessibility Best Practices
                </p>
                <p className="text-xs text-[var(--brand-text-muted)]">Expand your design toolkit</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
