'use client';

/**
 * MentorshipHubContent Component
 * ==============================
 * Central hub for all mentorship features.
 */

import {
  ArrowRight,
  Award,
  Calendar,
  Play,
  Search,
  Star,
  Target,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import Link from 'next/link';

interface MentorshipHubContentProps {
  userId: string;
}

// Mock data
const upcomingSessions = [
  {
    id: '1',
    mentorName: 'Dr. Emily Rodriguez',
    mentorAvatar: null,
    topic: 'Career Transition Strategy',
    date: 'Tomorrow',
    time: '2:00 PM EST',
    type: 'video',
  },
  {
    id: '2',
    mentorName: 'Marcus Johnson',
    mentorAvatar: null,
    topic: 'Portfolio Review',
    date: 'Dec 12',
    time: '11:00 AM EST',
    type: 'video',
  },
];

const currentGoals = [
  {
    id: '1',
    title: 'Complete Portfolio Redesign',
    progress: 75,
    dueDate: 'Dec 31',
  },
  {
    id: '2',
    title: 'Learn Articulate Storyline',
    progress: 40,
    dueDate: 'Jan 15',
  },
  {
    id: '3',
    title: 'Publish 5 Community Posts',
    progress: 60,
    dueDate: 'Dec 20',
  },
];

const recommendedMentors = [
  {
    id: '1',
    name: 'Lisa Wang',
    title: 'Learning Experience Designer',
    company: 'Apple',
    skills: ['Visual Design', 'Accessibility'],
    rating: 4.9,
    available: true,
  },
  {
    id: '2',
    name: 'James Park',
    title: 'Senior Instructional Designer',
    company: 'Google',
    skills: ['Technical Training', 'xAPI'],
    rating: 4.8,
    available: true,
  },
];

export function MentorshipHubContent({ userId }: MentorshipHubContentProps): React.JSX.Element {
  void userId; // Will be used when integrating real data
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Mentorship Hub</h1>
        <p className="text-gray-500">Connect with mentors and accelerate your growth</p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/nexus/mentorship/find-mentor"
          className="p-4 bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl hover:border-lxd-purple-light/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-lxd-purple-light/10 flex items-center justify-center mb-3 group-hover:bg-lxd-purple-light/20 transition-colors">
            <Search className="w-5 h-5 text-lxd-purple-light" />
          </div>
          <h3 className="font-semibold text-brand-primary mb-1">Find a Mentor</h3>
          <p className="text-sm text-gray-500">Browse available mentors</p>
        </Link>

        <Link
          href="/nexus/mentorship/sessions"
          className="p-4 bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl hover:border-studio-accent/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-studio-accent/10 flex items-center justify-center mb-3 group-hover:bg-studio-accent/20 transition-colors">
            <Calendar className="w-5 h-5 text-studio-accent" />
          </div>
          <h3 className="font-semibold text-brand-primary mb-1">My Sessions</h3>
          <p className="text-sm text-gray-500">View scheduled sessions</p>
        </Link>

        <Link
          href="/nexus/mentorship/goals"
          className="p-4 bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl hover:border-brand-success/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-brand-success/10 flex items-center justify-center mb-3 group-hover:bg-brand-success/20 transition-colors">
            <Target className="w-5 h-5 text-brand-success" />
          </div>
          <h3 className="font-semibold text-brand-primary mb-1">Track Goals</h3>
          <p className="text-sm text-gray-500">Monitor your progress</p>
        </Link>

        <Link
          href="/nexus/mentorship/my-mentors"
          className="p-4 bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl hover:border-amber-500/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-brand-warning/10 flex items-center justify-center mb-3 group-hover:bg-brand-warning/20 transition-colors">
            <Users className="w-5 h-5 text-brand-warning" />
          </div>
          <h3 className="font-semibold text-brand-primary mb-1">My Mentors</h3>
          <p className="text-sm text-gray-500">View your connections</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Sessions */}
          <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-brand-primary flex items-center gap-2">
                <Calendar className="w-5 h-5 text-studio-accent" />
                Upcoming Sessions
              </h2>
              <Link
                href="/nexus/mentorship/sessions"
                className="text-sm text-lxd-purple-light hover:underline"
              >
                View all
              </Link>
            </div>

            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-3 bg-studio-bg-dark rounded-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-lxd-purple-light to-studio-accent flex items-center justify-center shrink-0">
                      <span className="text-brand-primary font-semibold">
                        {session.mentorName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-brand-primary truncate">{session.topic}</h4>
                      <p className="text-sm text-gray-500">with {session.mentorName}</p>
                      <p className="text-xs text-gray-500">
                        {session.date} at {session.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="p-2 bg-studio-accent/10 text-studio-accent rounded-lg">
                        <Video className="w-4 h-4" />
                      </span>
                      <Link
                        href={`/nexus/mentorship/sessions/${session.id}`}
                        className="px-3 py-1.5 bg-lxd-purple-light hover:bg-lxd-purple-light text-brand-primary text-sm rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Join
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-500">No upcoming sessions</p>
                <Link
                  href="/nexus/mentorship/find-mentor"
                  className="inline-flex items-center gap-1 text-sm text-lxd-purple-light hover:underline mt-2"
                >
                  Find a mentor
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Goals Progress */}
          <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-brand-primary flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-success" />
                Current Goals
              </h2>
              <Link
                href="/nexus/mentorship/goals"
                className="text-sm text-lxd-purple-light hover:underline"
              >
                Manage goals
              </Link>
            </div>

            <div className="space-y-4">
              {currentGoals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-brand-primary">{goal.title}</h4>
                    <span className="text-xs text-gray-500">Due {goal.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-lxd-dark-surface-alt/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-lxd-purple-light to-studio-accent rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-brand-primary font-medium w-12 text-right">
                      {goal.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mentorship Stats */}
          <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-5">
            <h2 className="font-semibold text-brand-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-lxd-purple-light" />
              Your Mentorship Journey
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-studio-bg-dark rounded-lg">
                <p className="text-2xl font-bold text-lxd-purple-light">12</p>
                <p className="text-xs text-gray-500">Sessions Completed</p>
              </div>
              <div className="text-center p-3 bg-studio-bg-dark rounded-lg">
                <p className="text-2xl font-bold text-studio-accent">3</p>
                <p className="text-xs text-gray-500">Active Mentors</p>
              </div>
              <div className="text-center p-3 bg-studio-bg-dark rounded-lg">
                <p className="text-2xl font-bold text-brand-success">8</p>
                <p className="text-xs text-gray-500">Goals Achieved</p>
              </div>
              <div className="text-center p-3 bg-studio-bg-dark rounded-lg">
                <p className="text-2xl font-bold text-brand-warning">24h</p>
                <p className="text-xs text-gray-500">Learning Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recommended Mentors */}
          <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-4">
            <h3 className="font-semibold text-brand-primary mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-warning" />
              Recommended Mentors
            </h3>
            <div className="space-y-3">
              {recommendedMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex items-start gap-3 p-3 bg-studio-bg-dark rounded-lg"
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-lxd-purple-light to-studio-accent flex items-center justify-center">
                      <span className="text-brand-primary font-medium">
                        {mentor.name.charAt(0)}
                      </span>
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-studio-bg-dark ${
                        mentor.available ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-brand-primary text-sm">{mentor.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{mentor.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-0.5 text-xs text-brand-warning">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {mentor.rating}
                      </span>
                      <div className="flex gap-1">
                        {mentor.skills.slice(0, 1).map((skill) => (
                          <span
                            key={skill}
                            className="px-1.5 py-0.5 bg-lxd-purple-light/10 text-lxd-purple-light text-[10px] rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/nexus/mentorship/find-mentor"
              className="flex items-center justify-center gap-1 mt-4 text-sm text-lxd-purple-light hover:underline"
            >
              Browse all mentors
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Recent Achievements */}
          <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-4">
            <h3 className="font-semibold text-brand-primary mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-warning" />
              Recent Achievements
            </h3>
            <div className="space-y-3">
              {[
                { icon: '🎯', name: 'Goal Crusher', desc: 'Completed 5 goals' },
                { icon: '💬', name: 'Active Learner', desc: '10 sessions attended' },
                { icon: '⭐', name: 'Rising Star', desc: 'First month milestone' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-studio-bg-dark rounded-lg">
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <h4 className="text-sm font-medium text-brand-primary">{badge.name}</h4>
                    <p className="text-xs text-gray-500">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-linear-to-br from-lxd-purple-light/10 to-studio-accent/10 border border-lxd-purple-light/20 rounded-xl p-4">
            <h3 className="font-semibold text-brand-primary mb-2">Pro Tip</h3>
            <p className="text-sm text-studio-text">
              Prepare specific questions before your mentorship sessions to make the most of your
              time together.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
