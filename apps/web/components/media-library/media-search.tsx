'use client';

import { Clock, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface MediaSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MAX_RECENT_SEARCHES = 5;

export function MediaSearch({
  value,
  onChange,
  placeholder = 'Search files...',
}: MediaSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    'media-library-recent-searches',
    [],
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Sync input value with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced search
  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, 300);
    },
    [onChange],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleSubmit = useCallback(
    (searchValue: string) => {
      if (searchValue.trim()) {
        // Add to recent searches
        setRecentSearches((prev) => {
          const filtered = prev.filter((s) => s !== searchValue);
          return [searchValue, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        });
      }
      onChange(searchValue);
      setShowSuggestions(false);
    },
    [onChange, setRecentSearches],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit(inputValue);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    },
    [inputValue, handleSubmit],
  );

  const handleRecentSearch = useCallback(
    (search: string) => {
      setInputValue(search);
      onChange(search);
      setShowSuggestions(false);
    },
    [onChange],
  );

  const handleClearRecent = useCallback(
    (search: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setRecentSearches((prev) => prev.filter((s) => s !== search));
    },
    [setRecentSearches],
  );

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setShowSuggestions(true);
          }}
          onBlur={() => {
            // Delay hiding to allow clicking suggestions
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && recentSearches.length > 0 && !inputValue && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1">Recent Searches</p>
            {recentSearches.map((search, index) => (
              <button
                type="button"
                key={index}
                onClick={() => handleRecentSearch(search)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-muted rounded-md transition-colors group"
              >
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-left truncate">{search}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleClearRecent(search, e)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
