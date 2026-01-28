'use client';

import { motion } from 'framer-motion';
import { Link, Trash2, Upload, User, Volume2 } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DialogueBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

const BUBBLE_STYLES = [
  { value: 'speech', label: 'Speech Bubble' },
  { value: 'thought', label: 'Thought Bubble' },
  { value: 'narration', label: 'Narration' },
  { value: 'whisper', label: 'Whisper' },
  { value: 'shout', label: 'Shout' },
];

const SPEAKER_POSITIONS = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'center', label: 'Center' },
];

/**
 * DialogueBlock - Character dialogue/speech bubble
 */
export function DialogueBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<DialogueBlockContent>): React.JSX.Element {
  const content = block.content as DialogueBlockContent;
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Default values
  const text = content.text ?? '';
  const speaker = content.speaker ?? '';
  const speakerAvatar = content.speakerAvatar;
  const position = content.position ?? 'left';
  const style = content.style ?? 'speech';
  const typewriterEffect = content.typewriterEffect ?? false;
  const typewriterSpeed = content.typewriterSpeed ?? 50;
  const audioUrl = content.audioUrl;
  const autoPlay = content.autoPlay ?? false;

  // Typewriter effect
  useEffect(() => {
    if (!typewriterEffect || isEditing) {
      setDisplayedText(text);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, typewriterSpeed);

    return (): void => clearInterval(timer);
  }, [text, typewriterEffect, typewriterSpeed, isEditing]);

  // Auto-play audio
  useEffect(() => {
    if (autoPlay && audioUrl && audioRef.current && !isEditing) {
      audioRef.current.play().catch(() => {});
    }
  }, [autoPlay, audioUrl, isEditing]);

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
              speakerAvatar: event.target?.result as string,
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
          speakerAvatar: urlInput,
        },
      });
      setUrlInput('');
      setShowUrlInput(false);
    }
  }, [content, urlInput, onUpdate]);

  // Get bubble classes
  const getBubbleClasses = () => {
    const base = 'relative p-4 max-w-lg';

    switch (style) {
      case 'thought':
        return `${base} bg-studio-surface/30 rounded-3xl border border-studio-surface/50 italic`;
      case 'narration':
        return `${base} bg-transparent text-center max-w-full`;
      case 'whisper':
        return `${base} bg-studio-bg/50 rounded-xl border border-dashed border-studio-text-muted/30 text-studio-text-muted`;
      case 'shout':
        return `${base} bg-brand-error/10 rounded-xl border-2 border-brand-error/30 font-bold`;
      default: // speech
        return `${base} bg-studio-bg rounded-xl border border-studio-surface/50`;
    }
  };

  // Get container alignment
  const getContainerClasses = () => {
    if (style === 'narration') return 'flex justify-center';
    if (position === 'right') return 'flex flex-row-reverse';
    if (position === 'center') return 'flex justify-center';
    return 'flex';
  };

  // Render avatar
  const renderAvatar = () => {
    if (style === 'narration') return null;

    return (
      <div className="shrink-0">
        <div className="w-12 h-12 rounded-full bg-studio-surface flex items-center justify-center overflow-hidden">
          {speakerAvatar ? (
            <Image
              src={speakerAvatar}
              alt={speaker}
              width={48}
              height={48}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-studio-text-muted" />
          )}
        </div>
      </div>
    );
  };

  // Preview mode
  if (!isEditing) {
    return (
      <div className={`${getContainerClasses()} gap-3`}>
        {/* Audio element */}
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl}>
            <track kind="captions" srcLang="en" label="English captions" />
          </audio>
        )}

        {/* Avatar */}
        {renderAvatar()}

        {/* Dialogue content */}
        <div className="flex-1">
          {/* Speaker name */}
          {speaker && style !== 'narration' && (
            <p
              className={`text-sm font-medium mb-1 ${position === 'right' ? 'text-right' : ''}`}
              style={{ color: 'var(--color-studio-accent)' }}
            >
              {speaker}
            </p>
          )}

          {/* Bubble */}
          <motion.div
            className={getBubbleClasses()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Speech bubble tail */}
            {style === 'speech' && (
              <div
                className={`
                  absolute top-4 w-0 h-0
                  border-t-8 border-b-8 border-transparent
                  ${
                    position === 'right'
                      ? 'right-0 translate-x-full border-l-8 border-l-studio-bg'
                      : 'left-0 -translate-x-full border-r-8 border-r-studio-bg'
                  }
                `}
              />
            )}

            {/* Thought bubble dots */}
            {style === 'thought' && (
              <div
                className={`absolute -bottom-2 ${position === 'right' ? 'right-4' : 'left-4'} flex gap-1`}
              >
                <div className="w-2 h-2 rounded-full bg-studio-surface" />
                <div className="w-1.5 h-1.5 rounded-full bg-studio-surface" />
                <div className="w-1 h-1 rounded-full bg-studio-surface" />
              </div>
            )}

            {/* Text */}
            <p className={`text-studio-text ${style === 'shout' ? 'text-lg uppercase' : ''}`}>
              {displayedText}
              {isTyping && (
                <span className="inline-block w-2 h-4 bg-studio-accent ml-1 animate-pulse" />
              )}
            </p>

            {/* Audio button */}
            {audioUrl && (
              <button
                type="button"
                onClick={() => audioRef.current?.play()}
                className="absolute top-2 right-2 p-1.5 text-studio-text-muted hover:text-studio-accent transition-colors"
                title="Play audio"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </div>
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

      {/* Preview */}
      <div className={`${getContainerClasses()} gap-3`}>
        {/* Avatar (editable) */}
        {style !== 'narration' && (
          <div className="shrink-0">
            <button
              type="button"
              className="w-12 h-12 rounded-full bg-studio-surface flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-studio-accent transition-all"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload speaker avatar"
            >
              {speakerAvatar ? (
                <Image
                  src={speakerAvatar}
                  alt={speaker}
                  width={48}
                  height={48}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="w-5 h-5 text-studio-text-muted" aria-hidden="true" />
              )}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          {/* Speaker input */}
          {style !== 'narration' && (
            <input
              type="text"
              value={speaker}
              onChange={(e) => onUpdate({ content: { ...content, speaker: e.target.value } })}
              className={`w-48 bg-transparent text-sm font-medium mb-1 outline-hidden border-b border-transparent focus:border-studio-accent ${position === 'right' ? 'text-right ml-auto block' : ''}`}
              placeholder="Speaker name..."
              style={{ color: 'var(--color-studio-accent)' }}
            />
          )}

          {/* Text bubble */}
          <div className={getBubbleClasses()}>
            <textarea
              value={text}
              onChange={(e) => onUpdate({ content: { ...content, text: e.target.value } })}
              className={`w-full bg-transparent text-studio-text resize-none outline-hidden ${style === 'shout' ? 'text-lg uppercase' : ''}`}
              placeholder="Enter dialogue text..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Avatar URL option */}
      {!speakerAvatar && style !== 'narration' && (
        <div className="flex items-center gap-2 ml-15">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-1 text-sm text-studio-text-muted hover:text-studio-accent"
          >
            <Link className="w-4 h-4" />
            Add avatar from URL
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

      {/* Settings */}
      <div className="p-4 bg-studio-bg rounded-lg border border-studio-surface/30 space-y-4">
        {/* Style & Position */}
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <label htmlFor="dialogue-style" className="block text-sm text-studio-text-muted">
              Style
            </label>
            <select
              id="dialogue-style"
              value={style}
              onChange={(e) =>
                onUpdate({
                  content: {
                    ...content,
                    style: e.target.value as
                      | 'speech'
                      | 'thought'
                      | 'narration'
                      | 'whisper'
                      | 'shout',
                  },
                })
              }
              className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
            >
              {BUBBLE_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {style !== 'narration' && (
            <div className="flex-1 space-y-2">
              <label htmlFor="dialogue-position" className="block text-sm text-studio-text-muted">
                Position
              </label>
              <select
                id="dialogue-position"
                value={position}
                onChange={(e) =>
                  onUpdate({
                    content: {
                      ...content,
                      position: e.target.value as 'left' | 'right' | 'center',
                    },
                  })
                }
                className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
              >
                {SPEAKER_POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Typewriter effect */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={typewriterEffect}
              onChange={(e) =>
                onUpdate({ content: { ...content, typewriterEffect: e.target.checked } })
              }
              className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
            />
            <span className="text-sm text-studio-text-muted">Typewriter effect</span>
          </label>

          {typewriterEffect && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-studio-text-muted">Speed:</span>
              <input
                type="number"
                value={typewriterSpeed}
                onChange={(e) =>
                  onUpdate({
                    content: { ...content, typewriterSpeed: parseInt(e.target.value, 10) },
                  })
                }
                min={10}
                max={200}
                step={10}
                className="w-20 px-2 py-1 bg-studio-bg-dark border border-studio-surface/50 rounded text-brand-primary text-sm"
              />
              <span className="text-sm text-studio-text-muted">ms</span>
            </div>
          )}
        </div>

        {/* Audio */}
        <div className="space-y-2">
          <label htmlFor="dialogue-audio-url" className="block text-sm text-studio-text-muted">
            Audio URL (optional)
          </label>
          <div className="flex gap-2">
            <input
              id="dialogue-audio-url"
              type="url"
              value={audioUrl || ''}
              onChange={(e) =>
                onUpdate({ content: { ...content, audioUrl: e.target.value || undefined } })
              }
              className="flex-1 px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
              placeholder="https://example.com/audio.mp3"
            />
            {audioUrl && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) =>
                    onUpdate({ content: { ...content, autoPlay: e.target.checked } })
                  }
                  className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
                />
                <span className="text-sm text-studio-text-muted">Auto-play</span>
              </label>
            )}
          </div>
        </div>

        {/* Remove avatar */}
        {speakerAvatar && (
          <button
            type="button"
            onClick={() => onUpdate({ content: { ...content, speakerAvatar: undefined } })}
            className="flex items-center gap-1 text-sm text-brand-error hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
            Remove avatar
          </button>
        )}
      </div>
    </div>
  );
}

export default DialogueBlock;
