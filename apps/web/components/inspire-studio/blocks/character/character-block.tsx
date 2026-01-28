'use client';

import { motion } from 'framer-motion';
import { Edit3, Link, Trash2, Upload, User } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import type { BlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

// Extended interface for Character block with editor-specific properties
interface CharacterBlockContent extends BlockContent {
  name?: string;
  role?: string;
  avatar?: string;
  mood?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'confused' | 'thinking' | 'excited';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  shape?: 'circle' | 'square' | 'rounded';
  backgroundColor?: string;
  showName?: boolean;
  animated?: boolean;
}

const CHARACTER_MOODS = [
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'angry', label: 'Angry', emoji: '😠' },
  { value: 'surprised', label: 'Surprised', emoji: '😲' },
  { value: 'confused', label: 'Confused', emoji: '😕' },
  { value: 'thinking', label: 'Thinking', emoji: '🤔' },
  { value: 'excited', label: 'Excited', emoji: '🎉' },
];

const AVATAR_SIZES = [
  { value: 'small', label: 'S', size: 64 },
  { value: 'medium', label: 'M', size: 96 },
  { value: 'large', label: 'L', size: 128 },
  { value: 'xlarge', label: 'XL', size: 160 },
];

const AVATAR_SHAPES = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
];

const PRESET_COLORS = [
  'var(--color-studio-accent)',
  '#BA23FB',
  'var(--color-lxd-success)',
  'var(--color-lxd-warning)',
  'var(--color-lxd-error)',
  '#06b6d4',
  '#ec4899',
  'var(--color-studio-text-muted)',
];

/**
 * CharacterBlock - Character avatar component
 */
