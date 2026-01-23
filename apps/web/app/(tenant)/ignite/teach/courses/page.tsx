'use client';

import { BookOpen, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import CreateCourseModal from '@/components/ignite/teach/CreateCourseModal';
import { Button } from '@/components/ui/button';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

export default function CoursesPage() {
  const { user, loading } = useSafeAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses] = useState<unknown[]>([]);

  // TODO: Replace with real Firestore listener in next Strike
  // For now, we just want to fix the Create Flow.

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
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
              onClick={() => window.location.reload()}
              aria-label="Refresh courses"
              className="border-gray-700 hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Course
            </Button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="grid gap-4">
          {courses.length === 0 ? (
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gray-800 rounded-full">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-300">No courses found</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                Get started by creating your first course using the button above.
              </p>
              <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="mt-6 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Create Your First Course
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Course cards will go here */}
            </div>
          )}
        </div>
      </div>

      {/* THE MODAL - WIRED CORRECTLY */}
      <CreateCourseModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
