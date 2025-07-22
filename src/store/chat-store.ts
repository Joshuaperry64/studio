import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Character } from './character-store';

export interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  photo?: string; // This will be a blob URL, not persisted
  video?: string; // This will be a blob URL, not persisted
  audio?: string; // This will be a data URI, can be persisted
  character?: {
    name: string;
    avatar: string;
  };
}

interface ChatStoreState {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Message) => void;
  removeLastMessage: () => void;
  startLoading: () => void;
  stopLoading: () => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      removeLastMessage: () =>
        set((state) => ({
          messages: state.messages.slice(0, -1),
        })),
      startLoading: () => set({ isLoading: true }),
      stopLoading: () => set({ isLoading: false }),
      clearChat: () => set({ messages: [], isLoading: false }),
    }),
    {
      name: 'chat-history-storage',
      storage: createJSONStorage(() => localStorage),
      // We don't persist blob URLs as they become invalid on page refresh.
      // We also don't persist loading state.
      partialize: (state) => ({
        messages: state.messages.map(({ photo, video, ...rest }) => rest),
      }),
    }
  )
);
