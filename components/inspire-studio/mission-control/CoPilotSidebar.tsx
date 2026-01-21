'use client';

import { Bot, ChevronRight, Loader2, Send, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useMissionStore } from '@/store/inspire';
import { useMissionControl } from './MissionControlProvider';

// ============================================================================
// TYPES
// ============================================================================

interface CoPilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

// ============================================================================
// COMPONENT
// ============================================================================

interface CoPilotSidebarProps {
  className?: string;
}

/**
 * CoPilotSidebar - AI assistant panel for INSPIRE methodology guidance
 *
 * Features:
 * - Slide-out panel (right side)
 * - Context-aware suggestions based on current step
 * - Chat interface with AI (stub for Vertex AI)
 * - Quick action buttons for common tasks
 */
export function CoPilotSidebar({ className }: CoPilotSidebarProps) {
  const { coPilotOpen, toggleCoPilot, coPilotContext, currentStepConfig } = useMissionControl();
  const currentPhase = useMissionStore((state) => state.currentPhase);
  const currentStep = useMissionStore((state) => state.currentStep);

  const [messages, setMessages] = useState<CoPilotMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate contextual suggestions based on current step
  const getContextualSuggestions = useCallback((): string[] => {
    if (!currentStepConfig) return [];

    const suggestions: string[] = [];

    // Add step-specific suggestions
    if (currentStepConfig.keyQuestions) {
      suggestions.push(
        ...currentStepConfig.keyQuestions.slice(0, 3).map((q) => `Help me answer: ${q}`),
      );
    }

    // Add common mistakes as "avoid" suggestions
    if (currentStepConfig.commonMistakes && currentStepConfig.commonMistakes.length > 0) {
      suggestions.push(`How do I avoid: ${currentStepConfig.commonMistakes[0]}`);
    }

    return suggestions.slice(0, 4);
  }, [currentStepConfig]);

  // Simulate AI response (stub for Vertex AI integration)
  const handleAIResponse = useCallback(
    async (_userMessage: string) => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate contextual response based on current step
      let responseContent = '';
      const suggestions: string[] = [];

      if (currentStepConfig) {
        responseContent = `I can help you with **${currentStepConfig.name}**.\n\n`;
        responseContent += currentStepConfig.helpContent?.overview ?? '';

        if (currentStepConfig.helpContent?.diveDeeper) {
          suggestions.push(...currentStepConfig.helpContent.diveDeeper.slice(0, 3));
        }
      } else {
        responseContent =
          "I'm your INSPIRE Co-Pilot! I can help you with:\n\n" +
          '- Understanding each step of the INSPIRE methodology\n' +
          '- Providing industry-specific guidance\n' +
          '- Suggesting best practices\n' +
          '- Answering questions about learning design';
      }

      const aiMessage: CoPilotMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        suggestions,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    },
    [currentStepConfig],
  );

  // Scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - scroll on message count change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Handle initial context when sidebar opens
  useEffect(() => {
    if (coPilotOpen && coPilotContext && messages.length === 0) {
      // Add context as initial user message
      const contextMessage: CoPilotMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: coPilotContext,
        timestamp: new Date(),
      };
      setMessages([contextMessage]);
      // Simulate AI response
      handleAIResponse(coPilotContext);
    }
  }, [coPilotOpen, coPilotContext, messages.length, handleAIResponse]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: CoPilotMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    await handleAIResponse(inputValue);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Sheet open={coPilotOpen} onOpenChange={toggleCoPilot}>
      <SheetContent side="right" className={cn('w-full sm:w-[400px] p-0 flex flex-col', className)}>
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-lxd-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-lxd-purple" />
              <SheetTitle className="text-base">INSPIRE Co-Pilot</SheetTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {currentPhase} - Step {currentStep}
            </Badge>
          </div>
        </SheetHeader>

        {/* Messages area */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            // Empty state with suggestions
            <div className="space-y-4">
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 mx-auto text-lxd-purple/50 mb-4" />
                <h3 className="font-medium mb-2">How can I help?</h3>
                <p className="text-sm text-muted-foreground">
                  Ask me anything about the INSPIRE methodology or your current step.
                </p>
              </div>

              {/* Contextual suggestions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Suggested questions
                </p>
                <div className="space-y-2">
                  {getContextualSuggestions().map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm',
                        'bg-lxd-dark-hover hover:bg-lxd-dark-border transition-colors',
                        'flex items-center justify-between gap-2',
                      )}
                    >
                      <span className="line-clamp-1">{suggestion}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Message list
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2',
                      message.role === 'user' ? 'bg-lxd-purple text-white' : 'bg-lxd-dark-hover',
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {/* Suggestions in AI response */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-lxd-dark-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Learn more:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-lxd-dark-surface"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-lxd-dark-hover rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input area */}
        <div className="p-4 border-t border-lxd-dark-border">
          <div className="flex gap-2">
            <Input
              placeholder="Ask the Co-Pilot..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by INSPIRE AI • Vertex AI Integration Coming Soon
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
