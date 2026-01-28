'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Circle,
  Image as ImageIcon,
  Info,
  Link,
  MapPin,
  Plus,
  Square,
  Target,
  Trash2,
  Upload,
} from 'lucide-react';
import NextImage from 'next/image';
import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { safeInnerHtml } from '@/lib/sanitize';
import type { Hotspot, HotspotBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

const HOTSPOT_ICONS = [
  { value: 'circle', label: 'Circle', icon: Circle },
  { value: 'square', label: 'Square', icon: Square },
  { value: 'pin', label: 'Pin', icon: MapPin },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'info', label: 'Info', icon: Info },
  { value: 'alert', label: 'Alert', icon: AlertCircle },
  { value: 'check', label: 'Check', icon: CheckCircle },
];

const HOTSPOT_COLORS = [
  'var(--color-studio-accent)',
  '#BA23FB',
  'var(--success)',
  'var(--color-block-interactive)',
  'var(--error)',
  '#06b6d4',
  '#ec4899',
];

/**
 * HotspotBlock - Interactive image with hotspots
 */
export function HotspotBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<HotspotBlockContent>): React.JSX.Element {
  const content = block.content as HotspotBlockContent;
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<string | null>(null);
  const [isAddingHotspot, setIsAddingHotspot] = useState(false);
  const [draggingHotspot, setDraggingHotspot] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hotspots = useMemo(() => content.hotspots || [], [content.hotspots]);
  const imageUrl = content.imageUrl;

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event): void => {
          onUpdate({
            content: {
              ...content,
              imageUrl: event.target?.result as string,
            },
          });
          setShowImageUpload(false);
        };
        reader.readAsDataURL(file);
      }
    },
    [content, onUpdate],
  );

  // Handle URL submission
  const handleUrlSubmit = useCallback(() => {
    if (urlInput) {
      onUpdate({
        content: {
          ...content,
          imageUrl: urlInput,
        },
      });
      setUrlInput('');
      setShowImageUpload(false);
    }
  }, [content, urlInput, onUpdate]);

  // Add hotspot at click position
  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isAddingHotspot || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newHotspot: Hotspot = {
        id: `hotspot-${Date.now()}`,
        x,
        y,
        label: 'New Hotspot',
        title: 'New Hotspot',
        content: '',
        icon: 'circle',
        color: HOTSPOT_COLORS[hotspots.length % HOTSPOT_COLORS.length],
      };

      onUpdate({
        content: {
          ...content,
          hotspots: [...hotspots, newHotspot],
        },
      });

      setIsAddingHotspot(false);
      setEditingHotspot(newHotspot.id);
    },
    [isAddingHotspot, content, hotspots, onUpdate],
  );

  // Update hotspot
  const updateHotspot = useCallback(
    (hotspotId: string, updates: Partial<Hotspot>) => {
      onUpdate({
        content: {
          ...content,
          hotspots: hotspots.map((h) => (h.id === hotspotId ? { ...h, ...updates } : h)),
        },
      });
    },
    [content, hotspots, onUpdate],
  );

  // Delete hotspot
  const deleteHotspot = useCallback(
    (hotspotId: string) => {
      onUpdate({
        content: {
          ...content,
          hotspots: hotspots.filter((h) => h.id !== hotspotId),
        },
      });
      if (editingHotspot === hotspotId) setEditingHotspot(null);
      if (activeHotspot === hotspotId) setActiveHotspot(null);
    },
    [content, hotspots, editingHotspot, activeHotspot, onUpdate],
  );

  // Handle hotspot drag
  const handleHotspotDrag = useCallback(
    (hotspotId: string, e: React.MouseEvent) => {
      if (!isEditing || !containerRef.current) return;

      e.preventDefault();
      e.stopPropagation();
      setDraggingHotspot(hotspotId);

      const rect = containerRef.current.getBoundingClientRect();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const x = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((moveEvent.clientY - rect.top) / rect.height) * 100));
        updateHotspot(hotspotId, { x, y });
      };

      const handleMouseUp = () => {
        setDraggingHotspot(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [isEditing, updateHotspot],
  );

  // Get hotspot icon component
  const getHotspotIcon = (iconType: string) => {
    const found = HOTSPOT_ICONS.find((i) => i.value === iconType);
    return found?.icon || Circle;
  };

  // Render hotspot marker
  const renderHotspot = (hotspot: Hotspot, clickable: boolean = true) => {
    const Icon = getHotspotIcon(hotspot.icon || 'circle');
    const isActive = activeHotspot === hotspot.id;
    const isEditing = editingHotspot === hotspot.id;
    const isDragging = draggingHotspot === hotspot.id;

    return (
      <div
        key={hotspot.id}
        className={`
          absolute transform -translate-x-1/2 -translate-y-1/2
          ${clickable ? 'cursor-pointer' : ''}
          ${isDragging ? 'z-30' : 'z-20'}
        `}
        style={{
          left: `${hotspot.x}%`,
          top: `${hotspot.y}%`,
        }}
      >
        {/* Marker */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            if (clickable) {
              setActiveHotspot(isActive ? null : hotspot.id);
            }
          }}
          onMouseDown={(e) => {
            if (isEditing) {
              handleHotspotDrag(hotspot.id, e);
            }
          }}
          className={`
            relative flex items-center justify-center w-10 h-10 rounded-full
            transition-transform duration-200
            ${isActive || isEditing ? 'scale-125' : 'hover:scale-110'}
            ${isDragging ? 'cursor-grabbing' : isEditing ? 'cursor-grab' : ''}
          `}
          style={{
            backgroundColor: `${hotspot.color}20`,
            borderColor: hotspot.color,
            borderWidth: 2,
          }}
          animate={{
            scale: isActive ? [1, 1.1, 1] : 1,
          }}
          transition={{
            repeat: isActive ? Infinity : 0,
            duration: 2,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: hotspot.color }} />

          {/* Pulse effect */}
          {!isEditing && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ borderColor: hotspot.color, borderWidth: 2 }}
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </motion.button>

        {/* Tooltip/popup */}
        <AnimatePresence>
          {isActive && !isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute z-40 top-full left-1/2 -translate-x-1/2 mt-2 w-64"
            >
              <div className="bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl overflow-hidden">
                {/* Header */}
                <div
                  className="px-4 py-2 border-b border-studio-surface/30"
                  style={{ backgroundColor: `${hotspot.color}10` }}
                >
                  <h4 className="font-medium text-brand-primary">
                    {hotspot.title || hotspot.label}
                  </h4>
                </div>
                {/* Content */}
                {hotspot.content && (
                  <div className="px-4 py-3">
                    <div
                      className="text-sm text-studio-text"
                      {...safeInnerHtml(hotspot.content, 'rich')}
                    />
                  </div>
                )}
                {/* Close hint */}
                <div className="px-4 py-2 border-t border-studio-surface/30 text-xs text-studio-text-muted">
                  Click anywhere to close
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Empty state - no image
  if (!imageUrl) {
    return (
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          type="button"
          className="w-full aspect-video bg-studio-bg border-2 border-dashed border-studio-surface rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-studio-accent/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-full bg-studio-surface/30 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-studio-text-muted" aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="text-studio-text font-medium">Add an image to create hotspots</p>
            <p className="text-sm text-studio-text-muted mt-1">Click to upload or drag and drop</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setShowImageUpload(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-studio-text-muted hover:text-studio-accent"
        >
          <Link className="w-4 h-4" aria-hidden="true" />
          Add from URL
        </button>

        {showImageUpload && (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-3 py-2 bg-studio-accent text-brand-primary rounded-lg text-sm"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowImageUpload(false)}
              className="px-3 py-2 text-studio-text-muted"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  // Preview mode
  if (!isEditing) {
    return (
      <section
        ref={containerRef}
        aria-label="Hotspot image viewer"
        className="relative rounded-lg overflow-hidden"
        onClick={() => setActiveHotspot(null)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setActiveHotspot(null);
          }
        }}
      >
        <NextImage
          src={imageUrl}
          alt={
            ((content as Record<string, unknown>).imageAlt as string) || 'Hotspot interactive image'
          }
          width={800}
          height={600}
          unoptimized
          className="w-full h-auto"
        />
        {hotspots.map((h: Hotspot) => renderHotspot(h, true))}
      </section>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => setIsAddingHotspot(!isAddingHotspot)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
            ${
              isAddingHotspot
                ? 'bg-studio-accent text-brand-primary'
                : 'bg-studio-bg border border-studio-surface/50 text-studio-text hover:border-studio-accent/50'
            }
          `}
        >
          <Plus className="w-4 h-4" />
          {isAddingHotspot ? 'Click on image to place' : 'Add Hotspot'}
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-sm text-studio-text hover:border-studio-accent/50"
        >
          <Upload className="w-4 h-4" />
          Change Image
        </button>

        <span className="text-sm text-studio-text-muted">
          {hotspots.length} hotspot{hotspots.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Image with hotspots */}
      <section
        ref={containerRef}
        aria-label={isAddingHotspot ? 'Click to place hotspot' : 'Hotspot editor'}
        className={`
          relative rounded-lg overflow-hidden
          ${isAddingHotspot ? 'cursor-crosshair' : ''}
        `}
        onClick={handleImageClick}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && isAddingHotspot) {
            setIsAddingHotspot(false);
          }
        }}
      >
        <NextImage
          src={imageUrl}
          alt={
            ((content as Record<string, unknown>).imageAlt as string) || 'Hotspot interactive image'
          }
          width={800}
          height={600}
          unoptimized
          className="w-full h-auto"
        />

        {/* Overlay when adding */}
        {isAddingHotspot && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <p className="text-brand-primary text-lg font-medium">Click to place hotspot</p>
          </div>
        )}

        {/* Hotspots */}
        {hotspots.map((h: Hotspot) => renderHotspot(h, false))}
      </section>

      {/* Hotspot list */}
      {hotspots.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-studio-text-muted">Hotspots</h4>
          <div className="space-y-2">
            {hotspots.map((hotspot: Hotspot) => {
              const Icon = getHotspotIcon(hotspot.icon || 'circle');
              const isSelected = editingHotspot === hotspot.id;

              return (
                <article
                  key={hotspot.id}
                  className={`
                    p-3 rounded-lg border transition-colors
                    ${
                      isSelected
                        ? 'bg-studio-accent/10 border-studio-accent/30'
                        : 'bg-studio-bg border-studio-surface/30 hover:border-studio-surface'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingHotspot(isSelected ? null : hotspot.id)}
                      aria-expanded={isSelected}
                      aria-label={`${isSelected ? 'Collapse' : 'Expand'} hotspot: ${hotspot.title || hotspot.label}`}
                      className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: `${hotspot.color}20` }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: hotspot.color }}
                        aria-hidden="true"
                      />
                    </button>
                    <div className="flex-1">
                      <label className="sr-only" htmlFor={`hotspot-title-${hotspot.id}`}>
                        Hotspot title
                      </label>
                      <input
                        id={`hotspot-title-${hotspot.id}`}
                        type="text"
                        value={hotspot.title || hotspot.label}
                        onChange={(e) =>
                          updateHotspot(hotspot.id, {
                            title: e.target.value,
                            label: e.target.value,
                          })
                        }
                        className="w-full bg-transparent text-brand-primary font-medium outline-hidden"
                        placeholder="Hotspot title..."
                      />
                      <p className="text-xs text-studio-text-muted">
                        Position: {Math.round(hotspot.x)}%, {Math.round(hotspot.y)}%
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteHotspot(hotspot.id)}
                      aria-label={`Delete hotspot: ${hotspot.title || hotspot.label}`}
                      className="p-1 text-studio-text-muted hover:text-(--error) transition-colors"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Expanded editor */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-studio-surface/30 space-y-3">
                      {/* Content */}
                      <label className="block">
                        <span className="block text-xs text-studio-text-muted mb-1">Content</span>
                        <textarea
                          value={hotspot.content || ''}
                          onChange={(e) => updateHotspot(hotspot.id, { content: e.target.value })}
                          className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm resize-none"
                          rows={3}
                          placeholder="HTML content..."
                          onClick={(e) => e.stopPropagation()}
                        />
                      </label>

                      {/* Icon & Color */}
                      <div className="flex gap-4">
                        <label className="flex-1 block">
                          <span className="block text-xs text-studio-text-muted mb-1">Icon</span>
                          <select
                            value={hotspot.icon || 'circle'}
                            onChange={(e) => updateHotspot(hotspot.id, { icon: e.target.value })}
                            className="w-full px-2 py-1.5 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {HOTSPOT_ICONS.map((i) => (
                              <option key={i.value} value={i.value}>
                                {i.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <fieldset className="border-0 p-0 m-0">
                          <legend className="block text-xs text-studio-text-muted mb-1">
                            Color
                          </legend>
                          <div
                            className="flex gap-1"
                            role="radiogroup"
                            aria-label="Hotspot color selection"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            {HOTSPOT_COLORS.map((color) => (
                              <button
                                type="button"
                                key={color}
                                onClick={() => updateHotspot(hotspot.id, { color })}
                                aria-label={`Select color ${color}`}
                                aria-pressed={hotspot.color === color}
                                className={`
                                  w-6 h-6 rounded-full border-2 transition-transform
                                  ${hotspot.color === color ? 'scale-110 border-white' : 'border-transparent hover:scale-105'}
                                `}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </fieldset>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default HotspotBlock;
