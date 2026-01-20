'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Command Palette Component
 * =============================================================================
 *
 * A searchable command palette (like VS Code's Ctrl+Shift+P) that allows
 * users to quickly find and execute unknown ribbon command.
 */

import {
  AlignLeft,
  // Formatting icons
  Bold,
  Command,
  Eye,
  HelpCircle,
  // Icons for command categories
  Home,
  Image,
  Italic,
  Languages,
  Link2,
  List,
  MousePointerClick,
  Palette,
  Plus,
  Search,
  Settings,
  Sparkles,
  Table2,
  Underline,
  Video,
  // AI icons
  Wand2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  category: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string, options?: unknown) => void;
}

// Command definitions
const createCommands = (onCommand: (cmd: string, opts?: unknown) => void): CommandItem[] => [
  // Home Tab Commands
  {
    id: 'bold',
    label: 'Bold',
    description: 'Make text bold',
    category: 'Formatting',
    icon: Bold,
    shortcut: 'Ctrl+B',
    action: () => onCommand('bold'),
  },
  {
    id: 'italic',
    label: 'Italic',
    description: 'Make text italic',
    category: 'Formatting',
    icon: Italic,
    shortcut: 'Ctrl+I',
    action: () => onCommand('italic'),
  },
  {
    id: 'underline',
    label: 'Underline',
    description: 'Underline text',
    category: 'Formatting',
    icon: Underline,
    shortcut: 'Ctrl+U',
    action: () => onCommand('underline'),
  },
  {
    id: 'align-left',
    label: 'Align Left',
    description: 'Align text to left',
    category: 'Formatting',
    icon: AlignLeft,
    action: () => onCommand('align', 'left'),
  },
  {
    id: 'bullet-list',
    label: 'Bullet List',
    description: 'Create bullet list',
    category: 'Formatting',
    icon: List,
    action: () => onCommand('bulletList'),
  },

  // Insert Commands
  {
    id: 'insert-image',
    label: 'Insert Image',
    description: 'Add an image',
    category: 'Insert',
    icon: Image,
    shortcut: 'Ctrl+Shift+I',
    action: () => onCommand('insert', 'image'),
  },
  {
    id: 'insert-video',
    label: 'Insert Video',
    description: 'Add a video',
    category: 'Insert',
    icon: Video,
    action: () => onCommand('insert', 'video'),
  },
  {
    id: 'insert-table',
    label: 'Insert Table',
    description: 'Add a table',
    category: 'Insert',
    icon: Table2,
    action: () => onCommand('insert', 'table'),
  },
  {
    id: 'insert-link',
    label: 'Insert Link',
    description: 'Add a hyperlink',
    category: 'Insert',
    icon: Link2,
    shortcut: 'Ctrl+K',
    action: () => onCommand('insert', 'link'),
  },
  {
    id: 'insert-quiz',
    label: 'Insert Quiz',
    description: 'Add a quiz question',
    category: 'Insert',
    icon: HelpCircle,
    action: () => onCommand('insert', 'quiz'),
  },
  {
    id: 'insert-accordion',
    label: 'Insert Accordion',
    description: 'Add expandable accordion',
    category: 'Insert',
    icon: MousePointerClick,
    action: () => onCommand('insert', 'accordion'),
  },
  {
    id: 'insert-tabs',
    label: 'Insert Tabs',
    description: 'Add tab panels',
    category: 'Insert',
    icon: MousePointerClick,
    action: () => onCommand('insert', 'tabs'),
  },
  {
    id: 'insert-carousel',
    label: 'Insert Carousel',
    description: 'Add image carousel',
    category: 'Insert',
    icon: MousePointerClick,
    action: () => onCommand('insert', 'carousel'),
  },
  {
    id: 'insert-flipcard',
    label: 'Insert Flip Cards',
    description: 'Add flip card interaction',
    category: 'Insert',
    icon: MousePointerClick,
    action: () => onCommand('insert', 'flipcard'),
  },
  {
    id: 'insert-timeline',
    label: 'Insert Timeline',
    description: 'Add timeline',
    category: 'Insert',
    icon: MousePointerClick,
    action: () => onCommand('insert', 'timeline'),
  },
  {
    id: 'insert-hotspot',
    label: 'Insert Hotspots',
    description: 'Add interactive hotspots',
    category: 'Insert',
    icon: MousePointerClick,
    action: () => onCommand('insert', 'hotspot'),
  },

  // AI Commands
  {
    id: 'ai-generate',
    label: 'AI Generate Content',
    description: 'Generate content with AI',
    category: 'AI Studio',
    icon: Sparkles,
    shortcut: 'Ctrl+Shift+G',
    action: () => onCommand('ai', 'generate'),
  },
  {
    id: 'ai-improve',
    label: 'AI Improve Selection',
    description: 'Improve selected text',
    category: 'AI Studio',
    icon: Wand2,
    action: () => onCommand('ai', 'improve'),
  },
  {
    id: 'ai-translate',
    label: 'AI Translate',
    description: 'Translate content',
    category: 'AI Studio',
    icon: Languages,
    action: () => onCommand('ai', 'translate'),
  },
  {
    id: 'ai-quiz',
    label: 'AI Generate Quiz',
    description: 'Generate quiz from content',
    category: 'AI Studio',
    icon: HelpCircle,
    action: () => onCommand('ai', 'generateQuiz'),
  },
  {
    id: 'ai-image',
    label: 'AI Generate Image',
    description: 'Generate image with AI',
    category: 'AI Studio',
    icon: Image,
    action: () => onCommand('ai', 'generateImage'),
  },
  {
    id: 'ai-alt-text',
    label: 'AI Generate Alt Text',
    description: 'Generate alt text for images',
    category: 'AI Studio',
    icon: Eye,
    action: () => onCommand('ai', 'generateAltText'),
  },
  {
    id: 'ai-accessibility',
    label: 'AI Accessibility Check',
    description: 'Check accessibility issues',
    category: 'AI Studio',
    icon: Eye,
    action: () => onCommand('ai', 'accessibilityCheck'),
  },

  // View Commands
  {
    id: 'preview',
    label: 'Preview',
    description: 'Preview the lesson',
    category: 'View',
    icon: Eye,
    shortcut: 'Ctrl+Shift+P',
    action: () => onCommand('preview'),
  },
  {
    id: 'zoom-in',
    label: 'Zoom In',
    description: 'Increase zoom level',
    category: 'View',
    icon: Plus,
    shortcut: 'Ctrl++',
    action: () => onCommand('zoomIn'),
  },
  {
    id: 'zoom-out',
    label: 'Zoom Out',
    description: 'Decrease zoom level',
    category: 'View',
    icon: Plus,
    shortcut: 'Ctrl+-',
    action: () => onCommand('zoomOut'),
  },
  {
    id: 'toggle-grid',
    label: 'Toggle Grid',
    description: 'Show/hide grid',
    category: 'View',
    icon: Settings,
    action: () => onCommand('toggleGrid'),
  },

  // Design Commands
  {
    id: 'themes',
    label: 'Change Theme',
    description: 'Select a theme',
    category: 'Design',
    icon: Palette,
    action: () => onCommand('openThemes'),
  },
  {
    id: 'colors',
    label: 'Color Settings',
    description: 'Customize colors',
    category: 'Design',
    icon: Palette,
    action: () => onCommand('openColors'),
  },

  // Navigation
  {
    id: 'goto-home',
    label: 'Go to Home Tab',
    description: 'Switch to Home tab',
    category: 'Navigation',
    icon: Home,
    action: () => onCommand('switchTab', 'home'),
  },
  {
    id: 'goto-insert',
    label: 'Go to Insert Tab',
    description: 'Switch to Insert tab',
    category: 'Navigation',
    icon: Plus,
    action: () => onCommand('switchTab', 'insert'),
  },
  {
    id: 'goto-design',
    label: 'Go to Design Tab',
    description: 'Switch to Design tab',
    category: 'Navigation',
    icon: Palette,
    action: () => onCommand('switchTab', 'design'),
  },
  {
    id: 'goto-ai',
    label: 'Go to AI Studio Tab',
    description: 'Switch to AI Studio tab',
    category: 'Navigation',
    icon: Sparkles,
    action: () => onCommand('switchTab', 'ai-studio'),
  },
];

