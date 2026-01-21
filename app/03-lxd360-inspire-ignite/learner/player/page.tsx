'use client';

export const dynamic = 'force-dynamic';

import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle,
  ChevronsLeft,
  ChevronsRight,
  Circle,
  Clock,
  GalleryVerticalEnd,
  Globe,
  GraduationCap,
  LayoutGrid,
  Loader2,
  Lock,
  NotebookPen,
  PlayCircle,
  Sparkles,
  Volume2,
  Wand2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// ============================================================================
// GEMINI API HELPER (via secure server-side route)
// ============================================================================

// PCM to WAV Converter for Gemini TTS
function pcmToWav(pcmBase64: string, sampleRate = 24000): Blob {
  const binaryString = atob(pcmBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  const pcmData = new Int16Array(bytes.buffer);

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmData.byteLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcmData.byteLength, true);

  return new Blob([view, pcmData], { type: 'audio/wav' });
}

// Gemini API Caller (via secure server-side route - API key not exposed to client)
async function callGemini(
  prompt: string,
  type: 'text' | 'json' | 'tts' = 'text',
): Promise<string | null> {
  const retries = 3;
  let delay = 1000;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type }),
      });

      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();

      return data.result ?? null;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  return null;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CourseModule {
  id: string;
  title: string;
  duration: string;
  rawText: string;
}

interface Flashcard {
  front: string;
  back: string;
}

// ============================================================================
// SAMPLE COURSE DATA
// ============================================================================

const courseModules: CourseModule[] = [
  {
    id: 'intro',
    title: '1. Introduction to Office Tools',
    duration: '15 min',
    rawText:
      "Welcome to the comprehensive course on essential office tools! In this introductory module, you'll get an overview of the tools we'll cover and how they can boost your productivity.",
  },
  {
    id: 'word',
    title: '2. Mastering Word Processing',
    duration: '30 min',
    rawText:
      'Dive deep into Microsoft Word, the industry standard for document creation. Learn how to format text, use styles, insert images, create tables, and collaborate effectively on documents.',
  },
  {
    id: 'excel',
    title: '3. Excel for Data Analysis',
    duration: '45 min',
    rawText:
      'Unlock the power of data with Microsoft Excel. This module will teach you how to organize, analyze, and visualize data using formulas, functions, charts, and pivot tables.',
  },
  {
    id: 'powerpoint',
    title: '4. Dynamic Presentations',
    duration: '20 min',
    rawText:
      'Create impactful and engaging presentations with Microsoft PowerPoint. Learn design principles, animation techniques, slide transitions, and how to effectively deliver your message.',
  },
  {
    id: 'teams',
    title: '5. Collaborating with Teams',
    duration: '35 min',
    rawText:
      'Collaborate seamlessly with Microsoft Teams. Learn how to set up teams and channels, conduct meetings, share files, and integrate with other office applications.',
  },
  {
    id: 'final',
    title: '6. Final Assessment',
    duration: '60 min',
    rawText:
      'Congratulations on reaching the final assessment! This module will test your understanding of all the office tools covered in the course.',
  },
];

// ============================================================================
// NAVIGATION COMPONENT
// ============================================================================

