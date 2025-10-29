import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GuideTone = 'straight' | 'soft';
export type NudgingFrequency = 'high' | 'medium' | 'low' | 'off';

interface GuideState {
  tone: GuideTone;
  guideActive: boolean;
  nudgingFrequency: NudgingFrequency;
  setTone: (tone: GuideTone) => void;
  setGuideActive: (active: boolean) => void;
  setNudgingFrequency: (frequency: NudgingFrequency) => void;
  toggleGuide: () => void;
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set) => ({
      tone: 'straight',
      guideActive: true,
      nudgingFrequency: 'medium',
      setTone: (tone) => set({ tone }),
      setGuideActive: (active) => set({ guideActive: active }),
      setNudgingFrequency: (frequency) => set({ nudgingFrequency: frequency }),
      toggleGuide: () => set((state) => ({ guideActive: !state.guideActive })),
    }),
    {
      name: 'fyf-guide-settings',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Reset to default state if version mismatch
        if (version !== 1) {
          return {
            tone: 'straight',
            guideActive: true,
            nudgingFrequency: 'medium',
          };
        }
        return persistedState;
      },
    }
  )
);

export const getNudgingFrequencyInfo = (frequency: NudgingFrequency) => {
  const info = {
    high: { label: 'Intensiv', description: 'Der Guide gibt dir oft Anstöße.', explanation: 'Der Guide gibt dir oft Anstöße.' },
    medium: { label: 'Standard', description: 'Der Guide gibt dir gelegentlich Anstöße.', explanation: 'Der Guide gibt dir gelegentlich Anstöße.' },
    low: { label: 'Minimal', description: 'Der Guide gibt dir selten Anstöße.', explanation: 'Der Guide gibt dir selten Anstöße.' },
    off: { label: 'Aus', description: 'Der Guide gibt dir keine Anstöße.', explanation: 'Der Guide gibt dir keine Anstöße.' },
  };
  return info[frequency] || info.medium;
};