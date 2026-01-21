'use client';

import { ChevronRight, Home } from 'lucide-react';
import type { LibraryType } from '@/types/library';
import { LIBRARY_CONFIGS } from '@/types/library';

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface LibraryBreadcrumbsProps {
  libraryType: LibraryType;
  path: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}

export function LibraryBreadcrumbs({ libraryType, path, onNavigate }: LibraryBreadcrumbsProps) {
  const config = LIBRARY_CONFIGS[libraryType];

  // Always start with the library root
  const fullPath: BreadcrumbItem[] = [{ id: null, name: config.labelPlural }, ...path];

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 bg-white">
      <Home className="h-4 w-4 shrink-0" />
      {fullPath.map((item, index) => (
        <div key={item.id ?? 'root'} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="h-4 w-4 shrink-0" />}
          {index === fullPath.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.name}</span>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate(item.id)}
              className="hover:text-gray-900 transition-colors"
            >
              {item.name}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}
