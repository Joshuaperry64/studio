
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  photo?: string;
  video?: string;
  audio?: string;
  character?: {
    name: string;
    avatar: string;
  };
}

export interface Conversation {
    id: string;
    name: string;
    messages: Message[];
    isLoading: boolean;
}

interface ChatStoreState {
  conversations: Conversation[];
  activeConversationId: string | null;
  addConversation: () => void;
  removeConversation: (id: string) => void;
  setActiveConversationId: (id: string) => void;
  addMessageToConversation: (conversationId: string, message: Message) => void;
  startLoading: (conversationId: string) => void;
  stopLoading: (conversationId: string) => void;
  clearChat: (conversationId: string) => void;
  getCurrentConversation: () => Conversation | undefined;
  getConversationById: (id: string) => Conversation | undefined;
}

const createNewConversation = (name: string): Conversation => ({
    id: uuidv4(),
    name,
    messages: [],
    isLoading: false,
});


export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      conversations: [createNewConversation('Chat 1')],
      activeConversationId: null,

      addConversation: () => set(state => {
        const newConversation = createNewConversation(`Chat ${state.conversations.length + 1}`);
        return { 
            conversations: [...state.conversations, newConversation],
            activeConversationId: newConversation.id
        }
      }),

      removeConversation: (id) => set(state => {
          const remaining = state.conversations.filter(c => c.id !== id);
          if (remaining.length === 0) {
              const newConversation = createNewConversation('Chat 1');
              return {
                  conversations: [newConversation],
                  activeConversationId: newConversation.id,
              }
          }
          const newActiveId = state.activeConversationId === id 
            ? remaining[0].id // set to first tab if active was closed
            : state.activeConversationId;

          return {
              conversations: remaining,
              activeConversationId: newActiveId,
          }
      }),
      
      setActiveConversationId: (id) => set({ activeConversationId: id }),

      addMessageToConversation: (conversationId, message) => set(state => ({
        conversations: state.conversations.map(c => 
            c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c
        ),
      })),

      startLoading: (conversationId) => set(state => ({
          conversations: state.conversations.map(c => 
            c.id === conversationId ? { ...c, isLoading: true } : c
          ),
      })),

      stopLoading: (conversationId) => set(state => ({
          conversations: state.conversations.map(c => 
            c.id === conversationId ? { ...c, isLoading: false } : c
          ),
      })),
      
      clearChat: (conversationId) => set(state => ({
        conversations: state.conversations.map(c => 
          c.id === conversationId ? { ...c, messages: [], isLoading: false } : c
        ),
      })),

      getCurrentConversation: () => {
          const state = get();
          return state.conversations.find(c => c.id === state.activeConversationId);
      },

      getConversationById: (id) => {
        const state = get();
        return state.conversations.find(c => c.id === id);
      },
      
      // We need to initialize activeConversationId after rehydration
      // But we can't do it inside persist, so we'll do it on the component side.
      // This is a placeholder for the old logic.
      isLoading: false,
      removeLastMessage: () => {},
      addMessage: () => {},
    }),
    {
      name: 'chat-tabs-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrate: (state) => {
          // After rehydrating, set the active conversation to the first one if it's not set
          if (state?.conversations && state.conversations.length > 0) {
              if (!state.activeConversationId || !state.conversations.some(c => c.id === state.activeConversationId)) {
                  state.activeConversationId = state.conversations[0].id;
              }
          } else { // Handle case where storage is empty
              const newConversation = createNewConversation('Chat 1');
              state.conversations = [newConversation];
              state.activeConversationId = newConversation.id;
          }
      },
      partialize: (state) => ({
        ...state,
        // Make sure messages with blob URLs aren't persisted.
        conversations: state.conversations.map(c => ({
            ...c,
            isLoading: false, // Don't persist loading state
            messages: c.messages.map(({ photo, video, ...rest }) => rest),
        })),
      }),
    }
  )
);

// Install uuid and its types: npm i uuid && npm i --save-dev @types/uuid
// For this environment, I'll just add the dependency to package.json