export function CommandPalette({
  isOpen,
  onClose,
  onCommand,
}: CommandPaletteProps): React.JSX.Element | null {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo(() => createCommands(onCommand), [onCommand]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const searchLower = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(searchLower) ||
        cmd.description?.toLowerCase().includes(searchLower) ||
        cmd.category.toLowerCase().includes(searchLower),
    );
  }, [commands, search]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-default"
        onClick={onClose}
        aria-label="Close command palette"
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-xl bg-studio-bg border border-studio-surface rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-studio-surface">
          <Search className="w-5 h-5 text-studio-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-brand-primary placeholder:text-studio-text-muted outline-hidden text-sm"
          />
          <div className="flex items-center gap-1 px-2 py-1 bg-studio-surface/50 rounded text-[10px] text-studio-text-muted">
            <Command className="w-3 h-3" />
            <span>/</span>
          </div>
        </div>

        {/* Commands List */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="px-4 py-8 text-center text-studio-text-muted">No commands found</div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs text-studio-text-muted uppercase tracking-wider font-medium">
                  {category}
                </div>
                {items.map((cmd) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  const Icon = cmd.icon;

                  return (
                    <button
                      type="button"
                      key={cmd.id}
                      data-index={globalIndex}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                        globalIndex === selectedIndex
                          ? 'bg-studio-accent/20 text-brand-primary'
                          : 'text-studio-text hover:bg-studio-surface/50',
                      )}
                    >
                      {Icon && <Icon className="w-4 h-4 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-studio-text-muted truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <div className="text-xs text-studio-text-muted bg-studio-surface/50 px-2 py-0.5 rounded">
                          {cmd.shortcut}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-studio-surface text-xs text-studio-text-muted">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-studio-surface/50 rounded">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-studio-surface/50 rounded">↵</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-studio-surface/50 rounded">Esc</kbd> Close
            </span>
          </div>
          <span>{filteredCommands.length} commands</span>
        </div>
      </div>
    </div>
  );
}
