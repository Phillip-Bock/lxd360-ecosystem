'use client';

/**
 * useCoursePlayer Hook
 * LXD-332: Manages course player state and navigation
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { requireDb } from '@/lib/firebase/client';
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import type { BlockInstance } from '@/types/blocks';
import type {
  CoursePlayerActions,
  CoursePlayerState,
  CourseProgress,
  LessonBookmark,
  PlayerCourse,
  PlayerLesson,
  PlayerModule,
  PlayerNavigation,
} from '@/types/player/course-player';

// Mock data for development - will be replaced with Firestore in production
const MOCK_BLOCKS: BlockInstance[] = [
  {
    id: 'block-1',
    type: 'paragraph',
    content: {
      text: 'Welcome to this lesson. In this section, we will explore the fundamental concepts that form the foundation of our topic.',
    },
    config: {
      alignment: 'left',
      size: 'normal',
      enableTTS: false,
      enableDyslexiaFont: false,
    },
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'block-2',
    type: 'image',
    content: {
      src: '/placeholder-course-image.jpg',
      alt: 'Course illustration showing key concepts',
      caption: 'Figure 1: Key concepts overview',
    },
    config: {
      sizing: 'contain',
      borderRadius: 'medium',
      enableZoom: true,
      captionPosition: 'below',
      lazyLoad: true,
    },
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'block-3',
    type: 'paragraph',
    content: {
      text: "Understanding these core principles will help you apply the knowledge in practical situations. Let's dive deeper into each concept.",
    },
    config: {
      alignment: 'left',
      size: 'normal',
      enableTTS: false,
      enableDyslexiaFont: false,
    },
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'block-4',
    type: 'accordion',
    content: {
      panels: [
        {
          id: 'panel-1',
          title: 'Key Concept 1: Foundation',
          content:
            'The foundation of any successful implementation starts with understanding the core principles. This includes proper planning, resource allocation, and stakeholder alignment.',
          defaultExpanded: true,
        },
        {
          id: 'panel-2',
          title: 'Key Concept 2: Implementation',
          content:
            'Implementation requires a methodical approach. Break down the task into manageable steps and ensure each step is completed before moving to the next.',
        },
        {
          id: 'panel-3',
          title: 'Key Concept 3: Evaluation',
          content:
            'Regular evaluation helps identify areas for improvement. Use metrics and feedback to measure success and make adjustments as needed.',
        },
      ],
    },
    config: {
      allowMultiple: false,
      variant: 'bordered',
      iconPosition: 'right',
      trackInteractions: true,
    },
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'block-5',
    type: 'quote',
    content: {
      text: 'The only way to do great work is to love what you do.',
      attribution: 'Steve Jobs',
    },
    config: {
      variant: 'bordered',
      showQuoteMarks: true,
      attributionPosition: 'below',
    },
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function generateMockCourse(courseId: string): PlayerCourse {
  const modules: PlayerModule[] = [
    {
      id: 'module-1',
      courseId,
      title: 'Getting Started',
      description: 'Introduction to the course fundamentals',
      order: 1,
      isLocked: false,
      completionPercentage: 0,
      lessons: [
        {
          id: 'lesson-1',
          moduleId: 'module-1',
          title: 'Welcome & Overview',
          description: 'Course introduction and objectives',
          order: 1,
          duration: 10,
          status: 'available',
          blocks: MOCK_BLOCKS,
          isRequired: true,
          xpReward: 50,
        },
        {
          id: 'lesson-2',
          moduleId: 'module-1',
          title: 'Core Concepts',
          description: 'Understanding the fundamentals',
          order: 2,
          duration: 15,
          status: 'locked',
          blocks: MOCK_BLOCKS,
          isRequired: true,
          xpReward: 75,
        },
        {
          id: 'lesson-3',
          moduleId: 'module-1',
          title: 'Hands-on Practice',
          description: 'Apply what you learned',
          order: 3,
          duration: 20,
          status: 'locked',
          blocks: MOCK_BLOCKS,
          isRequired: true,
          xpReward: 100,
        },
      ],
    },
    {
      id: 'module-2',
      courseId,
      title: 'Advanced Topics',
      description: 'Deep dive into advanced concepts',
      order: 2,
      isLocked: true,
      completionPercentage: 0,
      lessons: [
        {
          id: 'lesson-4',
          moduleId: 'module-2',
          title: 'Advanced Techniques',
          description: 'Master advanced methodologies',
          order: 1,
          duration: 25,
          status: 'locked',
          blocks: MOCK_BLOCKS,
          isRequired: true,
          xpReward: 150,
        },
        {
          id: 'lesson-5',
          moduleId: 'module-2',
          title: 'Best Practices',
          description: 'Industry best practices and patterns',
          order: 2,
          duration: 20,
          status: 'locked',
          blocks: MOCK_BLOCKS,
          isRequired: false,
          xpReward: 100,
        },
      ],
    },
  ];

  return {
    id: courseId,
    title: 'Introduction to Learning Experience Design',
    description: 'Master the fundamentals of creating engaging and effective learning experiences.',
    thumbnail: '/placeholder-course-thumbnail.jpg',
    modules,
    totalLessons: 5,
    completedLessons: 0,
    totalDuration: 90,
    xpTotal: 475,
  };
}

const initialUIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  isFullscreen: false,
  showBookmarkDialog: false,
};

export function useCoursePlayer(
  courseId: string,
  lessonId: string,
): CoursePlayerState & CoursePlayerActions {
  const router = useRouter();
  const { user } = useSafeAuth();

  const [course, setCourse] = useState<PlayerCourse | null>(null);
  const [currentLesson, setCurrentLesson] = useState<PlayerLesson | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [bookmarks, setBookmarks] = useState<LessonBookmark[]>([]);
  const [navigation, setNavigation] = useState<PlayerNavigation | null>(null);
  const [ui, setUI] = useState(initialUIState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate navigation state
  const calculateNavigation = useCallback(
    (courseData: PlayerCourse, currentLessonId: string): PlayerNavigation => {
      let currentModuleIndex = -1;
      let currentLessonIndex = -1;
      const flatLessons: { moduleIndex: number; lessonIndex: number; lesson: PlayerLesson }[] = [];

      courseData.modules.forEach((module, mIdx) => {
        module.lessons.forEach((lesson, lIdx) => {
          flatLessons.push({ moduleIndex: mIdx, lessonIndex: lIdx, lesson });
          if (lesson.id === currentLessonId) {
            currentModuleIndex = mIdx;
            currentLessonIndex = lIdx;
          }
        });
      });

      const flatIndex = flatLessons.findIndex((fl) => fl.lesson.id === currentLessonId);
      const hasPrevious = flatIndex > 0;
      const hasNext = flatIndex < flatLessons.length - 1;

      return {
        currentModuleIndex,
        currentLessonIndex,
        hasPrevious,
        hasNext,
        previousLesson: hasPrevious
          ? {
              moduleId: flatLessons[flatIndex - 1].lesson.moduleId,
              lessonId: flatLessons[flatIndex - 1].lesson.id,
            }
          : undefined,
        nextLesson: hasNext
          ? {
              moduleId: flatLessons[flatIndex + 1].lesson.moduleId,
              lessonId: flatLessons[flatIndex + 1].lesson.id,
            }
          : undefined,
      };
    },
    [],
  );

  // Find lesson in course
  const findLesson = useCallback(
    (courseData: PlayerCourse, lessonIdToFind: string): PlayerLesson | null => {
      for (const module of courseData.modules) {
        const lesson = module.lessons.find((l) => l.id === lessonIdToFind);
        if (lesson) return lesson;
      }
      return null;
    },
    [],
  );

  // Load course data
  const loadCourse = useCallback(
    async (cId: string) => {
      setLoading(true);
      setError(null);

      try {
        // TODO(LXD-332): Replace mock data with Firestore fetch
        // For now, use mock data for development
        const courseData = generateMockCourse(cId);
        setCourse(courseData);

        // Find and set current lesson
        const lesson = findLesson(courseData, lessonId);
        if (lesson) {
          setCurrentLesson(lesson);
          setNavigation(calculateNavigation(courseData, lessonId));
        } else {
          // Default to first lesson
          const firstLesson = courseData.modules[0]?.lessons[0];
          if (firstLesson) {
            setCurrentLesson(firstLesson);
            setNavigation(calculateNavigation(courseData, firstLesson.id));
          }
        }

        // Load progress from Firestore
        if (user?.uid) {
          const progressRef = doc(requireDb(), `users/${user.uid}/course_progress/${cId}`);
          const progressSnap = await getDoc(progressRef);

          if (progressSnap.exists()) {
            const progressData = progressSnap.data() as CourseProgress;
            setProgress(progressData);

            // Update lesson statuses based on progress
            const completedIds = new Set(progressData.completedLessonIds || []);
            courseData.modules.forEach((module) => {
              module.lessons.forEach((lesson, idx) => {
                if (completedIds.has(lesson.id)) {
                  lesson.status = 'completed';
                } else if (idx === 0 || completedIds.has(module.lessons[idx - 1]?.id)) {
                  lesson.status = 'available';
                }
              });
            });
            setCourse({ ...courseData });
          } else {
            // Initialize progress
            const newProgress: CourseProgress = {
              courseId: cId,
              learnerId: user.uid,
              completedLessonIds: [],
              currentLessonId: lessonId,
              progress: 0,
              xpEarned: 0,
              startedAt: new Date().toISOString(),
              lastAccessedAt: new Date().toISOString(),
            };
            await setDoc(progressRef, newProgress);
            setProgress(newProgress);
          }

          // Load bookmarks
          const bookmarksRef = collection(requireDb(), `users/${user.uid}/bookmarks`);
          const bookmarksQuery = query(bookmarksRef, where('courseId', '==', cId));
          const bookmarksSnap = await getDocs(bookmarksQuery);
          const loadedBookmarks: LessonBookmark[] = [];
          bookmarksSnap.forEach((doc) => {
            loadedBookmarks.push({ id: doc.id, ...doc.data() } as LessonBookmark);
          });
          setBookmarks(loadedBookmarks);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    },
    [lessonId, user?.uid, findLesson, calculateNavigation],
  );

  // Navigate to a specific lesson
  const navigateToLesson = useCallback(
    (newLessonId: string) => {
      if (!course) return;

      const lesson = findLesson(course, newLessonId);
      if (lesson && lesson.status !== 'locked') {
        setCurrentLesson(lesson);
        setNavigation(calculateNavigation(course, newLessonId));
        router.push(`/ignite/learn/player/${courseId}/${newLessonId}`);
      }
    },
    [course, courseId, router, findLesson, calculateNavigation],
  );

  // Mark current lesson as complete
  const markLessonComplete = useCallback(async () => {
    if (!currentLesson || !user?.uid || !progress || !course) return;

    const completedIds = new Set(progress.completedLessonIds);
    if (completedIds.has(currentLesson.id)) return;

    completedIds.add(currentLesson.id);
    const completedArray = Array.from(completedIds);
    const newProgress = Math.round((completedArray.length / course.totalLessons) * 100);

    const updatedProgress: CourseProgress = {
      ...progress,
      completedLessonIds: completedArray,
      progress: newProgress,
      xpEarned: progress.xpEarned + currentLesson.xpReward,
      lastAccessedAt: new Date().toISOString(),
      completedAt: newProgress === 100 ? new Date().toISOString() : undefined,
    };

    try {
      const progressRef = doc(requireDb(), `users/${user.uid}/course_progress/${courseId}`);
      await updateDoc(progressRef, {
        completedLessonIds: completedArray,
        progress: newProgress,
        xpEarned: updatedProgress.xpEarned,
        lastAccessedAt: updatedProgress.lastAccessedAt,
        ...(newProgress === 100 && { completedAt: updatedProgress.completedAt }),
      });
      setProgress(updatedProgress);

      // Update lesson status
      currentLesson.status = 'completed';

      // Unlock next lesson
      if (navigation?.nextLesson) {
        const nextLesson = findLesson(course, navigation.nextLesson.lessonId);
        if (nextLesson) {
          nextLesson.status = 'available';
        }
      }

      setCourse({ ...course });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress');
    }
  }, [currentLesson, user?.uid, progress, course, courseId, navigation, findLesson]);

  // Go to next lesson
  const goToNextLesson = useCallback(() => {
    if (navigation?.nextLesson) {
      navigateToLesson(navigation.nextLesson.lessonId);
    }
  }, [navigation, navigateToLesson]);

  // Go to previous lesson
  const goToPreviousLesson = useCallback(() => {
    if (navigation?.previousLesson) {
      navigateToLesson(navigation.previousLesson.lessonId);
    }
  }, [navigation, navigateToLesson]);

  // Add bookmark
  const addBookmark = useCallback(
    async (title: string, blockId?: string) => {
      if (!user?.uid || !currentLesson) return;

      const newBookmark: Omit<LessonBookmark, 'id'> = {
        lessonId: currentLesson.id,
        courseId,
        learnerId: user.uid,
        title,
        blockId,
        createdAt: new Date().toISOString(),
      };

      try {
        const bookmarksRef = collection(requireDb(), `users/${user.uid}/bookmarks`);
        const docRef = doc(bookmarksRef);
        await setDoc(docRef, newBookmark);
        setBookmarks((prev) => [...prev, { id: docRef.id, ...newBookmark }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add bookmark');
      }
    },
    [user?.uid, currentLesson, courseId],
  );

  // Remove bookmark
  const removeBookmark = useCallback(
    async (bookmarkId: string) => {
      if (!user?.uid) return;

      try {
        const bookmarkRef = doc(requireDb(), `users/${user.uid}/bookmarks/${bookmarkId}`);
        await deleteDoc(bookmarkRef);
        setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove bookmark');
      }
    },
    [user?.uid],
  );

  // UI toggles
  const toggleSidebar = useCallback(() => {
    setUI((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setUI((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setUI((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  // Load course on mount
  useEffect(() => {
    loadCourse(courseId);
  }, [courseId, loadCourse]);

  // Update last accessed time periodically
  useEffect(() => {
    if (!user?.uid || !progress) return;

    const interval = setInterval(async () => {
      const progressRef = doc(requireDb(), `users/${user.uid}/course_progress/${courseId}`);
      await updateDoc(progressRef, {
        lastAccessedAt: new Date().toISOString(),
        currentLessonId: currentLesson?.id,
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user?.uid, progress, courseId, currentLesson?.id]);

  return {
    // State
    course,
    currentLesson,
    progress,
    bookmarks,
    navigation,
    ui,
    loading,
    error,
    // Actions
    loadCourse,
    navigateToLesson,
    markLessonComplete,
    goToNextLesson,
    goToPreviousLesson,
    addBookmark,
    removeBookmark,
    toggleSidebar,
    toggleSidebarCollapse,
    toggleFullscreen,
  };
}
