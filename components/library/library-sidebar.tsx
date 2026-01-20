'use client';

import { Download, FilePlus, FolderPlus, Home, Pencil, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';

interface LibrarySidebarProps {
  libraryType: string;
  onUpload: () => void;
  onDownload: () => void;
  onAddFolder: () => void;
  onEdit: () => void;
  onDelete: () => void;
  hasSelection: boolean;
  isTrashView?: boolean;
  onCreateNew?: () => void;
  createNewLabel?: string;
}

interface SidebarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

function SidebarButton({
  icon: Icon,
  label,
  onClick,
  href,
  disabled = false,
  variant = 'default',
}: SidebarButtonProps) {
  const baseClass = 'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-all';
  const variantClass =
    variant === 'danger'
      ? 'text-red-400 hover:bg-red-500/20 active:bg-red-500/30'
      : 'text-white bg-(--inspire-btn-default) hover:bg-(--inspire-btn-hover) active:bg-(--inspire-btn-active)';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const className = `${baseClass} ${variantClass} ${disabledClass}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={className}>
        <Icon className="h-5 w-5 shrink-0" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

function SectionSeparator() {
  return <div className="h-px bg-(--inspire-separator) my-3" />;
}

export function LibrarySidebar({
  onUpload,
  onDownload,
  onAddFolder,
  onEdit,
  onDelete,
  hasSelection,
  isTrashView = false,
  onCreateNew,
  createNewLabel,
}: LibrarySidebarProps) {
  return (
    <aside className="w-56 bg-(--inspire-sidebar-bg) border-r border-(--inspire-sidebar-border) flex flex-col p-4">
      {/* Dashboard Link */}
      <div className="space-y-2">
        <SidebarButton icon={Home} label="Dashboard" href="/" />
      </div>

      <SectionSeparator />

      {/* File Operations */}
      {!isTrashView && (
        <>
          <div className="space-y-2">
            {onCreateNew && (
              <SidebarButton
                icon={FilePlus}
                label={createNewLabel || 'Create New'}
                onClick={onCreateNew}
              />
            )}
            <SidebarButton icon={Upload} label="Upload" onClick={onUpload} />
            <SidebarButton
              icon={Download}
              label="Download"
              onClick={onDownload}
              disabled={!hasSelection}
            />
            <SidebarButton icon={FolderPlus} label="Add Folder" onClick={onAddFolder} />
          </div>

          <SectionSeparator />

          {/* Edit & Delete */}
          <div className="space-y-2">
            <SidebarButton icon={Pencil} label="Edit" onClick={onEdit} disabled={!hasSelection} />
            <SidebarButton
              icon={Trash2}
              label="Delete"
              onClick={onDelete}
              disabled={!hasSelection}
              variant="danger"
            />
          </div>

          <SectionSeparator />
        </>
      )}

      {/* Trash Link */}
      <div className="space-y-2">
        <SidebarButton icon={Trash2} label="Trash" href="/library/trash" />
      </div>
    </aside>
  );
}
