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
        label: 'Intensiv',
        description: 'Ich checke dich alle paar Stunden. Du willst es ja so.',
        interval: 'Alle 2-3 Stunden',
      };
    case 'medium':
      return {
        label: 'Standard',
        description: 'Ich erinnere dich, wenn es wichtig wird. Nicht nervig, aber konsequent.',
        interval: '2-3x täglich',
      };
    case 'low':
      return {
        label: 'Minimal',
        description: 'Nur wenn es wirklich drauf ankommt. Ich halte mich zurück.',
        interval: '1x täglich',
      };
    case 'off':
      return {
        label: 'Aus',
        description: 'Ich halte die Klappe. Du musst mich aktivieren, wenn du willst.',
        interval: 'Nur bei manueller Aktivierung',
      };
    default:
      return {
        label: 'Standard',
        description: 'Ich erinnere dich, wenn es wichtig wird. Nicht nervig, aber konsequent.',
        interval: '2-3x täglich',
      };
  }
};