'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  FileText,
  GraduationCap,
  MessageSquare,
  Plus,
  Settings,
  Upload,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

// ============================================================================
// QUICK ACTIONS DATA
// ============================================================================

const quickActions: QuickAction[] = [
  {
    id: 'create-course',
    title: 'Create Course',
    description: 'Build a new course from scratch',
    icon: <Plus className="h-5 w-5" />,
    href: '/ignite/courses/new',
    color: 'var(--color-lxd-primary)',
  },
  {
    id: 'upload-scorm',
    title: 'Upload SCORM',
    description: 'Import SCORM/xAPI packages',
    icon: <Upload className="h-5 w-5" />,
    href: '/ignite/courses/upload',
    color: 'var(--color-neural-purple)',
  },
  {
    id: 'manage-learners',
    title: 'Manage Learners',
    description: 'View and organize learners',
    icon: <Users className="h-5 w-5" />,
    href: '/ignite/learners',
    color: 'var(--color-lxd-secondary)',
  },
  {
    id: 'view-analytics',
    title: 'View Analytics',
    description: 'Course performance insights',
    icon: <BarChart3 className="h-5 w-5" />,
    href: '/ignite/analytics',
    color: 'var(--color-lxd-success)',
  },
  {
    id: 'generate-report',
    title: 'Generate Report',
    description: 'Create custom reports',
    icon: <FileText className="h-5 w-5" />,
    href: '/ignite/reports',
    color: 'var(--color-lxd-caution)',
  },
  {
    id: 'grade-assessments',
    title: 'Grade Assessments',
    description: 'Review pending submissions',
    icon: <GraduationCap className="h-5 w-5" />,
    href: '/ignite/gradebook',
    color: 'var(--color-neural-cyan)',
  },
  {
    id: 'send-message',
    title: 'Send Announcement',
    description: 'Message your learners',
    icon: <MessageSquare className="h-5 w-5" />,
    href: '/ignite/messages',
    color: 'var(--color-lxd-warning)',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure preferences',
    icon: <Settings className="h-5 w-5" />,
    href: '/ignite/settings',
    color: 'var(--color-muted-foreground)',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface QuickActionsGridProps {
  actions?: QuickAction[];
}

export function QuickActionsGrid({ actions = quickActions }: QuickActionsGridProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Common tasks at your fingertips</p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={action.href}
                className={cn(
                  'flex flex-col items-center p-4 rounded-xl',
                  'bg-muted/30 hover:bg-muted/50',
                  'border border-transparent hover:border-border/50',
                  'transition-all duration-200 group',
                  'hover:shadow-[0_0_20px_rgba(0,114,245,0.08)]',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-xl mb-3',
                    'transition-transform duration-200 group-hover:scale-110',
                  )}
                  style={{
                    backgroundColor: `color-mix(in srgb, ${action.color} 15%, transparent)`,
                    color: action.color,
                  }}
                >
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-foreground text-center">
                  {action.title}
                </span>
                <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                  {action.description}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuickActionsGrid;
