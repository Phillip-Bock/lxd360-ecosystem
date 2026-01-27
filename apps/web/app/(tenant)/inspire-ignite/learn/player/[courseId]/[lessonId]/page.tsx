'use client';

export const dynamic = 'force-dynamic';

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import { PlayerShell } from '@/components/player/player-shell';
import type { CourseWithContent, LearnerProgress } from '@/types/player';

/**
 * Mock course data for Food Safety Fundamentals
 * TODO(LXD-332): Replace with actual Firestore data fetching
 */
function getMockCourse(courseId: string): CourseWithContent {
  return {
    id: courseId,
    title: 'Food Safety Fundamentals',
    description: 'Learn essential food safety practices for the workplace',
    thumbnail_url: null,
    total_slides: 8,
    estimated_duration_minutes: 30,
    scorm_version: null,
    xapi_enabled: true,
    is_published: true,
    published_at: new Date().toISOString(),
    designer_theme: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chapters: [
      {
        id: 'mod-1',
        course_id: courseId,
        title: 'Introduction',
        description: 'Welcome and course overview',
        sort_order: 0,
        created_at: new Date().toISOString(),
        slides: [
          {
            id: 'les-1',
            course_id: courseId,
            chapter_id: 'mod-1',
            title: 'Welcome',
            content_type: 'slide',
            content_data: {
              heading: 'Welcome to Food Safety Fundamentals',
              subheading: 'Your journey to safer food handling starts here',
              body: 'Food safety is essential for protecting public health and maintaining trust in the food industry. This course will guide you through the fundamental principles of safe food handling.\n\nBy the end of this course, you will understand key concepts that help prevent foodborne illness and ensure compliance with safety regulations.',
              key_points: [
                'Understanding the importance of food safety',
                'Learning proper hygiene practices',
                'Identifying common food safety hazards',
                'Implementing temperature control measures',
              ],
            },
            sort_order: 0,
            duration_seconds: 120,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'les-2',
            course_id: courseId,
            chapter_id: 'mod-1',
            title: 'Course Overview',
            content_type: 'slide',
            content_data: {
              heading: 'What You Will Learn',
              subheading: 'Course objectives and structure',
              body: 'This comprehensive course is designed to equip you with the knowledge and skills necessary for maintaining food safety in any environment.',
              features: [
                'Module 1: Introduction to food safety principles',
                'Module 2: Hazard identification and control',
                'Module 3: Temperature management and storage',
                'Module 4: Personal hygiene and sanitation',
              ],
            },
            sort_order: 1,
            duration_seconds: 90,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'mod-2',
        course_id: courseId,
        title: 'Hazard Identification',
        description: 'Learn to identify and control food safety hazards',
        sort_order: 1,
        created_at: new Date().toISOString(),
        slides: [
          {
            id: 'les-3',
            course_id: courseId,
            chapter_id: 'mod-2',
            title: 'Types of Hazards',
            content_type: 'slide',
            content_data: {
              heading: 'Understanding Food Safety Hazards',
              subheading: 'Biological, Chemical, and Physical hazards',
              body: 'Food safety hazards are agents that can cause harm to consumers. Understanding these hazards is the first step in preventing foodborne illness.',
              key_points: [
                'Biological hazards: bacteria, viruses, parasites, and fungi',
                'Chemical hazards: cleaning agents, pesticides, and allergens',
                'Physical hazards: glass, metal, and foreign objects',
              ],
            },
            sort_order: 0,
            duration_seconds: 150,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'les-4',
            course_id: courseId,
            chapter_id: 'mod-2',
            title: 'Control Measures',
            content_type: 'slide',
            content_data: {
              heading: 'Controlling Food Safety Hazards',
              subheading: 'Prevention and mitigation strategies',
              body: 'Effective hazard control requires a systematic approach that combines prevention, monitoring, and corrective actions.',
              tips: [
                'Maintain proper temperature control at all times',
                'Follow strict hygiene protocols',
                'Use approved suppliers and inspect deliveries',
                'Implement proper cleaning and sanitation schedules',
              ],
            },
            sort_order: 1,
            duration_seconds: 120,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'mod-3',
        course_id: courseId,
        title: 'Temperature Control',
        description: 'Master temperature management for food safety',
        sort_order: 2,
        created_at: new Date().toISOString(),
        slides: [
          {
            id: 'les-5',
            course_id: courseId,
            chapter_id: 'mod-3',
            title: 'The Danger Zone',
            content_type: 'slide',
            content_data: {
              heading: 'The Temperature Danger Zone',
              subheading: '40°F - 140°F (4°C - 60°C)',
              body: 'The "danger zone" is the temperature range where bacteria grow most rapidly. Food should not remain in this zone for more than 2 hours.',
              key_points: [
                'Keep cold foods below 40°F (4°C)',
                'Keep hot foods above 140°F (60°C)',
                'Use calibrated thermometers to check temperatures',
                'Follow the 2-hour rule for food left out',
              ],
            },
            sort_order: 0,
            duration_seconds: 180,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'les-6',
            course_id: courseId,
            chapter_id: 'mod-3',
            title: 'Safe Cooking Temperatures',
            content_type: 'slide',
            content_data: {
              heading: 'Minimum Internal Cooking Temperatures',
              subheading: 'Ensure food is cooked to safe temperatures',
              body: 'Different foods require different minimum internal temperatures to be considered safe for consumption.',
              examples: [
                'Poultry: 165°F (74°C)',
                'Ground meats: 160°F (71°C)',
                'Beef, pork, lamb (steaks/roasts): 145°F (63°C)',
                'Fish: 145°F (63°C)',
                'Eggs: 160°F (71°C) or until yolk is firm',
              ],
            },
            sort_order: 1,
            duration_seconds: 150,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'mod-4',
        course_id: courseId,
        title: 'Knowledge Check',
        description: 'Test your understanding',
        sort_order: 3,
        created_at: new Date().toISOString(),
        slides: [
          {
            id: 'les-7',
            course_id: courseId,
            chapter_id: 'mod-4',
            title: 'Quiz',
            content_type: 'quiz',
            content_data: {
              heading: 'Knowledge Check',
              subheading: 'Test your understanding of food safety',
              body: 'Answer the following questions to verify your understanding of the material covered in this course.',
              questions: [
                {
                  id: 'q1',
                  question: 'What is the temperature range of the "danger zone"?',
                  options: ['0°F - 32°F', '40°F - 140°F', '140°F - 180°F', '180°F - 212°F'],
                  correct: 1,
                },
                {
                  id: 'q2',
                  question: 'What is the minimum internal temperature for cooking poultry?',
                  options: ['145°F', '155°F', '165°F', '175°F'],
                  correct: 2,
                },
                {
                  id: 'q3',
                  question: 'Which of the following is NOT a type of food safety hazard?',
                  options: ['Biological', 'Chemical', 'Physical', 'Emotional'],
                  correct: 3,
                },
              ],
            },
            sort_order: 0,
            duration_seconds: 300,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'les-8',
            course_id: courseId,
            chapter_id: 'mod-4',
            title: 'Course Complete',
            content_type: 'slide',
            content_data: {
              heading: 'Congratulations!',
              subheading: 'You have completed Food Safety Fundamentals',
              body: 'You now have a solid foundation in food safety principles. Remember to apply what you have learned in your daily work to protect public health.',
              action_items: [
                'Review the course materials as needed',
                'Download the reference guide',
                'Complete your food safety certification',
                'Share your knowledge with your team',
              ],
              celebration: true,
            },
            sort_order: 1,
            duration_seconds: 60,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
    ],
    glossary: [
      {
        id: 'g1',
        course_id: courseId,
        term: 'Danger Zone',
        definition:
          'The temperature range between 40°F and 140°F (4°C to 60°C) where bacteria grow most rapidly.',
        pronunciation: 'DAYN-jer zohn',
        related_terms: ['Temperature Control', 'Food Safety'],
        created_at: new Date().toISOString(),
      },
      {
        id: 'g2',
        course_id: courseId,
        term: 'Cross-Contamination',
        definition:
          'The transfer of harmful bacteria or allergens from one food, surface, or person to another.',
        pronunciation: 'kraws kuhn-tam-uh-NAY-shuhn',
        related_terms: ['Food Safety', 'Hygiene'],
        created_at: new Date().toISOString(),
      },
      {
        id: 'g3',
        course_id: courseId,
        term: 'HACCP',
        definition:
          'Hazard Analysis Critical Control Point - A systematic preventive approach to food safety.',
        pronunciation: 'HAS-ip',
        related_terms: ['Food Safety', 'Quality Control'],
        created_at: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Course Player page - Main lesson delivery interface
 * LXD-332: Full player implementation with content blocks, navigation, and progress tracking
 */
export default function PlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);

  // Track bookmarked slides (saved in localStorage for now)
  // TODO(LXD-332): Persist bookmarks to Firestore
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [completedSlides, setCompletedSlides] = useState<Set<string>>(new Set());

  // Load bookmarks and completed slides from localStorage on mount
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem(`bookmarks-${courseId}`);
      if (savedBookmarks) {
        setBookmarks(new Set(JSON.parse(savedBookmarks) as string[]));
      }
      const savedCompleted = localStorage.getItem(`completed-${courseId}`);
      if (savedCompleted) {
        setCompletedSlides(new Set(JSON.parse(savedCompleted) as string[]));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [courseId]);

  // Get mock course data
  const course = useMemo(() => getMockCourse(courseId), [courseId]);

  // Find initial slide index based on lessonId
  const allSlides = useMemo(
    () => course.chapters.flatMap((chapter) => chapter.slides),
    [course.chapters],
  );

  const initialSlideIndex = useMemo(() => {
    const index = allSlides.findIndex((slide) => slide.id === lessonId);
    return index >= 0 ? index : 0;
  }, [allSlides, lessonId]);

  // Create progress object
  const progress: LearnerProgress = useMemo(
    () => ({
      id: `progress-${courseId}`,
      learner_id: 'demo-user',
      course_id: courseId,
      current_slide_id: lessonId || allSlides[0]?.id || null,
      completion_percentage: (completedSlides.size / allSlides.length) * 100,
      time_spent_seconds: 0,
      status: completedSlides.size === allSlides.length ? 'completed' : 'in_progress',
      started_at: new Date().toISOString(),
      completed_at: null,
      last_accessed_at: new Date().toISOString(),
      xapi_statements: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    [courseId, lessonId, allSlides, completedSlides.size],
  );

  // Bookmark handler
  const handleBookmark = useCallback(
    (slideId: string) => {
      setBookmarks((prev) => {
        const newBookmarks = new Set(prev);
        if (newBookmarks.has(slideId)) {
          newBookmarks.delete(slideId);
        } else {
          newBookmarks.add(slideId);
        }
        // Persist to localStorage
        try {
          localStorage.setItem(`bookmarks-${courseId}`, JSON.stringify([...newBookmarks]));
        } catch {
          // Ignore localStorage errors
        }
        return newBookmarks;
      });
    },
    [courseId],
  );

  // Mark complete handler
  const handleMarkComplete = useCallback(
    (slideId: string) => {
      setCompletedSlides((prev) => {
        const newCompleted = new Set(prev);
        newCompleted.add(slideId);
        // Persist to localStorage
        try {
          localStorage.setItem(`completed-${courseId}`, JSON.stringify([...newCompleted]));
        } catch {
          // Ignore localStorage errors
        }
        return newCompleted;
      });
    },
    [courseId],
  );

  return (
    <PlayerShell
      course={course}
      progress={progress}
      isDemo={true}
      userId="demo-user"
      bookmarks={bookmarks}
      completedSlides={completedSlides}
      onBookmark={handleBookmark}
      onMarkComplete={handleMarkComplete}
      initialSlideIndex={initialSlideIndex}
    />
  );
}
