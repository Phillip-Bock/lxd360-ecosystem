'use client';

import { BookOpen, Folder, Image, Palette, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import WidgetWrapper from './widget-wrapper';

interface QuickLink {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Default quick links - users can customize these
const defaultLinks: QuickLink[] = [
  {
    id: 'new-course',
    label: 'New Course',
    href: '/inspire-studio',
    icon: Plus,
    color: 'bg-primary text-white',
  },
  {
    id: 'media',
    label: 'Media Library',
    href: '/library/media',
    icon: Image,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/library/projects',
    icon: Folder,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'templates',
    label: 'Templates',
    href: '/library/templates',
    icon: BookOpen,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'ai-builder',
    label: 'Neuro-naut',
    href: '/inspire-studio/ai-course-builder',
    icon: Sparkles,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    id: 'themes',
    label: 'Themes',
    href: '/library/themes',
    icon: Palette,
    color: 'bg-amber-100 text-amber-600',
  },
];

export default function QuickLinksWidget() {
  return (
    <WidgetWrapper
      title="Quick Links"
      size={2}
      headerAction={
        <button type="button" className="text-xs text-white hover:text-white/80 transition-colors">
          Edit
        </button>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        {defaultLinks.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.color}`}>
              <link.icon className="w-5 h-5" />
            </div>
            <span className="text-xs text-white text-center transition-colors">{link.label}</span>
          </Link>
        ))}
      </div>
    </WidgetWrapper>
  );
}
