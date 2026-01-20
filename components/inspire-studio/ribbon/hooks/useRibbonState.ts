'use client';

/**
 * =============================================================================
 * INSPIRE Studio | useRibbonState Hook
 * =============================================================================
 *
 * A custom hook for managing ribbon state including active tab,
 * selection state, undo/redo history, and formatting state.
 */

import { useCallback, useMemo, useState } from 'react';

export interface RibbonState {
  activeTab: string;
  isCollapsed: boolean;
  selection: unknown | null;
  selectedType: string | null;
  activeFormats: string[];
  canUndo: boolean;
  canRedo: boolean;
  cognitiveLoad: number;
  zoomLevel: number;
}

export interface UseRibbonStateReturn {
  state: RibbonState;
  setActiveTab: (tab: string) => void;
  toggleCollapsed: () => void;
  setSelection: (selection: unknown | null, type: string | null) => void;
  setActiveFormats: (formats: string[]) => void;
  toggleFormat: (format: string) => void;
  setCanUndo: (canUndo: boolean) => void;
  setCanRedo: (canRedo: boolean) => void;
  setCognitiveLoad: (load: number) => void;
  setZoomLevel: (level: number) => void;
  reset: () => void;
}

const initialState: RibbonState = {
  activeTab: 'home',
  isCollapsed: false,
  selection: null,
  selectedType: null,
  activeFormats: [],
  canUndo: false,
  canRedo: false,
  cognitiveLoad: 0,
  zoomLevel: 100,
};

export function useRibbonState(defaultState: Partial<RibbonState> = {}): UseRibbonStateReturn {
  const [state, setState] = useState<RibbonState>({
    ...initialState,
    ...defaultState,
  });

  const setActiveTab = useCallback((tab: string) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const toggleCollapsed = useCallback(() => {
    setState((prev) => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  }, []);

  const setSelection = useCallback((selection: unknown | null, type: string | null) => {
    setState((prev) => ({ ...prev, selection, selectedType: type }));
  }, []);

  const setActiveFormats = useCallback((formats: string[]) => {
    setState((prev) => ({ ...prev, activeFormats: formats }));
  }, []);

  const toggleFormat = useCallback((format: string) => {
    setState((prev) => ({
      ...prev,
      activeFormats: prev.activeFormats.includes(format)
        ? prev.activeFormats.filter((f) => f !== format)
        : [...prev.activeFormats, format],
    }));
  }, []);

  const setCanUndo = useCallback((canUndo: boolean) => {
    setState((prev) => ({ ...prev, canUndo }));
  }, []);

  const setCanRedo = useCallback((canRedo: boolean) => {
    setState((prev) => ({ ...prev, canRedo }));
  }, []);

  const setCognitiveLoad = useCallback((load: number) => {
    setState((prev) => ({ ...prev, cognitiveLoad: Math.min(100, Math.max(0, load)) }));
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    setState((prev) => ({ ...prev, zoomLevel: Math.min(400, Math.max(25, level)) }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...initialState, ...defaultState });
  }, [defaultState]);

  return useMemo(
    () => ({
      state,
      setActiveTab,
      toggleCollapsed,
      setSelection,
      setActiveFormats,
      toggleFormat,
      setCanUndo,
      setCanRedo,
      setCognitiveLoad,
      setZoomLevel,
      reset,
    }),
    [
      state,
      setActiveTab,
      toggleCollapsed,
      setSelection,
      setActiveFormats,
      toggleFormat,
      setCanUndo,
      setCanRedo,
      setCognitiveLoad,
      setZoomLevel,
      reset,
    ],
  );
}
