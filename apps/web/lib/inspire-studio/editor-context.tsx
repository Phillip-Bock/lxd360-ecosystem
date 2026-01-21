'use client';

import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

// Type definitions for editor state
interface ShapeElement {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle' | 'star' | 'line' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
}

interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  foreColor?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

interface HistoryState {
  elements: ShapeElement[];
  selectedId: string | null;
  timestamp: number;
}

interface EditorState {
  elements: ShapeElement[];
  selectedId: string | null;
  currentFormat: TextFormat;
  canUndo: boolean;
  canRedo: boolean;
  clipboard: ShapeElement | null;
  selectedColor: string | null;
  // Additional properties for ribbon components
  history: string[];
  currentIndex: number;
  activeStyles: Set<string>;
  selectedShape: ShapeElement | null;
}

interface EditorContextType {
  // Element management
  elements: ShapeElement[];
  selectedElement: ShapeElement | null;
  setSelectedElement: (element: ShapeElement | null) => void;

  // Shape operations
  insertShape: (type: ShapeElement['type']) => void;
  updateShape: (id: string, updates: Partial<ShapeElement>) => void;
  deleteShape: (id: string) => void;
  getSelectedShape: () => ShapeElement | null;
  updateSelectedShape: (updates: Partial<ShapeElement>) => void;

  // Text formatting
  currentFormat: TextFormat;
  formatText: (format: keyof TextFormat, value?: boolean | number | string) => void;
  applyFormat: (format: TextFormat) => void;
  applyFormatting: (format: keyof TextFormat, value?: boolean | number | string) => void;

  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Clipboard operations
  clipboard: ShapeElement | null;
  cut: () => void;
  copy: () => void;
  paste: () => void;

  // Transitions & animations
  applyTransition: (elementId: string, transition: string) => void;
  applyAnimation: (elementId: string, animation: string) => void;
  selectedTransition: string | null;
  setSelectedTransition: (transition: string | null) => void;

  // State access (for ribbon components)
  state: EditorState;
  dispatch: (action: { type: string; payload?: unknown }) => void;
  editorRef: RefObject<HTMLDivElement | null> | null;
}

const EditorContext = createContext<EditorContextType | null>(null);

// Default format settings
const defaultFormat: TextFormat = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  fontSize: 16,
  fontFamily: 'Inter',
  color: '#000000',
  backgroundColor: 'transparent',
  alignment: 'left',
};

// Shape default properties
const shapeDefaults: Record<ShapeElement['type'], Partial<ShapeElement>> = {
  rectangle: { width: 100, height: 80, fill: '#3b82f6', stroke: '#2563eb', strokeWidth: 2 },
  circle: { width: 80, height: 80, fill: '#22c55e', stroke: '#16a34a', strokeWidth: 2 },
  triangle: { width: 100, height: 87, fill: '#f59e0b', stroke: '#d97706', strokeWidth: 2 },
  star: { width: 100, height: 95, fill: '#eab308', stroke: '#ca8a04', strokeWidth: 2 },
  line: { width: 100, height: 2, stroke: '#000000', strokeWidth: 2 },
  arrow: { width: 100, height: 2, stroke: '#000000', strokeWidth: 2 },
};