export function CharacterBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<CharacterBlockContent>): React.JSX.Element {
  const content = block.content as CharacterBlockContent;
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default values with proper type handling
  const name: string = content.name ?? 'Character';
  const role: string = content.role ?? '';
  const avatar: string | undefined = content.avatar;
  const mood: string = content.mood ?? 'neutral';
  const size: string = content.size ?? 'medium';
  const shape: string = content.shape ?? 'circle';
  const backgroundColor: string = content.backgroundColor ?? 'var(--color-lxd-dark-surface-alt)';
  const showName: boolean = content.showName !== false;
  const animated: boolean = content.animated ?? false;

  // Get size in pixels
  const sizeConfig = AVATAR_SIZES.find((s) => s.value === size) || AVATAR_SIZES[1];
  const pixelSize = sizeConfig.size;

  // Get border radius
  const getBorderRadius = (): string => {
    switch (shape) {
      case 'square':
        return '8px';
      case 'rounded':
        return '24px';
      default:
        return '50%';
    }
  };

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onUpdate({
            content: {
              ...content,
              avatar: event.target?.result as string,
            },
          });
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
          avatar: urlInput,
        },
      });
      setUrlInput('');
      setShowUrlInput(false);
    }
  }, [content, urlInput, onUpdate]);

  // Preview mode
  if (!isEditing) {
    return (
      <div className="flex flex-col items-center gap-2">
        <motion.div
          className="relative"
          animate={
            animated
              ? {
                  y: [0, -5, 0],
                }
              : undefined
          }
          transition={
            animated
              ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : undefined
          }
        >
          {/* Avatar */}
          <div
            className="flex items-center justify-center overflow-hidden"
            style={{
              width: pixelSize,
              height: pixelSize,
              borderRadius: getBorderRadius(),
              backgroundColor: avatar ? 'transparent' : backgroundColor,
            }}
          >
            {avatar ? (
              <Image
                src={avatar}
                alt={name}
                width={pixelSize}
                height={pixelSize}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-1/2 h-1/2 text-brand-primary/50" />
            )}
          </div>

          {/* Mood indicator */}
          {mood !== 'neutral' && (
            <div className="absolute -bottom-1 -right-1 text-2xl">
              {CHARACTER_MOODS.find((m) => m.value === mood)?.emoji}
            </div>
          )}
        </motion.div>

        {/* Name & Role */}
        {showName && (
          <div className="text-center">
            <p className="font-medium text-brand-primary">{name}</p>
            {role && <p className="text-sm text-studio-text-muted">{role}</p>}
          </div>
        )}
      </div>
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

      {/* Character preview */}
      <div className="flex items-center gap-6">
        {/* Avatar editor */}
        <button
          type="button"
          className="relative group flex items-center justify-center overflow-hidden cursor-pointer border-0"
          style={{
            width: pixelSize,
            height: pixelSize,
            borderRadius: getBorderRadius(),
            backgroundColor: avatar ? 'transparent' : backgroundColor,
          }}
          onClick={() => fileInputRef.current?.click()}
          aria-label={avatar ? `Change avatar for ${name}` : `Upload avatar for ${name}`}
        >
          {avatar ? (
            <>
              <Image
                src={avatar}
                alt={name}
                width={pixelSize}
                height={pixelSize}
                unoptimized
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-6 h-6 text-brand-primary" aria-hidden="true" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-brand-primary/50 group-hover:text-brand-primary transition-colors">
              <Upload className="w-8 h-8" aria-hidden="true" />
              <span className="text-xs mt-1">Upload</span>
            </div>
          )}

          {/* Mood indicator */}
          {mood !== 'neutral' && (
            <span className="absolute -bottom-1 -right-1 text-2xl" aria-hidden="true">
              {CHARACTER_MOODS.find((m) => m.value === mood)?.emoji}
            </span>
          )}
        </button>

        {/* Name & Role inputs */}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => onUpdate({ content: { ...content, name: e.target.value } })}
            className="w-full px-3 py-2 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary font-medium outline-hidden focus:border-studio-accent/50"
            placeholder="Character name..."
          />
          <input
            type="text"
            value={role}
            onChange={(e) => onUpdate({ content: { ...content, role: e.target.value } })}
            className="w-full px-3 py-2 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary text-sm outline-hidden focus:border-studio-accent/50"
            placeholder="Role (e.g., Manager, Expert)..."
          />
        </div>
      </div>

      {/* Image URL option */}
      {!avatar && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-1 text-sm text-studio-text-muted hover:text-studio-accent"
          >
            <Link className="w-4 h-4" />
            Add image from URL
          </button>
          {showUrlInput && (
            <>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-3 py-1.5 bg-studio-accent text-brand-primary rounded-lg text-sm"
              >
                Add
              </button>
            </>
          )}
        </div>
      )}

      {/* Avatar exists - remove option */}
      {avatar && (
        <button
          type="button"
          onClick={() => onUpdate({ content: { ...content, avatar: undefined } })}
          className="flex items-center gap-1 text-sm text-brand-error hover:text-red-300"
        >
          <Trash2 className="w-4 h-4" />
          Remove avatar
        </button>
      )}

      {/* Settings */}
      <div className="p-4 bg-studio-bg rounded-lg border border-studio-surface/30 space-y-4">
        {/* Mood */}
        <fieldset className="space-y-2 border-0 p-0 m-0">
          <legend className="block text-sm text-studio-text-muted">Mood</legend>
          <div className="flex flex-wrap gap-2">
            {CHARACTER_MOODS.map((m) => (
              <button
                type="button"
                key={m.value}
                onClick={() => onUpdate({ content: { ...content, mood: m.value as unknown } })}
                aria-pressed={mood === m.value}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors
                  ${
                    mood === m.value
                      ? 'bg-studio-accent text-brand-primary'
                      : 'bg-studio-bg-dark text-studio-text-muted hover:text-brand-primary border border-studio-surface/50'
                  }
                `}
              >
                <span aria-hidden="true">{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Size & Shape */}
        <div className="flex gap-4">
          <fieldset className="space-y-2 border-0 p-0 m-0">
            <legend className="block text-sm text-studio-text-muted">Size</legend>
            <div className="flex gap-1">
              {AVATAR_SIZES.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => onUpdate({ content: { ...content, size: s.value as unknown } })}
                  aria-pressed={size === s.value}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition-colors
                    ${
                      size === s.value
                        ? 'bg-studio-accent text-brand-primary'
                        : 'bg-studio-bg-dark text-studio-text-muted hover:text-brand-primary border border-studio-surface/50'
                    }
                  `}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2 border-0 p-0 m-0">
            <legend className="block text-sm text-studio-text-muted">Shape</legend>
            <div className="flex gap-1">
              {AVATAR_SHAPES.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => onUpdate({ content: { ...content, shape: s.value as unknown } })}
                  aria-pressed={shape === s.value}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition-colors
                    ${
                      shape === s.value
                        ? 'bg-studio-accent text-brand-primary'
                        : 'bg-studio-bg-dark text-studio-text-muted hover:text-brand-primary border border-studio-surface/50'
                    }
                  `}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Background color (when no avatar) */}
        {!avatar && (
          <fieldset className="space-y-2 border-0 p-0 m-0">
            <legend className="block text-sm text-studio-text-muted">Background Color</legend>
            <div className="flex items-center gap-2">
              <input
                id="background-color-picker"
                type="color"
                value={backgroundColor}
                onChange={(e) =>
                  onUpdate({ content: { ...content, backgroundColor: e.target.value } })
                }
                className="w-10 h-10 rounded cursor-pointer"
                aria-label="Custom background color"
              />
              <div className="flex gap-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => onUpdate({ content: { ...content, backgroundColor: color } })}
                    aria-label={`Set background color to ${color}`}
                    aria-pressed={backgroundColor === color}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-transform
                      ${backgroundColor === color ? 'scale-110 border-white' : 'border-transparent hover:scale-105'}
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </fieldset>
        )}

        {/* Options */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showName}
              onChange={(e) => onUpdate({ content: { ...content, showName: e.target.checked } })}
              className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
            />
            <span className="text-sm text-studio-text-muted">Show name</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={animated}
              onChange={(e) => onUpdate({ content: { ...content, animated: e.target.checked } })}
              className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
            />
            <span className="text-sm text-studio-text-muted">Animate</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default CharacterBlock;
