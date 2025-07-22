
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface MemorySettings {
    enabled: boolean;
    host: string;
    shareName: string;
    username: string;
    password?: string;
}

export type SafetyCategory = 
    | 'HARM_CATEGORY_HATE_SPEECH'
    | 'HARM_CATEGORY_DANGEROUS_CONTENT'
    | 'HARM_CATEGORY_HARASSMENT'
    | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
    | 'HARM_CATEGORY_CIVIC_INTEGRITY';

export type BlockThreshold = 
    | 'BLOCK_NONE'
    | 'BLOCK_ONLY_HIGH'
    | 'BLOCK_MEDIUM_AND_ABOVE'
    | 'BLOCK_LOW_AND_ABOVE';

export type SafetySettings = Record<SafetyCategory, BlockThreshold>;

interface SettingsState {
  apiKey: string;
  setApiKey: (key: string) => void;
  saveApiKey: (key: string) => Promise<void>;
  nsfwMode: boolean;
  enableNsfwMode: () => void;
  disableNsfwMode: () => void;
  notifications: boolean;
  toggleNotifications: () => void;
  hasSeenWelcomeScreen: boolean;
  setHasSeenWelcomeScreen: (hasSeen: boolean) => void;
  memorySettings: MemorySettings;
  saveMemorySettings: (settings: MemorySettings) => Promise<void>;
  textModel: string;
  setTextModel: (model: string) => void;
  imageModel: string;
  setImageModel: (model: string) => void;
  safetySettings: SafetySettings;
  setSafetySetting: (category: SafetyCategory, threshold: BlockThreshold) => void;
}

const initialMemorySettings: MemorySettings = {
    enabled: false,
    host: '',
    shareName: '',
    username: '',
    password: '',
};

const initialSafetySettings: SafetySettings = {
    HARM_CATEGORY_HATE_SPEECH: 'BLOCK_MEDIUM_AND_ABOVE',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'BLOCK_MEDIUM_AND_ABOVE',
    HARM_CATEGORY_HARASSMENT: 'BLOCK_MEDIUM_AND_ABOVE',
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'BLOCK_MEDIUM_AND_ABOVE',
    HARM_CATEGORY_CIVIC_INTEGRITY: 'BLOCK_MEDIUM_AND_ABOVE',
};


export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),
      saveApiKey: async (key) => {
        const response = await fetch('/api/user/key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: key }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to save API Key.');
        }
        set({ apiKey: key });
      },
      nsfwMode: false,
      enableNsfwMode: () => set({ nsfwMode: true }),
      disableNsfwMode: () => set({ nsfwMode: false }),
      notifications: true,
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
      hasSeenWelcomeScreen: false,
      setHasSeenWelcomeScreen: (hasSeen: boolean) => set({ hasSeenWelcomeScreen: hasSeen }),
      memorySettings: initialMemorySettings,
      saveMemorySettings: async (settings) => {
        const response = await fetch('/api/settings/memory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to save memory settings.');
        }
        set({ memorySettings: settings });
      },
      textModel: 'googleai/gemini-2.5-pro',
      setTextModel: (model) => set({ textModel: model }),
      imageModel: 'googleai/gemini-2.0-flash-preview-image-generation',
      setImageModel: (model) => set({ imageModel: model }),
      safetySettings: initialSafetySettings,
      setSafetySetting: (category, threshold) =>
        set((state) => ({
          safetySettings: {
            ...state.safetySettings,
            [category]: threshold,
          },
        })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive settings
      partialize: (state) => ({
        nsfwMode: state.nsfwMode,
        notifications: state.notifications,
        hasSeenWelcomeScreen: state.hasSeenWelcomeScreen,
        textModel: state.textModel,
        imageModel: state.imageModel,
        safetySettings: state.safetySettings,
        memorySettings: {
            ...state.memorySettings,
            password: '', // Do not persist password
        },
      }),
    }
  )
);