export function EditorProvider({ children }: { children: ReactNode }) {
  // Element state
  const [elements, setElements] = useState<ShapeElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Format state
  const [currentFormat, setCurrentFormat] = useState<TextFormat>(defaultFormat);

  // History state
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Clipboard state
  const [clipboard, setClipboard] = useState<ShapeElement | null>(null);

  // Get selected element
  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      elements: [...elements],
      selectedId,
      timestamp: Date.now(),
    };

    // Remove unknown future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [elements, selectedId, history, historyIndex]);

  // Set selected element
  const setSelectedElement = useCallback((element: ShapeElement | null) => {
    setSelectedId(element?.id || null);
  }, []);

  // Insert a new shape
  const insertShape = useCallback(
    (type: ShapeElement['type']) => {
      const defaults = shapeDefaults[type];
      const newShape: ShapeElement = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        width: defaults.width || 100,
        height: defaults.height || 100,
        fill: defaults.fill,
        stroke: defaults.stroke,
        strokeWidth: defaults.strokeWidth,
        rotation: 0,
      };

      setElements((prev) => {
        const updated = [...prev, newShape];
        return updated;
      });
      setSelectedId(newShape.id);

      // Save to history after state updates
      setTimeout(saveToHistory, 0);
    },
    [saveToHistory],
  );

  // Update an existing shape
  const updateShape = useCallback(
    (id: string, updates: Partial<ShapeElement>) => {
      setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
      setTimeout(saveToHistory, 0);
    },
    [saveToHistory],
  );

  // Delete a shape
  const deleteShape = useCallback(
    (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
      setTimeout(saveToHistory, 0);
    },
    [selectedId, saveToHistory],
  );

  // Format text
  const formatText = useCallback((format: keyof TextFormat, value?: boolean | number | string) => {
    setCurrentFormat((prev) => ({
      ...prev,
      [format]: value !== undefined ? value : !prev[format],
    }));
  }, []);

  // Apply multiple format changes at once
  const applyFormat = useCallback((format: TextFormat) => {
    setCurrentFormat((prev) => ({ ...prev, ...format }));
  }, []);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements);
      setSelectedId(prevState.selectedId);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      setSelectedId(nextState.selectedId);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Cut operation
  const cut = useCallback(() => {
    if (selectedElement) {
      setClipboard({ ...selectedElement });
      deleteShape(selectedElement.id);
    }
  }, [selectedElement, deleteShape]);

  // Copy operation
  const copy = useCallback(() => {
    if (selectedElement) {
      setClipboard({ ...selectedElement });
    }
  }, [selectedElement]);

  // Paste operation
  const paste = useCallback(() => {
    if (clipboard) {
      const pastedElement: ShapeElement = {
        ...clipboard,
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: clipboard.x + 20,
        y: clipboard.y + 20,
      };
      setElements((prev) => [...prev, pastedElement]);
      setSelectedId(pastedElement.id);
      setTimeout(saveToHistory, 0);
    }
  }, [clipboard, saveToHistory]);

  // Transition state
  const [selectedTransition, setSelectedTransition] = useState<string | null>(null);

  // Editor ref
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Apply transition to element
  const applyTransition = useCallback((elementId: string, transition: string) => {
    void elementId;
    void transition;
    // Store transition in element metadata (would need to extend ShapeElement type)
  }, []);

  // Apply animation to element
  const applyAnimation = useCallback((elementId: string, animation: string) => {
    void elementId;
    void animation;
    // Store animation in element metadata (would need to extend ShapeElement type)
  }, []);

  // Get currently selected shape
  const getSelectedShape = useCallback((): ShapeElement | null => {
    return selectedElement;
  }, [selectedElement]);

  // Update the currently selected shape
  const updateSelectedShape = useCallback(
    (updates: Partial<ShapeElement>) => {
      if (selectedId) {
        updateShape(selectedId, updates);
      }
    },
    [selectedId, updateShape],
  );

  // Alias for formatText (used by some ribbon components)
  const applyFormatting = formatText;

  // Compute canUndo/canRedo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Compute active styles from currentFormat
  const activeStyles = new Set<string>();
  if (currentFormat.bold) activeStyles.add('bold');
  if (currentFormat.italic) activeStyles.add('italic');
  if (currentFormat.underline) activeStyles.add('underline');
  if (currentFormat.strikethrough) activeStyles.add('strikethrough');

  // State object for ribbon components
  const state: EditorState = {
    elements,
    selectedId,
    currentFormat,
    canUndo,
    canRedo,
    clipboard,
    selectedColor: currentFormat.color || null,
    // Additional properties for ribbon components
    history: history.map((h) => JSON.stringify(h.elements)),
    currentIndex: historyIndex,
    activeStyles,
    selectedShape: selectedElement,
  };

  // Dispatch function (legacy compatibility - actions are handled by hooks)
  const dispatch = useCallback((action: { type: string; payload?: unknown }) => {
    void action;
    // No-op: actions are now handled through direct hook calls
  }, []);

  const value: EditorContextType = {
    elements,
    selectedElement,
    setSelectedElement,
    insertShape,
    updateShape,
    deleteShape,
    getSelectedShape,
    updateSelectedShape,
    currentFormat,
    formatText,
    applyFormat,
    applyFormatting,
    undo,
    redo,
    canUndo,
    canRedo,
    clipboard,
    cut,
    copy,
    paste,
    applyTransition,
    applyAnimation,
    selectedTransition,
    setSelectedTransition,
    state,
    dispatch,
    editorRef,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextType {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
