'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  ImageIcon,
  Loader2,
  type LucideIcon,
  Moon,
  Square,
  Star,
  Sun,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface LogoAssets {
  primary?: string;
  icon?: string;
  dark?: string;
  favicon?: string;
}

interface LogoSlot {
  id: keyof LogoAssets;
  label: string;
  description: string;
  icon: LucideIcon;
  recommended: string;
  accept: string;
}

interface LogoUploaderProps {
  logos: LogoAssets;
  onLogoChange: (logos: LogoAssets) => void;
  onUpload?: (file: File, slot: keyof LogoAssets) => Promise<string>;
  isUploading?: boolean;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const LOGO_SLOTS: LogoSlot[] = [
  {
    id: 'primary',
    label: 'Primary Logo',
    description: 'Full color logo for headers and marketing',
    icon: ImageIcon,
    recommended: 'SVG or PNG, 200x50px min',
    accept: 'image/svg+xml,image/png,image/jpeg',
  },
  {
    id: 'icon',
    label: 'Icon/Mark',
    description: 'Square icon for compact spaces',
    icon: Square,
    recommended: 'SVG or PNG, 1:1 ratio, 64x64px min',
    accept: 'image/svg+xml,image/png',
  },
  {
    id: 'dark',
    label: 'Dark Mode',
    description: 'Light variant for dark backgrounds',
    icon: Moon,
    recommended: 'Same as primary, inverted colors',
    accept: 'image/svg+xml,image/png,image/jpeg',
  },
  {
    id: 'favicon',
    label: 'Favicon',
    description: 'Browser tab and bookmark icon',
    icon: Star,
    recommended: 'PNG or ICO, 32x32px',
    accept: 'image/png,image/x-icon,image/svg+xml',
  },
];

// ============================================================================
// Sub-Components
// ============================================================================

function LogoSlotCard({
  slot,
  currentLogo,
  isUploading,
  onFileSelect,
  onRemove,
}: {
  slot: LogoSlot;
  currentLogo?: string;
  isUploading: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}): React.JSX.Element {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const Icon = slot.icon;

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setError(null);

      const file = e.dataTransfer.files[0];
      if (file) {
        if (!slot.accept.includes(file.type)) {
          setError('Invalid file type');
          return;
        }
        onFileSelect(file);
      }
    },
    [slot.accept, onFileSelect],
  );

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-linear-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">{slot.label}</h4>
            <p className="text-xs text-muted-foreground">{slot.description}</p>
          </div>
        </div>
        {currentLogo && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-md hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <button
        type="button"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative min-h-[120px] rounded-lg border-2 border-dashed transition-all cursor-pointer w-full',
          'flex flex-col items-center justify-center',
          isDragging
            ? 'border-primary-500 bg-primary-500/10'
            : currentLogo
              ? 'border-white/20 bg-white/5'
              : 'border-white/10 hover:border-white/20 hover:bg-white/5',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={slot.accept}
          onChange={handleFileChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
              <span className="text-xs text-muted-foreground">Uploading...</span>
            </motion.div>
          ) : currentLogo ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full h-full min-h-[100px] p-4"
            >
              <Image
                src={currentLogo}
                alt={slot.label}
                fill
                className="object-contain p-2"
                sizes="200px"
              />
              <div className="absolute top-2 right-2">
                <Check className="h-5 w-5 text-green-400" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground text-center px-4">
                Drop file or click to upload
              </span>
              <span className="text-[10px] text-muted-foreground/60">{slot.recommended}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}

