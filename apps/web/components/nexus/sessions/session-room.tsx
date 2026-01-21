'use client';

/**
 * Session Room
 * ============
 * Immersive mentoring session room with video, whiteboard, and code editor.
 */

import {
  Bot,
  Circle,
  Code,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Monitor,
  PenTool,
  Send,
  Settings,
  Trash2,
  Type,
  Video,
  VideoOff,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  title: string;
  mentor: {
    name: string;
    avatar: string;
    title: string;
  };
  scheduledAt: Date;
  duration: number;
  agenda: { title: string; duration: number }[];
}

interface SessionRoomProps {
  session: Session;
  onClose: () => void;
}

type Mode = 'video' | 'code' | 'board';

export function SessionRoom({ session, onClose }: SessionRoomProps): React.JSX.Element {
  const [mode, setMode] = useState<Mode>('video');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'mentor', text: 'Welcome! Ready to start?', time: '00:01' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [completedAgendaItems, setCompletedAgendaItems] = useState<number[]>([]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages([
      ...chatMessages,
      { id: Date.now().toString(), sender: 'me', text: newMessage, time: formatTime(elapsedTime) },
    ]);
    setNewMessage('');
  };

  const toggleAgendaItem = (index: number) => {
    setCompletedAgendaItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div className="fixed inset-0 bg-brand-page z-50 flex flex-col">
      {/* Session Toolbar */}
      <div className="h-14 bg-brand-page text-brand-primary flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="w-2 h-2 bg-brand-error rounded-full animate-pulse" />
          <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
          <div className="h-4 w-px bg-brand-surface-hover mx-2" />
          <span className="text-sm font-medium">{session.title}</span>
          <Badge variant="outline" className="border-brand-default text-brand-muted">
            with {session.mentor.name}
          </Badge>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-brand-surface rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMode('video')}
            className={cn(
              'px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all',
              mode === 'video'
                ? 'bg-brand-primary text-brand-primary shadow'
                : 'text-brand-muted hover:text-brand-primary',
            )}
          >
            <Video className="w-4 h-4" />
            Video
          </button>
          <button
            type="button"
            onClick={() => setMode('code')}
            className={cn(
              'px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all',
              mode === 'code'
                ? 'bg-brand-primary text-brand-primary shadow'
                : 'text-brand-muted hover:text-brand-primary',
            )}
          >
            <Code className="w-4 h-4" />
            Code
          </button>
          <button
            type="button"
            onClick={() => setMode('board')}
            className={cn(
              'px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all',
              mode === 'board'
                ? 'bg-brand-primary text-brand-primary shadow'
                : 'text-brand-muted hover:text-brand-primary',
            )}
          >
            <PenTool className="w-4 h-4" />
            Board
          </button>
        </div>

        <Button variant="destructive" size="sm" className="h-8" onClick={onClose}>
          End Session
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Main Interaction Area */}
        <div className="flex-1 flex flex-col p-4 gap-4">
          <div className="flex-1 relative bg-brand-surface rounded-xl overflow-hidden">
            {mode === 'video' && <VideoView mentor={session.mentor} />}
            {mode === 'code' && <CodeEditor />}
            {mode === 'board' && <Whiteboard />}
          </div>

          {/* Video Controls */}
          <div className="h-16 bg-brand-surface rounded-xl flex items-center justify-center gap-4">
            <Button
              variant={isMicOn ? 'secondary' : 'destructive'}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setIsMicOn(!isMicOn)}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            <Button
              variant={isVideoOn ? 'secondary' : 'destructive'}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
              <Monitor className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Right: Sidebar (Agenda/Chat) */}
        <div className="w-80 flex flex-col gap-4 p-4 border-l border-brand-subtle">
          {/* AI Suggested Agenda */}
          <div className="bg-indigo-950/50 p-4 rounded-xl border border-indigo-900">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-indigo-300 text-sm">AI Suggested Agenda</h3>
            </div>
            <div className="space-y-2">
              {session.agenda.length > 0 ? (
                session.agenda.map((item, index) => (
                  <button
                    type="button"
                    key={index}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer border-none text-left',
                      completedAgendaItems.includes(index)
                        ? 'bg-indigo-900/30'
                        : 'bg-brand-surface/50 hover:bg-brand-surface',
                    )}
                    onClick={() => toggleAgendaItem(index)}
                    aria-pressed={completedAgendaItems.includes(index)}
                  >
                    <Checkbox
                      checked={completedAgendaItems.includes(index)}
                      className="border-indigo-500 data-[state=checked]:bg-indigo-600"
                    />
                    <div className="flex-1">
                      <p
                        className={cn(
                          'text-sm',
                          completedAgendaItems.includes(index)
                            ? 'text-brand-muted line-through'
                            : 'text-brand-primary',
                        )}
                      >
                        {item.title}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-brand-muted bg-brand-page/50 px-1.5 py-0.5 rounded">
                      {item.duration}m
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-sm text-brand-muted text-center py-4">No agenda items set</div>
              )}
            </div>
            {session.agenda.length > 0 && (
              <div className="mt-4 pt-4 border-t border-indigo-900">
                <div className="flex items-center justify-between text-xs text-indigo-400">
                  <span>Progress</span>
                  <span>
                    {completedAgendaItems.length}/{session.agenda.length} items
                  </span>
                </div>
                <div className="h-2 bg-brand-surface rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all"
                    style={{
                      width: `${(completedAgendaItems.length / session.agenda.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Session Chat */}
          <div className="flex-1 bg-brand-surface rounded-xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-brand-default">
              <h4 className="text-xs font-bold text-brand-muted uppercase">Session Chat</h4>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn('flex gap-2', msg.sender === 'me' && 'flex-row-reverse')}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={msg.sender === 'mentor' ? session.mentor.avatar : undefined}
                      />
                      <AvatarFallback className="text-xs">
                        {msg.sender === 'mentor' ? session.mentor.name[0] : 'Me'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg px-3 py-1.5',
                        msg.sender === 'me'
                          ? 'bg-brand-primary text-brand-primary'
                          : 'bg-brand-surface-hover text-brand-primary',
                      )}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-[10px] opacity-60 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-brand-default">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 text-sm h-9 bg-brand-surface-hover border-0"
                />
                <Button type="submit" size="icon" className="h-9 w-9">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Video View Component
function VideoView({ mentor }: { mentor: { name: string; avatar: string } }): React.JSX.Element {
  void mentor;
  return (
    <div className="w-full h-full flex items-center justify-center bg-brand-page relative">
      {/* Main Video (Mentor) */}
      <Image
        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60"
        alt="Mentor"
        fill
        className="object-cover opacity-80"
        unoptimized
      />
      {/* Self View */}
      <div className="absolute bottom-4 right-4 w-48 h-32 bg-brand-surface rounded-lg border-2 border-brand-default overflow-hidden shadow-xl">
        <Image
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60"
          alt="Self"
          fill
          className="object-cover"
          unoptimized
        />
        <Badge className="absolute bottom-2 left-2 bg-brand-page/80">You</Badge>
      </div>
      {/* Mentor Name */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-brand-page/80 px-3 py-1.5 rounded-full">
        <Avatar className="h-6 w-6">
          <AvatarImage src={mentor.avatar} />
          <AvatarFallback>{mentor.name[0]}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-brand-primary">{mentor.name}</span>
      </div>
    </div>
  );
}

// Code Editor Component
function CodeEditor() {
  const [code, setCode] = useState(`function useMentorship() {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    // AI Matching Logic
    const bestFit = findMentor({ skill: 'React' });
    setMatch(bestFit);
  }, []);

  return match;
}`);

  return (
    <div className="w-full h-full bg-muted-foreground text-brand-secondary font-mono text-sm p-4 flex flex-col">
      <div className="flex justify-between items-center mb-2 border-b border-brand-default pb-2">
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-brand-surface-hover rounded text-xs text-brand-primary">
            App.jsx
          </span>
          <span className="px-3 py-1 hover:bg-brand-surface rounded text-xs cursor-pointer">
            styles.css
          </span>
        </div>
        <span className="text-xs text-brand-success flex items-center gap-1">
          <Circle className="w-2 h-2 fill-green-500" />
          Live Collaboration
        </span>
      </div>
      <div className="flex-1 relative">
        <div className="absolute top-0 left-0 w-8 text-brand-secondary text-right pr-2 select-none text-xs leading-6">
          {code.split('\n').map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          className="w-full h-full bg-transparent outline-hidden resize-none pl-10 text-brand-success leading-6"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
        />
      </div>
    </div>
  );
}

// Whiteboard Component
function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'text' | 'shape'>('pen');
  const [color, setColor] = useState('var(--brand-secondary)');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
  }, [color]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="relative w-full h-full bg-brand-page dark:bg-brand-surface overflow-hidden">
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(var(--brand-secondary) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Toolbar */}
      <div className="absolute top-4 left-4 flex gap-2 bg-brand-surface dark:bg-brand-page p-2 rounded-lg shadow-lg border border-brand-default dark:border-brand-default z-10">
        <button
          type="button"
          onClick={() => setTool('pen')}
          className={cn(
            'p-2 rounded transition-colors',
            tool === 'pen'
              ? 'bg-blue-100 text-brand-blue'
              : 'hover:bg-brand-surface dark:hover:bg-brand-surface',
          )}
        >
          <PenTool className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setTool('text')}
          className={cn(
            'p-2 rounded transition-colors',
            tool === 'text'
              ? 'bg-blue-100 text-brand-blue'
              : 'hover:bg-brand-surface dark:hover:bg-brand-surface',
          )}
        >
          <Type className="w-4 h-4" />
        </button>
        <div className="w-px bg-slate-200 dark:bg-brand-surface-hover mx-1" />
        <div className="flex gap-1">
          {[
            'var(--brand-secondary)',
            '#ef4444',
            'var(--color-lxd-success)',
            '#f59e0b',
            '#000000',
          ].map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                'w-6 h-6 rounded-full transition-transform',
                color === c && 'ring-2 ring-offset-2 ring-brand-primary scale-110',
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="w-px bg-slate-200 dark:bg-brand-surface-hover mx-1" />
        <button
          type="button"
          onClick={clearCanvas}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-brand-error"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="w-full h-full cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {/* Sync Status */}
      <div className="absolute bottom-4 right-4 bg-brand-surface/90 dark:bg-brand-page/90 px-3 py-1.5 rounded-full text-xs text-brand-secondary dark:text-brand-muted border border-brand-default dark:border-brand-default flex items-center gap-2">
        <Circle className="w-2 h-2 fill-green-500 text-brand-success" />
        Syncing live...
      </div>
    </div>
  );
}
