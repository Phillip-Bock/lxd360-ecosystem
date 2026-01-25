'use client';

import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

const log = logger.scope('useLocalStorage');

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read from localStorage after mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      log.warn(`Error reading localStorage key "${key}"`, { error });
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        log.warn(`Error setting localStorage key "${key}"`, { error });
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
}
