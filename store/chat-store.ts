import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
}

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  selectedModel: 'gemini-flash' | 'gemini-pro';
  voiceEnabled: boolean;
  soundEnabled: boolean;
  tokensUsed: number;
  tokenLimit: number;

  // Actions
  setOpen: (open: boolean) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setModel: (model: 'gemini-flash' | 'gemini-pro') => void;
  toggleVoice: () => void;
  toggleSound: () => void;
  clearMessages: () => void;
  addTokens: (count: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  selectedModel: 'gemini-flash',
  voiceEnabled: false,
  soundEnabled: true,
  tokensUsed: 0,
  tokenLimit: 10000,

  setOpen: (open) => set({ isOpen: open }),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
      tokensUsed: state.tokensUsed + (message.tokens || 0),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setModel: (model) => set({ selectedModel: model }),

  toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  clearMessages: () => set({ messages: [] }),

  addTokens: (count) => set((state) => ({ tokensUsed: state.tokensUsed + count })),
}));
