/**
 * INSPIRE Studio - Layer System Types
 * Layer management for canvas objects with grouping and visibility controls
 */

// =============================================================================
// LAYER CORE TYPES
// =============================================================================

export interface Layer {
  id: string;
  objectId: string;
  name: string;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  parentId?: string; // For layer groups
  opacity?: number; // Layer-level opacity
  blendMode?: BlendMode;
}

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

// =============================================================================
// LAYER GROUPS
// =============================================================================

export interface LayerGroup {
  id: string;
  name: string;
  collapsed: boolean;
  layers: string[]; // Layer IDs in order
  locked: boolean;
  visible: boolean;
  color?: string; // Color coding for groups
  sortOrder: number;
}

// =============================================================================
// LAYER STATE
// =============================================================================

export interface LayerState {
  layers: Layer[];
  groups: LayerGroup[];
  selectedLayers: string[];
  hoveredLayer: string | null;
  draggedLayer: string | null;
  dropTarget: DropTarget | null;
}

export interface DropTarget {
  layerId: string;
  position: 'above' | 'below' | 'inside'; // inside = into a group
}

export const INITIAL_LAYER_STATE: LayerState = {
  layers: [],
  groups: [],
  selectedLayers: [],
  hoveredLayer: null,
  draggedLayer: null,
  dropTarget: null,
};

// =============================================================================
// LAYER ACTIONS
// =============================================================================

export type LayerAction =
  | { type: 'ADD_LAYER'; layer: Layer }
  | { type: 'REMOVE_LAYER'; layerId: string }
  | { type: 'UPDATE_LAYER'; layerId: string; updates: Partial<Layer> }
  | { type: 'MOVE_UP'; layerId: string }
  | { type: 'MOVE_DOWN'; layerId: string }
  | { type: 'MOVE_TO_TOP'; layerId: string }
  | { type: 'MOVE_TO_BOTTOM'; layerId: string }
  | { type: 'MOVE_TO_INDEX'; layerId: string; index: number }
  | { type: 'GROUP'; layerIds: string[]; groupName?: string }
  | { type: 'UNGROUP'; groupId: string }
  | { type: 'ADD_TO_GROUP'; layerId: string; groupId: string }
  | { type: 'REMOVE_FROM_GROUP'; layerId: string }
  | { type: 'TOGGLE_VISIBILITY'; layerId: string }
  | { type: 'TOGGLE_LOCK'; layerId: string }
  | { type: 'TOGGLE_GROUP_COLLAPSE'; groupId: string }
  | { type: 'RENAME'; layerId: string; name: string }
  | { type: 'RENAME_GROUP'; groupId: string; name: string }
  | { type: 'DELETE'; layerId: string }
  | { type: 'DELETE_GROUP'; groupId: string; deleteChildren?: boolean }
  | { type: 'DUPLICATE'; layerId: string }
  | { type: 'SELECT'; layerId: string; multi?: boolean }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'SET_HOVER'; layerId: string | null }
  | { type: 'SET_DRAG'; layerId: string | null }
  | { type: 'SET_DROP_TARGET'; target: DropTarget | null }
  | { type: 'SHOW_ALL' }
  | { type: 'HIDE_ALL' }
  | { type: 'LOCK_ALL' }
  | { type: 'UNLOCK_ALL' }
  | { type: 'SET_BLEND_MODE'; layerId: string; blendMode: BlendMode }
  | { type: 'SET_OPACITY'; layerId: string; opacity: number }
  | { type: 'REORDER'; fromIndex: number; toIndex: number };

// =============================================================================
// LAYER REDUCER
// =============================================================================

