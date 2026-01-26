'use client';

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { updateAvatarUrl } from '@/lib/actions/user-settings';
import { getFirebaseStorage } from '@/lib/firebase/client';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  displayName: string;
  userId: string;
  tenantId?: string;
  onUploadComplete?: (url: string) => void;
}

export function AvatarUpload({
  currentAvatarUrl,
  displayName,
  userId,
  tenantId,
  onUploadComplete,
}: AvatarUploadProps): React.JSX.Element {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  }, []);

  const handleCancelPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  }, [previewUrl]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const storage = getFirebaseStorage();
      if (!storage) {
        throw new Error('Firebase Storage not available');
      }

      // Get file extension
      const ext = selectedFile.name.split('.').pop() || 'jpg';

      // Create storage path: avatars/{tenantId}/{userId}/avatar.{ext}
      const storagePath = tenantId
        ? `avatars/${tenantId}/${userId}/avatar.${ext}`
        : `avatars/${userId}/avatar.${ext}`;

      const storageRef = ref(storage, storagePath);

      // Upload the file
      const snapshot = await uploadBytes(storageRef, selectedFile, {
        contentType: selectedFile.type,
      });

      // Get the download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Update the user profile with the new avatar URL
      const result = await updateAvatarUrl(downloadUrl);

      if ('error' in result) {
        throw new Error(result.error);
      }

      toast.success('Avatar updated successfully');
      onUploadComplete?.(downloadUrl);

      // Clean up preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload avatar';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, userId, tenantId, onUploadComplete, previewUrl]);

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-border">
          {displayUrl ? (
            <AvatarImage asChild src={displayUrl}>
              <Image
                src={displayUrl}
                alt={displayName || 'User avatar'}
                width={96}
                height={96}
                className="object-cover"
              />
            </AvatarImage>
          ) : null}
          <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
            {getInitials(displayName || 'U')}
          </AvatarFallback>
        </Avatar>
        {!previewUrl && (
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--color-lxd-primary)] text-white shadow-md hover:bg-[var(--color-lxd-primary)]/90 transition-colors"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Upload avatar</span>
          </label>
        )}
      </div>

      {/* Upload Input (hidden) */}
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      {/* Drag & Drop Zone (shown when no preview) */}
      {!previewUrl && (
        <label
          htmlFor="avatar-upload"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="block w-full max-w-xs rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-[var(--color-lxd-primary)]/50 cursor-pointer"
        >
          <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Drag & drop an image, or{' '}
            <span className="text-[var(--color-lxd-primary)] hover:underline">browse</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG/GIF</p>
        </label>
      )}

      {/* Preview Actions */}
      {previewUrl && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancelPreview}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-1" aria-hidden="true" />
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={isUploading}
            className="bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" aria-hidden="true" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-1" aria-hidden="true" />
                Save Avatar
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
