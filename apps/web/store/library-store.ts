'use client';

import { create } from 'zustand';
import type { LibraryItem, LibraryType } from '@/types/library';

// Generate unique IDs
let idCounter = 1;
const generateId = () => `item-${idCounter++}`;

// Mock data generator
function createMockData(): LibraryItem[] {
  const now = new Date();
  const items: LibraryItem[] = [];

  // Media Library
  const mediaFavorites = generateId();
  items.push({
    id: mediaFavorites,
    name: 'My Favorites',
    type: 'folder',
    libraryType: 'media',
    parentId: null,
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    version: 1,
    isFavorite: true,
    isDeleted: false,
    tags: ['favorites'],
  });

  items.push({
    id: generateId(),
    name: 'Course Images',
    type: 'folder',
    libraryType: 'media',
    parentId: null,
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    version: 1,
    isFavorite: false,
    isDeleted: false,
    tags: ['images', 'courses'],
  });

  items.push({
    id: generateId(),
    name: 'Hero Banner.png',
    type: 'file',
    libraryType: 'media',
    parentId: null,
    createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    version: 2,
    isFavorite: true,
    isDeleted: false,
    tags: ['banner', 'hero'],
    fileType: 'image/png',
    fileSize: 245760,
  });

  items.push({
    id: generateId(),
    name: 'Introduction Video.mp4',
    type: 'file',
    libraryType: 'media',
    parentId: null,
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    version: 1,
    isFavorite: false,
    isDeleted: false,
    tags: ['video', 'intro'],
    fileType: 'video/mp4',
    fileSize: 15728640,
  });

  items.push({
    id: generateId(),
    name: 'Background Music.mp3',
    type: 'file',
    libraryType: 'media',
    parentId: null,
    createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    version: 1,
    isFavorite: false,
    isDeleted: false,
    tags: ['audio', 'music'],
    fileType: 'audio/mpeg',
    fileSize: 3145728,
  });

  // Projects Library
  const projectsFavorites = generateId();
  items.push({
    id: projectsFavorites,
    name: 'My Favorites',
    type: 'folder',
    libraryType: 'projects',
    parentId: null,
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    version: 1,
    isFavorite: true,
    isDeleted: false,
    tags: ['favorites'],
  });

  items.push({
    id: generateId(),
    name: 'Q1 Training',
    type: 'folder',
    libraryType: 'projects',
    parentId: null,
    createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    version: 1,
    isFavorite: false,
    isDeleted: false,
    tags: ['training', 'q1'],
  });

  items.push({
    id: generateId(),
    name: 'Onboarding Course',
    type: 'file',
    libraryType: 'projects',
    parentId: null,
    createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    version: 3,
    isFavorite: true,
    isDeleted: false,
    tags: ['onboarding', 'new-hire'],
    fileType: 'application/json',
    fileSize: 524288,
    metadata: {
      type: 'project',
      status: 'published',
      projectType: 'course',
      description: 'New employee onboarding course',
    },
  });

  // Templates Library
  const templatesFavorites = generateId();
  items.push({
    id: templatesFavorites,
    name: 'My Favorites',
    type: 'folder',
    libraryType: 'templates',
    parentId: null,
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    version: 1,
    isFavorite: true,
    isDeleted: false,
    tags: ['favorites'],
  });

  items.push({
    id: generateId(),
    name: 'Basic Course Template',
    type: 'file',
    libraryType: 'templates',
    parentId: null,
    createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    version: 5,
    isFavorite: false,
    isDeleted: false,
    tags: ['basic', 'course'],
    fileType: 'application/json',
    fileSize: 102400,
  });

  // Themes Library
  const themesFavorites = generateId();
  items.push({
    id: themesFavorites,
    name: 'My Favorites',
    type: 'folder',
    libraryType: 'themes',
    parentId: null,
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    version: 1,
    isFavorite: true,
    isDeleted: false,
    tags: ['favorites'],
  });

  items.push({
    id: generateId(),
    name: 'Corporate Blue',
    type: 'file',
    libraryType: 'themes',
    parentId: null,
    createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    version: 2,
    isFavorite: true,
    isDeleted: false,
    tags: ['corporate', 'blue', 'professional'],
    fileType: 'application/json',
    fileSize: 8192,
  });

  // Code Library
  const codeFavorites = generateId();
  items.push({
    id: codeFavorites,
    name: 'My Favorites',
    type: 'folder',
    libraryType: 'code',
    parentId: null,
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    version: 1,
    isFavorite: true,
    isDeleted: false,
    tags: ['favorites'],
  });

  items.push({
    id: generateId(),
    name: 'Custom Progress Bar',
    type: 'file',
    libraryType: 'code',
    parentId: null,
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    version: 1,
    isFavorite: false,
    isDeleted: false,
    tags: ['progress', 'ui', 'javascript'],
    fileType: 'text/javascript',
    fileSize: 4096,
  });

  return items;
}

interface LibraryStore {
  items: LibraryItem[];

  // Actions
  getItemsByLibrary: (libraryType: LibraryType) => LibraryItem[];
  getDeletedItems: () => LibraryItem[];
  updateItem: (id: string, updates: Partial<LibraryItem>) => void;
  deleteItem: (id: string) => void;
  permanentlyDeleteItem: (id: string) => void;
  restoreItem: (id: string) => void;
  addFolder: (name: string, parentId: string | null, libraryType: LibraryType) => void;
  addItem: (
    item: Omit<
      LibraryItem,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'version'
      | 'isFavorite'
      | 'isDeleted'
      | 'parentId'
      | 'tags'
    > & { parentId?: string | null; tags?: string[] },
  ) => void;
  emptyTrash: () => void;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  items: createMockData(),

  getItemsByLibrary: (libraryType) => {
    return get().items.filter((item) => item.libraryType === libraryType);
  },

  getDeletedItems: () => {
    return get().items.filter((item) => item.isDeleted);
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date(), version: item.version + 1 }
          : item,
      ),
    }));
  },

  deleteItem: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, isDeleted: true, deletedAt: new Date() } : item,
      ),
    }));
  },

  permanentlyDeleteItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  restoreItem: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, isDeleted: false, deletedAt: undefined } : item,
      ),
    }));
  },

  addFolder: (name, parentId, libraryType) => {
    const newFolder: LibraryItem = {
      id: generateId(),
      name,
      type: 'folder',
      libraryType,
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      isFavorite: false,
      isDeleted: false,
      tags: [],
    };

    set((state) => ({
      items: [...state.items, newFolder],
    }));
  },

  addItem: (item) => {
    const newItem: LibraryItem = {
      id: generateId(),
      name: item.name,
      type: item.type,
      libraryType: item.libraryType,
      parentId: item.parentId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      isFavorite: false,
      isDeleted: false,
      tags: item.tags ?? [],
      metadata: item.metadata,
      fileType: item.fileType,
      fileSize: item.fileSize,
    };

    set((state) => ({
      items: [...state.items, newItem],
    }));
  },

  emptyTrash: () => {
    set((state) => ({
      items: state.items.filter((item) => !item.isDeleted),
    }));
  },
}));
