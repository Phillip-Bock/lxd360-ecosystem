'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  FileSpreadsheet,
  Mail,
  Settings,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** Quick action item */
export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  variant?: 'default' | 'primary' | 'secondary';
}

export interface QuickActionsProps {
  /** Custom actions (overrides defaults) */
  actions?: QuickActionItem[];
  /** Optional className for styling */
  className?: string;
}

// Default manager quick actions
const DEFAULT_ACTIONS: QuickActionItem[] = [
  {
    id: 'add-member',
    label: 'Add Team Member',
    description: 'Invite new learners',
    icon: UserPlus,
    href: '/ignite/manage/users',
    variant: 'primary',
  },
  {
    id: 'assign-courses',
    label: 'Assign Courses',
    description: 'Enroll team in training',
    icon: BookOpen,
    href: '/ignite/manage/assignments',
  },
  {
    id: 'view-team',
    label: 'View Team',
    description: 'Manage team members',
    icon: Users,
    href: '/ignite/manage/users',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    description: 'Check compliance status',
    icon: Shield,
    href: '/ignite/manage/compliance',
  },
  {
    id: 'reports',
    label: 'Generate Report',
    description: 'Export team data',
    icon: FileSpreadsheet,
    href: '/ignite/manage/reports',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'View performance metrics',
    icon: BarChart3,
    href: '/ignite/manage/analytics',
  },
  {
    id: 'send-reminder',
    label: 'Send Reminders',
    description: 'Notify team members',
    icon: Mail,
    href: '/ignite/manage/users',
  },
  {
    id: 'settings',
    label: 'Team Settings',
    description: 'Configure preferences',
    icon: Settings,
    href: '/ignite/manage/settings',
  },
];

/**
 * QuickActions - Grid of common manager actions
 *
 * Provides quick access to frequently used features
 */
export function QuickActions({ actions = DEFAULT_ACTIONS, className }: QuickActionsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Card className={cn('bg-card/60 backdrop-blur-sm', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <motion.div key={action.id} variants={itemVariants}>
                <Link
                  href={action.href}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all group',
                    'hover:border-[var(--color-lxd-primary)]/30 hover:bg-[var(--color-lxd-primary)]/5',
                    action.variant === 'primary'
                      ? 'border-[var(--color-lxd-primary)]/20 bg-[var(--color-lxd-primary)]/5'
                      : 'border-border/50 bg-muted/30',
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-lg transition-all',
                      'group-hover:scale-110',
                      action.variant === 'primary'
                        ? 'bg-[var(--color-lxd-primary)]/20 text-[var(--color-lxd-primary)]'
                        : 'bg-muted text-muted-foreground group-hover:bg-[var(--color-lxd-primary)]/10 group-hover:text-[var(--color-lxd-primary)]',
                    )}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
