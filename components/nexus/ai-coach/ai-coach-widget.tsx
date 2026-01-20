'use client';

/**
 * AI Coach Widget
 * ===============
 * Floating AI assistant that provides proactive coaching and recommendations.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Bot, Calendar, ChevronUp, Lightbulb, Send, Target, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: { label: string; action: string }[];
}

export function AICoachWidget(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hi there! I'm your AI Coach. I noticed you have a mentoring session coming up. Would you like me to prepare a specialized agenda based on your recent learning progress?",
      timestamp: new Date(),
      actions: [
        { label: 'Prepare Agenda', action: 'prepare_agenda' },
        { label: 'View Goals', action: 'view_goals' },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const handleSend = async (): Promise<void> => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (will be replaced with actual AI call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(inputValue),
        timestamp: new Date(),
        suggestions: ['Tell me more about React hooks', 'Schedule a session', 'Update my goals'],
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleAction = (action: string): void => {
    // Handle action buttons
    const responses: Record<string, string> = {
      prepare_agenda:
        "I've analyzed your recent learning progress and your mentor's expertise. Here's a suggested agenda:\n\n1. Review progress on React Context (5 min)\n2. Deep dive into custom hooks patterns (20 min)\n3. Live coding exercise (15 min)\n4. Set action items for next week (5 min)\n\nShall I save this agenda to your session?",
      view_goals:
        'Here are your active goals:\n\n1. Master React Advanced Patterns (65% complete)\n2. Build a side project (30% complete)\n3. Improve system design skills (Not started)\n\nWould you like to update unknown of these?',
    };

    const response: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: responses[action] || "I'm processing your request...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, response]);
  };

  const handleSuggestion = (suggestion: string): void => {
    setInputValue(suggestion);
  };

  // Quick action buttons
  const quickActions = [
    { icon: Calendar, label: 'Schedule', action: 'schedule' },
    { icon: Target, label: 'Goals', action: 'goals' },
    { icon: BookOpen, label: 'Learn', action: 'learn' },
    { icon: Lightbulb, label: 'Tips', action: 'tips' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 sm:w-96 bg-brand-surface dark:bg-brand-page rounded-2xl shadow-2xl border border-brand-default dark:border-brand-default overflow-hidden"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-violet-600 to-indigo-600 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-brand-primary">
                <div className="w-8 h-8 bg-brand-surface/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold">Nexus Coach</span>
                  <span className="text-xs text-brand-primary/70 block">AI-Powered Assistant</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-brand-primary/80 hover:text-brand-primary hover:bg-brand-surface/10"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  <ChevronUp
                    className={cn('w-4 h-4 transition-transform', isMinimized && 'rotate-180')}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-brand-primary/80 hover:text-brand-primary hover:bg-brand-surface/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Quick Actions */}
                  <div className="p-2 bg-brand-page dark:bg-brand-surface/50 border-b border-brand-default dark:border-brand-default flex gap-1">
                    {quickActions.map((action) => (
                      <button
                        type="button"
                        key={action.action}
                        onClick={() => handleAction(action.action)}
                        className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-brand-surface-hover/50 transition-colors"
                      >
                        <action.icon className="w-4 h-4 text-brand-muted dark:text-brand-muted" />
                        <span className="text-[10px] text-brand-secondary dark:text-brand-muted">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Messages */}
                  <ScrollArea className="h-64 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            'flex',
                            message.role === 'user' ? 'justify-end' : 'justify-start',
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[85%] rounded-2xl px-4 py-2',
                              message.role === 'user'
                                ? 'bg-brand-primary text-brand-primary rounded-br-md'
                                : 'bg-brand-surface dark:bg-brand-surface text-brand-primary dark:text-brand-primary rounded-bl-md',
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                            {/* Action Buttons */}
                            {message.actions && message.actions.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {message.actions.map((action, idx) => (
                                  <Button
                                    key={idx}
                                    size="sm"
                                    variant="secondary"
                                    className="h-7 text-xs bg-brand-surface/20 hover:bg-brand-surface/30 text-brand-secondary dark:text-brand-primary"
                                    onClick={() => handleAction(action.action)}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}

                            {/* Suggestions */}
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {message.suggestions.map((suggestion, idx) => (
                                  <button
                                    type="button"
                                    key={idx}
                                    onClick={() => handleSuggestion(suggestion)}
                                    className="text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-brand-surface-hover text-brand-secondary dark:text-brand-secondary hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-brand-surface dark:bg-brand-surface rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span
                                className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                                style={{ animationDelay: '0ms' }}
                              />
                              <span
                                className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                                style={{ animationDelay: '150ms' }}
                              />
                              <span
                                className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                                style={{ animationDelay: '300ms' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-3 bg-brand-surface dark:bg-brand-page border-t border-brand-default dark:border-brand-default">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 text-sm h-10"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="h-10 w-10 bg-linear-to-r from-violet-600 to-indigo-600 hover:opacity-90"
                        disabled={!inputValue.trim() || isTyping}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                    <p className="text-[10px] text-brand-muted text-center mt-2">
                      Powered by AI • Your data is private
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all',
          isOpen
            ? 'bg-brand-surface hover:bg-brand-surface-hover'
            : 'bg-linear-to-r from-violet-600 to-indigo-600 hover:opacity-90',
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-brand-primary" />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6 text-brand-primary" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-success rounded-full border-2 border-white animate-pulse" />
          </div>
        )}
      </motion.button>
    </div>
  );
}

// Simple response generator (will be replaced with actual AI)
function getAIResponse(input: string): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('react') || lowerInput.includes('hook')) {
    return "Based on your learning progress, I recommend focusing on these React concepts:\n\n1. **Custom Hooks** - You've completed the basics, time to create reusable hooks\n2. **Performance Optimization** - Learn useMemo and useCallback patterns\n3. **State Management** - Explore Context API vs Redux\n\nWould you like me to find a mentor who specializes in React?";
  }

  if (lowerInput.includes('session') || lowerInput.includes('schedule')) {
    return "I can help you schedule a session! Based on your calendar and your mentor's availability, here are the best times:\n\n- Tomorrow at 2:00 PM\n- Thursday at 10:00 AM\n- Friday at 3:00 PM\n\nWhich works best for you?";
  }

  if (lowerInput.includes('goal') || lowerInput.includes('target')) {
    return "Setting clear goals is key to growth! Here's a SMART goal template:\n\n**Specific**: What exactly do you want to achieve?\n**Measurable**: How will you track progress?\n**Achievable**: Is it realistic?\n**Relevant**: Does it align with your career?\n**Time-bound**: When will you complete it?\n\nWant me to help you create a new goal?";
  }

  return "I'm here to help you on your mentoring journey! I can:\n\n- Prepare session agendas\n- Track your goals and progress\n- Suggest learning resources\n- Connect you with mentors\n\nWhat would you like to focus on today?";
}
