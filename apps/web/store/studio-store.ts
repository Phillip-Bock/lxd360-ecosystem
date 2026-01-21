/**
 * =============================================================================
 * INSPIRE Studio - Zustand Store
 * =============================================================================
 *
 * Central state management for the Studio editor. Manages blocks, selection,
 * and course metadata with full TypeScript support.
 *
 * @module store/studio-store
 * @version 1.0.0
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { blockRegistry, cloneBlock, generateBlockId } from '@/lib/block-registry';
import type {
  BlockConfigMap,
  BlockContentMap,
  BlockInstance,
  StarterBlockType,
} from '@/types/blocks';

// =============================================================================
// COURSE STATE TYPE (local to store, matching types/studio.ts pattern)
// =============================================================================

/**
 * Course status values
 */
type CourseStatus = 'draft' | 'review' | 'published' | 'archived';

/**
 * Complete course state for the store
 */
interface CourseState {
  /** Unique course ID */
  id: string;
  /** Course title */
  title: string;
  /** All blocks in the course */
  blocks: BlockInstance[];
  /** Currently selected block ID */
  selectedBlockId: string | null;
  /** Course status */
  status: CourseStatus;
  /** Last saved timestamp */
  lastSaved?: Date;
}

// =============================================================================
// TYPES
// =============================================================================

/**
 * Store actions interface.
 */
interface StudioActions {
  // Block CRUD
  addBlock: <T extends StarterBlockType>(
    type: T,
    options?: {
      content?: Partial<BlockContentMap[T]>;
      config?: Partial<BlockConfigMap[T]>;
      insertAt?: number;
    },
  ) => string;
  addBlockFromInstance: (block: Omit<BlockInstance, 'id' | 'order'>) => string;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updates: Partial<BlockInstance>) => void;
  updateBlockContent: <T extends StarterBlockType>(
    id: string,
    content: Partial<BlockContentMap[T]>,
  ) => void;
  updateBlockConfig: <T extends StarterBlockType>(
    id: string,
    config: Partial<BlockConfigMap[T]>,
  ) => void;

  // Block operations
  duplicateBlock: (id: string) => string | null;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;

  // Selection
  selectBlock: (id: string | null) => void;
  selectNextBlock: () => void;
  selectPreviousBlock: () => void;

  // Queries
  getBlockById: (id: string) => BlockInstance | undefined;
  getBlockIndex: (id: string) => number;
  getSelectedBlock: () => BlockInstance | undefined;
  getBlocksByType: (type: StarterBlockType) => BlockInstance[];
  getAssessmentBlocks: () => BlockInstance[];

  // Course metadata
  setTitle: (title: string) => void;
  setStatus: (status: CourseState['status']) => void;

  // Utilities
  reset: () => void;
  clearBlocks: () => void;
  getTotalCognitiveLoad: () => number;
  getTotalDuration: () => number;
}

/**
 * Complete store type.
 */
