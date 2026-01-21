'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

// Keytip configuration
export interface KeytipConfig {
  id: string;
  keys: string; // e.g., "H" for Home, "N" for Insert
  label: string;
  action: () => void;
  parentId?: string; // For nested keytips
  element?: HTMLElement | null;
}

interface KeytipContextType {
  isActive: boolean;
  currentLevel: string | null;
  keytips: Map<string, KeytipConfig>;
  registerKeytip: (config: KeytipConfig) => void;
  unregisterKeytip: (id: string) => void;
  activateKeytips: () => void;
  deactivateKeytips: () => void;
  handleKeyPress: (key: string) => void;
}

const KeytipContext = createContext<KeytipContextType | null>(null);

export function useKeytips() {
  const context = useContext(KeytipContext);
  if (!context) {
    throw new Error('useKeytips must be used within KeytipProvider');
  }
  return context;
}

interface KeytipProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export function KeytipProvider({ children, enabled = true }: KeytipProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const [keytips] = useState<Map<string, KeytipConfig>>(new Map());
  const [inputBuffer, setInputBuffer] = useState('');

  const registerKeytip = useCallback(
    (config: KeytipConfig) => {
      keytips.set(config.id, config);
    },
    [keytips],
  );

  const unregisterKeytip = useCallback(
    (id: string) => {
      keytips.delete(id);
    },
    [keytips],
  );

  const activateKeytips = useCallback(() => {
    setIsActive(true);
    setCurrentLevel(null);
    setInputBuffer('');
  }, []);

  const deactivateKeytips = useCallback(() => {
    setIsActive(false);
    setCurrentLevel(null);
    setInputBuffer('');
  }, []);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!isActive) return;

      const newBuffer = inputBuffer + key.toUpperCase();
      setInputBuffer(newBuffer);

      // Find matching keytips at current level
      const matchingKeytips = Array.from(keytips.values()).filter((kt) => {
        if (currentLevel && kt.parentId !== currentLevel) return false;
        if (!currentLevel && kt.parentId) return false;
        return kt.keys.toUpperCase().startsWith(newBuffer);
      });

      // Exact match
      const exactMatch = matchingKeytips.find((kt) => kt.keys.toUpperCase() === newBuffer);

      if (exactMatch) {
        // Check if this keytip has children
        const hasChildren = Array.from(keytips.values()).some(
          (kt) => kt.parentId === exactMatch.id,
        );

        if (hasChildren) {
          // Navigate to next level
          setCurrentLevel(exactMatch.id);
          setInputBuffer('');
        } else {
          // Execute action
          exactMatch.action();
          deactivateKeytips();
        }
      } else if (matchingKeytips.length === 0) {
        // No matches, reset buffer
        setInputBuffer('');
      }
    },
    [isActive, inputBuffer, currentLevel, keytips, deactivateKeytips],
  );

  // Global keyboard handler
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt key activates keytips
      if (e.key === 'Alt' && !e.repeat) {
        e.preventDefault();
        if (isActive) {
          deactivateKeytips();
        } else {
          activateKeytips();
        }
        return;
      }

      // Escape deactivates
      if (e.key === 'Escape' && isActive) {
        e.preventDefault();
        if (currentLevel) {
          // Go back one level
          const parentKeytip = keytips.get(currentLevel);
          setCurrentLevel(parentKeytip?.parentId || null);
          setInputBuffer('');
        } else {
          deactivateKeytips();
        }
        return;
      }

      // Handle letter/number input when active
      if (isActive && /^[a-zA-Z0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    isActive,
    currentLevel,
    activateKeytips,
    deactivateKeytips,
    handleKeyPress,
    keytips,
  ]);

  return (
    <KeytipContext.Provider
      value={{
        isActive,
        currentLevel,
        keytips,
        registerKeytip,
        unregisterKeytip,
        activateKeytips,
        deactivateKeytips,
        handleKeyPress,
      }}
    >
      {children}
      {isActive && <KeytipOverlay currentLevel={currentLevel} />}
    </KeytipContext.Provider>
  );
}

// Overlay that shows keytip badges
interface KeytipOverlayProps {
  currentLevel: string | null;
}

function KeytipOverlay({ currentLevel }: KeytipOverlayProps) {
  const { keytips, isActive } = useKeytips();
  const [badges, setBadges] = useState<Array<{ id: string; keys: string; x: number; y: number }>>(
    [],
  );

  useEffect(() => {
    if (!isActive) {
      setBadges([]);
      return;
    }

    const newBadges: Array<{ id: string; keys: string; x: number; y: number }> = [];

    keytips.forEach((config) => {
      // Only show keytips at current level
      if (currentLevel && config.parentId !== currentLevel) return;
      if (!currentLevel && config.parentId) return;

      if (config.element) {
        const rect = config.element.getBoundingClientRect();
        newBadges.push({
          id: config.id,
          keys: config.keys,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    });

    setBadges(newBadges);
  }, [isActive, currentLevel, keytips]);

  if (!isActive || badges.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded shadow-lg border border-white/20"
          style={{ left: badge.x, top: badge.y }}
        >
          {badge.keys}
        </div>
      ))}
    </div>
  );
}

// Hook to register a keytip on an element
export function useKeytip(config: Omit<KeytipConfig, 'element'>) {
  const { registerKeytip, unregisterKeytip } = useKeytips();
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (element) {
      registerKeytip({ ...config, element });
    }
    return () => {
      unregisterKeytip(config.id);
    };
  }, [config, element, registerKeytip, unregisterKeytip]);

  return setElement;
}

// Wrapper component that adds keytip to a button
interface WithKeytipProps {
  keytip: string;
  keytipId: string;
  parentKeytip?: string;
  onAction?: () => void;
  children: ReactNode;
}

export function WithKeytip({
  keytip,
  keytipId,
  parentKeytip,
  onAction,
  children,
}: WithKeytipProps) {
  const setRef = useKeytip({
    id: keytipId,
    keys: keytip,
    label: keytipId,
    action: onAction || (() => {}),
    parentId: parentKeytip,
  });

  return (
    <div ref={setRef} className="inline-block">
      {children}
    </div>
  );
}

// Keytip badge component for manual positioning
interface KeytipBadgeProps {
  keys: string;
  visible?: boolean;
  className?: string;
}

export function KeytipBadge({ keys, visible = true, className = '' }: KeytipBadgeProps) {
  if (!visible) return null;

  return (
    <span
      className={`
        absolute -top-2 -right-2 z-50
        bg-black text-white text-xs font-bold
        px-1 py-0.5 rounded shadow-lg
        border border-white/20
        ${className}
      `}
    >
      {keys}
    </span>
  );
}
