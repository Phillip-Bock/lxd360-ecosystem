'use client';

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Compass,
  Eye,
  FileText,
  Flame,
  HelpCircle,
  Layers,
  LayoutTemplate,
  type LucideIcon,
  MoreHorizontal,
  Play,
  Plus,
  Puzzle,
  Rocket,
  Target,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Quick Action Card Component
interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: string;
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  color,
}: QuickActionCardProps): React.JSX.Element {
  return (
    <Link
      href={href}
      className="group p-5 bg-card border border-border rounded-xl hover:border-(--primary)/50 transition-all duration-300 hover:shadow-lg"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="font-semibold text-foreground mb-1 group-hover:text-(--primary) transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

// Project Card Component
interface ProjectCardProps {
  id: string;
  title: string;
  type: 'course' | 'module' | 'micro';
  progress: number;
  dueDate?: string;
  collaborators: number;
  lastActivity: string;
  status: 'draft' | 'in-progress' | 'review' | 'published';
}

function ProjectCard({
  id,
  title,
  type,
  progress,
  dueDate,
  collaborators,
  lastActivity,
  status,
}: ProjectCardProps): React.JSX.Element {
  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    'in-progress': 'bg-brand-primary/10 text-brand-blue',
    review: 'bg-brand-warning/10 text-amber-500',
    published: 'bg-brand-success/10 text-brand-success',
  };

  const typeIcons = {
    course: BookOpen,
    module: Layers,
    micro: Zap,
  };

  const TypeIcon = typeIcons[type];

  return (
    <Link
      href={`/inspire-studio-app/course-builder/${id}`}
      className="group p-4 bg-card border border-border rounded-xl hover:border-(--primary)/50 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-(--primary)/10 flex items-center justify-center">
            <TypeIcon className="w-5 h-5 text-(--primary)" />
          </div>
          <div>
            <h4 className="font-medium text-foreground line-clamp-1 group-hover:text-(--primary) transition-colors">
              {title}
            </h4>
            <span
              className={cn('text-xs px-2 py-0.5 rounded-full capitalize', statusColors[status])}
            >
              {status.replace('-', ' ')}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="p-1 text-muted-foreground hover:text-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            // Show options menu
          }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-medium">{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-(--primary) rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {dueDate}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {collaborators}
          </span>
        </div>
        <span>{lastActivity}</span>
      </div>
    </Link>
  );
}

// Task Item Component
interface TaskItemProps {
  id: string;
  title: string;
  projectName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completed?: boolean;
  onToggle?: () => void;
}

function TaskItem({
  id,
  title,
  projectName,
  priority,
  dueDate,
  completed,
  onToggle,
}: TaskItemProps): React.JSX.Element {
  void id;
  const priorityColors = {
    low: 'bg-slate-400',
    medium: 'bg-brand-primary',
    high: 'bg-brand-warning',
    urgent: 'bg-brand-error',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
          completed
            ? 'bg-brand-success border-brand-success text-brand-primary'
            : 'border-border hover:border-(--primary)',
        )}
      >
        {completed && <CheckCircle className="w-3 h-3" />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium truncate',
            completed && 'text-muted-foreground line-through',
          )}
        >
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{projectName}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className={cn('w-2 h-2 rounded-full', priorityColors[priority])} />
        {dueDate && <span className="text-xs text-muted-foreground">{dueDate}</span>}
      </div>
    </div>
  );
}

// Activity Item Component
interface ActivityItemProps {
  avatar: string;
  name: string;
  action: string;
  target: string;
  time: string;
}

