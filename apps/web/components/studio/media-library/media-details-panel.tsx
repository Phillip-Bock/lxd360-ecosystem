'use client';

import {
  Calendar,
  Copy,
  ExternalLink,
  File,
  Film,
  Image,
  Loader2,
  Music,
  Save,
  Tag,
  X,
} from 'lucide-react';
import NextImage from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { MediaAsset, MediaAssetType } from '@/lib/media/types';
import { formatFileSize } from '@/lib/media/types';

// =============================================================================
// Types
// =============================================================================

export interface MediaDetailsPanelProps {
  media: MediaAsset;
  onClose: () => void;
  onUpdate: (mediaId: string, updates: MediaUpdateInput) => Promise<void>;
  isUpdating?: boolean;
}

export interface MediaUpdateInput {
  altText?: string | null;
  description?: string | null;
  tags?: string[];
}

// =============================================================================
// Helpers
// =============================================================================

function getMediaIcon(type: MediaAssetType) {
  switch (type) {
    case 'image':
    case 'icon':
      return Image;
    case 'video':
      return Film;
    case 'audio':
      return Music;
    default:
      return File;
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// =============================================================================
// Component
// =============================================================================

export function MediaDetailsPanel({
  media,
  onClose,
  onUpdate,
  isUpdating = false,
}: MediaDetailsPanelProps) {
  const [altText, setAltText] = useState(media.alt_text || '');
  const [description, setDescription] = useState(media.description || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(media.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  const Icon = getMediaIcon(media.asset_type);
  const hasPreview = media.asset_type === 'image' || media.asset_type === 'icon';
  const hasChanges =
    altText !== (media.alt_text || '') ||
    description !== (media.description || '') ||
    JSON.stringify(tags) !== JSON.stringify(media.tags || []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(media.id, {
        altText: altText || null,
        description: description || null,
        tags,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCopyUrl = () => {
    if (media.public_url) {
      navigator.clipboard.writeText(media.public_url);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-semibold truncate" title={media.original_filename}>
          {media.original_filename}
        </h3>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close details</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Preview */}
        <div className="aspect-video relative bg-zinc-900 rounded-lg overflow-hidden">
          {hasPreview && (media.thumbnail_url || media.public_url) ? (
            <NextImage
              src={media.thumbnail_url || media.public_url || ''}
              alt={media.alt_text || media.original_filename}
              fill
              className="object-contain"
              sizes="400px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="h-16 w-16 text-zinc-700" />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          {media.public_url && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 border-white/10"
                onClick={handleCopyUrl}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy URL
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/10"
                onClick={() => window.open(media.public_url || '', '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Open in new tab</span>
              </Button>
            </>
          )}
        </div>

        <Separator />

        {/* Metadata Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alt-text">Alt Text</Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe this media for accessibility"
              className="bg-zinc-900 border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="bg-zinc-900 border-white/10 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag..."
                className="bg-zinc-900 border-white/10"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-white/10"
                onClick={handleAddTag}
              >
                <Tag className="h-4 w-4" />
                <span className="sr-only">Add tag</span>
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* File Information */}
        <div className="space-y-3 text-sm">
          <h4 className="font-medium text-zinc-300">File Information</h4>

          <div className="grid grid-cols-2 gap-2 text-zinc-500">
            <span>Type</span>
            <span className="text-zinc-300">{media.mime_type}</span>

            <span>Size</span>
            <span className="text-zinc-300">{formatFileSize(media.file_size)}</span>

            {media.metadata?.width && media.metadata?.height && (
              <>
                <span>Dimensions</span>
                <span className="text-zinc-300">
                  {media.metadata.width} × {media.metadata.height}
                </span>
              </>
            )}

            {media.metadata?.duration && (
              <>
                <span>Duration</span>
                <span className="text-zinc-300">
                  {Math.floor(media.metadata.duration / 60)}:
                  {String(Math.floor(media.metadata.duration % 60)).padStart(2, '0')}
                </span>
              </>
            )}

            <span>Usage Count</span>
            <span className="text-zinc-300">{media.usage_count}</span>
          </div>

          <div className="pt-2 space-y-1 text-zinc-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(media.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated {formatDate(media.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {hasChanges && (
        <div className="p-4 border-t border-white/10">
          <Button
            type="button"
            className="w-full"
            onClick={handleSave}
            disabled={isSaving || isUpdating}
          >
            {isSaving || isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
