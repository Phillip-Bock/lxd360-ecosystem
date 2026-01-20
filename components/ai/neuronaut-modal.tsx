'use client';

import { ChevronDown, Mic, Send, Volume2, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { type Message, useChatStore } from '@/store/chat-store';

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser ? 'bg-blue-600/20 text-white' : 'bg-cyan-600/20 text-white',
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs text-zinc-500 mt-1 block">
          {message.timestamp.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

export default function NeuronautModal() {
  const {
    isOpen,
    setOpen,
    messages,
    addMessage,
    isLoading,
    setLoading,
    selectedModel,
    setModel,
    voiceEnabled,
    toggleVoice,
    soundEnabled,
    toggleSound,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    addMessage({
      role: 'user',
      content: input.trim(),
      tokens: Math.ceil(input.trim().length / 4), // Rough token estimate
    });
    setInput('');

    // Simulate assistant response (placeholder for actual API)
    setLoading(true);
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content:
          "I'm Neuro, your AI learning design assistant. I'm not yet connected to an API, but soon I'll be able to help you create engaging learning experiences!",
        tokens: 30,
      });
      setLoading(false);
    }, 1000);
  };

  const modelOptions = [
    { value: 'gemini-flash' as const, label: 'Gemini 1.5 Flash', desc: 'Fast' },
    { value: 'gemini-pro' as const, label: 'Gemini 1.5 Pro', desc: 'Quality' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-xs border-none cursor-pointer"
        onClick={() => setOpen(false)}
        aria-label="Close modal"
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] flex flex-col bg-zinc-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Neuro-naut Avatar */}
        <div className="flex justify-center pt-6 pb-4">
          <div className="relative h-32 w-32">
            <Image
              src="/Neuronaut e-mentor.png"
              alt="Neuro - AI Learning Assistant"
              fill
              className="object-contain"
              sizes="128px"
              priority
            />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 min-h-50 max-h-75">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <p className="text-zinc-400 text-sm">
                Hi! I&apos;m Neuro, your AI learning design assistant.
              </p>
              <p className="text-zinc-500 text-xs mt-2">
                Ask me anything about course design, content creation, or learning strategies.
              </p>
            </div>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-cyan-600/20 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          {/* Controls Row */}
          <div className="flex items-center gap-2 mb-3">
            {/* Model Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-black/50 border border-white/10 rounded-lg text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
              >
                {modelOptions.find((m) => m.value === selectedModel)?.label}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showModelDropdown && (
                <div className="absolute bottom-full left-0 mb-1 w-48 bg-zinc-800 border border-white/10 rounded-lg shadow-xl overflow-hidden">
                  {modelOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setModel(option.value);
                        setShowModelDropdown(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-white/5 transition-colors',
                        selectedModel === option.value ? 'text-cyan-400' : 'text-zinc-300',
                      )}
                    >
                      <span>{option.label}</span>
                      <span className="text-xs text-zinc-500">{option.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Toggle */}
            <button
              type="button"
              onClick={toggleVoice}
              className={cn(
                'p-2 rounded-lg transition-colors',
                voiceEnabled ? 'text-cyan-400 bg-cyan-400/10' : 'text-zinc-500 hover:text-zinc-300',
              )}
              title="Voice input"
            >
              <Mic className="h-4 w-4" />
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={cn(
                'p-2 rounded-lg transition-colors',
                soundEnabled ? 'text-cyan-400 bg-cyan-400/10' : 'text-zinc-500 hover:text-zinc-300',
              )}
              title="Text-to-speech output"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>

          {/* Text Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Neuro anything..."
              className="flex-1 px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                'p-2.5 rounded-xl transition-colors',
                input.trim() && !isLoading
                  ? 'bg-cyan-500 text-white hover:bg-cyan-400'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed',
              )}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