function ActivityItem({
  avatar,
  name,
  action,
  target,
  time,
}: ActivityItemProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-(--primary) flex items-center justify-center text-xs font-medium text-brand-primary">
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium text-foreground">{name}</span>{' '}
          <span className="text-muted-foreground">{action}</span>{' '}
          <span className="font-medium text-foreground">{target}</span>
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

// Mock data
const MOCK_PROJECTS: ProjectCardProps[] = [
  {
    id: '1',
    title: 'HIPAA Compliance Training',
    type: 'course',
    progress: 68,
    dueDate: 'Dec 15',
    collaborators: 3,
    lastActivity: '2h ago',
    status: 'in-progress',
  },
  {
    id: '2',
    title: 'Onboarding Module',
    type: 'module',
    progress: 95,
    dueDate: 'Dec 10',
    collaborators: 2,
    lastActivity: '1d ago',
    status: 'review',
  },
  {
    id: '3',
    title: 'Security Quick Tips',
    type: 'micro',
    progress: 45,
    collaborators: 1,
    lastActivity: '3h ago',
    status: 'draft',
  },
  {
    id: '4',
    title: 'Leadership Essentials',
    type: 'course',
    progress: 100,
    collaborators: 4,
    lastActivity: '1w ago',
    status: 'published',
  },
];

const MOCK_TASKS: TaskItemProps[] = [
  {
    id: '1',
    title: 'Write Module 3 introduction',
    projectName: 'HIPAA Compliance Training',
    priority: 'high',
    dueDate: 'Today',
  },
  {
    id: '2',
    title: 'Review accessibility compliance',
    projectName: 'Onboarding Module',
    priority: 'medium',
    dueDate: 'Tomorrow',
  },
  {
    id: '3',
    title: 'Record video narration',
    projectName: 'HIPAA Compliance Training',
    priority: 'high',
    dueDate: 'Dec 10',
  },
  {
    id: '4',
    title: 'Create quiz questions',
    projectName: 'Security Quick Tips',
    priority: 'medium',
    dueDate: 'Dec 12',
  },
  {
    id: '5',
    title: 'Add interactive scenarios',
    projectName: 'Leadership Essentials',
    priority: 'low',
  },
];

const MOCK_ACTIVITIES: ActivityItemProps[] = [
  {
    avatar: 'EB',
    name: 'Erin B.',
    action: 'completed review of',
    target: 'Module 2 Quiz',
    time: '10 min ago',
  },
  {
    avatar: 'JD',
    name: 'John D.',
    action: 'added content to',
    target: 'Security Awareness',
    time: '1 hour ago',
  },
  {
    avatar: 'SM',
    name: 'Sarah M.',
    action: 'published',
    target: 'Leadership Essentials',
    time: '3 hours ago',
  },
];

const INSPIRE_TIPS = [
  {
    stage: 'ignite',
    icon: Flame,
    color: '#f97316',
    title: 'Ignite Stage Tip',
    content:
      'Start with a thought-provoking question or surprising statistic to capture attention in the first 30 seconds.',
  },
  {
    stage: 'navigate',
    icon: Compass,
    color: '#3b82f6',
    title: 'Navigate Stage Tip',
    content:
      'Always show learners where they are in the course journey. Progress indicators reduce cognitive load.',
  },
  {
    stage: 'scaffold',
    icon: Layers,
    color: '#a855f7',
    title: 'Scaffold Stage Tip',
    content:
      'Connect new concepts to what learners already know. Analogies and metaphors create lasting mental models.',
  },
  {
    stage: 'practice',
    icon: Target,
    color: '#22c55e',
    title: 'Practice Stage Tip',
    content:
      'Provide immediate, specific feedback on practice activities. Learning happens in the feedback loop.',
  },
  {
    stage: 'integrate',
    icon: Puzzle,
    color: '#06b6d4',
    title: 'Integrate Stage Tip',
    content:
      'Use real-world scenarios to help learners connect concepts. Application builds deeper understanding.',
  },
  {
    stage: 'reflect',
    icon: Eye,
    color: '#ec4899',
    title: 'Reflect Stage Tip',
    content:
      'Ask learners to identify what they learned and what they still need to work on. Metacognition strengthens retention.',
  },
  {
    stage: 'extend',
    icon: Rocket,
    color: '#f59e0b',
    title: 'Extend Stage Tip',
    content:
      'Provide job aids and action plans learners can take back to their work. Learning transfer is the ultimate goal.',
  },
];

export default function InspireStudioDashboard(): React.JSX.Element {
  const [tasks, setTasks] = useState(MOCK_TASKS);

  // Get random INSPIRE tip
  const todayTip = INSPIRE_TIPS[new Date().getDay() % INSPIRE_TIPS.length];
  const TipIcon = todayTip.icon;

  // Calculate AI token usage
  const tokenUsage = {
    used: 162500,
    limit: 250000,
    percentage: 65,
  };

  const toggleTask = (taskId: string): void => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, Phillip</h1>
            <p className="text-muted-foreground mt-1">
              Continue creating amazing learning experiences
            </p>
          </div>
          <Link
            href="/inspire-studio-app/course-builder"
            className="button-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Course</span>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <QuickActionCard
                  icon={Plus}
                  title="New Course"
                  description="Start from scratch"
                  href="/inspire-studio-app/course-builder"
                  color="var(--brand-primary-hover)"
                />
                <QuickActionCard
                  icon={LayoutTemplate}
                  title="Templates"
                  description="Start with a template"
                  href="/inspire-studio-app/templates/all"
                  color="var(--brand-secondary)"
                />
                <QuickActionCard
                  icon={Zap}
                  title="AI Generate"
                  description="Create with AI"
                  href="/inspire-studio-app/ai-studio"
                  color="#f59e0b"
                />
              </div>
            </motion.div>

            {/* Recent Projects */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
                <Link
                  href="/inspire-studio-app/projects/all"
                  className="text-(--primary) text-sm hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {MOCK_PROJECTS.map((project) => (
                  <ProjectCard key={project.id} {...project} />
                ))}
              </div>
            </motion.section>

            {/* My Tasks */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">My Tasks</h2>
                <span className="text-muted-foreground text-sm">
                  {tasks.filter((t) => !t.completed).length} pending
                </span>
              </div>
              <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
                {tasks.slice(0, 5).map((task) => (
                  <TaskItem key={task.id} {...task} onToggle={() => toggleTask(task.id)} />
                ))}
              </div>
              <div className="mt-3 text-center">
                <Link
                  href="/inspire-studio-app/todo-list"
                  className="text-sm text-(--primary) hover:underline"
                >
                  View all tasks
                </Link>
              </div>
            </motion.section>

            {/* Creation Stats */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <div className="p-4 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-brand-blue" />
                  <span className="text-sm text-muted-foreground">Courses</span>
                </div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-xs text-brand-success">+2 this month</p>
              </div>
              <div className="p-4 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-brand-purple" />
                  <span className="text-sm text-muted-foreground">Lessons</span>
                </div>
                <p className="text-2xl font-bold text-foreground">87</p>
                <p className="text-xs text-brand-success">+15 this month</p>
              </div>
              <div className="p-4 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-muted-foreground">Videos</span>
                </div>
                <p className="text-2xl font-bold text-foreground">34</p>
                <p className="text-xs text-muted-foreground">23 hours total</p>
              </div>
              <div className="p-4 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-brand-success" />
                  <span className="text-sm text-muted-foreground">Quizzes</span>
                </div>
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
            </motion.section>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* AI Token Usage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground">AI Tokens</h3>
                <Link
                  href="/inspire-studio-app/settings"
                  className="text-xs text-(--primary) hover:underline"
                >
                  Manage
                </Link>
              </div>
              <div className="relative h-2 bg-muted rounded-full mb-2 overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-linear-to-r from-(--brand-primary-hover) to-(--brand-secondary) rounded-full transition-all"
                  style={{ width: `${tokenUsage.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {tokenUsage.used.toLocaleString()} / {tokenUsage.limit.toLocaleString()}
                </span>
                <span className="text-(--primary)">{tokenUsage.percentage}%</span>
              </div>
              <p className="text-muted-foreground text-xs mt-2">Resets in 12 days</p>
            </motion.div>

            {/* INSPIRE Tip of the Day */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-linear-to-br from-(--primary)/10 to-(--lxd-purple)/10 border border-(--primary)/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${todayTip.color}20` }}
                >
                  <TipIcon className="w-4 h-4" style={{ color: todayTip.color }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">INSPIRE Tip</p>
                  <h3 className="font-medium text-foreground text-sm">{todayTip.title}</h3>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-3">{todayTip.content}</p>
              <Link
                href="/inspire-studio-app/inspire"
                className="text-(--primary) text-sm hover:underline inline-flex items-center gap-1"
              >
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Team Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground">Team Activity</h3>
                <Link
                  href="/inspire-studio-app/projects/all"
                  className="text-xs text-(--primary) hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {MOCK_ACTIVITIES.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h3 className="font-medium text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href="/inspire-studio-app/storyboard/course"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <Play className="w-4 h-4 text-muted-foreground group-hover:text-(--primary)" />
                  <span className="text-sm text-foreground">Storyboard Builder</span>
                </Link>
                <Link
                  href="/inspire-studio-app/media-tools"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <Video className="w-4 h-4 text-muted-foreground group-hover:text-(--primary)" />
                  <span className="text-sm text-foreground">Media Tools</span>
                </Link>
                <Link
                  href="/inspire-studio-app/question-banks/all"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-(--primary)" />
                  <span className="text-sm text-foreground">Question Banks</span>
                </Link>
                <Link
                  href="/inspire-studio-app/review"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <Eye className="w-4 h-4 text-muted-foreground group-hover:text-(--primary)" />
                  <span className="text-sm text-foreground">Review Center</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
