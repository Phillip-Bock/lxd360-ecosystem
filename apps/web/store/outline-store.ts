import { create } from 'zustand';
import type {
  AssessmentItem,
  AuthorDisplayMode,
  CheckOnLearningItem,
  ChildItem,
  CourseObjective,
  CourseOutline,
  CourseTheme,
  ExportFormat,
  LessonItem,
  ModuleItem,
  OutlineValidation,
  QuestionBankItem,
  ScenarioItem,
  SurveyBankItem,
  SurveyItem,
  TitleAlignment,
  TitleBackgroundSettings,
  ValidationError,
  ValidationWarning,
} from '@/types/outline';

/** Generate unique ID */
const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/** Default title background settings */
const defaultTitleBackground: TitleBackgroundSettings = {
  type: 'none',
  sourceType: null,
  url: '',
  positionX: 0,
  positionY: 0,
  scale: 1,
  brightness: 100,
  contrast: 100,
  overlayOpacity: 0,
  autoplay: true,
  loop: true,
};

/** Initial course outline state */
const initialOutline: CourseOutline = {
  id: generateId('course'),
  theme: 'neural-dark',
  title: '',
  titleAlignment: 'center',
  titleBackground: defaultTitleBackground,
  description: '',
  objectives: [],
  modules: [],
  topLevelItems: [],
  exportFormat: 'xapi',
  authorDisplayMode: 'none',
  authorName: '',
  authorAvatarUrl: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

interface OutlineState {
  outline: CourseOutline;
  selectedItemId: string | null;
  selectedModuleId: string | null; // Track which module is selected for adding items
  validation: OutlineValidation;
  isObjectivesModalOpen: boolean;
  isBankSelectorOpen: boolean;
  bankSelectorType: 'assessment' | 'question-bank' | 'survey' | 'survey-bank' | null;

  // Theme actions
  setTheme: (theme: CourseTheme) => void;

  // Course metadata actions
  setTitle: (title: string) => void;
  setTitleAlignment: (alignment: TitleAlignment) => void;
  setTitleBackground: (settings: Partial<TitleBackgroundSettings>) => void;
  setDescription: (description: string) => void;
  setExportFormat: (format: ExportFormat) => void;
  setAuthorDisplayMode: (mode: AuthorDisplayMode) => void;
  setAuthorName: (name: string) => void;
  setAuthorAvatarUrl: (url: string) => void;
  isTitleSettingsOpen: boolean;
  openTitleSettings: () => void;
  closeTitleSettings: () => void;

  // Objectives actions
  addObjective: (text: string) => void;
  updateObjective: (id: string, text: string) => void;
  removeObjective: (id: string) => void;
  reorderObjectives: (fromIndex: number, toIndex: number) => void;

  // Module actions
  addModule: (title?: string) => string;
  updateModule: (id: string, updates: Partial<ModuleItem>) => void;
  removeModule: (id: string) => void;
  reorderModules: (fromIndex: number, toIndex: number) => void;

  // Child item actions (lessons, COL, scenarios, etc.)
  addLesson: (parentId: string, title?: string) => string;
  addCheckOnLearning: (parentId: string, title?: string) => string;
  addScenario: (parentId: string, title?: string) => string;
  addAssessment: (parentId: string | null, bankId?: string) => string;
  addQuestionBank: (
    parentId: string | null,
    bankId: string,
    bankName: string,
    questionCount: number,
  ) => string;
  addSurvey: (parentId: string | null, bankId?: string) => string;
  addSurveyBank: (
    parentId: string | null,
    bankId: string,
    bankName: string,
    questionCount: number,
  ) => string;

  // Generic child actions
  updateChildItem: (id: string, parentId: string | null, updates: Partial<ChildItem>) => void;
  removeChildItem: (id: string, parentId: string | null) => void;
  reorderChildItems: (parentId: string | null, fromIndex: number, toIndex: number) => void;
  moveChildToModule: (
    itemId: string,
    fromParentId: string | null,
    toParentId: string | null,
    toIndex: number,
  ) => void;

  // Selection
  selectItem: (id: string | null) => void;
  selectModule: (id: string | null) => void;

  // Bank selector modal
  openBankSelector: (type: 'assessment' | 'question-bank' | 'survey' | 'survey-bank') => void;
  closeBankSelector: () => void;

  // Objectives modal
  openObjectivesModal: () => void;
  closeObjectivesModal: () => void;

  // Validation
  validate: () => OutlineValidation;

  // Reset
  reset: () => void;
}

export const useOutlineStore = create<OutlineState>((set, get) => ({
  outline: initialOutline,
  selectedItemId: null,
  selectedModuleId: null,
  validation: { isValid: true, errors: [], warnings: [] },
  isObjectivesModalOpen: false,
  isBankSelectorOpen: false,
  bankSelectorType: null,
  isTitleSettingsOpen: false,

  // Theme actions
  setTheme: (theme) =>
    set((state) => ({
      outline: { ...state.outline, theme, updatedAt: new Date() },
    })),

  // Course metadata actions
  setTitle: (title) =>
    set((state) => ({
      outline: { ...state.outline, title, updatedAt: new Date() },
    })),

  setTitleAlignment: (titleAlignment) =>
    set((state) => ({
      outline: { ...state.outline, titleAlignment, updatedAt: new Date() },
    })),

  setTitleBackground: (settings) =>
    set((state) => ({
      outline: {
        ...state.outline,
        titleBackground: { ...state.outline.titleBackground, ...settings },
        updatedAt: new Date(),
      },
    })),

  setDescription: (description) =>
    set((state) => ({
      outline: {
        ...state.outline,
        description: description.slice(0, 500),
        updatedAt: new Date(),
      },
    })),

  setExportFormat: (exportFormat) =>
    set((state) => ({
      outline: { ...state.outline, exportFormat, updatedAt: new Date() },
    })),

  setAuthorDisplayMode: (authorDisplayMode) =>
    set((state) => ({
      outline: { ...state.outline, authorDisplayMode, updatedAt: new Date() },
    })),

  setAuthorName: (authorName) =>
    set((state) => ({
      outline: { ...state.outline, authorName, updatedAt: new Date() },
    })),

  setAuthorAvatarUrl: (authorAvatarUrl) =>
    set((state) => ({
      outline: { ...state.outline, authorAvatarUrl, updatedAt: new Date() },
    })),

  openTitleSettings: () => set({ isTitleSettingsOpen: true }),
  closeTitleSettings: () => set({ isTitleSettingsOpen: false }),

  // Objectives actions
  addObjective: (text) =>
    set((state) => {
      const newObjective: CourseObjective = {
        id: generateId('obj'),
        text,
        order: state.outline.objectives.length,
      };
      return {
        outline: {
          ...state.outline,
          objectives: [...state.outline.objectives, newObjective],
          updatedAt: new Date(),
        },
      };
    }),

  updateObjective: (id, text) =>
    set((state) => ({
      outline: {
        ...state.outline,
        objectives: state.outline.objectives.map((obj) => (obj.id === id ? { ...obj, text } : obj)),
        updatedAt: new Date(),
      },
    })),

  removeObjective: (id) =>
    set((state) => ({
      outline: {
        ...state.outline,
        objectives: state.outline.objectives
          .filter((obj) => obj.id !== id)
          .map((obj, index) => ({ ...obj, order: index })),
        updatedAt: new Date(),
      },
    })),

  reorderObjectives: (fromIndex, toIndex) =>
    set((state) => {
      const objectives = [...state.outline.objectives];
      const [removed] = objectives.splice(fromIndex, 1);
      objectives.splice(toIndex, 0, removed);
      return {
        outline: {
          ...state.outline,
          objectives: objectives.map((obj, index) => ({ ...obj, order: index })),
          updatedAt: new Date(),
        },
      };
    }),

  // Module actions
  addModule: (title = 'New Module') => {
    const state = get();

    const newModule: ModuleItem = {
      id: generateId('mod'),
      type: 'module',
      title,
      order: state.outline.modules.length,
      children: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set({
      outline: {
        ...state.outline,
        modules: [...state.outline.modules, newModule],
        updatedAt: new Date(),
      },
    });

    return newModule.id;
  },

  updateModule: (id, updates) =>
    set((state) => ({
      outline: {
        ...state.outline,
        modules: state.outline.modules.map((mod) =>
          mod.id === id ? { ...mod, ...updates, updatedAt: new Date() } : mod,
        ),
        updatedAt: new Date(),
      },
    })),

  removeModule: (id) =>
    set((state) => ({
      outline: {
        ...state.outline,
        modules: state.outline.modules
          .filter((mod) => mod.id !== id)
          .map((mod, index) => ({ ...mod, order: index })),
        updatedAt: new Date(),
      },
    })),

  reorderModules: (fromIndex, toIndex) =>
    set((state) => {
      const modules = [...state.outline.modules];
      const [removed] = modules.splice(fromIndex, 1);
      modules.splice(toIndex, 0, removed);
      return {
        outline: {
          ...state.outline,
          modules: modules.map((mod, index) => ({ ...mod, order: index })),
          updatedAt: new Date(),
        },
      };
    }),

  // Child item actions
  addLesson: (parentId, title = 'New Lesson') => {
    const id = generateId('lesson');
    const now = new Date();

    set((state) => {
      const newLesson: LessonItem = {
        id,
        type: 'lesson',
        title,
        parentId,
        hasContent: false,
        order: 0,
        createdAt: now,
        updatedAt: now,
      };

      return {
        outline: {
          ...state.outline,
          modules: state.outline.modules.map((mod) => {
            if (mod.id === parentId) {
              newLesson.order = mod.children.length;
              return { ...mod, children: [...mod.children, newLesson], updatedAt: now };
            }
            return mod;
          }),
          updatedAt: now,
        },
      };
    });

    return id;
  },

  addCheckOnLearning: (parentId, title = 'Check on Learning') => {
    const id = generateId('col');
    const now = new Date();

    set((state) => {
      const newCOL: CheckOnLearningItem = {
        id,
        type: 'check-on-learning',
        title,
        parentId,
        questionCount: 0,
        order: 0,
        createdAt: now,
        updatedAt: now,
      };

      return {
        outline: {
          ...state.outline,
          modules: state.outline.modules.map((mod) => {
            if (mod.id === parentId) {
              newCOL.order = mod.children.length;
              return { ...mod, children: [...mod.children, newCOL], updatedAt: now };
            }
            return mod;
          }),
          updatedAt: now,
        },
      };
    });

    return id;
  },

  addScenario: (parentId, title = 'Scenario') => {
    const id = generateId('scenario');
    const now = new Date();

    set((state) => {
      const newScenario: ScenarioItem = {
        id,
        type: 'scenario',
        title,
        parentId,
        scenarioType: 'branching',
        order: 0,
        createdAt: now,
        updatedAt: now,
      };

      return {
        outline: {
          ...state.outline,
          modules: state.outline.modules.map((mod) => {
            if (mod.id === parentId) {
              newScenario.order = mod.children.length;
              return { ...mod, children: [...mod.children, newScenario], updatedAt: now };
            }
            return mod;
          }),
          updatedAt: now,
        },
      };
    });

    return id;
  },

  addAssessment: (parentId, bankId) => {
    const id = generateId('assessment');
    const now = new Date();

    set((state) => {
      const newAssessment: AssessmentItem = {
        id,
        type: 'assessment',
        title: 'Assessment',
        parentId,
        bankId: bankId ?? null,
        questionCount: 0,
        order: 0,
        createdAt: now,
        updatedAt: now,
      };

      if (parentId) {
        return {
          outline: {
            ...state.outline,
            modules: state.outline.modules.map((mod) => {
              if (mod.id === parentId) {
                newAssessment.order = mod.children.length;
                return { ...mod, children: [...mod.children, newAssessment], updatedAt: now };
              }
              return mod;
            }),
            updatedAt: now,
          },
        };
      } else {
        newAssessment.order = state.outline.topLevelItems.length;
        return {
          outline: {
            ...state.outline,
            topLevelItems: [...state.outline.topLevelItems, newAssessment],
            updatedAt: now,
          },
        };
      }
    });

    return id;
  },

  addQuestionBank: (parentId, bankId, bankName, questionCount) => {
    const id = generateId('qbank');
    const now = new Date();

    set((state) => {
      const newBank: QuestionBankItem = {
        id,
        type: 'question-bank',
        title: bankName,
        parentId,
        bankId,
        bankName,
        questionCount,
        order: 0,
        createdAt: now,
        updatedAt: now,
      };

      if (parentId) {
        return {
          outline: {
            ...state.outline,
            modules: state.outline.modules.map((mod) => {
              if (mod.id === parentId) {
                newBank.order = mod.children.length;
                return { ...mod, children: [...mod.children, newBank], updatedAt: now };
              }
              return mod;
            }),
            updatedAt: now,
          },
        };
      } else {
        newBank.order = state.outline.topLevelItems.length;
        return {
          outline: {
            ...state.outline,
            topLevelItems: [...state.outline.topLevelItems, newBank],
            updatedAt: now,
          },
        };
      }
    });

    return id;
  },

  addSurvey: (parentId, bankId) => {
    const id = generateId('survey');
    const now = new Date();

    set((state) => {
      const newSurvey: SurveyItem = {
        id,
        type: 'survey',
        title: 'Survey',
        parentId,
        bankId: bankId ?? null,
        questionCount: 0,
        order: 0,
        createdAt: now,
        updatedAt: now,
      };

      if (parentId) {
        return {
          outline: {
            ...state.outline,
            modules: state.outline.modules.map((mod) => {
              if (mod.id === parentId) {
                newSurvey.order = mod.children.length;
                return { ...mod, children: [...mod.children, newSurvey], updatedAt: now };
              }
              return mod;
            }),
            updatedAt: now,
          },
        };
      } else {
        newSurvey.order = state.outline.topLevelItems.length;
        return {
          outline: {
            ...state.outline,
            topLevelItems: [...state.outline.topLevelItems, newSurvey],
            updatedAt: now,
          },
        };
      }
    });

    return id;
  },

  addSurveyBank: (parentId, bankId, bankName, questionCount) => {
    const id = generateId('sbank');
    const now = new Date();

    set((state) => {
      const newBank: SurveyBankItem = {
        id,
        type: 'survey-bank',
        title: bankName,
        parentId,
        bankId,
        bankName,
        questionCount,
        order: 0,
        createdAt: now,
        updatedAt: now,
      };

      if (parentId) {
        return {
          outline: {
            ...state.outline,
            modules: state.outline.modules.map((mod) => {
              if (mod.id === parentId) {
                newBank.order = mod.children.length;
                return { ...mod, children: [...mod.children, newBank], updatedAt: now };
              }
              return mod;
            }),
            updatedAt: now,
          },
        };
      } else {
        newBank.order = state.outline.topLevelItems.length;
        return {
          outline: {
            ...state.outline,
            topLevelItems: [...state.outline.topLevelItems, newBank],
            updatedAt: now,
          },
        };
      }
    });

    return id;
  },

  // Generic child actions
  updateChildItem: (id, parentId, updates) =>
    set((state) => {
      const now = new Date();

      if (parentId) {
        return {
          outline: {
            ...state.outline,
            modules: state.outline.modules.map((mod) => {
              if (mod.id === parentId) {
                return {
                  ...mod,
                  children: mod.children.map((child) =>
                    child.id === id
                      ? ({ ...child, ...updates, updatedAt: now } as typeof child)
                      : child,
                  ),
                  updatedAt: now,
                };
              }
              return mod;
            }),
            updatedAt: now,
          },
        };
      } else {
        return {
          outline: {
            ...state.outline,
            topLevelItems: state.outline.topLevelItems.map((item) =>
              item.id === id ? ({ ...item, ...updates, updatedAt: now } as typeof item) : item,
            ),
            updatedAt: now,
          },
        };
      }
    }),

  removeChildItem: (id, parentId) =>
    set((state) => {
      const now = new Date();

      if (parentId) {
        return {
          outline: {
            ...state.outline,
            modules: state.outline.modules.map((mod) => {
              if (mod.id === parentId) {
                return {
                  ...mod,
                  children: mod.children
                    .filter((child) => child.id !== id)
                    .map((child, index) => ({ ...child, order: index })),
                  updatedAt: now,
                };
              }
              return mod;
            }),
            updatedAt: now,
          },
        };
      } else {
        return {
          outline: {
            ...state.outline,
            topLevelItems: state.outline.topLevelItems
              .filter((item) => item.id !== id)
              .map((item, index) => ({ ...item, order: index })),
            updatedAt: now,
          },
        };
      }
    }),

  reorderChildItems: (parentId, fromIndex, toIndex) =>
    set((state) => {
      const now = new Date();

      if (parentId) {
        return {
          outline: {
            ...state.outline,
            modules: state.outline.modules.map((mod) => {
              if (mod.id === parentId) {
                const children = [...mod.children];
                const [removed] = children.splice(fromIndex, 1);
                children.splice(toIndex, 0, removed);
                return {
                  ...mod,
                  children: children.map((child, index) => ({ ...child, order: index })),
                  updatedAt: now,
                };
              }
              return mod;
            }),
            updatedAt: now,
          },
        };
      } else {
        const items = [...state.outline.topLevelItems];
        const [removed] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, removed);
        return {
          outline: {
            ...state.outline,
            topLevelItems: items.map((item, index) => ({ ...item, order: index })),
            updatedAt: now,
          },
        };
      }
    }),

  moveChildToModule: (itemId, fromParentId, toParentId, toIndex) =>
    set((state) => {
      const now = new Date();
      let movedItem: ChildItem | null = null;

      // Find and remove the item from its current location
      let updatedModules = state.outline.modules.map((mod) => {
        if (mod.id === fromParentId) {
          const itemIndex = mod.children.findIndex((c) => c.id === itemId);
          if (itemIndex !== -1) {
            movedItem = { ...mod.children[itemIndex] };
            return {
              ...mod,
              children: mod.children
                .filter((c) => c.id !== itemId)
                .map((c, i) => ({ ...c, order: i })),
              updatedAt: now,
            };
          }
        }
        return mod;
      });

      let updatedTopLevel = state.outline.topLevelItems;
      if (!fromParentId) {
        const itemIndex = state.outline.topLevelItems.findIndex((i) => i.id === itemId);
        if (itemIndex !== -1) {
          movedItem = { ...state.outline.topLevelItems[itemIndex] };
          updatedTopLevel = state.outline.topLevelItems
            .filter((i) => i.id !== itemId)
            .map((i, idx) => ({ ...i, order: idx }));
        }
      }

      if (!movedItem) return state;

      // Type narrowing: movedItem is now definitely defined
      const itemToMove = movedItem;

      // Update parent ID
      itemToMove.parentId = toParentId;

      // Add to new location
      if (toParentId) {
        updatedModules = updatedModules.map((mod) => {
          if (mod.id === toParentId) {
            const newChildren = [...mod.children];
            newChildren.splice(toIndex, 0, itemToMove);
            return {
              ...mod,
              children: newChildren.map((c, i) => ({ ...c, order: i })),
              updatedAt: now,
            };
          }
          return mod;
        });
      } else {
        const newTopLevel = [...updatedTopLevel];
        newTopLevel.splice(toIndex, 0, itemToMove);
        updatedTopLevel = newTopLevel.map((i, idx) => ({ ...i, order: idx }));
      }

      return {
        outline: {
          ...state.outline,
          modules: updatedModules,
          topLevelItems: updatedTopLevel,
          updatedAt: now,
        },
      };
    }),

  // Selection
  selectItem: (id) => set({ selectedItemId: id }),
  selectModule: (id) => set({ selectedModuleId: id }),

  // Bank selector modal
  openBankSelector: (type) => set({ isBankSelectorOpen: true, bankSelectorType: type }),
  closeBankSelector: () => set({ isBankSelectorOpen: false, bankSelectorType: null }),

  // Objectives modal
  openObjectivesModal: () => set({ isObjectivesModalOpen: true }),
  closeObjectivesModal: () => set({ isObjectivesModalOpen: false }),

  // Validation
  validate: () => {
    const state = get();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Title validation
    if (!state.outline.title.trim()) {
      errors.push({ field: 'title', message: 'Course title is required' });
    }

    // Objectives validation (required if modules exist)
    if (state.outline.modules.length > 0 && state.outline.objectives.length === 0) {
      errors.push({
        field: 'objectives',
        message: 'Course objectives are required when modules are present',
      });
    }

    // Description warning
    if (!state.outline.description.trim()) {
      warnings.push({ field: 'description', message: 'Consider adding a course description' });
    }

    // Module validation
    state.outline.modules.forEach((mod) => {
      if (!mod.title.trim()) {
        errors.push({
          field: 'module.title',
          message: 'Module title is required',
          itemId: mod.id,
        });
      }
      if (mod.children.length === 0) {
        warnings.push({
          field: 'module.children',
          message: `Module "${mod.title}" has no content`,
          itemId: mod.id,
        });
      }
    });

    const validation: OutlineValidation = {
      isValid: errors.length === 0,
      errors,
      warnings,
    };

    set({ validation });
    return validation;
  },

  // Reset
  reset: () =>
    set({
      outline: {
        ...initialOutline,
        id: generateId('course'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      selectedItemId: null,
      validation: { isValid: true, errors: [], warnings: [] },
      isObjectivesModalOpen: false,
      isBankSelectorOpen: false,
      bankSelectorType: null,
      isTitleSettingsOpen: false,
    }),
}));
