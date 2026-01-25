'use client';

export const dynamic = 'force-dynamic';

import { ArrowLeft, Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { CoursePlayer } from '@/components/ignite/player';
import { Button } from '@/components/ui/button';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

/**
 * SCORM Course Player Page
 *
 * Fetches course data with RBAC enforcement and renders
 * the CoursePlayer component for SCORM/xAPI content.
 */

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  scormPackagePath: string | null;
  tenantId: string;
}

export default function SCORMCoursePlayerPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { user, persona } = useSafeAuth();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/ignite/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError('Course not found');
          } else if (res.status === 403) {
            setError('You are not enrolled in this course');
          } else {
            setError('Failed to load course');
          }
          return;
        }

        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error('Error loading course:', err);
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId, user]);

  // Build the launch URL from scormPackagePath
  const getLaunchUrl = (path: string | null): string | null => {
    if (!path) return null;
    // The scormPackagePath points to the unzipped package folder
    // The entry point is typically index.html
    return `${path}/index.html`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-lxd-primary)]" />
          <p className="text-white/70">Loading course...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <Play className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{error || 'Course not found'}</h1>
            <p className="mt-2 text-white/60">
              {error === 'You are not enrolled in this course'
                ? 'Please contact your administrator to request access.'
                : "The course you're looking for doesn't exist or you don't have access."}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/ignite/learn">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Learning Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check if this is a SCORM course
  const launchUrl = getLaunchUrl(course.scormPackagePath);

  if (!launchUrl) {
    // Not a SCORM course - redirect to native player
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="rounded-full bg-amber-500/10 p-4">
            <Play className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Content Not Available</h1>
            <p className="mt-2 text-white/60">This course doesn't have SCORM content configured.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/ignite/learn">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/ignite/learn/player/${courseId}`}>Try Native Player</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render the CoursePlayer
  return (
    <CoursePlayer
      courseId={course.id}
      launchUrl={launchUrl}
      title={course.title}
      description={course.description ?? undefined}
      learnerName={user?.displayName || 'Learner'}
      learnerEmail={user?.email || ''}
      tenantId={course.tenantId}
      showCoach={persona !== 'learner'} // Show coach for admin personas previewing
      onComplete={(_passed, _score) => {
        // Could trigger a completion toast or redirect here
      }}
      onProgress={(_progress) => {
        // Progress tracking - could update UI or save to backend
      }}
    />
  );
}
