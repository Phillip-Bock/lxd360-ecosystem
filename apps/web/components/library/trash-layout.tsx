'use client';

import { Home, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import type { LibraryItem, SortDirection, SortField } from '@/types/library';
import { LIBRARY_CONFIGS } from '@/types/library';
import { ConfirmationDialog } from './confirmation-dialog';
import { LibraryGrid } from './library-grid';
import { LibraryToolbar } from './library-toolbar';

interface TrashLayoutProps {
  items: LibraryItem[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onRestoreAll: () => void;
  onEmptyTrash: () => void;
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

export function TrashLayout({
  items,
  onRestore,
  onPermanentDelete,
  onRestoreAll,
  onEmptyTrash,
}: TrashLayoutProps) {
  // State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isRestoreAllDialogOpen, setIsRestoreAllDialogOpen] = useState(false);

  // Computed
  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedId) || null;
  }, [items, selectedId]);

  const displayedItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      return true;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'updatedAt':
          comparison =
            new Date(a.deletedAt || a.updatedAt).getTime() -
            new Date(b.deletedAt || b.updatedAt).getTime();
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'fileSize':
          comparison = (a.fileSize || 0) - (b.fileSize || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, searchQuery, sortField, sortDirection]);

  // Handlers
  const handleSortChange = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  const handleDelete = () => {
    if (selectedItem) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      onPermanentDelete(selectedId);
      setSelectedId(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteAll = () => {
    setIsDeleteAllDialogOpen(true);
  };

  const handleConfirmDeleteAll = () => {
    onEmptyTrash();
    setSelectedId(null);
    setIsDeleteAllDialogOpen(false);
  };

  const handleRestore = () => {
    if (selectedItem) {
      setIsRestoreDialogOpen(true);
    }
  };

  const handleConfirmRestore = () => {
    if (selectedId) {
      onRestore(selectedId);
      setSelectedId(null);
    }
    setIsRestoreDialogOpen(false);
  };

  const handleRestoreAll = () => {
    setIsRestoreAllDialogOpen(true);
  };

  const handleConfirmRestoreAll = () => {
    onRestoreAll();
    setSelectedId(null);
    setIsRestoreAllDialogOpen(false);
  };

  const getLibraryLabel = (item: LibraryItem) => {
    return LIBRARY_CONFIGS[item.libraryType].label;
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <aside className="w-56 bg-(--inspire-sidebar-bg) border-r border-(--inspire-sidebar-border) flex flex-col p-4">
        <div className="space-y-2">
          <SidebarButton icon={Home} label="Dashboard" href="/" />
        </div>

        <SectionSeparator />

        {/* Restore Actions */}
        <div className="space-y-2">
          <SidebarButton
            icon={RefreshCw}
            label="Restore"
            onClick={handleRestore}
            disabled={!selectedId}
          />
          <SidebarButton
            icon={RefreshCw}
            label="Restore All"
            onClick={handleRestoreAll}
            disabled={items.length === 0}
          />
        </div>

        <SectionSeparator />

        {/* Delete Actions */}
        <div className="space-y-2">
          <SidebarButton
            icon={Trash2}
            label="Delete"
            onClick={handleDelete}
            disabled={!selectedId}
            variant="danger"
          />
          <SidebarButton
            icon={Trash2}
            label="Delete All"
            onClick={handleDeleteAll}
            disabled={items.length === 0}
            variant="danger"
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10">
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Trash2 className="h-6 w-6" />
            Trash
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Items in trash will be permanently deleted after 30 days
          </p>
        </div>

        {/* Toolbar */}
        <LibraryToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          itemCount={displayedItems.length}
          selectedCount={selectedId ? 1 : 0}
        />

        {/* Grid */}
        <LibraryGrid
          items={displayedItems}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onOpenFolder={() => {}}
          onPreview={() => {}}
          emptyMessage="Trash is empty"
          libraryLabel="deleted items"
        />
      </div>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Permanently Delete?"
        message={`"${selectedItem?.name}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete Forever"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      {/* Delete All Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteAllDialogOpen}
        title="Empty Trash?"
        message={`All ${items.length} items in trash will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete All Forever"
        variant="danger"
        onConfirm={handleConfirmDeleteAll}
        onCancel={() => setIsDeleteAllDialogOpen(false)}
      />

      {/* Restore Confirmation */}
      <ConfirmationDialog
        isOpen={isRestoreDialogOpen}
        title="Restore Item?"
        message={`"${selectedItem?.name}" will be restored to ${selectedItem ? getLibraryLabel(selectedItem) : ''} library.`}
        confirmLabel="Restore"
        variant="default"
        onConfirm={handleConfirmRestore}
        onCancel={() => setIsRestoreDialogOpen(false)}
      />

      {/* Restore All Confirmation */}
      <ConfirmationDialog
        isOpen={isRestoreAllDialogOpen}
        title="Restore All Items?"
        message={`All ${items.length} items will be restored to their original libraries.`}
        confirmLabel="Restore All"
        variant="default"
        onConfirm={handleConfirmRestoreAll}
        onCancel={() => setIsRestoreAllDialogOpen(false)}
      />
    </div>
  );
}
