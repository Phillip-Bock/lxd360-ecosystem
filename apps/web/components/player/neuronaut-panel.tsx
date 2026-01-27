'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  Coffee,
  HelpCircle,
  Lightbulb,
  Mic,
  Send,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { CourseSlide } from '@/types/player';

interface NeuronautPanelProps {
  courseId: string;
  currentSlide: CourseSlide;
  onClose: () => void;
  userId: string;
  isDemo?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const getMockResponse = (userMessage: string, slideContext: CourseSlide) => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('explain') || lowerMessage.includes('simpler')) {
    return `Great question! Let me break down "${slideContext.title}" in simpler terms:\n\nThe key concept here is about making learning accessible and engaging. Think of it like having a personal tutor who adapts to your learning style. The main points are:\n\n• Content that adjusts to how you learn best\n• Tools that help you understand complex topics\n• Features that make learning more enjoyable\n\nDoes this help clarify things?`;
  }

  if (lowerMessage.includes('quiz') || lowerMessage.includes('test')) {
    return `Perfect! Here's a quick quiz question based on "${slideContext.title}":\n\n**Question:** What is the primary benefit of having an AI learning companion?\n\nA) It replaces human teachers\nB) It adapts to your individual learning style\nC) It makes courses shorter\nD) It eliminates the need for study\n\nTake a moment to think about it, then let me know your answer!`;
  }

  if (lowerMessage.includes('summary') || lowerMessage.includes('summarize')) {
    return `Here's a quick summary of "${slideContext.title}":\n\n**Key Takeaways:**\n• Personalized learning experiences improve outcomes\n• Accessibility features ensure everyone can learn\n• AI companions provide on-demand support\n• Customization options let you learn your way\n\nWant me to elaborate on unknown of these points?`;
  }

  if (lowerMessage.includes('break')) {
    return `Taking breaks is essential for effective learning! Here are some science-backed tips:\n\n**5-minute brain break:**\n• Stand up and stretch\n• Look away from the screen (20-20-20 rule)\n• Do some deep breathing exercises\n\nThe Pomodoro Technique suggests a 5-minute break every 25 minutes of focused study. You're doing great by recognizing when you need a break!`;
  }

  // Default friendly response
  return `Thanks for your question about "${slideContext.title}"! I'm here to help you learn.\n\nSince this is demo mode, I have limited responses, but in the full version, I can:\n\n• Answer detailed questions about unknown topic\n• Create personalized quizzes and study guides\n• Explain concepts in multiple ways\n• Track your learning progress\n• Provide encouragement and motivation\n\nTry asking me to "explain", "quiz me", or "summarize" to see more examples!`;
};

export function NeuronautPanel({
  courseId,
  currentSlide,
  onClose,
  isDemo = false,
}: NeuronautPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm Neuro-naut, your AI learning companion. I'm here to help you understand "${currentSlide.title}". Feel free to ask me anything about this content, or try one of the quick actions below!`,
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    if (isDemo) {
      // Simulate thinking delay for demo mode
      setTimeout(
        () => {
          const response = getMockResponse(inputValue, currentSlide);
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          setIsThinking(false);
        },
        1000 + Math.random() * 1000,
      );
    } else {
      // Real API call
      try {
        const response = await fetch('/api/ai/neuronaut', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            courseContext: `Course ID: ${courseId}`,
            slideContext: JSON.stringify({
              title: currentSlide.title,
              type: currentSlide.content_type,
              content: currentSlide.content_data,
            }),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.content || "I'm sorry, I couldn't process that request.",
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          // Fall back to demo response on error
          const response = getMockResponse(inputValue, currentSlide);
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response,
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      } catch {
        // Fall back to demo response on error
        const response = getMockResponse(inputValue, currentSlide);
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
      setIsThinking(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
    setTimeout(() => handleSend(), 100);
  };

  const quickActions = [
    {
      icon: Lightbulb,
      label: 'Explain',
      prompt: 'Can you explain the current slide content in simpler terms?',
    },
    {
      icon: HelpCircle,
      label: 'Quiz me',
      prompt: 'Create a quick quiz question to test my understanding of this slide.',
    },
    {
      icon: Brain,
      label: 'Summarize',
      prompt: 'Summarize the key points from this slide in bullet points.',
    },
    {
      icon: Coffee,
      label: 'Break tip',
      prompt: "I've been studying for a while. Any tips for a productive break?",
    },
  ];

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute right-0 top-0 z-20 flex h-full w-96 flex-col border-l border-[var(--hud-border)] bg-[var(--hud-bg-secondary,#080c14)]/98 backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--hud-border)] p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-[var(--hud-accent)] to-teal-400 shadow-[0_0_20px_rgba(0,212,255,0.4)]">
              <Sparkles className="h-5 w-5 text-[var(--hud-bg)]" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--hud-bg-secondary)] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--hud-text)]">Neuro-naut</h3>
            <p className="text-xs text-[var(--hud-text-muted)]">
              {isThinking ? 'Thinking...' : 'Your AI Learning Companion'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/10 hover:text-[var(--hud-text)]"
            aria-label="Voice mode (coming soon)"
            disabled
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/10 hover:text-[var(--hud-text)]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 border-b border-[var(--hud-border)] p-3">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            size="sm"
            onClick={() => handleQuickAction(action.prompt)}
            disabled={isThinking}
            className="flex-1 gap-1.5 bg-[var(--hud-bg)]/60 text-xs text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/20 hover:text-[var(--hud-accent-bright)] disabled:opacity-50 border border-[var(--hud-border)]"
          >
            <action.icon className="h-3.5 w-3.5" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col gap-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}
            >
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[var(--hud-accent)] to-teal-400">
                  <Sparkles className="h-4 w-4 text-[var(--hud-bg)]" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                  message.role === 'assistant'
                    ? 'bg-[var(--hud-bg)]/80 text-[var(--hud-text)]/90 border border-[var(--hud-border)]'
                    : 'bg-linear-to-r from-[var(--hud-accent)] to-[var(--hud-accent-bright)] text-[var(--hud-bg)] font-medium',
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[var(--hud-accent)] to-teal-400">
                <Sparkles className="h-4 w-4 animate-pulse text-[var(--hud-bg)]" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-[var(--hud-bg)]/80 px-4 py-2 border border-[var(--hud-border)]">
                <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--hud-accent)] [animation-delay:-0.3s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--hud-accent)] [animation-delay:-0.15s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--hud-accent)]" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-[var(--hud-border)] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Neuro-naut anything..."
              className="border-[var(--hud-border)] bg-[var(--hud-bg)]/80 pr-10 text-[var(--hud-text)] placeholder:text-[var(--hud-text-muted)]/50"
              disabled={isThinking}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-[var(--hud-text-muted)] hover:text-[var(--hud-text)]"
              aria-label="Voice input (coming soon)"
              disabled
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isThinking}
            className="bg-linear-to-r from-[var(--hud-accent)] to-[var(--hud-accent-bright)] text-[var(--hud-bg)] hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(0,212,255,0.3)]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-linear-to-b from-transparent via-[var(--hud-accent)]/50 to-transparent" />
    </motion.div>
  );
}
