'use client';

/**
 * useLayers - Hook for managing canvas layer system
 * Provides layer ordering, grouping, visibility, and drag-drop support
 */

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { logger } from '@/lib/logger';
import type { BlendMode, DropTarget, Layer, LayerGroup } from '@/types/studio/layers';
import {
  createLayer,
  getEffectiveZIndex,
  getLayersForPanel,
  getLayersInGroup,
  getSortedLayers,
  getUngroupedLayers,
  INITIAL_LAYER_STATE,
  isLayerLocked,
  isLayerVisible,
  layerReducer,
} from '@/types/studio/layers';

const log = logger.scope('useLayers');

// =============================================================================
// TYPES
// =============================================================================

export interface UseLayersOptions {
  slideId: string;
  initialLayers?: Layer[];
  initialGroups?: LayerGroup[];
  onLayerChange?: (layers: Layer[]) => void;
  onSelectionChange?: (selectedLayers: string[]) => void;
  persistToDatabase?: boolean;
}

export interface UseLayersReturn {
  // Layer data
  layers: Layer[];
  groups: LayerGroup[];
  selectedLayers: string[];
  hoveredLayer: string | null;

  // Selection
  selectLayer: (layerId: string, multi?: boolean) => void;
  selectAll: () => void;
  deselectAll: () => void;
  isSelected: (layerId: string) => boolean;

  // Ordering
  moveUp: (layerId: string) => void;
  moveDown: (layerId: string) => void;
  moveToTop: (layerId: string) => void;
  moveToBottom: (layerId: string) => void;
  moveToIndex: (layerId: string, index: number) => void;
  reorder: (fromIndex: number, toIndex: number) => void;

  // Grouping
  groupSelected: (name?: string) => string | null;
  ungroup: (groupId: string) => void;
  addToGroup: (layerId: string, groupId: string) => void;
  removeFromGroup: (layerId: string) => void;
  toggleGroupCollapse: (groupId: string) => void;
  renameGroup: (groupId: string, name: string) => void;

  // Visibility/Locking
  toggleVisibility: (layerId: string) => void;
  toggleLock: (layerId: string) => void;
  showAll: () => void;
  hideAll: () => void;
  lockAll: () => void;
  unlockAll: () => void;
  isVisible: (layerId: string) => boolean;
  isLocked: (layerId: string) => boolean;

  // Blend modes & opacity
  setBlendMode: (layerId: string, blendMode: BlendMode) => void;
  setOpacity: (layerId: string, opacity: number) => void;

  // Operations
  addLayer: (layer: Layer) => void;
  rename: (layerId: string, name: string) => void;
  duplicate: (layerId: string) => string | null;
  deleteLayer: (layerId: string) => void;
  deleteGroup: (groupId: string, deleteChildren?: boolean) => void;

  // Drag and drop
  setHover: (layerId: string | null) => void;
  setDrag: (layerId: string | null) => void;
  setDropTarget: (target: DropTarget | null) => void;
  draggedLayer: string | null;
  dropTarget: DropTarget | null;

  // Utilities
  getLayerForObject: (objectId: string) => Layer | undefined;
  getZIndex: (objectId: string) => number;
  getLayersInGroup: (groupId: string) => Layer[];
  getUngroupedLayers: () => Layer[];
  getSortedLayers: () => Layer[];
  getLayersForPanel: () => Layer[];

