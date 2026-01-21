'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { LibraryItem } from '@/types/library';

interface PreviewModalProps {
  item: LibraryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ item, isOpen, onClose }: PreviewModalProps) {
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

  if (!isOpen || !item) return null;

  const renderPreview = () => {
    const { fileType } = item;

    if (!fileType) {
      return (
        <div className="flex items-center justify-center h-full text-white/50">
          <p>Preview not available</p>
        </div>
      );
    }

    if (fileType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          {/* In a real app, this would be the actual image */}
          <div className="bg-white/10 rounded-lg p-8 text-center">
            <p className="text-white/70">Image Preview</p>
            <p className="text-white text-lg mt-2">{item.name}</p>
          </div>
        </div>
      );
    }

    if (fileType.startsWith('video/')) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="bg-white/10 rounded-lg p-8 text-center">
            <p className="text-white/70">Video Preview</p>
            <p className="text-white text-lg mt-2">{item.name}</p>
            {/* In a real app, this would be a video player */}
          </div>
        </div>
      );
    }

    if (fileType.startsWith('audio/')) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="bg-white/10 rounded-lg p-8 text-center">
            <p className="text-white/70">Audio Preview</p>
            <p className="text-white text-lg mt-2">{item.name}</p>
            {/* In a real app, this would be an audio player */}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-white/50">
        <div className="text-center">
          <p>Preview not available for this file type</p>
          <p className="text-sm mt-2">{fileType}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-default border-none"
        onClick={onClose}
        aria-label="Close preview"
        tabIndex={-1}
      />

      {/* Modal */}
      <div
        className="relative bg-(--inspire-sidebar-bg) border border-white/10 rounded-xl
        shadow-xl w-full max-w-4xl h-[80vh] mx-4 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white truncate pr-4">{item.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto">{renderPreview()}</div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-white/50">
          <span>Type: {item.fileType || 'Unknown'}</span>
          {item.fileSize && <span>Size: {(item.fileSize / 1024).toFixed(1)} KB</span>}
        </div>
      </div>
    </div>
  );
}
