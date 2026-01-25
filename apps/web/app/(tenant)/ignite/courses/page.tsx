'use client';

import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  type CourseStatus,
  CoursesTable,
  type InstructorCourse,
} from '@/components/ignite/dashboard/CoursesTable';
import { StatsCards } from '@/components/ignite/dashboard/StatsCards';
import CreateCourseModal from '@/components/ignite/teach/CreateCourseModal';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

const log = logger.scope('CoursesPage');

interface ApiCourse {
  id: string;
  title: string;
  description?: string;
  type?: string;
  status?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
}

function mapApiCourseToInstructorCourse(apiCourse: ApiCourse): InstructorCourse {
  const statusMap: Record<string, CourseStatus> = {
    published: 'published',
    draft: 'draft',
    archived: 'archived',
    'in-review': 'in-review',
  };

  return {
    id: apiCourse.id,
    title: apiCourse.title,
    status: statusMap[apiCourse.status || 'draft'] || 'draft',
    enrolledCount: 0,
    completionRate: 0,
    avgScore: 0,
    lastUpdated: apiCourse.updatedAt || apiCourse.createdAt || new Date().toISOString(),
  };
}

export default function CoursesPage() {
  const { user } = useSafeAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiCourses, setApiCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Transform API courses to InstructorCourse format
  const courses = useMemo(() => apiCourses.map(mapApiCourseToInstructorCourse), [apiCourses]);

  // Fetch courses data
  useEffect(() => {
    async function fetchCourses() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/ignite/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.courses) setApiCourses(data.courses);
      } catch (e) {
        log.error('Failed to fetch courses', e);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, [user]);

  const handleRefresh = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/ignite/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.courses) setApiCourses(data.courses);
    } catch (e) {
      log.error('Failed to refresh courses', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-lxd-primary)] border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Course Management</h1>
          <p className="text-muted-foreground mt-1">Monitor, update, and deploy your curriculum.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            aria-label="Refresh courses"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Course
          </Button>
        </div>
      </motion.div>

      {/* STATS ROW */}
      <StatsCards totalCourses={courses.length} activeStudents={124} storageUsed="450MB" />

      {/* DATA TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <CoursesTable courses={courses} />
      </motion.div>

      <CreateCourseModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
