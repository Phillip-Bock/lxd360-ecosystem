'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  MessageSquare,
  Settings,
  Upload,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GridItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
}

const gridItems: GridItem[] = [
  {
    title: 'Create New Course',
    description: 'Upload SCORM packages or build from scratch',
    href: '/ignite/courses',
    icon: Upload,
    color: 'blue',
    badge: 'Quick Start',
  },
  {
    title: 'Manage Courses',
    description: 'Edit, publish, or archive your curriculum',
    href: '/ignite/courses',
    icon: BookOpen,
    color: 'green',
  },
  {
    title: 'View Learners',
    description: 'Track enrollment and student progress',
    href: '/ignite/learners',
    icon: Users,
    color: 'purple',
  },
  {
    title: 'Gradebook',
    description: 'Review scores and assessments',
    href: '/ignite/gradebook',
    icon: GraduationCap,
    color: 'amber',
  },
  {
    title: 'Analytics Dashboard',
    description: 'Insights into course performance',
    href: '/ignite/analytics',
    icon: BarChart3,
    color: 'cyan',
  },
  {
    title: 'Generate Reports',
    description: 'Export completion and compliance data',
    href: '/ignite/analytics',
    icon: FileText,
    color: 'pink',
  },
  {
    title: 'Discussion Forums',
    description: 'Engage with your learners',
    href: '/ignite/settings',
    icon: MessageSquare,
    color: 'orange',
    badge: 'Coming Soon',
  },
  {
    title: 'Settings',
    description: 'Configure your instructor profile',
    href: '/ignite/settings',
    icon: Settings,
    color: 'gray',
  },
];

const colorStyles: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  blue: {
    bg: 'bg-blue-600/10',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    icon: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  green: {
    bg: 'bg-green-600/10',
    border: 'border-green-500/20 hover:border-green-500/40',
    icon: 'text-green-400',
    badge: 'bg-green-500/20 text-green-300',
  },
  purple: {
    bg: 'bg-purple-600/10',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    icon: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300',
  },
  amber: {
    bg: 'bg-amber-600/10',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    icon: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300',
  },
  cyan: {
    bg: 'bg-cyan-600/10',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    icon: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300',
  },
  pink: {
    bg: 'bg-pink-600/10',
    border: 'border-pink-500/20 hover:border-pink-500/40',
    icon: 'text-pink-400',
    badge: 'bg-pink-500/20 text-pink-300',
  },
  orange: {
    bg: 'bg-orange-600/10',
    border: 'border-orange-500/20 hover:border-orange-500/40',
    icon: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-300',
  },
  gray: {
    bg: 'bg-gray-600/10',
    border: 'border-gray-500/20 hover:border-gray-500/40',
    icon: 'text-gray-400',
    badge: 'bg-gray-500/20 text-gray-300',
  },
};

export function GridList03() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Getting Started</h2>
        <p className="text-sm text-gray-400">Quick access to common instructor tasks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gridItems.map((item, index) => {
          const colors = colorStyles[item.color] || colorStyles.gray;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'block p-4 rounded-xl border transition-all duration-300 group h-full',
                  'bg-gray-900/40 hover:bg-gray-900/60',
                  colors.border,
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      colors.bg,
                    )}
                  >
                    <item.icon className={cn('h-5 w-5', colors.icon)} />
                  </div>
                  {item.badge && (
                    <span
                      className={cn('text-xs px-2 py-0.5 rounded-full font-medium', colors.badge)}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-white font-medium text-sm mb-1 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default GridList03;