interface StudioStore extends CourseState, StudioActions {}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: CourseState = {
  id: `course-${Date.now()}`,
  title: 'Untitled Course',
  blocks: [],
  selectedBlockId: null,
  status: 'draft',
  lastSaved: undefined,
};

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useStudioStore = create<StudioStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // =====================================================================
        // BLOCK CRUD
        // =====================================================================

        /**
         * Add a new block of the specified type with optional overrides.
         * Returns the new block's ID.
         */
        addBlock: <T extends StarterBlockType>(
          type: T,
          options?: {
            content?: Partial<BlockContentMap[T]>;
            config?: Partial<BlockConfigMap[T]>;
            insertAt?: number;
          },
        ): string => {
          const id = generateBlockId();
          const blockData = blockRegistry.createBlock(type, {
            content: options?.content,
            config: options?.config,
          });

          set((state) => {
            const blocks = [...state.blocks];
            const newBlock: BlockInstance = {
              ...blockData,
              id,
              order: options?.insertAt ?? blocks.length,
              type,
            };

            if (options?.insertAt !== undefined && options.insertAt < blocks.length) {
              // Insert at specific position
              blocks.splice(options.insertAt, 0, newBlock);
              // Reorder all blocks
              blocks.forEach((b, i) => {
                b.order = i;
              });
            } else {
              blocks.push(newBlock);
            }

            return {
              blocks,
              selectedBlockId: id,
              lastSaved: undefined,
            };
          });

          return id;
        },

        /**
         * Add a block from an existing instance (for imports, etc.).
         */
        addBlockFromInstance: (block: Omit<BlockInstance, 'id' | 'order'>): string => {
          const id = generateBlockId();

          set((state) => ({
            blocks: [
              ...state.blocks,
              {
                ...block,
                id,
                order: state.blocks.length,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as BlockInstance,
            ],
            selectedBlockId: id,
            lastSaved: undefined,
          }));

          return id;
        },

        /**
         * Remove a block by ID.
         */
        removeBlock: (id: string) =>
          set((state) => {
            const filteredBlocks = state.blocks.filter((b) => b.id !== id);
            const reorderedBlocks = filteredBlocks.map((b, i) => ({
              ...b,
              order: i,
            }));

            // Update selection
            let newSelectedId = state.selectedBlockId;
            if (state.selectedBlockId === id) {
              const removedIndex = state.blocks.findIndex((b) => b.id === id);
              if (reorderedBlocks.length > 0) {
                const newIndex = Math.min(removedIndex, reorderedBlocks.length - 1);
                newSelectedId = reorderedBlocks[newIndex]?.id ?? null;
              } else {
                newSelectedId = null;
              }
            }

            return {
              blocks: reorderedBlocks,
              selectedBlockId: newSelectedId,
              lastSaved: undefined,
            };
          }),

        /**
         * Update a block with partial data.
         */
        updateBlock: (id: string, updates: Partial<BlockInstance>) =>
          set((state) => ({
            blocks: state.blocks.map((b) =>
              b.id === id
                ? {
                    ...b,
                    ...updates,
                    updatedAt: new Date().toISOString(),
                  }
                : b,
            ),
            lastSaved: undefined,
          })),

        /**
         * Update only the content of a block.
         */
        updateBlockContent: <T extends StarterBlockType>(
          id: string,
          content: Partial<BlockContentMap[T]>,
        ) =>
          set((state) => ({
            blocks: state.blocks.map((b) =>
              b.id === id
                ? {
                    ...b,
                    content: { ...b.content, ...content },
                    updatedAt: new Date().toISOString(),
                  }
                : b,
            ),
            lastSaved: undefined,
          })),

        /**
         * Update only the config of a block.
         */
        updateBlockConfig: <T extends StarterBlockType>(
          id: string,
          config: Partial<BlockConfigMap[T]>,
        ) =>
          set((state) => ({
            blocks: state.blocks.map((b) =>
              b.id === id
                ? {
                    ...b,
                    config: { ...b.config, ...config },
                    updatedAt: new Date().toISOString(),
                  }
                : b,
            ),
            lastSaved: undefined,
          })),

        // =====================================================================
        // BLOCK OPERATIONS
        // =====================================================================

        /**
         * Duplicate a block, inserting the copy below the original.
         * Returns the new block's ID or null if source not found.
         */
        duplicateBlock: (id: string): string | null => {
          const state = get();
          const sourceBlock = state.blocks.find((b) => b.id === id);

          if (!sourceBlock) {
            return null;
          }

          const newBlock = cloneBlock(sourceBlock);
          const sourceIndex = state.blocks.findIndex((b) => b.id === id);

          set((currentState) => {
            const blocks = [...currentState.blocks];
            blocks.splice(sourceIndex + 1, 0, newBlock);

            // Reorder all blocks
            const reorderedBlocks = blocks.map((b, i) => ({
              ...b,
              order: i,
            }));

            return {
              blocks: reorderedBlocks,
              selectedBlockId: newBlock.id,
              lastSaved: undefined,
            };
          });

          return newBlock.id;
        },

        /**
         * Move a block up one position.
         */
        moveBlockUp: (id: string) => {
          const state = get();
          const index = state.blocks.findIndex((b) => b.id === id);

          if (index > 0) {
            get().reorderBlocks(index, index - 1);
          }
        },

        /**
         * Move a block down one position.
         */
        moveBlockDown: (id: string) => {
          const state = get();
          const index = state.blocks.findIndex((b) => b.id === id);

          if (index >= 0 && index < state.blocks.length - 1) {
            get().reorderBlocks(index, index + 1);
          }
        },

        /**
         * Reorder blocks by moving from one index to another.
         */
        reorderBlocks: (fromIndex: number, toIndex: number) =>
          set((state) => {
            if (
              fromIndex < 0 ||
              fromIndex >= state.blocks.length ||
              toIndex < 0 ||
              toIndex >= state.blocks.length
            ) {
              return state;
            }

            const blocks = [...state.blocks];
            const [removed] = blocks.splice(fromIndex, 1);
            blocks.splice(toIndex, 0, removed);

            return {
              blocks: blocks.map((b, i) => ({ ...b, order: i })),
              lastSaved: undefined,
            };
          }),

        // =====================================================================
        // SELECTION
        // =====================================================================

        /**
         * Select a block by ID (or deselect with null).
         */
        selectBlock: (id: string | null) => set({ selectedBlockId: id }),

        /**
         * Select the next block in the list.
         */
        selectNextBlock: () =>
          set((state) => {
            if (state.blocks.length === 0) {
              return { selectedBlockId: null };
            }

            if (state.selectedBlockId === null) {
              return { selectedBlockId: state.blocks[0]?.id ?? null };
            }

            const currentIndex = state.blocks.findIndex((b) => b.id === state.selectedBlockId);
            const nextIndex = Math.min(currentIndex + 1, state.blocks.length - 1);

            return { selectedBlockId: state.blocks[nextIndex]?.id ?? null };
          }),

        /**
         * Select the previous block in the list.
         */
        selectPreviousBlock: () =>
          set((state) => {
            if (state.blocks.length === 0) {
              return { selectedBlockId: null };
            }

            if (state.selectedBlockId === null) {
              return { selectedBlockId: state.blocks[state.blocks.length - 1]?.id ?? null };
            }

            const currentIndex = state.blocks.findIndex((b) => b.id === state.selectedBlockId);
            const prevIndex = Math.max(currentIndex - 1, 0);

            return { selectedBlockId: state.blocks[prevIndex]?.id ?? null };
          }),

        // =====================================================================
        // QUERIES
        // =====================================================================

        /**
         * Get a block by ID.
         */
        getBlockById: (id: string): BlockInstance | undefined => {
          return get().blocks.find((b) => b.id === id);
        },

        /**
         * Get the index of a block by ID.
         */
        getBlockIndex: (id: string): number => {
          return get().blocks.findIndex((b) => b.id === id);
        },

        /**
         * Get the currently selected block.
         */
        getSelectedBlock: (): BlockInstance | undefined => {
          const state = get();
          if (!state.selectedBlockId) return undefined;
          return state.blocks.find((b) => b.id === state.selectedBlockId);
        },

        /**
         * Get all blocks of a specific type.
         */
        getBlocksByType: (type: StarterBlockType): BlockInstance[] => {
          return get().blocks.filter((b) => b.type === type);
        },

        /**
         * Get all assessment blocks (mc-question, fitb-question).
         */
        getAssessmentBlocks: (): BlockInstance[] => {
          return get().blocks.filter((b) => b.type === 'mc-question' || b.type === 'fitb-question');
        },

        // =====================================================================
        // COURSE METADATA
        // =====================================================================

        /**
         * Set the course title.
         */
        setTitle: (title: string) => set({ title, lastSaved: undefined }),

        /**
         * Set the course status.
         */
        setStatus: (status: CourseState['status']) => set({ status, lastSaved: undefined }),

        // =====================================================================
        // UTILITIES
        // =====================================================================

        /**
         * Reset the store to initial state.
         */
        reset: () => set({ ...initialState, id: `course-${Date.now()}` }),

        /**
         * Clear all blocks but keep course metadata.
         */
        clearBlocks: () =>
          set({
            blocks: [],
            selectedBlockId: null,
            lastSaved: undefined,
          }),

        /**
         * Calculate total cognitive load of all blocks.
         */
        getTotalCognitiveLoad: (): number => {
          return blockRegistry.calculateTotalCognitiveLoad(get().blocks);
        },

        /**
         * Calculate total estimated duration of all blocks (in seconds).
         */
        getTotalDuration: (): number => {
          return blockRegistry.calculateTotalDuration(get().blocks);
        },
      }),
      {
        name: 'inspire-studio-store',
        partialize: (state) => ({
          id: state.id,
          title: state.title,
          blocks: state.blocks,
          status: state.status,
          lastSaved: state.lastSaved,
        }),
      },
    ),
    { name: 'StudioStore' },
  ),
);