function LogoPreviewPanel({ logos }: { logos: LogoAssets }): React.JSX.Element {
  const [previewMode, setPreviewMode] = React.useState<'light' | 'dark'>('dark');

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Preview</h4>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
          <button
            type="button"
            onClick={() => setPreviewMode('light')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              previewMode === 'light'
                ? 'bg-white/20 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('dark')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              previewMode === 'dark'
                ? 'bg-white/20 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Moon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Header preview */}
      <div
        className={cn('rounded-lg p-4', previewMode === 'dark' ? 'bg-studio-bg-dark' : 'bg-white')}
      >
        <div className="flex items-center justify-between">
          <div className="relative h-8 w-32">
            {(previewMode === 'dark' && logos.dark) || logos.primary ? (
              <Image
                src={(previewMode === 'dark' ? logos.dark : logos.primary) || logos.primary || ''}
                alt="Logo preview"
                fill
                className="object-contain object-left"
                sizes="128px"
              />
            ) : (
              <div
                className={cn(
                  'h-full flex items-center text-sm font-semibold',
                  previewMode === 'dark' ? 'text-white' : 'text-gray-900',
                )}
              >
                Your Logo
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-12 rounded',
                  previewMode === 'dark' ? 'bg-white/20' : 'bg-gray-200',
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Icon preview */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'h-12 w-12 rounded-lg flex items-center justify-center',
            previewMode === 'dark' ? 'bg-white/10' : 'bg-gray-100',
          )}
        >
          {logos.icon ? (
            <Image
              src={logos.icon}
              alt="Icon preview"
              width={32}
              height={32}
              className="object-contain"
            />
          ) : (
            <Square
              className={cn('h-6 w-6', previewMode === 'dark' ? 'text-white/40' : 'text-gray-400')}
            />
          )}
        </div>
        <div>
          <p
            className={cn(
              'text-sm font-medium',
              previewMode === 'dark' ? 'text-white' : 'text-gray-900',
            )}
          >
            App Icon
          </p>
          <p className={cn('text-xs', previewMode === 'dark' ? 'text-white/60' : 'text-gray-500')}>
            Mobile app & shortcuts
          </p>
        </div>
      </div>

      {/* Favicon preview */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded border border-white/20 flex items-center justify-center bg-white/5">
          {logos.favicon ? (
            <Image
              src={logos.favicon}
              alt="Favicon preview"
              width={16}
              height={16}
              className="object-contain"
            />
          ) : (
            <Star className="h-4 w-4 text-white/40" />
          )}
        </div>
        <div>
          <p
            className={cn(
              'text-sm font-medium',
              previewMode === 'dark' ? 'text-white' : 'text-gray-900',
            )}
          >
            Browser Tab
          </p>
          <p className={cn('text-xs', previewMode === 'dark' ? 'text-white/60' : 'text-gray-500')}>
            Favicon appearance
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function LogoUploader({
  logos,
  onLogoChange,
  onUpload,
  isUploading = false,
  className,
}: LogoUploaderProps) {
  const [uploadingSlot, setUploadingSlot] = React.useState<keyof LogoAssets | null>(null);

  const handleFileSelect = React.useCallback(
    async (file: File, slot: keyof LogoAssets) => {
      if (onUpload) {
        setUploadingSlot(slot);
        try {
          const url = await onUpload(file, slot);
          onLogoChange({ ...logos, [slot]: url });
        } catch (error) {
          console.error('Failed to upload logo:', error);
        } finally {
          setUploadingSlot(null);
        }
      } else {
        // Create local URL for preview
        const url = URL.createObjectURL(file);
        onLogoChange({ ...logos, [slot]: url });
      }
    },
    [logos, onLogoChange, onUpload],
  );

  const handleRemove = React.useCallback(
    (slot: keyof LogoAssets) => {
      const newLogos = { ...logos };
      delete newLogos[slot];
      onLogoChange(newLogos);
    },
    [logos, onLogoChange],
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-linear-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Logo Assets</h3>
          <p className="text-sm text-muted-foreground">Upload logos for different contexts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload slots */}
        <div className="space-y-4">
          {LOGO_SLOTS.map((slot) => (
            <LogoSlotCard
              key={slot.id}
              slot={slot}
              currentLogo={logos[slot.id]}
              isUploading={uploadingSlot === slot.id || isUploading}
              onFileSelect={(file) => handleFileSelect(file, slot.id)}
              onRemove={() => handleRemove(slot.id)}
            />
          ))}
        </div>

        {/* Preview panel */}
        <LogoPreviewPanel logos={logos} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onLogoChange({})}
          disabled={Object.keys(logos).length === 0}
          className="text-red-400 border-red-500/30 hover:bg-red-500/10"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
}
