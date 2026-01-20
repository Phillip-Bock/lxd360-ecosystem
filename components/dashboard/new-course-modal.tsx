'use client';

import { BookOpen, Box, ClipboardList, Copy, Film, GraduationCap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const courseTypes = [
  {
    id: 'isd',
    title: 'ISD Course Creation',
    description: 'Full instructional design workflow with ADDIE/SAM',
    icon: BookOpen,
    href: '/inspire-studio/course-outline',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'inspire-lxd',
    title: 'INSPIRE LXD System',
    description: 'Neuroscience-backed learning experience design',
    icon: Sparkles,
    href: '/inspire-studio/inspire-lxd',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'webinar',
    title: 'Webinar',
    description: 'Live or recorded webinar presentation',
    icon: Film,
    href: '/inspire-studio/webinar',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'ilt',
    title: 'ILT Course',
    description: 'Instructor-led training materials',
    icon: GraduationCap,
    href: '/inspire-studio/ilt',
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 'microlearning',
    title: 'Micro Learning',
    description: 'Bite-sized learning modules (3-5 min)',
    icon: Box,
    href: '/inspire-studio/micro-learning',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'xr',
    title: 'XR Course',
    description: 'VR/AR immersive learning experiences',
    icon: Box,
    href: '/inspire-studio/xr-course',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    id: 'ai',
    title: 'Create with Neuro-naut',
    description: 'AI-assisted course generation',
    icon: Sparkles,
    href: '/inspire-studio/ai-course-builder',
    color: 'from-cyan-400 to-purple-500',
    badge: 'AI',
  },
  {
    id: 'questions',
    title: 'Question Builder',
    description: 'Assessment question library',
    icon: ClipboardList,
    href: '/inspire-studio/question-builder',
    color: 'from-slate-500 to-gray-600',
  },
  {
    id: 'templates',
    title: 'Templates',
    description: 'Start from pre-built templates',
    icon: Copy,
    href: '/inspire-studio/templates',
    color: 'from-teal-500 to-cyan-600',
  },
];

export default function NewCourseModal({ isOpen, onClose }: NewCourseModalProps) {
  if (!isOpen) return null;

  const handleCardClick = (href: string) => {
    window.location.assign(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-default"
        aria-label="Close modal"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-course-modal-title"
        className="relative z-10 w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="new-course-modal-title" className="text-2xl font-semibold">
              Create New
            </h2>
            <p className="text-muted-foreground mt-1">Choose a content type to get started</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 hover:bg-accent transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              role="img"
              aria-hidden="true"
            >
              <title>Close</title>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Course Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courseTypes.map((type) => (
            <button
              type="button"
              key={type.id}
              onClick={() => handleCardClick(type.href)}
              className={cn(
                'group relative flex flex-col items-start p-5 rounded-lg border border-border',
                'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
                'transition-all duration-200 text-left',
              )}
            >
              {/* Icon with gradient background */}
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br mb-4',
                  type.color,
                )}
              >
                <type.icon className="h-6 w-6 text-white" />
              </div>

              <div className="flex items-center gap-2">
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {type.title}
                </h3>
                {type.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    {type.badge}
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