  // Persistence
  save: () => Promise<void>;
  load: () => Promise<void>;
  isDirty: boolean;
  isSaving: boolean;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useLayers(options: UseLayersOptions): UseLayersReturn {
  const {
    // slideId - reserved for database persistence
    initialLayers = [],
    initialGroups = [],
    onLayerChange,
    onSelectionChange,
    persistToDatabase = false,
  } = options;

  // Main state using reducer
  const [state, dispatch] = useReducer(layerReducer, {
    ...INITIAL_LAYER_STATE,
    layers: initialLayers,
    groups: initialGroups,
  });

  // Persistence state
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for previous values
  const prevLayersRef = useRef<Layer[]>(initialLayers);
  const prevSelectionRef = useRef<string[]>([]);

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  // Notify on layer changes
  useEffect(() => {
    if (JSON.stringify(state.layers) !== JSON.stringify(prevLayersRef.current)) {
      prevLayersRef.current = state.layers;
      onLayerChange?.(state.layers);
      setIsDirty(true);
    }
  }, [state.layers, onLayerChange]);

  // Notify on selection changes
  useEffect(() => {
    if (JSON.stringify(state.selectedLayers) !== JSON.stringify(prevSelectionRef.current)) {
      prevSelectionRef.current = state.selectedLayers;
      onSelectionChange?.(state.selectedLayers);
    }
  }, [state.selectedLayers, onSelectionChange]);

  // ==========================================================================
  // SELECTION
  // ==========================================================================

  const selectLayer = useCallback((layerId: string, multi = false) => {
    dispatch({ type: 'SELECT', layerId, multi });
  }, []);

  const selectAll = useCallback(() => {
    dispatch({ type: 'SELECT_ALL' });
  }, []);

  const deselectAll = useCallback(() => {
    dispatch({ type: 'DESELECT_ALL' });
  }, []);

  const isSelected = useCallback(
    (layerId: string) => state.selectedLayers.includes(layerId),
    [state.selectedLayers],
  );

  // ==========================================================================
  // ORDERING
  // ==========================================================================

  const moveUp = useCallback((layerId: string) => {
    dispatch({ type: 'MOVE_UP', layerId });
  }, []);

  const moveDown = useCallback((layerId: string) => {
    dispatch({ type: 'MOVE_DOWN', layerId });
  }, []);

  const moveToTop = useCallback((layerId: string) => {
    dispatch({ type: 'MOVE_TO_TOP', layerId });
  }, []);

  const moveToBottom = useCallback((layerId: string) => {
    dispatch({ type: 'MOVE_TO_BOTTOM', layerId });
  }, []);

  const moveToIndex = useCallback((layerId: string, index: number) => {
    dispatch({ type: 'MOVE_TO_INDEX', layerId, index });
  }, []);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER', fromIndex, toIndex });
  }, []);

  // ==========================================================================
  // GROUPING
  // ==========================================================================

  const groupSelected = useCallback(
    (name?: string): string | null => {
      if (state.selectedLayers.length < 2) return null;

      const groupId = `group_${Date.now()}`;
      dispatch({
        type: 'GROUP',
        layerIds: state.selectedLayers,
        groupName: name || `Group ${state.groups.length + 1}`,
      });
      return groupId;
    },
    [state.selectedLayers, state.groups.length],
  );

  const ungroup = useCallback((groupId: string) => {
    dispatch({ type: 'UNGROUP', groupId });
  }, []);

  const addToGroup = useCallback((layerId: string, groupId: string) => {
    dispatch({ type: 'ADD_TO_GROUP', layerId, groupId });
  }, []);

  const removeFromGroup = useCallback((layerId: string) => {
    dispatch({ type: 'REMOVE_FROM_GROUP', layerId });
  }, []);

  const toggleGroupCollapse = useCallback((groupId: string) => {
    dispatch({ type: 'TOGGLE_GROUP_COLLAPSE', groupId });
  }, []);

  const renameGroup = useCallback((groupId: string, name: string) => {
    dispatch({ type: 'RENAME_GROUP', groupId, name });
  }, []);

  // ==========================================================================
  // VISIBILITY / LOCKING
  // ==========================================================================

  const toggleVisibility = useCallback((layerId: string) => {
    dispatch({ type: 'TOGGLE_VISIBILITY', layerId });
  }, []);

  const toggleLock = useCallback((layerId: string) => {
    dispatch({ type: 'TOGGLE_LOCK', layerId });
  }, []);

  const showAll = useCallback(() => {
    dispatch({ type: 'SHOW_ALL' });
  }, []);

  const hideAll = useCallback(() => {
    dispatch({ type: 'HIDE_ALL' });
  }, []);

  const lockAll = useCallback(() => {
    dispatch({ type: 'LOCK_ALL' });
  }, []);

  const unlockAll = useCallback(() => {
    dispatch({ type: 'UNLOCK_ALL' });
  }, []);

  const isVisible = useCallback((layerId: string) => isLayerVisible(state, layerId), [state]);

  const isLocked = useCallback((layerId: string) => isLayerLocked(state, layerId), [state]);

  // ==========================================================================
  // BLEND MODES & OPACITY
  // ==========================================================================

  const setBlendMode = useCallback((layerId: string, blendMode: BlendMode) => {
    dispatch({ type: 'SET_BLEND_MODE', layerId, blendMode });
  }, []);

  const setOpacity = useCallback((layerId: string, opacity: number) => {
    dispatch({ type: 'SET_OPACITY', layerId, opacity: Math.max(0, Math.min(1, opacity)) });
  }, []);

  // ==========================================================================
  // OPERATIONS
  // ==========================================================================

  const addLayer = useCallback((layer: Layer) => {
    dispatch({ type: 'ADD_LAYER', layer });
  }, []);

  const rename = useCallback((layerId: string, name: string) => {
    dispatch({ type: 'RENAME', layerId, name });
  }, []);

  const duplicateLayer = useCallback(
    (layerId: string): string | null => {
      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer) return null;

      const newId = `${layerId}_copy_${Date.now()}`;
      dispatch({ type: 'DUPLICATE', layerId });
      return newId;
    },
    [state.layers],
  );

  const deleteLayer = useCallback((layerId: string) => {
    dispatch({ type: 'DELETE', layerId });
  }, []);

  const deleteGroup = useCallback((groupId: string, deleteChildren = false) => {
    dispatch({ type: 'DELETE_GROUP', groupId, deleteChildren });
  }, []);

  // ==========================================================================
  // DRAG AND DROP
  // ==========================================================================

  const setHover = useCallback((layerId: string | null) => {
    dispatch({ type: 'SET_HOVER', layerId });
  }, []);

  const setDrag = useCallback((layerId: string | null) => {
    dispatch({ type: 'SET_DRAG', layerId });
  }, []);

  const setDropTarget = useCallback((target: DropTarget | null) => {
    dispatch({ type: 'SET_DROP_TARGET', target });
  }, []);

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  const getLayerForObject = useCallback(
    (objectId: string) => state.layers.find((l) => l.objectId === objectId),
    [state.layers],
  );

  const getZIndex = useCallback((objectId: string) => getEffectiveZIndex(state, objectId), [state]);

  const getLayersInGroupFn = useCallback(
    (groupId: string) => getLayersInGroup(state, groupId),
    [state],
  );

  const getUngroupedLayersFn = useCallback(() => getUngroupedLayers(state), [state]);

  const getSortedLayersFn = useCallback(() => getSortedLayers(state), [state]);

  const getLayersForPanelFn = useCallback(() => getLayersForPanel(state), [state]);

  // ==========================================================================
  // PERSISTENCE
  // ==========================================================================

  const save = useCallback(async (): Promise<void> => {
    if (!persistToDatabase) {
      setIsDirty(false);
      return;
    }

    setIsSaving(true);

    try {
      // TODO(LXD-297): Implement with Firestore
      // await setDoc(doc(db, 'lesson_objects', slideId), ...)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsDirty(false);
    } catch (error) {
      log.error('Failed to save layers', error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [persistToDatabase]);

  const load = useCallback(async (): Promise<void> => {
    if (!persistToDatabase) return;

    try {
      // TODO(LXD-297): Implement with Firestore
      // const docSnap = await getDocs(query(collection(db, 'lesson_objects'), where('slide_id', '==', slideId)))

      setIsDirty(false);
    } catch (error) {
      log.error('Failed to load layers', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }, [persistToDatabase]);

  // Load on mount
  useEffect(() => {
    if (persistToDatabase) {
      load();
    }
  }, [persistToDatabase, load]);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // Layer data
    layers: state.layers,
    groups: state.groups,
    selectedLayers: state.selectedLayers,
    hoveredLayer: state.hoveredLayer,

    // Selection
    selectLayer,
    selectAll,
    deselectAll,
    isSelected,

    // Ordering
    moveUp,
    moveDown,
    moveToTop,
    moveToBottom,
    moveToIndex,
    reorder,

    // Grouping
    groupSelected,
    ungroup,
    addToGroup,
    removeFromGroup,
    toggleGroupCollapse,
    renameGroup,

    // Visibility/Locking
    toggleVisibility,
    toggleLock,
    showAll,
    hideAll,
    lockAll,
    unlockAll,
    isVisible,
    isLocked,

    // Blend modes & opacity
    setBlendMode,
    setOpacity,

    // Operations
    addLayer,
    rename,
    duplicate: duplicateLayer,
    deleteLayer,
    deleteGroup,

    // Drag and drop
    setHover,
    setDrag,
    setDropTarget,
    draggedLayer: state.draggedLayer,
    dropTarget: state.dropTarget,

    // Utilities
    getLayerForObject,
    getZIndex,
    getLayersInGroup: getLayersInGroupFn,
    getUngroupedLayers: getUngroupedLayersFn,
    getSortedLayers: getSortedLayersFn,
    getLayersForPanel: getLayersForPanelFn,

    // Persistence
    save,
    load,
    isDirty,
    isSaving,
  };
}

export default useLayers;

// =============================================================================
// UTILITY HOOK: Create layer for new object
// =============================================================================

export function useCreateLayer(_slideId: string) {
  const createLayerForObject = useCallback(
    (objectId: string, name: string, existingLayers: Layer[]): Layer => {
      const maxZIndex = Math.max(0, ...existingLayers.map((l) => l.zIndex));
      return createLayer(objectId, name, maxZIndex + 1);
    },
    [],
  );

  return { createLayerForObject };
}
