'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Brain,
  Lightbulb,
  Loader2,
  MessageSquare,
  Send,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIgniteVoice } from '@/hooks/use-ignite-voice';
import { useAuth } from '@/lib/firebase/useAuth';
import { cn } from '@/lib/utils';
import type { AnimationState, AvatarPersona } from './avatar';
import { VOICE_OPTIONS, VoiceSelector } from './VoiceSelector';

// ============================================================================
// ACCESSIBILITY CONSTANTS
// ============================================================================

const PANEL_TITLE_ID = 'cortex-coach-title';
const PANEL_DESC_ID = 'cortex-coach-desc';

// Dynamically import AvatarStage to avoid SSR issues with Three.js
const AvatarStage = dynamic(() => import('./avatar/AvatarStage').then((mod) => mod.AvatarStage), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-900/50 to-slate-800/50">
      <Loader2 className="h-8 w-8 animate-spin text-lxd-primary" />
    </div>
  ),
});

// ============================================================================
// TYPES
// ============================================================================

export interface IgniteCoachProps {
  /** Course title for context */
  courseTitle: string;
  /** Course description for context */
  courseDescription?: string;
  /** Current slide/lesson title */
  currentLessonTitle?: string;
  /** Learner name for personalization */
  learnerName: string;
  /** Avatar persona to display */
  avatarPersona?: AvatarPersona;
  /** Whether the coach is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/** Director Mode animation tags from API */
type DirectorAnimation = 'celebrate' | 'wave' | 'nod' | 'point' | 'idle';

// ============================================================================
// DIRECTOR MODE PARSER
// ============================================================================

/** Map Director tags to avatar AnimationState */
const DIRECTOR_TO_AVATAR: Record<DirectorAnimation, AnimationState> = {
  celebrate: 'celebrate',
  wave: 'wave',
  nod: 'nod',
  point: 'point',
  idle: 'idle',
};

/**
 * Parse Director Mode tags from response text.
 * Returns cleaned text and animation to play.
 */
function parseResponse(text: string): { cleanText: string; animation: AnimationState } {
  const tagPatterns: Array<{ regex: RegExp; animation: AnimationState }> = [
    { regex: /^\[CELEBRATE\]\s*/i, animation: 'celebrate' },
    { regex: /^\[EXPLAIN\]\s*/i, animation: 'point' },
    { regex: /^\[NOD\]\s*/i, animation: 'nod' },
    { regex: /^\[WAVE\]\s*/i, animation: 'wave' },
  ];

  for (const { regex, animation } of tagPatterns) {
    if (regex.test(text)) {
      return {
        cleanText: text.replace(regex, '').trim(),
        animation,
      };
    }
  }

  // No tag found - use talking animation during speech
  return { cleanText: text.trim(), animation: 'talking' };
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * IgniteCoach - AI Companion Panel for Course Player
 *
 * A professional floating AI assistant with 3D avatar and voice.
 * Features Director Mode for contextual avatar animations.
 *
 * Layout:
 * - Trigger button (bottom-right, pulse effect)
 * - Panel (360x600px, slide-up animation)
 *   - Top 40%: 3D Avatar Stage with header overlay
 *   - Bottom 60%: Chat interface
 */
export function IgniteCoach({
  courseTitle,
  courseDescription,
  currentLessonTitle,
  learnerName,
  avatarPersona = 'cortex',
  disabled = false,
  className,
}: IgniteCoachProps) {
  // Panel state
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Avatar state
  const [animation, setAnimation] = useState<AnimationState>('idle');
  const [voiceId, setVoiceId] = useState(VOICE_OPTIONS[0].id);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Hooks
  const { user } = useAuth();
  const { playAudio, stopAudio, isSpeaking } = useIgniteVoice();
  const uniqueId = useId();

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auto-scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: We intentionally track messages array changes for scrolling
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Add greeting when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: 'greeting',
        role: 'assistant',
        content: `Hello ${learnerName}! I'm Cortex, your learning companion. I'm here to help you master "${courseTitle}". What would you like to explore?`,
        timestamp: new Date(),
      };
      setMessages([greeting]);
      // Wave animation for greeting
      setAnimation('wave');
      setTimeout(() => setAnimation('idle'), 2000);
    }
  }, [isOpen, messages.length, learnerName, courseTitle]);

  // Handle speaking state - switch to talking animation
  useEffect(() => {
    if (isSpeaking) {
      setAnimation('talking');
    }
  }, [isSpeaking]);

  // Return to idle when audio finishes
  useEffect(() => {
    if (!isSpeaking && !isThinking && animation === 'talking') {
      setAnimation('idle');
    }
  }, [isSpeaking, isThinking, animation]);

  // Focus trap and keyboard handling for accessibility (WCAG 2.1 AA)
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    // Focus close button when panel opens
    closeButtonRef.current?.focus();

    // Handle Escape key to close panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopAudio();
        setIsOpen(false);
        setShowSettings(false);
      }

      // Focus trap - keep focus within panel
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stopAudio]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isThinking) return;

      // Stop any playing audio
      stopAudio();

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');

      // Start thinking
      setIsThinking(true);
      setAnimation('thinking');

      // Build context
      const context = {
        courseTitle,
        courseDescription,
        currentLesson: currentLessonTitle,
        learnerName,
      };

      try {
        // Get auth token
        if (!user) {
          throw new Error('Not authenticated');
        }
        const token = await user.getIdToken();

        // Call API
        const response = await fetch('/api/ignite/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: messageText,
            context,
            history: messages.slice(-6).map((m) => ({
              role: m.role,
              content: m.content,
            })),
            voiceId,
            includeAudio: voiceEnabled,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = (await response.json()) as {
          text: string;
          audio?: string;
          animation?: DirectorAnimation;
        };

        setIsThinking(false);

        // Parse response for Director Mode tags
        const { cleanText, animation: gestureAnimation } = parseResponse(data.text);

        // Use API animation if provided, otherwise use parsed animation
        const targetAnimation = data.animation
          ? DIRECTOR_TO_AVATAR[data.animation]
          : gestureAnimation;

        // Add AI message with clean text
        const aiMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: cleanText || data.text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Play gesture animation first
        if (targetAnimation !== 'talking') {
          setAnimation(targetAnimation);
        }

        // Play audio (will switch to talking animation via isSpeaking effect)
        if (data.audio && voiceEnabled) {
          const audioData = data.audio;
          // Small delay to show gesture before talking
          setTimeout(async () => {
            await playAudio(audioData);
          }, 500);
        } else if (targetAnimation !== 'idle') {
          // No audio - hold gesture then return to idle
          setTimeout(() => {
            if (!isSpeaking) {
              setAnimation('idle');
            }
          }, 2500);
        }
      } catch (error) {
        console.error('[IgniteCoach] Chat error:', error);
        setIsThinking(false);
        setAnimation('idle');

        // Fallback response
        const fallbackMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `I'm having trouble connecting right now. Let me know if you have questions about "${courseTitle}" and I'll do my best to help!`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      }
    },
    [
      isThinking,
      stopAudio,
      user,
      messages,
      voiceId,
      voiceEnabled,
      courseTitle,
      courseDescription,
      currentLessonTitle,
      learnerName,
      playAudio,
      isSpeaking,
    ],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  // Quick action suggestions
  const quickActions = [
    { label: 'Explain this concept', icon: Lightbulb },
    { label: 'Give me an example', icon: Brain },
    { label: 'What should I focus on?', icon: Sparkles },
  ];

  if (disabled) return null;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          // ================================================================
          // TRIGGER BUTTON (WCAG 2.1 AA: Accessible name)
          // ================================================================
          <motion.button
            key="trigger"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Learning Coach"
            aria-haspopup="dialog"
            className={cn(
              'relative flex items-center justify-center',
              'h-14 w-14 rounded-full',
              'bg-gradient-to-br from-lxd-primary to-lxd-primary-dark',
              'text-white shadow-lg',
              'shadow-lxd-primary/30',
              'hover:shadow-lxd-primary/50 hover:shadow-xl',
              'focus:outline-none focus:ring-2 focus:ring-lxd-primary focus:ring-offset-2',
              'transition-all duration-300',
            )}
          >
            {/* Pulse ring - decorative, hidden from AT */}
            <span
              className="absolute inset-0 rounded-full animate-ping bg-lxd-primary/30"
              aria-hidden="true"
            />
            <span
              className="absolute inset-0 rounded-full animate-pulse bg-lxd-primary/20"
              aria-hidden="true"
            />

            {/* Icon */}
            <Sparkles className="h-6 w-6 relative z-10" aria-hidden="true" />

            {/* Online indicator - decorative */}
            <span
              className="absolute top-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white"
              aria-hidden="true"
            />
          </motion.button>
        ) : (
          // ================================================================
          // COMPANION PANEL (WCAG 2.1 AA: Dialog with focus trap)
          // ================================================================
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uniqueId}-${PANEL_TITLE_ID}`}
            aria-describedby={`${uniqueId}-${PANEL_DESC_ID}`}
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'w-[360px] h-[600px]',
              'bg-card/95 backdrop-blur-xl',
              'rounded-2xl overflow-hidden',
              'border border-border/50',
              'shadow-2xl shadow-black/20',
              'flex flex-col',
            )}
          >
            {/* ============================================================ */}
            {/* TOP 40% - AVATAR STAGE */}
            {/* ============================================================ */}
            <div className="relative h-[40%] bg-gradient-to-b from-slate-900 to-slate-800">
              {/* 3D Avatar */}
              <AvatarStage
                persona={avatarPersona}
                animation={animation}
                height="100%"
                backgroundColor="transparent"
                enableControls={false}
              />

              {/* Header Overlay */}
              <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center justify-between">
                  {/* Title - linked to dialog aria-labelledby */}
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"
                      aria-hidden="true"
                    />
                    <span
                      id={`${uniqueId}-${PANEL_TITLE_ID}`}
                      className="text-sm font-semibold text-white"
                    >
                      Cortex
                    </span>
                    <span
                      id={`${uniqueId}-${PANEL_DESC_ID}`}
                      className="text-xs text-white/60"
                      aria-live="polite"
                    >
                      {isSpeaking ? 'Speaking...' : isThinking ? 'Thinking...' : 'Online'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Voice toggle (WCAG: aria-pressed for toggle state) */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (isSpeaking) stopAudio();
                        setVoiceEnabled((v) => !v);
                      }}
                      aria-label={voiceEnabled ? 'Disable voice' : 'Enable voice'}
                      aria-pressed={voiceEnabled}
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50"
                    >
                      {voiceEnabled ? (
                        <Volume2 className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <VolumeX className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>

                    {/* Settings (WCAG: aria-expanded for disclosure) */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(!showSettings)}
                      aria-label="Voice settings"
                      aria-expanded={showSettings}
                      aria-controls={`${uniqueId}-settings-panel`}
                      className={cn(
                        'h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50',
                        showSettings && 'bg-white/10 text-white',
                      )}
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                    </Button>

                    {/* Close (WCAG: Clear accessible name) */}
                    <Button
                      ref={closeButtonRef}
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        stopAudio();
                        setIsOpen(false);
                        setShowSettings(false);
                      }}
                      aria-label="Close Coach"
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer z-50 focus:ring-2 focus:ring-white/50"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Settings Panel Overlay */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    id={`${uniqueId}-settings-panel`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-12 left-3 right-3 p-3 bg-card/95 backdrop-blur-xl rounded-xl border border-border/50 shadow-lg"
                    role="region"
                    aria-label="Voice settings"
                  >
                    <p
                      id={`${uniqueId}-voice-label`}
                      className="text-xs font-medium text-muted-foreground mb-2"
                    >
                      Voice
                    </p>
                    <VoiceSelector
                      value={voiceId}
                      onChange={setVoiceId}
                      labelledBy={`${uniqueId}-voice-label`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom gradient fade */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent" />
            </div>

            {/* ============================================================ */}
            {/* BOTTOM 60% - CHAT INTERFACE */}
            {/* ============================================================ */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Context Badge */}
              {currentLessonTitle && (
                <div className="px-4 py-2 bg-muted/30 border-b border-border/30">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span className="truncate">{currentLessonTitle}</span>
                  </div>
                </div>
              )}

              {/* Messages (WCAG 2.1 AA: Live region for screen readers) */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3"
                role="log"
                aria-live="polite"
                aria-label="Conversation with Cortex"
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                        message.role === 'user'
                          ? 'bg-lxd-primary text-white rounded-br-md'
                          : 'bg-muted/60 text-foreground rounded-bl-md',
                      )}
                    >
                      <span className="sr-only">
                        {message.role === 'user' ? 'You: ' : 'Cortex: '}
                      </span>
                      {message.content}
                    </div>
                  </motion.div>
                ))}

                {/* Thinking indicator */}
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span
                          className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <span
                          className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick actions (show only at start) */}
                {messages.length <= 1 && !isThinking && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs text-muted-foreground">Try asking:</p>
                    {quickActions.map((action) => (
                      <motion.button
                        key={action.label}
                        type="button"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleQuickAction(action.label)}
                        className={cn(
                          'flex items-center gap-2 w-full px-3 py-2 rounded-xl',
                          'bg-muted/30 hover:bg-muted/50',
                          'border border-border/30 hover:border-border/50',
                          'text-sm text-foreground text-left',
                          'transition-colors',
                        )}
                      >
                        <action.icon className="h-4 w-4 text-lxd-primary" />
                        {action.label}
                      </motion.button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input (WCAG 2.1 AA: Accessible labels) */}
              <form onSubmit={handleSubmit} className="p-3 border-t border-border/30 bg-muted/10">
                <div className="flex items-center gap-2">
                  <label htmlFor={`${uniqueId}-chat-input`} className="sr-only">
                    Ask Cortex a question
                  </label>
                  <input
                    id={`${uniqueId}-chat-input`}
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Cortex..."
                    disabled={isThinking}
                    aria-describedby={isThinking ? `${uniqueId}-thinking-status` : undefined}
                    className={cn(
                      'flex-1 bg-background/80 border border-border/50 rounded-xl px-4 py-2.5',
                      'text-sm text-foreground placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-lxd-primary/50 focus:border-transparent',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-all',
                    )}
                  />
                  {isThinking && (
                    <span id={`${uniqueId}-thinking-status`} className="sr-only">
                      Cortex is thinking, please wait
                    </span>
                  )}
                  <Button
                    type="submit"
                    disabled={!input.trim() || isThinking}
                    size="icon"
                    aria-label="Send message"
                    className={cn(
                      'h-10 w-10 rounded-xl shrink-0',
                      'bg-lxd-primary hover:bg-lxd-primary/90',
                      'disabled:opacity-50',
                      'focus:ring-2 focus:ring-lxd-primary focus:ring-offset-2',
                    )}
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default IgniteCoach;
