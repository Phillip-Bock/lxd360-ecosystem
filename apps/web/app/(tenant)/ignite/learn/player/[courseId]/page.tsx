'use client';

export const dynamic = 'force-dynamic';

import { ArrowLeft, Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { PlayerShell } from '@/components/player';
import { Button } from '@/components/ui/button';
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import type { CourseWithContent } from '@/types/player';

/**
 * Course Player Entry page
 * Supports preview mode via ?mode=preview query param
 */
export default function CoursePlayerPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('mode') === 'preview';
  const { user } = useSafeAuth();

  const [course, setCourse] = useState<CourseWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/ignite/courses/${courseId}?include=content`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError('Course not found');
          } else {
            setError('Failed to load course');
          }
          return;
        }

        const data = await res.json();
        const now = new Date().toISOString();

        // Transform to CourseWithContent format
        // If no chapters exist, create a demo structure
        const courseData: CourseWithContent = {
          id: data.id || courseId,
          title: data.title || 'Untitled Course',
          description: data.description || null,
          thumbnail_url: data.thumbnail_url || null,
          total_slides: data.total_slides || 2,
          estimated_duration_minutes: data.estimated_duration_minutes || 5,
          scorm_version: data.scorm_version || null,
          xapi_enabled: data.xapi_enabled ?? true,
          is_published: data.is_published ?? true,
          published_at: data.published_at || null,
          designer_theme: data.designer_theme || null,
          created_at: data.created_at || now,
          updated_at: data.updated_at || now,
          chapters: data.chapters || [
            {
              id: 'chapter-1',
              course_id: courseId,
              title: 'Chapter 1: Introduction',
              description: null,
              sort_order: 0,
              created_at: now,
              slides: [
                {
                  id: 'slide-1',
                  course_id: courseId,
                  chapter_id: 'chapter-1',
                  title: 'Welcome',
                  content_type: 'slide' as const,
                  content_data: {
                    heading: `Welcome to ${data.title || 'this course'}`,
                    body: 'This is a preview of how the course will appear to learners.',
                  },
                  sort_order: 0,
                  duration_seconds: null,
                  created_at: now,
                  updated_at: now,
                },
                {
                  id: 'slide-2',
                  course_id: courseId,
                  chapter_id: 'chapter-1',
                  title: 'Overview',
                  content_type: 'slide' as const,
                  content_data: {
                    heading: 'Course Overview',
                    body: 'Course content will appear here once lessons are added.',
                  },
                  sort_order: 1,
                  duration_seconds: null,
                  created_at: now,
                  updated_at: now,
                },
              ],
            },
          ],
          glossary: data.glossary || [],
        };

        setCourse(courseData);
      } catch (err) {
        console.error('Error loading course:', err);
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId, user]);

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
              The course you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/ignite/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isPreview && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black text-center py-1 text-sm font-medium">
          Preview Mode — Changes won&apos;t affect learner progress
          <Link href="/ignite/courses" className="ml-4 underline hover:no-underline">
            Exit Preview
          </Link>
        </div>
      )}
      <div className={isPreview ? 'pt-7' : ''}>
        <PlayerShell course={course} isDemo={isPreview} userId={user?.uid} />
      </div>
    </>
  );
}
