'use client';

import { AlertTriangle, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { LibraryItem } from '@/types/library';

interface EditSidebarProps {
  item: LibraryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<LibraryItem>) => void;
}

export function EditSidebar({ item, isOpen, onClose, onSave }: EditSidebarProps) {
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRenameWarning, setShowRenameWarning] = useState(false);

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setName(item.name);
      setTags(item.tags.join(', '));
      setIsFavorite(item.isFavorite);
      setShowRenameWarning(false);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setShowRenameWarning(newName !== item.name);
  };

  const handleSave = () => {
    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      name,
      tags: tagArray,
      isFavorite,
    });
    onClose();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <aside className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Edit Details</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {showRenameWarning && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-300 rounded-md">
              <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">
                Renaming this {item.type} may affect any content that links to it.
              </p>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label htmlFor="edit-tags" className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <input
            id="edit-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500">Separate tags with commas</p>
        </div>

        {/* Favorite Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {isFavorite ? (
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            ) : (
              <Star className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </span>
          </button>
        </div>

        {/* Read-only Info */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">File Information</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="text-gray-900">
                {item.type === 'folder' ? 'Folder' : item.fileType || 'File'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-900">{formatDate(item.createdAt)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Last Modified</span>
              <span className="text-gray-900">{formatDate(item.updatedAt)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Version</span>
              <span className="text-gray-900">v{item.version}</span>
            </div>

            {item.fileSize && (
              <div className="flex justify-between">
                <span className="text-gray-500">Size</span>
                <span className="text-gray-900">{(item.fileSize / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
        >
          Save
        </button>
      </div>
    </aside>
  );
}
