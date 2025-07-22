import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  apiKey: string;
  setApiKey: (key: string) => void;
  saveApiKey: (key: string) => Promise<void>;
  nsfwMode: boolean;
  toggleNsfwMode: () => void;
  notifications: boolean;
  toggleNotifications: () => void;
}

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
      toggleNsfwMode: () => set((state) => ({ nsfwMode: !state.nsfwMode })),
      notifications: true,
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive settings
      partialize: (state) => ({
        nsfwMode: state.nsfwMode,
        notifications: state.notifications,
      }),
    }
  )
);