export function layerReducer(state: LayerState, action: LayerAction): LayerState {
  switch (action.type) {
    case 'ADD_LAYER': {
      const maxZIndex = Math.max(0, ...state.layers.map((l) => l.zIndex));
      const newLayer = { ...action.layer, zIndex: maxZIndex + 1 };
      return {
        ...state,
        layers: [...state.layers, newLayer],
      };
    }

    case 'REMOVE_LAYER': {
      return {
        ...state,
        layers: state.layers.filter((l) => l.id !== action.layerId),
        selectedLayers: state.selectedLayers.filter((id) => id !== action.layerId),
      };
    }

    case 'UPDATE_LAYER': {
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, ...action.updates } : l,
        ),
      };
    }

    case 'MOVE_UP': {
      const layers = [...state.layers].sort((a, b) => a.zIndex - b.zIndex);
      const index = layers.findIndex((l) => l.id === action.layerId);
      if (index < layers.length - 1) {
        const currentZ = layers[index].zIndex;
        const nextZ = layers[index + 1].zIndex;
        layers[index].zIndex = nextZ;
        layers[index + 1].zIndex = currentZ;
      }
      return { ...state, layers };
    }

    case 'MOVE_DOWN': {
      const layers = [...state.layers].sort((a, b) => a.zIndex - b.zIndex);
      const index = layers.findIndex((l) => l.id === action.layerId);
      if (index > 0) {
        const currentZ = layers[index].zIndex;
        const prevZ = layers[index - 1].zIndex;
        layers[index].zIndex = prevZ;
        layers[index - 1].zIndex = currentZ;
      }
      return { ...state, layers };
    }

    case 'MOVE_TO_TOP': {
      const maxZIndex = Math.max(...state.layers.map((l) => l.zIndex));
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, zIndex: maxZIndex + 1 } : l,
        ),
      };
    }

    case 'MOVE_TO_BOTTOM': {
      const minZIndex = Math.min(...state.layers.map((l) => l.zIndex));
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, zIndex: minZIndex - 1 } : l,
        ),
      };
    }

    case 'MOVE_TO_INDEX': {
      const sortedLayers = [...state.layers].sort((a, b) => a.zIndex - b.zIndex);
      const currentIndex = sortedLayers.findIndex((l) => l.id === action.layerId);
      if (currentIndex === -1) return state;

      const [movedLayer] = sortedLayers.splice(currentIndex, 1);
      sortedLayers.splice(action.index, 0, movedLayer);

      // Reassign z-indices
      const layers = sortedLayers.map((l, idx) => ({ ...l, zIndex: idx }));
      return { ...state, layers };
    }

    case 'GROUP': {
      const groupId = `group_${Date.now()}`;
      const newGroup: LayerGroup = {
        id: groupId,
        name: action.groupName || 'New Group',
        collapsed: false,
        layers: action.layerIds,
        locked: false,
        visible: true,
        sortOrder: state.groups.length,
      };

      const layers = state.layers.map((l) =>
        action.layerIds.includes(l.id) ? { ...l, parentId: groupId } : l,
      );

      return {
        ...state,
        layers,
        groups: [...state.groups, newGroup],
      };
    }

    case 'UNGROUP': {
      const group = state.groups.find((g) => g.id === action.groupId);
      if (!group) return state;

      const layers = state.layers.map((l) =>
        group.layers.includes(l.id) ? { ...l, parentId: undefined } : l,
      );

      return {
        ...state,
        layers,
        groups: state.groups.filter((g) => g.id !== action.groupId),
      };
    }

    case 'ADD_TO_GROUP': {
      const group = state.groups.find((g) => g.id === action.groupId);
      if (!group) return state;

      const layers = state.layers.map((l) =>
        l.id === action.layerId ? { ...l, parentId: action.groupId } : l,
      );

      const groups = state.groups.map((g) =>
        g.id === action.groupId ? { ...g, layers: [...g.layers, action.layerId] } : g,
      );

      return { ...state, layers, groups };
    }

    case 'REMOVE_FROM_GROUP': {
      const layer = state.layers.find((l) => l.id === action.layerId);
      if (!layer?.parentId) return state;

      const layers = state.layers.map((l) =>
        l.id === action.layerId ? { ...l, parentId: undefined } : l,
      );

      const groups = state.groups.map((g) =>
        g.id === layer.parentId
          ? { ...g, layers: g.layers.filter((id) => id !== action.layerId) }
          : g,
      );

      return { ...state, layers, groups };
    }

    case 'TOGGLE_VISIBILITY': {
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, visible: !l.visible } : l,
        ),
      };
    }

    case 'TOGGLE_LOCK': {
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, locked: !l.locked } : l,
        ),
      };
    }

    case 'TOGGLE_GROUP_COLLAPSE': {
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.groupId ? { ...g, collapsed: !g.collapsed } : g,
        ),
      };
    }

    case 'RENAME': {
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, name: action.name } : l,
        ),
      };
    }

    case 'RENAME_GROUP': {
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.groupId ? { ...g, name: action.name } : g,
        ),
      };
    }

    case 'DELETE': {
      return {
        ...state,
        layers: state.layers.filter((l) => l.id !== action.layerId),
        selectedLayers: state.selectedLayers.filter((id) => id !== action.layerId),
      };
    }

    case 'DELETE_GROUP': {
      const group = state.groups.find((g) => g.id === action.groupId);
      if (!group) return state;

      let layers = state.layers;
      if (action.deleteChildren) {
        layers = layers.filter((l) => !group.layers.includes(l.id));
      } else {
        layers = layers.map((l) =>
          group.layers.includes(l.id) ? { ...l, parentId: undefined } : l,
        );
      }

      return {
        ...state,
        layers,
        groups: state.groups.filter((g) => g.id !== action.groupId),
        selectedLayers: action.deleteChildren
          ? state.selectedLayers.filter((id) => !group.layers.includes(id))
          : state.selectedLayers,
      };
    }

    case 'DUPLICATE': {
      const layer = state.layers.find((l) => l.id === action.layerId);
      if (!layer) return state;

      const maxZIndex = Math.max(...state.layers.map((l) => l.zIndex));
      const newLayer: Layer = {
        ...layer,
        id: `${layer.id}_copy_${Date.now()}`,
        name: `${layer.name} (Copy)`,
        zIndex: maxZIndex + 1,
      };

      return {
        ...state,
        layers: [...state.layers, newLayer],
      };
    }

    case 'SELECT': {
      if (action.multi) {
        const isSelected = state.selectedLayers.includes(action.layerId);
        return {
          ...state,
          selectedLayers: isSelected
            ? state.selectedLayers.filter((id) => id !== action.layerId)
            : [...state.selectedLayers, action.layerId],
        };
      }
      return {
        ...state,
        selectedLayers: [action.layerId],
      };
    }

    case 'SELECT_ALL': {
      return {
        ...state,
        selectedLayers: state.layers.map((l) => l.id),
      };
    }

    case 'DESELECT_ALL': {
      return {
        ...state,
        selectedLayers: [],
      };
    }

    case 'SET_HOVER': {
      return {
        ...state,
        hoveredLayer: action.layerId,
      };
    }

    case 'SET_DRAG': {
      return {
        ...state,
        draggedLayer: action.layerId,
      };
    }

    case 'SET_DROP_TARGET': {
      return {
        ...state,
        dropTarget: action.target,
      };
    }

    case 'SHOW_ALL': {
      return {
        ...state,
        layers: state.layers.map((l) => ({ ...l, visible: true })),
        groups: state.groups.map((g) => ({ ...g, visible: true })),
      };
    }

    case 'HIDE_ALL': {
      return {
        ...state,
        layers: state.layers.map((l) => ({ ...l, visible: false })),
        groups: state.groups.map((g) => ({ ...g, visible: false })),
      };
    }

    case 'LOCK_ALL': {
      return {
        ...state,
        layers: state.layers.map((l) => ({ ...l, locked: true })),
        groups: state.groups.map((g) => ({ ...g, locked: true })),
      };
    }

    case 'UNLOCK_ALL': {
      return {
        ...state,
        layers: state.layers.map((l) => ({ ...l, locked: false })),
        groups: state.groups.map((g) => ({ ...g, locked: false })),
      };
    }

    case 'SET_BLEND_MODE': {
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, blendMode: action.blendMode } : l,
        ),
      };
    }

    case 'SET_OPACITY': {
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, opacity: action.opacity } : l,
        ),
      };
    }

    case 'REORDER': {
      const sortedLayers = [...state.layers].sort((a, b) => a.zIndex - b.zIndex);
      const [movedLayer] = sortedLayers.splice(action.fromIndex, 1);
      sortedLayers.splice(action.toIndex, 0, movedLayer);

      const layers = sortedLayers.map((l, idx) => ({ ...l, zIndex: idx }));
      return { ...state, layers };
    }

    default:
      return state;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get layers sorted by z-index (bottom to top)
 */
