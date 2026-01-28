'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, Minimize2, Send, Volume2, VolumeX, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';

const log = logger.scope('AiCharacterChat');

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  AI_PERSONAS,
  type AIPersonaId,
  getPersonaForRoute,
} from '@/lib/ai-personas/persona-config';
import { useAudio } from '@/lib/audio/audio-manager';
import type { CharacterState } from '@/lib/three/character-states';
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import { CharacterDisplay } from './character-display';
import { PersonaSelector } from './persona-selector';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiCharacterChatProps {
  tenantId?: string;
}

export function AiCharacterChat({ tenantId }: AiCharacterChatProps) {
  const { user } = useSafeAuth();
  const audio = useAudio();
  const pathname = usePathname();

  // Persona state with route-based default
  const defaultPersona = getPersonaForRoute(pathname);
  const [currentPersona, setCurrentPersona] = useState<AIPersonaId>(defaultPersona);

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Get the current persona config
  const persona = AI_PERSONAS[currentPersona];

  // Update persona when route changes
  useEffect(() => {
    setCurrentPersona(getPersonaForRoute(pathname));
  }, [pathname]);

  // Init audio on first click
  useEffect(() => {
    const initAudio = () => {
      audio.init();
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, [audio]);

  // Auto-scroll when new messages arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional trigger on message count change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  // Lip sync simulation
  const simulateLipSync = useCallback((durationMs: number) => {
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      if (elapsed < durationMs) {
        setMouthOpenness(Math.abs(Math.sin(elapsed * 0.015)) * 0.7);
        requestAnimationFrame(animate);
      } else {
        setMouthOpenness(0);
      }
    };
    animate();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setCharacterState('thinking');

    if (audioEnabled) {
      audio.play('send');
      audio.play('thinking');
    }

    try {
      const res = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin', // Include session cookie for auth
        body: JSON.stringify({
          message: userMsg.content,
          personaId: currentPersona,
          systemPrompt: persona.systemPrompt,
          history: messages.slice(-10),
        }),
      });

      audio.stop('thinking');

      if (!res.ok) throw new Error('AI request failed');

      const data = await res.json();

      if (audioEnabled) audio.play('receive');

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setCharacterState('speaking');

      // TTS - Uses existing Google TTS API that returns base64 audio
      if (audioEnabled) {
        try {
          const ttsRes = await fetch('/api/tts/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin', // Include session cookie for auth
            body: JSON.stringify({
              text: data.response,
              voiceId: 'en-US-Neural2-J', // Friendly assistant voice
              settings: { speakingRate: 1.0, pitch: 0 },
            }),
          });

          const ttsData = await ttsRes.json();

          if (ttsData.success && ttsData.audioBase64) {
            // Convert base64 to blob for audio playback
            const byteCharacters = atob(ttsData.audioBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);

            const wordCount = data.response.split(' ').length;
            const estimatedMs = (wordCount / 150) * 60 * 1000;

            simulateLipSync(estimatedMs);

            audio.playTTS(url, () => {
              setCharacterState('idle');
              setMouthOpenness(0);
              URL.revokeObjectURL(url);
            });
          } else {
            setTimeout(() => setCharacterState('idle'), 2000);
          }
        } catch {
          setTimeout(() => setCharacterState('idle'), 2000);
        }
      } else {
        setTimeout(() => setCharacterState('idle'), 2000);
      }
    } catch (err) {
      log.error('AI error', err instanceof Error ? err : new Error(String(err)));
      audio.stop('thinking');
      if (audioEnabled) audio.play('error');
      setCharacterState('error');

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);

      setTimeout(() => setCharacterState('idle'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <Card
                className={`
                  bg-card/95 backdrop-blur-xl border-[var(--color-lxd-primary)]/20
                  shadow-[0_0_40px_rgba(0,114,245,0.15)]
                  ${isExpanded ? 'w-[500px] h-[600px]' : 'w-[360px] h-[480px]'}
                  transition-all duration-300
                `}
              >
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: persona.primaryColor }}
                    />
                    <CardTitle className="text-sm font-medium">{persona.name}</CardTitle>
                    <Badge
                      variant="outline"
                      style={{ borderColor: persona.primaryColor, color: persona.primaryColor }}
                      className="text-xs"
                    >
                      {persona.tagline}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <PersonaSelector
                      currentPersona={currentPersona}
                      onSelect={setCurrentPersona}
                      disabled={isLoading}
                    />
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setAudioEnabled(!audioEnabled)}
                    >
                      {audioEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0 flex flex-col h-[calc(100%-52px)]">
                  {/* Character Display */}
                  <div className={`relative ${isExpanded ? 'h-[180px]' : 'h-[120px]'}`}>
                    <CharacterDisplay
                      personaId={currentPersona}
                      state={characterState}
                      mouthOpenness={mouthOpenness}
                      tenantId={tenantId}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 px-4" ref={scrollRef}>
                    <div className="space-y-3 py-3">
                      {messages.length === 0 && (
                        <p className="text-center text-muted-foreground text-sm py-6">
                          {persona.greeting.replace(
                            /Hello|Hi|Hey there/,
                            `Hey ${user?.displayName?.split(' ')[0] || 'there'}`,
                          )}
                        </p>
                      )}
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                              msg.role === 'user' ? 'text-white' : 'bg-muted'
                            }`}
                            style={
                              msg.role === 'user'
                                ? { backgroundColor: persona.primaryColor }
                                : undefined
                            }
                          >
                            {msg.content}
                          </div>
                        </motion.div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg px-3 py-2 flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className="w-2 h-2 rounded-full animate-bounce"
                                style={{
                                  backgroundColor: persona.accentColor,
                                  animationDelay: `${i * 0.1}s`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <form onSubmit={handleSubmit} className="p-3 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Ask ${persona.name} anything...`}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        style={{ backgroundColor: persona.primaryColor }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="button"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Button
                type="button"
                onClick={() => {
                  audio.play('click');
                  setIsOpen(true);
                }}
                className="h-14 w-14 rounded-full shadow-[0_0_30px_rgba(0,114,245,0.3)] hover:shadow-[0_0_40px_rgba(0,114,245,0.5)]"
                style={{ backgroundColor: persona.primaryColor }}
              >
                <persona.fallbackIcon className="h-6 w-6" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
