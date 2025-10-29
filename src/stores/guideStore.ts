import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GuideTone = 'straight' | 'soft';
export type NudgingFrequency = 'high' | 'medium' | 'low' | 'off';

interface GuideState {
  guideTone: GuideTone;
  nudgingFrequency: NudgingFrequency;
  isGuideMuted: boolean;
  setGuideTone: (tone: GuideTone) => void;
  setNudgingFrequency: (frequency: NudgingFrequency) => void;
  toggleGuideMute: () => void;
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set) => ({
      guideTone: 'straight',
      nudgingFrequency: 'medium',
      isGuideMuted: false,
      setGuideTone: (tone) => set({ guideTone: tone }),
      setNudgingFrequency: (frequency) => set({ nudgingFrequency: frequency }),
      toggleGuideMute: () => set((state) => ({ isGuideMuted: !state.isGuideMuted })),
    }),
    {
      name: 'fyf-guide-settings',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Reset to default state if version mismatch
        if (version !== 1) {
          return {
            guideTone: 'straight',
            nudgingFrequency: 'medium',
            isGuideMuted: false,
          };
        }
        return persistedState;
      },
    }
  )
);

export const getNudgingFrequencyInfo = (frequency: NudgingFrequency) => {
  switch (frequency) {
    case 'high':
      return {
        label: 'Hoch',
        description: 'Täglich mehrere Erinnerungen und Impulse',
        interval: 'Alle 2-3 Stunden',
      };
    case 'medium':
      return {
        label: 'Mittel',
        description: 'Regelmäßige, aber nicht aufdringliche Erinnerungen',
        interval: '2-3x täglich',
      };
    case 'low':
      return {
        label: 'Niedrig',
        description: 'Wenige, aber gezielte Erinnerungen',
        interval: '1x täglich',
      };
    case 'off':
      return {
        label: 'Aus',
        description: 'Keine automatischen Erinnerungen',
        interval: 'Nur bei manueller Aktivierung',
      };
    default:
      return {
        label: 'Mittel',
        description: 'Regelmäßige, aber nicht aufdringliche Erinnerungen',
        interval: '2-3x täglich',
      };
  }
};