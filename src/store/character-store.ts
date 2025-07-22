import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { GenerateCharacterOutput } from '@/ai/flows/generate-character';

export type Character = GenerateCharacterOutput;

interface CharacterStoreState {
  characters: Character[];
  activeCharacter: Character | null;
  addCharacter: (character: Character) => void;
  removeCharacter: (name: string) => void;
  setActiveCharacter: (name: string | null) => void;
}

export const useCharacterStore = create<CharacterStoreState>()(
  persist(
    (set) => ({
      characters: [],
      activeCharacter: null,
      addCharacter: (character) =>
        set((state) => ({
          characters: [...state.characters, character],
        })),
      removeCharacter: (name) =>
        set((state) => ({
          characters: state.characters.filter((c) => c.name !== name),
          // If the removed character was active, deactivate it
          activeCharacter: state.activeCharacter?.name === name ? null : state.activeCharacter,
        })),
      setActiveCharacter: (name) =>
        set((state) => {
          if (name === null) {
            return { activeCharacter: null };
          }
          const character = state.characters.find((c) => c.name === name);
          return { activeCharacter: character || null };
        }),
    }),
    {
      name: 'character-hub-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
