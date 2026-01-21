'use client';

import { format } from 'date-fns';
import {
  Box,
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  File,
  FileText,
  Film,
  HardDrive,
  Image as ImageIcon,
  Link2,
  type LucideIcon,
  Music,
  Replace,
  Ruler,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  formatDimensions,
  formatDuration,
  formatFileSize,
  type MediaAsset,
  type MediaAssetType,
} from '@/types/media-library';

interface MediaDetailsProps {
  asset: MediaAsset;
  selectedCount: number;
  onClose: () => void;
  onDownload: (asset: MediaAsset) => void;
  onDelete: (id: string) => void;
  onPreview: (asset: MediaAsset) => void;
}

const TYPE_ICONS: Record<MediaAssetType, LucideIcon> = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
  '3d': Box,
  other: File,
};

export function MediaDetails({
  asset,
  selectedCount,
  onClose,
  onDownload,
  onDelete,
  onPreview,
}: MediaDetailsProps) {
  const [title, setTitle] = useState(asset.title);
  const [description, setDescription] = useState(asset.description || '');
  const [altText, setAltText] = useState(asset.altText || '');
  const [tags, setTags] = useState<string[]>(asset.tags);
  const [newTag, setNewTag] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const TypeIcon = TYPE_ICONS[asset.type];

  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [asset.url]);

  const handleAddTag = useCallback(() => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  }, [newTag, tags]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      setTags(tags.filter((t) => t !== tagToRemove));
    },
    [tags],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag],
  );

  const handleSave = useCallback(() => {
    // TODO(LXD-404): Implement media details save to Firestore
    setIsEditing(false);
  }, []);

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <h3 className="font-semibold text-foreground">
          {selectedCount > 1 ? `${selectedCount} selected` : 'Details'}
        </h3>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Preview */}
          <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
            {asset.thumbnailUrl ? (
              <Image
                src={asset.thumbnailUrl}
                alt={asset.altText || asset.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <TypeIcon className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}

            {/* Preview button */}
            <button
              type="button"
              onClick={() => onPreview(asset)}
              className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all group"
            >
              <div className="bg-brand-surface/90 rounded-full p-3">
                <Eye className="w-6 h-6 text-foreground" />
              </div>
            </button>

            {/* Duration/dimensions overlay */}
            {(asset.duration || (asset.width && asset.height)) && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-brand-primary text-xs px-2 py-1 rounded">
                {asset.duration
                  ? formatDuration(asset.duration)
                  : formatDimensions(asset.width, asset.height)}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onDownload(asset)}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={handleCopyUrl}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </Button>
          </div>

          <Separator />

          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="title"
                className="text-xs text-muted-foreground uppercase tracking-wider"
              >
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsEditing(true);
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-xs text-muted-foreground uppercase tracking-wider"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="Add a description..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>

            {asset.type === 'image' && (
              <div>
                <Label
                  htmlFor="altText"
                  className="text-xs text-muted-foreground uppercase tracking-wider"
                >
                  Alt Text
                </Label>
                <Textarea
                  id="altText"
                  value={altText}
                  onChange={(e) => {
                    setAltText(e.target.value);
                    setIsEditing(true);
                  }}
                  placeholder="Describe this image for accessibility..."
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>
            )}

            {/* Tags */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Tags</Label>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveTag(tag);
                        setIsEditing(true);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tag..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    handleAddTag();
                    setIsEditing(true);
                  }}
                  disabled={!newTag.trim()}
                >
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {isEditing && (
            <Button className="w-full" onClick={handleSave}>
              Save Changes
            </Button>
          )}

          <Separator />

          {/* File Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              File Information
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <File className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1" title={asset.filename}>
                  {asset.filename}
                </span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <TypeIcon className="w-4 h-4 shrink-0" />
                <span className="capitalize">{asset.type}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{asset.mimeType}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="w-4 h-4 shrink-0" />
                <span>{formatFileSize(asset.size)}</span>
              </div>

              {asset.width && asset.height && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ruler className="w-4 h-4 shrink-0" />
                  <span>{formatDimensions(asset.width, asset.height)}</span>
                </div>
              )}

              {asset.duration && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{formatDuration(asset.duration)}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Uploaded {format(new Date(asset.uploadedAt), 'MMM d, yyyy')}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Link2 className="w-4 h-4 shrink-0" />
                <span>
                  Used in {asset.usageCount} {asset.usageCount === 1 ? 'place' : 'places'}
                </span>
              </div>
            </div>
          </div>

          {/* Usage */}
          {asset.usageCount > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Where it's used
                </h4>
                <div className="space-y-2">
                  {/* Mock usage data */}
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground truncate">
                      Introduction to React Course
                    </span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto shrink-0" />
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground truncate">Getting Started Module</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto shrink-0" />
                  </button>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Actions
            </h4>

            <Button variant="outline" className="w-full gap-2">
              <Replace className="w-4 h-4" />
              Replace File
            </Button>

            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={() => onDelete(asset.id)}
            >
              <Trash2 className="w-4 h-4" />
              Delete Asset
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
