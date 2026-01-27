'use client';

/**
 * AITextToolbar - Floating toolbar for AI-powered text actions
 * Appears when text is selected in content blocks
 */

import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Check,
  Globe,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  Volume2,
  Wand2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type AIAction = 'improve' | 'simplify' | 'rephrase' | 'translate' | 'concise' | 'expand' | 'tts';

interface SelectionInfo {
  text: string;
  rect: DOMRect;
  blockId: string;
}

interface AITextToolbarProps {
  selection: SelectionInfo | null;
  onAction: (action: AIAction, result: string) => void;
  onClose: () => void;
  isProcessing?: boolean;
}

interface ActionConfig {
  id: AIAction;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  description: string;
  shortcut?: string;
}

const ACTIONS: ActionConfig[] = [
  {
    id: 'improve',
    label: 'Improve Writing',
    shortLabel: 'Improve',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Enhance clarity and flow',
    shortcut: 'I',
  },
  {
    id: 'simplify',
    label: 'Simplify',
    shortLabel: 'Simplify',
    icon: <ArrowDownWideNarrow className="h-4 w-4" />,
    description: 'Make easier to understand',
    shortcut: 'S',
  },
  {
    id: 'rephrase',
    label: 'Rephrase',
    shortLabel: 'Rephrase',
    icon: <RefreshCw className="h-4 w-4" />,
    description: 'Say it differently',
    shortcut: 'R',
  },
  {
    id: 'concise',
    label: 'Make Concise',
    shortLabel: 'Concise',
    icon: <Target className="h-4 w-4" />,
    description: 'Shorten while keeping meaning',
    shortcut: 'C',
  },
  {
    id: 'expand',
    label: 'Expand',
    shortLabel: 'Expand',
    icon: <ArrowUpWideNarrow className="h-4 w-4" />,
    description: 'Add more detail',
    shortcut: 'E',
  },
  {
    id: 'translate',
    label: 'Translate',
    shortLabel: 'Translate',
    icon: <Globe className="h-4 w-4" />,
    description: 'Translate to another language',
    shortcut: 'T',
  },
  {
    id: 'tts',
    label: 'Generate Audio',
    shortLabel: 'Audio',
    icon: <Volume2 className="h-4 w-4" />,
    description: 'Create text-to-speech audio',
    shortcut: 'A',
  },
];

/**
 * AITextToolbar - Floating AI action toolbar
 */
export function AITextToolbar({
  selection,
  onAction,
  onClose,
  isProcessing = false,
}: AITextToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Calculate position above selection
  useEffect(() => {
    if (!selection) return;

    const rect = selection.rect;
    const toolbarWidth = 400;
    const toolbarHeight = 48;
    const padding = 8;

    // Position above the selection, centered
    let left = rect.left + rect.width / 2 - toolbarWidth / 2;
    let top = rect.top - toolbarHeight - padding;

    // Keep within viewport bounds
    if (left < padding) left = padding;
    if (left + toolbarWidth > window.innerWidth - padding) {
      left = window.innerWidth - toolbarWidth - padding;
    }
    if (top < padding) {
      // Show below selection if not enough room above
      top = rect.bottom + padding;
    }

    setPosition({ top, left });
  }, [selection]);

  // handleAction must be defined before the useEffect that uses it
  const handleAction = useCallback(
    async (action: AIAction) => {
      if (!selection || isProcessing) return;

      setActiveAction(action);

      // Simulate AI processing (in real implementation, call API)
      // For now, pass back a mock result
      const mockResults: Record<AIAction, string> = {
        improve: `${selection.text} (improved version)`,
        simplify: `${selection.text} (simplified)`,
        rephrase: `${selection.text} (rephrased)`,
        translate: `${selection.text} (translated)`,
        concise: `${selection.text.slice(0, Math.ceil(selection.text.length * 0.7))}...`,
        expand: `${selection.text} Additionally, this provides more context and detail.`,
        tts: selection.text, // For TTS, just pass the text
      };

      // In real implementation, this would be the API response
      const timeout = setTimeout(() => {
        const resultText = mockResults[action];
        setResult(resultText);
        setShowResult(true);
        onAction(action, resultText);
        setActiveAction(null);
      }, 1000);

      return () => clearTimeout(timeout);
    },
    [selection, isProcessing, onAction],
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selection) return;

      // Escape to close
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Cmd/Ctrl + Shift + A to toggle
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'a') {
        e.preventDefault();
        return;
      }

      // Action shortcuts (when not processing)
      if (!isProcessing && e.altKey) {
        const action = ACTIONS.find((a) => a.shortcut?.toLowerCase() === e.key.toLowerCase());
        if (action) {
          e.preventDefault();
          handleAction(action.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, isProcessing, onClose, handleAction]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAcceptResult = () => {
    if (result) {
      onAction(activeAction || 'improve', result);
    }
    setShowResult(false);
    setResult(null);
    onClose();
  };

  const handleRejectResult = () => {
    setShowResult(false);
    setResult(null);
  };

  if (!selection) return null;

  return (
    <TooltipProvider>
      <div
        ref={toolbarRef}
        className={cn(
          'fixed z-50 flex items-center gap-1 p-1.5 rounded-lg',
          'bg-(--studio-surface)/95 backdrop-blur-xl border border-white/10',
          'shadow-xl shadow-black/50',
          'animate-in fade-in-0 zoom-in-95 duration-150',
        )}
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* AI Badge */}
        <div className="flex items-center gap-1 px-2 py-1 bg-primary/20 rounded-md mr-1">
          <Wand2 className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-medium text-primary">AI</span>
        </div>

        {/* Action Buttons */}
        {ACTIONS.map((action) => (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 px-2 gap-1.5 text-xs',
                  'hover:bg-primary/20 hover:text-primary',
                  activeAction === action.id && 'bg-primary/20 text-primary',
                )}
                onClick={() => handleAction(action.id)}
                disabled={isProcessing}
              >
                {activeAction === action.id && isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  action.icon
                )}
                <span className="hidden sm:inline">{action.shortLabel}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="flex flex-col gap-0.5">
              <span className="font-medium">{action.label}</span>
              <span className="text-xs text-zinc-400">{action.description}</span>
              {action.shortcut && (
                <span className="text-[10px] text-zinc-500">Alt + {action.shortcut}</span>
              )}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Close Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>Close</span>
            <span className="text-xs text-zinc-500 ml-2">Esc</span>
          </TooltipContent>
        </Tooltip>

        {/* Result Preview (if showing) */}
        {showResult && result && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3 rounded-lg bg-(--studio-surface)/95 backdrop-blur-xl border border-white/10 shadow-xl">
            <div className="text-[10px] uppercase text-zinc-500 mb-2">Result Preview</div>
            <p className="text-sm text-white mb-3 max-h-24 overflow-y-auto">{result}</p>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-7 text-xs" onClick={handleAcceptResult}>
                <Check className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-white/10"
                onClick={handleRejectResult}
              >
                <X className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default AITextToolbar;
