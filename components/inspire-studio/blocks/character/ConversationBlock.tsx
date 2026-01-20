'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  GripVertical,
  MessageCircle,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Trash2,
  User,
} from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ConversationBlockContent,
  ConversationMessage,
  ConversationSpeaker,
} from '@/types/blocks';
import type { BlockComponentProps } from '../BlockRenderer';

const DEFAULT_SPEAKERS: ConversationSpeaker[] = [
  { id: 'speaker-1', name: 'Speaker 1', color: 'var(--color-studio-accent)' },
  { id: 'speaker-2', name: 'Speaker 2', color: 'var(--color-block-scenario)' },
];

/**
 * ConversationBlock - Multi-turn dialogue
 */
export function ConversationBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<ConversationBlockContent>): React.JSX.Element {
  const content = block.content as ConversationBlockContent;
  const [visibleCount, setVisibleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Default values - wrapped in useMemo to maintain stable references
  const messages = useMemo(() => content.messages || [], [content.messages]);
  const speakers = content.speakers || DEFAULT_SPEAKERS;
  const autoPlay = content.autoPlay ?? false;
  const playInterval = content.playInterval || 3000;
  const showTimestamps = content.showTimestamps ?? false;

  // Initialize visible count
  useEffect(() => {
    if (isEditing) {
      setVisibleCount(messages.length);
    } else if (autoPlay) {
      setVisibleCount(0);
      setIsPlaying(true);
    } else {
      setVisibleCount(messages.length);
    }
  }, [isEditing, autoPlay, messages.length]);

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || visibleCount >= messages.length) {
      setIsPlaying(false);
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
      }
      return;
    }

    playTimerRef.current = setTimeout(() => {
      setVisibleCount((prev) => prev + 1);
    }, playInterval);

    return (): void => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
      }
    };
  }, [isPlaying, visibleCount, messages.length, playInterval]);

  // Toggle play
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (visibleCount >= messages.length) {
        setVisibleCount(0);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, visibleCount, messages.length]);

  // Reset
  const handleReset = useCallback(() => {
    setVisibleCount(0);
    setIsPlaying(false);
  }, []);

  // Show all
  const showAll = useCallback(() => {
    setVisibleCount(messages.length);
    setIsPlaying(false);
  }, [messages.length]);

  // Add message
  const addMessage = useCallback(
    (speakerId?: string) => {
      const speaker = speakerId || speakers[messages.length % speakers.length]?.id;
      const newMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        speakerId: speaker,
        text: 'New message...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onUpdate({
        content: {
          ...content,
          messages: [...messages, newMessage],
        },
      });
      setEditingMessageId(newMessage.id);
    },
    [content, messages, speakers, onUpdate],
  );

  // Update message
  const updateMessage = useCallback(
    (messageId: string, updates: Partial<ConversationMessage>) => {
      onUpdate({
        content: {
          ...content,
          messages: messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
        },
      });
    },
    [content, messages, onUpdate],
  );

  // Delete message
  const deleteMessage = useCallback(
    (messageId: string) => {
      onUpdate({
        content: {
          ...content,
          messages: messages.filter((m) => m.id !== messageId),
        },
      });
      if (editingMessageId === messageId) setEditingMessageId(null);
    },
    [content, messages, editingMessageId, onUpdate],
  );

  // Add speaker
  const addSpeaker = useCallback(() => {
    const newSpeaker = {
      id: `speaker-${Date.now()}`,
      name: `Speaker ${speakers.length + 1}`,
      color: [
        'var(--color-studio-accent)',
        'var(--color-block-scenario)',
        'var(--color-block-interactive)',
        'var(--color-block-media)',
        'var(--color-block-assessment)',
      ][speakers.length % 5],
    };
    onUpdate({
      content: {
        ...content,
        speakers: [...speakers, newSpeaker],
      },
    });
  }, [content, speakers, onUpdate]);

  // Update speaker
  const updateSpeaker = useCallback(
    (speakerId: string, updates: Partial<ConversationSpeaker>) => {
      onUpdate({
        content: {
          ...content,
          speakers: speakers.map((s: ConversationSpeaker) =>
            s.id === speakerId ? { ...s, ...updates } : s,
          ),
        },
      });
    },
    [content, speakers, onUpdate],
  );

  // Delete speaker
  const deleteSpeaker = useCallback(
    (speakerId: string) => {
      if (speakers.length <= 1) return;
      onUpdate({
        content: {
          ...content,
          speakers: speakers.filter((s: ConversationSpeaker) => s.id !== speakerId),
          // Reassign messages from deleted speaker
          messages: messages.map((m: ConversationMessage) =>
            m.speakerId === speakerId
              ? {
                  ...m,
                  speakerId:
                    speakers.find((s: ConversationSpeaker) => s.id !== speakerId)?.id ||
                    speakers[0].id,
                }
              : m,
          ),
        },
      });
    },
    [content, speakers, messages, onUpdate],
  );

  // Get speaker by ID
  const getSpeaker = (speakerId: string): ConversationSpeaker => {
    return (
      speakers.find((s: ConversationSpeaker) => s.id === speakerId) ||
      speakers[0] || { id: 'unknown', name: 'Unknown', color: 'var(--color-studio-text-muted)' }
    );
  };

  // Preview mode
  if (!isEditing) {
    return (
      <div className="space-y-4">
        {/* Playback controls */}
        {autoPlay && (
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 bg-studio-bg border border-studio-surface/50 rounded-lg text-studio-text-muted hover:text-brand-primary transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 bg-studio-bg border border-studio-surface/50 rounded-lg text-studio-text-muted hover:text-brand-primary transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={showAll}
              className="px-3 py-2 bg-studio-bg border border-studio-surface/50 rounded-lg text-sm text-studio-text-muted hover:text-brand-primary transition-colors"
            >
              Show All
            </button>
            <span className="text-sm text-studio-text-muted">
              {visibleCount} / {messages.length}
            </span>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-3">
          <AnimatePresence>
            {messages.slice(0, visibleCount).map((message, index) => {
              const speaker = getSpeaker(message.speakerId);
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${isLeft ? '' : 'flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                    style={{
                      backgroundColor: speaker.avatar ? 'transparent' : `${speaker.color}30`,
                    }}
                  >
                    {speaker.avatar ? (
                      <Image
                        src={speaker.avatar}
                        alt={speaker.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5" style={{ color: speaker.color }} />
                    )}
                  </div>

                  {/* Message */}
                  <div className={`flex-1 max-w-[80%] ${isLeft ? '' : 'text-right'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium" style={{ color: speaker.color }}>
                        {speaker.name}
                      </span>
                      {showTimestamps && message.timestamp && (
                        <span className="text-xs text-studio-text-muted">{message.timestamp}</span>
                      )}
                    </div>
                    <div
                      className={`
                        inline-block p-3 rounded-xl max-w-full
                        ${
                          isLeft
                            ? 'bg-studio-bg border border-studio-surface/50 rounded-tl-none'
                            : 'rounded-tr-none'
                        }
                      `}
                      style={{
                        backgroundColor: isLeft ? undefined : `${speaker.color}15`,
                        borderColor: isLeft ? undefined : `${speaker.color}30`,
                      }}
                    >
                      <p className="text-studio-text whitespace-pre-wrap">{message.text}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Typing indicator */}
        {isPlaying && visibleCount < messages.length && (
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-studio-surface/30 flex items-center justify-center">
              <User className="w-5 h-5 text-studio-text-muted" />
            </div>
            <div className="bg-studio-bg border border-studio-surface/50 rounded-xl rounded-tl-none p-3">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-studio-text-muted rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 bg-studio-text-muted rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-studio-text-muted rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      {/* Speaker management */}
      <div className="p-4 bg-studio-bg rounded-lg border border-studio-surface/30">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-studio-text-muted">Speakers</h4>
          <button
            type="button"
            onClick={addSpeaker}
            className="flex items-center gap-1 text-sm text-studio-accent hover:bg-studio-accent-hover"
          >
            <Plus className="w-4 h-4" />
            Add Speaker
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {speakers.map((speaker: ConversationSpeaker) => (
            <div
              key={speaker.id}
              className="flex items-center gap-2 px-3 py-2 bg-studio-bg-dark rounded-lg border border-studio-surface/50"
            >
              <input
                type="color"
                value={speaker.color}
                onChange={(e) => updateSpeaker(speaker.id, { color: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer"
              />
              <input
                type="text"
                value={speaker.name}
                onChange={(e) => updateSpeaker(speaker.id, { name: e.target.value })}
                className="w-24 bg-transparent text-brand-primary text-sm outline-hidden"
              />
              {speakers.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteSpeaker(speaker.id)}
                  className="p-1 text-studio-text-muted hover:text-brand-error"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => onUpdate({ content: { ...content, autoPlay: e.target.checked } })}
            className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
          />
          <span className="text-sm text-studio-text-muted">Auto-play</span>
        </label>

        {autoPlay && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-studio-text-muted">Interval:</span>
            <input
              type="number"
              value={playInterval}
              onChange={(e) =>
                onUpdate({ content: { ...content, playInterval: parseInt(e.target.value, 10) } })
              }
              min={500}
              max={10000}
              step={500}
              className="w-20 px-2 py-1 bg-studio-bg border border-studio-surface/50 rounded text-brand-primary text-sm"
            />
            <span className="text-sm text-studio-text-muted">ms</span>
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTimestamps}
            onChange={(e) =>
              onUpdate({ content: { ...content, showTimestamps: e.target.checked } })
            }
            className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
          />
          <span className="text-sm text-studio-text-muted">Show timestamps</span>
        </label>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {messages.length === 0 ? (
          <button
            type="button"
            className="w-full p-8 text-center border-2 border-dashed border-studio-surface/50 rounded-lg cursor-pointer hover:border-studio-accent/50 transition-colors bg-transparent"
            onClick={() => addMessage()}
          >
            <MessageCircle className="w-8 h-8 text-studio-text-muted mx-auto mb-2" />
            <p className="text-studio-text-muted">Add your first message</p>
          </button>
        ) : (
          messages.map((message) => {
            const speaker = getSpeaker(message.speakerId);
            const isEditing = editingMessageId === message.id;

            return (
              <div
                key={message.id}
                className={`
                  p-3 rounded-lg border transition-colors
                  ${isEditing ? 'bg-studio-bg border-studio-accent/30' : 'bg-studio-bg border-studio-surface/30'}
                `}
              >
                <div className="flex items-start gap-3">
                  <GripVertical className="w-4 h-4 text-studio-text-muted cursor-grab mt-1" />

                  {/* Speaker selector */}
                  <select
                    value={message.speakerId}
                    onChange={(e) => updateMessage(message.id, { speakerId: e.target.value })}
                    className="px-2 py-1 bg-studio-bg-dark border border-studio-surface/50 rounded text-sm"
                    style={{ color: speaker.color }}
                  >
                    {speakers.map((s: ConversationSpeaker) => (
                      <option key={s.id} value={s.id} style={{ color: s.color }}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  {/* Message text */}
                  <div className="flex-1">
                    {isEditing ? (
                      <textarea
                        value={message.text}
                        onChange={(e) => updateMessage(message.id, { text: e.target.value })}
                        className="w-full bg-studio-bg-dark border border-studio-surface/50 rounded p-2 text-brand-primary text-sm resize-none outline-hidden"
                        rows={2}
                      />
                    ) : (
                      <button
                        type="button"
                        className="text-studio-text text-sm cursor-pointer hover:text-brand-primary text-left bg-transparent border-none p-0"
                        onClick={() => setEditingMessageId(message.id)}
                      >
                        {message.text}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    type="button"
                    onClick={() => setEditingMessageId(isEditing ? null : message.id)}
                    className={`p-1 rounded transition-colors ${isEditing ? 'text-studio-accent' : 'text-studio-text-muted hover:text-brand-primary'}`}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMessage(message.id)}
                    className="p-1 text-studio-text-muted hover:text-brand-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded options */}
                {isEditing && showTimestamps && (
                  <div className="mt-2 ml-7">
                    <input
                      type="text"
                      value={message.timestamp || ''}
                      onChange={(e) => updateMessage(message.id, { timestamp: e.target.value })}
                      className="px-2 py-1 bg-studio-bg-dark border border-studio-surface/50 rounded text-brand-primary text-sm"
                      placeholder="Timestamp..."
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add message */}
      <div className="flex gap-2">
        {speakers.map((speaker: ConversationSpeaker) => (
          <button
            type="button"
            key={speaker.id}
            onClick={() => addMessage(speaker.id)}
            className="flex items-center gap-1 px-3 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-sm hover:border-studio-accent/50 transition-colors"
            style={{ color: speaker.color }}
          >
            <Plus className="w-4 h-4" />
            {speaker.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ConversationBlock;
