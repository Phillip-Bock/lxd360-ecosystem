'use client';

import { BookOpen, Users, Video, X, Zap } from 'lucide-react';

interface CourseTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (route: string) => void;
}

interface CourseType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  color: string;
}

const courseTypes: CourseType[] = [
  {
    id: 'course',
    title: 'Course',
    description:
      'Traditional full-length course with comprehensive content, assessments, and structured learning paths.',
    icon: BookOpen,
    route: '/dashboard/lxd/storyboard/course',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'microlearning',
    title: 'Micro Learning',
    description:
      'Short, focused learning modules designed for quick knowledge acquisition and just-in-time learning.',
    icon: Zap,
    route: '/dashboard/lxd/author?type=microlearning',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'webinar',
    title: 'Webinar',
    description:
      'Live or recorded web-based seminars featuring expert presentations and interactive Q&A sessions.',
    icon: Video,
    route: '/dashboard/lxd/storyboard/webinar',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'ilt',
    title: 'ILT',
    description:
      'Instructor-Led Training with in-person or virtual classroom sessions for hands-on, guided learning.',
    icon: Users,
    route: '/dashboard/lxd/storyboard/ilt',
    color: 'from-teal-500 to-teal-600',
  },
];

export function CourseTypeModal({
  isOpen,
  onClose,
  onSelectType,
}: CourseTypeModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  const handleCardClick = (route: string): void => {
    onSelectType(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-xs cursor-default border-none"
        onClick={onClose}
        aria-label="Close modal"
        tabIndex={-1}
      />
      <div className="bg-card rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Create New Course</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a course type to get started
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courseTypes.map((type) => (
              <button
                type="button"
                key={type.id}
                onClick={() => handleCardClick(type.route)}
                className="group relative bg-card border-2 border-border rounded-xl p-6 text-left transition-all duration-300 hover:border-transparent hover:shadow-xl hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${type.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}
                ></div>

                <div className="relative">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br ${type.color} mb-4 shadow-lg`}
                  >
                    <type.icon className="w-7 h-7 text-brand-primary" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-foreground">
                    {type.title}
                  </h3>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {type.description}
                  </p>

                  <div
                    className={`mt-4 inline-flex items-center text-sm font-medium bg-linear-to-r ${type.color} bg-clip-text text-transparent`}
                  >
                    Get Started
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 bg-card rounded-b-2xl">
          <p className="text-sm text-muted-foreground text-center">
            Need help choosing? Contact your LXD team for guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