export function getSortedLayers(state: LayerState): Layer[] {
  return [...state.layers].sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Get layers sorted by z-index (top to bottom) for panel display
 */
export function getLayersForPanel(state: LayerState): Layer[] {
  return [...state.layers].sort((a, b) => b.zIndex - a.zIndex);
}

/**
 * Get all layers in a group
 */
export function getLayersInGroup(state: LayerState, groupId: string): Layer[] {
  const group = state.groups.find((g) => g.id === groupId);
  if (!group) return [];

  return state.layers
    .filter((l) => group.layers.includes(l.id))
    .sort((a, b) => group.layers.indexOf(a.id) - group.layers.indexOf(b.id));
}

/**
 * Get ungrouped layers
 */
export function getUngroupedLayers(state: LayerState): Layer[] {
  return state.layers.filter((l) => !l.parentId);
}

/**
 * Check if a layer is visible (including group visibility)
 */
export function isLayerVisible(state: LayerState, layerId: string): boolean {
  const layer = state.layers.find((l) => l.id === layerId);
  if (!layer) return false;

  if (!layer.visible) return false;

  if (layer.parentId) {
    const group = state.groups.find((g) => g.id === layer.parentId);
    if (group && !group.visible) return false;
  }

  return true;
}

/**
 * Check if a layer is locked (including group lock)
 */
export function isLayerLocked(state: LayerState, layerId: string): boolean {
  const layer = state.layers.find((l) => l.id === layerId);
  if (!layer) return false;

  if (layer.locked) return true;

  if (layer.parentId) {
    const group = state.groups.find((g) => g.id === layer.parentId);
    if (group?.locked) return true;
  }

  return false;
}

/**
 * Get the effective z-index for an object
 */
export function getEffectiveZIndex(state: LayerState, objectId: string): number {
  const layer = state.layers.find((l) => l.objectId === objectId);
  return layer?.zIndex ?? 0;
}

/**
 * Create a new layer for an object
 */
export function createLayer(objectId: string, name: string, zIndex: number): Layer {
  return {
    id: `layer_${objectId}`,
    objectId,
    name,
    zIndex,
    visible: true,
    locked: false,
  };
}
