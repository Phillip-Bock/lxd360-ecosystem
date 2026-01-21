'use client';

import { useCallback, useMemo, useState } from 'react';
import type { LibraryItem, LibraryType, SortDirection, SortField } from '@/types/library';
import { LIBRARY_CONFIGS } from '@/types/library';
import { AddFolderDialog } from './add-folder-dialog';
import { ConfirmationDialog } from './confirmation-dialog';
import { EditSidebar } from './edit-sidebar';
import { LibraryBreadcrumbs } from './library-breadcrumbs';
import { LibraryGrid } from './library-grid';
import { LibrarySidebar } from './library-sidebar';
import { LibraryToolbar } from './library-toolbar';
import { PreviewModal } from './preview-modal';

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface LibraryLayoutProps {
  libraryType: LibraryType;
  items: LibraryItem[];
  onItemUpdate: (id: string, updates: Partial<LibraryItem>) => void;
  onItemDelete: (id: string) => void;
  onAddFolder: (name: string, parentId: string | null) => void;
  onUpload: () => void;
  onDownload: (item: LibraryItem) => void;
  onCreateNew?: () => void;
  createNewLabel?: string;
}

export function LibraryLayout({
  libraryType,
  items,
  onItemUpdate,
  onItemDelete,
  onAddFolder,
  onUpload,
  onDownload,
  onCreateNew,
  createNewLabel,
}: LibraryLayoutProps) {
  const config = LIBRARY_CONFIGS[libraryType];

  // State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // UI State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<LibraryItem | null>(null);

  // Computed values
  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedId) || null;
  }, [items, selectedId]);

  // Build breadcrumb path
  const breadcrumbPath = useMemo(() => {
    const path: BreadcrumbItem[] = [];
    let currentId = currentFolderId;

    while (currentId) {
      const folder = items.find((item) => item.id === currentId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId;
      } else {
        break;
      }
    }

    return path;
  }, [items, currentFolderId]);

  // Filter and sort items
  const displayedItems = useMemo(() => {
    const filtered = items.filter((item) => {
      // Only show items in current folder
      if (item.parentId !== currentFolderId) return false;
      // Only show non-deleted items
      if (item.isDeleted) return false;
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      return true;
    });

    // Sort - folders first, then by selected field
    filtered.sort((a, b) => {
      // Folders always come first
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      // Then sort by field
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
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
  }, [items, currentFolderId, searchQuery, sortField, sortDirection]);

  // Handlers
  const handleNavigate = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedId(null);
  }, []);

  const handleOpenFolder = useCallback((item: LibraryItem) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
      setSelectedId(null);
    }
  }, []);

  const handlePreview = useCallback((item: LibraryItem) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  }, []);

  const handleEdit = useCallback(() => {
    if (selectedItem) {
      setIsEditOpen(true);
    }
  }, [selectedItem]);

  const handleSaveEdit = useCallback(
    (updates: Partial<LibraryItem>) => {
      if (selectedId) {
        onItemUpdate(selectedId, updates);
      }
    },
    [selectedId, onItemUpdate],
  );

  const handleDelete = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (selectedId) {
      onItemDelete(selectedId);
      setSelectedId(null);
    }
    setIsDeleteDialogOpen(false);
  }, [selectedId, onItemDelete]);

  const handleAddFolder = useCallback(
    (name: string) => {
      onAddFolder(name, currentFolderId);
    },
    [onAddFolder, currentFolderId],
  );

  const handleDownload = useCallback(() => {
    if (selectedItem) {
      onDownload(selectedItem);
    }
  }, [selectedItem, onDownload]);

  const handleSortChange = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar */}
      <LibrarySidebar
        libraryType={libraryType}
        onUpload={onUpload}
        onDownload={handleDownload}
        onAddFolder={() => setIsAddFolderOpen(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        hasSelection={!!selectedId}
        onCreateNew={onCreateNew}
        createNewLabel={createNewLabel}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Breadcrumbs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <LibraryBreadcrumbs
            libraryType={libraryType}
            path={breadcrumbPath}
            onNavigate={handleNavigate}
          />
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
          onOpenFolder={handleOpenFolder}
          onPreview={handlePreview}
          emptyMessage={
            searchQuery
              ? 'No items match your search'
              : currentFolderId
                ? 'This folder is empty'
                : `No ${config.labelPlural.toLowerCase()} yet`
          }
          libraryLabel={config.labelPlural.toLowerCase()}
        />
      </div>

      {/* Edit Sidebar */}
      <EditSidebar
        item={selectedItem}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title={`Delete ${selectedItem?.type === 'folder' ? 'Folder' : 'File'}?`}
        message={
          selectedItem?.type === 'folder'
            ? `"${selectedItem?.name}" and all its contents will be moved to trash.`
            : `"${selectedItem?.name}" will be moved to trash.`
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      {/* Preview Modal */}
      <PreviewModal
        item={previewItem}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      {/* Add Folder Dialog */}
      <AddFolderDialog
        isOpen={isAddFolderOpen}
        onClose={() => setIsAddFolderOpen(false)}
        onConfirm={handleAddFolder}
      />
    </div>
  );
}
