'use client';

import {
  Calendar,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  HardDrive,
  ImageIcon,
  Save,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { type AssetCategory, formatFileSize } from '@/lib/assets/mimeTypes';
import { type AssetMetadata, updateAssetMetadata } from '@/lib/assets/storage';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface AssetMetadataPanelProps {
  asset: AssetMetadata | null;
  tenantId: string;
  onClose: () => void;
  onSave?: (asset: AssetMetadata) => void;
  onRequestAITags?: (asset: AssetMetadata) => void;
  className?: string;
}

// =============================================================================
// Category Icons
// =============================================================================

const CategoryIcon: Record<AssetCategory, typeof FileImage> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  document: FileText,
};

// =============================================================================
// Asset Metadata Panel Component
// =============================================================================

export function AssetMetadataPanel({
  asset,
  tenantId,
  onClose,
  onSave,
  onRequestAITags,
  className,
}: AssetMetadataPanelProps) {
  const [altText, setAltText] = useState(asset?.altText ?? '');
  const [tags, setTags] = useState<string[]>(asset?.tags ?? []);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Handle alt text change
  const handleAltTextChange = useCallback((value: string) => {
    setAltText(value);
    setHasChanges(true);
  }, []);

  // Add tag
  const addTag = useCallback(() => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setNewTag('');
      setHasChanges(true);
    }
  }, [newTag, tags]);

  // Remove tag
  const removeTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
    setHasChanges(true);
  }, []);

  // Handle key press for tag input
  const handleTagKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    },
    [addTag],
  );

  // Save changes
  const handleSave = useCallback(async () => {
    if (!asset) return;

    setIsSaving(true);
    try {
      await updateAssetMetadata(tenantId, asset.id, {
        altText,
        tags,
      });

      const updatedAsset: AssetMetadata = {
        ...asset,
        altText,
        tags,
      };

      onSave?.(updatedAsset);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save asset metadata:', error);
    } finally {
      setIsSaving(false);
    }
  }, [asset, tenantId, altText, tags, onSave]);

  // Request AI tags
  const handleRequestAITags = useCallback(() => {
    if (asset && onRequestAITags) {
      onRequestAITags(asset);
    }
  }, [asset, onRequestAITags]);

  if (!asset) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
        <FileImage className="w-12 h-12 text-white/20 mb-3" />
        <p className="text-sm text-white/50">Select an asset to view details</p>
      </div>
    );
  }

  const Icon = CategoryIcon[asset.category];
  const uploadDate = asset.uploadedAt?.toDate?.()?.toLocaleString?.() ?? 'Unknown';

  return (
    <div className={cn('flex flex-col h-full bg-lxd-dark-bg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-lxd-dark-border">
        <h3 className="text-sm font-semibold text-white">Asset Details</h3>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Preview */}
        <div className="aspect-video rounded-lg overflow-hidden bg-lxd-dark-surface flex items-center justify-center relative">
          {asset.category === 'image' ? (
            <Image
              src={asset.url}
              alt={asset.altText || asset.originalFileName}
              fill
              className="object-contain"
              unoptimized
            />
          ) : (
            <Icon className="w-16 h-16 text-white/20" />
          )}
        </div>

        {/* File Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            File Information
          </h4>

          <div className="space-y-2">
            <InfoRow
              icon={<Icon className="w-4 h-4" />}
              label="Name"
              value={asset.originalFileName}
            />
            <InfoRow icon={<Tag className="w-4 h-4" />} label="Type" value={asset.mimeType} />
            <InfoRow
              icon={<HardDrive className="w-4 h-4" />}
              label="Size"
              value={formatFileSize(asset.size)}
            />
            {asset.width && asset.height && (
              <InfoRow
                icon={<ImageIcon className="w-4 h-4" />}
                label="Dimensions"
                value={`${asset.width} × ${asset.height}`}
              />
            )}
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Uploaded" value={uploadDate} />
          </div>
        </div>

        <Separator className="bg-lxd-dark-border" />

        {/* Alt Text */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Alt Text
            </h4>
            {asset.category === 'image' && onRequestAITags && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleRequestAITags}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Generate with AI
              </Button>
            )}
          </div>
          <Textarea
            value={altText}
            onChange={(e) => handleAltTextChange(e.target.value)}
            placeholder="Describe this image for accessibility..."
            className="min-h-[80px] text-sm bg-lxd-dark-surface border-lxd-dark-border resize-none"
          />
          <p className="text-[10px] text-white/40">
            Alt text helps screen readers describe images to visually impaired users
          </p>
        </div>

        <Separator className="bg-lxd-dark-border" />

        {/* Tags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Tags</h4>
            {onRequestAITags && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleRequestAITags}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Suggest Tags
              </Button>
            )}
          </div>

          {/* Tag Input */}
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="Add tag..."
              className="flex-1 h-8 text-sm bg-lxd-dark-surface border-lxd-dark-border"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={addTag}
              disabled={!newTag.trim()}
            >
              Add
            </Button>
          </div>

          {/* Tag List */}
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-lxd-dark-surface hover:bg-lxd-dark-surface"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {tags.length === 0 && <p className="text-xs text-white/30">No tags added</p>}
          </div>
        </div>

        {/* Dominant Colors (for images) */}
        {asset.dominantColors && asset.dominantColors.length > 0 && (
          <>
            <Separator className="bg-lxd-dark-border" />
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Dominant Colors
              </h4>
              <div className="flex gap-2">
                {asset.dominantColors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded border border-lxd-dark-border"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {hasChanges && (
        <div className="p-4 border-t border-lxd-dark-border">
          <Button
            type="button"
            className="w-full bg-lxd-cyan hover:bg-lxd-cyan/80"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Info Row Component
// =============================================================================

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-white/40">{icon}</span>
      <span className="text-white/60 w-20">{label}</span>
      <span className="text-white flex-1 truncate" title={value}>
        {value}
      </span>
    </div>
  );
}

export default AssetMetadataPanel;
