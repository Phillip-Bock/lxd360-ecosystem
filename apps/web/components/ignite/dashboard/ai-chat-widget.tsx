'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AiChatWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response - TODO(LXD-245): Connect to Vertex AI endpoint
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(userMessage.content),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const getSimulatedResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('course') || lowerQuery.includes('create')) {
      return "To create a new course, click the 'Create Course' button on the Courses page. You can upload SCORM packages or build courses from scratch.";
    }
    if (lowerQuery.includes('student') || lowerQuery.includes('learner')) {
      return 'You can view all your learners in the Learners section. Use filters to identify at-risk students who may need additional support.';
    }
    if (lowerQuery.includes('analytics') || lowerQuery.includes('report')) {
      return 'Analytics are available in the Analytics section. You can track completion rates, engagement metrics, and generate custom reports.';
    }
    return "I'm here to help you manage your courses and learners. What would you like to know about?";
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            type="button"
            onClick={() => setIsExpanded(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full',
              'bg-card/80 border border-border/50 backdrop-blur-sm',
              'text-muted-foreground hover:text-foreground hover:border-lxd-primary/50',
              'transition-all duration-200',
              'shadow-lg shadow-black/20',
            )}
          >
            <Sparkles className="h-4 w-4 text-lxd-primary" />
            <span className="text-sm">Ask AI Assistant...</span>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: -10, width: 300 }}
            animate={{ opacity: 1, y: 0, width: messages.length > 0 ? 400 : 350 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'bg-card/95 border border-border/50 backdrop-blur-md rounded-xl',
              'shadow-xl shadow-black/30',
              'overflow-hidden',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-lxd-primary" />
                <span className="text-sm font-medium text-foreground">AI Assistant</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setMessages([]);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            {messages.length > 0 && (
              <div className="max-h-60 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'text-sm rounded-lg px-3 py-2 max-w-[85%]',
                      message.role === 'user'
                        ? 'bg-lxd-primary/20 text-primary-foreground ml-auto'
                        : 'bg-muted text-foreground',
                    )}
                  >
                    {message.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about courses, students, analytics..."
                  className={cn(
                    'flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2',
                    'text-sm text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-lxd-primary/50 focus:border-lxd-primary/50',
                    'transition-all duration-200',
                  )}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    'bg-lxd-primary text-white hover:bg-lxd-primary/90',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AiChatWidget;
