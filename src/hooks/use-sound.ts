
'use client';

import { useSettingsStore } from '@/store/settings-store';
import { useCallback } from 'react';

export const useSound = (soundFile: string, volume: number = 0.5) => {
    const { soundEnabled } = useSettingsStore();

    const playSound = useCallback(() => {
        if (soundEnabled) {
            const audio = new Audio(soundFile);
            audio.volume = volume;
            audio.play().catch(e => console.error(`Failed to play sound ${soundFile}:`, e));
        }
    }, [soundEnabled, soundFile, volume]);

    return playSound;
};
