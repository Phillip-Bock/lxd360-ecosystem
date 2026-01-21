'use client';

import {
  ArrowLeft,
  ChevronDown,
  Eye,
  HelpCircle,
  History,
  MessageSquare,
  Save,
  Settings,
  Share,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CourseCreationHeaderProps {
  courseTitle: string;
  lastSaved?: Date | null;
  isSaving?: boolean;
  versions?: { id: string; version: number; title: string; createdAt: string }[];
  onSave: () => void;
  onPublish: () => void;
  onPreview: () => void;
  onShowVersions?: () => void;
  showVersions?: boolean;
}

export function CourseCreationHeader({
  courseTitle,
  lastSaved,
  isSaving,
  versions = [],
  onSave,
  onPublish,
  onPreview,
}: CourseCreationHeaderProps): React.JSX.Element {
  return (
    <header className="sticky top-0 z-50 bg-studio-bg-dark border-b border-studio-surface px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboards/tasks">
            <Button
              variant="ghost"
              size="sm"
              className="text-brand-primary hover:bg-studio-surface"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Studio
            </Button>
          </Link>
          <div className="h-6 w-px bg-studio-surface" />
          <div className="flex items-center gap-2">
            <span className="text-brand-primary font-medium truncate max-w-[300px]">
              {courseTitle || 'Untitled Course'}
            </span>
            {lastSaved && (
              <span className="text-brand-muted text-sm flex items-center gap-1">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 text-sm font-medium text-brand-primary hover:bg-studio-surface"
              >
                <History className="h-4 w-4" />v{versions.length || 1}{' '}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-studio-bg-dark border-studio-surface">
              {versions.length > 0 ? (
                versions.map((version) => (
                  <DropdownMenuItem
                    key={version.id}
                    className="text-brand-primary hover:bg-studio-surface"
                  >
                    Version {version.version} - {new Date(version.createdAt).toLocaleDateString()}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="text-brand-muted">No versions yet</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-brand-primary hover:bg-studio-surface"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-brand-primary hover:bg-studio-surface"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-brand-primary hover:bg-studio-surface"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent border-studio-surface text-brand-primary hover:bg-studio-surface"
          >
            <Share className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="gap-2 bg-transparent border-studio-surface text-brand-primary hover:bg-studio-surface"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="gap-2 text-brand-primary hover:bg-studio-surface"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            size="sm"
            onClick={onPublish}
            className="bg-studio-accent text-brand-primary hover:bg-studio-accent-hover"
          >
            <Upload className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>
    </header>
  );
}
