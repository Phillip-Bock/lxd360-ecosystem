'use client';

import {
  Copy,
  Download,
  Copy as Duplicate,
  Eye,
  FolderInput,
  type LucideIcon,
  Star,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { MediaAsset, MediaCollection, MediaFolder } from '@/types/media-library';

interface MediaContextMenuProps {
  x: number;
  y: number;
  asset: MediaAsset;
  onClose: () => void;
  onPreview: (asset: MediaAsset) => void;
  onDownload: (asset: MediaAsset) => void;
  onCopyUrl: (asset: MediaAsset) => void;
  onMove: (folderId: string) => void;
  onAddToCollection: (collectionId: string) => void;
  onDelete: (id: string) => void;
  folders: MediaFolder[];
  collections: MediaCollection[];
}

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  shortcut?: string;
}

function MenuItem({ icon: Icon, label, onClick, variant = 'default', shortcut }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
        variant === 'destructive'
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-muted',
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <span className="text-xs text-muted-foreground">{shortcut}</span>}
    </button>
  );
}

export function MediaContextMenu({
  x,
  y,
  asset,
  onClose,
  onPreview,
  onDownload,
  onCopyUrl,
  onMove,
  onAddToCollection,
  onDelete,
  folders,
  collections,
}: MediaContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Adjust position if menu would go off screen
  useEffect(() => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 16;
    }

    if (y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 16;
    }

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
  }, [x, y]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-50 cursor-default bg-transparent border-none"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
        aria-label="Close context menu"
        tabIndex={-1}
      />

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 overflow-hidden"
        style={{ left: x, top: y }}
      >
        <MenuItem
          icon={Eye}
          label="Preview"
          onClick={() => {
            onPreview(asset);
            onClose();
          }}
          shortcut="Enter"
        />

        <MenuItem
          icon={Download}
          label="Download"
          onClick={() => {
            onDownload(asset);
            onClose();
          }}
        />

        <MenuItem
          icon={Copy}
          label="Copy URL"
          onClick={() => {
            onCopyUrl(asset);
            onClose();
          }}
        />

        <div className="h-px bg-border my-1" />

        {/* Move to Folder Submenu */}
        <div className="relative group">
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md"
          >
            <FolderInput className="w-4 h-4" />
            <span className="flex-1 text-left">Move to folder</span>
            <span className="text-muted-foreground">▸</span>
          </button>

          <div className="absolute left-full top-0 ml-1 w-48 bg-popover border border-border rounded-lg shadow-lg py-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
            <button
              type="button"
              onClick={() => onMove('')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              Root folder
            </button>
            {folders
              .filter((f) => !f.parentId)
              .map((folder) => (
                <button
                  type="button"
                  key={folder.id}
                  onClick={() => onMove(folder.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  {folder.name}
                </button>
              ))}
          </div>
        </div>

        {/* Add to Collection Submenu */}
        <div className="relative group">
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md"
          >
            <Star className="w-4 h-4" />
            <span className="flex-1 text-left">Add to collection</span>
            <span className="text-muted-foreground">▸</span>
          </button>

          <div className="absolute left-full top-0 ml-1 w-48 bg-popover border border-border rounded-lg shadow-lg py-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
            {collections.map((collection) => (
              <button
                type="button"
                key={collection.id}
                onClick={() => onAddToCollection(collection.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <Star className="w-4 h-4" style={{ color: collection.color }} />
                {collection.name}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border my-1" />

        <MenuItem
          icon={Duplicate}
          label="Duplicate"
          onClick={() => {
            onClose();
          }}
        />

        <MenuItem
          icon={Trash2}
          label="Delete"
          onClick={() => onDelete(asset.id)}
          variant="destructive"
          shortcut="⌫"
        />
      </div>
    </>
  );
}