// =============================================================================
// SELECTORS (for optimized re-renders)
// =============================================================================

/**
 * Select the blocks array.
 */
export const selectBlocks = (state: StudioStore) => state.blocks;

/**
 * Select the selected block ID.
 */
export const selectSelectedBlockId = (state: StudioStore) => state.selectedBlockId;

/**
 * Select the course title.
 */
export const selectTitle = (state: StudioStore) => state.title;

/**
 * Select the course status.
 */
export const selectStatus = (state: StudioStore) => state.status;

/**
 * Select block count.
 */
export const selectBlockCount = (state: StudioStore) => state.blocks.length;

/**
 * Select if there are any blocks.
 */
export const selectHasBlocks = (state: StudioStore) => state.blocks.length > 0;

/**
 * Select assessment count.
 */
export const selectAssessmentCount = (state: StudioStore) =>
  state.blocks.filter((b) => b.type === 'mc-question' || b.type === 'fitb-question').length;

// =============================================================================
// HOOKS FOR SPECIFIC USE CASES
// =============================================================================

/**
 * Hook to get a specific block by ID.
 */
export function useBlock(id: string): BlockInstance | undefined {
  return useStudioStore((state) => state.blocks.find((b) => b.id === id));
}

/**
 * Hook to get the selected block.
 */
export function useSelectedBlock(): BlockInstance | undefined {
  return useStudioStore((state) => {
    if (!state.selectedBlockId) return undefined;
    return state.blocks.find((b) => b.id === state.selectedBlockId);
  });
}

/**
 * Hook to check if a block is selected.
 */
export function useIsBlockSelected(id: string): boolean {
  return useStudioStore((state) => state.selectedBlockId === id);
}
