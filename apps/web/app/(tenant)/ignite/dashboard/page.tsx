'use client';

import { motion } from 'framer-motion';
import { CoursesTable } from '@/components/ignite/dashboard/CoursesTable';
import { QuickActionsGrid } from '@/components/ignite/dashboard/QuickActionsGrid';
import { RecentActivityFeed } from '@/components/ignite/dashboard/RecentActivityFeed';
import { Stats04 } from '@/components/ignite/dashboard/StatsWidgets';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function DashboardPage() {
  const { user } = useSafeAuth();

  // Get display name or fallback
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'there';

  return (
    <motion.div
      className="space-y-8 max-w-7xl mx-auto"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your curriculum performance and learner engagement.
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeInUp}>
        <Stats04 />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses Table - 2 columns */}
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <CoursesTable />
        </motion.div>

        {/* Activity Feed - 1 column */}
        <motion.div variants={fadeInUp}>
          <RecentActivityFeed />
        </motion.div>
      </div>

      {/* Quick Actions Grid */}
      <motion.div variants={fadeInUp}>
        <QuickActionsGrid />
      </motion.div>
    </motion.div>
  );
}
