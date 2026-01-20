'use client';

import { FolderPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AddFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export function AddFolderDialog({ isOpen, onClose, onConfirm }: AddFolderDialogProps) {
  const [folderName, setFolderName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset and focus on open
  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onConfirm(folderName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default border-none"
        onClick={onClose}
        aria-label="Close dialog"
        tabIndex={-1}
      />

      {/* Dialog */}
      <div
        className="relative bg-(--inspire-sidebar-bg) border border-white/10 rounded-xl
          shadow-xl max-w-md w-full mx-4 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0 text-blue-500">
            <FolderPlus className="h-6 w-6" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 id="dialog-title" className="text-lg font-semibold text-white mb-4">
              Create New Folder
            </h3>

            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                  text-white text-sm placeholder-white/30
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-white/20
                    text-white text-sm hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!folderName.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700
                    text-white text-sm transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