function Navigation({
  isCollapsed,
  toggle,
  currentModule,
  completedModules,
  onSelectModule,
}: {
  isCollapsed: boolean;
  toggle: () => void;
  currentModule: string;
  completedModules: string[];
  onSelectModule: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'bg-brand-surface h-full border-r border-brand-default transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-16 items-center' : 'w-64',
      )}
    >
      <div className="p-4 border-b border-gray-100 flex justify-between items-center h-16">
        {!isCollapsed && (
          <h2 className="font-bold text-brand-primary flex items-center text-sm uppercase tracking-wide">
            <LayoutGrid className="mr-2 h-4 w-4" /> Modules
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-2 w-full">
        {courseModules.map((m, i) => {
          const isCompleted = completedModules.includes(m.id);
          const isCurrent = currentModule === m.id;
          const isLocked =
            !isCompleted &&
            !isCurrent &&
            i > 0 &&
            !completedModules.includes(courseModules[i - 1].id);

          if (isCollapsed) {
            return (
              <button
                type="button"
                key={m.id}
                className={cn(
                  'relative flex justify-center py-2 cursor-pointer group w-full bg-transparent border-none',
                  isLocked && 'cursor-not-allowed',
                )}
                disabled={isLocked}
                onClick={() => !isLocked && onSelectModule(m.id)}
                aria-label={`${m.title}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : isLocked ? ' (locked)' : ''}`}
              >
                <div
                  className={cn(
                    'transition-all duration-300',
                    isCurrent && 'text-indigo-600 scale-125',
                    isCompleted && 'text-brand-success',
                    isLocked && 'text-brand-secondary',
                    !isCurrent && !isCompleted && !isLocked && 'text-indigo-300',
                  )}
                >
                  <Circle
                    className="h-3.5 w-3.5"
                    fill={isCompleted || isCurrent ? 'currentColor' : 'none'}
                    aria-hidden="true"
                  />
                </div>
                {/* Tooltip */}
                <div className="hidden group-hover:block absolute left-14 top-1/2 -translate-y-1/2 bg-brand-page text-brand-primary text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                  {m.title}
                </div>
              </button>
            );
          }

          return (
            <button
              type="button"
              key={m.id}
              disabled={isLocked}
              onClick={() => !isLocked && onSelectModule(m.id)}
              className={cn(
                'mx-3 p-3 rounded-lg text-sm cursor-pointer transition-all flex items-center w-[calc(100%-1.5rem)] bg-transparent border-none text-left',
                isCurrent && 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600',
                isLocked && 'opacity-50 cursor-not-allowed text-brand-muted',
                !isCurrent && !isLocked && 'hover:bg-brand-page text-brand-secondary',
              )}
              aria-label={`${m.title}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : isLocked ? ' (locked)' : ''}`}
            >
              <div className="mr-3" aria-hidden="true">
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-brand-success" />
                ) : isCurrent ? (
                  <PlayCircle className="h-4 w-4 text-indigo-600" />
                ) : isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <span className="truncate">{m.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// FLASHCARD COMPONENT
// ============================================================================

function FlashcardComponent({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      className="h-40 w-full perspective-1000 cursor-pointer group bg-transparent border-none p-0 text-left"
      onClick={() => setFlipped(!flipped)}
      aria-label={
        flipped
          ? `Flashcard back: ${back}. Tap to flip.`
          : `Flashcard front: ${front}. Tap to flip.`
      }
    >
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-500 shadow-md rounded-xl',
          flipped && 'rotate-y-180',
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0 bg-brand-surface rounded-xl p-4 flex flex-col items-center justify-center text-center border-2 border-indigo-50 group-hover:border-indigo-200 transition-colors"
          style={{ backfaceVisibility: 'hidden' }}
          aria-hidden={flipped}
        >
          <p className="font-medium text-brand-primary">{front}</p>
          <span className="absolute bottom-2 text-xs text-brand-muted uppercase tracking-wider">
            Tap to flip
          </span>
        </div>
        <div
          className="absolute inset-0 bg-indigo-600 rounded-xl p-4 flex flex-col items-center justify-center text-center text-brand-primary"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          aria-hidden={!flipped}
        >
          <p className="font-medium">{back}</p>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// TOOLBOX SIDEBAR COMPONENT
// ============================================================================

function ToolboxSidebar({
  currentModuleId,
  allNotes,
  onSaveNote,
  activeTab,
  setActiveTab,
  flashcards,
  onGenerateFlashcards,
  isGeneratingCards,
}: {
  currentModuleId: string;
  allNotes: Record<string, string>;
  onSaveNote: (id: string, text: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  flashcards: Record<string, Flashcard[]>;
  onGenerateFlashcards: () => void;
  isGeneratingCards: boolean;
}) {
  const [noteContent, setNoteContent] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNoteContent(allNotes[currentModuleId] || '');
  }, [currentModuleId, allNotes]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="bg-brand-surface border-l border-brand-default h-full flex flex-col shadow-xl z-20 w-80 lg:w-96 transition-all">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
          <TabsTrigger value="journal" className="flex flex-col items-center gap-1 py-3">
            <NotebookPen className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-wider">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex flex-col items-center gap-1 py-3">
            <Bot className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-wider">AI Tutor</span>
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex flex-col items-center gap-1 py-3">
            <GalleryVerticalEnd className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-wider">Cards</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden bg-brand-page/50">
          <TabsContent value="journal" className="h-full m-0 p-4">
            <Textarea
              className="flex-1 h-full min-h-[400px] bg-transparent resize-none outline-hidden text-sm leading-relaxed"
              placeholder="Type notes here..."
              value={noteContent}
              onChange={(e) => {
                setNoteContent(e.target.value);
                onSaveNote(currentModuleId, e.target.value);
              }}
            />
          </TabsContent>

          <TabsContent value="ai" className="h-full m-0 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-center text-brand-muted mt-12 px-6">
                <Sparkles className="mx-auto mb-3 opacity-30 h-10 w-10" />
                <p className="text-sm">AI Tutor functionality coming soon!</p>
              </div>
              <div ref={chatEndRef} />
            </div>
          </TabsContent>

          <TabsContent value="flashcards" className="h-full m-0 p-4 overflow-y-auto">
            {!flashcards[currentModuleId] ? (
              <div className="text-center mt-12">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BrainCircuit className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="font-bold text-brand-primary mb-2">Study Smart</h3>
                <p className="text-sm text-brand-muted mb-6">
                  Generate AI flashcards from this module to test your knowledge.
                </p>
                <Button
                  onClick={onGenerateFlashcards}
                  disabled={isGeneratingCards}
                  className="w-full"
                >
                  {isGeneratingCards ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Cards
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-brand-secondary">Review Deck</h3>
                  <button
                    type="button"
                    onClick={onGenerateFlashcards}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Regenerate
                  </button>
                </div>
                {flashcards[currentModuleId].map((card, idx) => (
                  <FlashcardComponent key={idx} front={card.front} back={card.back} />
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ============================================================================
// MAIN CONTENT COMPONENT
// ============================================================================

function MainContent({
  currentModule,
  onCompleteModule,
}: {
  currentModule: string;
  onCompleteModule: (id: string) => void;
}) {
  const [language, setLanguage] = useState('English');
  const [displayedText, setDisplayedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const moduleData = courseModules.find((m) => m.id === currentModule);

  useEffect(() => {
    if (!moduleData) {
      console.error('[MainContent] Module not found', { currentModule });
      return;
    }
    setLanguage('English');
    setDisplayedText(moduleData.rawText);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [currentModule, moduleData]);

  const handleTranslate = async (lang: string) => {
    if (!moduleData) return;

    setLanguage(lang);
    if (lang === 'English') {
      setDisplayedText(moduleData.rawText);
      return;
    }
    setIsTranslating(true);
    try {
      const res = await callGemini(
        `Translate the following educational text into ${lang}. Keep formatting simple.\n\nText: "${moduleData.rawText}"`,
      );
      if (res) setDisplayedText(res);
    } catch (error) {
      console.error('[Translation] Failed to translate content', {
        language: lang,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setLanguage('English');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTTS = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    setLoadingAudio(true);
    try {
      const pcmData = await callGemini(displayedText, 'tts');
      if (!pcmData) throw new Error('No audio data');

      const wavBlob = pcmToWav(pcmData);
      const audioUrl = URL.createObjectURL(wavBlob);

      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      audioRef.current = audio;
      setIsPlaying(true);
    } catch (error) {
      console.error('[TTS] Failed to generate audio', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoadingAudio(false);
    }
  };

  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese'];

  if (!moduleData) {
    return (
      <div className="flex-1 bg-brand-surface rounded-2xl shadow-sm m-4 md:m-6 p-8 flex items-center justify-center">
        <div className="text-center text-brand-muted">
          <p>Module not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-brand-surface rounded-2xl shadow-sm m-4 md:m-6 p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
              Module
            </span>
            <span className="text-xs text-brand-muted flex items-center">
              <Clock className="mr-1 h-3 w-3" /> {moduleData.duration}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-brand-primary">{moduleData.title}</h1>
        </div>

        {/* Tools: Translate & TTS */}
        <div className="flex items-center space-x-3">
          <Button
            variant={isPlaying ? 'destructive' : 'outline'}
            onClick={handleTTS}
            disabled={loadingAudio}
          >
            {loadingAudio ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Volume2 className="mr-2 h-4 w-4" />
            )}
            {isPlaying ? 'Stop' : 'Listen'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Globe className="mr-2 h-4 w-4" />
                {language}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {languages.map((lang) => (
                <DropdownMenuItem key={lang} onClick={() => handleTranslate(lang)}>
                  {lang}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          'prose prose-lg max-w-none text-brand-secondary leading-relaxed transition-opacity',
          isTranslating && 'opacity-50',
        )}
      >
        {displayedText.split('\n').map((p, i) => (
          <p key={i} className="mb-4">
            {p}
          </p>
        ))}
      </div>

      {/* Footer / Complete */}
      <div className="mt-12 border-t border-gray-100 pt-8 flex justify-end">
        <Button size="lg" onClick={() => onCompleteModule(moduleData.id)}>
          Complete Module <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function LearnerPlayerPage() {
  const [currentModule, setCurrentModule] = useState(courseModules[0].id);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  // Toolbox State
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('journal');
  const [flashcards, setFlashcards] = useState<Record<string, Flashcard[]>>({});
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('LXP360_Notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (error) {
        console.error('[Notes] Failed to parse saved notes', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }, []);

  const handleSaveNote = useCallback((id: string, text: string) => {
    setNotes((prev) => {
      const updated = { ...prev, [id]: text };
      localStorage.setItem('LXP360_Notes', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleGenerateFlashcards = async () => {
    if (flashcards[currentModule]) return;
    setIsGeneratingCards(true);
    const mod = courseModules.find((m) => m.id === currentModule);
    if (!mod) return;

    try {
      const prompt = `Create 4 flashcards from: "${mod.rawText}". JSON Format: { "cards": [{"front": "Question?", "back": "Answer"}] }`;
      const json = await callGemini(prompt, 'json');
      if (json) {
        const data = JSON.parse(json);
        setFlashcards((prev) => ({ ...prev, [currentModule]: data.cards }));
      }
    } catch (error) {
      console.error('[Flashcards] Failed to generate flashcards', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const handleComplete = (id: string) => {
    if (!completedModules.includes(id)) {
      const newCompleted = [...completedModules, id];
      setCompletedModules(newCompleted);

      // Confetti on final module (would need canvas-confetti package)
      if (id === 'final') {
        // confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }

      // Auto-advance
      const idx = courseModules.findIndex((m) => m.id === id);
      if (idx < courseModules.length - 1) {
        setCurrentModule(courseModules[idx + 1].id);
      }
    }
  };

  const progressPercent = (completedModules.length / courseModules.length) * 100;

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-brand-primary bg-brand-page">
      {/* Header */}
      <header className="bg-brand-surface border-b border-brand-default z-30 shrink-0 h-16 flex items-center px-6 justify-between shadow-sm">
        <div className="flex items-center">
          <div className="bg-indigo-600 p-1.5 rounded-lg mr-3">
            <GraduationCap className="text-brand-primary h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-brand-primary tracking-tight">
            LXP<span className="text-indigo-600">360</span> Player
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">
              Progress
            </span>
            <Progress value={progressPercent} className="w-32 h-2 mt-1" />
          </div>
          <div className="h-8 w-8 bg-linear-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-brand-primary font-bold text-xs shadow-md border-2 border-white">
            L
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        <Navigation
          isCollapsed={isMenuCollapsed}
          toggle={() => setIsMenuCollapsed(!isMenuCollapsed)}
          currentModule={currentModule}
          completedModules={completedModules}
          onSelectModule={setCurrentModule}
        />

        <MainContent currentModule={currentModule} onCompleteModule={handleComplete} />

        <ToolboxSidebar
          currentModuleId={currentModule}
          allNotes={notes}
          onSaveNote={handleSaveNote}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          flashcards={flashcards}
          onGenerateFlashcards={handleGenerateFlashcards}
          isGeneratingCards={isGeneratingCards}
        />
      </div>
    </div>
  );
}
