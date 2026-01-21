'use client';

import { Command, type LucideIcon, Search, X } from 'lucide-react';
import {
  type ChangeEvent,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// Command/action item type
export interface RibbonCommand {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  shortcut?: string;
  category?: string;
  action: () => void;
  keywords?: string[];
}

interface RibbonSearchContextType {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  commands: RibbonCommand[];
  registerCommand: (command: RibbonCommand) => void;
  unregisterCommand: (id: string) => void;
}

const RibbonSearchContext = createContext<RibbonSearchContextType | null>(null);

export function useRibbonSearch() {
  const context = useContext(RibbonSearchContext);
  if (!context) {
    throw new Error('useRibbonSearch must be used within RibbonSearchProvider');
  }
  return context;
}

interface RibbonSearchProviderProps {
  children: ReactNode;
  initialCommands?: RibbonCommand[];
}

export function RibbonSearchProvider({
  children,
  initialCommands = [],
}: RibbonSearchProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<RibbonCommand[]>(initialCommands);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);
  const toggleSearch = useCallback(() => setIsOpen((prev) => !prev), []);

  const registerCommand = useCallback((command: RibbonCommand) => {
    setCommands((prev) => {
      const exists = prev.find((c) => c.id === command.id);
      if (exists) {
        return prev.map((c) => (c.id === command.id ? command : c));
      }
      return [...prev, command];
    });
  }, []);

  const unregisterCommand = useCallback((id: string) => {
    setCommands((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Global keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleSearch, closeSearch]);

  return (
    <RibbonSearchContext.Provider
      value={{
        isOpen,
        openSearch,
        closeSearch,
        toggleSearch,
        commands,
        registerCommand,
        unregisterCommand,
      }}
    >
      {children}
    </RibbonSearchContext.Provider>
  );
}

// Search input component for ribbon header
interface RibbonSearchInputProps {
  placeholder?: string;
  className?: string;
}

export function RibbonSearchInput({
  placeholder = 'Search commands...',
  className = '',
}: RibbonSearchInputProps) {
  const { openSearch } = useRibbonSearch();

  return (
    <button
      type="button"
      onClick={openSearch}
      className={`
        flex items-center gap-2 px-3 py-1.5
        bg-(--ribbon-bg) border border-(--ribbon-border) rounded-md
        text-sm text-(--ribbon-text)/60
        hover:border-(--ribbon-accent) hover:bg-(--ribbon-hover)
        transition-colors cursor-text
        ${className}
      `}
    >
      <Search className="h-4 w-4" />
      <span>{placeholder}</span>
      <kbd className="ml-2 px-1.5 py-0.5 bg-(--ribbon-hover) rounded text-xs">⌘K</kbd>
    </button>
  );
}

// Command palette modal
interface RibbonCommandPaletteProps {
  maxResults?: number;
}

export function RibbonCommandPalette({ maxResults = 10 }: RibbonCommandPaletteProps) {
  const { isOpen, closeSearch, commands } = useRibbonSearch();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands.slice(0, maxResults);

    const lowerQuery = query.toLowerCase();
    return commands
      .filter((cmd) => {
        const matchLabel = cmd.label.toLowerCase().includes(lowerQuery);
        const matchDescription = cmd.description?.toLowerCase().includes(lowerQuery);
        const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(lowerQuery));
        const matchCategory = cmd.category?.toLowerCase().includes(lowerQuery);
        return matchLabel || matchDescription || matchKeywords || matchCategory;
      })
      .slice(0, maxResults);
  }, [commands, query, maxResults]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, RibbonCommand[]> = {};
    for (const cmd of filteredCommands) {
      const category = cmd.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(cmd);
    }
    return groups;
  }, [filteredCommands]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          closeSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeSearch();
        break;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop - using button for accessibility */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
        onClick={closeSearch}
        aria-label="Close search"
      />

      {/* Palette */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-xl bg-(--ribbon-bg) border border-(--ribbon-border) rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-(--ribbon-border)">
          <Search className="h-5 w-5 text-(--ribbon-text)/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-hidden text-(--ribbon-text) placeholder:text-(--ribbon-text)/50"
          />
          <button
            type="button"
            onClick={closeSearch}
            className="p-1 hover:bg-(--ribbon-hover) rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-(--ribbon-text)/50">No commands found</div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-1 text-xs font-medium text-(--ribbon-text)/50 uppercase">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={() => {
                        cmd.action();
                        closeSearch();
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-md text-left
                        ${isSelected ? 'bg-(--ribbon-accent) text-white' : 'hover:bg-(--ribbon-hover)'}
                        transition-colors
                      `}
                    >
                      {cmd.icon && <cmd.icon className="h-4 w-4 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div
                            className={`text-sm truncate ${isSelected ? 'text-white/70' : 'text-(--ribbon-text)/50'}`}
                          >
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd
                          className={`px-1.5 py-0.5 rounded text-xs ${isSelected ? 'bg-white/20' : 'bg-(--ribbon-hover)'}`}
                        >
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-(--ribbon-border) text-xs text-(--ribbon-text)/50">
          <span className="flex items-center gap-1">
            <kbd className="px-1 bg-(--ribbon-hover) rounded">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 bg-(--ribbon-hover) rounded">↵</kbd> select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 bg-(--ribbon-hover) rounded">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}

// Search trigger button for the ribbon
interface RibbonSearchTriggerProps {
  className?: string;
}

export function RibbonSearchTrigger({ className = '' }: RibbonSearchTriggerProps) {
  const { openSearch } = useRibbonSearch();

  return (
    <button
      type="button"
      onClick={openSearch}
      className={`
        p-1.5 rounded hover:bg-(--ribbon-hover) transition-colors
        ${className}
      `}
      aria-label="Search commands"
    >
      <Command className="h-4 w-4" />
    </button>
  );
}
