'use client';

import { Plus, RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';
import { CreateCourseModal } from '@/components/ignite/teach/CreateCourseModal';
import { Button } from '@/components/ui/button';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

export default function CoursesPage() {
  const { user, loading } = useSafeAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCourseCreated = useCallback((_courseId: string) => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-gray-400 mt-1">Manage your curriculum and learning paths.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setRefreshKey((prev) => prev + 1)}
              aria-label="Refresh courses"
              className="border-gray-700 hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-500 text-white"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Course
            </Button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid gap-4" key={refreshKey}>
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
            <h3 className="text-xl font-medium text-gray-300">No courses found</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              Get started by creating your first course using the button above. You can upload SCORM
              packages or build native content.
            </p>
            <Button
              type="button"
              className="mt-6 bg-white text-black hover:bg-gray-200"
              onClick={() => setIsModalOpen(true)}
            >
              Create Your First Course
            </Button>
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
      <CreateCourseModal
        tenantId="lxd360-dev"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  );
}
